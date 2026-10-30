/**
 * The catalogue generator CLI (§5.1).
 *
 *   node dist/generator/main.js            regenerate and write every artifact
 *   node dist/generator/main.js --check     regenerate in memory and fail on
 *                                          any diff with the committed files
 *                                          (the freshness guard, run by
 *                                          scripts/run-script-guards.mjs)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildArtifacts } from "./emit.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const repoRoot = join(packageDir, "..", "..");

function main(): number {
  const check = process.argv.includes("--check");
  const artifacts = buildArtifacts(repoRoot, packageDir);

  if (check) {
    const stale: string[] = [];
    for (const file of artifacts.files) {
      const path = join(packageDir, file.path);
      if (!existsSync(path)) {
        stale.push(`${file.path}: missing (regenerate with "npm run catalog:generate")`);
        continue;
      }
      if (readFileSync(path, "utf8") !== file.text) {
        stale.push(`${file.path}: differs from the regeneration (out-of-band edit or stale artifact)`);
      }
    }
    if (stale.length > 0) {
      console.error("catalog --check: the committed artifacts are not fresh:");
      for (const entry of stale) console.error(`  - ${entry}`);
      console.error('Regenerate with "npm run catalog:generate" and commit the result.');
      return 1;
    }
    console.log(`catalog --check: ${artifacts.files.length} artifact(s) fresh.`);
    return 0;
  }

  for (const file of artifacts.files) {
    const path = join(packageDir, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.text, "utf8");
    console.log(`written: ${file.path}`);
  }
  return 0;
}

process.exit(main());
