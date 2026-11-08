// CLI of the harness: `run --all` (S0–S6 reports for every structure
// fixture) and `goldens --update` (§2.2). DL-0 runs the stub codec on the
// committed structure fixtures; no report is committed (§2.3).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalBytes, sha256Hex } from "@sentropic/diagram-core";
import { runHarness } from "./run.js";
import { enumerateFoldStates } from "./fold-states.js";
import { fixtureGoldenStore, goldensFilePath, type GoldensFile } from "./goldens.js";
import { loadStructureFixture, stubCardsRenderer, stubJsonCodec } from "../formats/stub-json.js";
import { readFixturePins, readPinBytes, type FixturePin } from "../pins/fixture-pins.js";
import type { CheckResult, LossEntry, ReportPins } from "../report/schema.js";
import type { HarnessIo, HarnessRun, LoadedFixture } from "./types.js";

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

/** The losses declared for the stub format (§2.3): the two refused edits. */
const STUB_LOSSES: readonly LossEntry[] = [
  {
    what: "A top-level key outside format, fold and records cannot be represented in stub-json/1 and is refused.",
    class: "refused",
    code: "stub-edit-unsupported",
    count: 1,
  },
  {
    what: "A non-canonical serialisation of the stub file is refused.",
    class: "refused",
    code: "stub-noncanonical",
    count: 1,
  },
];

function dsCommitPin(root: string): string {
  const head = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const dirty = execFileSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" }).trim().length > 0;
  return dirty ? `${head}+dirty` : head;
}

function reportPins(root: string): ReportPins {
  return {
    dsCommit: dsCommitPin(root),
    engram: "pending",
    bpmnCanvas: "not-applicable",
    mermaidPreview: "not-applicable",
    rasterizer: "not-run",
  };
}

interface StructureFixture {
  readonly pin: FixturePin;
  readonly bytes: Uint8Array;
  readonly loaded: LoadedFixture;
}

async function loadStructureFixtures(pkgRoot: string, root: string, env: NodeJS.ProcessEnv): Promise<StructureFixture[]> {
  const fixturesRoot = join(pkgRoot, "fixtures");
  const pinsFile = readFixturePins(join(fixturesRoot, "pins.json"));
  const structuresDir = join(fixturesRoot, "structures");
  const out: StructureFixture[] = [];
  if (!existsSync(structuresDir)) return out;
  for (const name of readdirSync(structuresDir).filter((n) => n.endsWith(".structure.json")).sort()) {
    const relToRepo = `packages/diagram-bijection/fixtures/structures/${name}`;
    const pin = pinsFile.pins.find((p) => p.root.kind === "repo" && p.path === relToRepo);
    if (pin === undefined) throw new Error(`no repo pin for ${relToRepo}`);
    const bytesOr = await readPinBytes(pin, root, env);
    if ("unavailable" in bytesOr) throw new Error(`fixture unavailable: ${relToRepo}`);
    const bytes = bytesOr as Uint8Array;
    const bytesText = new TextDecoder().decode(bytes);
    if (sha256Hex(bytesText) !== pin.sha256 || bytes.length !== pin.bytes) throw new Error(`pin mismatch: ${relToRepo}`);
    const loaded = loadStructureFixture(bytes);
    if (!loaded.ok) throw new Error(`fixture does not load: ${relToRepo}: ${loaded.diagnostics.map((d) => d.code).join(",")}`);
    out.push({ pin, bytes, loaded: loaded.value });
  }
  return out;
}

function checksFromArg(checksPath: string | undefined): readonly CheckResult[] {
  // DL-0 runs without --checks: no G-T5 step exists yet, so no check is injected.
  if (checksPath === undefined) return [];
  if (!existsSync(checksPath)) {
    process.stderr.write(`checks file not found: ${checksPath}\n`);
    return [];
  }
  const parsed = JSON.parse(readFileSync(checksPath, "utf8")) as { status?: string; reason?: string };
  if (parsed.status === "pass" || parsed.status === "fail") {
    const check: CheckResult = { id: "G-T5", status: parsed.status };
    return [check];
  }
  if (parsed.status === "not-run" && typeof parsed.reason === "string") {
    return [{ id: "G-T5", status: "not-run", reason: parsed.reason as CheckResult["reason"] }];
  }
  return [{ id: "G-T5", status: "not-run", reason: "host GPU" }];
}

async function cmdRun(args: string[], env: NodeJS.ProcessEnv): Promise<number> {
  const pkgRoot = packageRoot();
  const root = repoRoot(pkgRoot);
  const fixturesRoot = join(pkgRoot, "fixtures");
  const opt = (name: string): string | undefined => {
    const i = args.indexOf(name);
    if (i !== -1) return args[i + 1];
    const prefixed = args.find((a) => a.startsWith(`${name}=`));
    return prefixed?.slice(name.length + 1);
  };
  const outDir = opt("--out");
  const checksPath = opt("--checks");
  if (outDir === undefined) {
    process.stderr.write("usage: run --all [--checks <g-t5.json>] --out <dir>\n");
    return 2;
  }
  const fixtures = await loadStructureFixtures(pkgRoot, root, env);
  if (fixtures.length === 0) {
    process.stderr.write("no structure fixtures found\n");
    return 1;
  }
  const checks = checksFromArg(checksPath);
  const pins = reportPins(root);
  const goldens = fixtureGoldenStore(fixturesRoot);
  mkdirSync(outDir, { recursive: true });
  let failures = 0;
  for (const fixture of fixtures) {
    const codec = stubJsonCodec(fixture.loaded.folds);
    const run: HarnessRun = {
      fixture: fixture.pin,
      load: () => ({ ok: true, value: fixture.loaded }),
      codec,
      renderer: stubCardsRenderer(),
      goldens,
      pins,
      losses: STUB_LOSSES,
      checks,
    };
    const io: HarnessIo = {
      readFixture: async () => fixture.bytes,
    };
    const report = await runHarness(run, io);
    const jsonPath = join(outDir, `${fixture.pin.id}.report.json`);
    writeFileSync(jsonPath, `${canonicalBytes(report)}\n`);
    process.stdout.write(
      `${fixture.pin.id}: verdict=${report.verdict} foldStates=${report.foldStates} x1=${report.x1.pass}/${report.x1.fail} x2=${report.x2.pass}/${report.x2.fail} S5=${report.steps.S5.status}${report.steps.S5.status === "not-run" ? ` (${report.steps.S5.reason ?? ""})` : ""} S6=${report.steps.S6.status} -> ${jsonPath}\n`,
    );
    if (report.verdict !== "demonstrated") failures += 1;
  }
  return failures > 0 ? 1 : 0;
}

async function cmdGoldensUpdate(): Promise<number> {
  const pkgRoot = packageRoot();
  const root = repoRoot(pkgRoot);
  const fixturesRoot = join(pkgRoot, "fixtures");
  const fixtures = await loadStructureFixtures(pkgRoot, root, process.env);
  if (fixtures.length === 0) {
    process.stderr.write("no structure fixtures found\n");
    return 1;
  }
  for (const fixture of fixtures) {
    const codec = stubJsonCodec(fixture.loaded.folds);
    const digests: Record<string, string> = {};
    for (const ctx of fixture.loaded.folds) {
      for (const state of enumerateFoldStates(ctx)) {
        const file = codec.exportFile(fixture.loaded.model, state);
        if (!file.ok) throw new Error(`export failed for ${fixture.pin.id} ${state.id}`);
        digests[`${state.view}|${state.id}`] = sha256Hex(new TextDecoder().decode(file.value.bytes));
      }
    }
    const goldens: GoldensFile = {
      schema: "ds.bijection-goldens/1",
      format: codec.format,
      fixture: { id: fixture.pin.id, sha256: fixture.pin.sha256 },
      digests,
    };
    const path = goldensFilePath(fixturesRoot, codec.format, fixture.pin.id);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${canonicalBytes(goldens)}\n`);
    process.stdout.write(`${fixture.pin.id}: ${Object.keys(digests).length} golden digests -> ${path}\n`);
  }
  return 0;
}

export async function main(argv: string[]): Promise<number> {
  const args = argv.slice(2);
  const command = args[0];
  if (command === "run") return cmdRun(args.slice(1), process.env);
  if (command === "goldens" && args[1] === "--update") return cmdGoldensUpdate();
  process.stderr.write("usage: dl-harness.mjs run --all [--checks <g-t5.json>] --out <dir> | goldens --update\n");
  return 2;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(await main(process.argv));
}
