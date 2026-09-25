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
  for (const dir of dsPackageDirs()) {
    const root = join(packagesDir, dir, "src");
    for (const file of sourceFiles(root)) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(importPattern)) {
        const specifier = match[1];
        if (FORBIDDEN.some((pattern) => pattern.test(specifier))) {
          offenders.push(`${file.slice(packagesDir.length)} → ${specifier}`);
        }
      }
    }
  }
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
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(ts|tsx|svelte|js|mjs)$/.test(entry.name)) files.push(path);
  }
  return files;
}
