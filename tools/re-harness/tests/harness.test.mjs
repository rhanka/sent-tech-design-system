// Focused tests for the RE harness core (node --test). No browser, no network.
// Comparators are exercised on literal values; oracle evidence lives only
// in the archived gate reports, which the last test classifies.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels, correspondenceProblems, parseSvgPath } from "../src/comparators.mjs";
import { validateFixtures, assertGateReport, classifyGateReport, GATE_REPORT_FILES, CANDIDATE_STATUS } from "../src/harness.mjs";
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

test("xyflow fixtures carry the named example graphs, not one generic graph (C1)", () => {
  const dir = path.resolve(HERE, "..", "fixtures", "xyflow");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes(".ops."));
  assert.equal(files.length, 93);
  const signatures = new Map();
  let extracted = 0;
  let unknown = 0;
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    assert.ok(doc.extraction, `${f}: extraction provenance missing`);
    if (doc.extraction.status === "extracted") {
      extracted += 1;
      const sig = JSON.stringify([doc.input.nodes, doc.input.edges]);
      signatures.set(sig, (signatures.get(sig) || 0) + 1);
    } else {
      unknown += 1;
      assert.ok(doc.extraction.cause && doc.extraction.cause.length > 3, `${f}: unknown without cause`);
    }
  }
  assert.equal(extracted + unknown, 93);
  assert.ok(extracted >= 55, `only ${extracted} examples extracted`);
  // Distinct graphs: no generic substitute graph shared across examples.
  // Some pinned examples genuinely share one literal graph (e.g. Middlewares
  // imports ../CancelConnection/data), so the bound is a ceiling per graph.
  assert.ok(signatures.size >= 40, `only ${signatures.size} distinct graphs for ${extracted} examples`);
  assert.ok(Math.max(...signatures.values()) <= 6, "one graph is shared by more than 6 examples");
});

test("archived gate reports are real and either green or unknown by fixture only (C7)", () => {
  for (const file of GATE_REPORT_FILES) {
    const full = path.join(RUNS_DIR, file);
    assert.ok(fs.existsSync(full), `gate report ${file} is missing — run the real gates (node tools/re-harness/src/harness.mjs run / selftest)`);
    const report = JSON.parse(fs.readFileSync(full, "utf8"));
    const c = classifyGateReport(report, file);
    assert.notEqual(c.status, "invalid", `${file}: ${c.problems.slice(0, 5).join("; ")}`);
  }
  // The JointJS divergence selftest and the BPMN/JointJS self-parity are
  // strictly green: no fixture of theirs may be unknown.
  assert.equal(classifyGateReport(JSON.parse(fs.readFileSync(path.join(RUNS_DIR, "selftest.json"), "utf8"))).status, "pass");
  const selfParity = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, "self-parity.json"), "utf8"));
  for (const sc of selfParity.scenarios.filter((x) => x.library !== "xyflow")) assert.equal(sc.verdict, "pass", sc.id);
  // No synthetic report survives (the synthetic engines were removed).
  for (const name of fs.readdirSync(RUNS_DIR)) assert.ok(!name.startsWith("synthetic-"), name);
});
