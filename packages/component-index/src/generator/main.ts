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
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
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
      const committedText = readFileSync(path, "utf8");
      if (committedText !== file.text) {
        // K1b: the same stamp-only rule covers the contract index
        // (sourceCommit lives outside the contractsRevision preimage).
        if (
          (file.path === "generated/component-index.json" ||
            file.path === "generated/component-contract-index.json") &&
          isStampOnlyDifference(committedText, file.text)
        ) {
          continue;
        }
        stale.push(`${file.path}: differs from the regeneration (out-of-band edit or stale artifact)`);
      }
    }
    // Any committed file the regeneration does not produce is a gap, not a
    // file to keep: catalogue-without-source drift (or a leftover artifact)
    // must turn --check red. The whole generated/ tree is walked
    // recursively with no suffix filter, so a stray file directly under
    // generated/ (or in any subdirectory) is refused.
    const generatedDir = join(artifactsRoot, "generated");
    if (existsSync(generatedDir)) {
      for (const relativePath of listGeneratedFiles(artifactsRoot, generatedDir)) {
        if (!expectedPaths.has(relativePath)) {
          stale.push(`${relativePath}: unexpected (no source produces it; remove it by regenerating)`);
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

/**
 * Stamp-only freshness for `generated/component-index.json` (frozen §5.4)
 * and `generated/component-contract-index.json` (K1b §5.2, same rule):
 * `sourceCommit` lives outside the revision preimage, so a committed index
 * whose only difference from the regeneration is the stamp is fresh. Every
 * other byte of the index (and every other file) stays strictly compared.
 *
 * Returns true exactly when both documents parse, the committed
 * `sourceCommit` matches `^[0-9a-f]{40}$`, and the two documents compare
 * equal with `sourceCommit` removed from both (canonical, key-sorted
 * comparison). Any parse failure, a non-hex committed stamp, or any other
 * byte difference returns false (stale).
 */
function isStampOnlyDifference(committedText: string, regeneratedText: string): boolean {
  let committed: unknown;
  let regenerated: unknown;
  try {
    committed = JSON.parse(committedText);
    regenerated = JSON.parse(regeneratedText);
  } catch {
    return false;
  }
  if (typeof committed !== "object" || committed === null || Array.isArray(committed)) return false;
  if (typeof regenerated !== "object" || regenerated === null || Array.isArray(regenerated)) return false;
  const committedRecord = committed as Record<string, unknown>;
  const regeneratedRecord = regenerated as Record<string, unknown>;
  if (typeof committedRecord["sourceCommit"] !== "string" || !/^[0-9a-f]{40}$/.test(committedRecord["sourceCommit"] as string)) {
    return false;
  }
  const { sourceCommit: _committedStamp, ...committedRest } = committedRecord;
  const { sourceCommit: _regeneratedStamp, ...regeneratedRest } = regeneratedRecord;
  void _committedStamp;
  void _regeneratedStamp;
  return canonicalJson(committedRest) === canonicalJson(regeneratedRest);
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJsonKeys(value));
}

function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortJsonKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

/**
 * Recursive file list under the generated/ tree, as posix relative paths
 * from the artifacts root (for example `generated/component-index.json`).
 * No suffix filter: any path not in the expected set turns --check red.
 */
function listGeneratedFiles(artifactsRoot: string, generatedDir: string): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const absolute = join(dir, name);
      let stat;
      try {
        stat = statSync(absolute);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(absolute);
      } else if (stat.isFile()) {
        found.push(relative(artifactsRoot, absolute).split(sep).join("/"));
      }
    }
  };
  walk(generatedDir);
  return found;
}

process.exit(main());
