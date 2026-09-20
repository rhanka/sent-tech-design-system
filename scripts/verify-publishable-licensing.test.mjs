// The licensing gate, exercised both ways: it passes on the tree as
// committed, and it FAILS on each defect it claims to catch. A gate only ever
// observed passing is indistinguishable from a gate that cannot fail, which is
// precisely the state this repository was in before it existed.
//
// WHY THE DEFECT TESTS RUN AGAINST A COPY, AND NEVER THE WORKING TREE
// They used to `rmSync(..., { recursive: true })` the REAL `packages/tokens`
// and `packages/skills`, five times per run, and restore them in a `finally`.
// Two things were wrong with that. `npm test` is
// `node --test scripts/*.test.mjs`, which runs the test FILES in parallel, and
// scripts/no-rounded-accent-cards.test.mjs walks `packages/` with no try/catch
// - so the deletion window was a real race against a sibling test, not a
// theoretical one. And a process killed inside that window left the directory
// deleted with its only copy in a temp dir. The gate is importable
// (`collectViolations(rootDir)`), so the defects are now injected into a
// throwaway copy of the tree and the working tree is never written to.
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";
import assert from "node:assert/strict";

import { NOTICES_FILENAME, publishableWorkspaces } from "./generate-third-party-notices.mjs";
import { collectViolations } from "./verify-publishable-licensing.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Not copied, by name. `node_modules` is linked back instead (below); the
// others are build output the gate never reads - excluding them takes the copy
// from ~250 MB to ~35 MB without changing a single thing the gate measures.
const UNCOPIED_DIRS = new Set(["node_modules", ".git", ".svelte-kit", "build", "dist", "coverage"]);

/**
 * A throwaway copy of the tree, made once for this file. Every defect test
 * mutates THIS and restores it; the real tree is only ever read.
 */
function makeTreeCopy() {
  const box = mkdtempSync(join(tmpdir(), "sent-tech-licensing-tree-"));
  const copy = join(box, "tree");
  cpSync(root, copy, {
    recursive: true,
    verbatimSymlinks: true,
    filter: (src) => src === root || !UNCOPIED_DIRS.has(basename(src)),
  });
  // The generator reads upstream licence texts and lucide's path data out of
  // node_modules. Linking rather than copying keeps it byte-identical to what
  // the real run sees, and costs nothing.
  symlinkSync(join(root, "node_modules"), join(copy, "node_modules"), "dir");
  return { box, copy };
}

const { box, copy } = makeTreeCopy();
after(() => rmSync(box, { recursive: true, force: true }));

/**
 * Run the gate against the copy, with one package directory mutated to carry
 * the defect under test. Only that package's files are saved and put back, so
 * the following tests see a pristine copy even if an assertion throws.
 */
function withMutatedPackage(dir, mutate, assertions) {
  const backup = mkdtempSync(join(tmpdir(), "sent-tech-licensing-"));
  const absDir = join(copy, dir);
  cpSync(absDir, join(backup, "pkg"), { recursive: true, verbatimSymlinks: true });
  try {
    mutate(absDir);
    assertions(collectViolations(copy).violations);
  } finally {
    rmSync(absDir, { recursive: true, force: true });
    cpSync(join(backup, "pkg"), absDir, { recursive: true, verbatimSymlinks: true });
    rmSync(backup, { recursive: true, force: true });
  }
}

/** Rewrite one field of a package manifest in the copy. */
function setLicenseField(absDir, value) {
  const manifestPath = join(absDir, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (value === undefined) delete manifest.license;
  else manifest.license = value;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

test("every publishable workspace is licensed, and the count is 11", () => {
  const publishable = publishableWorkspaces(root);
  assert.equal(
    publishable.length,
    11,
    "The repository publishes 11 packages. If that changed on purpose, change this number " +
      "in the same commit - and make sure the new package is licensed.",
  );
  for (const { dir, manifest } of publishable) {
    assert.ok(manifest.license, `${dir} declares no license field`);
  }
});

test("the gate passes on the tree as committed", () => {
  assert.deepEqual(collectViolations(root).violations, []);
});

// Without this, a defect test could "pass" because the copy was already
// broken, which would prove nothing about the defect it injects.
test("the throwaway copy the defect tests mutate starts clean", () => {
  assert.deepEqual(collectViolations(copy).violations, []);
});

test("the gate fails when a publishable package loses its LICENSE", () => {
  withMutatedPackage(
    "packages/tokens",
    (absDir) => rmSync(join(absDir, "LICENSE")),
    (violations) => {
      assert.ok(
        violations.some((v) => v.includes("design-system-tokens") && v.includes("no LICENSE file")),
        `expected a missing-LICENSE violation, got: ${JSON.stringify(violations)}`,
      );
      assert.ok(
        violations.some(
          (v) => v.includes("design-system-tokens") && v.includes("absent from the tarball"),
        ),
        `expected a tarball-membership violation, got: ${JSON.stringify(violations)}`,
      );
    },
  );
});

test("the gate fails when a publishable package loses its third-party notices", () => {
  withMutatedPackage(
    "packages/tokens",
    (absDir) => rmSync(join(absDir, NOTICES_FILENAME)),
    (violations) => {
      assert.ok(
        violations.some((v) => v.includes("design-system-tokens") && v.includes(NOTICES_FILENAME)),
        `expected a missing-notices violation, got: ${JSON.stringify(violations)}`,
      );
    },
  );
});

test("the gate fails when a publishable package drops its license field", () => {
  withMutatedPackage(
    "packages/tokens",
    (absDir) => setLicenseField(absDir, undefined),
    (violations) => {
      assert.ok(
        violations.some((v) => v.includes("design-system-tokens") && v.includes('no usable "license" field')),
        `expected a missing-license-field violation, got: ${JSON.stringify(violations)}`,
      );
    },
  );
});

// `SEE LICENSE IN <file>` is SPDX's "read the file, I am not telling you here"
// form, and the filename is free-form. The gate once compared for equality
// against the single spelling `SEE LICENSE IN LICENSE`, so the other spellings
// - the ones a real manifest is more likely to carry - went straight through.
for (const declared of [
  "UNLICENSED",
  "SEE LICENSE IN LICENSE",
  "SEE LICENSE IN LICENSE.txt",
  "SEE LICENSE IN ./COPYING",
  "see licence in ./COPYING",
  "SEE  LICENSE\tIN LICENSE.md",
]) {
  test(`the gate fails when a publishable package declares ${JSON.stringify(declared)}`, () => {
    withMutatedPackage(
      "packages/tokens",
      (absDir) => setLicenseField(absDir, declared),
      (violations) => {
        assert.ok(
          violations.some(
            (v) => v.includes("design-system-tokens") && v.includes('no usable "license" field'),
          ),
          `expected a placeholder-license violation, got: ${JSON.stringify(violations)}`,
        );
      },
    );
  });
}

test("the gate fails when committed notices drift from the lockfile", () => {
  withMutatedPackage(
    "packages/skills",
    (absDir) => {
      const notices = join(absDir, NOTICES_FILENAME);
      writeFileSync(notices, readFileSync(notices, "utf8").replace(/^\| `jsdom` .*$/m, ""));
    },
    (violations) => {
      assert.ok(
        violations.some((v) => v.includes("design-system-skills") && v.includes("out of date")),
        `expected a stale-notices violation, got: ${JSON.stringify(violations)}`,
      );
    },
  );
});
