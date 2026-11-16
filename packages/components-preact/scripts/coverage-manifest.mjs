// Coverage-manifest hook of lots P0/P1 (PLAN section 2.9, workstream W3).
//
// `coverage-manifest.json` is the fragment lot L1.5 reconciles into the
// programme coverage manifest: one row per ported module with its owning W3
// conversion lot, the three P5 adapters, and the semantic-mapping rows of the
// port. This script is its check: it fails when the fragment drifts from the
// tree it describes (unowned module, doubly-owned module, new module beyond
// the spike plus lot P1, adapter set differing from the emission).
//
// Usage: `node scripts/coverage-manifest.mjs --check`
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));

export const MANIFEST_FILENAME = "coverage-manifest.json";

// The W3 conversion lots of PLAN section 4.4. P0 owns the scaffold and no
// conversion; P8 owns the full-emission verification, not modules.
export const W3_LOTS = Object.freeze(["P0", "P1", "P2", "P3", "P4a", "P4b", "P4c", "P5", "P6", "P7", "P8"]);

export function readManifest(dir = packageDir) {
  const path = join(dir, MANIFEST_FILENAME);
  return { path, manifest: JSON.parse(readFileSync(path, "utf8")) };
}

/** Component modules of the single JSX source: `src/<Name>.tsx`, tests excluded. */
export function sourceModules(dir = packageDir) {
  return readdirSync(join(dir, "src"))
    .filter((name) => /^[A-Z][A-Za-z0-9]*\.tsx$/.test(name) && !name.endsWith(".test.tsx"))
    .sort();
}

export function checkManifest(dir = packageDir, { adapters, baseRef } = {}) {
  const violations = [];
  const { path, manifest } = readManifest(dir);

  if (manifest.version !== 1) {
    violations.push(`${MANIFEST_FILENAME}: version is ${JSON.stringify(manifest.version)}, expected 1.`);
  }

  const modules = Array.isArray(manifest.modules) ? manifest.modules : [];
  const seen = new Set();
  for (const row of modules) {
    if (!row || typeof row.module !== "string") {
      violations.push(`${MANIFEST_FILENAME}: module row without a module name.`);
      continue;
    }
    if (seen.has(row.module)) violations.push(`${MANIFEST_FILENAME}: module ${row.module} is owned twice.`);
    seen.add(row.module);
    if (!existsSync(join(dir, row.file ?? ""))) {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} points at missing file ${JSON.stringify(row.file)}.`);
    }
    if (!W3_LOTS.includes(row.lot)) {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} names lot ${JSON.stringify(row.lot)}, outside W3 (${W3_LOTS.join(", ")}).`);
    }
    if (typeof row.category !== "string" || row.category === "") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no category.`);
    }
    if (typeof row.renderable !== "boolean") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no boolean renderable flag.`);
    }
    if (typeof row.reactSource !== "string" || row.reactSource === "") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no reactSource reference.`);
    }
  }

  // The manifest owns every component module of the source and nothing else:
  // a ported module with no row fails here, and so does a row with no module.
  // This also freezes the lot scope: no component beyond the spike plus lot P1.
  const onDisk = sourceModules(dir).map((file) => file.replace(/\.tsx$/, ""));
  for (const name of onDisk) {
    if (!seen.has(name)) violations.push(`${MANIFEST_FILENAME}: src/${name}.tsx has no owning row.`);
  }
  for (const name of seen) {
    if (!onDisk.includes(name)) violations.push(`${MANIFEST_FILENAME}: row ${name} names no module of src/.`);
  }

  // The barrel exports every owned module: the row, the file and the public
  // surface move together.
  const barrel = readFileSync(join(dir, "src/index.ts"), "utf8");
  for (const name of seen) {
    if (!barrel.includes(`"./${name}.js"`)) {
      violations.push(`${MANIFEST_FILENAME}: src/index.ts does not export module ${name}.`);
    }
  }

  // The adapter set is the emission's ADAPTERS map: the manifest cannot age
  // out of the single-source rule it hooks into.
  if (adapters) {
    const manifestAdapters = Array.isArray(manifest.adapters) ? manifest.adapters.map((row) => row?.module) : [];
    const emissionAdapters = Object.keys(adapters).sort();
    const listed = [...manifestAdapters].sort();
    if (JSON.stringify(listed) !== JSON.stringify(emissionAdapters)) {
      violations.push(
        `${MANIFEST_FILENAME}: adapters [${listed.join(", ")}] differ from the emission ADAPTERS [${emissionAdapters.join(", ")}].`,
      );
    }
    for (const row of manifest.adapters ?? []) {
      if (!existsSync(join(dir, row.file ?? ""))) {
        violations.push(`${MANIFEST_FILENAME}: adapter ${row?.module} points at missing file ${JSON.stringify(row?.file)}.`);
      }
      if (!existsSync(join(dir, row.twin ?? ""))) {
        violations.push(`${MANIFEST_FILENAME}: adapter ${row?.module} points at missing twin ${JSON.stringify(row?.twin)}.`);
      }
      if (!W3_LOTS.includes(row.lot)) {
        violations.push(`${MANIFEST_FILENAME}: adapter ${row?.module} names lot ${JSON.stringify(row?.lot)}, outside W3.`);
      }
    }
  }

  // The reference commit is the one S1 measured: same constant as the
  // port-metrics BASE_REF, so the two inputs cannot drift apart.
  if (baseRef !== undefined && manifest.reference?.commit !== baseRef) {
    violations.push(
      `${MANIFEST_FILENAME}: reference commit ${JSON.stringify(manifest.reference?.commit)} differs from port-metrics BASE_REF ${JSON.stringify(baseRef)}.`,
    );
  }

  const mapping = Array.isArray(manifest.semanticMapping) ? manifest.semanticMapping : [];
  const keys = new Set();
  for (const row of mapping) {
    for (const field of ["key", "preact", "react", "decision"]) {
      if (!row || typeof row[field] !== "string" || row[field] === "") {
        violations.push(`${MANIFEST_FILENAME}: semantic-mapping row ${JSON.stringify(row?.key)} has an empty ${field}.`);
      }
    }
    if (row && typeof row.key === "string") {
      if (keys.has(row.key)) violations.push(`${MANIFEST_FILENAME}: semantic-mapping key ${row.key} appears twice.`);
      keys.add(row.key);
    }
  }

  return { path, violations, modules: seen.size, adapters: manifest.adapters?.length ?? 0, mapping: keys.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { ADAPTERS } = await import("./emit-react.mjs");
  const { BASE_REF } = await import("./port-metrics.mjs");
  const { violations, modules, adapters, mapping } = checkManifest(packageDir, { adapters: ADAPTERS, baseRef: BASE_REF });
  if (!process.argv.includes("--check")) {
    console.log(`usage: node scripts/coverage-manifest.mjs --check`);
    process.exit(2);
  }
  if (violations.length > 0) {
    for (const violation of violations) console.error(`[coverage-manifest] ${violation}`);
    process.exit(1);
  }
  console.log(`[coverage-manifest] ${modules} modules, ${adapters} adapters, ${mapping} semantic-mapping rows: match the tree.`);
}
