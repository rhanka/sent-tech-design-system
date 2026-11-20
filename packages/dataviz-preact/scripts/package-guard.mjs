// Packaging guard of lot P6: @sentropic/dataviz-preact stays private until lot
// P8 ships the release candidate, with a licence file, a single public entry
// point, the adapter side effects a bundler must keep, and the dataviz runtime
// dependency closure.
//
// Usage: `node scripts/package-guard.mjs --check`
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));

const MIN_LICENSE_BYTES = 300;

function fileSize(absPath) {
  try {
    const stats = statSync(absPath);
    return stats.isFile() ? stats.size : null;
  } catch {
    return null;
  }
}

export function checkPackaging(dir = packageDir) {
  const violations = [];
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));

  if (manifest.private !== true) {
    violations.push(`package.json: "private" is ${JSON.stringify(manifest.private)}, expected true until lot P8.`);
  }
  if (manifest.publishConfig !== undefined) {
    violations.push(`package.json: publishConfig must stay absent while the package is private.`);
  }

  if (typeof manifest.license !== "string" || manifest.license.trim() === "") {
    violations.push(`package.json: manifest declares no usable "license" field.`);
  }
  const licenseSize = fileSize(join(dir, "LICENSE"));
  if (licenseSize === null || licenseSize < MIN_LICENSE_BYTES) {
    violations.push(`LICENSE: missing or placeholder (${licenseSize ?? "absent"} bytes, floor ${MIN_LICENSE_BYTES}).`);
  }

  const dot = manifest.exports?.["."];
  if (dot?.types !== "./dist/index.d.ts" || dot?.import !== "./dist/index.js") {
    violations.push(`package.json: exports["."] must be { types: ./dist/index.d.ts, import: ./dist/index.js }.`);
  }
  if (manifest.main !== "./dist/index.js" || manifest.types !== "./dist/index.d.ts") {
    violations.push(`package.json: main/types must point at ./dist/index.js and ./dist/index.d.ts.`);
  }
  const extraSubpaths = Object.keys(manifest.exports ?? {}).filter((key) => key !== ".");
  if (extraSubpaths.length > 0) {
    violations.push(`package.json: unexpected subpath exports [${extraSubpaths.join(", ")}]; only "." is public.`);
  }
  if (!Array.isArray(manifest.files) || !manifest.files.includes("dist")) {
    violations.push(`package.json: "files" must include "dist".`);
  }

  for (const entry of ["./dist/runtime.js", "./dist/signals.js"]) {
    if (!manifest.sideEffects?.includes(entry)) {
      violations.push(`package.json: sideEffects must list ${entry}.`);
    }
  }

  for (const name of [
    "@sentropic/dataviz-core",
    "@sentropic/design-system-preact",
    "@sentropic/design-system-themes",
    "jspdf",
    "svg2pdf.js",
  ]) {
    if (typeof manifest.dependencies?.[name] !== "string") {
      violations.push(`package.json: missing dependency ${name}.`);
    }
  }
  for (const name of ["preact", "@preact/signals"]) {
    if (typeof manifest.peerDependencies?.[name] !== "string") {
      violations.push(`package.json: missing peerDependency ${name}.`);
    }
  }

  return { violations };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes("--check")) {
    console.log(`usage: node scripts/package-guard.mjs --check`);
    process.exit(2);
  }
  const { violations } = checkPackaging(packageDir);
  if (violations.length > 0) {
    for (const violation of violations) console.error(`[package-guard] ${violation}`);
    process.exit(1);
  }
  console.log(`[package-guard] private, licensed, single export, adapter side effects and dataviz runtime deps kept.`);
}
