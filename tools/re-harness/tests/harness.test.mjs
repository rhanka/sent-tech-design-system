// Focused tests for the RE harness core (node --test). No browser, no network.
import test from "node:test";
import assert from "node:assert/strict";
import { compareModel, compareEvents, compareGeometry, comparePixels } from "../src/comparators.mjs";
import { runEngine } from "../src/engines.mjs";
import { runSelftest, validateFixtures } from "../src/harness.mjs";
import { canonicalString } from "../src/canonical.mjs";

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

test("undo/redo chain round-trips the model exactly", () => {
  const ops = { schemaVersion: 1, id: "o", steps: [
    { op: "create", elementId: "b", type: "bpmn:Task", x: 200, y: 10, width: 90, height: 70, label: "B" },
    { op: "move", elementId: "b", x: 220, y: 30 },
    { op: "setLabel", elementId: "b", label: "B2" },
  ] };
  const beforeUndo = runEngine(fixture, ops);
  const withUndoRedo = runEngine(fixture, { schemaVersion: 1, id: "o2", steps: [...ops.steps, { op: "undo" }, { op: "undo" }, { op: "redo" }, { op: "redo" }] });
  assert.equal(compareModel(beforeUndo.model, withUndoRedo.model).verdict, "pass");
  const undone = runEngine(fixture, { schemaVersion: 1, id: "o3", steps: [...ops.steps, { op: "undo" }] });
  assert.equal(compareModel(beforeUndo.model, undone.model).verdict, "fail");
});

test("selftest detects an injected divergence on every comparator", () => {
  const r = runSelftest();
  assert.equal(r.pass, true);
  assert.ok(r.checks.every((c) => c.detected));
});

test("geometry tolerates 1px but not 50px; pixels stay secondary", () => {
  const a = runEngine(fixture, { schemaVersion: 1, id: "x", steps: [] });
  const b = JSON.parse(JSON.stringify(a));
  b.geometry.bounds.a.x += 1;
  assert.equal(compareGeometry(a.geometry, b.geometry).verdict, "pass");
  b.geometry.bounds.a.x += 50;
  assert.equal(compareGeometry(a.geometry, b.geometry).verdict, "fail");
  const noPixels = { model: a.model, events: a.events, geometry: a.geometry, pixels: null };
  assert.equal(comparePixels(noPixels.pixels, a.pixels, fixture.pixelThreshold).verdict, "unknown");
  assert.equal(compareEvents(a.events, a.events).verdict, "pass");
});
