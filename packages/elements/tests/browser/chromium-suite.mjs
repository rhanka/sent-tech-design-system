/**
 * AC-L2 Chromium suite (§15, json-render standard): the built browser bundle
 * under test — real Chromium via puppeteer-core, offline, local HTTP server.
 *
 * RED state: the suite fails before the elements browser build exists,
 * because `npm run build:browser -w @sentropic/design-system-elements` is
 * the script that produces it (spec §6.2; the artifacts guard in
 * scripts/elements-browser-artifacts.test.mjs pins the same RED). Run with:
 *
 *   node packages/elements/tests/browser/chromium-suite.mjs
 *
 * Pages (all served by the embedded server, all offline):
 *
 *   pilot.html   — the three elements under the MCP Apps default CSP plus
 *                  the pilot asset rule (§6.4): st-bar-chart through the
 *                  property channel AND the data island, the P-DATA fixtures
 *                  1–5, st-decision-dossier, st-bpmn-canvas, an invalid
 *                  envelope (error panel), and the reference Svelte BarChart
 *                  mounts for parity + the attribute-level SVG diff (§11.3).
 *                  Asserts zero console errors (except the recorded offline
 *                  jsDelivr asset degradation) and zero CSP violations.
 *   no-bpmn.html — only st-bar-chart: the bpmn-canvas and focus engine chunks
 *                  are never requested (§6.6 lazy boundary witness).
 *   theme.html   — hostConfig island selects `forge`: the theme id comes
 *                  from hostConfig, never the envelope (§6.3/§6.5), and the
 *                  scoped sheet applies inside the shadow root.
 *   strict.html  — strict CSP (no 'unsafe-inline'): the §6.4 strict row is
 *                  MEASURED (Svelte's injected <style> is refused; the
 *                  wrapper's constructable-stylesheet fallback is asserted).
 *   artifact.html — the Claude Code artifact row, offline simulation: the
 *                  CSP allowlist permits only jsDelivr /npm/ scripts, so the
 *                  local bundle is refused; recorded as not-measurable-
 *                  offline (the real row needs the published package, L7a).
 *
 * No network leaves the machine: jsDelivr requests are intercepted and
 * aborted, then recorded as the expected pilot asset degradation (U-12).
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { join } = path;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.resolve(HERE, "..", "..");
const WORKTREE_ROOT = path.resolve(PACKAGE_DIR, "..", "..");
const BROWSER_DIST = join(PACKAGE_DIR, "dist", "browser");
const FIXTURES = join(PACKAGE_DIR, "tests", "fixtures");
const THEMES_CSS = path.resolve(WORKTREE_ROOT, "packages", "themes", "css");
const BAR_CHART_SOURCE = path.resolve(WORKTREE_ROOT, "packages", "components-svelte", "src", "lib", "BarChart.svelte");
const ELEMENTS_ENTRY = join(BROWSER_DIST, "elements.js");
const PDATA_FIXTURES = [1, 2, 3, 4, 5].map((n) => `bar-chart-pdata-${n}.json`);

/**
 * §6.4 pilot CSP: the MCP Apps default (MCPA:276-285 — a `ui://` document
 * has no network origin, so scripts and styles rely on 'unsafe-inline')
 * adapted to this suite's real HTTP origin ('self' for the local bundle and
 * the theme stylesheet) plus the pilot asset rule (U-12): only
 * `https://cdn.jsdelivr.net` for fonts and images, so the BPMN canvas's
 * asset requests are the recorded degradation. `connect-src 'self'` is the
 * DRIVER's channel — the fetch that feeds the property channel — never the
 * element's: nothing in the bundle fetches.
 */
const PILOT_CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.jsdelivr.net",
  "font-src https://cdn.jsdelivr.net",
  "media-src 'self' data:",
  "connect-src 'self'",
].join("; ");
/** §6.4 strict row: no 'unsafe-inline' anywhere. */
const STRICT_CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'";
/** §6.4 artifact row, offline simulation: only jsDelivr /npm/ scripts. */
const ARTIFACT_CSP = "default-src 'none'; script-src https://cdn.jsdelivr.net/npm/; style-src https://cdn.jsdelivr.net/npm/ 'unsafe-inline'; img-src 'self' data:; font-src https://cdn.jsdelivr.net/npm/; connect-src 'none'";

const HOST_CONFIG_DEFAULT = {
  theme: "sent-tech",
  colorScheme: "light",
  locale: "fr",
  assetBase: "https://cdn.jsdelivr.net/npm/@sentropic/bpmn-canvas@0.3.0/dist/assets/",
  // §13.3 way (a) through the §6.5 channel: the value is the NAME of the
  // environment reference that holds the license (the W4 guard's accepted
  // channel-name form) — the suite never writes a license value.
  bpmn: { watermark: { hidden: true, license: "SENTROPIC_BPMN_WATERMARK_REFERENCE" } },
};

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/snap/bin/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].filter(Boolean);

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      /* next */
    }
  }
  throw new Error("No Chromium binary found. Set CHROME_BIN. Tried: " + CHROME_CANDIDATES.join(", "));
}

const failures = [];
const measurements = [];
function fail(label, message) {
  failures.push(`${label}: ${message}`);
  console.error(`FAIL ${label}: ${message}`);
}
function ok(label) {
  console.log(`ok ${label}`);
}
function assert(condition, label, message) {
  if (!condition) fail(label, message);
  return Boolean(condition);
}
function record(label, value) {
  measurements.push(`${label}: ${value}`);
  console.log(`measured ${label}: ${value}`);
}

// ---------------------------------------------------------------------------
// Step 1 — the bundle under test. Produced by the elements browser build;
// RED until that build exists.
// ---------------------------------------------------------------------------

if (!existsSync(ELEMENTS_ENTRY)) {
  const build = spawnSync(
    "npm",
    ["run", "build:browser", "-w", "@sentropic/design-system-elements"],
    { cwd: WORKTREE_ROOT, encoding: "utf8" },
  );
  if (build.status !== 0) {
    console.error(`RED: the elements browser bundle does not exist and its build failed (${build.status}).`);
    console.error((build.stdout ?? "") + (build.stderr ?? ""));
    console.error("AC-L2 Chromium suite cannot run: produce dist/browser first (spec §6.2, §15).");
    process.exit(1);
  }
}
ok("bundle exists: dist/browser/elements.js");

// ---------------------------------------------------------------------------
// Step 2 — the reference harness: the Svelte BarChart mounted in the LIGHT
// DOM of the pilot page, one mount per P-DATA fixture. Built with the
// worktree's vite from the component's SOURCE file (the package index
// re-exports the whole design system — the bundle pins the same file, see
// bar-chart-source.ts), compiled by the svelte plugin, and mounted with the
// SAME callback wiring the element passes (onSelect AND onSelectKey, §4.6)
// so the P-DATA attribute diff compares identical component trees.
// ---------------------------------------------------------------------------

const referenceProps = PDATA_FIXTURES.map((name) => {
  const envelope = JSON.parse(readFileSync(join(FIXTURES, name), "utf8"));
  const { component: _component, id: _id, ...props } = envelope.root;
  return props;
});

const work = mkdtempSync(join(tmpdir(), "st-elements-suite-"));
try {
  mkdirSync(join(work, "src"), { recursive: true });
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "st-elements-ref-harness", private: true, type: "module" }));
  symlinkSync(join(WORKTREE_ROOT, "node_modules"), join(work, "node_modules"), "dir");
  writeFileSync(
    join(work, "src", "reference-fixtures.js"),
    `export const FIXTURES = ${JSON.stringify(referenceProps)};\n`,
  );
  writeFileSync(
    join(work, "src", "reference-main.js"),
    `
import { mount } from "svelte";
import BarChart from ${JSON.stringify(BAR_CHART_SOURCE)};
import { FIXTURES } from "./reference-fixtures.js";

for (const [index, props] of FIXTURES.entries()) {
  const target = document.getElementById("ref-" + (index + 1));
  mount(BarChart, { target, props: { ...props, onSelect: () => {}, onSelectKey: () => {} } });
}
window.__refReady = true;
`,
  );

  const vite = await import("vite");
  const { svelte } = await import("@sveltejs/vite-plugin-svelte");
  await vite.build({
    root: work,
    configFile: false,
    logLevel: "error",
    plugins: [svelte()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: join(work, "src", "reference-main.js"),
        output: {
          entryFileNames: "ref-main.js",
          chunkFileNames: "ref-chunk.js",
          assetFileNames: "ref-asset[name][extname]",
        },
      },
    },
  });
} catch (error) {
  console.error("RED: the reference harness build failed.");
  console.error(String(error && error.stack ? error.stack : error));
  process.exit(1);
}
ok("reference harness built");

// ---------------------------------------------------------------------------
// Step 3 — the server. Everything is local; jsDelivr never answers because
// the browser never even asks (puppeteer aborts those requests, recorded as
// the expected offline degradation of the pilot asset rule).
// ---------------------------------------------------------------------------

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

function readFixture(name) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

function islandScript(jsonText) {
  return `<script type="application/json">${jsonText}</script>`;
}

function elementWithIsland(tag, id, fixture) {
  return `<${tag} id="${id}">${islandScript(readFixture(fixture))}</${tag}>`;
}

function pageHtml(csp, body, head = "") {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp.replace(/"/g, "&quot;")}" />
    <link rel="icon" href="data:," />
    <link rel="stylesheet" href="/themes/sent-tech.css" />
    ${head}
    <title>st-elements suite</title>
  </head>
  <body>
    ${body}
  </body>
</html>
`;
}

function pilotBody() {
  return `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    <main>
      <h1>AC-L2 pilot</h1>
      <section><h2>property channel</h2><st-bar-chart id="chart-prop"></st-bar-chart></section>
      <section><h2>data island channel</h2>${elementWithIsland("st-bar-chart", "chart-island", "bar-chart-pdata-1.json")}</section>
      <section id="pdata">
        ${PDATA_FIXTURES.map((fixture, index) => elementWithIsland("st-bar-chart", `pdata-${index + 1}`, fixture)).join("\n        ")}
      </section>
      <section id="reference">
        ${PDATA_FIXTURES.map((_, index) => `<div id="ref-${index + 1}" data-st-theme="sent-tech"></div>`).join("\n        ")}
      </section>
      <section>${elementWithIsland("st-decision-dossier", "dossier", "decision-dossier.json")}</section>
      <section>${elementWithIsland("st-bpmn-canvas", "bpmn", "bpmn-order-process.json")}</section>
      <section>${elementWithIsland("st-bar-chart", "chart-invalid", "bar-chart-invalid.json")}</section>
    </main>
    <script type="module" src="/bundle/elements.js"></script>
    <script type="module" src="/ref/ref-main.js"></script>
  `;
}

const PAGES = {
  "/pilot.html": pageHtml(PILOT_CSP, pilotBody()),
  "/no-bpmn.html": pageHtml(
    PILOT_CSP,
    `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    ${elementWithIsland("st-bar-chart", "chart", "bar-chart-pdata-1.json")}
    <script type="module" src="/bundle/elements.js"></script>
  `,
  ),
  "/theme.html": pageHtml(
    PILOT_CSP,
    `
    ${islandScript(JSON.stringify({ ...HOST_CONFIG_DEFAULT, theme: "forge" })).replace("<script", '<script id="st-host-config"')}
    ${elementWithIsland("st-bar-chart", "chart-forge", "bar-chart-pdata-1.json")}
    <div id="ref-forge" data-st-theme="forge"></div>
    <script type="module" src="/bundle/elements.js"></script>
    <script type="module">
      import { mount } from "svelte";
      import { BarChart } from "@sentropic/design-system-svelte";
      const response = await fetch("/fixtures/bar-chart-pdata-1.json");
      const envelope = await response.json();
      const { component: _c, id: _i, ...props } = envelope.root;
      mount(BarChart, { target: document.getElementById("ref-forge"), props: { ...props, onSelect: () => {} } });
      window.__refReady = true;
    </script>
  `,
  ),
  "/strict.html": pageHtml(
    STRICT_CSP,
    `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    ${elementWithIsland("st-bar-chart", "chart-strict", "bar-chart-pdata-1.json")}
    <div id="ref-strict" data-st-theme="sent-tech"></div>
    <script type="module" src="/ref/ref-main.js"></script>
    <script type="module" src="/bundle/elements.js"></script>
  `,
  ),
  "/artifact.html": pageHtml(
    ARTIFACT_CSP,
    `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    ${elementWithIsland("st-bar-chart", "chart-artifact", "bar-chart-pdata-1.json")}
    <script type="module" src="/bundle/elements.js"></script>
  `,
  ),
};

// The strict and theme pages mount ONE reference each (into their own
// element ids), so they get their own built entries; the harness's emitted
// CSS (vite compiles the component's styles into a css asset for the
// light-DOM reference — no injected <style>) is linked into every page that
// mounts one. The theme page's reference needs the forge stylesheet too.
async function buildReferenceEntry(sourceName, entryName) {
  const vite = await import("vite");
  const { svelte } = await import("@sveltejs/vite-plugin-svelte");
  await vite.build({
    root: work,
    configFile: false,
    logLevel: "error",
    plugins: [svelte()],
    build: {
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input: join(work, "src", sourceName),
        output: {
          entryFileNames: entryName,
          chunkFileNames: "ref-chunk.js",
          assetFileNames: "ref-asset[name][extname]",
        },
      },
    },
  });
}

writeFileSync(
  join(work, "src", "reference-strict.js"),
  `
import { mount } from "svelte";
import BarChart from ${JSON.stringify(BAR_CHART_SOURCE)};
import { FIXTURES } from "./reference-fixtures.js";
mount(BarChart, { target: document.getElementById("ref-strict"), props: { ...FIXTURES[0], onSelect: () => {}, onSelectKey: () => {} } });
window.__refReady = true;
`,
);
writeFileSync(
  join(work, "src", "reference-forge.js"),
  `
import { mount } from "svelte";
import BarChart from ${JSON.stringify(BAR_CHART_SOURCE)};
import { FIXTURES } from "./reference-fixtures.js";
mount(BarChart, { target: document.getElementById("ref-forge"), props: { ...FIXTURES[0], onSelect: () => {}, onSelectKey: () => {} } });
window.__refReady = true;
`,
);
await buildReferenceEntry("reference-strict.js", "ref-strict.js");
await buildReferenceEntry("reference-forge.js", "ref-forge.js");

PAGES["/strict.html"] = PAGES["/strict.html"].replace(
  '<script type="module" src="/ref/ref-main.js"></script>',
  '<script type="module" src="/ref/ref-strict.js"></script>',
);
PAGES["/theme.html"] = PAGES["/theme.html"].replace(
  /<script type="module">[\s\S]*<\/script>/,
  '<script type="module" src="/ref/ref-forge.js"></script>',
);
PAGES["/theme.html"] = PAGES["/theme.html"].replace(
  "<title>",
  '<link rel="stylesheet" href="/themes/forge.css" />\n    <title>',
);
const refCssLinks = readdirSync(join(work, "dist"))
  .filter((name) => name.endsWith(".css"))
  .map((name) => `<link rel="stylesheet" href="/ref/${name}" />`)
  .join("\n    ");
for (const pageName of ["/pilot.html", "/strict.html", "/theme.html"]) {
  PAGES[pageName] = PAGES[pageName].replace("<title>", `${refCssLinks}\n    <title>`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }
  let file = null;
  if (url.pathname.startsWith("/bundle/")) file = join(BROWSER_DIST, url.pathname.slice("/bundle/".length));
  else if (url.pathname.startsWith("/ref/")) file = join(work, "dist", url.pathname.slice("/ref/".length));
  else if (url.pathname.startsWith("/themes/")) file = join(THEMES_CSS, url.pathname.slice("/themes/".length));
  else if (url.pathname.startsWith("/fixtures/")) file = join(FIXTURES, url.pathname.slice("/fixtures/".length));
  else if (PAGES[url.pathname]) {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(PAGES[url.pathname]);
    return;
  }
  if (file !== null && existsSync(file)) {
    const body = readFileSync(file);
    const ext = file.slice(file.lastIndexOf("."));
    res.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream" });
    res.end(body);
    return;
  }
  res.writeHead(404);
  res.end("no such file");
});

const PORT = 4817;
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const BASE = `http://127.0.0.1:${PORT}`;

// ---------------------------------------------------------------------------
// Step 4 — Chromium.
// ---------------------------------------------------------------------------

const puppeteer = await import("puppeteer-core");
const browser = await puppeteer.default.launch({
  executablePath: findChrome(),
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

/**
 * One observed page: console + CSP partitioning with the U-12 offline rule.
 * jsDelivr requests are aborted (nothing leaves the machine) and their
 * console failures are recorded as the EXPECTED degradation, not failures.
 */
async function openPage(name) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const consoleErrors = [];
  const cspViolations = [];
  const requests = [];
  const failedAssets = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const location = message.location();
    const text = message.text();
    const url = location ? location.url : "";
    if (text.includes("cdn.jsdelivr.net") || url.includes("cdn.jsdelivr.net")) {
      failedAssets.push(url || text);
      return;
    }
    consoleErrors.push(`${text}${url ? ` (${url})` : ""}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error && error.message ? error.message : error)));
  await page.evaluateOnNewDocument(() => {
    window.__stViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__stViolations.push({
        directive: event.violatedDirective,
        blocked: event.blockedURI || "",
        sample: event.sample || "",
      });
    });
  });
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().startsWith("https://cdn.jsdelivr.net/")) {
      request.abort("blockedbyclient");
      return;
    }
    request.continue();
  });
  const allRequests = [];
  page.on("request", (request) => allRequests.push(request.url()));
  page.on("requestfailed", (request) => {
    if (request.url().includes("cdn.jsdelivr.net")) failedAssets.push(request.url());
  });
  await page.goto(`${BASE}${name}`, { waitUntil: "load", timeout: 60000 });
  return {
    page,
    consoleErrors,
    cspViolations,
    get requests() {
      return allRequests;
    },
    failedAssets,
    async violations() {
      return page.evaluate(() => window.__stViolations);
    },
    async close() {
      await page.close();
    },
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(page, fn, timeout, label) {
  const start = Date.now();
  for (;;) {
    let value;
    try {
      value = await page.evaluate(fn);
    } catch {
      /* page navigated? keep waiting */
    }
    if (value) return value;
    if (Date.now() - start > timeout) throw new Error(`timeout waiting for ${label}`);
    await sleep(120);
  }
}

/** Serialize one SVG for the attribute-level P-DATA diff (§11.3). */
const SVG_SERIALIZER = `(() => {
  function classValue(value) {
    return String(value)
      .split(/\\s+/)
      .map((token) => (/^svelte-/.test(token) ? "svelte-hash" : token))
      .sort()
      .join(" ");
  }
  function walk(node) {
    if (node.nodeType !== 1) return null;
    const attrs = {};
    for (const attribute of node.attributes) {
      attrs[attribute.name] =
        attribute.name === "class" ? classValue(attribute.value) : attribute.value;
    }
    const children = Array.from(node.children).map(walk).filter(Boolean);
    const text = Array.from(node.childNodes)
      .filter((child) => child.nodeType === 3)
      .map((child) => child.textContent.trim())
      .filter(Boolean)
      .join("|");
    return { tag: node.tagName, attrs, children, text };
  }
  return (root) => walk(root);
})()`;

async function serializeSvg(page, selector) {
  return page.evaluate(`(${SVG_SERIALIZER})(document.querySelector(${JSON.stringify(selector)}))`);
}

async function shadowSvg(page, elementSelector) {
  return page.evaluate(
    `(${SVG_SERIALIZER})(document.querySelector(${JSON.stringify(elementSelector)}).shadowRoot.querySelector("svg"))`,
  );
}

// ---------------------------------------------------------------------------
// Pilot page.
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/pilot.html");
  const page = observed.page;
  const label = "pilot";

  // The three elements render (AC-L2). The property channel is fed by the
  // driver, the islands upgrade on connect.
  await page.evaluate(async () => {
    await customElements.whenDefined("st-bar-chart");
    const response = await fetch("/fixtures/bar-chart-pdata-1.json");
    document.getElementById("chart-prop").envelope = await response.json();
  });
  await waitFor(
    page,
    "() => document.getElementById('chart-prop') && document.getElementById('chart-prop').shadowRoot && document.getElementById('chart-prop').shadowRoot.querySelector('svg')",
    20000,
    "chart-prop renders",
  );
  ok(`${label}: st-bar-chart renders through the property channel`);

  await waitFor(
    page,
    "() => document.getElementById('chart-island') && document.getElementById('chart-island').shadowRoot && document.getElementById('chart-island').shadowRoot.querySelector('svg')",
    20000,
    "chart-island renders",
  );
  ok(`${label}: st-bar-chart renders through the data-island channel`);

  await waitFor(
    page,
    "() => document.getElementById('dossier') && document.getElementById('dossier').shadowRoot && document.getElementById('dossier').shadowRoot.textContent.includes('Which rendering contract')",
    20000,
    "dossier renders",
  );
  ok(`${label}: st-decision-dossier renders the document`);

  await waitFor(
    page,
    "() => document.getElementById('bpmn') && document.getElementById('bpmn').shadowRoot && document.getElementById('bpmn').shadowRoot.querySelector('svg')",
    30000,
    "bpmn renders",
  );
  ok(`${label}: st-bpmn-canvas renders the F1 document`);

  // Invalid envelope → the error panel, never blank (§4.5).
  const errorPanel = await page.evaluate(() => {
    const element = document.getElementById("chart-invalid");
    const panel = element.shadowRoot.querySelector("[data-st-error]");
    if (!panel) return { present: false };
    return {
      present: true,
      text: panel.textContent,
      state: element.state,
      diagnostics: Array.isArray(element.diagnostics) ? element.diagnostics : null,
    };
  });
  assert(errorPanel.present, `${label}: error panel`, "the invalid envelope shows no error panel");
  assert(
    errorPanel.text.includes("schema-violation") && errorPanel.text.includes("/root/data"),
    `${label}: error panel`,
    `the error panel does not list the diagnostic (code + pointer); saw: ${JSON.stringify(errorPanel).slice(0, 300)}`,
  );
  assert(errorPanel.state === "refused", `${label}: error panel`, `element.state is ${errorPanel.state}, expected "refused"`);
  ok(`${label}: the invalid envelope shows the diagnostics in the error panel (never blank)`);

  // st-intent on click AND on keyboard activation (§4.6, §11.3).
  const intents = [];
  await page.exposeFunction("__stSuiteIntent", (detail) => intents.push(detail));
  await page.evaluate(() => {
    for (const element of document.querySelectorAll("st-bar-chart, st-decision-dossier, st-bpmn-canvas")) {
      element.addEventListener("st-intent", (event) => {
        window.__stSuiteIntent(JSON.parse(JSON.stringify(event.detail)));
      });
    }
  });
  const selectByClick = await page.evaluate(() => {
    const element = document.getElementById("chart-prop");
    const chip = element.shadowRoot.querySelector(".st-barChart__filters button");
    chip.click();
    return true;
  });
  assert(selectByClick, `${label}: select intent`, "no filter chip to click");
  await sleep(200);
  assert(
    intents.length === 1 && intents[0].name === "select" && intents[0].target === "Q1",
    `${label}: select intent on click`,
    `expected one select intent with target "Q1", saw ${JSON.stringify(intents)}`,
  );
  // Keyboard activation with a TRUSTED key press: synthetic KeyboardEvents
  // do not trigger a button's default activation, so the chip is focused
  // and Chromium's own Enter handling synthesizes the click (§4.6).
  await page.evaluate(() => {
    const element = document.getElementById("chart-prop");
    window.__stKeyboard = [];
    element.addEventListener("st-intent", (event) =>
      window.__stKeyboard.push({ name: event.detail.name, target: event.detail.target }),
    );
    const chip = element.shadowRoot.querySelector(".st-barChart__filters button");
    chip.focus();
  });
  await page.keyboard.press("Enter");
  await sleep(200);
  const keyboardDetail = await page.evaluate(() => window.__stKeyboard);
  assert(
    keyboardDetail.length === 1 && keyboardDetail[0].name === "select" && keyboardDetail[0].target === "Q1",
    `${label}: select intent on keyboard activation`,
    `keyboard Enter did not produce the select intent: ${JSON.stringify(keyboardDetail)}`,
  );
  ok(`${label}: st-intent select fires on click and on keyboard activation`);

  // choose-option on the dossier (§4.6 table of DecisionDossier).
  const choose = await page.evaluate(() => {
    const element = document.getElementById("dossier");
    window.__stChoose = [];
    element.addEventListener("st-intent", (event) => window.__stChoose.push(event.detail));
    const option = element.shadowRoot.querySelector("[data-option-id='opt-json']");
    if (!option) return null;
    option.click();
    return window.__stChoose;
  });
  assert(
    choose !== null,
    `${label}: choose-option intent`,
    "no option element with data-option-id='opt-json' in the dossier shadow root",
  );
  assert(
    choose.length === 1 && choose[0].name === "choose-option" && choose[0].target === "opt-json",
    `${label}: choose-option intent`,
    `expected one choose-option intent with target "opt-json", saw ${JSON.stringify(choose)}`,
  );
  ok(`${label}: st-intent choose-option fires on option click`);

  // P-DATA §11.3: five fixtures, attribute-level SVG diff (normalized
  // svelte-hash classes; BarChart emits no generated ids in the SVG).
  for (let index = 1; index <= 5; index += 1) {
    const elementSvg = await shadowSvg(page, `#pdata-${index}`);
    const referenceSvg = await serializeSvg(page, `#ref-${index} .st-barChart__visual svg`);
    const same =
      JSON.stringify(elementSvg) === JSON.stringify(referenceSvg) ||
      JSON.stringify(elementSvg.children[0]) === JSON.stringify(referenceSvg);
    assert(same, `${label}: P-DATA fixture ${index}`, "the element SVG differs from the Svelte component's");
    if (!same) {
      console.error("  element:  " + JSON.stringify(elementSvg).slice(0, 400));
      console.error("  reference:" + JSON.stringify(referenceSvg).slice(0, 400));
    }
  }
  ok(`${label}: P-DATA — same SVG as the Svelte component on all five fixtures`);

  // Computed style parity (AC-L2), checked properties.
  const parity = await page.evaluate(() => {
    const properties = ["fill", "stroke", "color", "font-family", "font-size", "font-weight", "text-anchor"];
    const read = (node) => {
      const styles = getComputedStyle(node);
      return Object.fromEntries(properties.map((property) => [property, styles.getPropertyValue(property)]));
    };
    const element = document.getElementById("chart-prop");
    const elementBar = element.shadowRoot.querySelector("svg rect.st-barChart__bar");
    const elementText = element.shadowRoot.querySelector("svg text");
    const elementChip = element.shadowRoot.querySelector(".st-barChart__filters button");
    const referenceBar = document.querySelector("#ref-1 rect.st-barChart__bar");
    const referenceText = document.querySelector("#ref-1 svg text");
    const referenceChip = document.querySelector("#ref-1 .st-barChart__filters button");
    return {
      bar: { element: read(elementBar), reference: read(referenceBar) },
      text: { element: read(elementText), reference: read(referenceText) },
      chip: { element: read(elementChip), reference: read(referenceChip) },
    };
  });
  for (const [part, pair] of Object.entries(parity)) {
    for (const [property, value] of Object.entries(pair.element)) {
      assert(
        value === pair.reference[property],
        `${label}: computed style parity (${part}.${property})`,
        `element "${value}" != reference "${pair.reference[property]}"`,
      );
    }
  }
  ok(`${label}: computed styles of the element equal the Svelte component's (checked properties)`);

  // Theme application inside the shadow roots of the two engine elements
  // (no Svelte counterpart exists for them; the catalogue records
  // no-counterpart — parity here means: the themed values apply).
  const themed = await page.evaluate(() => {
    const TOKENS = ["--st-semantic-text-primary", "--st-color-blue-60"];
    const read = (node) => {
      const styles = getComputedStyle(node);
      return {
        color: styles.getPropertyValue("color"),
        fontFamily: styles.getPropertyValue("font-family"),
        tokens: Object.fromEntries(TOKENS.map((token) => [token, styles.getPropertyValue(token).trim()])),
      };
    };
    const dossierRoot = document.getElementById("dossier").shadowRoot.querySelector("[data-st-theme]");
    const bpmnRoot = document.getElementById("bpmn").shadowRoot.querySelector("[data-st-theme]");
    const referenceRoot = document.querySelector("#ref-1");
    return {
      dossier: read(dossierRoot),
      bpmn: read(bpmnRoot),
      reference: read(referenceRoot),
    };
  });
  assert(
    themed.dossier.fontFamily === themed.reference.fontFamily,
    `${label}: dossier theme application`,
    `dossier font-family "${themed.dossier.fontFamily}" != themed reference "${themed.reference.fontFamily}"`,
  );
  assert(
    themed.bpmn.fontFamily === themed.reference.fontFamily,
    `${label}: bpmn theme application`,
    `bpmn font-family "${themed.bpmn.fontFamily}" != themed reference "${themed.reference.fontFamily}"`,
  );
  for (const [token, value] of Object.entries(themed.reference.tokens)) {
    assert(
      value !== "",
      `${label}: reference theme token ${token} defined`,
      "the reference container resolves no value — the sent-tech sheet did not load",
    );
    assert(
      themed.dossier.tokens[token] === value,
      `${label}: dossier shadow root resolves ${token}`,
      `element "${themed.dossier.tokens[token]}" != reference "${value}"`,
    );
    assert(
      themed.bpmn.tokens[token] === value,
      `${label}: bpmn shadow root resolves ${token}`,
      `element "${themed.bpmn.tokens[token]}" != reference "${value}"`,
    );
  }
  ok(`${label}: the theme applies inside the dossier and bpmn shadow roots`);

  // Zero console errors and zero CSP violations under the pilot CSP —
  // except the recorded offline asset degradation (U-12).
  record("pilot CSP violations", (await observed.violations()).length);
  record("pilot offline asset degradation (jsDelivr, U-12)", `${observed.failedAssets.length} failed asset request(s)`);
  assert(
    (await observed.violations()).length === 0,
    `${label}: zero CSP violations`,
    JSON.stringify(await observed.violations()).slice(0, 400),
  );
  assert(observed.consoleErrors.length === 0, `${label}: zero console errors`, observed.consoleErrors.slice(0, 3).join(" | "));
  ok(`${label}: zero console errors, zero CSP violations (offline asset rule recorded)`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// no-bpmn page: the lazy boundary (§6.6).
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/no-bpmn.html");
  const page = observed.page;
  const label = "no-bpmn";
  await waitFor(
    page,
    "() => document.getElementById('chart') && document.getElementById('chart').shadowRoot && document.getElementById('chart').shadowRoot.querySelector('svg')",
    20000,
    "chart renders",
  );
  await sleep(500);
  // The lazy boundary (§6.6): a page with only a bar chart requests NO
  // chunk at all — both engines AND both non-default themes are lazy.
  const lazyChunks = observed.requests.filter((url) => url.includes("/bundle/chunks/"));
  assert(
    lazyChunks.length === 0,
    `${label}: lazy boundary`,
    `a page with no bpmn/dossier element requested a lazy chunk: ${lazyChunks.join(", ")}`,
  );
  assert(observed.consoleErrors.length === 0, `${label}: zero console errors`, observed.consoleErrors.slice(0, 3).join(" | "));
  ok(`${label}: no bpmn-canvas and no focus chunk requested when no such element is on the page`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// theme page: the theme id comes from hostConfig only (§6.3/§6.5).
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/theme.html");
  const page = observed.page;
  const label = "theme";
  await waitFor(
    page,
    "() => document.getElementById('chart-forge') && document.getElementById('chart-forge').shadowRoot && document.getElementById('chart-forge').shadowRoot.querySelector('svg')",
    20000,
    "chart-forge renders",
  );
  const forge = await page.evaluate(() => {
    const element = document.getElementById("chart-forge");
    const internalRoot = element.shadowRoot.querySelector("[data-st-theme]");
    const bar = element.shadowRoot.querySelector("svg rect.st-barChart__bar");
    const reference = document.querySelector("#ref-forge rect.st-barChart__bar");
    return {
      theme: internalRoot ? internalRoot.getAttribute("data-st-theme") : null,
      barFill: bar ? getComputedStyle(bar).getPropertyValue("fill") : null,
      referenceFill: reference ? getComputedStyle(reference).getPropertyValue("fill") : null,
    };
  });
  assert(forge.theme === "forge", `${label}: hostConfig theme`, `internal root data-st-theme is ${forge.theme}, expected "forge"`);
  assert(
    forge.barFill && forge.barFill === forge.referenceFill,
    `${label}: forge sheet applies`,
    `element bar fill ${forge.barFill} != reference ${forge.referenceFill}`,
  );
  assert(observed.consoleErrors.length === 0, `${label}: zero console errors`, observed.consoleErrors.slice(0, 3).join(" | "));
  assert(
    (await observed.violations()).length === 0,
    `${label}: zero CSP violations`,
    JSON.stringify(await observed.violations()).slice(0, 400),
  );
  ok(`${label}: theme forge via hostConfig island — scoped sheet applies inside the shadow root`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// strict page (§6.4 strict row): MEASURED. Svelte's injected <style> is
// refused; the wrapper must fall back to constructable stylesheets.
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/strict.html");
  const page = observed.page;
  const label = "strict";
  await waitFor(
    page,
    "() => document.getElementById('chart-strict') && document.getElementById('chart-strict').shadowRoot && document.getElementById('chart-strict').shadowRoot.querySelector('svg')",
    20000,
    "chart-strict renders",
  );
  const strict = await page.evaluate(() => {
    const element = document.getElementById("chart-strict");
    const bar = element.shadowRoot.querySelector("svg rect.st-barChart__bar");
    const internalRoot = element.shadowRoot.querySelector("[data-st-theme]");
    const referenceBar = document.querySelector("#ref-strict rect.st-barChart__bar");
    return {
      bars: element.shadowRoot.querySelectorAll("rect.st-barChart__bar").length,
      barFill: bar ? getComputedStyle(bar).getPropertyValue("fill") : null,
      referenceFill: referenceBar ? getComputedStyle(referenceBar).getPropertyValue("fill") : null,
      theme: internalRoot ? internalRoot.getAttribute("data-st-theme") : null,
      styleElements: element.shadowRoot.querySelectorAll("style").length,
      adoptedSheets: element.shadowRoot.adoptedStyleSheets.length,
    };
  });
  const violations = await observed.violations();
  record("strict CSP: style-src violations on the injected <style>", violations.filter((v) => v.directive.startsWith("style")).length);
  record("strict CSP: script-src violations", violations.filter((v) => v.directive.startsWith("script")).length);
  record("strict CSP: shadow root adopted stylesheets", strict.adoptedSheets);
  record("strict CSP: shadow root <style> elements left", strict.styleElements);
  assert(strict.bars > 0, `${label}: renders`, "no bars rendered under strict CSP");
  assert(
    strict.barFill && strict.barFill === strict.referenceFill,
    `${label}: constructable-stylesheet fallback`,
    `bar fill "${strict.barFill}" != styled reference "${strict.referenceFill}" — the wrapper did not re-apply the refused styles`,
  );
  const scriptViolations = violations.filter((v) => v.directive.startsWith("script"));
  assert(
    scriptViolations.length === 0,
    `${label}: no script-src violations`,
    JSON.stringify(scriptViolations).slice(0, 300),
  );
  record(
    "strict row measured",
    `injected <style> refused (${violations.filter((v) => v.directive.startsWith("style")).length} violation(s)); wrapper re-applies component + theme styles through constructable stylesheets (${strict.adoptedSheets} adopted sheet(s)); rendered output styled`,
  );
  ok(`${label}: strict-CSP row measured (constructable-stylesheet fallback asserted)`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// artifact page (§6.4 artifact row): offline simulation. The allowlist
// permits only jsDelivr /npm/ scripts, so the local bundle is refused — the
// real measurement needs the published package on jsDelivr (L7a).
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/artifact.html");
  const page = observed.page;
  const label = "artifact";
  await sleep(800);
  const artifact = await page.evaluate(() => ({
    defined: Boolean(customElements.get("st-bar-chart")),
    rendered: Boolean(document.getElementById("chart-artifact") && document.getElementById("chart-artifact").shadowRoot && document.getElementById("chart-artifact").shadowRoot.querySelector("svg")),
  }));
  const violations = await observed.violations();
  record("artifact CSP (offline simulation): script-src violations", violations.filter((v) => v.directive.startsWith("script")).length);
  assert(
    !artifact.defined && !artifact.rendered,
    `${label}: offline simulation`,
    "the local bundle somehow loaded under a jsDelivr-only script allowlist",
  );
  record(
    "artifact row measured",
    "not measurable offline: the artifact CSP permits only jsDelivr /npm/ scripts, and the published package does not exist yet (L7a); under the simulation the local bundle is refused by script-src, as the row expects for any non-published source",
  );
  ok(`${label}: artifact row recorded as not-measurable-offline (local bundle refused by the jsDelivr-only allowlist)`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// End.
// ---------------------------------------------------------------------------

await browser.close();
server.close();
rmSync(work, { recursive: true, force: true });

console.log("");
console.log("MEASUREMENTS");
for (const line of measurements) console.log(`  ${line}`);
console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} AC-L2 Chromium assertion(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("AC-L2 Chromium suite: all assertions green.");
