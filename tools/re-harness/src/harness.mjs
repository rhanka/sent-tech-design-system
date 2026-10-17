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
import { BUNDLES_DIR, WT_ROOT, REPO_ROOT, EXPECTED_VERSIONS, bundleStatus, gateOracle, readOracleVersions } from "./oracles.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(HERE, "..");

export const GATE_REPORT_FILES = ["self-parity.json", "xyflow-examples.json", "selftest.json"];

// An `unknown` scenario is acceptable in an archived gate report only when
// its cause belongs to the FIXTURE (an example that cannot be extracted
// mechanically). Infrastructure causes (missing bundle, no browser, launch
// failure, run error) make the archived report invalid.
export const ACCEPTED_UNKNOWN_KIND = "fixture-extraction";

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

// Classification of an archived gate report: "pass" when the strict guard
// accepts it; "unknown" when every non-pass scenario is an explicit
// unknown whose cause is the fixture itself (an example that cannot be
// extracted mechanically) and at least one scenario passed; otherwise
// "invalid" (failures, infrastructure unknowns, skipped ops, drift).
// An "unknown" gate is NOT green: it is reported as unknown with causes.
export function classifyGateReport(report, label = "report") {
  try {
    assertGateReport(report, label);
    return { status: "pass", problems: [] };
  } catch (err) {
    const problems = [];
    const schemaErrors = validateAgainstSchema(report, readJson(schemaPath("report.schema.json")), label);
    if (schemaErrors.length) problems.push(...schemaErrors);
    if (report.oracle !== "real") problems.push(`${label}: oracle is not real`);
    if (canonicalString(report.oracleVersions || {}) !== canonicalString(EXPECTED_VERSIONS)) problems.push(`${label}: oracleVersions drift`);
    const scenarios = Array.isArray(report.scenarios) ? report.scenarios : [];
    if (!scenarios.some((sc) => sc.verdict === "pass")) problems.push(`${label}: no scenario passed`);
    for (const sc of scenarios) {
      if (sc.oracle !== "real") problems.push(`${label}: ${sc.id} oracle is not real`);
      if (Array.isArray(sc.skippedOps) && sc.skippedOps.length) problems.push(`${label}: ${sc.id} skipped operations`);
      if (sc.verdict === "pass") continue;
      if (sc.verdict !== "unknown" || sc.causeKind !== ACCEPTED_UNKNOWN_KIND || !sc.cause) {
        problems.push(`${label}: ${sc.id} is ${sc.verdict}${sc.causeKind ? ` (${sc.causeKind})` : ""}${sc.cause ? `: ${sc.cause}` : ""}`);
      }
    }
    return { status: problems.length ? "invalid" : "unknown", problems, guardError: String(err.message || err) };
  }
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
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
function jointFamilies(graphJson) {
  const out = {};
  for (const cell of (graphJson && graphJson.cells) || []) {
    if (!cell.source || !cell.target) continue;
    if (cell.router && cell.router.name) out[cell.id] = `routers.${cell.router.name}`;
    else if (cell.connector && cell.connector.name) out[cell.id] = `connectors.${cell.connector.name}`;
  }
  return out;
}

function compareRuns(left, right, fixture) {
  const correspondence = fixture.idCorrespondence || {};
  const geometryOptions = fixture.library === "xyflow"
    ? { tolerancePx: XYFLOW_GEOMETRY_TOLERANCE_PX, viewboxTolerance: XYFLOW_GEOMETRY_TOLERANCE_PX }
    : fixture.library === "jointjs" ? { familyById: jointFamilies(left.model) } : {};
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
export function divergenceSelftest(base, fixture) {
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
  const mutatedPixels = clone(base);
  mutatedPixels.pixels = { width: base.pixels.width, height: base.pixels.height, data: base.pixels.data.map(() => 0) };
  checks.push({ comparator: "pixels", detected: comparePixels(base.pixels, mutatedPixels.pixels, fixture.pixelThreshold).verdict === "fail" });
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
        const base = path.basename(name);
        const candidate = path.join(BUNDLES_DIR, base);
        if (candidate.startsWith(BUNDLES_DIR)) file = candidate;
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

export async function runRealGates(scenarios, { dumpDir = null } = {}) {
  const { runRealInPage } = await import("./runners.mjs");
  const statuses = bundleStatus();
  const results = [];
  const xyflow = { executed: [], failed: [], outputs: {} };
  let browserCtx = null;
  let browserError = null;
  let chromeAvailable = true;
  try {
    const chrome = await import("./chrome.mjs");
    chromeAvailable = !!chrome.findChrome();
  } catch { chromeAvailable = false; }

  const needsBrowser = scenarios.some((s) => statuses[s.library === "xyflow" ? (s.id.includes("svelte") ? "xyflow-svelte" : "xyflow-react") : s.library === "jointjs" ? "jointjs" : "bpmn"]?.built);
  if (needsBrowser && chromeAvailable) {
    try {
      browserCtx = await launchHarnessBrowser();
    } catch (err) {
      browserCtx = null;
      browserError = String(err && err.message || err);
    }
  }

  try {
    for (const scenario of scenarios) {
      const gate = scenario.library === "xyflow"
        ? (scenario.id.includes("svelte") ? "xyflow-svelte" : "xyflow-react")
        : scenario.library === "jointjs" ? "jointjs" : "bpmn";
      const st = statuses[gate];
      const oracle = gateOracle(gate);
      if (!st.built) {
        const entry = unknownScenario(scenario, gate, st.cause);
        results.push(entry);
        if (scenario.library === "xyflow") xyflow.failed.push({ id: scenario.id, cause: st.cause });
        continue;
      }
      if (!chromeAvailable) {
        const entry = unknownScenario(scenario, gate, "headless Chrome not found (CHROME_BIN/google-chrome/chromium absent); real oracles require a browser");
        results.push(entry);
        if (scenario.library === "xyflow") xyflow.failed.push({ id: scenario.id, cause: entry.cause });
        continue;
      }
      if (!browserCtx) {
        const entry = unknownScenario(scenario, gate, `browser launch failed: ${browserError || "unknown error"}`);
        results.push(entry);
        if (scenario.library === "xyflow") xyflow.failed.push({ id: scenario.id, cause: entry.cause });
        continue;
      }
      // The bundle exists on disk; make sure it actually loaded in the page.
      const statusKey = gate === "bpmn" ? "bpmn" : gate === "jointjs" ? "jointjs" : gate === "xyflow-svelte" ? "xyflowSvelte" : "xyflowReact";
      if (browserCtx.oracleStatus && browserCtx.oracleStatus[statusKey] === false) {
        const entry = unknownScenario(scenario, gate, `bundle bundles/${st.bundle.split("/").pop()} did not load in the harness page`);
        results.push(entry);
        if (scenario.library === "xyflow") xyflow.failed.push({ id: scenario.id, cause: entry.cause });
        continue;
      }
      const fixture = loadFixture(fixturePathFor(scenario));
      const ops = loadOps(opsPathFor(scenario));
      // A fixture whose example graph could not be extracted mechanically
      // is `unknown` with its cause (C1) — never run, never green.
      if (fixture.extraction && fixture.extraction.status === "unknown") {
        const cause = fixture.extraction.cause || "example graph not mechanically extractable";
        const entry = unknownScenario(scenario, gate, cause, ACCEPTED_UNKNOWN_KIND);
        results.push(entry);
        if (scenario.library === "xyflow") xyflow.failed.push({ id: scenario.id, cause });
        continue;
      }
      try {
        await browserCtx.page.goto(browserCtx.served.url);
        const left = await runRealInPage(browserCtx.page, scenario.library, fixture, ops);
        const right = await runRealInPage(browserCtx.page, scenario.library, fixture, ops);
        const comparators = compareRuns(left, right, fixture);
        const entry = {
          id: scenario.id, library: scenario.library, oracle: "real", oracleVersion: oracle.libraryVersion,
          verdict: overallVerdict(comparators), comparators,
        };
        if (left.warnings && left.warnings.length) entry.warnings = left.warnings;
        if (left.skippedOps && left.skippedOps.length) entry.skippedOps = left.skippedOps;
        if (dumpDir) {
          fs.mkdirSync(dumpDir, { recursive: true });
          fs.writeFileSync(path.join(dumpDir, `${scenario.id}.json`), JSON.stringify({ model: left.model, events: left.events, geometry: left.geometry }, null, 1));
        }
        results.push(entry);
        if (scenario.library === "xyflow") {
          xyflow.executed.push(scenario.id);
          xyflow.outputs[scenario.id] = { model: left.model, geometry: left.geometry, viewport: left.viewport };
        }
      } catch (err) {
        const cause = String(err && err.message || err).split("\n")[0].slice(0, 300);
        const entry = unknownScenario(scenario, gate, cause, "run-error");
        results.push(entry);
        if (scenario.library === "xyflow") xyflow.failed.push({ id: scenario.id, cause });
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
    const result = divergenceSelftest(base, fixture);
    const pixelCheck = result.checks.find((c) => c.comparator === "pixels");
    if (pixelCheck) {
      pixelCheck.detected = comparePixels(base.pixels, mutated.pixels, fixture.pixelThreshold).verdict === "fail";
      pixelCheck.detail = "fill mutation through the real @joint/core attr API, captured by container screenshot";
    }
    result.pass = result.checks.every((c) => c.detected) && Object.values(result.control).every((v) => v === "pass");
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
    process.exit(result.pass ? 0 : 1);
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
    const report = { ...gateReportBase("self-parity"), browser: "headless-chrome", oracleVersions: versions, candidate: CANDIDATE_STATUS, scenarios: results };
    const file = writeReport("self-parity", report);
    const xyReport = { ...gateReportBase("self-parity"), browser: "headless-chrome", oracleVersions: versions,
      candidate: { xyflow: CANDIDATE_STATUS.xyflow },
      scenarios: results.filter((s) => s.library === "xyflow"),
      xyflow: { executed: xyflow.executed, failed: xyflow.failed, outputs: xyflow.outputs } };
    const xyFile = writeReport("xyflow-examples", xyReport);
    for (const s of results) {
      const comp = s.comparators;
      const compText = Object.entries(comp).map(([k, v]) => `${k}=${v.verdict}`).join(" ");
      console.log(`${s.verdict.toUpperCase()} ${s.id} oracle=real version=${s.oracleVersion} ${compText}${s.cause ? ` cause=${s.cause}` : ""}${s.warnings ? ` warnings=${s.warnings.length}` : ""}`);
    }
    const failed = results.filter((s) => s.verdict === "fail");
    const unknown = results.filter((s) => s.verdict === "unknown");
    const byLib = {};
    for (const s of results) { byLib[s.library] = byLib[s.library] || { pass: 0, fail: 0, unknown: 0 }; byLib[s.library][s.verdict] += 1; }
    for (const [lib, c] of Object.entries(byLib)) console.log(`${lib}: pass=${c.pass} fail=${c.fail} unknown=${c.unknown}`);
    console.log(`scenarios=${results.length} pass=${results.length - failed.length - unknown.length} fail=${failed.length} unknown=${unknown.length} oracle=real`);
    if (xyflow.failed.length) {
      console.log(`xyflow not executed (${xyflow.failed.length}):`);
      for (const f of xyflow.failed) console.log(`  ${f.id}: ${f.cause}`);
    } else {
      console.log(`xyflow executed=${xyflow.executed.length} failed=0`);
    }
    console.log(`report: ${path.relative(REPO_ROOT, file)}`);
    console.log(`report: ${path.relative(REPO_ROOT, xyFile)}`);
    process.exit(failed.length || unknown.length ? 1 : 0);
  }
  console.error("usage: harness.mjs run | selftest | coverage [--strict]");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
