// K1a guard: the component index is fresh and well-formed (k1a-spec §8).
//
// This is the K1a drift gate: `node dist/generator/main.js --check` must
// exit 0 inside `scripts/run-script-guards.mjs`. It builds the package (the
// generator is TypeScript), regenerates every artifact in memory, and fails
// on ANY diff with the committed files — a hand-edited entry, a stale
// regeneration after a catalogue/barrel change, or a modified overlay or
// baseline all turn this guard red.
//
// RED HISTORY (observed before the implementation existed): the guard failed
// because `packages/component-index` did not exist (no `dist/` build, no
// schemas, no `generated/`); the `--check` spawn exited non-zero listing
// every missing artifact. The hand-mutation witnesses (a flipped byte, a
// deleted entry, an injected gap file each make `--check` exit 1 naming the
// file) were observed after the implementation landed, against `--root`
// copies in a temp dir, without touching the committed files.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageDir = join(repoRoot, "packages", "component-index");
const generatedDir = join(packageDir, "generated");
const generatorMain = join(packageDir, "dist", "generator", "main.js");

function runGenerator(args) {
  return spawnSync(process.execPath, [generatorMain, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function entryPaths() {
  return readdirSync(join(generatedDir, "entries"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(generatedDir, "entries", name))
    .sort();
}

// Independent JCS oracle (spec §5.1): sorted keys, arrays ordered, finite
// numbers, no whitespace. Written here, not imported from the package, so
// the guard re-derives digests instead of trusting the generator.
function canonicalize(value) {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite number in guard oracle");
    if (Object.is(value, -0)) return "-0";
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  }
  throw new Error(`non-JSON value in guard oracle: ${typeof value}`);
}

function taggedDigest(value, tag) {
  const hash = createHash("sha256");
  hash.update(tag, "utf8");
  hash.update(new Uint8Array([0]));
  hash.update(canonicalize(value), "utf8");
  return `sha256:${hash.digest("hex")}`;
}

test("K1a: the package builds and its generator --check exits 0", () => {
  // Node build only (`tsc`, no clean step): this guard runs in parallel with
  // sibling guards under `node --test`, and only needs the compiled
  // generator. The package has no browser bundle.
  const build = spawnSync("npm", ["run", "build", "-w", "@sentropic/design-system-component-index"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (build.status !== 0) {
    throw new Error(`component-index build failed (${build.status}):\n${build.stdout}\n${build.stderr}`);
  }

  const check = runGenerator(["--check"]);
  if (check.status !== 0) {
    throw new Error(
      `generator --check failed (${check.status}) — the committed index is stale:\n${check.stdout}\n${check.stderr}`,
    );
  }
});

test("K1a: --check refuses a mutated copy in a temp dir and exits non-zero (--root)", () => {
  // The generator's --root moves only where the committed artifacts are read;
  // the regeneration itself stays bound to the package. A copy of the
  // committed artifacts must check fresh as-is, then refuse after EACH
  // out-of-band edit, with exit 1 and the offending file named.
  const scratch = mkdtempSync(join(tmpdir(), "component-index-check-"));
  try {
    cpSync(generatedDir, join(scratch, "generated"), { recursive: true });

    const fresh = runGenerator(["--check", "--root", scratch]);
    assert.equal(fresh.status, 0, `the untouched copy must check fresh:\n${fresh.stdout}\n${fresh.stderr}`);

    // Witness 1: one flipped byte in an entry. Proves --check compares
    // committed bytes against regeneration (hand edits turn CI red).
    const buttonPath = join(scratch, "generated", "entries", "button.json");
    const original = readFileSync(buttonPath, "utf8");
    const flipped = original.includes('"Button"') ? original.replace('"Button"', '"Buttox"') : `${original} `;
    assert.notEqual(flipped, original, "the mutation must change button.json");
    writeFileSync(buttonPath, flipped, "utf8");
    const edited = runGenerator(["--check", "--root", scratch]);
    assert.equal(edited.status, 1, "a hand-edited entry must not check fresh");
    assert.match(edited.stderr, /not fresh/, "the refusal must say the artifacts are not fresh");
    assert.match(edited.stderr, /entries\/button\.json/, "the refusal must name the edited file");
    writeFileSync(buttonPath, original, "utf8");

    // Witness 2: one deleted entry file. Proves --check lists missing
    // outputs (a dropped entry turns CI red instead of silently shrinking
    // the index).
    const victim = join(scratch, "generated", "entries", "accordion.json");
    const victimText = readFileSync(victim, "utf8");
    rmSync(victim);
    const deleted = runGenerator(["--check", "--root", scratch]);
    assert.equal(deleted.status, 1, "a deleted entry must not check fresh");
    assert.match(deleted.stderr, /entries\/accordion\.json/, "the refusal must name the deleted file");
    writeFileSync(victim, victimText, "utf8");

    // Witness 3: one injected gap file. Proves a committed entry no source
    // produces (catalogue-without-source drift, or a hand-added file) turns
    // --check red and is never auto-repaired: the refusal names the file
    // and the copy keeps it (check mode writes nothing).
    const gapPath = join(scratch, "generated", "entries", "zz-gap.json");
    writeFileSync(gapPath, original, "utf8");
    const gapped = runGenerator(["--check", "--root", scratch]);
    assert.equal(gapped.status, 1, "an injected gap entry must not check fresh");
    assert.match(gapped.stderr, /entries\/zz-gap\.json/, "the refusal must name the gap file");
    assert.equal(
      readFileSync(gapPath, "utf8"),
      original,
      "check mode must not repair or remove the gap file",
    );
    rmSync(gapPath);

    // Witness 4: one stray file directly under generated/. Proves the stray
    // scan walks the whole generated/ tree (no suffix filter): any path not
    // in the expected set turns --check red.
    const strayPath = join(scratch, "generated", "component-index.old.json");
    writeFileSync(strayPath, '{"format":"component-index/v1"}\n', "utf8");
    const strayed = runGenerator(["--check", "--root", scratch]);
    assert.equal(strayed.status, 1, "a stray file under generated/ must not check fresh");
    assert.match(strayed.stderr, /generated\/component-index\.old\.json/, "the refusal must name the stray file");
    rmSync(strayPath);

    // Witness 5: a stray non-JSON file under generated/. Proves there is no
    // .json suffix filter on stray detection.
    const strayTxt = join(scratch, "generated", "notes.txt");
    writeFileSync(strayTxt, "leftover\n", "utf8");
    const strayedTxt = runGenerator(["--check", "--root", scratch]);
    assert.equal(strayedTxt.status, 1, "a stray non-JSON file must not check fresh");
    assert.match(strayedTxt.stderr, /generated\/notes\.txt/, "the refusal must name the stray file");
    rmSync(strayTxt);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("K1a: --check tolerates a stamp-only index difference but refuses content or stamp corruption", () => {
  // Frozen §5.4: sourceCommit lives outside the revision preimage. A copy
  // whose only index difference is the stamp checks fresh; any other byte
  // of the index (or a non-hex stamp) turns --check red naming the file.
  const scratch = mkdtempSync(join(tmpdir(), "component-index-stamp-"));
  try {
    cpSync(generatedDir, join(scratch, "generated"), { recursive: true });
    const indexPath = join(scratch, "generated", "component-index.json");
    const originalText = readFileSync(indexPath, "utf8");
    const original = JSON.parse(originalText);

    // Witness A: a stamp-only mutation (another valid hex SHA) exits 0.
    const freshStamp = original.sourceCommit === "f".repeat(40) ? "0".repeat(40) : "f".repeat(40);
    const stampOnly = { ...original, sourceCommit: freshStamp };
    assert.notEqual(stampOnly.sourceCommit, original.sourceCommit, "the stamp mutation must change the stamp");
    writeFileSync(indexPath, `${JSON.stringify(stampOnly, null, 2)}\n`, "utf8");
    const stamped = runGenerator(["--check", "--root", scratch]);
    assert.equal(stamped.status, 0, `a stamp-only mutation must check fresh:\n${stamped.stdout}\n${stamped.stderr}`);
    writeFileSync(indexPath, originalText, "utf8");

    // Witness B: a registryRevision mutation exits 1 naming the file.
    const revision = original.registryRevision;
    assert.match(revision, /^sha256:[0-9a-f]{64}$/, "the committed revision must be a tagged digest");
    const flippedHex = revision.endsWith("0") ? "1" : "0";
    const tampered = { ...original, registryRevision: `${revision.slice(0, -1)}${flippedHex}` };
    writeFileSync(indexPath, `${JSON.stringify(tampered, null, 2)}\n`, "utf8");
    const revised = runGenerator(["--check", "--root", scratch]);
    assert.equal(revised.status, 1, "a registryRevision mutation must not check fresh");
    assert.match(revised.stderr, /component-index\.json/, "the refusal must name the index file");
    writeFileSync(indexPath, originalText, "utf8");

    // Witness C: a non-hex stamp exits 1 naming the file.
    const badStamp = { ...original, sourceCommit: "not-a-hex-commit" };
    writeFileSync(indexPath, `${JSON.stringify(badStamp, null, 2)}\n`, "utf8");
    const bad = runGenerator(["--check", "--root", scratch]);
    assert.equal(bad.status, 1, "a non-hex stamp must not check fresh");
    assert.match(bad.stderr, /component-index\.json/, "the refusal must name the index file");
    writeFileSync(indexPath, originalText, "utf8");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("K1a: every generated output validates its v1 schema", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const entrySchema = JSON.parse(readFileSync(join(packageDir, "schemas", "component-entry.v1.json"), "utf8"));
  const indexSchema = JSON.parse(readFileSync(join(packageDir, "schemas", "component-index.v1.json"), "utf8"));
  const validateEntry = ajv.compile(entrySchema);
  const validateIndex = ajv.compile(indexSchema);
  for (const path of entryPaths()) {
    const entry = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(validateEntry(entry), true, `${path} must validate: ${JSON.stringify(validateEntry.errors)}`);
  }
  const index = JSON.parse(readFileSync(join(generatedDir, "component-index.json"), "utf8"));
  assert.equal(validateIndex(index), true, `component-index.json must validate`);
  assert.equal(index.counts.entries, index.entries.length, "counts.entries must match rows");
  assert.equal(
    index.counts.byRenderable["doc-only"],
    index.entries.length,
    "every K1a entry is doc-only",
  );
});

test("K1a: every entry digest recomputes from sources", () => {
  // Entry digests cover every other field (spec §3.8); file digests cover
  // committed bytes; the index revision covers the row set (spec §5.4).
  for (const path of entryPaths()) {
    const entry = JSON.parse(readFileSync(path, "utf8"));
    const { digest, ...digestless } = entry;
    assert.equal(
      taggedDigest(digestless, "sentropic.ds.component-entry/v1"),
      digest,
      `${path} entry digest must recompute`,
    );
    for (const delivery of entry.delivery) {
      if (delivery.path === undefined) continue;
      const bytes = readFileSync(join(repoRoot, delivery.path));
      const fileDigest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
      assert.equal(fileDigest, delivery.digest, `${path} delivery ${delivery.path} digest must match bytes`);
    }
  }
  const index = JSON.parse(readFileSync(join(generatedDir, "component-index.json"), "utf8"));
  const revision = taggedDigest(
    { entries: index.entries, producerId: index.producerId },
    "sentropic.ds.component-index/v1",
  );
  assert.equal(revision, index.registryRevision, "registryRevision must recompute from the row set");
  for (const row of index.entries) {
    const entry = JSON.parse(readFileSync(join(generatedDir, row.path), "utf8"));
    assert.equal(entry.digest, row.digest, `row ${row.componentId} digest must copy the entry digest`);
  }
});

test("K1a: zero hosted surface in every generated entry", () => {
  // K1a publishes formats and pins, never execution (spec §3.3): any mcp or
  // https renderable, any url, any derived contract, or any esm/css-classes
  // delivery fails the build.
  for (const path of entryPaths()) {
    const raw = readFileSync(path, "utf8");
    const entry = JSON.parse(raw);
    assert.equal(entry.renderable, "doc-only", `${path} renderable must be doc-only`);
    assert.doesNotMatch(raw, /"url"\s*:/, `${path} must carry no url`);
    assert.equal(entry.contract?.contractSource ?? "published", "published", `${path} no derived contract`);
    for (const delivery of entry.delivery) {
      assert.ok(
        ["source", "element", "tokens"].includes(delivery.channel),
        `${path} channel ${delivery.channel} has no K1a instance`,
      );
    }
  }
});

test("K1a: generated JSON carries the frozen values and no retired predecessor value", () => {
  // Frozen spec §§2–4: producer sentropic-ds, scope generic, visibility
  // public (no scopePolicyRef), dataClass public-safe, four-key parity map.
  // Every check below reads parsed objects, never raw substrings, so
  // description prose can never false-positive (spec §6.4 scoping rule).
  const FROZEN_PARITY = new Set(["match", "source-of-truth", "no-counterpart", "missing"]);
  const FOUR = ["svelte", "react", "vue", "angular"];
  for (const path of entryPaths()) {
    const raw = readFileSync(path, "utf8");
    const entry = JSON.parse(raw);
    assert.equal(entry.producerId, "sentropic-ds", `${path} producer must be the frozen value`);
    assert.equal(entry.scope, "generic", `${path} scope must be generic`);
    assert.equal(entry.visibility, "public", `${path} visibility must be public`);
    assert.ok(!("scopePolicyRef" in entry), `${path} public entry must not carry scopePolicyRef`);
    assert.ok(!("tenant" in entry), `${path} must not carry the retired tenant field`);
    assert.ok(!("kind" in entry), `${path} must not carry the retired kind axis`);
    assert.equal(entry.dataClass, "public-safe", `${path} dataClass must be public-safe`);
    assert.deepEqual(
      Object.keys(entry.parity).sort(),
      ["angular", "react", "svelte", "vue"],
      `${path} parity must be the four-key frozen map`,
    );
    for (const framework of FOUR) {
      assert.ok(
        FROZEN_PARITY.has(entry.parity[framework]),
        `${path} parity value must be a frozen status`,
      );
    }
    assert.ok(!entry.frameworks.includes("js"), `${path} frameworks must stay four-valued`);
    const projected = FOUR.filter(
      (framework) => entry.parity[framework] === "match" || entry.parity[framework] === "source-of-truth",
    );
    assert.deepEqual(entry.frameworks, projected, `${path} frameworks must project the parity map`);
    for (const delivery of entry.delivery) {
      assert.notEqual(delivery.framework, "js", `${path} delivery framework is never js`);
      assert.ok(!("origin" in delivery), `${path} delivery must not carry an origin field`);
    }
    assert.ok(!("origin" in entry), `${path} entry must not carry an origin field`);
  }
  const index = JSON.parse(readFileSync(join(generatedDir, "component-index.json"), "utf8"));
  assert.equal(index.producerId, "sentropic-ds", "index producer must be the frozen value");
  for (const row of index.entries) {
    assert.equal(row.producerId, "sentropic-ds", `row ${row.componentId} producer`);
    assert.equal(row.scope, "generic", `row ${row.componentId} scope must copy the entry`);
    assert.equal(row.visibility, "public", `row ${row.componentId} visibility must copy the entry`);
    assert.ok(!("scopePolicyRef" in row), `row ${row.componentId} must not carry scopePolicyRef`);
    assert.equal(row.dataClass, "public-safe", `row ${row.componentId} dataClass must copy the entry`);
    assert.deepEqual(
      Object.keys(row.parity).sort(),
      ["angular", "react", "svelte", "vue"],
      `row ${row.componentId} parity must copy the entry map`,
    );
    const entry = JSON.parse(readFileSync(join(generatedDir, row.path), "utf8"));
    assert.equal(row.digest, entry.digest, `row ${row.componentId} digest must copy the entry digest`);
    assert.deepEqual(row.parity, entry.parity, `row ${row.componentId} parity must copy the entry`);
    assert.deepEqual(row.frameworks, entry.frameworks, `row ${row.componentId} frameworks must copy`);
    assert.deepEqual(row.category, entry.category, `row ${row.componentId} category must copy the entry`);
    assert.deepEqual(row.status, entry.status, `row ${row.componentId} status must copy the entry`);
  }
});

// K1b guard: derived per-framework contracts (spec §10). The K1a tests
// above are untouched; everything below covers generated/contracts/*.json
// and generated/component-contract-index.json. No contract is hosted,
// published or exposed; every one is contractSource "derived".
//
// RED HISTORY: before the contracts existed, the schema files were missing
// (Ajv compile threw ENOENT), the digest tags were missing (recompute
// threw), and --check listed every missing contract output. The mutation
// witnesses below were observed against --root copies in a temp dir.

const contractsDir = join(generatedDir, "contracts");
const contractIndexPath = join(generatedDir, "component-contract-index.json");
const FOUR_COMPLETENESS = ["complete", "partial", "none"];
const FOUR_FRAMEWORKS = ["svelte", "react", "vue", "angular"];
const EXPECTED_EXCLUDED = ["bar-chart", "bpmn-canvas", "decision-dossier", "design-tokens", "geo-map"].sort();

function contractPaths() {
  return readdirSync(contractsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(contractsDir, name))
    .sort();
}

function readContractIndex() {
  return JSON.parse(readFileSync(contractIndexPath, "utf8"));
}

test("K1b: every contract and the contract index validate their v1 schemas", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const contractSchema = JSON.parse(readFileSync(join(packageDir, "schemas", "component-contract.v1.json"), "utf8"));
  const indexSchema = JSON.parse(
    readFileSync(join(packageDir, "schemas", "component-contract-index.v1.json"), "utf8"),
  );
  const validateContract = ajv.compile(contractSchema);
  const validateIndex = ajv.compile(indexSchema);
  const paths = contractPaths();
  assert.equal(paths.length, 209, `the reviewed population is 209 contracts, found ${paths.length}`);
  for (const path of paths) {
    const document = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(
      validateContract(document),
      true,
      `${path} must validate: ${JSON.stringify(validateContract.errors)}`,
    );
    // Props meta-schema: every cell props must itself compile as a JSON
    // Schema (draft 2020-12), or the contract is not a schema carrier.
    for (const framework of FOUR_FRAMEWORKS) {
      const props = document.frameworks[framework].props;
      if (props !== undefined) assert.doesNotThrow(() => ajv.compile(props), `${path} ${framework} props`);
    }
  }
  const index = readContractIndex();
  assert.equal(validateIndex(index), true, `contract index must validate`);
  assert.equal(index.counts.contracts, paths.length, "index counts.contracts must match the documents");
  assert.equal(index.entries.length, paths.length, "index entries must match the documents");
  for (const framework of FOUR_FRAMEWORKS) {
    const cell = index.counts.byFramework[framework];
    assert.equal(
      cell.complete + cell.partial + cell.none,
      paths.length,
      `index byFramework.${framework} must sum to the population`,
    );
  }
  assert.deepEqual(
    index.excluded.map((row) => row.componentId).sort(),
    EXPECTED_EXCLUDED,
    "the excluded set is the reviewed five",
  );
});

test("K1b: every contract digest and the contracts revision recompute independently", () => {
  for (const path of contractPaths()) {
    const document = JSON.parse(readFileSync(path, "utf8"));
    const { digest, ...digestless } = document;
    assert.equal(
      taggedDigest(digestless, "sentropic.ds.component-contract/v1"),
      digest,
      `${path} contract digest must recompute`,
    );
  }
  const index = readContractIndex();
  assert.equal(
    taggedDigest({ entries: index.entries, producerId: index.producerId }, "sentropic.ds.component-contract-index/v1"),
    index.contractsRevision,
    "contractsRevision must recompute from the row set",
  );
});

test("K1b: index rows mirror their documents, and no contract is published", () => {
  const index = readContractIndex();
  for (const row of index.entries) {
    const document = JSON.parse(readFileSync(join(generatedDir, row.path), "utf8"));
    assert.equal(document.contractSource, "derived", `row ${row.componentId} document must be derived`);
    assert.equal(row.entryDigest, document.entryDigest, `row ${row.componentId} entryDigest must join`);
    assert.equal(row.contractDigest, document.digest, `row ${row.componentId} contractDigest must join`);
    assert.deepEqual(
      row.completeness,
      {
        svelte: document.frameworks.svelte.status,
        react: document.frameworks.react.status,
        vue: document.frameworks.vue.status,
        angular: document.frameworks.angular.status,
      },
      `row ${row.componentId} completeness must mirror the document`,
    );
    const entry = JSON.parse(readFileSync(join(generatedDir, `entries/${row.componentId}.json`), "utf8"));
    assert.equal(row.entryDigest, entry.digest, `row ${row.componentId} entryDigest must copy the K1a entry`);
  }
  const rawIndex = readFileSync(contractIndexPath, "utf8");
  assert.doesNotMatch(rawIndex, /"contractSource"\s*:\s*"published"/, "no emitted contract may be published");
  for (const path of contractPaths()) {
    const raw = readFileSync(path, "utf8");
    const document = JSON.parse(raw);
    assert.equal(document.contractSource, "derived", `${path} contractSource must be derived`);
    assert.doesNotMatch(raw, /"status"\s*:\s*"partiel"/, `${path} completeness marker is partial, never partiel`);
    for (const framework of FOUR_FRAMEWORKS) {
      assert.ok(
        FOUR_COMPLETENESS.includes(document.frameworks[framework].status),
        `${path} ${framework} status must be a completeness marker`,
      );
    }
  }
});

test("K1b: --check refuses a mutated contract copy in a temp dir and exits non-zero (--root)", () => {
  const scratch = mkdtempSync(join(tmpdir(), "contract-index-check-"));
  try {
    cpSync(generatedDir, join(scratch, "generated"), { recursive: true });

    const fresh = runGenerator(["--check", "--root", scratch]);
    assert.equal(fresh.status, 0, `the untouched copy must check fresh:\n${fresh.stdout}\n${fresh.stderr}`);

    // Witness 1: one flipped byte in a contract. Proves --check compares
    // committed contract bytes against regeneration.
    const buttonPath = join(scratch, "generated", "contracts", "button.json");
    const original = readFileSync(buttonPath, "utf8");
    const flipped = original.includes('"Button"') ? original.replace('"Button"', '"Buttox"') : `${original} `;
    assert.notEqual(flipped, original, "the mutation must change button.json");
    writeFileSync(buttonPath, flipped, "utf8");
    const edited = runGenerator(["--check", "--root", scratch]);
    assert.equal(edited.status, 1, "a hand-edited contract must not check fresh");
    assert.match(edited.stderr, /not fresh/, "the refusal must say the artifacts are not fresh");
    assert.match(edited.stderr, /contracts\/button\.json/, "the refusal must name the edited contract");
    writeFileSync(buttonPath, original, "utf8");

    // Witness 2: one deleted contract. Proves --check lists missing
    // contract outputs (a dropped contract turns CI red instead of
    // silently shrinking the population).
    const victim = join(scratch, "generated", "contracts", "accordion.json");
    const victimText = readFileSync(victim, "utf8");
    rmSync(victim);
    const deleted = runGenerator(["--check", "--root", scratch]);
    assert.equal(deleted.status, 1, "a deleted contract must not check fresh");
    assert.match(deleted.stderr, /contracts\/accordion\.json/, "the refusal must name the deleted contract");
    writeFileSync(victim, victimText, "utf8");

    // Witness 3: one stray file under generated/contracts/. Proves the
    // stray scan covers the contracts tree (no suffix filter): any path
    // not in the expected set turns --check red.
    const strayPath = join(scratch, "generated", "contracts", "zz-stray.json");
    writeFileSync(strayPath, original, "utf8");
    const strayed = runGenerator(["--check", "--root", scratch]);
    assert.equal(strayed.status, 1, "a stray contract file must not check fresh");
    assert.match(strayed.stderr, /contracts\/zz-stray\.json/, "the refusal must name the stray file");
    rmSync(strayPath);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

// The catalogue-mutation witness needs a faithful temp tree: generation
// reads the repo (catalogue, barrels, sources, declarations) while --root
// only redirects the committed artifacts. The tree below copies every
// generation input (excluding node_modules, symlinked back), so a catalogue
// row added in the temp copy exercises both the K1a side and the contract
// side without touching the real checkout.
const TREE_SUBTREES = [
  "packages/component-index/dist",
  "packages/component-index/schemas",
  "packages/component-index/generated",
  "apps/docs/src/lib/components-catalog.ts",
  "packages/elements/schemas",
  "packages/elements/catalog.json",
  "packages/tokens/src",
  "packages/themes/css",
];
const TREE_FILES = ["packages/component-index/contract-baseline.json", "packages/component-index/parity-baseline.json", "packages/component-index/catalog-overlay.json"];
const TREE_PACKAGES = [
  "packages/component-index",
  "packages/components-svelte",
  "packages/components-react",
  "packages/components-vue",
  "packages/components-angular",
  "packages/dataviz-svelte",
  "packages/dataviz-react",
  "packages/dataviz-vue",
  "packages/dataviz-angular",
  "packages/elements",
  "packages/tokens",
  "packages/themes",
];

function buildFaithfulTree() {
  const tree = mkdtempSync(join(tmpdir(), "contract-index-tree-"));
  for (const subtree of TREE_SUBTREES) cpSync(join(repoRoot, subtree), join(tree, subtree), { recursive: true });
  for (const file of TREE_FILES) cpSync(join(repoRoot, file), join(tree, file));
  for (const name of TREE_PACKAGES) {
    const manifest = join(name, "package.json");
    cpSync(join(repoRoot, manifest), join(tree, manifest));
    for (const dir of ["src", "dist"]) {
      const source = join(repoRoot, name, dir);
      try {
        cpSync(source, join(tree, name, dir), { recursive: true });
      } catch {
        // dataviz packages keep no top-level namesake dir; the subtrees
        // above already cover their inputs — absence is not a failure.
      }
    }
    try {
      symlinkSync(join(repoRoot, name, "node_modules"), join(tree, name, "node_modules"));
    } catch {
      // Most packages hoist to the root node_modules; absence is fine.
    }
  }
  symlinkSync(join(repoRoot, "node_modules"), join(tree, "node_modules"));
  return tree;
}

function runTreeGenerator(tree, args) {
  return spawnSync(process.execPath, [join(tree, "packages", "component-index", "dist", "generator", "main.js"), ...args], {
    cwd: tree,
    encoding: "utf8",
  });
}

function gitInitTree(tree) {
  for (const argv of [["init", "-q"], ["add", "-A"], ["-c", "user.name=guard", "-c", "user.email=guard@test", "commit", "-qm", "probe"]]) {
    const run = spawnSync("git", argv, { cwd: tree, encoding: "utf8" });
    assert.equal(run.status, 0, `git ${argv[0]} must succeed in the temp tree:\n${run.stderr}`);
  }
}

test("K1b: a K1b generation changes no K1a byte on a faithful tree", () => {
  // The generator regenerates K1a and contracts together; every K1a entry
  // file must be byte-identical afterwards (raw SHA-256 over file bytes).
  // The K1a index is compared bytewise after normalising only sourceCommit
  // and generatedBy.version (spec 10).
  const tree = buildFaithfulTree();
  try {
    gitInitTree(tree);
    const generated = runTreeGenerator(tree, []);
    assert.equal(generated.status, 0, `temp-tree generation must succeed:\n${generated.stdout}\n${generated.stderr}`);
    const hashBytes = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
    for (const path of entryPaths().map((entry) => entry.slice(generatedDir.length + 1))) {
      const beforeHash = hashBytes(join(repoRoot, "packages", "component-index", `generated/${path}`));
      const afterHash = hashBytes(join(tree, "packages", "component-index", `generated/${path}`));
      assert.equal(afterHash, beforeHash, `K1a ${path} must be byte-identical`);
    }
    const normalizeIndex = (text) => {
      const parsed = JSON.parse(text);
      parsed.sourceCommit = "0".repeat(40);
      if (parsed.generatedBy !== undefined && typeof parsed.generatedBy === "object" && parsed.generatedBy !== null) {
        parsed.generatedBy = { ...parsed.generatedBy, version: "0.0.0" };
      }
      return canonicalize(parsed);
    };
    const beforeIndex = normalizeIndex(readFileSync(join(repoRoot, "packages", "component-index", "generated/component-index.json"), "utf8"));
    const afterIndex = normalizeIndex(readFileSync(join(tree, "packages", "component-index", "generated/component-index.json"), "utf8"));
    assert.equal(afterIndex, beforeIndex, "K1a index must match bytewise modulo sourceCommit and generatedBy.version");
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test("K1b: a catalogue row added in the temp tree fails both the K1a side and the contract side", () => {
  // The probe clones the accordion catalogue row under a fresh slug, so the
  // K1a presence computation accepts it. Generation is all-or-nothing in
  // memory: each run below fails at exactly one gate, naming the probe.
  const tree = buildFaithfulTree();
  try {
    const catalogPath = join(tree, "apps", "docs", "src", "lib", "components-catalog.ts");
    const catalogText = readFileSync(catalogPath, "utf8");
    const anchor = `  {
    name: "Card",`;
    assert.ok(catalogText.includes(anchor), "the temp catalogue must carry the card row");
    const probeRow = `  {
    name: "Accordion",
    slug: "zz-guard-probe",
    status: "documented",
    category: "layout",
    description: {
      fr: "Sonde de garde.",
      en: "Guard probe."
    }
  },
`;
    writeFileSync(catalogPath, catalogText.replace(anchor, `${probeRow}${anchor}`), "utf8");
    gitInitTree(tree);

    // Run 0: no baseline row anywhere. The K1a parity gate fires first.
    const ungated = runTreeGenerator(tree, []);
    assert.equal(ungated.status, 1, "generation with an unreviewed probe must fail");
    assert.match(
      ungated.stderr,
      /baseline has no expected parity for "zz-guard-probe"/,
      "the K1a side must refuse the unreviewed probe",
    );

    // Run 1: a reviewed parity row lets the K1a side absorb the probe; the
    // contract baseline gate fires instead.
    const parityPath = join(tree, "packages", "component-index", "parity-baseline.json");
    const parity = JSON.parse(readFileSync(parityPath, "utf8"));
    parity.expectedParity["zz-guard-probe"] = parity.expectedParity["accordion"];
    writeFileSync(parityPath, `${JSON.stringify(parity, null, 2)}\n`, "utf8");
    const generated = runTreeGenerator(tree, []);
    assert.equal(generated.status, 1, "generation with an unreviewed contract probe must fail");
    assert.match(
      generated.stderr,
      /contract baseline has no component "zz-guard-probe"/,
      "the contract side must refuse the unreviewed probe",
    );

    // Run 2: a reviewed contract baseline extension passes both gates in
    // memory; --check then fails only on the uncommitted probe outputs.
    const baselinePath = join(tree, "packages", "component-index", "contract-baseline.json");
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
    baseline.components["zz-guard-probe"] = baseline.components["accordion"];
    writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 1)}\n`, "utf8");
    const checked = runTreeGenerator(tree, ["--check"]);
    assert.equal(checked.status, 1, "check with an uncommitted probe must fail");
    assert.match(checked.stderr, /entries\/zz-guard-probe\.json/, "the K1a side must name the missing entry");
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});
