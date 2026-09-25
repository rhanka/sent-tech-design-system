import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_MIN_FILES, DEFAULT_PATTERN, repoRoot, resolveMatches } from "./run-script-guards.mjs";

const runner = fileURLToPath(new URL("./run-script-guards.mjs", import.meta.url));

// Every spawn below points the runner at a throwaway fixture directory. Pointing
// it at its own default pattern would re-enter this file and recurse.
function runRunner(args, env = {}) {
  return spawnSync(process.execPath, [runner, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function fixtureDir(files) {
  const dir = mkdtempSync(join(tmpdir(), "run-script-guards-"));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return dir;
}

const PASSING = 'import { test } from "node:test";\ntest("fixture passes", () => {});\n';
const FAILING =
  'import { test } from "node:test";\nimport assert from "node:assert/strict";\ntest("fixture fails", () => assert.equal(1, 2));\n';

test("the default pattern resolves the committed guards, above its own floor", () => {
  const files = resolveMatches(DEFAULT_PATTERN);
  assert.ok(
    files.length >= DEFAULT_MIN_FILES,
    `${DEFAULT_PATTERN} resolved ${files.length} file(s), below the declared floor of ${DEFAULT_MIN_FILES}`,
  );
  const names = files.map((file) => basename(file));
  // Named guards, so a rename that empties the set of what matters is visible
  // here and not only in the count.
  for (const expected of [
    "verify-layering.test.mjs",
    "verify-provenance-invariants.test.mjs",
    "verify-theme-invariants.test.mjs",
    "verify-theme-shape.test.mjs",
    "verify-publishable-licensing.test.mjs",
  ]) {
    assert.ok(names.includes(expected), `${DEFAULT_PATTERN} no longer resolves ${expected}`);
  }
  assert.ok(
    files.every((file) => resolve(file).startsWith(resolve(repoRoot))),
    "resolved guard files must live inside the repository",
  );
});

test("the floor is a floor, not a formality", () => {
  assert.ok(Number.isInteger(DEFAULT_MIN_FILES) && DEFAULT_MIN_FILES >= 1, "the floor must be a positive integer");
});

// The reason this runner exists: `node --test <unmatched glob>` exits 0 with
// zero tests. These two cases pin the opposite behaviour.
test("a pattern that matches nothing fails instead of passing empty", () => {
  const result = runRunner(["--pattern=scripts/*.nomatch-zzz.mjs", "--min=1"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /resolved 0 test file\(s\)/);
});

test("a directory that is gone fails instead of passing empty", () => {
  const result = runRunner(["--pattern=no-such-directory/*.test.mjs", "--min=1"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /resolved 0 test file\(s\)/);
});

test("a set that shrank below the floor fails", () => {
  const dir = fixtureDir({ "one.test.mjs": PASSING });
  const result = runRunner([`--pattern=${join(dir, "*.test.mjs")}`, "--min=2"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /resolved 1 test file\(s\), expected at least 2/);
});

test("a satisfied floor over passing files exits 0", () => {
  const dir = fixtureDir({ "one.test.mjs": PASSING, "two.test.mjs": PASSING });
  const result = runRunner([`--pattern=${join(dir, "*.test.mjs")}`, "--min=2"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /2 guard file\(s\) matched/);
});

test("a failing guard propagates its failure through the runner", () => {
  const dir = fixtureDir({ "one.test.mjs": PASSING, "two.test.mjs": FAILING });
  const result = runRunner([`--pattern=${join(dir, "*.test.mjs")}`, "--min=2"]);
  assert.equal(result.status, 1);
});

// Regression pin for a green lie found while wiring this gate: on Node v22.22.1
// a nested `node --test` that inherits NODE_TEST_CONTEXT exits 0 even when a
// test fails. The runner strips it; this asserts the strip, by forcing the
// variable on rather than relying on whatever the ambient runner set.
test("a failing guard still fails when NODE_TEST_CONTEXT is present", () => {
  const dir = fixtureDir({ "one.test.mjs": FAILING });
  const result = runRunner([`--pattern=${join(dir, "*.test.mjs")}`, "--min=1"], {
    NODE_TEST_CONTEXT: "child-v8",
  });
  assert.equal(result.status, 1, "NODE_TEST_CONTEXT must not be able to turn a red guard green");
});

test("--list resolves and reports without running the guards", () => {
  const dir = fixtureDir({ "one.test.mjs": FAILING, "two.test.mjs": FAILING });
  const result = runRunner([`--pattern=${join(dir, "*.test.mjs")}`, "--min=2", "--list"]);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, /fixture fails/);
});

test("an unusable floor or argument is rejected rather than assumed", () => {
  assert.equal(runRunner(["--min=0"]).status, 1);
  assert.equal(runRunner(["--min=abc"]).status, 1);
  assert.equal(runRunner(["--unknown"]).status, 1);
  assert.throws(() => resolveMatches("scripts/*/deep.test.mjs"), /only the last path segment/);
});
