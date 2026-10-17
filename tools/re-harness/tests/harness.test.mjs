// Focused tests for the RE harness core (node --test). No browser, no network.
// Comparators are exercised on literal values; oracle evidence lives only
// in the archived gate reports, which the last test classifies.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels, correspondenceProblems, parseSvgPath } from "../src/comparators.mjs";
import { validateFixtures, assertGateReport, assertXyflowExamplesReport, checkGates, expectedXyflowExclusions, GATE_REPORT_FILES, CANDIDATE_STATUS } from "../src/harness.mjs";
import { validateAgainstSchema } from "../src/validate.mjs";
import { candidateStubRunner } from "../src/runners.mjs";
import { EXPECTED_VERSIONS, REPO_ROOT, WT_ROOT } from "../src/oracles.mjs";
import { canonicalString } from "../src/canonical.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.resolve(HERE, "..", "..", "..", "docs", "re", "harness-runs");

test("fixtures validate against the versioned schemas", () => {
  assert.deepEqual(validateFixtures(), []);
});

test("canonicalisation sorts keys recursively", () => {
  assert.equal(canonicalString({ b: 1, a: { d: 2, c: 3 } }), canonicalString({ a: { c: 3, d: 2 }, b: 1 }));
});

test("geometry tolerates 1px but not 50px; missing pixels stay unknown", () => {
  const a = { bounds: { a: { x: 10, y: 10, width: 100, height: 80 } }, waypoints: {}, viewbox: { x: 10, y: 10, width: 100, height: 80 } };
  const b = JSON.parse(JSON.stringify(a));
  b.bounds.a.x += 1;
  assert.equal(compareGeometry(a, b).verdict, "pass");
  b.bounds.a.x += 50;
  assert.equal(compareGeometry(a, b).verdict, "fail");
  const px = { width: 2, height: 1, data: [255, 255, 255, 255, 0, 0, 0, 255] };
  assert.equal(comparePixels(null, px, {}).verdict, "unknown");
  assert.equal(comparePixels(px, JSON.parse(JSON.stringify(px)), { maxMismatchRatio: 0, perChannelDelta: 0 }).verdict, "pass");
  const other = { width: 2, height: 1, data: [255, 0, 0, 255, 0, 0, 0, 255] };
  assert.equal(comparePixels(px, other, { maxMismatchRatio: 0.01, perChannelDelta: 8 }).verdict, "fail");
});

test("model comparator: floats at 1e-6, any missing key on one side fails", () => {
  const tree = { $type: "bpmn:Definitions", rootElements: [{ $type: "bpmn:Process", id: "p1", flowElements: [{ $type: "bpmn:Task", id: "t1", name: "A" }] }] };
  assert.equal(compareModel(tree, JSON.parse(JSON.stringify(tree))).verdict, "pass");
  const renamed = JSON.parse(JSON.stringify(tree));
  renamed.rootElements[0].flowElements[0].name = "B";
  assert.equal(compareModel(tree, renamed).verdict, "fail");
  const dropped = JSON.parse(JSON.stringify(tree));
  delete dropped.rootElements[0].flowElements[0].name;
  assert.equal(compareModel(tree, dropped).verdict, "fail");
  assert.equal(compareModel({ x: 1 }, { x: 1 + 1e-7 }).verdict, "pass");
  assert.equal(compareModel({ x: 1 }, { x: 1 + 1e-5 }).verdict, "fail");
});

test("model rule: fixtures carry native reference input only, never a harness model", () => {
  const root = path.resolve(HERE, "..", "fixtures");
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
  const files = walk(root).filter((p) => p.endsWith(".json") && !p.includes(`${path.sep}scenarios${path.sep}`) && !p.endsWith(".ops.json"));
  assert.ok(files.length > 90);
  for (const p of files) {
    const doc = JSON.parse(fs.readFileSync(p, "utf8"));
    assert.ok(!("model" in doc), `${path.relative(root, p)}: carries a harness model`);
    assert.ok(doc.input && typeof doc.input === "object", `${path.relative(root, p)}: no native input`);
    if (doc.library === "bpmn") {
      assert.equal(doc.kind, "bpmn-xml");
      const xml = fs.readFileSync(path.join(root, doc.input.xmlFile), "utf8");
      assert.match(xml, /<bpmndi:BPMNDiagram/, `${doc.input.xmlFile}: BPMNDI missing`);
      assert.match(xml, /<bpmn:definitions/);
    }
    if (doc.library === "jointjs") assert.ok(Array.isArray(doc.input.cells) && doc.input.cells.every((c) => c.type && c.id));
    if (doc.library === "xyflow") {
      // The input is the pinned example module itself: no graph data at all.
      assert.equal(doc.kind, "xyflow-example");
      assert.deepEqual(Object.keys(doc.input).sort(), ["example", "flavour"]);
      assert.ok(fs.existsSync(path.join(REPO_ROOT, ".ds-scrap", "re-sources", "xyflow", "examples", doc.input.example)), doc.input.example);
    }
  }
  // No .f1.json hand-written model survives.
  assert.deepEqual(walk(root).filter((p) => p.endsWith(".f1.json")), []);
});

test("candidate side is unsupported at L0 and cites the lot that delivers it", async () => {
  for (const library of ["bpmn", "xyflow", "jointjs"]) {
    const out = await candidateStubRunner(library).run();
    assert.equal(out.unsupported, true);
    assert.ok(out.cause.includes("DiagramState"), out.cause);
  }
  assert.match(CANDIDATE_STATUS.bpmn.cause, /lot L3 of spec\/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE\.md/);
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
  assert.throws(() => assertGateReport({ ...validGateReport(), oracle: "synthetic" }), /instead of "real"|report\.schema\.json/);
  assert.throws(() => assertGateReport({ scenarios: [] }), /instead of "real"|report\.schema\.json/);
  const syntheticScenario = validGateReport();
  syntheticScenario.scenarios[0].oracle = "synthetic";
  assert.throws(() => assertGateReport(syntheticScenario), /instead of "real"|report\.schema\.json/);
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

test("xyflow fixtures: one per inventory example, each mounting its own example module (C1, N1)", () => {
  const dir = path.resolve(HERE, "..", "fixtures", "xyflow");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes(".ops."));
  assert.equal(files.length, 93);
  const modules = new Set();
  const unknown = {};
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    modules.add(doc.input.example);
    if (doc.runnable.status === "unknown") unknown[doc.id] = doc.runnable.missing;
    else assert.equal(doc.runnable.status, "runnable");
  }
  assert.equal(modules.size, 93, "two fixtures share one example module");
  // Every example's imports resolve in the oracle set (the example
  // dependencies dagre, @dagrejs/dagre, localforage, react-redux and
  // @reduxjs/toolkit are installed there): none is statically unknown.
  assert.deepEqual(unknown, {});
});

// The only examples excluded from the xyflow gate, each with its verdict.
// Any change (a new exclusion, an excluded example that starts passing)
// makes this fail.
const EXPECTED_XYFLOW_EXCLUDED = {
  "xyflow-react-floatingedges-selfparity": "deviation",
  "xyflow-react-usekeypress-selfparity": "not-applicable",
};

test("the gate's exclusion list is derived from deviations.json and not-applicable.json (M1)", () => {
  assert.deepEqual(expectedXyflowExclusions(), EXPECTED_XYFLOW_EXCLUDED);
});

test("the gate command fails when the recorded deviation disappears or changes, or on unexpected not-applicable (M1)", () => {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, file), "utf8"));
  const sp = read("self-parity.json");
  const green = read("xyflow-examples.json");
  assert.deepEqual(Object.fromEntries(Object.entries(checkGates(sp, green)).map(([k, g]) => [k, g.ok])), { "self-parity": true, "xyflow-examples": true });
  const fe = "xyflow-react-floatingedges-selfparity";
  // 1. The upstream bug is fixed: the scenario now passes.
  const fixed = JSON.parse(JSON.stringify(green));
  const sc = fixed.scenarios.find((x) => x.id === fe);
  Object.assign(sc, { verdict: "pass" }); delete sc.deviation; delete sc.cause; delete sc.causeKind;
  assert.match(checkGates(sp, fixed)["xyflow-examples"].error, /expected deviation/);
  // 2. The upstream behaviour changed: the symptom did not reproduce.
  const changed = JSON.parse(JSON.stringify(green));
  const sc2 = changed.scenarios.find((x) => x.id === fe);
  Object.assign(sc2, { verdict: "fail", cause: "recorded deviation did not reproduce" });
  sc2.comparators.deviation = { verdict: "fail", detail: "recorded deviation did not reproduce" };
  assert.equal(checkGates(sp, changed)["xyflow-examples"].ok, false);
  // 3. Every example turns not-applicable (e.g. a broken probe).
  const none = JSON.parse(JSON.stringify(green));
  for (const x of none.scenarios) Object.assign(x, { verdict: "not-applicable", causeKind: "example-without-flow", cause: "no flow" });
  assert.equal(checkGates(sp, none)["xyflow-examples"].ok, false);
  // 4. A drifted self-parity is rejected too.
  const spBad = JSON.parse(JSON.stringify(sp)); spBad.scenarios[0].verdict = "unknown";
  assert.equal(checkGates(spBad, green)["self-parity"].ok, false);
});

test("archived gate reports pass the strict guards (C7, N3)", () => {
  for (const file of GATE_REPORT_FILES) {
    assert.ok(fs.existsSync(path.join(RUNS_DIR, file)), `gate report ${file} is missing — run the real gates`);
  }
  const read = (file) => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, file), "utf8"));
  // bpmn-js + JointJS self-parity and the JointJS selftest: strictly green.
  assert.equal(assertGateReport(read("self-parity.json"), "self-parity.json"), true);
  assert.ok(read("self-parity.json").scenarios.every((sc) => sc.library !== "xyflow"));
  assert.equal(assertGateReport(read("selftest.json"), "selftest.json"), true);
  // xyflow: every example passes except the explicit list above.
  const xy = read("xyflow-examples.json");
  assert.equal(xy.scenarios.length, 93);
  assert.equal(assertXyflowExamplesReport(xy, EXPECTED_XYFLOW_EXCLUDED), true);
  assert.equal(xy.scenarios.filter((sc) => sc.verdict === "pass").length, 91);
  for (const name of fs.readdirSync(RUNS_DIR)) assert.ok(!name.startsWith("synthetic-"), name);
});

test("xyflow report guard: exact exclusion list, deviation backed by deviations.json (N3, §8.5)", () => {
  const base = () => ({
    schemaVersion: 1, mode: "self-parity", seed: 42, oracle: "real", oracleVersions: JSON.parse(JSON.stringify(EXPECTED_VERSIONS)),
    scenarios: [
      { id: "a", library: "xyflow", oracle: "real", oracleVersion: "1", verdict: "pass", comparators: {} },
      { id: "xyflow-react-floatingedges-selfparity", library: "xyflow", oracle: "real", oracleVersion: "1", verdict: "deviation", deviation: "xyflow-react-floatingedges-connection-line", causeKind: "upstream-deviation",
        cause: "deviation xyflow-react-floatingedges-connection-line: Cannot read properties of undefined (reading 'positionAbsolute') during a connection drag from a node handle (pointer op connect)",
        comparators: { model: { verdict: "pass" }, deviation: { verdict: "pass" } } },
      { id: "b", library: "xyflow", oracle: "real", oracleVersion: "1", verdict: "not-applicable", causeKind: "example-without-flow", cause: "no flow", comparators: {} },
    ],
  });
  const ok = { "xyflow-react-floatingedges-selfparity": "deviation", b: "not-applicable" };
  assert.equal(assertXyflowExamplesReport(base(), ok), true);
  assert.throws(() => assertXyflowExamplesReport(base(), { b: "not-applicable" }), /is deviation/);
  assert.throws(() => assertXyflowExamplesReport(base(), { ...ok, a: "not-applicable" }), /expected not-applicable/);
  const unbacked = base(); unbacked.scenarios[1].deviation = "nope";
  assert.throws(() => assertXyflowExamplesReport(unbacked, ok), /backed by deviations.json/);
  const unk = base(); unk.scenarios[0].verdict = "unknown"; unk.scenarios[0].cause = "x"; unk.scenarios[0].causeKind = "example-error";
  assert.throws(() => assertXyflowExamplesReport(unk, ok), /is unknown/);
  assert.throws(() => assertXyflowExamplesReport(base(), { ...ok, c: "deviation" }), /absent/);
});

test("deviation entries point at real upstream source lines (§8.5)", () => {
  const doc = JSON.parse(fs.readFileSync(path.resolve(HERE, "..", "deviations.json"), "utf8"));
  assert.ok(doc.entries.length >= 1);
  for (const e of doc.entries) {
    assert.ok(e.id && e.scenario && e.symptom && e.sources.length, e.id);
    for (const src of e.sources) {
      const lines = fs.readFileSync(path.join(REPO_ROOT, src.path), "utf8").split("\n");
      assert.ok(src.line >= 1 && src.line <= lines.length, `${src.path}:${src.line}`);
    }
  }
  const fe = doc.entries.find((e) => e.id === "xyflow-react-floatingedges-connection-line");
  const crash = fe.sources.find((src) => src.path.endsWith("utils.ts"));
  assert.match(fs.readFileSync(path.join(REPO_ROOT, crash.path), "utf8").split("\n")[crash.line - 1], /targetNode\.internals\.positionAbsolute/);
});

test("schema validator honours union types (N3)", () => {
  const schema = { type: "object", properties: { v: { type: ["string", "null"] } } };
  assert.deepEqual(validateAgainstSchema({ v: "x" }, schema), []);
  assert.deepEqual(validateAgainstSchema({ v: null }, schema), []);
  assert.equal(validateAgainstSchema({ v: 3 }, schema).length, 1);
  assert.equal(validateAgainstSchema({ v: {} }, schema).length, 1);
});

test("the JointJS journal projection in the page equals the frozen §5.5 contract", () => {
  const contract = JSON.parse(fs.readFileSync(path.resolve(HERE, "..", "contracts", "jointjs-event-projection.json"), "utf8"));
  const page = fs.readFileSync(path.resolve(HERE, "..", "harness-page.html"), "utf8");
  const block = page.slice(page.indexOf("const JOINT_EFFECTS = {"), page.indexOf("};", page.indexOf("const JOINT_EFFECTS = {")));
  const table = Object.fromEntries([...block.matchAll(/(?:"([^"]+)"|([A-Za-z]+)):\s*"([^"]+)"/g)].map((m) => [m[1] || m[2], m[3]]));
  assert.deepEqual(table, Object.fromEntries(contract.rules.map((r) => [r.match, r.effect])));
});
