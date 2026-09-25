import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The design system must not depend on the store-driven dataviz family, nor on the
// semantic diagram model and its codecs: those wrap DS components, never the reverse, and
// a dependency the other way couples the DS release train to theirs. PR #65 briefly
// shipped `@sentropic/dataviz-core` in the four component manifests, which turned
// `pack:smoke` red (that version is not on the registry) and would have made publishing
// the four public DS packages wait on the dataviz train.
//
// What is NOT forbidden, because the programme's target architecture declares it
// (docs/graph-dataviz-architecture-dag.json, study §3.2/§3.3): design-system-{svelte,
// react,vue,angular} → @sentropic/graph and → @sentropic/diagram-canvas. Those eight
// edges are how GD-M2-DS-PRESENTATION and GD-M2-CANVAS are meant to land, so the guard
// stays off them.
const FORBIDDEN = [/^@sentropic\/dataviz(-|$)/, /^@sentropic\/diagram-core$/, /^@sentropic\/diagram-codecs$/];
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

// Cardinality floor for the source-import scan below. Measured on the current tree
// (2026-09-25): dsPackageDirs() walks 147 package directories and sourceFiles()
// finds 1597 matching source files in total (1253 of those across the four
// components-{react,vue,svelte,angular} packages alone). 500 is well below that
// measured count, leaving headroom for legitimate tree changes, while still being
// far above what any silent vacuity (a missing directory swallowed, or an
// extension filter that stops matching anything) could produce.
const MIN_SOURCE_FILES_EXAMINED = 500;

const packagesDir = new URL("../packages/", import.meta.url).pathname;

function dsPackageDirs() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => {
      if (name.startsWith("dataviz-") || name === "graph" || name.startsWith("diagram-")) return false;
      try {
        const manifest = JSON.parse(readFileSync(join(packagesDir, name, "package.json"), "utf8"));
        return typeof manifest.name === "string" && manifest.name.startsWith("@sentropic/design-system");
      } catch {
        return false;
      }
    });
}

test("no design system package depends on the dataviz or diagram-model layers", () => {
  const offenders = [];
  for (const dir of dsPackageDirs()) {
    const manifest = JSON.parse(readFileSync(join(packagesDir, dir, "package.json"), "utf8"));
    for (const field of DEPENDENCY_FIELDS) {
      for (const dependency of Object.keys(manifest[field] ?? {})) {
        if (FORBIDDEN.some((pattern) => pattern.test(dependency))) {
          offenders.push(`${manifest.name} → ${dependency} (${field})`);
        }
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `design system packages must not depend on the dataviz/diagram-model layers:\n  ${offenders.join("\n  ")}`,
  );
});

test("the guard actually sees the design system packages", () => {
  const dirs = dsPackageDirs();
  for (const expected of ["components-react", "components-svelte", "components-vue", "components-angular"]) {
    assert.ok(dirs.includes(expected), `expected ${expected} among the inspected packages`);
  }
});

test("no design system source file imports the dataviz or diagram-model layers", () => {
  const offenders = [];
  const importPattern = /(?:from|import)\s*\(?\s*["'](@sentropic\/[^"']+)["']/g;
  let examined = 0;
  for (const dir of dsPackageDirs()) {
    const root = join(packagesDir, dir, "src");
    const files = sourceFiles(root);
    examined += files.length;
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(importPattern)) {
        const specifier = match[1];
        if (FORBIDDEN.some((pattern) => pattern.test(specifier))) {
          offenders.push(`${file.slice(packagesDir.length)} → ${specifier}`);
        }
      }
    }
  }
  // Floor: catches a filter that silently matches nothing (directory exists, but no
  // file passes the extension test), which a missing-directory guard alone cannot see.
  assert.ok(
    examined >= MIN_SOURCE_FILES_EXAMINED,
    `expected at least ${MIN_SOURCE_FILES_EXAMINED} design system source files to be examined, but only saw ${examined} — the guard may be scanning an empty or unreachable tree`,
  );
  assert.deepEqual(
    offenders,
    [],
    `design system sources must not import the dataviz/diagram-model layers:\n  ${offenders.join("\n  ")}`,
  );
});

function sourceFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    // A missing/unreadable source directory means the guard's assumption about the
    // tree is wrong: fail loudly and name the path, instead of silently examining
    // nothing and letting the caller's assertions pass vacuously.
    throw new Error(`expected a readable source directory at ${dir}: ${error.message}`);
  }
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(ts|tsx|svelte|js|mjs)$/.test(entry.name)) files.push(path);
  }
  return files;
}
