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

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { W4_PLACEHOLDERS, watermarkFindings } from "./elements-watermark-w4.test.mjs";

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

/** A license literal shorter than this is a name, not a key (see below). */
export const MIN_LICENSE_KEY_CHARS = 8;

/**
 * The minified-form pass: the W4 detector's hidden pattern covers
 * `hidden: true` spellings only, while a minifier emits `hidden:!0`. Same
 * 300-character window discipline, same placeholder and channel exemptions;
 * only the hidden spelling is new. The plain form stays fully delegated to
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
      if (value.length < MIN_LICENSE_KEY_CHARS) continue;
      if (W4_PLACEHOLDERS.includes(value)) continue;
      if (value.includes("process.env") || value.includes("${")) continue;
      if (/^[A-Z][A-Z0-9_]*$/.test(value)) continue;
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
 * Requires dist/ and dist/browser/ built the way the publish workflow builds
 * them (the root ordered build, then the elements `build` and
 * `build:browser`), and fails loudly when they are absent or stale — this
 * guard never builds them itself. Two reasons, both measured. First, the
 * repository pattern for this is already "build before packing":
 * scripts/smoke-pack.mjs throws its "build packages before running" error
 * rather than building, because the manifest stays the single source of
 * truth. Second, `node --test` runs guard files in parallel processes, and a
 * second concurrent `build:browser` writer in the same outDir breaks the
 * first: observed 2026-11-01 as `ENOENT ... dist/browser/assets/*.woff2`
 * inside the L2 guard's own build while this guard rebuilt beside it
 * (vite's `emptyOutDir` wipes the tree the other writer is reading). One
 * builder only — the workflow's — and every guard reads.
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

test("AC-L7a: the packed manifest is public and versioned against sri.json", () => {
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

test("AC-L7a: the tarball carries the publishable shape and no source, test, script or map file", () => {
  const { files } = packedTarballContext();
  const present = new Set(files);
  const missing = TARBALL_REQUIRED_FILES.filter((file) => !present.has(file));
  assert.deepStrictEqual(missing, [], `published tarball is missing required files: ${missing.join(", ")}`);
  const forbidden = files.filter((file) => TARBALL_FORBIDDEN_PREFIXES.some((prefix) => file.startsWith(prefix)));
  assert.deepStrictEqual(forbidden, [], `published tarball ships source/test/script paths: ${forbidden.join(", ")}`);
  const maps = files.filter((file) => file.endsWith(".map"));
  assert.deepStrictEqual(maps, [], `published tarball ships source maps: ${maps.join(", ")}`);
});

test("AC-L7a: sri.json pins the tarball bytes (every entry recomputed from the extracted files)", () => {
  const { packageDir, sri } = packedTarballContext();
  const extractedBrowserDir = join(packageDir, "dist", "browser");
  const drift = tarballSriMismatches(extractedBrowserDir, sri);
  assert.deepStrictEqual(drift, [], `sri.json does not match the TARBALL bytes:\n${drift.join("\n")}`);
  const unlisted = tarballUnlistedFiles(extractedBrowserDir, sri);
  assert.deepStrictEqual(unlisted, [], `tarball dist/browser holds files absent from sri.json: ${unlisted.join(", ")}`);
});

test("AC-L7a: no watermark license value ships in the tarball", () => {
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
});

/** Flips the first base64 character of a sha384- integrity string to a different one. */
function flipOneIntegrityChar(integrity) {
  const prefix = "sha384-";
  assert.ok(integrity.startsWith(prefix), `expected a sha384 integrity string, got ${integrity}`);
  const head = integrity[prefix.length];
  const replacement = head === "A" ? "B" : "A";
  return prefix + replacement + integrity.slice(prefix.length + 1);
}
