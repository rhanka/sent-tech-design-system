// AC-L1 guard: the elements catalogue is fresh and well-formed
// (spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md §15, AC-L1).
//
// This is the guard AC-L1 names: `node <generator> --check` must exit 0 inside
// `scripts/run-script-guards.mjs`. It builds the elements package (the
// generator is TypeScript), regenerates every artifact in memory, and fails
// on ANY diff with the committed files — a hand-edited catalog.json, a stale
// regeneration after a props change, or a modified contract module all turn
// this guard red.
//
// RED HISTORY (observed before the implementation existed, 2026-10-30): the
// guard failed because `packages/elements` had no `build` script output and no
// `catalog.json`; the `--check` spawn exited non-zero. The hand-mutation
// witness (a modified catalog.json makes `--check` exit 1 listing the diff)
// was observed after the implementation landed, by editing the committed
// file and regenerating to restore it.

import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const elementsDir = join(repoRoot, "packages", "elements");
const catalogPath = join(elementsDir, "catalog.json");

test("AC-L1: the elements package builds and its generator --check exits 0", () => {
  const build = spawnSync("npm", ["run", "build", "-w", "@sentropic/design-system-elements"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (build.status !== 0) {
    throw new Error(`elements build failed (${build.status}):\n${build.stdout}\n${build.stderr}`);
  }

  const check = spawnSync(process.execPath, [join(elementsDir, "dist", "generator", "main.js"), "--check"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    throw new Error(
      `generator --check failed (${check.status}) — the committed catalogue is stale:\n${check.stdout}\n${check.stderr}`,
    );
  }
});

test("AC-L1: catalog.json has $id equal to catalogId and three components", () => {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  if (catalog.$id !== catalog.catalogId) {
    throw new Error(`catalog.json $id (${catalog.$id}) must equal catalogId (${catalog.catalogId})`);
  }
  const components = Object.keys(catalog.components).sort();
  const expected = ["BarChart", "BpmnCanvas", "DecisionDossier"];
  if (JSON.stringify(components) !== JSON.stringify(expected)) {
    throw new Error(`catalog.json components must be ${expected.join(", ")}, got ${components.join(", ")}`);
  }
});
