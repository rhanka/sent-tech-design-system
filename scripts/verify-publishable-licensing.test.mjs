// The licensing gate, exercised both ways: it passes on the tree as
// committed, and it FAILS on each defect it claims to catch. A gate only ever
// observed passing is indistinguishable from a gate that cannot fail, which is
// precisely the state this repository was in before it existed.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

import { NOTICES_FILENAME, publishableWorkspaces } from "./generate-third-party-notices.mjs";
import { collectViolations } from "./verify-publishable-licensing.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Run the gate against a throwaway copy of one package directory, mutated to
 * carry the defect under test. Only that package's files are copied and
 * restored, so the working tree is never left altered even if an assertion
 * throws.
 */
function withMutatedPackage(dir, mutate, assertions) {
  const backup = mkdtempSync(join(tmpdir(), "sent-tech-licensing-"));
  const absDir = join(root, dir);
  cpSync(absDir, join(backup, "pkg"), { recursive: true });
  try {
    mutate(absDir);
    assertions(collectViolations(root).violations);
  } finally {
    rmSync(absDir, { recursive: true, force: true });
    cpSync(join(backup, "pkg"), absDir, { recursive: true });
    rmSync(backup, { recursive: true, force: true });
  }
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
    (absDir) => {
      const manifestPath = join(absDir, "package.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      delete manifest.license;
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    },
    (violations) => {
      assert.ok(
        violations.some((v) => v.includes("design-system-tokens") && v.includes('no usable "license" field')),
        `expected a missing-license-field violation, got: ${JSON.stringify(violations)}`,
      );
    },
  );
});

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
