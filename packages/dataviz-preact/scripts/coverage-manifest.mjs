// Coverage-manifest hook of lot P6 (PLAN section 2.9, workstream W3).
//
// `coverage-manifest.json` records every ported module of `packages/dataviz-react`
// in manifest order alongside the three runtime adapters and the semantic-mapping
// rows of the port. This script fails whenever the manifest drifts from the tree
// on disk (unowned file, missing file, doubly-owned row, barrel omission, adapter
// mismatch, or stale reference commit).
//
// Usage: `node scripts/coverage-manifest.mjs --check`
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));

export const MANIFEST_FILENAME = "coverage-manifest.json";
export const W3_LOTS = Object.freeze(["P0", "P1", "P2", "P3", "P4a", "P4b", "P4c", "P5", "P6", "P7", "P8"]);
export const MODULE_KINDS = Object.freeze(["adapter", "helper", "component"]);

/** Scaffold/infrastructure files under `src/` that are not ported dataviz modules. */
export const INFRASTRUCTURE_FILES = Object.freeze(
  new Set(["classNames.ts", "compat.ts", "index.ts", "runtime.ts", "signals.ts"]),
);

export function readManifest(dir = packageDir) {
  const path = join(dir, MANIFEST_FILENAME);
  return { path, manifest: JSON.parse(readFileSync(path, "utf8")) };
}

function walk(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, base));
    else if (entry.isFile()) files.push(relative(base, full).split(sep).join("/"));
  }
  return files;
}

/** Ported non-test source files of `src/` (relative to package root, e.g. `src/adapter.ts`, `src/lib/AreaChart.tsx`). */
export function sourceModules(dir = packageDir) {
  return walk(join(dir, "src"))
    .filter((rel) => /\.tsx?$/.test(rel) && !/\.test\.tsx?$/.test(rel) && !INFRASTRUCTURE_FILES.has(rel))
    .map((rel) => `src/${rel}`)
    .sort();
}

export function checkManifest(dir = packageDir, { adapters, baseRef } = {}) {
  const violations = [];
  const { path, manifest } = readManifest(dir);

  if (manifest.version !== 1) {
    violations.push(`${MANIFEST_FILENAME}: version is ${JSON.stringify(manifest.version)}, expected 1.`);
  }
  if (manifest.programmeLot !== "P6") {
    violations.push(`${MANIFEST_FILENAME}: programmeLot is ${JSON.stringify(manifest.programmeLot)}, expected "P6".`);
  }
  if (manifest.totalReactFiles !== 128) {
    violations.push(`${MANIFEST_FILENAME}: totalReactFiles is ${JSON.stringify(manifest.totalReactFiles)}, expected 128.`);
  }

  const modules = Array.isArray(manifest.modules) ? manifest.modules : [];
  const seenNames = new Set();
  const seenFiles = new Set();
  for (const row of modules) {
    if (!row || typeof row.module !== "string" || row.module === "") {
      violations.push(`${MANIFEST_FILENAME}: module row without a module name.`);
      continue;
    }
    if (seenNames.has(row.module)) violations.push(`${MANIFEST_FILENAME}: module ${row.module} is owned twice.`);
    seenNames.add(row.module);

    if (typeof row.file !== "string" || row.file === "") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no file path.`);
    } else {
      if (seenFiles.has(row.file)) violations.push(`${MANIFEST_FILENAME}: file ${row.file} is owned twice.`);
      seenFiles.add(row.file);
      if (!existsSync(join(dir, row.file))) {
        violations.push(`${MANIFEST_FILENAME}: module ${row.module} points at missing file ${JSON.stringify(row.file)}.`);
      }
    }
    if (!W3_LOTS.includes(row.lot)) {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} names lot ${JSON.stringify(row.lot)}, outside W3.`);
    }
    if (!MODULE_KINDS.includes(row.kind)) {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has invalid kind ${JSON.stringify(row.kind)}.`);
    }
    if (typeof row.renderable !== "boolean") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no boolean renderable flag.`);
    }
    if (typeof row.exportedFromBarrel !== "boolean") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no boolean exportedFromBarrel flag.`);
    }
    if (typeof row.reactSource !== "string" || row.reactSource === "") {
      violations.push(`${MANIFEST_FILENAME}: module ${row.module} has no reactSource reference.`);
    }
  }

  const onDisk = sourceModules(dir);
  for (const file of onDisk) {
    if (!seenFiles.has(file)) violations.push(`${MANIFEST_FILENAME}: ${file} has no owning row.`);
  }
  for (const file of seenFiles) {
    if (!onDisk.includes(file)) violations.push(`${MANIFEST_FILENAME}: row for ${file} names no module of src/.`);
  }

  const barrel = readFileSync(join(dir, "src/index.ts"), "utf8");
  for (const row of modules) {
    if (!row?.exportedFromBarrel || typeof row.file !== "string") continue;
    const importSpecifier = `./${row.file.replace(/^src\//, "").replace(/\.tsx?$/, ".js")}`;
    if (!barrel.includes(`"${importSpecifier}"`) && !barrel.includes(`'${importSpecifier}'`)) {
      violations.push(`${MANIFEST_FILENAME}: src/index.ts does not export ${row.module} (${importSpecifier}).`);
    }
  }

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

  return { path, violations, modules: seenNames.size, adapters: manifest.adapters?.length ?? 0, mapping: keys.size };
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
