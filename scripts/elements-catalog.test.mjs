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
//
// 2026-11-04 (review 1): two more witnesses were added. The --check refusal
// became an AUTOMATED negative test against a mutated copy in a temp dir
// (`--root`), instead of a hand-observed one. And the plain-Node import of
// `dist/index.js` — the conductor's finding: ajv has NO exports map, so the
// extensionless `ajv/dist/2020` deep import resolved only under vitest's
// resolver and left `dist/` unloadable in real Node ESM
// (ERR_MODULE_NOT_FOUND) — is now a standing guard that loads the built
// package exactly the way a host would and validates the three examples.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const elementsDir = join(repoRoot, "packages", "elements");
const catalogPath = join(elementsDir, "catalog.json");
const generatorMain = join(elementsDir, "dist", "generator", "main.js");

test("AC-L1: the elements package builds and its generator --check exits 0", () => {
  const build = spawnSync("npm", ["run", "build", "-w", "@sentropic/design-system-elements"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (build.status !== 0) {
    throw new Error(`elements build failed (${build.status}):\n${build.stdout}\n${build.stderr}`);
  }

  const check = spawnSync(process.execPath, [generatorMain, "--check"], {
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

test("AC-L1: --check refuses a mutated copy in a temp dir and exits non-zero (--root, TF5)", () => {
  // The generator's --root moves only where the committed artifacts are read;
  // the regeneration itself stays bound to the package. A copy of the six
  // committed artifacts must check fresh as-is, then refuse after ONE
  // out-of-band edit, with exit 1 and the offending file named.
  const artifacts = [
    "catalog.json",
    "envelope.json",
    "schemas/BarChart.v1.json",
    "schemas/BpmnCanvas.v1.json",
    "schemas/DecisionDossier.v1.json",
    "src/generated/a2ui-common-types.ts",
  ];
  const scratch = mkdtempSync(join(tmpdir(), "elements-check-"));
  try {
    for (const relative of artifacts) {
      mkdirSync(dirname(join(scratch, relative)), { recursive: true });
      writeFileSync(join(scratch, relative), readFileSync(join(elementsDir, relative), "utf8"), "utf8");
    }

    const fresh = spawnSync(process.execPath, [generatorMain, "--check", "--root", scratch], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    assert.equal(fresh.status, 0, `the untouched copy must check fresh:\n${fresh.stdout}\n${fresh.stderr}`);

    const original = readFileSync(join(scratch, "catalog.json"), "utf8");
    const mutated = original.replace('"catalogId"', '"catalogIdHandEdited"');
    assert.notEqual(mutated, original, "the mutation must change catalog.json");
    writeFileSync(join(scratch, "catalog.json"), mutated, "utf8");

    const refused = spawnSync(process.execPath, [generatorMain, "--check", "--root", scratch], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    assert.notEqual(refused.status, 0, "a mutated copy must not check fresh");
    assert.equal(refused.status, 1, `--check must exit 1 on a stale copy, got ${refused.status}`);
    assert.match(refused.stderr, /not fresh/, "the refusal must say the artifacts are not fresh");
    assert.match(refused.stderr, /catalog\.json/, "the refusal must name the mutated file");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("AC-L1: dist/index.js loads in PLAIN Node ESM and validates the three examples (conductor finding)", async () => {
  // The exact failure the conductor observed: `ajv` has NO exports map, so the
  // extensionless `ajv/dist/2020` deep import resolved only under vitest's
  // resolver — plain Node answered ERR_MODULE_NOT_FOUND and asked for
  // "ajv/dist/2020.js". This guard imports the BUILT package the way a host
  // does, with no test-runner resolution help: if a deep import regresses to
  // an extensionless path, this test fails with ERR_MODULE_NOT_FOUND again.
  const elements = await import(pathToFileURL(join(elementsDir, "dist", "index.js")).href);
  const { a2uiCommonTypes } = await import(
    pathToFileURL(join(elementsDir, "dist", "generated", "a2ui-common-types.js")).href
  );
  const { validateDecisionDossierDocument } = await import("@sentropic/focus/validate");

  const catalog = JSON.parse(readFileSync(join(elementsDir, "catalog.json"), "utf8"));
  const envelopeSchema = JSON.parse(readFileSync(join(elementsDir, "envelope.json"), "utf8"));
  const validator = elements.createEnvelopeValidator({
    catalog,
    envelopeSchema,
    commonTypes: a2uiCommonTypes,
    ports: {
      focus: elements.createFocusPort(validateDecisionDossierDocument),
      // Accept-everything stub standing in for the absent BPMN engine.
      "bpmn-canvas": { source: "bpmn-canvas", validate: () => [] },
    },
  });

  for (const contract of elements.contracts) {
    const diagnostics = validator.validate({
      catalogId: elements.CATALOG_ID,
      contract: "1.0",
      mode: "snapshot",
      root: contract.example,
    });
    assert.deepEqual(
      diagnostics,
      [],
      `the ${contract.component} example must validate through the plain-Node dist build`,
    );
    // BLOCKING-1 in the same plain-Node setting: an absent catalogId means
    // the renderer's own catalogue and is accepted (§4.2).
    const withoutId = validator.validate({ contract: "1.0", root: contract.example });
    assert.deepEqual(withoutId, [], `the ${contract.component} example without catalogId must be accepted`);
  }
});
