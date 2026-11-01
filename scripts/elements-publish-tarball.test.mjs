// AC-L7a guard: the PUBLISHED tarball of @sentropic/design-system-elements is
// publishable-shaped, SRI-pinned against its own bytes, and carries no
// watermark license value (spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md §6.6,
// §6.7, §7, §13.4 W4, §15 AC-L7a).
//
// THE TWO GAPS THIS GUARD CLOSES (why the L2 guards are not enough for a
// *published* tarball):
// - scripts/elements-watermark-w4.test.mjs scans git-tracked files only
//   (dist/ is gitignored), so a license value inlined into a built chunk at
//   build time is invisible to it.
// - scripts/elements-browser-artifacts.test.mjs recomputes sri.json against
//   dist/browser on disk and checks pack membership through `npm pack
//   --dry-run`, but never against the bytes npm actually packs. jsDelivr
//   serves tarball bytes, so the hashes must pin tarball bytes, not a local
//   build directory. This guard packs the real tarball once, extracts it, and
//   recomputes every hash from the extracted bytes.
//
// WHAT IT ASSERTS
//   1. The packed manifest is publishable: not `private`, a real release
//      version (never the 0.0.0 workspace placeholder), and equal to the
//      `sri.json` version field the browser build stamps at build time.
//   2. The tarball shape (register entries AMB-1 and AMB-9 govern what else
//      may be present, so this is required-present plus forbidden-absent,
//      never an exact file list): LICENSE, LICENSE.THIRD-PARTY.md,
//      README.md, catalog.json, envelope.json, the three schemas/*.v1.json,
//      dist/index.js, dist/index.d.ts, dist/browser/elements.js and
//      dist/browser/sri.json are present; no src/, tests/, scripts/ or spec/
//      path and no *.map file ships anywhere (local builds keep their maps;
//      only the packed set is constrained).
//   3. sri.json holds AGAINST THE TARBALL: every entry's file exists in the
//      extracted tarball and its raw size and sha384 integrity recomputed
//      from the extracted bytes match, and every extracted dist/browser/**
//      file except sri.json itself is listed. Recomputed HERE, by a local
//      three-line hash, deliberately NOT by importing the L2
//      browser-artifacts guard: importing that test file also registers its
//      top-level tests in this process, including its unconditional
//      `build:browser` — two vite writers in the same outDir under the
//      parallel `node --test` run, observed 2026-11-01 as ENOENT crashes in
//      both copies (vite's `emptyOutDir` wipes the tree the other writer is
//      reading, and concurrent builds even emit divergent asset hashes). The
//      W4 import below is safe to share because that guard only ever reads.
//   4. No license key ships: the W4 detector (watermarkFindings, imported
//      from scripts/elements-watermark-w4.test.mjs, not copied) runs over
//      every text file in the extracted tarball, plus a minified-form pass
//      defined here (hidden:!0, which the W4 regex does not cover) over the
//      same 300-character window discipline. The W4 guard itself is never
//      weakened: the extension lives only in this file.
//   5. Its own negative witnesses, in the W4 guard's style.
//   6. The bundled third-party families inside dist/browser (the bpmn font
//      binaries, the Helvetica width tables) are named in the shipped
//      LICENSE.THIRD-PARTY.md: every non-JS file under dist/browser belongs
//      to a family declared in scripts/third-party-sources.json — the same
//      declaration the notices generator reads — so a future bundled family
//      cannot ship silently.
//
// UNBUILT CI: this guard runs in CI's unbuilt `licensing` job, where dist/
// is absent by design. The AC tests then report NOT RUN (t.skip with the
// reason, the repository's unbuilt-precondition pattern), they do not fail.
// Where the tree IS built they all run. Temporary pack and witness
// directories are removed (after hook / finally).
//
// RED HISTORY (observed 2026-11-01, on the L7a base ee4f5891 before the
// publication flip): assertions 1 and 2 failed — the packed manifest was
// still `private: true` at version 0.0.0, the tarball carried no LICENSE,
// and dist maps (*.js.map, *.d.ts.map) were packed. Pasted in the L7a
// report before the manifest was touched.
//
// 0 Python. Node only. Run by scripts/run-script-guards.mjs through its
// existing scripts/*.test.mjs glob (no runner change).
//
// NOTE ON THE W4 IMPORT: importing the W4 guard for its detector also
// registers that file's top-level tests in this file's process, so
// `node --test` runs the read-only repo scan here a second time (it passes;
// it only ever reads tracked files, so sharing the process with it is safe).
// That duplication is the cost of the import-not-copy rule, stated here
// rather than hidden. The L2 browser-artifacts guard is NOT imported, for
// the build-collision reason above: its size, eval and budget assertions
// stay its own, run in its own process against dist/browser on disk.

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { namesChannelOnly, W4_PLACEHOLDERS, watermarkFindings } from "./elements-watermark-w4.test.mjs";

export const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const elementsDir = join(repoRoot, "packages", "elements");
export const browserDir = join(elementsDir, "dist", "browser");
export const sriPath = join(browserDir, "sri.json");

/** sha384 integrity of bytes, in the `sha384-<base64>` form sri.json uses. */
export function sha384Integrity(bytes) {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

/**
 * Recomputes every sri entry against the bytes of one dist/browser tree and
 * returns error strings on drift: the file must exist, and its raw size and
 * sha384 integrity must match. Extra entry fields (gzip, brotli, group) are
 * the L2 guard's business, not this one's.
 */
export function tarballSriMismatches(dir, sri) {
  const errors = [];
  for (const [name, entry] of Object.entries(sri.files ?? {})) {
    const path = join(dir, name);
    if (!existsSync(path)) {
      errors.push(`${name}: listed in sri.json but missing from the tarball`);
      continue;
    }
    const bytes = readFileSync(path);
    if (bytes.length !== entry.bytes) errors.push(`${name}: sri.json says ${entry.bytes} raw bytes, tarball holds ${bytes.length}`);
    if (sha384Integrity(bytes) !== entry.integrity) errors.push(`${name}: sri.json integrity does not match the tarball bytes`);
  }
  return errors;
}

/** Files under a dist/browser tree that sri.json forgot (sri.json excluded). */
export function tarballUnlistedFiles(dir, sri) {
  const listed = new Set(Object.keys(sri.files ?? {}));
  const unlisted = [];
  const walk = (at, prefix) => {
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(join(at, entry.name), rel);
      else if (rel !== "sri.json" && !listed.has(rel)) unlisted.push(rel);
    }
  };
  walk(dir, "");
  return unlisted;
}

/** Files the published tarball must carry (register entries AMB-1, AMB-9). */
export const TARBALL_REQUIRED_FILES = [
  "LICENSE",
  "LICENSE.THIRD-PARTY.md",
  "README.md",
  "catalog.json",
  "envelope.json",
  "schemas/BarChart.v1.json",
  "schemas/BpmnCanvas.v1.json",
  "schemas/DecisionDossier.v1.json",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/browser/elements.js",
  "dist/browser/sri.json",
];

/** Source, test and scratch trees that must never ship (register AMB-1). */
export const TARBALL_FORBIDDEN_PREFIXES = ["src/", "tests/", "scripts/", "spec/"];

/**
 * The minified-form pass: the W4 detector's hidden pattern covers
 * `hidden: true` spellings only, while a minifier emits `hidden:!0`. Same
 * 300-character window discipline as watermarkFindings, same delimiter set
 * (`[:=]`) and same exemption helper (namesChannelOnly, imported — never
 * copied): only the hidden spelling is new, and there is no length floor
 * the W4 detector does not have. The plain form stays fully delegated to
 * the imported watermarkFindings above — this function never re-decides it.
 */
export function minifiedHiddenFindings(text) {
  const findings = [];
  const hiddenRe = /["']?hidden["']?\s*:\s*!0(?![\w$])/g;
  for (const hidden of text.matchAll(hiddenRe)) {
    const windowStart = Math.max(0, hidden.index - 300);
    const window = text.slice(windowStart, hidden.index + hidden[0].length + 300);
    const licenseRe = /["']?license["']?\s*[:=]\s*(["'`])([^"'`]*)\1/g;
    for (const license of window.matchAll(licenseRe)) {
      const value = license[2];
      if (W4_PLACEHOLDERS.includes(value)) continue;
      if (namesChannelOnly(value)) continue;
      const line = text.slice(0, windowStart + license.index).split("\n").length;
      findings.push({ line, value });
    }
  }
  return findings;
}

/** The combined tarball scan: imported W4 detector plus the minified pass. */
export function tarballLicenseFindings(text) {
  return [...watermarkFindings(text), ...minifiedHiddenFindings(text)];
}

function spawnOrThrow(command, args, label) {
  const run = spawnSync(command, args, { cwd: repoRoot, encoding: "utf8" });
  if (run.status !== 0) {
    throw new Error(`${label} failed (${run.status}):\n${run.stdout}\n${run.stderr}`);
  }
  return run;
}

/**
 * Dist precondition probe. Returns a reason string when dist/ or
 * dist/browser/ is absent — there is nothing to pack in that job — and null
 * when the tree is built. Every AC test below skips on a non-null reason
 * (the repository's NOT RUN pattern for unbuilt preconditions, the same one
 * the dataviz docs lot gate uses when its site is not built): this guard
 * runs in CI's unbuilt `licensing` job through run-script-guards.mjs, where
 * failing on a missing dist would turn every clean checkout red. Where the
 * tree IS built (the elements-publish workflow, a local built tree) the
 * assertions below all run, unweakened.
 *
 * This guard never builds: two reasons, both measured. First, the repository
 * pattern for this is already "build before packing": scripts/smoke-pack.mjs
 * throws its "build packages before running" error rather than building,
 * because the manifest stays the single source of truth. Second, `node
 * --test` runs guard files in parallel processes, and a second concurrent
 * `build:browser` writer in the same outDir breaks the first: observed
 * 2026-11-01 as `ENOENT ... dist/browser/assets/*.woff2` inside the L2
 * guard's own build while this guard rebuilt beside it (vite's `emptyOutDir`
 * wipes the tree the other writer is reading). The sibling
 * elements-browser-artifacts guard now rebuilds only when the tree is
 * missing or stale, so a fresh tree is never wiped under this reader. One
 * builder only — the workflow's, or that sibling guard's on a missing/stale
 * tree — and every other guard reads.
 */
export function unbuiltReason() {
  if (!existsSync(join(elementsDir, "dist", "index.js"))) {
    return (
      "packages/elements/dist is missing — nothing to pack in this job " +
      "(CI's unbuilt `licensing` job, or a fresh checkout); build first with " +
      "`npm run build`, the way the publish workflow builds it"
    );
  }
  if (!existsSync(sriPath)) {
    return (
      "packages/elements/dist/browser/sri.json is missing — nothing to pack " +
      "in this job; build first with " +
      "`npm --workspace @sentropic/design-system-elements run build:browser`"
    );
  }
  return null;
}

/**
 * Requires dist/ and dist/browser/ built the way the publish workflow builds
 * them (the root ordered build, then the elements `build` and
 * `build:browser`), and fails loudly when they are stale — this guard never
 * builds them itself (see unbuiltReason above for the absent case, which
 * skips instead of failing).
 */
function requireBuilt() {
  assert.ok(
    existsSync(join(elementsDir, "dist", "index.js")),
    "packages/elements/dist is missing — run the ordered workspace build first (`npm run build`), the way the publish workflow does",
  );
  assert.ok(
    existsSync(sriPath),
    "packages/elements/dist/browser/sri.json is missing — run `npm --workspace @sentropic/design-system-elements run build:browser` first, the way the publish workflow does",
  );
  const manifest = JSON.parse(readFileSync(join(elementsDir, "package.json"), "utf8"));
  const sri = JSON.parse(readFileSync(sriPath, "utf8"));
  assert.strictEqual(
    sri.version,
    manifest.version,
    `dist/browser was built for version ${JSON.stringify(sri.version)} but the manifest is ${JSON.stringify(manifest.version)} — rebuild dist/browser from the release manifest`,
  );
  const drift = tarballSriMismatches(browserDir, sri);
  assert.deepStrictEqual(drift, [], `dist/browser is stale, rebuild it before packing:\n${drift.join("\n")}`);
}

function walkFiles(dir, prefix) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix.length > 0 ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walkFiles(join(dir, entry.name), rel));
    else if (entry.isFile()) files.push(rel);
  }
  return files.sort();
}

/** Packs the real tarball once per process and extracts it under a temp dir. */
let packedContext = null;

/** Removes the packed-tarball scratch tree, whether the tests passed or not. */
after(() => {
  if (packedContext !== null) rmSync(packedContext.workdir, { recursive: true, force: true });
});

/**
 * The NOT RUN gate for the AC tests below: when dist/ is absent there is
 * nothing to pack in this job, so the test skips with the reason instead of
 * failing (see unbuiltReason). Returns true when the caller must return.
 */
export function skipWhenUnbuilt(t) {
  const unbuilt = unbuiltReason();
  if (unbuilt === null) return false;
  t.skip(`${unbuilt} — AC-L7a tarball assertions NOT run in this job`);
  return true;
}

export function packedTarballContext() {
  if (packedContext !== null) return packedContext;
  requireBuilt();
  const workdir = mkdtempSync(join(tmpdir(), "elements-publish-tarball-"));
  spawnOrThrow(
    "npm",
    ["pack", "--workspace", "@sentropic/design-system-elements", "--pack-destination", workdir],
    "npm pack @sentropic/design-system-elements",
  );
  const tgz = readdirSync(workdir)
    .filter((entry) => entry.endsWith(".tgz"))
    .map((entry) => join(workdir, entry));
  assert.strictEqual(tgz.length, 1, `expected exactly one packed tarball in ${workdir}, found ${tgz.length}`);
  const extractDir = join(workdir, "extracted");
  mkdirSync(extractDir);
  const extract = spawnSync("tar", ["-xzf", tgz[0], "-C", extractDir], { encoding: "utf8" });
  if (extract.status !== 0) throw new Error(`tar -xzf failed (${extract.status}):\n${extract.stdout}\n${extract.stderr}`);
  const packageDir = join(extractDir, "package");
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  const sri = JSON.parse(readFileSync(join(packageDir, "dist", "browser", "sri.json"), "utf8"));
  packedContext = { workdir, tarball: tgz[0], packageDir, manifest, sri, files: walkFiles(packageDir, "") };
  return packedContext;
}

test("AC-L7a: the packed manifest is public and versioned against sri.json", (t) => {
  if (skipWhenUnbuilt(t)) return;
  const { manifest, sri } = packedTarballContext();
  assert.notStrictEqual(
    manifest.private,
    true,
    `@sentropic/design-system-elements@${manifest.version} still packs as private — delete "private": true to publish`,
  );
  assert.ok(
    typeof manifest.version === "string" && /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(manifest.version),
    `packed manifest version ${JSON.stringify(manifest.version)} is not a release version`,
  );
  assert.notStrictEqual(
    manifest.version,
    "0.0.0",
    "packed manifest is still the 0.0.0 workspace placeholder — a first publication needs a real version (register AMB-2)",
  );
  assert.strictEqual(
    manifest.version,
    sri.version,
    `sri.json version ${JSON.stringify(sri.version)} does not match the packed manifest ${JSON.stringify(manifest.version)} — rebuild dist/browser from the release manifest`,
  );
});

test("AC-L7a: the tarball carries the publishable shape and no source, test, script or map file", (t) => {
  if (skipWhenUnbuilt(t)) return;
  const { files } = packedTarballContext();
  const present = new Set(files);
  const missing = TARBALL_REQUIRED_FILES.filter((file) => !present.has(file));
  assert.deepStrictEqual(missing, [], `published tarball is missing required files: ${missing.join(", ")}`);
  const forbidden = files.filter((file) => TARBALL_FORBIDDEN_PREFIXES.some((prefix) => file.startsWith(prefix)));
  assert.deepStrictEqual(forbidden, [], `published tarball ships source/test/script paths: ${forbidden.join(", ")}`);
  const maps = files.filter((file) => file.endsWith(".map"));
  assert.deepStrictEqual(maps, [], `published tarball ships source maps: ${maps.join(", ")}`);
});

test("AC-L7a: sri.json pins the tarball bytes (every entry recomputed from the extracted files)", (t) => {
  if (skipWhenUnbuilt(t)) return;
  const { packageDir, sri } = packedTarballContext();
  const extractedBrowserDir = join(packageDir, "dist", "browser");
  const drift = tarballSriMismatches(extractedBrowserDir, sri);
  assert.deepStrictEqual(drift, [], `sri.json does not match the TARBALL bytes:\n${drift.join("\n")}`);
  const unlisted = tarballUnlistedFiles(extractedBrowserDir, sri);
  assert.deepStrictEqual(unlisted, [], `tarball dist/browser holds files absent from sri.json: ${unlisted.join(", ")}`);
});

test("AC-L7a: no watermark license value ships in the tarball", (t) => {
  if (skipWhenUnbuilt(t)) return;
  const { packageDir, files } = packedTarballContext();
  const findings = [];
  for (const file of files) {
    let text;
    try {
      const raw = readFileSync(join(packageDir, file));
      if (raw.subarray(0, 8192).includes(0)) continue;
      text = raw.toString("utf8");
    } catch {
      continue;
    }
    for (const finding of tarballLicenseFindings(text)) {
      findings.push(`${file}:${finding.line}: hidden flag with a literal license value (${finding.value.slice(0, 24)})`);
    }
  }
  assert.deepStrictEqual(findings, [], `license value(s) packed in the tarball:\n${findings.join("\n")}`);
});

/**
 * The declared third-party families bundled into dist/browser, read from the
 * same scripts/third-party-sources.json the notices generator reads: one
 * declaration feeds both the generated notices and this guard, so they cannot
 * drift apart. Each entry names the dist/browser prefixes it covers
 * (`assets`) and the notice needles that must name it (`needles`).
 */
function bundledEntries() {
  const sources = JSON.parse(readFileSync(join(repoRoot, "scripts", "third-party-sources.json"), "utf8"));
  return sources.bundled ?? [];
}

/**
 * Every non-JS file under dist/browser (sri.json aside) must belong to a
 * declared bundled family, and every family present must be named in the
 * shipped notices: a future bundled family ships silently otherwise. Pure
 * over tarball-relative file lists, so the witness below runs anywhere.
 */
export function bundledNoticesErrors({ files, noticesText, entries, packageName }) {
  const errors = [];
  const applicable = entries.filter((entry) => (entry.for ?? []).includes(packageName));
  const present = new Map();
  for (const file of files) {
    if (!file.startsWith("dist/browser/") || file === "dist/browser/sri.json") continue;
    if (file.endsWith(".js")) continue;
    const owner = applicable.find((entry) => (entry.assets ?? []).some((prefix) => {
      const rel = file.slice("dist/browser/".length);
      return rel === prefix || rel.startsWith(prefix);
    }));
    if (!owner) {
      errors.push(`${file}: third-party-looking browser asset with no declared bundled family — declare it in scripts/third-party-sources.json`);
      continue;
    }
    if (!present.has(owner.id)) present.set(owner.id, owner);
  }
  for (const file of files.filter((name) => name.startsWith("dist/browser/") && name.endsWith(".js"))) {
    for (const entry of applicable) {
      if (present.has(entry.id)) continue;
      const rel = file.slice("dist/browser/".length);
      if ((entry.assets ?? []).some((prefix) => rel === prefix || rel.startsWith(prefix))) {
        present.set(entry.id, entry);
      }
    }
  }
  for (const entry of present.values()) {
    for (const needle of entry.needles ?? []) {
      if (!noticesText.includes(needle)) {
        errors.push(
          `${entry.id}: present in dist/browser but not named in LICENSE.THIRD-PARTY.md (missing ${JSON.stringify(needle)})`,
        );
      }
    }
  }
  return errors;
}

test("AC-L7a: every third-party asset family inside dist/browser is named in the notices", (t) => {
  if (skipWhenUnbuilt(t)) return;
  const { manifest, packageDir, files } = packedTarballContext();
  const noticesText = readFileSync(join(packageDir, "LICENSE.THIRD-PARTY.md"), "utf8");
  const errors = bundledNoticesErrors({
    files,
    noticesText,
    entries: bundledEntries(),
    packageName: manifest.name,
  });
  assert.deepStrictEqual(errors, [], `bundled family gap in the tarball notices:\n${errors.join("\n")}`);
});

// --- negative witnesses: the tarball scans really detect ---

test("the tarball license scan catches literal license values in plain and minified form, and clears the legal forms", () => {
  assert.strictEqual(
    tarballLicenseFindings(`createBpmnCanvas(host, { watermark: { hidden: true, license: "SENTROPIC-PROD-12345" } });`).length,
    1,
    "plain hidden:true with a literal license must be caught",
  );
  assert.strictEqual(
    tarballLicenseFindings(`{hidden:!0,license:"SENTROPIC-PROD-12345"}`).length,
    1,
    "minified hidden:!0 with a literal license must be caught",
  );
  assert.strictEqual(
    tarballLicenseFindings(`watermark={hidden: !0, license: 'owner-secret-42'}`).length,
    1,
    "spaced minified hidden with a literal license must be caught",
  );
  assert.strictEqual(
    tarballLicenseFindings(`{hidden:!0,license:"x-9"}`).length,
    1,
    "a short literal license has no length floor the W4 detector does not have",
  );
  assert.strictEqual(
    tarballLicenseFindings(`{hidden:!0,license="OWNER-SECRET-99"}`).length,
    1,
    "the minified pass shares the W4 [: =] delimiter set",
  );
  const clean = [
    `createBpmnCanvas(host, { watermark: { hidden: true, license: "<your license reference>" } });`,
    `createBpmnCanvas(host, { watermark: { hidden:!0, license: "<your license reference>" } });`,
    `createBpmnCanvas(host, { watermark: { hidden: true, license: process.env.SENTROPIC_BPMN_WATERMARK_REFERENCE } });`,
    `createBpmnCanvas(host, { watermark: { hidden:!0, license: process.env.SENTROPIC_BPMN_WATERMARK_REFERENCE } });`,
    `createBpmnCanvas(host, { watermark: { hidden: true, license: "SENTROPIC_BPMN_WATERMARK_REFERENCE" } });`,
    `createBpmnCanvas(host, { watermark: { hidden:!0, license: "SENTROPIC_BPMN_WATERMARK_REFERENCE" } });`,
    `{"hidden":false,"license":"anything"}`,
    `{hidden:!1,license:"owner-secret-42"}`,
  ];
  for (const text of clean) {
    assert.deepStrictEqual(tarballLicenseFindings(text), [], `must be clean: ${text}`);
  }
});

test("the tarball SRI recomputation catches one flipped integrity character against fixed fixture bytes", () => {
  const bytes = Buffer.from("elements-tarball-sri-fixture");
  const dir = mkdtempSync(join(tmpdir(), "elements-publish-tarball-witness-"));
  try {
    writeFileSync(join(dir, "chunk-fixture-abc123.js"), bytes);
    const entry = { bytes: bytes.length, integrity: sha384Integrity(bytes) };
    assert.deepStrictEqual(
      tarballSriMismatches(dir, { files: { "chunk-fixture-abc123.js": entry } }),
      [],
      "control: untampered fixture must be clean",
    );
    const tampered = { ...entry, integrity: flipOneIntegrityChar(entry.integrity) };
    const drift = tarballSriMismatches(dir, { files: { "chunk-fixture-abc123.js": tampered } });
    assert.ok(drift.length >= 1, "one flipped integrity character must be caught by the recomputation");
    assert.ok(drift.some((line) => line.includes("integrity")), `expected an integrity drift line, got: ${drift.join("; ")}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the bundled-family check names present families and stops undeclared assets", () => {
  const entries = [
    {
      id: "fixture-font",
      for: ["@sentropic/design-system-elements"],
      assets: ["assets/fixture-"],
      needles: ["Fixture Font License"],
    },
    {
      id: "fixture-metrics",
      for: ["@sentropic/design-system-elements"],
      assets: ["chunks/fixture-metrics-"],
      needles: ["Fixture Metrics Notice", "FixtureMetrics"],
    },
  ];
  const clean = bundledNoticesErrors({
    files: ["dist/browser/elements.js", "dist/browser/sri.json", "dist/browser/assets/fixture-abc123.woff2"],
    noticesText: "bundled: Fixture Font License",
    entries,
    packageName: "@sentropic/design-system-elements",
  });
  assert.deepStrictEqual(clean, [], "control: a declared family named in the notices must be clean");
  const undeclared = bundledNoticesErrors({
    files: ["dist/browser/assets/mystery-abc123.woff2"],
    noticesText: "bundled: Fixture Font License",
    entries,
    packageName: "@sentropic/design-system-elements",
  });
  assert.ok(
    undeclared.some((line) => line.includes("mystery-abc123.woff2") && line.includes("no declared bundled family")),
    `an undeclared browser asset must be stopped, got: ${undeclared.join("; ")}`,
  );
  const unnamed = bundledNoticesErrors({
    files: ["dist/browser/chunks/fixture-metrics-abc123.js"],
    noticesText: "bundled: nothing about metrics here",
    entries,
    packageName: "@sentropic/design-system-elements",
  });
  assert.ok(
    unnamed.some((line) => line.includes("fixture-metrics") && line.includes("LICENSE.THIRD-PARTY.md")),
    `a present family missing from the notices must be stopped, got: ${unnamed.join("; ")}`,
  );
});

/** Flips the first base64 character of a sha384- integrity string to a different one. */
function flipOneIntegrityChar(integrity) {
  const prefix = "sha384-";
  assert.ok(integrity.startsWith(prefix), `expected a sha384 integrity string, got ${integrity}`);
  const head = integrity[prefix.length];
  const replacement = head === "A" ? "B" : "A";
  return prefix + replacement + integrity.slice(prefix.length + 1);
}
