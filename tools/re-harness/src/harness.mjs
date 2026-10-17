// RE harness CLI (Lot L0, real-oracle correction). Usage:
//   node tools/re-harness/src/harness.mjs run               # real gates in headless Chrome
//   node tools/re-harness/src/harness.mjs run --synthetic   # offline comparator determinism (NOT a gate)
//   node tools/re-harness/src/harness.mjs selftest          # JointJS real-output divergence gate
//   node tools/re-harness/src/harness.mjs selftest --synthetic
//   node tools/re-harness/src/harness.mjs coverage [--strict]
//
// Gate reports (docs/re/harness-runs/self-parity.json, xyflow-examples.json,
// selftest.json) always carry oracle: "real" with the library version read
// from the oracle's own package.json. When a real oracle cannot run, its
// gate is `unknown` with the cause — never green, never silently replaced
// by the synthetic engines. Synthetic runs write synthetic-*.json reports
// stamped oracle: "synthetic"; they never count for a gate.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels } from "./comparators.mjs";
import { validateAgainstSchema } from "./validate.mjs";
import { runSyntheticEngine } from "./synthetic-engines.mjs";
import { coverageReport, loadInventory, listScenarios } from "./coverage.mjs";
import { canonicalise } from "./canonical.mjs";
import { BUNDLES_DIR, bundleStatus, gateOracle, readOracleVersions } from "./oracles.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(HERE, "..");
const WT_ROOT = path.resolve(HARNESS_ROOT, "..", "..");
const REPO_ROOT = path.resolve(WT_ROOT, "..");

export const GATE_REPORT_FILES = ["self-parity.json", "xyflow-examples.json", "selftest.json"];

// Gate guard: a gate report is valid only when produced by the real
// oracle. The test suite fails on any gate report stamped otherwise.
export function assertGateReport(report, label = "report") {
  if (!report || typeof report !== "object") throw new Error(`${label}: not an object`);
  if (report.oracle !== "real") {
    throw new Error(`${label}: gate report carries oracle=${JSON.stringify(report.oracle)} instead of "real"`);
  }
  for (const scenario of report.scenarios || []) {
    if (scenario.oracle !== undefined && scenario.oracle !== "real") {
      throw new Error(`${label}: scenario ${scenario.id} carries oracle=${JSON.stringify(scenario.oracle)} instead of "real"`);
    }
  }
  return true;
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
    } else if (doc.steps && doc.id && !doc.model) {
      errors.push(...validateAgainstSchema(doc, opsSchema, rel).map((e) => `${rel}: ${e}`));
    } else {
      errors.push(...validateAgainstSchema(doc, modelSchema, rel).map((e) => `${rel}: ${e}`));
    }
  }
  return errors;
}

function loadFixture(fixturePath) { return readJson(fixturePath); }
function loadOps(opsPath) {
  return opsPath && fs.existsSync(opsPath) ? readJson(opsPath) : { schemaVersion: 1, id: "empty", steps: [] };
}
function fixturePathFor(scenario) { return path.join(HARNESS_ROOT, "fixtures", scenario.fixtures[0]); }
function opsPathFor(scenario) { return scenario.ops ? path.join(HARNESS_ROOT, "fixtures", scenario.ops) : null; }

function compareRuns(left, right, fixture) {
  const comparators = {
    model: compareModel(left.model, right.model),
    events: compareEvents(left.events, right.events, fixture.idCorrespondence || {}),
    geometry: compareGeometry(left.geometry, right.geometry),
    pixels: comparePixels(left.pixels, right.pixels, fixture.pixelThreshold || {}),
  };
  // bpmn-js additionally proves its serialised form is stable across the
  // two independent runs (saveXML captured by the adapter).
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

// ---------------------------------------------------------- synthetic runs
// Offline only: the synthetic engines against themselves. Reports are
// stamped oracle: "synthetic" and never count for a gate.
export async function runSyntheticParity(scenarios) {
  const out = [];
  for (const scenario of scenarios) {
    const fixture = loadFixture(fixturePathFor(scenario));
    const ops = loadOps(opsPathFor(scenario));
    const a = runSyntheticEngine(fixture, ops);
    const b = runSyntheticEngine(fixture, ops);
    const comparators = compareRuns(a, b, fixture);
    out.push({ id: scenario.id, library: scenario.library, oracle: "synthetic", verdict: overallVerdict(comparators), comparators });
  }
  return out;
}

export function runSyntheticSelftest() {
  const fixture = { schemaVersion: 1, id: "selftest", library: "jointjs", kind: "jointjs-graph",
    model: { elements: [{ id: "a", type: "rect", x: 10, y: 20, width: 100, height: 50, label: "A" }], flows: [] },
    pixelThreshold: { maxMismatchRatio: 0.01, perChannelDelta: 8 } };
  const base = runSyntheticEngine(fixture, { schemaVersion: 1, id: "t", steps: [] });
  return divergenceSelftest(base, fixture, "synthetic");
}

// Injected divergences must be detected on every comparator. `base` is a
// real (or, for the synthetic variant, synthetic) run output; the caller
// stamps the report with the matching oracle kind.
export function divergenceSelftest(base, fixture, oracleKind) {
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const checks = [];
  const mutatedModel = clone(base); mutatedModel.model.elements[0].x = 999;
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
  return { oracle: oracleKind, checks, control, pass: checks.every((c) => c.detected) && Object.values(control).every((v) => v === "pass") };
}

// Backwards-compatible name used by the unit tests for the synthetic
// comparator selftest (oracle: "synthetic", never a gate).
export function runSelftest() {
  return runSyntheticSelftest();
}

// -------------------------------------------------------------- browser IO
function findUpward(rel) {
  let dir = HARNESS_ROOT;
  for (let i = 0; i < 8; i += 1) {
    const candidate = path.join(dir, rel);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
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
function unknownScenario(scenario, gate, cause) {
  const oracle = gateOracle(gate);
  return {
    id: scenario.id, library: scenario.library, oracle: "real", oracleVersion: oracle.libraryVersion,
    verdict: "unknown", cause,
    comparators: {
      model: { verdict: "unknown", detail: cause },
      events: { verdict: "unknown", detail: cause },
      geometry: { verdict: "unknown", detail: cause },
      pixels: { verdict: "unknown", detail: cause },
    },
  };
}

export async function runRealGates(scenarios) {
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
        results.push(entry);
        if (scenario.library === "xyflow") {
          xyflow.executed.push(scenario.id);
          xyflow.outputs[scenario.id] = { model: left.model, geometry: left.geometry, viewport: left.viewport };
        }
      } catch (err) {
        const cause = String(err && err.message || err).split("\n")[0].slice(0, 300);
        const entry = unknownScenario(scenario, gate, cause);
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
  const fixture = loadFixture(path.join(HARNESS_ROOT, "fixtures", "jointjs", "basic.f1.json"));
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
    if (!base.model || !base.model.elements || !base.model.elements.length) {
      return { unknown: "real JointJS run produced no elements (graph did not load the fixture)" };
    }
    return { result: divergenceSelftest(base, fixture, "real") };
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
  const synthetic = rest.includes("--synthetic");
  if (command === "selftest") {
    if (synthetic) {
      const result = runSyntheticSelftest();
      console.log(JSON.stringify(result, null, 2));
      const report = { schemaVersion: 1, mode: "selftest", seed: 42, oracle: "synthetic",
        scenarios: [{ id: "synthetic-injected-divergences", oracle: "synthetic", verdict: result.pass ? "pass" : "fail",
          comparators: Object.fromEntries(result.checks.map((c) => [c.comparator, { verdict: c.detected ? "pass" : "fail", detail: c.detected ? "injected divergence detected (synthetic base)" : "NOT detected" }])) }] };
      const file = writeReport("synthetic-selftest", report);
      console.log(`report: ${path.relative(REPO_ROOT, file)} (oracle: synthetic — never a gate)`);
      process.exit(result.pass ? 0 : 1);
    }
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
        comparators: Object.fromEntries(result.checks.map((c) => [c.comparator, { verdict: c.detected ? "pass" : "fail", detail: c.detected ? "injected divergence detected on real @joint/core output" : "NOT detected" }])) }] };
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
    const scenarios = listScenarios(path.join(HARNESS_ROOT, "fixtures", "scenarios"));
    if (synthetic) {
      const results = await runSyntheticParity(scenarios);
      const report = { schemaVersion: 1, mode: "self-parity", seed: 42, oracle: "synthetic", scenarios: results };
      const file = writeReport("synthetic-self-parity", report);
      for (const s of results) console.log(`${s.verdict.toUpperCase()} ${s.id} model=${s.comparators.model.verdict} events=${s.comparators.events.verdict} geometry=${s.comparators.geometry.verdict} pixels=${s.comparators.pixels.verdict}`);
      const failed = results.filter((s) => s.verdict === "fail");
      console.log(`scenarios=${results.length} pass=${results.length - failed.length} fail=${failed.length} oracle=synthetic`);
      console.log(`report: ${path.relative(REPO_ROOT, file)} (oracle: synthetic — never a gate)`);
      process.exit(failed.length ? 1 : 0);
    }
    const { results, xyflow } = await runRealGates(scenarios);
    const versions = readOracleVersions();
    const report = { ...gateReportBase("self-parity"), browser: "headless-chrome", oracleVersions: versions, scenarios: results };
    const file = writeReport("self-parity", report);
    const xyReport = { ...gateReportBase("self-parity"), browser: "headless-chrome", oracleVersions: versions,
      scenarios: results.filter((s) => s.library === "xyflow"),
      xyflow: { executed: xyflow.executed, failed: xyflow.failed, outputs: xyflow.outputs } };
    const xyFile = writeReport("xyflow-examples", xyReport);
    for (const s of results) {
      const comp = s.comparators;
      console.log(`${s.verdict.toUpperCase()} ${s.id} oracle=real version=${s.oracleVersion} model=${comp.model.verdict} events=${comp.events.verdict} geometry=${comp.geometry.verdict} pixels=${comp.pixels.verdict}${s.cause ? ` cause=${s.cause}` : ""}`);
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
  console.error("usage: harness.mjs run [--synthetic] | selftest [--synthetic] | coverage [--strict]");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
