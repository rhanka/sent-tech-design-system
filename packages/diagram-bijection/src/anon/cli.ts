// CLI around the §2.5 pure core: generate / verify / rawgate-key.
// `generate` and `verify` refuse with anon-ci-refused when CI=true: the raw
// input exists only on the operator host. The CLI prints counts and paths
// only, never a raw value. Mapping and raw token sources go only under
// $DL_ANON_HOME (§2.6), outside every git work tree. All key handling lives
// in rawgate/dl-rawgate.mjs (the only code that sees the key material).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { canonicalBytes, sha256Hex } from "@sentropic/diagram-core";
import { anonymiseHrpnFixture, type AnonResult } from "./hrpn-fixture.js";
import { assertOutsideGitWorkTrees, makePrivateDir, resolveAnonHome, writePrivateFile } from "./out-of-repo.js";
import { readFixturePins, readPinBytes, verifyFixturePin, type FixturePin } from "../pins/fixture-pins.js";
import { countStructure } from "../structure/types.js";

type RawgateModule = typeof import("../../rawgate/dl-rawgate.mjs");

function packageRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { name?: string };
      if (pkg.name === "@sentropic/diagram-bijection") return dir;
    } catch {
      /* keep walking */
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error("package root not found");
    dir = parent;
  }
}

function repoRoot(pkgRoot: string): string {
  return execFileSync("git", ["-C", pkgRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
}

async function loadRawgate(pkgRoot: string): Promise<RawgateModule> {
  return (await import(pathToFileURL(join(pkgRoot, "rawgate", "dl-rawgate.mjs")).href)) as RawgateModule;
}

function printRefusal(result: AnonResult): number {
  if (result.ok) return 0;
  process.stderr.write(`${result.refusal}: ${result.message}\n`);
  return 1;
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (typeof value === "object" && value !== null)
    for (const k of Object.keys(value as Record<string, unknown>)) collectStrings((value as Record<string, unknown>)[k], out);
}

function gitTextsAt(repoRootDir: string, commit: string): string[] {
  const ls = execFileSync("git", ["-C", repoRootDir, "ls-tree", "-r", "-z", commit], { maxBuffer: 1 << 28 });
  const entries = ls.toString("utf8").split("\0").filter((e) => e.length > 0);
  const batchInput = `${entries.map((e) => e.split("\t")[0]).join("\n")}\n`;
  const buf = execFileSync("git", ["-C", repoRootDir, "cat-file", "--batch"], { input: batchInput, maxBuffer: 1 << 30 });
  const texts: string[] = [];
  let offset = 0;
  while (offset < buf.length) {
    const nl = buf.indexOf(0x0a, offset);
    if (nl === -1) break;
    const header = buf.subarray(offset, nl).toString("utf8");
    const parts = header.split(" ");
    if (parts.length < 3) break;
    const size = Number(parts[2]);
    const content = buf.subarray(nl + 1, nl + 1 + size);
    if (parts[1] === "blob" && !content.subarray(0, 8000).includes(0)) texts.push(content.toString("utf8"));
    offset = nl + 1 + size + 1;
  }
  return texts;
}

async function cmdRawgateKeyNew(env: NodeJS.ProcessEnv): Promise<number> {
  if (env.CI === "true") {
    process.stderr.write("anon-ci-refused: rawgate-key refuses to run with CI=true\n");
    return 1;
  }
  const pkgRoot = packageRoot();
  const rawgate = await loadRawgate(pkgRoot);
  const home = resolveAnonHome(env);
  const keyDir = join(home, "rawgate");
  const check = assertOutsideGitWorkTrees(keyDir, env);
  if (!check.ok) {
    process.stderr.write(`${check.code}: ${check.message}\n`);
    return 1;
  }
  const made = makePrivateDir(keyDir, env);
  if (!made.ok) {
    process.stderr.write(`${made.code}: ${made.message}\n`);
    return 1;
  }
  const key = rawgate.newKey();
  writePrivateFile(join(keyDir, "key.hex"), `${Buffer.from(key).toString("hex")}\n`);
  process.stdout.write(`keyId ${rawgate.keyId(key)}\n`);
  process.stdout.write(`path ${join(keyDir, "key.hex")}\n`);
  return 0;
}

async function cmdGenerate(args: string[], env: NodeJS.ProcessEnv): Promise<number> {
  if (env.CI === "true") {
    process.stderr.write("anon-ci-refused: generate refuses to run with CI=true (the raw input exists only on the operator host)\n");
    return 1;
  }
  const pkgRoot = packageRoot();
  const root = repoRoot(pkgRoot);
  const fixturesRoot = join(pkgRoot, "fixtures");
  const pinsFile = readFixturePins(join(fixturesRoot, "pins.json"));
  const pinById = new Map(pinsFile.pins.map((p) => [p.id, p]));
  const opt = (name: string): string | undefined => {
    const i = args.indexOf(name);
    if (i !== -1) return args[i + 1];
    const prefixed = args.find((a) => a.startsWith(`${name}=`));
    return prefixed?.slice(name.length + 1);
  };
  const fixturePinId = opt("--fixture-pin");
  const foldsPinId = opt("--folds-pin");
  const extraRaw = (opt("--extra-raw") ?? "").split(",").filter((s) => s.length > 0);
  const baselineOpt = opt("--baseline");
  if (fixturePinId === undefined || foldsPinId === undefined) {
    process.stderr.write("usage: generate --fixture-pin <id> --folds-pin <id> --extra-raw <ids> [--baseline <commit>]\n");
    return 2;
  }
  const fp = pinById.get(fixturePinId);
  const gp = pinById.get(foldsPinId);
  if (fp === undefined || gp === undefined) {
    process.stderr.write(`unknown pin id (fixture=${fixturePinId}, folds=${foldsPinId})\n`);
    return 2;
  }
  const extraPins = extraRaw.map((id) => pinById.get(id)).filter((p): p is FixturePin => p !== undefined);
  for (const pin of [fp, gp, ...extraPins]) {
    const v = await verifyFixturePin(pin, env, root);
    if (v.status !== "pass") {
      process.stderr.write(`pin ${pin.id}: ${v.status}${v.status === "fail" ? ` (actual sha256 ${v.actualSha256}, bytes ${v.actualBytes})` : ""}\n`);
      return 1;
    }
  }
  const fixtureBytes = await readPinBytes(fp, root, env);
  const foldsBytes = await readPinBytes(gp, root, env);
  if ("unavailable" in fixtureBytes || "unavailable" in foldsBytes) {
    process.stderr.write("raw fixture unavailable\n");
    return 1;
  }
  const result = anonymiseHrpnFixture({
    sceneId: "s2-target-anon",
    language: "fr",
    fixture: { pin: fp, bytes: fixtureBytes as Uint8Array },
    folds: { pin: gp, bytes: foldsBytes as Uint8Array },
  });
  if (!result.ok) return printRefusal(result);
  const out = result.value;

  // Out-of-repo layout (§2.6): <home>/<sceneId>/<first 12 hex of the raw sha256>/
  const home = resolveAnonHome(env);
  const runDir = join(home, out.structure.sceneId, fp.sha256.slice(0, 12));
  for (const target of [home, join(home, out.structure.sceneId), runDir]) {
    const check = assertOutsideGitWorkTrees(target, env);
    if (!check.ok) {
      process.stderr.write(`${check.code}: ${check.message}\n`);
      return 1;
    }
  }
  const made = makePrivateDir(runDir, env);
  if (!made.ok) {
    process.stderr.write(`${made.code}: ${made.message}\n`);
    return 1;
  }

  // Rawgate key, digests and the output self-scan (§2.5 / §2.7).
  const rawgate = await loadRawgate(pkgRoot);
  const key = rawgate.loadKeyFromEnv(env);
  if (key === null) {
    process.stderr.write("rawgate key absent: run `dl-anon.mjs rawgate-key --new` first\n");
    return 1;
  }
  const rawStrings = [...out.rawStrings];
  rawStrings.push(new TextDecoder().decode(fixtureBytes as Uint8Array));
  for (const pin of extraPins) {
    const bytes = await readPinBytes(pin, root, env);
    if ("unavailable" in bytes) continue;
    const text = new TextDecoder().decode(bytes as Uint8Array);
    rawStrings.push(text);
    try {
      collectStrings(JSON.parse(text), rawStrings);
    } catch {
      /* not JSON: the whole text is already included */
    }
  }
  const baselineCommit =
    baselineOpt ?? execFileSync("git", ["-C", root, "merge-base", "HEAD", "origin/main"], { encoding: "utf8" }).trim();
  const { file: digestFile, baselinePresent } = rawgate.buildDigestFile({
    key,
    rawStrings,
    rawIdentifiers: out.rawIdentifiers,
    baseline: { commit: baselineCommit, texts: gitTextsAt(root, baselineCommit) },
  });

  // Output self-scan: every string of the structure, tokenised and digested.
  const structureText = `${canonicalBytes(out.structure)}\n`;
  const rule = { minWordLength: digestFile.minWordLength, minIdLength: digestFile.minIdLength, ngramSizes: digestFile.ngramSizes };
  const wanted = new Set(digestFile.digests);
  const allowed = new Set(digestFile.allow.map((a) => a.digest));
  const structureStrings: string[] = [];
  collectStrings(out.structure, structureStrings);
  structureStrings.push(structureText);
  for (const text of structureStrings) {
    for (const item of rawgate.tokenise(text, rule)) {
      const cls = item.kind === "id" ? "id" : "text";
      const d = rawgate.digest(key, cls, item.token);
      if (wanted.has(d) && !allowed.has(d)) {
        process.stderr.write(`anon-raw-token-in-output: a raw token digest appears in the generated structure (line ${item.line}); nothing written\n`);
        return 1;
      }
    }
  }

  // Committed outputs.
  const structuresDir = join(fixturesRoot, "structures");
  mkdirSync(structuresDir, { recursive: true });
  const structurePath = join(structuresDir, `${out.structure.sceneId}.structure.json`);
  writeFileSync(structurePath, structureText);
  const dsCommit = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const provenance = {
    ...out.provenance,
    generator: { ...out.provenance.generator, dsCommit },
    rawgate: {
      keyId: digestFile.keyId,
      digests: digestFile.count,
      baselineCommit: digestFile.baselineCommit,
      baselinePresent,
      outputScan: "pass" as const,
    },
  };
  const provenancePath = join(structuresDir, `${out.structure.sceneId}.provenance.json`);
  writeFileSync(provenancePath, `${canonicalBytes(provenance)}\n`);
  const digestsPath = join(pkgRoot, "rawgate", "digests.json");
  mkdirSync(dirname(digestsPath), { recursive: true });
  writeFileSync(digestsPath, `${canonicalBytes(digestFile)}\n`);

  // Out-of-repo outputs (0600, exclusive create then rename).
  writePrivateFile(join(runDir, "mapping.json"), `${canonicalBytes(out.mapping)}\n`);
  writePrivateFile(
    join(runDir, "run.json"),
    `${canonicalBytes({
      schema: "ds.anon-run/1",
      sceneId: out.structure.sceneId,
      counts: countStructure(out.structure),
      folds: provenance.folds,
      unresolvedFoldIds: out.unresolvedFoldIds.length,
      runAt: new Date().toISOString(),
    })}\n`,
  );
  writePrivateFile(join(runDir, "raw-strings.json"), `${canonicalBytes(rawStrings)}\n`);

  const counts = countStructure(out.structure);
  process.stdout.write(
    [
      `structure ${out.structure.sceneId}: zones=${counts.zones} cards=${counts.cards} relations=${counts.relations}`,
      `  zonesByDepth=${JSON.stringify(counts.zonesByDepth)} cardsByDepth=${JSON.stringify(counts.cardsByDepth)}`,
      `  zoneContent=${JSON.stringify(counts.zoneContent)} maxChildren=${counts.maxChildren}`,
      `  categorised=${counts.categorised} categories=${counts.categories} notCurrent=${JSON.stringify(counts.notCurrent)}`,
      `  expanded=${counts.expanded} collapsed=${counts.collapsed}`,
      `  folds sourceIds=${provenance.folds.sourceIds} resolved=${provenance.folds.resolved} unresolved=${provenance.folds.unresolved}`,
      `structureSha256 ${sha256Hex(structureText)}`,
      `digests ${digestFile.count} keyId ${digestFile.keyId} baseline ${digestFile.baselineCommit.slice(0, 12)} baselinePresent ${baselinePresent}`,
      `committed ${structurePath}`,
      `committed ${provenancePath}`,
      `committed ${digestsPath}`,
      `outOfRepo ${runDir}`,
    ].join("\n") + "\n",
  );
  return 0;
}

async function cmdVerify(env: NodeJS.ProcessEnv): Promise<number> {
  if (env.CI === "true") {
    process.stderr.write("anon-ci-refused: verify refuses to run with CI=true\n");
    return 1;
  }
  const pkgRoot = packageRoot();
  const root = repoRoot(pkgRoot);
  const fixturesRoot = join(pkgRoot, "fixtures");
  const pinsFile = readFixturePins(join(fixturesRoot, "pins.json"));
  const fp = pinsFile.pins.find((p) => p.id === "s2-target-raw");
  const gp = pinsFile.pins.find((p) => p.id === "s2-target-folds-raw");
  if (fp === undefined || gp === undefined) {
    process.stderr.write("pins s2-target-raw / s2-target-folds-raw missing\n");
    return 1;
  }
  for (const pin of [fp, gp]) {
    const v = await verifyFixturePin(pin, env, root);
    if (v.status !== "pass") {
      process.stderr.write(`pin ${pin.id}: ${v.status}\n`);
      return 1;
    }
  }
  const fixtureBytes = await readPinBytes(fp, root, env);
  const foldsBytes = await readPinBytes(gp, root, env);
  if ("unavailable" in fixtureBytes || "unavailable" in foldsBytes) {
    process.stderr.write("raw fixture unavailable\n");
    return 1;
  }
  const result = anonymiseHrpnFixture({
    sceneId: "s2-target-anon",
    language: "fr",
    fixture: { pin: fp, bytes: fixtureBytes as Uint8Array },
    folds: { pin: gp, bytes: foldsBytes as Uint8Array },
  });
  if (!result.ok) return printRefusal(result);
  const out = result.value;
  const committed = new Uint8Array(readFileSync(join(fixturesRoot, "structures", "s2-target-anon.structure.json")));
  const committedSha = sha256Hex(new TextDecoder().decode(committed));
  const regeneratedSha = sha256Hex(`${canonicalBytes(out.structure)}\n`);
  const provenance = JSON.parse(readFileSync(join(fixturesRoot, "structures", "s2-target-anon.provenance.json"), "utf8")) as {
    structure: { sha256: string };
    counts: unknown;
  };
  const counts = countStructure(out.structure);
  const countsMatch = JSON.stringify(counts) === JSON.stringify(provenance.counts);
  const ok = committedSha === regeneratedSha && provenance.structure.sha256 === committedSha && countsMatch;
  process.stdout.write(
    [
      `committedSha256 ${committedSha}`,
      `regeneratedSha256 ${regeneratedSha}`,
      `provenanceSha256 ${provenance.structure.sha256}`,
      `countsMatch ${countsMatch}`,
      `zones=${counts.zones} cards=${counts.cards} relations=${counts.relations} expanded=${counts.expanded} collapsed=${counts.collapsed}`,
      ok ? "verify: pass" : "verify: FAIL (drift from the raw pins or a hand edit)",
    ].join("\n") + "\n",
  );
  return ok ? 0 : 1;
}

export async function main(argv: string[], env: NodeJS.ProcessEnv = process.env): Promise<number> {
  const args = argv.slice(2);
  const command = args[0];
  if (command === "rawgate-key") {
    return cmdRawgateKeyNew(env);
  }
  if (command === "generate") {
    return cmdGenerate(args.slice(1), env);
  }
  if (command === "verify") {
    return cmdVerify(env);
  }
  process.stderr.write("usage: dl-anon.mjs generate|verify|rawgate-key --new\n");
  return 2;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(await main(process.argv));
}
