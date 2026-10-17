// Focused tests for the RE harness core (node --test). No browser, no network.
// The synthetic-engine tests exercise the comparators only; they are NOT
// oracle evidence. The gate guard test fails whenever an archived gate
// report carries an oracle other than "real".
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels, correspondenceProblems, parseSvgPath } from "../src/comparators.mjs";
import { runSyntheticEngine } from "../src/synthetic-engines.mjs";
import { runSelftest, validateFixtures, assertGateReport, GATE_REPORT_FILES } from "../src/harness.mjs";
import { EXPECTED_VERSIONS, REPO_ROOT, WT_ROOT } from "../src/oracles.mjs";
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

function validGateReport() {
  return {
    schemaVersion: 1, mode: "self-parity", seed: 42, oracle: "real",
    oracleVersions: JSON.parse(JSON.stringify(EXPECTED_VERSIONS)),
    scenarios: [{ id: "x", library: "bpmn", oracle: "real", oracleVersion: "1.0.0", verdict: "pass", comparators: { model: { verdict: "pass", detail: "ok" } } }],
  };
}

test("gate guard rejects any gate report whose oracle is not real", () => {
  assert.equal(assertGateReport(validGateReport()), true);
  assert.throws(() => assertGateReport({ ...validGateReport(), oracle: "synthetic" }), /instead of "real"/);
  assert.throws(() => assertGateReport({ scenarios: [] }), /instead of "real"|report\.schema\.json/);
  const syntheticScenario = validGateReport();
  syntheticScenario.scenarios[0].oracle = "synthetic";
  assert.throws(() => assertGateReport(syntheticScenario), /instead of "real"/);
});

test("gate guard rejects empty, unknown, skipped or version-drifted reports (C7)", () => {
  const empty = validGateReport();
  empty.scenarios = [];
  assert.throws(() => assertGateReport(empty), /no scenarios/);
  const unknown = validGateReport();
  unknown.scenarios[0].verdict = "unknown";
  assert.throws(() => assertGateReport(unknown), /instead of "pass"/);
  const skipped = validGateReport();
  skipped.scenarios[0].skippedOps = [{ op: "connect", elementId: "fx", why: "source or target not found" }];
  assert.throws(() => assertGateReport(skipped), /skipped/);
  const drifted = validGateReport();
  drifted.oracleVersions = { ...drifted.oracleVersions, "bpmn-js": "0.0.0" };
  assert.throws(() => assertGateReport(drifted), /EXPECTED_VERSIONS/);
  const noVersion = validGateReport();
  delete noVersion.scenarios[0].oracle;
  assert.throws(() => assertGateReport(noVersion), /report\.schema\.json|instead of "real"/);
});

test("geometry: missing viewbox/domBounds on one side fails, never passes (C5)", () => {
  const a = { bounds: { n1: { x: 0, y: 0, width: 10, height: 10 } }, waypoints: {}, viewbox: { x: 0, y: 0, width: 100, height: 100 }, domBounds: { n1: { x: 1, y: 2, width: 10, height: 10 } } };
  const noViewbox = JSON.parse(JSON.stringify(a));
  delete noViewbox.viewbox;
  assert.equal(compareGeometry(a, noViewbox).verdict, "fail");
  const noDom = JSON.parse(JSON.stringify(a));
  delete noDom.domBounds;
  assert.equal(compareGeometry(a, noDom).verdict, "fail");
  const domMoved = JSON.parse(JSON.stringify(a));
  domMoved.domBounds.n1.x += 30;
  assert.equal(compareGeometry(a, domMoved).verdict, "fail");
  assert.equal(compareGeometry(a, JSON.parse(JSON.stringify(a))).verdict, "pass");
  assert.equal(compareGeometry(a, null).verdict, "fail");
});

test("geometry: SVG edge paths compare numerically at 1e-6 (C1/C5)", () => {
  assert.deepEqual(parseSvgPath("M0,0 L10.5,20 C1,2 3,4 5,6"), [["M", 0, 0], ["L", 10.5, 20], ["C", 1, 2, 3, 4, 5, 6]]);
  const a = { bounds: {}, waypoints: {}, viewbox: null, edgePaths: { e1: "M0,0 L10,20" } };
  const same = { bounds: {}, waypoints: {}, viewbox: null, edgePaths: { e1: "M0,0 L10.0000001,20" } };
  assert.equal(compareGeometry(a, same).verdict, "pass");
  const moved = { bounds: {}, waypoints: {}, viewbox: null, edgePaths: { e1: "M0,0 L11,20" } };
  assert.equal(compareGeometry(a, moved).verdict, "fail");
  const missing = { bounds: {}, waypoints: {}, viewbox: null, edgePaths: {} };
  assert.equal(compareGeometry(a, missing).verdict, "fail");
});

test("idCorrespondence must be a bijection and remaps event values (C6)", () => {
  assert.deepEqual(correspondenceProblems({ a: "x", b: "y" }), []);
  assert.equal(correspondenceProblems({ a: "x", b: "x" }).length, 1);
  const left = [{ name: "e", payload: { elementId: "a", nested: { ref: "a" } } }];
  const right = [{ name: "e", payload: { elementId: "x", nested: { ref: "x" } } }];
  assert.equal(compareEvents(left, right, { a: "x" }).verdict, "pass");
  assert.equal(compareEvents(left, right, { a: "x", b: "x" }).verdict, "fail");
});

test("REPO_ROOT resolves to the main checkout carrying .ds-scrap (C8)", () => {
  assert.ok(REPO_ROOT.endsWith("sent-tech-design-system"), `REPO_ROOT=${REPO_ROOT}`);
  assert.ok(WT_ROOT.endsWith(".re-l0-wt") || WT_ROOT === REPO_ROOT, `WT_ROOT=${WT_ROOT}`);
});

test("xyflow fixtures carry the named example graphs, not one generic graph (C1)", () => {
  const dir = path.resolve(HERE, "..", "fixtures", "xyflow");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes(".ops."));
  assert.equal(files.length, 93);
  const signatures = new Set();
  let extracted = 0;
  let unknown = 0;
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    assert.ok(doc.extraction, `${f}: extraction provenance missing`);
    if (doc.extraction.status === "extracted") {
      extracted += 1;
      signatures.add(JSON.stringify(doc.model.nodes.map((n) => `${n.id}:${n.type}`)));
    } else {
      unknown += 1;
      assert.ok(doc.extraction.cause && doc.extraction.cause.length > 3, `${f}: unknown without cause`);
    }
  }
  assert.ok(extracted > 80, `only ${extracted} examples extracted`);
  assert.ok(signatures.size > 50, `only ${signatures.size} distinct node graphs`);
  assert.ok(unknown <= 10, `${unknown} unknown fixtures`);
});

test("archived gate reports carry oracle real (a synthetic gate report fails this suite)", () => {
  for (const file of GATE_REPORT_FILES) {
    const full = path.join(RUNS_DIR, file);
    assert.ok(fs.existsSync(full), `gate report ${file} is missing — run the real gates (node tools/re-harness/src/harness.mjs run / selftest)`);
    const report = JSON.parse(fs.readFileSync(full, "utf8"));
    assert.ok(report.oracleVersions && typeof report.oracleVersions === "object", `${file}: oracleVersions missing`);
    // A green gate report must satisfy the strict guard. A report that is
    // not green (fixtures that stayed `unknown`) must be REJECTED by the
    // guard, and every non-pass scenario must be an explicit unknown with
    // a cause — never a silent or synthetic pass (C1/C7).
    let guardError = null;
    try { assertGateReport(report, file); } catch (err) { guardError = err; }
    if (guardError) {
      for (const scenario of report.scenarios || []) {
        assert.equal(scenario.oracle, "real", `${file}: scenario ${scenario.id} oracle is not real`);
        if (scenario.verdict !== "pass") {
          assert.equal(scenario.verdict, "unknown", `${file}: scenario ${scenario.id} is ${scenario.verdict}, expected pass or unknown`);
          assert.ok(scenario.cause, `${file}: scenario ${scenario.id} unknown without cause`);
        }
        assert.ok(!scenario.skippedOps || scenario.skippedOps.length === 0 || scenario.verdict !== "pass",
          `${file}: scenario ${scenario.id} passed with skipped operations`);
      }
    }
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
