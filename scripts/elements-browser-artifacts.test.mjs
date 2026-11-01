// AC-L2 guard: the elements package's BROWSER build is real, fresh and
// publishable-shaped (spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md §6.2, §6.4,
// §6.6, §15 AC-L2).
//
// WHAT IT ASSERTS
//   1. `npm run build:browser -w @sentropic/design-system-elements` exits 0
//      when dist/browser/ is missing or stale (it builds the dependency's
//      dist first when that is missing, the way CI's "Build packages" step
//      would have); a fresh tree is read as-is, never rebuilt, so this
//      writer cannot wipe the tree under the parallel tarball guard.
//   2. `dist/browser/sri.json` exists and is FRESH: every file it lists still
//      exists, and its raw bytes, gzip size, brotli size and sha384 integrity
//      match the bytes recomputed here. A rebuilt bundle without regenerating
//      sri.json turns this red.
//   3. sri.json is COMPLETE: every file in dist/browser (except sri.json
//      itself) is listed.
//   4. No `eval(` and no `new Function(` in any built chunk (§6.4). The scan
//      is boundary-aware so `revalidate(` or an `obj.eval` property does not
//      false-positive.
//   5. The core budget (§6.6): the chunks tagged group "core" — the entry
//      closure, validator, error panel and BarChart, everything except the
//      lazy engine chunks and the non-default theme chunks — sum to at most
//      150 kB gzip. A bust fails here and asks for a Track re-decision.
//   6. Every file sri.json lists is inside `npm pack`'s file list (the
//      tarball is what jsDelivr would serve; a file pack excludes can never
//      be SRI-pinned). Measured with `npm pack --dry-run --json`, not assumed
//      from the `files` whitelist.
//
// RED HISTORY (observed 2026-11-05, before the L2 implementation existed):
// every test failed at the first spawn — the workspace had no
// `build:browser` script and no `dist/browser/`, so `npm run build:browser
// -w @sentropic/design-system-elements` exited 1 with "Missing script".
// The negative witnesses (tampered sri entry, eval-bearing chunk, budget
// bust) were observed as automated negative tests after the guard landed.
//
// 0 Python. Node only. Run by scripts/run-script-guards.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const elementsDir = join(repoRoot, "packages", "elements");
export const browserDir = join(elementsDir, "dist", "browser");
export const sriPath = join(browserDir, "sri.json");

/** §6.6: core runtime plus BarChart at most 150 kB gzip (153 600 bytes). */
export const CORE_BUDGET_GZIP_BYTES = 153600;

/** sha384 integrity of bytes, in the `sha384-<base64>` form sri.json uses. */
export function sha384Integrity(bytes) {
  const digest = createHash("sha384").update(bytes).digest("base64");
  return `sha384-${digest}`;
}

export function gzipBytes(bytes) {
  return gzipSync(bytes, { level: 9 }).length;
}

export function brotliBytes(bytes) {
  return brotliCompressSync(bytes, { params: { [Symbol.for("nodejs.constants.BROTLI_PARAM_QUALITY")]: 11 } }).length;
}

/**
 * §6.4 no-eval scan of one built chunk's text. Returns the offending
 * fragments, empty when clean. Boundary-aware: `revalidate(`, `obj.eval(`,
 * `x[eval](`, `fn.Function(` and `x[Function](` do not match; a direct
 * `eval(`, the indirect `(0, eval)(` form, `new Function(` AND the bare
 * `Function(` constructor call a minifier produces from it do (the first
 * L2 build shipped ajv with `new Function` minified to `Function(`, which
 * CSP refuses just the same — the scan must catch both spellings). A
 * tripwire, not a parser.
 */
export function evalFragments(text) {
  const fragments = [];
  const push = (match) =>
    fragments.push(text.slice(match.index, Math.min(text.length, match.index + 40)).trim());
  for (const match of text.matchAll(/(?:^|[^\w$.\]])eval\(/g)) push(match);
  for (const match of text.matchAll(/(?:^|[^\w$.])eval\s*\)\s*\(/g)) push(match);
  // One pattern for both spellings: `new Function(` (its " Function(" part
  // matches) and the bare `Function(` a minifier emits. Property and index
  // accesses (`fn.Function(`, `x[Function](`) are excluded by the boundary.
  for (const match of text.matchAll(/(?:^|[^\w$.\]])Function\s*\(/g)) push(match);
  return fragments;
}

/** The gzip sum of the sri entries tagged as the core group (§6.6). */
export function coreGzipSum(sri) {
  let total = 0;
  for (const [name, entry] of Object.entries(sri.files ?? {})) {
    if (entry.group === "core") total += entry.gzip;
  }
  return { total, files: Object.entries(sri.files ?? {}).filter(([, entry]) => entry.group === "core").map(([name]) => name) };
}

/** Recomputes one sri entry against the bytes on disk; error strings on drift. */
export function sriDrift(browserDir, sri) {
  const errors = [];
  for (const [name, entry] of Object.entries(sri.files ?? {})) {
    const path = join(browserDir, name);
    if (!existsSync(path)) {
      errors.push(`${name}: listed in sri.json but the file is missing`);
      continue;
    }
    const bytes = readFileSync(path);
    if (bytes.length !== entry.bytes) errors.push(`${name}: sri.json says ${entry.bytes} raw bytes, found ${bytes.length}`);
    if (gzipBytes(bytes) !== entry.gzip) errors.push(`${name}: sri.json says ${entry.gzip} gzip bytes, recomputed ${gzipBytes(bytes)}`);
    if (brotliBytes(bytes) !== entry.brotli) errors.push(`${name}: sri.json says ${entry.brotli} brotli bytes, recomputed ${brotliBytes(bytes)}`);
    if (sha384Integrity(bytes) !== entry.integrity) errors.push(`${name}: sri.json integrity does not match the bytes (stale sri.json?)`);
  }
  return errors;
}

/** Files under dist/browser that sri.json forgot (sri.json itself excluded). */
export function unlistedFiles(browserDir, sri) {
  const listed = new Set(Object.keys(sri.files ?? {}));
  const unlisted = [];
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(join(dir, entry.name), rel);
      else if (rel !== "sri.json" && !listed.has(rel)) unlisted.push(rel);
    }
  };
  walk(browserDir, "");
  return unlisted;
}

function spawnOrThrow(command, args, cwd, label) {
  const run = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (run.status !== 0) {
    throw new Error(
      `${label} failed (${run.status}):\n${run.stdout}\n${run.stderr}`,
    );
  }
  return run;
}

/**
 * True when dist/browser/ is already the fresh build of the current
 * manifest: sri.json exists, stamps the manifest version, and recomputes
 * clean. Only then may this guard skip the rebuild — `node --test` runs
 * guard files in parallel processes, and an unconditional `build:browser`
 * (vite `emptyOutDir: true`) wipes dist/browser/ while the sibling
 * elements-publish-tarball guard reads and packs it. A missing or stale
 * tree is still rebuilt below, exactly once, by this guard alone.
 */
export function browserBuildFresh() {
  if (!existsSync(sriPath)) return false;
  let sri;
  try {
    sri = JSON.parse(readFileSync(sriPath, "utf8"));
  } catch {
    return false;
  }
  const manifest = JSON.parse(readFileSync(join(elementsDir, "package.json"), "utf8"));
  if (sri.version !== manifest.version) return false;
  return sriDrift(browserDir, sri).length === 0;
}

test("AC-L2: the elements browser build is produced and sri.json is fresh, complete, eval-free and on budget", () => {
  // The browser bundle compiles components imported from the Svelte package,
  // so that package's dist must exist the way CI's build step leaves it.
  if (!existsSync(join(repoRoot, "packages", "components-svelte", "dist", "index.js"))) {
    spawnOrThrow("npm", ["run", "build", "-w", "@sentropic/design-system-svelte"], repoRoot, "components-svelte build");
  }
  // Rebuild only when missing or stale: a fresh tree is read as-is so this
  // writer never wipes dist/browser/ under a parallel reader.
  if (!browserBuildFresh()) {
    spawnOrThrow("npm", ["run", "build:browser", "-w", "@sentropic/design-system-elements"], repoRoot, "elements build:browser");
  }

  const sri = JSON.parse(readFileSync(sriPath, "utf8"));

  const drift = sriDrift(browserDir, sri);
  assert.deepStrictEqual(drift, [], `sri.json is stale:\n${drift.join("\n")}`);

  const unlisted = unlistedFiles(browserDir, sri);
  assert.deepStrictEqual(unlisted, [], `dist/browser holds files absent from sri.json: ${unlisted.join(", ")}`);

  assert.ok(typeof sri.version === "string" && sri.version.length > 0, "sri.json carries the package version");

  const offenders = [];
  for (const [name, entry] of Object.entries(sri.files ?? {})) {
    if (typeof entry.group !== "string" || entry.group.length === 0) {
      offenders.push(`${name}: no group tag`);
      continue;
    }
    if (name.endsWith(".js")) {
      const fragments = evalFragments(readFileSync(join(browserDir, name), "utf8"));
      if (fragments.length > 0) offenders.push(`${name}: ${fragments.length} eval/new Function fragment(s): ${fragments[0]}`);
    }
  }
  assert.deepStrictEqual(offenders, [], `built chunks must contain no eval and no new Function (§6.4):\n${offenders.join("\n")}`);

  const { total, files } = coreGzipSum(sri);
  assert.ok(
    total <= CORE_BUDGET_GZIP_BYTES,
    `the core chunks (${files.join(", ")}) weigh ${total} gzip bytes, over the ${CORE_BUDGET_GZIP_BYTES}-byte budget (§6.6) — report the measured value for a Track re-decision`,
  );
});

test("AC-L2: every file sri.json pins is inside npm pack's file list", () => {
  if (!existsSync(sriPath)) {
    assert.fail("sri.json does not exist — run the elements browser build first (the previous test builds it)");
  }
  const pack = spawnOrThrow(
    "npm",
    ["pack", "--dry-run", "--json"],
    elementsDir,
    "npm pack --dry-run",
  );
  const manifest = JSON.parse(pack.stdout);
  const packed = new Set(manifest.flatMap((entry) => entry.files.map((file) => file.path)));
  const sri = JSON.parse(readFileSync(sriPath, "utf8"));
  const missing = Object.keys(sri.files ?? {}).filter((name) => !packed.has(`dist/browser/${name}`));
  assert.deepStrictEqual(
    missing,
    [],
    `npm pack would NOT ship these sri-pinned browser files (jsDelivr could never serve them): ${missing.join(", ")}`,
  );
});

// --- negative witnesses: the guard's detectors really detect ---

test("the no-eval detector catches direct and indirect eval, new Function and the bare Function() minified form, and clears clean text", () => {
  assert.strictEqual(evalFragments("const f = (x) => revalidate(x);").length, 0);
  assert.strictEqual(evalFragments("obj.eval('x'); const y = 'eval (not code)';").length, 0);
  assert.strictEqual(evalFragments("eval('1+1');").length, 1);
  assert.strictEqual(evalFragments("(0, eval)('x');").length, 1);
  assert.strictEqual(evalFragments("const f = new Function('a', 'return a');").length, 1);
  assert.strictEqual(evalFragments("const makeValidate = Function('self', 'scope', code);").length, 1);
  assert.strictEqual(evalFragments("fn.Function('x'); x[Function]('y'); typeof Function;").length, 0);
});

test("the sri drift detector catches a tampered entry, and the budget check catches a bust", () => {
  const goodEntry = { bytes: 3, gzip: gzipBytes(Buffer.from("abc")), brotli: brotliBytes(Buffer.from("abc")), integrity: sha384Integrity(Buffer.from("abc")), group: "core" };
  assert.deepStrictEqual(sriDrift(browserDir, { files: {} }), []);
  const drift = sriDrift(browserDir, { files: { "elements.js": goodEntry } });
  assert.ok(drift.length >= 1, "a sri entry naming a missing file is drift");
  const bust = coreGzipSum({ files: { "elements.js": { gzip: CORE_BUDGET_GZIP_BYTES + 1, group: "core" } } });
  assert.ok(bust.total > CORE_BUDGET_GZIP_BYTES);
});
