// RE harness CLI (task L0). Usage:
//   node tools/re-harness/src/harness.mjs run [--browser] [--out <file>]
//   node tools/re-harness/src/harness.mjs selftest
//   node tools/re-harness/src/harness.mjs coverage [--strict]
// Verdict vocabulary: pass/fail per comparator; `covered` is reserved for
// green candidate-against-reference verdicts and is never emitted at L0
// (the candidate is a stub). Self-parity green is reported as `pass` in
// mode `self-parity`, not as coverage.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareModel, compareEvents, compareGeometry, comparePixels } from "./comparators.mjs";
import { validateAgainstSchema } from "./validate.mjs";
import { runEngine } from "./engines.mjs";
import { coverageReport, loadInventory, listScenarios } from "./coverage.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = path.resolve(HERE, "..");
const WT_ROOT = path.resolve(HARNESS_ROOT, "..", "..");
const REPO_ROOT = path.resolve(WT_ROOT, "..");

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

function fixturePathFor(scenario) {
  return path.join(HARNESS_ROOT, "fixtures", scenario.fixtures[0]);
}
function opsPathFor(scenario) {
  return scenario.ops ? path.join(HARNESS_ROOT, "fixtures", scenario.ops) : null;
}

function compareRuns(left, right, fixture) {
  return {
    model: compareModel(left.model, right.model),
    events: compareEvents(left.events, right.events, fixture.idCorrespondence || {}),
    geometry: compareGeometry(left.geometry, right.geometry),
    pixels: comparePixels(left.pixels, right.pixels, fixture.pixelThreshold || {}),
  };
}
function overallVerdict(comparators) {
  const vs = Object.values(comparators).map((c) => c.verdict);
  if (vs.includes("fail")) return "fail";
  if (vs.every((v) => v === "pass" || v === "unknown")) return "pass";
  return "pass";
}

// Node mode: reference engine played against itself (two independent runs).
export async function runSelfParityNode(scenarios) {
  const out = [];
  for (const scenario of scenarios) {
    const fixture = loadFixture(fixturePathFor(scenario));
    const ops = loadOps(opsPathFor(scenario));
    const a = runEngine(fixture, ops);
    const b = runEngine(fixture, ops);
    const comparators = compareRuns(a, b, fixture);
    out.push({ id: scenario.id, verdict: overallVerdict(comparators), comparators });
  }
  return out;
}

// Browser mode: same comparison, but each side is evaluated in a fresh
// headless-Chrome page (determinism bootstrap + backing-store pixels).
export async function runSelfParityBrowser(scenarios) {
  const pwPath = findUpward("node_modules/playwright-core/package.json");
  const ppPath = findUpward("node_modules/puppeteer-core/package.json");
  let playwrightCore = null; let puppeteerCore = null;
  if (pwPath) playwrightCore = await import(pathToFile(pwPath.replace(/package\.json$/, "index.mjs")));
  else if (ppPath) puppeteerCore = await import(pathToFile(ppPath.replace(/package\.json$/, "lib/esm/puppeteer/puppeteer-core.js"))).catch(() => null);
  const { launchBrowser, DETERMINISM_INIT } = await import("./chrome.mjs");
  const { runInPage } = await import("./runners.mjs");
  const served = await serveHarnessPage();
  const { browser, page, kind } = await launchBrowser({ playwrightCore, puppeteerCore });
  const out = [];
  try {
    if (kind === "playwright-core") await page.addInitScript(DETERMINISM_INIT);
    else await page.evaluateOnNewDocument(DETERMINISM_INIT);
    await page.goto(served.url);
    await page.waitForFunction(() => window.__harnessReady !== undefined);
    for (const scenario of scenarios) {
      const fixture = loadFixture(fixturePathFor(scenario));
      const ops = loadOps(opsPathFor(scenario));
      const a = await runInPage(page, fixture, ops);
      const b = await runInPage(page, fixture, ops);
      const comparators = compareRuns(a, b, fixture);
      out.push({ id: scenario.id, verdict: overallVerdict(comparators), comparators });
    }
  } finally {
    await browser.close();
    served.close();
  }
  return { scenarios: out, browserKind: kind };
}

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

function serveHarnessPage() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const name = (req.url || "/").split("?")[0];
      const file = name === "/" || name === "/harness-page.html"
        ? path.join(HARNESS_ROOT, "harness-page.html") : null;
      if (!file || !fs.existsSync(file)) { res.writeHead(404).end("not found"); return; }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${server.address().port}/harness-page.html`, close: () => server.close() }));
  });
}

// Selftest: injected divergences must be detected on every comparator
// (SPEC_RE_JOINTJS_PARITY.md §6 Lot 0 gate). Pure Node, no browser.
export function runSelftest() {
  const fixture = { schemaVersion: 1, id: "selftest", library: "jointjs", kind: "jointjs-graph",
    model: { elements: [{ id: "a", type: "rect", x: 10, y: 20, width: 100, height: 50, label: "A" }], flows: [] },
    pixelThreshold: { maxMismatchRatio: 0.01, perChannelDelta: 8 } };
  const base = runEngine(fixture, { schemaVersion: 1, id: "t", steps: [] });
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const checks = [];
  const mutatedModel = clone(base); mutatedModel.model.elements[0].x = 999;
  checks.push({ comparator: "model", detected: compareModel(base.model, mutatedModel.model).verdict === "fail" });
  const mutatedGeo = clone(base); mutatedGeo.geometry.bounds.a.x += 50;
  checks.push({ comparator: "geometry", detected: compareGeometry(base.geometry, mutatedGeo.geometry).verdict === "fail" });
  const mutatedEvents = clone(base); mutatedEvents.events = [{ name: "bogus.injected", payload: { elementId: "a" } }];
  checks.push({ comparator: "events", detected: compareEvents(base.events, mutatedEvents.events).verdict === "fail" });
  const mutatedPixels = clone(base);
  mutatedPixels.pixels = { width: base.pixels.width, height: base.pixels.height, data: base.pixels.data.map(() => 0) };
  checks.push({ comparator: "pixels", detected: comparePixels(base.pixels, mutatedPixels.pixels, fixture.pixelThreshold).verdict === "fail" });
  // Control: identical runs must pass on all four (no false positives).
  const control = {
    model: compareModel(base.model, clone(base).model).verdict,
    geometry: compareGeometry(base.geometry, clone(base).geometry).verdict,
    events: compareEvents(base.events, clone(base).events).verdict,
    pixels: comparePixels(base.pixels, clone(base).pixels, fixture.pixelThreshold).verdict,
  };
  return { checks, control, pass: checks.every((c) => c.detected) && Object.values(control).every((v) => v === "pass") };
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

function writeReport(mode, scenarios, extra = {}) {
  const report = { schemaVersion: 1, mode, seed: 42, ...extra, scenarios };
  const dir = path.join(WT_ROOT, "docs", "re", "harness-runs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${mode}.json`);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
  return { report, file };
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === "selftest") {
    const result = runSelftest();
    console.log(JSON.stringify(result, null, 2));
    const { file } = writeReport("selftest", [{ id: "injected-divergences", verdict: result.pass ? "pass" : "fail", comparators: Object.fromEntries(result.checks.map((c) => [c.comparator, { verdict: c.detected ? "pass" : "fail", detail: c.detected ? "injected divergence detected" : "NOT detected" }])) }]);
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
    const { file } = writeReport("coverage", [], { coverage: report });
    console.log(`report: ${path.relative(REPO_ROOT, file)}`);
    if (strict && Object.values(report.perLibrary).some((r) => r.missingP0P1 > 0)) process.exit(1);
    return;
  }
  if (command === "run") {
    const fixtureErrors = validateFixtures();
    if (fixtureErrors.length) { console.error(fixtureErrors.join("\n")); process.exit(1); }
    const scenarios = listScenarios(path.join(HARNESS_ROOT, "fixtures", "scenarios"));
    const useBrowser = rest.includes("--browser");
    let results; let browserKind = "node (no browser)";
    if (useBrowser) {
      const r = await runSelfParityBrowser(scenarios);
      results = r.scenarios; browserKind = r.browserKind;
    } else {
      results = await runSelfParityNode(scenarios);
    }
    const { report, file } = writeReport("self-parity", results, { browser: browserKind });
    for (const s of results) console.log(`${s.verdict.toUpperCase()} ${s.id} model=${s.comparators.model.verdict} events=${s.comparators.events.verdict} geometry=${s.comparators.geometry.verdict} pixels=${s.comparators.pixels.verdict}`);
    const failed = results.filter((s) => s.verdict === "fail");
    console.log(`scenarios=${results.length} pass=${results.length - failed.length} fail=${failed.length} browser=${browserKind}`);
    console.log(`report: ${path.relative(REPO_ROOT, file)}`);
    process.exit(failed.length ? 1 : 0);
  }
  console.error("usage: harness.mjs run [--browser] | selftest | coverage [--strict]");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
