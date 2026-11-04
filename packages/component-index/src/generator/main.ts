/**
 * The component-index generator CLI (spec section 6.1).
 *
 *   node dist/generator/main.js                     regenerate and write every artifact
 *   node dist/generator/main.js --check              regenerate in memory and fail on
 *                                                     any diff with the committed files
 *                                                     (the freshness guard, run by
 *                                                     scripts/run-script-guards.mjs)
 *   node dist/generator/main.js --check --root <dir>  same check against a copy of
 *                                                     the artifacts rooted at <dir> —
 *                                                     the negative-test path: a mutated
 *                                                     copy exits non-zero without
 *                                                     touching the committed files
 *
 * `--root` moves only where the committed artifacts are read and written;
 * generation always reads this package's schemas, overlay and baseline.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildArtifacts } from "./emit.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const repoRoot = join(packageDir, "..", "..");

function main(): number {
  const argv = process.argv.slice(2);
  const check = argv.includes("--check");
  const rootIndex = argv.indexOf("--root");
  const rootArgument = rootIndex === -1 ? undefined : argv[rootIndex + 1];
  if (rootIndex !== -1 && (rootArgument === undefined || rootArgument.startsWith("--"))) {
    console.error("component-index: --root requires a directory argument");
    return 2;
  }
  const artifactsRoot = rootArgument === undefined ? packageDir : resolve(rootArgument);
  let artifacts;
  try {
    artifacts = buildArtifacts(repoRoot, packageDir);
  } catch (error) {
    console.error(`component-index: generation failed: ${(error as Error).message}`);
    return 1;
  }
  for (const line of artifacts.log.exclusions) console.error(line);

  if (check) {
    const stale: string[] = [];
    const expectedPaths = new Set(artifacts.files.map((file) => file.path));
    for (const file of artifacts.files) {
      const path = join(artifactsRoot, file.path);
      if (!existsSync(path)) {
        stale.push(`${file.path}: missing (regenerate with "npm run index:generate")`);
        continue;
      }
      if (readFileSync(path, "utf8") !== file.text) {
        stale.push(`${file.path}: differs from the regeneration (out-of-band edit or stale artifact)`);
      }
    }
    // A committed entry the regeneration does not produce is a gap, not a
    // file to keep: catalogue-without-source drift must turn --check red.
    const entriesDir = join(artifactsRoot, "generated", "entries");
    if (existsSync(entriesDir)) {
      for (const name of readdirSync(entriesDir).sort()) {
        if (!name.endsWith(".json")) continue;
        const relative = `generated/entries/${name}`;
        if (!expectedPaths.has(relative)) {
          stale.push(`${relative}: unexpected (no source produces it; remove it by regenerating)`);
        }
      }
    }
    if (stale.length > 0) {
      console.error("component-index --check: the committed artifacts are not fresh:");
      for (const entry of stale) console.error(`  - ${entry}`);
      console.error('Regenerate with "npm run index:generate" and commit the result.');
      return 1;
    }
    console.log(`component-index --check: ${artifacts.files.length} artifact(s) fresh.`);
    return 0;
  }

  for (const file of artifacts.files) {
    const path = join(artifactsRoot, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.text, "utf8");
    console.log(`written: ${file.path}`);
  }
  return 0;
}

process.exit(main());
