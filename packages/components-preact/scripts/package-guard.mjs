// Packaging guard of lot P0: the package stays private until the plan says
// otherwise (lot P8 ships the release candidate), with a licence file, a
// single public entry point and the adapter side effects a bundler must keep.
//
// Usage: `node scripts/package-guard.mjs --check`
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));

// Same floor as the repository licensing gate: below this a licence file is
// a placeholder, not a licence.
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

  // Private until P8: npm refuses to publish the package, by workflow or by
  // hand. The repository licensing and notices gates follow publishable
  // packages, so they skip this one until the flag is removed with the
  // notices, the gate count and the publish workflow (spike section 9.8).
  if (manifest.private !== true) {
    violations.push(`package.json: "private" is ${JSON.stringify(manifest.private)}, expected true until lot P8.`);
  }
  if (manifest.publishConfig !== undefined) {
    violations.push(`package.json: publishConfig must stay absent while the package is private.`);
  }

  // Licence declared and filed, even while private: the gate that will cover
  // the package on publication day reads exactly these two.
  if (typeof manifest.license !== "string" || manifest.license.trim() === "") {
    violations.push(`package.json: manifest declares no usable "license" field.`);
  }
  const licenseSize = fileSize(join(dir, "LICENSE"));
  if (licenseSize === null || licenseSize < MIN_LICENSE_BYTES) {
    violations.push(`LICENSE: missing or placeholder (${licenseSize ?? "absent"} bytes, floor ${MIN_LICENSE_BYTES}).`);
  }

  // One public entry point. The adapters stay internal: component modules
  // reach them through relative specifiers, and the emission swaps the files,
  // so no subpath export is needed for either runtime.
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

  // Bundler contract (spike section 2): both files install Preact hooks on
  // load and must survive tree-shaking even when none of their exports is used.
  // Modules that render intrinsic camelCase SVG attributes but reference
  // runtime only via `import type` (erased) carry an explicit `import
  // "./runtime.js"` side-effect import of their own (FieldCard, Rating), so no
  // barrel entry is needed: the bundler retains `./dist/runtime.js` whenever
  // it retains such a module.
  for (const entry of [
    "./dist/runtime.js",
    "./dist/signals.js",
  ]) {
    if (!manifest.sideEffects?.includes(entry)) {
      violations.push(`package.json: sideEffects must list ${entry}.`);
    }
  }

  // Runtime closure: themes carry the tokens, lucide-preact the glyphs on
  // the Preact leg (lucide-react on the emitted leg). The runtimes themselves
  // stay peer dependencies so an island ships one copy.
  for (const name of ["@sentropic/design-system-themes", "lucide-preact"]) {
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
  console.log(`[package-guard] private, licensed, single export, adapter side effects kept.`);
}
