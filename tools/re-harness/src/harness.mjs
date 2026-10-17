// RE harness CLI (Lot L0). Usage:
//   node tools/re-harness/src/harness.mjs run               # real gates in headless Chrome
//   node tools/re-harness/src/harness.mjs selftest          # JointJS real-output divergence gate
//   node tools/re-harness/src/harness.mjs coverage [--strict]
//
// Gate reports (docs/re/harness-runs/self-parity.json, xyflow-examples.json,
// selftest.json) always carry oracle: "real" with the library version read
// from the oracle's own package.json. When a real oracle cannot run, its
// gate is `unknown` with the cause — never green.
//
// Model rule (README, section Model): the harness defines no diagram model.
// Reference outputs are the libraries' own (bpmn-js moddle tree projected
// by the bpmn-moddle descriptors, xyflow store state, JointJS
// graph.toJSON()). The candidate side goes through packages/diagram-core
// DiagramState and the A' codec, which does not exist yet: at L0 the
// candidate is `unsupported` (CANDIDATE_STATUS below).
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels, correspondenceProblems, remapDeep, XYFLOW_GEOMETRY_TOLERANCE_PX } from "./comparators.mjs";
import { validateAgainstSchema } from "./validate.mjs";
import { CANDIDATE_STATUS } from "./runners.mjs";
export { CANDIDATE_STATUS };
import { coverageReport, loadInventory, listScenarios } from "./coverage.mjs";
import { canonicalise, canonicalString } from "./canonical.mjs";
import { BUNDLES_DIR, WT_ROOT, REPO_ROOT, EXPECTED_VERSIONS, bundleStatus, gateOracle, readOracleVersions, xyflowExampleBundles } from "./oracles.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(HERE, "..");

export const GATE_REPORT_FILES = ["self-parity.json", "xyflow-examples.json", "selftest.json"];

// An `unknown` scenario is acceptable in an archived gate report only when
// its cause belongs to the FIXTURE (an example that cannot be extracted
// mechanically). Infrastructure causes (missing bundle, no browser, launch
// failure, run error) make the archived report invalid.
export const ACCEPTED_UNKNOWN_KIND = "example-unrunnable";
// Unknown kinds that belong to the EXAMPLE itself (never to the harness or
// the infrastructure): it cannot be built outside its application, it
// throws in its own code, or it mounts no flow at all.
export const EXAMPLE_UNKNOWN_KINDS = ["example-unrunnable", "example-error", "example-without-flow"];

// Gate guard (C7): a gate report counts only when it is schema-valid,
// produced by the real oracle at the pinned versions, non-empty, and every
// scenario is `pass` with no skipped operation. An `unknown` or empty
// report archived as a gate fails here instead of passing silently.
export function assertGateReport(report, label = "report") {
  if (!report || typeof report !== "object") throw new Error(`${label}: not an object`);
  const schema = readJson(schemaPath("report.schema.json"));
  const schemaErrors = validateAgainstSchema(report, schema, label);
  if (schemaErrors.length) throw new Error(`${label}: report.schema.json: ${schemaErrors[0]}`);
  if (report.oracle !== "real") {
    throw new Error(`${label}: gate report carries oracle=${JSON.stringify(report.oracle)} instead of "real"`);
  }
  if (canonicalString(report.oracleVersions || {}) !== canonicalString(EXPECTED_VERSIONS)) {
    throw new Error(`${label}: oracleVersions do not equal the pinned EXPECTED_VERSIONS`);
  }
  if (!Array.isArray(report.scenarios) || report.scenarios.length === 0) {
    throw new Error(`${label}: gate report has no scenarios`);
  }
  for (const scenario of report.scenarios) {
    if (scenario.oracle !== "real") {
      throw new Error(`${label}: scenario ${scenario.id} carries oracle=${JSON.stringify(scenario.oracle)} instead of "real"`);
    }
    if (scenario.verdict !== "pass") {
      throw new Error(`${label}: scenario ${scenario.id} verdict=${JSON.stringify(scenario.verdict)} instead of "pass"`);
    }
    if (Array.isArray(scenario.skippedOps) && scenario.skippedOps.length > 0) {
      throw new Error(`${label}: scenario ${scenario.id} skipped ${scenario.skippedOps.length} operation(s)`);
    }
  }
  return true;
}

// Guard of the xyflow examples gate report. Strict like assertGateReport,
// except for an EXPLICIT list of excluded examples, each with its verdict:
//   "deviation"      — an upstream bug recorded in deviations.json (with its
//                      source path:line) that happened exactly as recorded;
//   "not-applicable" — the example mounts no flow (nothing to compare).
// The list must match exactly: an extra exclusion, a listed example that
// passes, any unknown, fail or skipped op throws. With these exclusions
// only, the xyflow gate is green.
export function assertXyflowExamplesReport(report, expectedExcluded, label = "xyflow-examples.json") {
  const schemaErrors = validateAgainstSchema(report, readJson(schemaPath("report.schema.json")), label);
  if (schemaErrors.length) throw new Error(`${label}: report.schema.json: ${schemaErrors[0]}`);
  if (report.oracle !== "real") throw new Error(`${label}: oracle is not real`);
  if (canonicalString(report.oracleVersions || {}) !== canonicalString(EXPECTED_VERSIONS)) throw new Error(`${label}: oracleVersions do not equal the pinned EXPECTED_VERSIONS`);
  const scenarios = Array.isArray(report.scenarios) ? report.scenarios : [];
  if (!scenarios.length) throw new Error(`${label}: no scenarios`);
  const deviations = loadDeviations();
  const seen = new Set();
  for (const sc of scenarios) {
    if (sc.oracle !== "real") throw new Error(`${label}: ${sc.id} oracle is not real`);
    if (Array.isArray(sc.skippedOps) && sc.skippedOps.length) throw new Error(`${label}: ${sc.id} skipped operations`);
    const expected = expectedExcluded[sc.id];
    if (expected) {
      seen.add(sc.id);
      if (expected === "deviation") {
        const dev = deviations[sc.id];
        if (!dev || sc.verdict !== "deviation" || sc.deviation !== dev.id || sc.causeKind !== "upstream-deviation") {
          throw new Error(`${label}: ${sc.id} expected deviation backed by deviations.json, got ${sc.verdict}`);
        }
        if (!Array.isArray(dev.sources) || !dev.sources.length || dev.sources.some((src) => !src.path || !Number.isInteger(src.line))) {
          throw new Error(`${label}: deviation ${dev.id} lacks source path:line`);
        }
        if (!String(sc.cause || "").includes(dev.symptom) || !String(sc.cause || "").includes(dev.trigger)) {
          throw new Error(`${label}: ${sc.id} cause does not carry the recorded symptom and trigger of ${dev.id}`);
        }
        // Both runs are compared up to the triggering op (M2): every
        // comparator, including the reproduction of the symptom, must pass.
        const notPass = Object.entries(sc.comparators || {}).filter(([, c]) => c.verdict !== "pass").map(([k]) => k);
        if (notPass.length || !sc.comparators || !sc.comparators.deviation) {
          throw new Error(`${label}: ${sc.id} deviation scenario has comparators not passing: ${notPass.join(", ") || "deviation comparator missing"}`);
        }
      } else if (expected === "not-applicable") {
        if (sc.verdict !== "not-applicable" || sc.causeKind !== "example-without-flow" || !sc.cause) throw new Error(`${label}: ${sc.id} expected not-applicable, got ${sc.verdict}`);
      } else throw new Error(`${label}: ${sc.id}: ${expected} is not an exclusion verdict`);
    } else if (sc.verdict !== "pass") {
      throw new Error(`${label}: ${sc.id} is ${sc.verdict}${sc.causeKind ? ` (${sc.causeKind})` : ""}${sc.cause ? `: ${sc.cause}` : ""}`);
    }
  }
  for (const id of Object.keys(expectedExcluded)) if (!seen.has(id)) throw new Error(`${label}: expected exclusion ${id} is absent`);
  return true;
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

// Gate decision used by `harness.mjs run` (and tested by the unit suite).
export function checkGates(selfParityReport, xyflowReport, exclusions = expectedXyflowExclusions()) {
  const run = (fn) => { try { fn(); return { ok: true }; } catch (err) { return { ok: false, error: String(err.message || err) }; } };
  return {
    "self-parity": run(() => assertGateReport(selfParityReport, "self-parity.json")),
    "xyflow-examples": run(() => assertXyflowExamplesReport(xyflowReport, exclusions)),
  };
}

// Upstream deviation entries (SPEC_RE_BPMN_JS_PARITY §8.5), keyed by scenario.
export function loadDeviations() {
  const doc = readJson(path.join(HARNESS_ROOT, "deviations.json"));
  return Object.fromEntries((doc.entries || []).map((e) => [e.scenario, e]));
}

export function loadNotApplicable() {
  const doc = readJson(path.join(HARNESS_ROOT, "not-applicable.json"));
  return Object.fromEntries((doc.entries || []).map((e) => [e.scenario, e]));
}

// The exact exclusion list of the xyflow gate, DERIVED from the two
// declarative files: every deviations.json entry is expected `deviation`,
// every not-applicable.json entry `not-applicable`. Used by the gate
// command itself and by the unit suite.
export function expectedXyflowExclusions() {
  const out = {};
  for (const [id, e] of Object.entries(loadDeviations())) if (e.library === "xyflow") out[id] = "deviation";
  for (const [id, e] of Object.entries(loadNotApplicable())) if (e.library === "xyflow") out[id] = "not-applicable";
  return out;
}
function schemaPath(name) { return path.join(HARNESS_ROOT, "schemas", name); }

export function validateFixtures() {
  const errors = [];
  const modelSchema = readJson(schemaPath("fixture-model.schema.json"));
  const opsSchema = readJson(schemaPath("fixture-ops.schema.json"));
  const scenarioSchema = readJson(schemaPath("scenario.schema.json"));
  const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]) : [];
  for (const f of walk(path.join(HARNESS_ROOT, "fixtures")).filter((x) => x.endsWith(".json"))) {
    const doc = readJson(f);
    const rel = path.relative(HARNESS_ROOT, f);
    if (rel.startsWith(path.join("fixtures", "scenarios"))) {
      errors.push(...validateAgainstSchema(doc, scenarioSchema, rel).map((e) => `${rel}: ${e}`));
    } else if (doc.steps && doc.id && !doc.input) {
      errors.push(...validateAgainstSchema(doc, opsSchema, rel).map((e) => `${rel}: ${e}`));
    } else {
      errors.push(...validateAgainstSchema(doc, modelSchema, rel).map((e) => `${rel}: ${e}`));
      if (doc.idCorrespondence) {
        errors.push(...correspondenceProblems(doc.idCorrespondence).map((e) => `${rel}: ${e}`));
      }
    }
  }
  return errors;
}

// The BPMN input is a .bpmn file loaded verbatim; it is attached to the
// in-memory fixture only (input.xml), never rewritten into a JSON model.
function loadFixture(fixturePath) {
  const fixture = readJson(fixturePath);
  if (fixture.input && fixture.input.xmlFile) {
    fixture.input = { ...fixture.input, xml: fs.readFileSync(path.join(HARNESS_ROOT, "fixtures", fixture.input.xmlFile), "utf8") };
  }
  return fixture;
}
function loadOps(opsPath) {
  return opsPath && fs.existsSync(opsPath) ? readJson(opsPath) : { schemaVersion: 1, id: "empty", steps: [] };
}
function fixturePathFor(scenario) { return path.join(HARNESS_ROOT, "fixtures", scenario.fixtures[0]); }
function opsPathFor(scenario) { return scenario.ops ? path.join(HARNESS_ROOT, "fixtures", scenario.ops) : null; }

// JointJS geometry family of each link, read from the library's own
// graph JSON (router first, then connector), for the per-function
// rounding of SPEC_RE_JOINTJS_PARITY §5.3.
// Both sides are read: a link whose family differs between the two runs
// gets no rounding at all (the model comparator already reports it).
function jointFamilies(leftJson, rightJson) {
  const familyOf = (graphJson) => {
    const out = {};
    for (const cell of (graphJson && graphJson.cells) || []) {
      if (!cell.source || !cell.target) continue;
      if (cell.router && cell.router.name) out[cell.id] = `routers.${cell.router.name}`;
      else if (cell.connector && cell.connector.name) out[cell.id] = `connectors.${cell.connector.name}`;
    }
    return out;
  };
  const l = familyOf(leftJson); const r = familyOf(rightJson);
  const out = {};
  for (const id of Object.keys(l)) if (r[id] === l[id]) out[id] = l[id];
  return out;
}

function compareRuns(left, right, fixture) {
  const correspondence = fixture.idCorrespondence || {};
  const geometryOptions = fixture.library === "xyflow"
    ? { tolerancePx: XYFLOW_GEOMETRY_TOLERANCE_PX, viewboxTolerance: XYFLOW_GEOMETRY_TOLERANCE_PX }
    : fixture.library === "jointjs" ? { familyById: jointFamilies(left.model, right.model) } : {};
  const comparators = {
    model: compareModel(remapDeep(left.model, correspondence), remapDeep(right.model, correspondence)),
    events: compareEvents(left.events, right.events, correspondence),
    geometry: compareGeometry(remapDeep(left.geometry, correspondence), remapDeep(right.geometry, correspondence), geometryOptions),
    pixels: comparePixels(left.pixels, right.pixels, fixture.pixelThreshold || {}),
  };
  // A skipped operation is never silent (C2): the scenario cannot pass,
  // because the two runs may have skipped the same step and stayed equal.
  const skipped = [...(left.skippedOps || []), ...(right.skippedOps || [])];
  if (skipped.length) {
    comparators.operations = {
      verdict: "fail",
      detail: `skippedOps not empty: ${skipped.map((s) => `${s.op} (${s.why})`).join("; ")}`,
    };
  }
  // bpmn-js boundary checks: the XML round trip (saveXML parsed back by the
  // same moddle and projected again equals the projected live tree), and
  // the serialised form is stable across the two independent runs.
  if (left.roundTripModel !== undefined || right.roundTripModel !== undefined) {
    const l = compareModel(left.model, left.roundTripModel);
    const r = compareModel(right.model, right.roundTripModel);
    comparators.xmlRoundTrip = l.verdict === "pass" && r.verdict === "pass"
      ? { verdict: "pass", detail: "saveXML -> moddle.fromXML -> descriptor projection equals the live moddle tree (both runs)" }
      : { verdict: "fail", detail: `round trip differs: ${l.verdict === "pass" ? r.detail : l.detail}` };
  }
  if (left.xml !== undefined || right.xml !== undefined) {
    const xmlEqual = typeof left.xml === "string" && left.xml === right.xml;
    comparators.xml = xmlEqual
      ? { verdict: "pass", detail: "saveXML identical across both real runs" }
      : { verdict: "fail", detail: "saveXML differs across both real runs" };
    if (!xmlEqual && comparators.model.verdict === "pass") {
      comparators.model = { verdict: "fail", detail: `canonical models equal but saveXML differs; ${comparators.model.detail}` };
    }
  }
  return comparators;
}

function overallVerdict(comparators) {
  const vs = Object.values(comparators).map((c) => c.verdict);
  if (vs.includes("fail")) return "fail";
  if (vs.includes("unknown")) return "unknown";
  return "pass";
}

// Injected divergences must be detected on every comparator. `base` is a
// real JointJS run output (model = graph.toJSON()).
// The pixel divergence is NOT a buffer mutation: `mutatedRender` is a second
// real run whose rendering was changed through the library API.
export function divergenceSelftest(base, fixture, mutatedRender) {
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const checks = [];
  const mutatedModel = clone(base);
  const firstElement = mutatedModel.model.cells.find((c) => c.position);
  firstElement.position.x += 999;
  checks.push({ comparator: "model", detected: compareModel(base.model, mutatedModel.model).verdict === "fail" });
  const mutatedGeo = clone(base); mutatedGeo.geometry.bounds[Object.keys(mutatedGeo.geometry.bounds)[0]].x += 50;
  checks.push({ comparator: "geometry", detected: compareGeometry(base.geometry, mutatedGeo.geometry).verdict === "fail" });
  const mutatedEvents = clone(base); mutatedEvents.events = [{ name: "bogus.injected", payload: { elementId: "a" } }];
  checks.push({ comparator: "events", detected: compareEvents(base.events, mutatedEvents.events).verdict === "fail" });
  checks.push({ comparator: "pixels", detected: comparePixels(base.pixels, mutatedRender.pixels, fixture.pixelThreshold).verdict === "fail",
    detail: "fill mutation through the real @joint/core attr API, captured by container screenshot" });
  const control = {
    model: compareModel(base.model, clone(base).model).verdict,
    geometry: compareGeometry(base.geometry, clone(base).geometry).verdict,
    events: compareEvents(base.events, clone(base).events).verdict,
    pixels: comparePixels(base.pixels, clone(base).pixels, fixture.pixelThreshold).verdict,
  };
  return { oracle: "real", checks, control, pass: checks.every((c) => c.detected) && Object.values(control).every((v) => v === "pass") };
}

// -------------------------------------------------------------- browser IO
function findUpward(rel) {
  // Bounded at the REPOSITORY root (C8): search the working tree, then —
  // in a linked worktree, whose node_modules live in the main checkout —
  // the main repository root. Never walk above the repository.
  let dir = HARNESS_ROOT;
  for (;;) {
    const candidate = path.join(dir, rel);
    if (fs.existsSync(candidate)) return candidate;
    if (dir === REPO_ROOT) return null;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
    // Once the working-tree root is passed, jump straight to the main
    // repository root: nothing between the two belongs to the repository.
    if (dir === path.dirname(WT_ROOT) && WT_ROOT !== REPO_ROOT) dir = REPO_ROOT;
  }
}
function pathToFile(p) { return new URL(`file://${p}`).href; }

const STATIC_TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".png": "image/png" };

function serveHarnessPage() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const name = decodeURIComponent((req.url || "/").split("?")[0]);
      let file = null;
      if (name === "/" || name === "/harness-page.html") file = path.join(HARNESS_ROOT, "harness-page.html");
      else if (name.startsWith("/bundles/")) {
        // bundles/<file> or bundles/xyflow-examples/<file>; nothing else.
        const rel = name.slice("/bundles/".length);
        const parts = rel.split("/");
        if (parts.length === 1 || (parts.length === 2 && parts[0] === "xyflow-examples")) {
          const candidate = path.join(BUNDLES_DIR, ...parts.map((p) => path.basename(p)));
          if (candidate.startsWith(BUNDLES_DIR + path.sep)) file = candidate;
        }
      }
      if (!file || !fs.existsSync(file)) { res.writeHead(404).end("not found"); return; }
      res.writeHead(200, { "content-type": STATIC_TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${server.address().port}/harness-page.html`, close: () => server.close() }));
  });
}

async function launchHarnessBrowser() {
  const pwPath = findUpward("node_modules/playwright-core/package.json");
  const ppPath = findUpward("node_modules/puppeteer-core/package.json");
  let playwrightCore = null; let puppeteerCore = null;
  if (pwPath) playwrightCore = await import(pathToFile(pwPath.replace(/package\.json$/, "index.mjs")));
  else if (ppPath) puppeteerCore = await import(pathToFile(ppPath.replace(/package\.json$/, "lib/esm/puppeteer/puppeteer-core.js"))).catch(() => null);
  const { launchBrowser, DETERMINISM_INIT_REAL } = await import("./chrome.mjs");
  const served = await serveHarnessPage();
  try {
    const { browser, page, kind } = await launchBrowser({ playwrightCore, puppeteerCore });
    if (kind === "playwright-core") await page.addInitScript(DETERMINISM_INIT_REAL);
    else await page.evaluateOnNewDocument(DETERMINISM_INIT_REAL);
    // Page errors are kept so that an example failing at runtime reports
    // its own error as the cause.
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err && err.message || err).split("\n")[0].slice(0, 240)));
    page.__pageErrors = pageErrors;
    await page.goto(served.url);
    const status = await page.evaluate(() => window.__harnessReady);
    return { browser, page, kind, served, oracleStatus: status };
  } catch (err) {
    served.close();
    throw err;
  }
}

// --------------------------------------------------------------- real gates
function unknownScenario(scenario, gate, cause, causeKind = "infrastructure") {
  const oracle = gateOracle(gate);
  return {
    id: scenario.id, library: scenario.library, oracle: "real", oracleVersion: oracle.libraryVersion,
    verdict: "unknown", cause, causeKind,
    comparators: {
      model: { verdict: "unknown", detail: cause },
      events: { verdict: "unknown", detail: cause },
      geometry: { verdict: "unknown", detail: cause },
      pixels: { verdict: "unknown", detail: cause },
    },
  };
}

function gateOf(scenario) {
  if (scenario.library === "xyflow") return scenario.id.includes("-svelte-") ? "xyflow-svelte" : "xyflow-react";
  return scenario.library === "jointjs" ? "jointjs" : "bpmn";
}

export async function runRealGates(scenarios, { dumpDir = null } = {}) {
  const { runRealInPage } = await import("./runners.mjs");
  const statuses = bundleStatus();
  const examples = xyflowExampleBundles();
  const deviations = loadDeviations();
  const notApplicable = loadNotApplicable();
  const results = [];
  const xyflow = { executed: [], failed: [], excluded: [], outputs: {} };
  let browserCtx = null;
  let browserError = null;
  let chromeAvailable = true;
  try {
    const chrome = await import("./chrome.mjs");
    chromeAvailable = !!chrome.findChrome();
  } catch { chromeAvailable = false; }

  const builtFor = (scenario) => (scenario.library === "xyflow"
    ? (examples[`xyflow-${scenario.id.replace(/^xyflow-/, "").replace(/-selfparity$/, "")}`] || {}).status === "built"
    : statuses[gateOf(scenario)].built);
  if (scenarios.some(builtFor) && chromeAvailable) {
    try {
      browserCtx = await launchHarnessBrowser();
    } catch (err) {
      browserCtx = null;
      browserError = String(err && err.message || err);
    }
  }

  const record = (scenario, entry) => {
    results.push(entry);
    if (scenario.library === "xyflow" && (entry.verdict === "deviation" || entry.verdict === "not-applicable")) xyflow.excluded.push({ id: scenario.id, verdict: entry.verdict, cause: entry.cause, causeKind: entry.causeKind });
    else if (scenario.library === "xyflow" && entry.verdict !== "pass") xyflow.failed.push({ id: scenario.id, verdict: entry.verdict, cause: entry.cause, causeKind: entry.causeKind });
  };

  try {
    for (const scenario of scenarios) {
      const gate = gateOf(scenario);
      const oracle = gateOracle(gate);
      const fixture = loadFixture(fixturePathFor(scenario));
      const ops = loadOps(opsPathFor(scenario));
      // An example that cannot run outside its application is `unknown`
      // with its precise cause — never run, never green.
      if (fixture.runnable && fixture.runnable.status === "unknown") {
        record(scenario, unknownScenario(scenario, gate, fixture.runnable.cause, ACCEPTED_UNKNOWN_KIND));
        continue;
      }
      if (scenario.library === "xyflow") {
        const e = examples[fixture.id];
        if (!e || e.status !== "built") {
          record(scenario, unknownScenario(scenario, gate, e ? e.cause : `bundles/xyflow-examples/${fixture.id}.js missing (run: node tools/re-harness/build-bundles.mjs)`));
          continue;
        }
      } else if (!statuses[gate].built) {
        record(scenario, unknownScenario(scenario, gate, statuses[gate].cause));
        continue;
      }
      if (!chromeAvailable) {
        record(scenario, unknownScenario(scenario, gate, "headless Chrome not found (CHROME_BIN/google-chrome/chromium absent); real oracles require a browser"));
        continue;
      }
      if (!browserCtx) {
        record(scenario, unknownScenario(scenario, gate, `browser launch failed: ${browserError || "unknown error"}`));
        continue;
      }
      if (scenario.library !== "xyflow" && browserCtx.oracleStatus && browserCtx.oracleStatus[gate] === false) {
        record(scenario, unknownScenario(scenario, gate, `bundle ${statuses[gate].bundle} did not load in the harness page`));
        continue;
      }
      try {
        if (browserCtx.page.__pageErrors) browserCtx.page.__pageErrors.length = 0;
        const ctx = { url: browserCtx.served.url, examples, deviation: deviations[scenario.id] || null };
        if (scenario.library !== "xyflow") await browserCtx.page.goto(browserCtx.served.url);
        const left = await runRealInPage(browserCtx.page, scenario.library, fixture, ops, ctx);
        const right = await runRealInPage(browserCtx.page, scenario.library, fixture, ops, ctx);
        const comparators = compareRuns(left, right, fixture);
        const entry = {
          id: scenario.id, library: scenario.library, oracle: "real", oracleVersion: oracle.libraryVersion,
          verdict: overallVerdict(comparators), comparators,
        };
        const dev = deviations[scenario.id];
        if (dev) {
          // Recorded upstream deviation: both runs were compared up to the
          // triggering op; the op must have reproduced the symptom in both.
          const outcomes = [left.deviationOutcome, right.deviationOutcome];
          const reproduced = outcomes.every((o) => o && o.reproduced);
          comparators.deviation = reproduced
            ? { verdict: "pass", detail: `recorded symptom reproduced by op ${dev.op} in both runs` }
            : { verdict: "fail", detail: `recorded deviation ${dev.id} did not reproduce: ${outcomes.map((o) => (o ? o.observed : "op not reached")).join(" | ")}` };
          const where = dev.sources.map((src) => `${src.path}:${src.line}`).join(", ");
          if (overallVerdict(comparators) === "pass") {
            Object.assign(entry, { verdict: "deviation", deviation: dev.id, causeKind: "upstream-deviation",
              cause: `deviation ${dev.id}: ${dev.symptom} during ${dev.trigger} (${where}); both runs compared up to op ${dev.op}` });
          } else {
            Object.assign(entry, { verdict: "fail", deviation: dev.id, cause: comparators.deviation.verdict === "fail" ? comparators.deviation.detail : "runs differ before the recorded deviation" });
          }
        } else if (left.deviationOutcome || right.deviationOutcome) {
          throw new Error("internal: deviation outcome without a deviation entry");
        }
        if (left.warnings && left.warnings.length) entry.warnings = left.warnings;
        if (left.skippedOps && left.skippedOps.length) entry.skippedOps = left.skippedOps;
        const captureErrors = [left.pixelCaptureError, right.pixelCaptureError].filter(Boolean);
        if (captureErrors.length) comparators.pixels.detail = `${comparators.pixels.detail}; capture error: ${captureErrors[0]}`;
        if (left.opsLog) entry.opsApplied = left.opsLog.filter((o) => o.applied).map((o) => `${o.op}${o.flow ? `@flow${o.flow}` : ""}:${o.target || o.kind}`);
        if (dumpDir) {
          fs.mkdirSync(dumpDir, { recursive: true });
          fs.writeFileSync(path.join(dumpDir, `${scenario.id}.json`), JSON.stringify({ model: left.model, events: left.events, rightEvents: right.events, geometry: left.geometry, opsLog: left.opsLog }, null, 1));
        }
        record(scenario, entry);
        if (scenario.library === "xyflow") {
          xyflow.executed.push(scenario.id);
          const flows = (left.model && left.model.flows) || [];
          xyflow.outputs[scenario.id] = {
            modelSha256: crypto.createHash("sha256").update(canonicalString(left.model)).digest("hex"),
            flows: flows.map((st) => ({ nodes: (st.nodes || []).length, edges: (st.edges || []).length })),
            edgePaths: Object.keys((left.geometry && left.geometry.edgePaths) || {}).length,
            opsApplied: entry.opsApplied || [],
          };
        }
      } catch (err) {
        // A crashed or closed page must not poison the next scenarios:
        // relaunch the browser (this scenario still records its cause).
        if (/Page crashed|Target (page, context or browser )?closed|has been closed/i.test(String(err && err.message || err))) {
          try { await browserCtx.browser.close(); } catch { /* already gone */ }
          browserCtx.served.close();
          try { browserCtx = await launchHarnessBrowser(); } catch (e) { browserError = String(e && e.message || e); browserCtx = null; }
          const cause = `browser page crashed during ${scenario.id}: ${String(err && err.message || err).split("\n")[0].slice(0, 200)}`;
          record(scenario, unknownScenario(scenario, gate, cause, "run-error"));
          continue;
        }
        const errors = browserCtx.page.__pageErrors || [];
        const cause = `${String(err && err.message || err).split("\n")[0].slice(0, 300)}${errors.length ? ` [page error: ${errors[errors.length - 1]}]` : ""}`;
        if (/example-without-flow/.test(cause)) {
          // Nothing to compare in a flow harness: not applicable, not unknown.
          const declared = notApplicable[scenario.id];
          const observed = cause.replace(/^page\.evaluate: Error: /, "");
          record(scenario, { ...unknownScenario(scenario, gate, declared ? `${declared.cause} (observed: ${observed})` : observed, "example-without-flow"), verdict: "not-applicable" });
        } else {
          const kind = /example-error during/.test(cause) ? "example-error" : "run-error";
          record(scenario, unknownScenario(scenario, gate, cause, kind));
        }
      }
    }
  } finally {
    if (browserCtx) {
      await browserCtx.browser.close();
      browserCtx.served.close();
    }
  }
  return { results, xyflow };
}

export async function runRealSelftest() {
  const { runRealInPage } = await import("./runners.mjs");
  const fixture = loadFixture(path.join(HARNESS_ROOT, "fixtures", "jointjs", "basic.json"));
  const emptyOps = { schemaVersion: 1, id: "empty", steps: [] };
  const st = bundleStatus()["jointjs"];
  if (!st.built) return { unknown: st.cause };
  let chromeAvailable = true;
  try { const chrome = await import("./chrome.mjs"); chromeAvailable = !!chrome.findChrome(); } catch { chromeAvailable = false; }
  if (!chromeAvailable) return { unknown: "headless Chrome not found (CHROME_BIN/google-chrome/chromium absent); real oracles require a browser" };
  let ctx = null;
  try {
    ctx = await launchHarnessBrowser();
    if (ctx.oracleStatus && ctx.oracleStatus.jointjs === false) return { unknown: "bundle bundles/joint.js did not load in the harness page" };
    const base = await runRealInPage(ctx.page, "jointjs", fixture, emptyOps);
    if (!base.model || !Array.isArray(base.model.cells) || !base.model.cells.some((c) => c.position)) {
      return { unknown: "real JointJS run produced no elements (graph did not load the fixture)" };
    }
    if (!base.pixels || !base.pixels.data) {
      return { unknown: "real JointJS run produced no captured pixels (container screenshot unavailable)" };
    }
    // Pixel divergence is injected in the REAL rendering (C3): a second run
    // of the real @joint/core whose first cell fill is changed through the
    // library's own attr API at identical bounds. Mutating a buffer after
    // the fact would prove nothing about the rendered output.
    const firstCellId = fixture.input.cells.find((c) => c.position).id;
    const mutatedFixture = { ...fixture, renderMutation: { cellId: firstCellId, fill: "#ff0000" } };
    const mutated = await runRealInPage(ctx.page, "jointjs", mutatedFixture, emptyOps);
    if (!mutated.pixels || !mutated.pixels.data) {
      return { unknown: "mutated JointJS run produced no captured pixels" };
    }
    const result = divergenceSelftest(base, fixture, mutated);
    return { result };
  } catch (err) {
    return { unknown: String(err && err.message || err).split("\n")[0].slice(0, 300) };
  } finally {
    if (ctx) { await ctx.browser.close(); ctx.served.close(); }
  }
}

export function buildCoverage() {
  const inventories = {
    bpmn: loadInventory(path.join(WT_ROOT, "docs", "re", "bpmn-js-inventory.json")),
    xyflow: loadInventory(path.join(WT_ROOT, "docs", "re", "xyflow-inventory.json")),
    jointjs: loadInventory(path.join(WT_ROOT, "docs", "re", "jointjs-inventory.json")),
  };
  const scenarios = listScenarios(path.join(HARNESS_ROOT, "fixtures", "scenarios"));
  return { scenarios, report: coverageReport({ inventories, scenarios }) };
}

function writeReport(mode, report) {
  const dir = path.join(WT_ROOT, "docs", "re", "harness-runs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${mode}.json`);
  fs.writeFileSync(file, `${JSON.stringify(canonicalise(report), null, 2)}\n`);
  return file;
}

function gateReportBase(mode) {
  const versions = readOracleVersions();
  return { schemaVersion: 1, mode, seed: 42, oracle: "real", oracleVersions: versions };
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === "selftest") {
    const outcome = await runRealSelftest();
    if (outcome.unknown) {
      const report = { ...gateReportBase("selftest"),
        scenarios: [{ id: "jointjs-injected-divergences", library: "jointjs", oracle: "real", oracleVersion: gateOracle("jointjs").libraryVersion, verdict: "unknown", cause: outcome.unknown,
          comparators: { model: { verdict: "unknown", detail: outcome.unknown }, events: { verdict: "unknown", detail: outcome.unknown }, geometry: { verdict: "unknown", detail: outcome.unknown }, pixels: { verdict: "unknown", detail: outcome.unknown } } }] };
      const file = writeReport("selftest", report);
      console.log(`UNKNOWN jointjs-injected-divergences cause=${outcome.unknown}`);
      console.log(`report: ${path.relative(REPO_ROOT, file)} (oracle: real, verdict unknown — gate NOT green)`);
      process.exit(1);
    }
    const result = outcome.result;
    console.log(JSON.stringify(result, null, 2));
    const report = { ...gateReportBase("selftest"),
      scenarios: [{ id: "jointjs-injected-divergences", library: "jointjs", oracle: "real", oracleVersion: gateOracle("jointjs").libraryVersion, verdict: result.pass ? "pass" : "fail",
        comparators: Object.fromEntries(result.checks.map((c) => [c.comparator, { verdict: c.detected ? "pass" : "fail", detail: c.detected ? (c.detail || "injected divergence detected on real @joint/core output") : "NOT detected" }])) }] };
    const file = writeReport("selftest", report);
    console.log(`report: ${path.relative(REPO_ROOT, file)}`);
    let guard = { ok: true };
    try { assertGateReport(report, "selftest.json"); } catch (err) { guard = { ok: false, error: String(err.message || err) }; }
    console.log(`gate selftest: ${guard.ok ? "pass" : `FAIL — ${guard.error}`}`);
    process.exit(result.pass && guard.ok ? 0 : 1);
  }
  if (command === "coverage") {
    const strict = rest.includes("--strict");
    const { scenarios, report } = buildCoverage();
    console.log(`scenarios=${scenarios.length} exercisedIds=${report.exercisedCount}`);
    for (const [lib, r] of Object.entries(report.perLibrary)) {
      console.log(`${lib}: P0/P1 covered=${r.coveredP0P1}/${r.p0p1Total} missing=${r.missingP0P1}`);
    }
    const file = writeReport("coverage", { schemaVersion: 1, mode: "coverage", seed: 42, scenarios: [], coverage: report });
    console.log(`report: ${path.relative(REPO_ROOT, file)}`);
    if (strict && Object.values(report.perLibrary).some((r) => r.missingP0P1 > 0)) process.exit(1);
    return;
  }
  if (command === "run") {
    const fixtureErrors = validateFixtures();
    if (fixtureErrors.length) { console.error(fixtureErrors.join("\n")); process.exit(1); }
    const onlyArg = rest.find((a) => a.startsWith("--only="));
    const only = onlyArg ? onlyArg.slice("--only=".length) : null;
    const scenarios = listScenarios(path.join(HARNESS_ROOT, "fixtures", "scenarios")).filter((sc) => !only || sc.id.includes(only));
    const dumpArg = rest.find((a) => a.startsWith("--dump="));
    const { results, xyflow } = await runRealGates(scenarios, { dumpDir: only && dumpArg ? path.resolve(dumpArg.slice("--dump=".length)) : null });
    if (only) {
      // Partial run for iteration: printed, never archived as a gate report.
      for (const sc of results) console.log(JSON.stringify({ id: sc.id, verdict: sc.verdict, cause: sc.cause, warnings: sc.warnings, skippedOps: sc.skippedOps, comparators: sc.comparators }));
      process.exit(results.every((sc) => sc.verdict === "pass") ? 0 : 1);
    }
    const versions = readOracleVersions();
    // self-parity.json: bpmn-js and JointJS (strict gate); xyflow-examples.json:
    // the 93 examples (gate with the exclusions derived from deviations.json
    // and not-applicable.json).
    const report = { ...gateReportBase("self-parity"), browser: "headless-chrome", oracleVersions: versions,
      candidate: { bpmn: CANDIDATE_STATUS.bpmn, jointjs: CANDIDATE_STATUS.jointjs },
      scenarios: results.filter((s) => s.library !== "xyflow") };
    const file = writeReport("self-parity", report);
    const xyReport = { ...gateReportBase("xyflow-examples"), browser: "headless-chrome", oracleVersions: versions,
      candidate: { xyflow: CANDIDATE_STATUS.xyflow },
      scenarios: results.filter((s) => s.library === "xyflow"),
      xyflow: { executed: xyflow.executed, failed: xyflow.failed, excluded: xyflow.excluded, outputs: xyflow.outputs } };
    const xyFile = writeReport("xyflow-examples", xyReport);
    for (const s of results) {
      const comp = s.comparators;
      const compText = Object.entries(comp).map(([k, v]) => `${k}=${v.verdict}`).join(" ");
      console.log(`${s.verdict.toUpperCase()} ${s.id} oracle=real version=${s.oracleVersion} ${compText}${s.cause ? ` cause=${s.cause}` : ""}${s.warnings ? ` warnings=${s.warnings.length}` : ""}`);
    }
    const failed = results.filter((s) => s.verdict === "fail");
    const unknown = results.filter((s) => s.verdict === "unknown");
    const excluded = results.filter((s) => s.verdict === "deviation" || s.verdict === "not-applicable");
    const byLib = {};
    for (const s of results) {
      byLib[s.library] = byLib[s.library] || { pass: 0, fail: 0, unknown: 0, deviation: 0, "not-applicable": 0 };
      byLib[s.library][s.verdict] += 1;
    }
    for (const [lib, c] of Object.entries(byLib)) console.log(`${lib}: pass=${c.pass} fail=${c.fail} unknown=${c.unknown} deviation=${c.deviation} not-applicable=${c["not-applicable"]}`);
    console.log(`scenarios=${results.length} pass=${results.length - failed.length - unknown.length - excluded.length} fail=${failed.length} unknown=${unknown.length} excluded=${excluded.length} oracle=real`);
    for (const e of excluded) console.log(`  excluded ${e.id}: ${e.verdict} — ${e.cause}`);
    // The gate command applies the SAME strict guards as the unit suite:
    // self-parity.json through assertGateReport; xyflow-examples.json
    // through assertXyflowExamplesReport with the exclusion list derived
    // from deviations.json and not-applicable.json. Any drift (a deviation
    // that disappears or changes, an unexpected not-applicable, an unknown,
    // a fail) exits non-zero.
    const gates = checkGates(report, xyReport);
    for (const [name, g] of Object.entries(gates)) console.log(`gate ${name}: ${g.ok ? "pass" : `FAIL — ${g.error}`}`);
    console.log(`report: ${path.relative(REPO_ROOT, file)}`);
    console.log(`report: ${path.relative(REPO_ROOT, xyFile)}`);
    process.exit(Object.values(gates).every((g) => g.ok) ? 0 : 1);
  }
  console.error("usage: harness.mjs run | selftest | coverage [--strict]");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
