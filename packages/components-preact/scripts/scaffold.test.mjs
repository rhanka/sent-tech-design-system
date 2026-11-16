// Scaffold checks of lot P0: the coverage-manifest hook and the packaging
// guard fail here, with a case per invariant, rather than as one opaque
// `--check` line in CI output.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ADAPTERS } from "./emit-react.mjs";
import { BASE_REF } from "./port-metrics.mjs";
import { checkManifest, readManifest, sourceModules } from "./coverage-manifest.mjs";
import { checkPackaging } from "./package-guard.mjs";

test("coverage manifest owns the eight modules of the spike, no more", () => {
  const { manifest } = readManifest();
  assert.deepEqual(manifest.modules.map((row) => row.module).sort(), [
    "Button",
    "ChatComposer",
    "Input",
    "Modal",
    "Portal",
    "SelectableRow",
    "Tabs",
    "ThemeProvider",
  ]);
  assert.deepEqual(sourceModules().map((file) => file.replace(/\.tsx$/, "")).sort(), manifest.modules.map((row) => row.module).sort());
});

test("coverage manifest lots are W3 conversion lots; hard set overlaps P5", () => {
  const { manifest } = readManifest();
  const lots = new Map(manifest.modules.map((row) => [row.module, row.lot]));
  assert.deepEqual(lots.get("Button"), "P1");
  assert.deepEqual(lots.get("Input"), "P2");
  assert.deepEqual(lots.get("SelectableRow"), "P2");
  assert.deepEqual(lots.get("Modal"), "P3");
  assert.deepEqual(lots.get("Tabs"), "P3");
  assert.deepEqual(lots.get("ChatComposer"), "P4c");
  assert.deepEqual(lots.get("Portal"), "P4c");
  assert.deepEqual(lots.get("ThemeProvider"), "P4c");
  const hardSet = manifest.modules.filter((row) => row.hardSet).map((row) => row.module);
  assert.deepEqual(hardSet.sort(), ["Portal", "ThemeProvider"]);
});

test("coverage manifest reference is the measured S1 commit", () => {
  const { manifest } = readManifest();
  assert.deepEqual(manifest.reference.commit, BASE_REF);
});

test("coverage manifest adapters are the emission adapters", () => {
  const { manifest } = readManifest();
  assert.deepEqual(manifest.adapters.map((row) => row.module).sort(), Object.keys(ADAPTERS).sort());
});

test("full manifest check passes against the tree", () => {
  const { violations } = checkManifest(undefined, { adapters: ADAPTERS, baseRef: BASE_REF });
  assert.deepEqual(violations, []);
});

test("package stays private with a licence, one export and adapter side effects", () => {
  const { violations } = checkPackaging();
  assert.deepEqual(violations, []);
});
