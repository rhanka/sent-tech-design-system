#!/usr/bin/env node
// Runs the repository-level guards in `scripts/*.test.mjs` as one CI gate.
//
// Why this wrapper exists instead of a bare `node --test scripts/*.test.mjs`
// step: `node --test` exits 0 when its pattern resolves to nothing. Measured on
// Node v22.22.1, in bash with the default `nullglob` off, so the unmatched glob
// reaches node literally:
//
//   $ node --test scripts/*.nomatch-zzz.mjs
//   1..0
//   # tests 0 / # fail 0
//   $ echo $?
//   0
//
// A gate that is green because its set is empty has verified nothing, and this
// repository has already shipped one such gate. So the file set is resolved
// here, asserted against a floor, printed, and only then handed to
// `node --test`. A moved folder, a renamed suffix or a mis-quoted glob in the
// workflow now turns the step red instead of silently passing.
//
// Usage:
//   node scripts/run-script-guards.mjs
//   node scripts/run-script-guards.mjs --pattern="scripts/*.test.mjs" --min=10
//   node scripts/run-script-guards.mjs --list      # resolve and print, run nothing

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export const DEFAULT_PATTERN = "scripts/*.test.mjs";

// A floor, not an exact count: adding a guard must not require editing this
// number, while a pattern that stops resolving trips it. 12 files match at the
// commit that introduced this runner.
export const DEFAULT_MIN_FILES = 10;

function escapeRegExp(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Deliberately not `fs.globSync`: that API is still experimental on Node 22 and
// prints a warning into the gate's output. One `*` segment in the basename is
// all the patterns here need.
export function resolveMatches(pattern, { root = repoRoot } = {}) {
  const dir = dirname(pattern);
  const base = pattern.slice(dir === "." ? 0 : dir.length + 1);
  // A `*` in any earlier segment would be read as a literal directory name and
  // quietly resolve nothing, which is the exact failure mode this runner exists
  // to prevent. Reject it instead.
  if (dir.includes("*")) {
    throw new Error(`run-script-guards: only the last path segment may contain "*", got "${pattern}"`);
  }
  const matcher = new RegExp(`^${base.split("*").map(escapeRegExp).join("[^/]*")}$`);
  let entries;
  try {
    entries = readdirSync(resolve(root, dir), { withFileTypes: true });
  } catch {
    // A directory that is gone is one of the ways the set silently empties, so
    // it is reported by the floor below rather than thrown here.
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && matcher.test(entry.name))
    .map((entry) => resolve(root, dir, entry.name))
    .sort();
}

function parseArgs(argv) {
  let pattern = DEFAULT_PATTERN;
  let minFiles = DEFAULT_MIN_FILES;
  let list = false;
  for (const arg of argv) {
    if (arg.startsWith("--pattern=")) pattern = arg.slice("--pattern=".length);
    else if (arg.startsWith("--min=")) minFiles = Number(arg.slice("--min=".length));
    else if (arg === "--list") list = true;
    else throw new Error(`run-script-guards: unknown argument "${arg}"`);
  }
  if (!Number.isInteger(minFiles) || minFiles < 1) {
    throw new Error(`run-script-guards: --min must be a positive integer, got "${minFiles}"`);
  }
  return { pattern, minFiles, list };
}

export function main(argv = process.argv.slice(2)) {
  const { pattern, minFiles, list } = parseArgs(argv);
  const files = resolveMatches(pattern);

  if (files.length < minFiles) {
    console.error(
      `run-script-guards: pattern "${pattern}" resolved ${files.length} test file(s), expected at least ${minFiles}.`,
    );
    console.error(
      "A gate whose file set is empty or shrunken passes without evaluating anything, which is why this is an error.",
    );
    return 1;
  }

  console.log(`run-script-guards: ${files.length} guard file(s) matched "${pattern}":`);
  for (const file of files) console.log(`  ${relative(repoRoot, file)}`);
  if (list) return 0;

  // `NODE_TEST_CONTEXT` must not reach the child. Measured on Node v22.22.1: a
  // `node --test` that inherits it reports into the parent runner's protocol and
  // exits 0 even with a failing test —
  //   $ NODE_TEST_CONTEXT=child-v8 node --test failing.test.mjs; echo $?   -> 0
  //   $ node --test failing.test.mjs; echo $?                              -> 1
  // The CI step calls this runner from bash, where the variable is absent, but a
  // future caller invoked from inside a test would otherwise get a silent green.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  const result = spawnSync(process.execPath, ["--test", ...files], { cwd: repoRoot, stdio: "inherit", env });
  if (result.error) {
    console.error(`run-script-guards: could not spawn node --test: ${result.error.message}`);
    return 1;
  }
  if (result.signal) {
    console.error(`run-script-guards: node --test was killed by ${result.signal}`);
    return 1;
  }
  return result.status ?? 1;
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    process.exit(main());
  } catch (error) {
    // A usage error is a red gate, not a stack trace: the step output should say
    // what is wrong with the invocation.
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
