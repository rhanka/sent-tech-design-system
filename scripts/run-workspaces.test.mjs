import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { getOrderedWorkspaces } from "./run-workspaces.mjs";

function createWorkspace(root, path, manifest) {
  const dir = join(root, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest, null, 2));
}

test("orders workspaces before local dependents", () => {
  const root = join(tmpdir(), `sent-tech-workspaces-${process.pid}-order`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });

  try {
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ workspaces: ["packages/*", "apps/*"] }, null, 2),
    );

    createWorkspace(root, "packages/components", {
      name: "@test/components",
      dependencies: { "@test/themes": "0.1.0" },
    });
    createWorkspace(root, "packages/themes", {
      name: "@test/themes",
      dependencies: { "@test/tokens": "0.1.0" },
    });
    createWorkspace(root, "packages/tokens", {
      name: "@test/tokens",
    });
    createWorkspace(root, "apps/docs", {
      name: "@test/docs",
      dependencies: {
        "@test/components": "0.1.0",
        "@test/themes": "0.1.0",
      },
    });

    assert.deepEqual(
      getOrderedWorkspaces(root).map((workspace) => workspace.name),
      ["@test/tokens", "@test/themes", "@test/components", "@test/docs"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails on local workspace dependency cycles", () => {
  const root = join(tmpdir(), `sent-tech-workspaces-${process.pid}-cycle`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });

  try {
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ workspaces: ["packages/*"] }, null, 2),
    );

    createWorkspace(root, "packages/a", {
      name: "@test/a",
      dependencies: { "@test/b": "0.1.0" },
    });
    createWorkspace(root, "packages/b", {
      name: "@test/b",
      dependencies: { "@test/a": "0.1.0" },
    });

    assert.throws(() => getOrderedWorkspaces(root), /workspace dependency cycle/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
