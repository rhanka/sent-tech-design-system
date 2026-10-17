// Focused tests for the RE harness core (node --test). No browser, no network.
// The synthetic-engine tests exercise the comparators only; they are NOT
// oracle evidence. The gate guard test fails whenever an archived gate
// report carries an oracle other than "real".
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels } from "../src/comparators.mjs";
import { runSyntheticEngine } from "../src/synthetic-engines.mjs";
import { runSelftest, validateFixtures, assertGateReport, GATE_REPORT_FILES } from "../src/harness.mjs";
import { canonicalString } from "../src/canonical.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.resolve(HERE, "..", "..", "..", "docs", "re", "harness-runs");

const fixture = {
  schemaVersion: 1, id: "t", library: "bpmn", kind: "bpmn-xml-f1",
  model: { elements: [{ id: "a", type: "bpmn:Task", x: 10, y: 10, width: 100, height: 80, label: "A" }], flows: [] },
  pixelThreshold: { maxMismatchRatio: 0.01, perChannelDelta: 8 },
};

test("fixtures validate against the versioned schemas", () => {
  assert.deepEqual(validateFixtures(), []);
});

test("canonicalisation sorts keys recursively", () => {
  assert.equal(canonicalString({ b: 1, a: { d: 2, c: 3 } }), canonicalString({ a: { c: 3, d: 2 }, b: 1 }));
});

test("synthetic engine undo/redo chain round-trips the model exactly (comparator self-check, not an oracle)", () => {
  const ops = { schemaVersion: 1, id: "o", steps: [
    { op: "create", elementId: "b", type: "bpmn:Task", x: 200, y: 10, width: 90, height: 70, label: "B" },
    { op: "move", elementId: "b", x: 220, y: 30 },
    { op: "setLabel", elementId: "b", label: "B2" },
  ] };
  const beforeUndo = runSyntheticEngine(fixture, ops);
  const withUndoRedo = runSyntheticEngine(fixture, { schemaVersion: 1, id: "o2", steps: [...ops.steps, { op: "undo" }, { op: "undo" }, { op: "redo" }, { op: "redo" }] });
  assert.equal(compareModel(beforeUndo.model, withUndoRedo.model).verdict, "pass");
  const undone = runSyntheticEngine(fixture, { schemaVersion: 1, id: "o3", steps: [...ops.steps, { op: "undo" }] });
  assert.equal(compareModel(beforeUndo.model, undone.model).verdict, "fail");
});

test("synthetic selftest detects an injected divergence on every comparator", () => {
  const r = runSelftest();
  assert.equal(r.oracle, "synthetic");
  assert.equal(r.pass, true);
  assert.ok(r.checks.every((c) => c.detected));
});

test("geometry tolerates 1px but not 50px; pixels stay secondary", () => {
  const a = runSyntheticEngine(fixture, { schemaVersion: 1, id: "x", steps: [] });
  const b = JSON.parse(JSON.stringify(a));
  b.geometry.bounds.a.x += 1;
  assert.equal(compareGeometry(a.geometry, b.geometry).verdict, "pass");
  b.geometry.bounds.a.x += 50;
  assert.equal(compareGeometry(a.geometry, b.geometry).verdict, "fail");
  const noPixels = { model: a.model, events: a.events, geometry: a.geometry, pixels: null };
  assert.equal(comparePixels(noPixels.pixels, a.pixels, fixture.pixelThreshold).verdict, "unknown");
  assert.equal(compareEvents(a.events, a.events).verdict, "pass");
});

test("gate guard rejects any gate report whose oracle is not real", () => {
  assert.equal(assertGateReport({ oracle: "real", scenarios: [{ id: "x", oracle: "real" }] }), true);
  assert.throws(() => assertGateReport({ oracle: "synthetic", scenarios: [] }), /instead of "real"/);
  assert.throws(() => assertGateReport({ scenarios: [] }), /instead of "real"/);
  assert.throws(() => assertGateReport({ oracle: "real", scenarios: [{ id: "x", oracle: "synthetic" }] }), /instead of "real"/);
});

test("archived gate reports carry oracle real (a synthetic gate report fails this suite)", () => {
  for (const file of GATE_REPORT_FILES) {
    const full = path.join(RUNS_DIR, file);
    assert.ok(fs.existsSync(full), `gate report ${file} is missing — run the real gates (node tools/re-harness/src/harness.mjs run / selftest)`);
    const report = JSON.parse(fs.readFileSync(full, "utf8"));
    assertGateReport(report, file);
    assert.ok(report.oracleVersions && typeof report.oracleVersions === "object", `${file}: oracleVersions missing`);
  }
  // Any synthetic report that exists must say so, and must not pose as a gate.
  for (const file of ["synthetic-self-parity.json", "synthetic-selftest.json"]) {
    const full = path.join(RUNS_DIR, file);
    if (!fs.existsSync(full)) continue;
    const report = JSON.parse(fs.readFileSync(full, "utf8"));
    assert.equal(report.oracle, "synthetic", `${file} must be stamped oracle synthetic`);
    assert.ok(!GATE_REPORT_FILES.includes(file));
  }
});
