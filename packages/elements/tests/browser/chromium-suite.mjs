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
 *   dossier-l6.html — the L6 imposed renderer defaults (F-R0–F-R7, §11.2):
 *                  one mount per L6 fixture (short2, short4, long, reco,
 *                  annotated, diagram), a near-fold mutated island
 *                  (280–300 chars, no fold control), a disabled-option
 *                  mutated island (L2 gate restyled as a card), and the
 *                  track-focus fixture when it exists
 *                  (`dossier-track.json`, Task 7 — otherwise the track row
 *                  records blocked instead of failing). Offline, pilot CSP.
 *                  F-R1 box equality and padding click, F-R2 computed
 *                  border scan, F-R3 light selection with equal boxes,
 *                  F-R4 fold/expand with no intent, F-R5 layout and
 *                  columns, F-R6 no per-option control, F-R7 badge and
 *                  nothing preselected, criterion 4 intent detail, and the
 *                  standalone offline render (criterion 1 third). The two
 *                  hosts of criterion 1 stay not covered (no host here).
 *   invalid-engines.html — st-decision-dossier AND st-bpmn-canvas fed
 *                  STRUCTURALLY INVALID envelopes, plus a st-decision-dossier
 *                  fed a valid BarChart envelope (B7 mismatch): all three
 *                  refuse with the error panel (§4.5) and NO engine chunk is
 *                  requested (§6.6, B8 witness).
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

/** One fixture mutated in memory (B8: structurally invalid engine envelopes). */
function mutatedIsland(tag, id, fixture, mutate) {
  const envelope = JSON.parse(readFixture(fixture));
  mutate(envelope);
  return `<${tag} id="${id}">${islandScript(JSON.stringify(envelope))}</${tag}>`;
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

/**
 * The L6 dossier page (§11.2 F-R0–F-R7, Task 7): every committed L6 fixture
 * mounted through the data island, plus a near-fold mutated island (a body
 * just under the 300 fold threshold renders fully with no fold control) and
 * a disabled-option mutated island (the L2 interactions gate restyled as an
 * inert card, never a button). The track-focus fixture mounts only when
 * Task 7 produced it; otherwise the track row records blocked.
 */
const TRACK_L6_PRESENT = existsSync(join(FIXTURES, "dossier-track.json"));

function dossierL6Body() {
  const mounts = [
    ["l6-short2", "dossier-short2.json"],
    ["l6-short4", "dossier-short4.json"],
    ["l6-long", "dossier-long.json"],
    ["l6-reco", "dossier-reco.json"],
    ["l6-annotated", "dossier-annotated.json"],
    ["l6-diagram", "dossier-diagram.json"],
  ]
    .map(([id, fixture]) => elementWithIsland("st-decision-dossier", id, fixture))
    .join("\n        ");
  const nearFold = mutatedIsland("st-decision-dossier", "l6-nearfold", "dossier-short2.json", (envelope) => {
    const set = envelope.root.document.sections.find((section) => section.kind === "optionSet");
    set.options[0].body = "detail ".repeat(41).trim();
  });
  const disabled = mutatedIsland("st-decision-dossier", "l6-disabled", "dossier-short2.json", (envelope) => {
    envelope.root.document.interactions = [{ name: "choose-option", targetRef: "opt-b", label: "Choose", enabled: false }];
  });
  const trackMount = TRACK_L6_PRESENT ? elementWithIsland("st-decision-dossier", "l6-track", "dossier-track.json") : "";
  return `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    <main>
      <h1>L6 dossier defaults</h1>
      <section id="l6-mounts">
        ${mounts}
        ${nearFold}
        ${disabled}
        ${trackMount}
      </section>
    </main>
    <script type="module" src="/bundle/elements.js"></script>
  `;
}

const PAGES = {
  "/pilot.html": pageHtml(PILOT_CSP, pilotBody()),
  "/dossier-l6.html": pageHtml(PILOT_CSP, dossierL6Body()),
  "/no-bpmn.html": pageHtml(
    PILOT_CSP,
    `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    ${elementWithIsland("st-bar-chart", "chart", "bar-chart-pdata-1.json")}
    <script type="module" src="/bundle/elements.js"></script>
  `,
  ),
  "/invalid-engines.html": pageHtml(
    PILOT_CSP,
    `
    ${islandScript(JSON.stringify(HOST_CONFIG_DEFAULT)).replace("<script", '<script id="st-host-config"')}
    ${mutatedIsland("st-decision-dossier", "dossier-invalid", "decision-dossier.json", (envelope) => {
      delete envelope.root.document.title;
    })}
    ${mutatedIsland("st-bpmn-canvas", "bpmn-invalid", "bpmn-order-process.json", (envelope) => {
      delete envelope.root.document.$type;
    })}
    ${elementWithIsland("st-decision-dossier", "dossier-mismatch", "bar-chart-pdata-1.json")}
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
    ${elementWithIsland("st-decision-dossier", "dossier-strict", "dossier-short2.json")}
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
// Snap-confined Chromium cannot create its SingletonLock under $TMPDIR
// (Permission denied, measured); /tmp is writable to it, so the throwaway
// browser profile lives there, never in the session tmp root.
const chromiumProfile = mkdtempSync("/tmp/st-elements-chromium-");
const browser = await puppeteer.default.launch({
  executablePath: findChrome(),
  headless: "new",
  userDataDir: chromiumProfile,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

// Everything below runs inside try/finally: the throwaway profile, the
// server and the work dir are removed even when a page operation throws,
// like RichTextEditor.browser.test.mjs (a top-level `process.exit` would
// skip `finally`, so failures set `process.exitCode` instead).
try {

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
// invalid-engines page: §6.6 — an invalid envelope renders its diagnostics
// WITHOUT loading an engine (B8), on EACH lazy element; a mismatching
// envelope on a lazy element refuses as unknown-component (B7) and also
// loads nothing.
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/invalid-engines.html");
  const page = observed.page;
  const label = "invalid-engines";
  for (const id of ["dossier-invalid", "bpmn-invalid", "dossier-mismatch"]) {
    await waitFor(
      page,
      `() => document.getElementById('${id}') && document.getElementById('${id}').shadowRoot && document.getElementById('${id}').shadowRoot.querySelector('[data-st-error]')`,
      20000,
      `${id} refuses`,
    );
  }
  ok(`${label}: both invalid envelopes and the mismatched envelope show the error panel (never blank)`);
  const states = await page.evaluate(() =>
    ["dossier-invalid", "bpmn-invalid", "dossier-mismatch"].map((id) => document.getElementById(id).state),
  );
  assert(
    states.every((state) => state === "refused"),
    `${label}: refused states`,
    `expected all three elements refused, saw ${JSON.stringify(states)}`,
  );
  const panels = await page.evaluate(() =>
    ["dossier-invalid", "bpmn-invalid", "dossier-mismatch"].map(
      (id) => document.getElementById(id).shadowRoot.querySelector("[data-st-error]").textContent,
    ),
  );
  assert(
    panels[0].includes("schema-violation") && panels[0].includes("/root/document/title"),
    `${label}: dossier-invalid diagnostic`,
    `expected the missing-title schema-violation; saw: ${JSON.stringify(panels[0]).slice(0, 200)}`,
  );
  assert(
    panels[1].includes("schema-violation"),
    `${label}: bpmn-invalid diagnostic`,
    `expected a schema-violation; saw: ${JSON.stringify(panels[1]).slice(0, 200)}`,
  );
  assert(
    panels[2].includes("unknown-component") && panels[2].includes("/root/component"),
    `${label}: dossier-mismatch diagnostic`,
    `expected the B7 unknown-component at /root/component; saw: ${JSON.stringify(panels[2]).slice(0, 200)}`,
  );
  ok(`${label}: the diagnostics name their code and pointer`);
  await sleep(500);
  // B8: NO engine chunk was requested for any of the three refusals.
  const lazyChunks = observed.requests.filter((url) => url.includes("/bundle/chunks/"));
  assert(
    lazyChunks.length === 0,
    `${label}: no engine chunk on refused envelopes`,
    `an invalid or mismatched envelope loaded an engine chunk: ${lazyChunks.join(", ")}`,
  );
  assert(observed.consoleErrors.length === 0, `${label}: zero console errors`, observed.consoleErrors.slice(0, 3).join(" | "));
  ok(`${label}: invalid envelopes on both lazy elements request no engine chunk`);
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
  // L6 strict row: the dossier chunk adopts its constructable sheet (no
  // <style> for dossier CSS), the dossier renders, and no script violation
  // appears (F-R2, criterion 8 strict leg).
  await waitFor(
    page,
    "() => document.getElementById('dossier-strict') && document.getElementById('dossier-strict').shadowRoot && document.getElementById('dossier-strict').shadowRoot.querySelector('[data-st-dossier]')",
    20000,
    "dossier-strict renders",
  );
  const dossierStrict = await page.evaluate(() => {
    const element = document.getElementById("dossier-strict");
    const root = element.shadowRoot;
    const adopted = Array.from(root.adoptedStyleSheets);
    let dossierRules = 0;
    for (const sheet of adopted) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.cssText.includes("st-dossier")) dossierRules += 1;
        }
      } catch {
        /* unreadable sheet: not ours */
      }
    }
    const card = root.querySelector('[data-option-id="opt-a"]');
    return {
      rendered: Boolean(root.querySelector("[data-st-dossier]")),
      styleElements: root.querySelectorAll("style").length,
      dossierRules,
      borderTopWidth: card ? getComputedStyle(card).borderTopWidth : null,
    };
  });
  assert(dossierStrict.rendered, `${label}: dossier renders under strict CSP`, "no dossier article in the shadow root");
  assert(
    dossierStrict.styleElements === 0,
    `${label}: no dossier <style> under strict CSP`,
    `${dossierStrict.styleElements} <style> element(s) left in the dossier shadow root`,
  );
  assert(
    dossierStrict.dossierRules > 0,
    `${label}: dossier constructable sheet adopted`,
    "no st-dossier rule found in any adopted stylesheet",
  );
  assert(
    dossierStrict.borderTopWidth === "1px",
    `${label}: dossier card outline is 1 px under strict CSP`,
    `border-top-width is ${dossierStrict.borderTopWidth}`,
  );
  ok(`${label}: dossier strict row — constructable dossier sheet, no <style>, 1 px outline`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// dossier-l6 page: the L6 imposed renderer defaults (F-R0–F-R7, §11.2),
// the criterion 4 element intent detail, and the standalone offline render
// (criterion 1, standalone third). The two hosts of criterion 1 stay
// not covered: no Claude Desktop or VS Code host runs here.
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/dossier-l6.html");
  const page = observed.page;
  const label = "dossier-l6";
  const mountIds = ["l6-short2", "l6-short4", "l6-long", "l6-reco", "l6-annotated", "l6-diagram", "l6-nearfold", "l6-disabled"];
  for (const id of mountIds) {
    await waitFor(
      page,
      `() => { const el = document.getElementById('${id}'); return el && el.shadowRoot && el.shadowRoot.querySelector('[data-st-dossier]') ? true : false; }`,
      20000,
      `${id} renders`,
    );
  }
  ok(`${label}: all six L6 fixtures plus near-fold and disabled islands render offline from the local bundle`);

  await page.evaluate(() => {
    window.__stL6 = [];
    for (const element of document.querySelectorAll("st-decision-dossier")) {
      element.addEventListener("st-intent", (event) => {
        window.__stL6.push(JSON.parse(JSON.stringify(event.detail)));
      });
    }
  });

  // F-R7: nothing preselected anywhere (reco included) and no emission
  // before any click. Runs before any click on the page so the later
  // selection moves cannot pollute it (state isolation).
  const preselected = await page.evaluate(() => {
    const out = [];
    for (const id of ["l6-short2", "l6-short4", "l6-long", "l6-reco", "l6-annotated", "l6-diagram"]) {
      out.push(document.getElementById(id).shadowRoot.querySelectorAll('[data-st-selected="true"]').length);
    }
    return { counts: out, intents: window.__stL6.length };
  });
  assert(preselected.counts.every((count) => count === 0), `${label}: F-R7 nothing preselected`, JSON.stringify(preselected.counts));
  assert(preselected.intents === 0, `${label}: F-R7 zero initial intents`, JSON.stringify(preselected.intents));

  // F-R1: the select and the fold are siblings inside the card group — on
  // three short fixtures every card box equals its select box within 1 px,
  // and a padding click (corner, outside the label) emits choose-option.
  const boxes = await page.evaluate(() => {
    const out = {};
    for (const id of ["l6-short2", "l6-short4", "l6-reco"]) {
      const root = document.getElementById(id).shadowRoot;
      const cards = Array.from(root.querySelectorAll("[data-option-card]"));
      out[id] = cards.map((card) => {
        const select = card.querySelector("[data-option-id]");
        const cardRect = card.getBoundingClientRect();
        const selectRect = select.getBoundingClientRect();
        return {
          cardId: card.getAttribute("data-option-card"),
          dx: Math.abs(cardRect.x - selectRect.x),
          dy: Math.abs(cardRect.y - selectRect.y),
          dw: Math.abs(cardRect.width - selectRect.width),
          dh: Math.abs(cardRect.height - selectRect.height),
          width: cardRect.width,
          height: cardRect.height,
        };
      });
    }
    return out;
  });
  for (const [id, rows] of Object.entries(boxes)) {
    assert(rows.length > 0, `${label}: F-R1 ${id} cards`, "no option cards found");
    for (const row of rows) {
      assert(row.width > 0 && row.height > 0, `${label}: F-R1 ${id} ${row.cardId}`, "card has a zero box — layout did not apply");
      assert(
        row.dx <= 1 && row.dy <= 1 && row.dw <= 1 && row.dh <= 1,
        `${label}: F-R1 ${id} ${row.cardId} box delta`,
        `card vs select delta x=${row.dx} y=${row.dy} w=${row.dw} h=${row.dh} exceeds 1 px`,
      );
    }
  }
  const padClick = await page.evaluate(() => {
    const root = document.getElementById("l6-short2").shadowRoot;
    const card = root.querySelector('[data-option-card="opt-a"]');
    const rect = card.getBoundingClientRect();
    return { x: rect.x + rect.width - 4, y: rect.y + rect.height - 4 };
  });
  await page.mouse.click(padClick.x, padClick.y);
  await sleep(200);
  const padIntents = await page.evaluate(() => window.__stL6);
  assert(
    padIntents.length === 1 && padIntents[0].name === "choose-option" && padIntents[0].target === "opt-a",
    `${label}: F-R1 padding click`,
    `expected one choose-option for "opt-a", saw ${JSON.stringify(padIntents)}`,
  );
  await page.evaluate(() => {
    const root = document.getElementById("l6-short2").shadowRoot;
    root.querySelector('[data-option-id="opt-a"]').click();
    window.__stL6.length = 0;
  });
  await sleep(200);
  ok(`${label}: F-R1 whole card clickable — card vs select within 1 px on every short card, padding click emits`);

  // F-R2 / criterion 8: no VISIBLE computed stroke above 1 px anywhere in
  // the dossier subtrees (selects, fold controls, badges, chips, diagram
  // frame). Visibility-gated: the CSS initial outline-width is `medium`
  // (Chromium computes it as 3px) with outline-style `none`, so an
  // ungated width scan flags every unstyled element although nothing is
  // drawn. Only a stroke whose style renders (not `none`/`hidden`) counts.
  const strokes = await page.evaluate(() => {
    const over = [];
    const sides = [
      ["borderTopWidth", "borderTopStyle"],
      ["borderRightWidth", "borderRightStyle"],
      ["borderBottomWidth", "borderBottomStyle"],
      ["borderLeftWidth", "borderLeftStyle"],
    ];
    for (const id of ["l6-short2", "l6-short4", "l6-long", "l6-reco", "l6-annotated", "l6-diagram"]) {
      const root = document.getElementById(id).shadowRoot;
      for (const node of root.querySelectorAll("*")) {
        const style = getComputedStyle(node);
        for (const [prop, styleProp] of sides) {
          const value = Number.parseFloat(style[prop]);
          const rendered = style[styleProp] !== "none" && style[styleProp] !== "hidden";
          if (Number.isFinite(value) && value > 1 && rendered) over.push(`${id} ${node.className} ${prop}=${style[prop]}`);
        }
        const outlineValue = Number.parseFloat(style.outlineWidth);
        const outlineRendered = style.outlineStyle !== "none" && style.outlineStyle !== "hidden";
        if (Number.isFinite(outlineValue) && outlineValue > 1 && outlineRendered) {
          over.push(`${id} ${node.className} outlineWidth=${style.outlineWidth}`);
        }
      }
    }
    return over;
  });
  assert(strokes.length === 0, `${label}: F-R2 no stroke above 1 px`, strokes.slice(0, 5).join(" | "));
  record("dossier-l6 computed border scan", "no border-width above 1 px over six dossier mounts");
  ok(`${label}: F-R2 1 px strokes — computed scan clean over six mounts`);

  // Criterion 3 computed half: every colour-bearing computed style on card,
  // badge, fold and selection resolves through an adopted --st-* token. The
  // probe lives inside [data-st-theme] so oklch/color-mix/hex normalize to
  // the browser computed form before comparison.
  const colours = await page.evaluate(() => {
    const ids = ["l6-short2", "l6-short4", "l6-long", "l6-reco", "l6-annotated", "l6-diagram"];
    const tokenNames = new Set();
    for (const id of ids) {
      const root = document.getElementById(id).shadowRoot;
      for (const sheet of root.adoptedStyleSheets) {
        let rules = [];
        try {
          rules = Array.from(sheet.cssRules);
        } catch {
          continue;
        }
        for (const rule of rules) {
          const text = rule.cssText || "";
          if (!text.includes("st-dossier")) continue;
          // Custom properties are case-sensitive and the badge tokens are
      // camelCase (`--st-component-badge-infoBackground`); lowercasing the
      // names breaks the probe `var()` below, so the token's resolved
      // `color-mix()` value never enters the set and the badge background
      // reports as unresolved although it resolves through the token.
      for (const match of text.matchAll(/--st-[a-z0-9-]+/gi)) tokenNames.add(match[0]);
        }
      }
    }
    const themed = document.getElementById("l6-short2").shadowRoot.querySelector("[data-st-theme]") || document.getElementById("l6-short2").shadowRoot;
    const probe = document.createElement("div");
    themed.append(probe);
    const tokenValues = new Set();
    for (const token of tokenNames) {
      probe.style.color = `var(${token})`;
      const resolved = getComputedStyle(probe).color;
      if (resolved && resolved !== "") tokenValues.add(resolved.trim());
      probe.style.color = "";
      probe.style.backgroundColor = `var(${token})`;
      const resolvedBg = getComputedStyle(probe).backgroundColor;
      if (resolvedBg && resolvedBg !== "") tokenValues.add(resolvedBg.trim());
      probe.style.backgroundColor = "";
      probe.style.borderTopColor = `var(${token})`;
      const resolvedBorder = getComputedStyle(probe).borderTopColor;
      if (resolvedBorder && resolvedBorder !== "") tokenValues.add(resolvedBorder.trim());
      probe.style.borderTopColor = "";
    }
    probe.remove();
    const unresolved = [];
    for (const id of ids) {
      const root = document.getElementById(id).shadowRoot;
      for (const node of root.querySelectorAll(".st-dossier__optionCard, .st-dossier__optionSelect, .st-dossier__badge, .st-dossier__optionFold, .st-dossier__optionBody")) {
        const style = getComputedStyle(node);
        for (const prop of ["color", "backgroundColor", "borderTopColor"]) {
          const value = style[prop];
          if (!value || value === "" || value === "rgba(0, 0, 0, 0)" || value === "transparent") continue;
          if (!tokenValues.has(value.trim())) unresolved.push(`${id} ${node.className} ${prop}=${value}`);
        }
      }
    }
    return { tokenCount: tokenValues.size, unresolved: unresolved.slice(0, 10), unresolvedCount: unresolved.length };
  });
  assert(colours.tokenCount > 0, `${label}: criterion 3 token set resolved`, JSON.stringify(colours.tokenCount));
  assert(colours.unresolvedCount === 0, `${label}: criterion 3 computed colours resolve via --st-*`, colours.unresolved.join(" | "));
  record("dossier-l6 computed colour scan", `${colours.tokenCount} token value(s) resolved, ${colours.unresolvedCount} unresolved`);
  ok(`${label}: criterion 3 computed colours — card, badge, fold and selection resolve via --st-* tokens`);

  // F-R3: selecting marks the select with a light state and equal boxes;
  // reselecting clears; keyboard Enter selects. Each move starts from a
  // clean mount so a later click never toggles off an already-selected
  // option (state isolation).
  const lightSelect = await page.evaluate(() => {
    const root = document.getElementById("l6-short4").shadowRoot;
    const card = root.querySelector('[data-option-id="opt-2"]');
    const before = card.getBoundingClientRect();
    card.click();
    const after = card.getBoundingClientRect();
    const style = getComputedStyle(card);
    const selected = card.getAttribute("data-st-selected") === "true" && card.getAttribute("aria-pressed") === "true";
    card.click();
    const cleared = !card.hasAttribute("data-st-selected");
    return {
      before: { x: before.x, y: before.y, width: before.width, height: before.height },
      after: { x: after.x, y: after.y, width: after.width, height: after.height },
      selected,
      cleared,
      outlineWidth: style.outlineWidth,
      borderTopWidth: style.borderTopWidth,
    };
  });
  assert(lightSelect.selected, `${label}: F-R3 light selection`, "card not marked selected after click");
  assert(
    JSON.stringify(lightSelect.before) === JSON.stringify(lightSelect.after),
    `${label}: F-R3 no layout shift`,
    `box moved ${JSON.stringify(lightSelect.before)} -> ${JSON.stringify(lightSelect.after)}`,
  );
  assert(lightSelect.cleared, `${label}: F-R3 reselect clears`, "reselect did not clear the selection");
  assert(
    Number.parseFloat(lightSelect.borderTopWidth) <= 1,
    `${label}: F-R3 selected outline stays 1 px`,
    `selected border-top-width is ${lightSelect.borderTopWidth}`,
  );
  await page.evaluate(() => {
    window.__stL6.length = 0;
    const root = document.getElementById("l6-short2").shadowRoot;
    root.querySelector('[data-option-id="opt-b"]').focus();
  });
  await page.keyboard.press("Enter");
  await sleep(200);
  const keyboardIntent = await page.evaluate(() => window.__stL6);
  assert(
    keyboardIntent.length === 1 && keyboardIntent[0].target === "opt-b",
    `${label}: keyboard Enter selects`,
    JSON.stringify(keyboardIntent),
  );
  await page.keyboard.press("Enter");
  await sleep(200);
  await page.evaluate(() => {
    window.__stL6.length = 0;
  });
  ok(`${label}: F-R3/F-R7 light selection, no shift, keyboard selects then clears for isolation`);

  // F-R4: long arguments render collapsed with an expand control; expanding
  // reveals the full text with no intent; the near-fold island renders fully.
  const fold = await page.evaluate(() => {
    const root = document.getElementById("l6-long").shadowRoot;
    const cards = Array.from(root.querySelectorAll("[data-option-card]"));
    const states = cards.map((card) => {
      const control = card.querySelector("[data-option-fold]");
      const body = card.querySelector(".st-dossier__optionBody");
      return {
        collapsed: body && body.hasAttribute("hidden"),
        control: control ? control.getAttribute("aria-expanded") : null,
        label: card.querySelector(".st-dossier__optionLabel") ? card.querySelector(".st-dossier__optionLabel").textContent : "",
      };
    });
    const before = window.__stL6.length;
    const firstControl = root.querySelector('[data-option-fold="opt-long-1"]');
    firstControl.click();
    const afterExpand = {
      hidden: root.querySelector('[data-option-card="opt-long-1"] .st-dossier__optionBody').hasAttribute("hidden"),
      expanded: firstControl.getAttribute("aria-expanded"),
      intents: window.__stL6.length - before,
      bodyChars: root.querySelector('[data-option-card="opt-long-1"] .st-dossier__optionBody').textContent.length,
    };
    firstControl.click();
    return { states, afterExpand };
  });
  assert(fold.states.length === 4, `${label}: F-R4 four long cards`, `saw ${fold.states.length}`);
  assert(
    fold.states.every((state) => state.collapsed && state.control === "false"),
    `${label}: F-R4 collapsed by default`,
    JSON.stringify(fold.states.map((state) => state.control)),
  );
  assert(!fold.afterExpand.hidden && fold.afterExpand.expanded === "true", `${label}: F-R4 expand reveals`, JSON.stringify(fold.afterExpand));
  assert(fold.afterExpand.intents === 0, `${label}: F-R4 expand emits nothing`, `${fold.afterExpand.intents} intent(s)`);
  assert(fold.afterExpand.bodyChars > 300, `${label}: F-R4 full argument over threshold`, `${fold.afterExpand.bodyChars} chars`);
  const nearFold = await page.evaluate(() => {
    const root = document.getElementById("l6-nearfold").shadowRoot;
    const card = root.querySelector('[data-option-card="opt-a"]');
    return {
      foldControls: card.querySelectorAll("[data-option-fold]").length,
      hidden: card.querySelector(".st-dossier__optionBody").hasAttribute("hidden"),
    };
  });
  assert(nearFold.foldControls === 0 && !nearFold.hidden, `${label}: F-R4 near-fold control`, JSON.stringify(nearFold));
  ok(`${label}: F-R4 long arguments folded, expand reveals with no intent, near-fold renders fully`);

  // F-R5: renderer-chosen layout — short2 list, short4 grid, long list at
  // any count; the grid resolves two computed columns; list cards share one
  // column (no four tall side-by-side columns of long cards).
  const layouts = await page.evaluate(() => {
    const layoutOf = (id) => document.getElementById(id).shadowRoot.querySelector("[data-st-option-set]").getAttribute("data-st-layout");
    const gridTracks = getComputedStyle(
      document.getElementById("l6-short4").shadowRoot.querySelector("[data-st-option-set]"),
    ).gridTemplateColumns.split(" ").filter(Boolean).length;
    const longCards = Array.from(document.getElementById("l6-long").shadowRoot.querySelectorAll("[data-option-card]")).map((card) => {
      const rect = card.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });
    return {
      short2: layoutOf("l6-short2"),
      short4: layoutOf("l6-short4"),
      long: layoutOf("l6-long"),
      gridTracks,
      longCards,
    };
  });
  assert(layouts.short2 === "list" && layouts.long === "list" && layouts.short4 === "grid", `${label}: F-R5 layout table`, JSON.stringify(layouts));
  assert(layouts.gridTracks === 2, `${label}: F-R5 grid capped at two columns`, `${layouts.gridTracks} track(s)`);
  assert(
    layouts.longCards.every((card) => card.x === layouts.longCards[0].x && card.width === layouts.longCards[0].width),
    `${label}: F-R5 long cards in one column`,
    JSON.stringify(layouts.longCards),
  );
  ok(`${label}: F-R5 renderer-chosen layout — list/grid table holds with computed columns`);

  // F-R6: the select and the fold are siblings in the card group — no
  // button inside a role=button, one select per short card, fold only on
  // long cards; at most one annotation control per decision. F-R7: one
  // discreet badge on the recommended option head only.
  const annotations = await page.evaluate(() => {
    const annotated = document.getElementById("l6-annotated").shadowRoot;
    const cards = Array.from(annotated.querySelectorAll("[data-option-card]"));
    const perOptionSelects = cards.map((card) => card.querySelectorAll(":scope > [data-option-id]").length);
    const nestedInSelect = [];
    for (const select of annotated.querySelectorAll("[data-option-id]")) {
      nestedInSelect.push(select.querySelectorAll("button, a, input, select, textarea").length);
    }
    const roleButtonNested = Array.from(annotated.querySelectorAll('[role="button"]')).map(
      (holder) => holder.querySelectorAll("button, a, input, select, textarea, [tabindex]").length,
    );
    const reco = document.getElementById("l6-reco").shadowRoot;
    return {
      perOptionSelects,
      nestedInSelect,
      roleButtonNested,
      foldInAnnotated: annotated.querySelectorAll("[data-option-fold]").length,
      dossierAnnotationControls: annotated.querySelectorAll("[data-annotation-control]").length,
      badges: Array.from(reco.querySelectorAll(".st-dossier__badge")).map((badge) => badge.closest("[data-option-id]").getAttribute("data-option-id")),
      // F-R7: every committed L6 fixture carries a matched recommendation,
      // so each one badges its recommended option — not only the reco
      // fixture. Expected recommended ids per fixture envelope.
      otherBadges: ["l6-short2", "l6-short4", "l6-long", "l6-annotated", "l6-diagram"].map(
        (id) => document.getElementById(id).shadowRoot.querySelectorAll(".st-dossier__badge").length,
      ),
      otherBadgeIds: ["l6-short2", "l6-short4", "l6-long", "l6-annotated", "l6-diagram"].map((id) => {
        const badge = document.getElementById(id).shadowRoot.querySelector(".st-dossier__badge");
        return badge ? badge.closest("[data-option-id]").getAttribute("data-option-id") : null;
      }),
      badgeTag: reco.querySelector(".st-dossier__badge") ? reco.querySelector(".st-dossier__badge").tagName : null,
      badgeHead: Boolean(reco.querySelector(".st-dossier__badge")?.closest(".st-dossier__optionHead")),
      badgeInFold: Boolean(reco.querySelector(".st-dossier__badge")?.closest("[data-option-fold]")),
    };
  });
  assert(
    annotations.perOptionSelects.every((count) => count === 1),
    `${label}: F-R6 one select per card`,
    JSON.stringify(annotations.perOptionSelects),
  );
  assert(
    annotations.nestedInSelect.every((count) => count === 0),
    `${label}: F-R6 no control nested in the select`,
    JSON.stringify(annotations.nestedInSelect),
  );
  assert(
    annotations.roleButtonNested.every((count) => count === 0),
    `${label}: F-R6 no interactive nested in role=button`,
    JSON.stringify(annotations.roleButtonNested),
  );
  assert(annotations.foldInAnnotated === 0, `${label}: F-R6 no fold on short cards`, `${annotations.foldInAnnotated}`);
  assert(annotations.dossierAnnotationControls <= 1, `${label}: F-R6 single annotation at most`, `${annotations.dossierAnnotationControls}`);
  assert(annotations.badges.length === 1 && annotations.badges[0] === "opt-r1", `${label}: F-R7 discreet badge`, JSON.stringify(annotations.badges));
  assert(annotations.otherBadges.every((count) => count === 1), `${label}: F-R7 badge on each recommended fixture`, JSON.stringify(annotations.otherBadges));
  assert(
    JSON.stringify(annotations.otherBadgeIds) === JSON.stringify(["opt-a", "opt-1", "opt-long-1", "opt-c1", "opt-d1"]),
    `${label}: F-R7 badge marks the recommended option`,
    JSON.stringify(annotations.otherBadgeIds),
  );
  assert(["SPAN", "P", "EM", "STRONG"].includes(annotations.badgeTag), `${label}: F-R7 badge is display state`, String(annotations.badgeTag));
  assert(annotations.badgeHead, `${label}: F-R7 badge shares the header row`, "badge not inside .st-dossier__optionHead");
  assert(!annotations.badgeInFold, `${label}: F-R7 badge outside the fold`, "badge inside the fold control");
  const badgeLayout = await page.evaluate(() => {
    const root = document.getElementById("l6-reco").shadowRoot;
    const card = root.querySelector('[data-option-card="opt-r1"]');
    const before = card.getBoundingClientRect();
    const badge = card.querySelector(".st-dossier__badge");
    badge.remove();
    const after = card.getBoundingClientRect();
    return {
      dh: Math.abs(before.height - after.height),
      dw: Math.abs(before.width - after.width),
      before: { width: before.width, height: before.height },
      after: { width: after.width, height: after.height },
    };
  });
  assert(
    badgeLayout.dh <= 1 && badgeLayout.dw <= 1,
    `${label}: F-R7 badge changes neither layout`,
    `card box moved ${JSON.stringify(badgeLayout.before)} -> ${JSON.stringify(badgeLayout.after)}`,
  );
  const disabled = await page.evaluate(() => {
    const root = document.getElementById("l6-disabled").shadowRoot;
    const inert = root.querySelector('[data-option-disabled="opt-b"]');
    return {
      present: Boolean(inert),
      controls: inert ? inert.querySelectorAll("button, a, [role='button'], [tabindex]").length : -1,
      selectable: root.querySelector('[data-option-id="opt-b"]') !== null,
    };
  });
  assert(disabled.present && disabled.controls === 0 && !disabled.selectable, `${label}: disabled option inert`, JSON.stringify(disabled));
  ok(`${label}: F-R6/F-R7 single annotation, discreet badge, disabled card inert`);

  // Criterion 4 element half: the click emits the exact §4.6 detail.
  // Uses an untouched, unselected option so the click always emits (state
  // isolation); the optional chain guards the detail read.
  await page.evaluate(() => {
    window.__stL6.length = 0;
    const root = document.getElementById("l6-short2").shadowRoot;
    root.querySelector('[data-option-id="opt-a"]').click();
  });
  await sleep(200);
  const detail = await page.evaluate(() => window.__stL6);
  assert(detail.length === 1, `${label}: criterion 4 one intent`, JSON.stringify(detail));
  assert(
    detail[0]?.event === "intent" && detail[0]?.name === "choose-option" && detail[0]?.target === "opt-a" && typeof detail[0]?.context === "object",
    `${label}: criterion 4 §4.6 detail`,
    JSON.stringify(detail[0]),
  );
  record("dossier-l6 intent detail", JSON.stringify(detail[0]));
  ok(`${label}: criterion 4 element half — exact §4.6 choose-option detail at the boundary`);

  // Criterion 1 standalone third (Task 7 input when present, else blocked):
  // the page renders offline from the local bundle — title, options, one
  // click observed. Claude Desktop and VS Code stay not covered (no host).
  if (TRACK_L6_PRESENT) {
    await waitFor(
      page,
      "() => { const el = document.getElementById('l6-track'); return el && el.shadowRoot && el.shadowRoot.querySelector('[data-st-dossier]') ? true : false; }",
      20000,
      "l6-track renders",
    );
    const trackRender = await page.evaluate(() => {
      const root = document.getElementById("l6-track").shadowRoot;
      const before = window.__stL6.length;
      const first = root.querySelector("[data-option-id]");
      if (first) first.click();
      return {
        title: root.querySelector("[data-st-dossier-title]") ? root.querySelector("[data-st-dossier-title]").textContent : "",
        options: root.querySelectorAll("[data-option-id]").length,
        intents: window.__stL6.length - before,
      };
    });
    assert(trackRender.options > 0, `${label}: track fixture options`, JSON.stringify(trackRender));
    assert(trackRender.intents === 1, `${label}: track fixture click`, JSON.stringify(trackRender));
    record("dossier-l6 track fixture", `renders offline: title + ${trackRender.options} option(s), one choose-option click observed`);
    ok(`${label}: criterion 1 standalone third — track fixture renders offline with one click observed`);
  } else {
    record(
      "dossier-l6 track fixture",
      "blocked: no dossier-track.json — both store decisions refuse the readability gate (Task 7 STOP, exit 1); the standalone offline render is witnessed on the six committed fixtures instead",
    );
    const offline = await page.evaluate(() => ({
      title: document.getElementById("l6-reco").shadowRoot.querySelector("[data-st-dossier-title]").textContent,
      options: document.getElementById("l6-reco").shadowRoot.querySelectorAll("[data-option-id]").length,
    }));
    assert(offline.options === 2, `${label}: offline render`, JSON.stringify(offline));
    ok(`${label}: criterion 1 standalone third — committed fixtures render offline, track input blocked`);
  }
  assert(observed.consoleErrors.length === 0, `${label}: zero console errors`, observed.consoleErrors.slice(0, 3).join(" | "));
  assert(
    (await observed.violations()).length === 0,
    `${label}: zero CSP violations`,
    JSON.stringify(await observed.violations()).slice(0, 400),
  );
  ok(`${label}: zero console errors, zero CSP violations on the dossier page`);
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

console.log("");
console.log("MEASUREMENTS");
for (const line of measurements) console.log(`  ${line}`);
console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} AC-L2 Chromium assertion(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("AC-L2 Chromium suite: all assertions green.");
}
} finally {
  try {
    await browser.close();
  } catch { /* already closed */ }
  try {
    server.close();
  } catch { /* already closed */ }
  try {
    rmSync(work, { recursive: true, force: true });
  } catch { /* already removed */ }
  try {
    rmSync(chromiumProfile, { recursive: true, force: true });
  } catch { /* already removed */ }
}
