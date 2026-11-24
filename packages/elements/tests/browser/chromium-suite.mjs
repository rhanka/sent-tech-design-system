/**
 * AC-L2 Chromium suite (§15, json-render standard): the built browser bundle
 * under test — real Chromium via puppeteer-core, offline, local HTTP server.
 *
 * The suite builds the elements package when its browser or Focus kit
 * entry points are missing. Run with:
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
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderHtml } from "@sentropic/focus";
import { compareFocusMount } from "./focus-parity.mjs";

const { join } = path;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.resolve(HERE, "..", "..");
const WORKTREE_ROOT = path.resolve(PACKAGE_DIR, "..", "..");
const BROWSER_DIST = join(PACKAGE_DIR, "dist", "browser");
const FOCUS_DIST = join(PACKAGE_DIR, "dist", "focus-kit");
const SHELL_DIST = join(PACKAGE_DIR, "dist", "shells");
const FIXTURES = join(PACKAGE_DIR, "tests", "fixtures");
const THEMES_CSS = path.resolve(WORKTREE_ROOT, "packages", "themes", "css");
const BAR_CHART_SOURCE = path.resolve(WORKTREE_ROOT, "packages", "components-svelte", "src", "lib", "BarChart.svelte");
const ELEMENTS_ENTRY = join(BROWSER_DIST, "elements.js");
const DOSSIER_MOUNT_ENTRY = fileURLToPath(import.meta.resolve("@sentropic/design-system-elements/dossier-mount"));
const REVIEW_CORE_ENTRY = new URL(import.meta.resolve("@sentropic/design-system-review-core"));
const MARKDOWN_MODULE = new URL("../../dist/element/markdown/minimal-markdown.js", import.meta.url);
const FOCUS_KIT_MODULE = "@sentropic/design-system-elements/focus-kit";
const DOSSIER_VIEWS_MODULE = "@sentropic/design-system-elements/dossier-views";
const kitManifestUrl = new URL(import.meta.resolve("@sentropic/design-system-elements/focus-kit/manifest.json"));
const PDATA_FIXTURES = [1, 2, 3, 4, 5].map((n) => `bar-chart-pdata-${n}.json`);
const TIME_SERIES_FIXTURES = ["single", "multi", "thresholds"].map((name) => `time-series-${name}.json`);
const SHELL_FIXTURES = [
  ["BarChart", "st-bar-chart", "bar-chart-pdata-1.json", "svg"],
  ["DecisionDossier", "st-decision-dossier", "decision-dossier.json", "[data-st-dossier]"],
  ...TIME_SERIES_FIXTURES.map((name) => ["TimeSeriesChart", "st-time-series-chart", name, "table tbody tr"]),
];

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
const FOCUS_STRICT_CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'none'";
// Effective headers from sentropic 13490b16b: content/headers.ts plus the
// safe-mode worker-src appended in apps/artifact-content/src/host.ts.
const FOCUS_SAFE_CSP = [
  "default-src 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:", "connect-src 'self'", "font-src 'self'", "media-src 'self'", "base-uri 'none'",
  "form-action 'none'", "frame-ancestors 'none'", "worker-src 'none'",
].join("; ");
const FOCUS_APPLICATION_CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:",
  "font-src 'self'", "media-src 'self' blob:", "connect-src 'self'", "worker-src 'self'", "child-src 'self'",
  "frame-src 'none'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'",
].join("; ");
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
// Step 1 — the browser bundles and Node assembler under test.
// ---------------------------------------------------------------------------

const builtEntries = [ELEMENTS_ENTRY, DOSSIER_MOUNT_ENTRY, MARKDOWN_MODULE, new URL(import.meta.resolve(FOCUS_KIT_MODULE)),
  new URL(import.meta.resolve(DOSSIER_VIEWS_MODULE)), kitManifestUrl];
if (builtEntries.some((entry) => !existsSync(entry))) {
  const build = spawnSync(
    "npm",
    ["run", "build", "-w", "@sentropic/design-system-elements"],
    { cwd: WORKTREE_ROOT, encoding: "utf8" },
  );
  if (build.status !== 0) {
    console.error(`The elements package build failed (${build.status}).`);
    console.error((build.stdout ?? "") + (build.stderr ?? ""));
    process.exit(1);
  }
}
ok("bundle exists: dist/browser/elements.js");

const { assembleStandaloneDossier } = await import(FOCUS_KIT_MODULE);
const kitManifestBytes = readFileSync(kitManifestUrl, "utf8");
const kitManifest = JSON.parse(kitManifestBytes);
const { baseDigest, canonicalJson } = await import("@sentropic/focus/editing");
const { buildDossierViews } = await import(DOSSIER_VIEWS_MODULE);
assert(kitManifestBytes === canonicalJson(kitManifest), "Focus kit manifest is canonical RFC 8785", "serialized bytes differ");
const kitFiles = new Map(kitManifest.files.map((file) => [file.path, file]));
const emittedPaths = readdirSync(FOCUS_DIST, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile()).map((entry) => path.relative(FOCUS_DIST, join(entry.parentPath, entry.name))).sort();
assert(kitFiles.size === kitManifest.files.length &&
  JSON.stringify([...kitFiles.keys()].sort()) === JSON.stringify(emittedPaths),
  "Focus kit covers all emitted payload files", JSON.stringify(emittedPaths));
let kitBytes = 0;
for (const [name, file] of kitFiles) {
  const bytes = readFileSync(new URL(import.meta.resolve(`@sentropic/design-system-elements/focus-kit/${name}`)));
  const hash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  assert(bytes.length === file.size && hash === file.sha256, `Focus kit pins ${name}`, `${bytes.length} bytes, ${hash}`);
  kitBytes += bytes.length;
}
record("Focus kit K", `${kitBytes} bytes across ${kitFiles.size} files`);
const { version: reviewCoreVersion } = JSON.parse(readFileSync(new URL("../package.json", REVIEW_CORE_ENTRY), "utf8"));
assert(reviewCoreVersion === "0.1.1", "Focus parity uses review-core 0.1.1", reviewCoreVersion);

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

const tempRoot = join(WORKTREE_ROOT, "tmp");
mkdirSync(tempRoot, { recursive: true });
const work = mkdtempSync(join(tempRoot, "st-elements-suite-"));

// Chromium's singleton socket (process_singleton_posix.cc) is bound under
// TMPDIR as `org.chromium.Chromium.<random>/SingletonSocket`, and the Unix
// socket address is limited to ~108 bytes. The GitHub workspace path
// (/home/runner/work/<repo>/<repo>/tmp/st-elements-suite-...) made that
// socket path exceed the limit, so the publish `verify` job died with
// "FATAL ... Socket path too long" before publishing (elements-v0.3.0 and
// elements-v0.3.1). Root the profile, TMPDIR and XDG_RUNTIME_DIR in a short
// base instead: RUNNER_TEMP on GitHub runners, otherwise the repository
// tmp/ (local rule: no system /tmp). The other suite outputs (vite
// harness, server fixtures) stay under `work` in the repository tmp/.
// The profile directory IS the short base, which also keeps TMPDIR as
// short as the profile itself.
const chromiumBaseRoot = process.env.RUNNER_TEMP && process.env.RUNNER_TEMP.trim() !== ""
  ? process.env.RUNNER_TEMP
  : tempRoot;
mkdirSync(chromiumBaseRoot, { recursive: true });
// Shortest prefix: every character here is added to the socket path.
const chromiumBase = mkdtempSync(join(chromiumBaseRoot, "c-"));
const chromiumProfile = chromiumBase;
const chromiumRuntime = join(chromiumBase, "runtime");
const chromiumTmp = chromiumBase;
const SINGLETON_SOCKET_PATH = join(chromiumProfile, "SingletonSocket");
if (SINGLETON_SOCKET_PATH.length > 100) {
  throw new Error(
    `Chromium singleton socket path exceeds 100 characters (${SINGLETON_SOCKET_PATH.length}): ${SINGLETON_SOCKET_PATH}. ` +
    "Chromium binds its singleton socket under TMPDIR and the Unix socket limit is ~108 bytes; shorten the directory rooting " +
    "the Chromium profile (RUNNER_TEMP on GitHub runners, otherwise the repository tmp/ fallback is too shallow) and retry.",
  );
}
const focusReport = readFileSync(join(FIXTURES, "focus-artifact", "report.json"), "utf8");
const focusB5 = readFileSync(join(FIXTURES, "focus-artifact", "b5.json"), "utf8");
function diagramOptions(doc) {
  const views = buildDossierViews(doc, kitManifest);
  if (views === undefined) return undefined;
  return {
    views,
    manifest: {
      contract: "focus-dossier/1", document: { digest: views.documentDigest }, renderer: { digest: views.rendererDigest },
      derived: [{ path: "views.json", digest: baseDigest(views),
        bytes: Buffer.byteLength(canonicalJson(views)), mimeType: "application/json" }],
    },
  };
}

const diagramSection = {
  id: "fold-diagram", kind: "diagram", targetRef: "focus-test", alt: "Foldable review process",
  syntax: "mermaid", source: "The embedded scene is authoritative.",
  scene: {
    documentId: "document:review-process", schemaVersion: { major: 1, minor: 1 }, revision: 0,
    profileRefs: ["generic@1"], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
    entities: Object.fromEntries([["group", "Review team", "container"], ["child", "Editor", "node"], ["outside", "Reader", "node"]]
      .map(([id, value, type]) => [`entity:${id}`, { id: `entity:${id}`, profile: "generic@1", type,
        attributes: { name: { kind: "text", value } } }])),
    relations: Object.fromEntries([
      ["membership", "contains", "parent", "group", "child", "child", {}],
      ["delivery", "link", "source", "child", "target", "outside", { label: { kind: "text", value: "shares draft" } }],
    ].map(([id, type, fromRole, from, toRole, to, attributes]) => [`relation:${id}`, {
      id: `relation:${id}`, profile: "generic@1", type, attributes,
      endpoints: [{ role: fromRole, target: `entity:${from}` }, { role: toRole, target: `entity:${to}` }],
    }])),
  },
};
const foldDoc = JSON.parse(focusB5);
foldDoc.sections.push(diagramSection);
const foldPayload = diagramOptions(foldDoc);
const sizingDoc = JSON.parse(focusB5);
sizingDoc.sections.push({
  id: "sizing-diagram", kind: "diagram", targetRef: "focus-test", alt: "Five box sizing scene",
  syntax: "mermaid", source: "The embedded scene is authoritative.",
  scene: {
    documentId: "document:sizing", schemaVersion: { major: 1, minor: 1 }, revision: 0,
    profileRefs: ["generic@1"], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
    entities: Object.fromEntries(["alpha", "bravo", "charlie", "delta", "echo"]
      .map((id) => [`entity:${id}`, { id: `entity:${id}`, profile: "generic@1", type: "node",
        attributes: { name: { kind: "text", value: `Box ${id}` } } }])),
    relations: Object.fromEntries(["alpha", "bravo", "charlie", "delta"]
      .map((id, index) => [`relation:${id}`, { id: `relation:${id}`, profile: "generic@1", type: "link", attributes: {},
        endpoints: [{ role: "source", target: `entity:${id}` },
          { role: "target", target: `entity:${["bravo", "charlie", "delta", "echo"][index]}` }] }])),
  },
});
const sizingPayload = diagramOptions(sizingDoc);
const diagramPages = new Map(["safe", "application", "strict"].map((mode) => [`diagram-${mode}`, {
  mode, doc: foldDoc, ...foldPayload, fold: true,
}]));
diagramPages.set("diagram-sizing", { mode: "strict", doc: sizingDoc, ...sizingPayload });
diagramPages.set("diagram-refusal", {
  mode: "strict", doc: foldDoc, ...foldPayload, refuse: true,
  manifest: { ...foldPayload.manifest, renderer: { digest: baseDigest("different renderer") } },
});
const referencePaths = process.env.ST_FOCUS_REFERENCE_DOSSIERS?.split(path.delimiter) ?? [];
if (referencePaths.length !== 0 && referencePaths.length !== 2) throw new Error("Expected both Focus reference dossiers");
for (const [index, reference] of referencePaths.entries()) {
  const original = readFileSync(reference);
  const doc = JSON.parse(original);
  const payload = diagramOptions(doc);
  const first = canonicalJson(payload.views);
  const second = canonicalJson(diagramOptions(JSON.parse(original)).views);
  assert(first === second && readFileSync(reference).equals(original), "Reference build is reproducible", reference);
  record(`Focus reference ${index + 1}`, `source SHA-256 ${createHash("sha256").update(original).digest("hex")}, views SHA-256 ${createHash("sha256").update(first).digest("hex")}, ${Buffer.byteLength(first)} bytes`);
  diagramPages.set(`diagram-reference-${index + 1}`, { mode: "strict", doc, ...payload });
}
const offlineDocument = canonicalJson({ ...JSON.parse(focusReport), subject: "Source contains </script> · 漢字" });
const standalone = join(work, "focus-standalone.html");
writeFileSync(standalone, assembleStandaloneDossier({ document: offlineDocument }));
const standaloneDiagrams = join(work, "focus-diagrams-standalone.html");
writeFileSync(standaloneDiagrams, assembleStandaloneDossier({
  document: canonicalJson(foldDoc), manifest: canonicalJson(foldPayload.manifest), views: canonicalJson(foldPayload.views),
}));
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
  const dir = TIME_SERIES_FIXTURES.includes(name) ? join(PACKAGE_DIR, "fixtures") : FIXTURES;
  return readFileSync(join(dir, name), "utf8");
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
  "/focus-mount-host.html": '<!doctype html><title>Focus mount host</title><link rel="stylesheet" href="/focus-kit/strict/renderer/dossier.css"><main data-st-dossier-page data-st-theme="sent-tech"></main>',
  "/focus-review.html": pageHtml(FOCUS_SAFE_CSP, `
    <link rel="stylesheet" href="/focus-kit/safe/renderer/dossier.css">
    <script type="application/octet-stream" data-st-dossier-document>${Buffer.from(focusB5).toString("base64")}</script>
    <main data-st-dossier-page data-st-theme="sent-tech" aria-busy="true"></main>
    <script type="module">
      window.__reviewRows = [];
      window.__reviewSeq = 0;
      const adapter = {
        async list() { return window.__reviewRows.map((row) => row.view); },
        async create({ target, body }) {
          const id = "c-" + (++window.__reviewSeq);
          const threadId = "t-" + window.__reviewSeq;
          const row = { id, threadId, target, body, state: "open" };
          const view = { id, threadId, tenant: { workspaceId: "workspace-fixture" }, target,
            author: { id: "user-alice" }, state: "open", body, createdAt: new Date().toISOString(),
            authorship: { author: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" } } };
          row.view = view; window.__reviewRows.push(row); return view;
        },
        async reply({ threadId, body }) {
          const id = "c-" + (++window.__reviewSeq);
          const original = window.__reviewRows.find((row) => row.threadId === threadId);
          const view = { id, threadId, tenant: { workspaceId: "workspace-fixture" }, target: original.target,
            author: { id: "user-alice" }, state: "open", body, createdAt: new Date().toISOString(),
            authorship: { author: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" } } };
          window.__reviewRows.push({ id, threadId, target: original.target, body, state: "open", view });
          return view;
        },
        async setState(tenant, threadId, state) {
          for (const row of window.__reviewRows) {
            if (row.threadId === threadId) { row.state = state; row.view.state = state; }
          }
        },
      };
      window.__stDossierReview = { adapter, tenant: "workspace-fixture",
        target: { kind: "artifact", id: "art-focus-test" },
        currentUser: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" },
        mode: "review" };
    </script>
    <script type="module" src="/focus-kit/safe/renderer/dossier.js"></script>
  `),
  "/pilot.html": pageHtml(PILOT_CSP, pilotBody()),
  "/time-series.html": pageHtml(STRICT_CSP, `
    ${TIME_SERIES_FIXTURES.map((name) => elementWithIsland("st-time-series-chart", name, name)).join("\n")}
    ${mutatedIsland("st-time-series-chart", "near-equal-values", TIME_SERIES_FIXTURES[0], (envelope) => {
      const values = [1000000000, 1000000000.0000002, 1000000000.0000005];
      envelope.root.series[0].data = envelope.root.series[0].data.slice(0, values.length)
        .map((point, index) => ({ ...point, y: values[index] }));
    })}
    ${mutatedIsland("st-time-series-chart", "colliding-series-labels", TIME_SERIES_FIXTURES[1], (envelope) => {
      for (const series of envelope.root.series) series.label = "Sensor";
      envelope.root.series.push({ id: "third", label: "Sensor (east)", data: [{ x: 1767229200000, y: 30 }] });
      envelope.root.series.push({ id: "fourth", label: "Sensor [ID: east]", data: [{ x: 1767229200001, y: 30 }] });
      envelope.root.series.push({ id: "east ", label: "Sensor", data: [{ x: 1767229200001, y: 30 }] });
    })}
    <script type="module" src="/bundle/elements.js"></script>
  `),
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

for (const [component, , fixture] of SHELL_FIXTURES) {
  const html = readFileSync(join(SHELL_DIST, `${component}.html`), "utf8");
  PAGES[`/shell/${fixture}`] = html.replace("<!-- st-envelope -->", () => islandScript(readFixture(fixture)));
}

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
  const focusRoute = url.pathname.match(/^\/focus-kit\/(safe|application|strict|diagram-[a-z0-9-]+)\/(.*)$/);
  const reviewCoreModule = url.pathname.match(/^\/focus-review-core\/([\w-]+\.js)$/);
  if (focusRoute !== null) {
    const [, page, asset] = focusRoute;
    const diagramPage = diagramPages.get(page);
    const mode = diagramPage?.mode ?? page;
    const name = asset || kitManifest.entrypoint;
    const entry = kitFiles.get(name);
    const payload = diagramPage === undefined ? undefined : {
      "dossier.json": diagramPage.doc, "focus.manifest.json": diagramPage.manifest, "views.json": diagramPage.views,
    }[name];
    if (name === "dossier.json" || entry !== undefined || payload !== undefined) {
      const mime = entry?.mimeType ?? "application/json";
      const body = payload !== undefined ? canonicalJson(payload)
        : name === "dossier.json" ? (mode === "strict" ? focusReport : focusB5) : readFileSync(join(FOCUS_DIST, name));
      const csp = mode === "application" ? FOCUS_APPLICATION_CSP
        : mime !== "text/html" ? undefined : mode === "safe" ? FOCUS_SAFE_CSP : FOCUS_STRICT_CSP;
      res.writeHead(200, {
        "content-type": mime.startsWith("text/") ? `${mime}; charset=utf-8` : mime,
        "content-length": Buffer.byteLength(body),
        "x-content-type-options": "nosniff",
        "cross-origin-resource-policy": "same-origin",
        "cache-control": "no-store",
        "x-frame-options": "DENY",
        "referrer-policy": "no-referrer",
        ...(csp === undefined ? {} : { "content-security-policy": csp }),
      });
      res.end(body);
      return;
    }
  } else if (reviewCoreModule !== null) file = fileURLToPath(new URL(reviewCoreModule[1], REVIEW_CORE_ENTRY));
  else if (url.pathname === "/focus-mount.js") file = DOSSIER_MOUNT_ENTRY;
  else if (url.pathname.startsWith("/bundle/")) file = join(BROWSER_DIST, url.pathname.slice("/bundle/".length));
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

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ---------------------------------------------------------------------------
// Step 4 — Chromium.
// ---------------------------------------------------------------------------

const puppeteer = await import("puppeteer-core");
// chromiumProfile/chromiumRuntime/chromiumTmp are defined with the short
// base above (RUNNER_TEMP on GitHub runners, repository tmp/ locally) so the
// singleton socket path stays within the Unix limit. `work` (the vite
// harness and server fixtures) stays under the repository tmp/.
let browser;
// Everything below runs inside try/finally: the server and the work dir
// (including the profile) are cleaned up even when a page operation throws,
// like RichTextEditor.browser.test.mjs (a top-level `process.exit` would
// skip `finally`, so failures set `process.exitCode` instead).
try {
mkdirSync(chromiumRuntime, { mode: 0o700 });
browser = await puppeteer.default.launch({
  executablePath: findChrome(),
  headless: "new",
  userDataDir: chromiumProfile,
  env: { ...process.env, TMPDIR: chromiumTmp, XDG_RUNTIME_DIR: chromiumRuntime },
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

/**
 * One observed page: console + CSP partitioning with the U-12 offline rule.
 * jsDelivr requests are aborted (nothing leaves the machine) and their
 * console failures are recorded as the EXPECTED degradation, not failures.
 */
async function openPage(name, { offline = false } = {}) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const consoleErrors = [];
  const cspViolations = [];
  const requests = [];
  const failedAssets = [];
  const workers = [];
  page.on("workercreated", (worker) => workers.push(worker.url()));
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
    window.__focusReady = [];
    document.addEventListener("st-dossier-ready", ({ detail }) => window.__focusReady.push(detail.reviewRoot));
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
    const url = new URL(request.url());
    if (["http:", "https:"].includes(url.protocol) && (offline || url.origin !== BASE)) {
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
  const response = await page.goto(offline ? name : `${BASE}${name}`, { waitUntil: "load", timeout: 60000 });
  return {
    page,
    response,
    workers,
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
      value = await page.evaluate(`Boolean((${fn})())`);
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
// The packaged temporal element under strict CSP.
{
  const observed = await openPage("/time-series.html");
  const mounts = await observed.page.evaluate(async () => {
    return Promise.all([...document.querySelectorAll("st-time-series-chart")].map(async (element) => {
      await element.ready;
      const root = element.shadowRoot;
      return {
        id: element.id,
        state: element.state ?? null,
        rows: [...(root?.querySelectorAll("table tbody tr") ?? [])].map((row) =>
          [...row.cells].map((cell) => cell.textContent.trim())),
        headings: [...(root?.querySelectorAll("h3") ?? [])].map((heading) => heading.innerText),
        series: [...(root?.querySelectorAll('[role="img"]') ?? [])].map((chart) => {
          const line = chart.querySelector("path.st-lineChart__line");
          return {
            label: chart.getAttribute("aria-label"),
            points: [...chart.querySelectorAll("circle[data-chart-index]")].map((point) =>
              [Number(point.getAttribute("cx")), Number(point.getAttribute("cy"))]),
            stroke: line && getComputedStyle(line).stroke,
          };
        }),
        overlays: [...(root?.querySelectorAll("svg text") ?? [])].map((label) => label.textContent.trim()),
      };
    }));
  });
  for (const [index, name] of TIME_SERIES_FIXTURES.entries()) {
    const { root } = JSON.parse(readFixture(name));
    const expectedRows = root.series.flatMap((series) => series.data.map(({ x, y }) => [x, series.label, series.id, String(y)]))
      .sort(([left], [right]) => left - right)
      .map(([x, label, id, value]) => [new Date(x).toISOString(), label, id, value]);
    const mount = mounts[index];
    assert(mount.state === "rendered", name, `expected rendered, got ${mount.state}`);
    assert(JSON.stringify(mount.rows) === JSON.stringify(expectedRows), name, `table differs: ${JSON.stringify(mount.rows)}`);
    assert(mount.series.length === root.series.length && mount.series.every((series, i) =>
      series.label === root.series[i].label && series.points.length === root.series[i].data.length &&
      series.points.flat().every(Number.isFinite) && series.stroke && series.stroke !== "none" &&
      series.points.every(([, cy], pointIndex) => series.points.every(([, otherY], otherIndex) =>
        Math.sign(otherY - cy) === Math.sign(root.series[i].data[pointIndex].y - root.series[i].data[otherIndex].y)))),
    name, `plot differs: ${JSON.stringify(mount.series)}`);
  }
  // The shared three-hour domain spans x=44 to x=464, so each hour is 140 px.
  // The y axes for this fixture span values 5 to 25 over y=208 to y=12.
  const multiPoints = mounts[1].series.map(({ points }) => points);
  const expectedPoints = [
    [[44, 159], [184, 51.2], [464, 110]],
    [[184, 119.8], [324, 178.6], [464, 61]],
  ];
  assert(multiPoints.length === expectedPoints.length && multiPoints.every((points, seriesIndex) =>
    points.length === expectedPoints[seriesIndex].length && points.every((point, pointIndex) =>
      point.every((coordinate, axis) => Math.abs(coordinate - expectedPoints[seriesIndex][pointIndex][axis]) < 0.01))),
  "time-series: proportional coordinates", `expected ${JSON.stringify(expectedPoints)}, got ${JSON.stringify(multiPoints)}`);
  const nearEqual = mounts.find(({ id }) => id === "near-equal-values");
  const nearEqualPoints = nearEqual.series[0]?.points ?? [];
  assert(nearEqual.state === "rendered" && nearEqualPoints.length === 3 &&
    nearEqualPoints[0][1] > nearEqualPoints[1][1] && nearEqualPoints[1][1] > nearEqualPoints[2][1],
    "time-series: near-equal values", `plot differs: ${JSON.stringify(nearEqual)}`);
  const collidingLabels = mounts.find(({ id }) => id === "colliding-series-labels");
  const sharedInstant = "2026-01-01T01:00:00.000Z";
  const collidingRows = collidingLabels.rows.filter(([instant]) => instant === sharedInstant);
  assert(collidingLabels.state === "rendered" && JSON.stringify(collidingRows) === JSON.stringify([
    [sharedInstant, "Sensor", "east", "21"],
    [sharedInstant, "Sensor", "west", "14"],
    [sharedInstant, "Sensor (east)", "third", "30"],
  ]), "time-series: colliding labels retain series IDs", `table differs: ${JSON.stringify(collidingRows)}`);
  const expectedNames = ["Sensor [ID: east] (2)", "Sensor [ID: west]", "Sensor (east)", "Sensor [ID: east]", "Sensor [ID: east\\u0020]"];
  const headingsMatch = assert(JSON.stringify(collidingLabels.headings) === JSON.stringify(expectedNames),
    "time-series: duplicate labels have distinct headings", JSON.stringify(collidingLabels.headings));
  const accessibleNames = collidingLabels.series.map(({ label }) => label);
  const namesMatch = assert(JSON.stringify(accessibleNames) === JSON.stringify(expectedNames),
    "time-series: duplicate labels have distinct SVG names", JSON.stringify(accessibleNames));
  if (headingsMatch && namesMatch) ok("time-series: duplicate labels distinguish headings and SVG names");
  assert(["Warning", "Deployment", "Expected range", "Goal"].every((label) => mounts[2].overlays.includes(label)),
    "time-series: overlays", `missing labels: ${JSON.stringify(mounts[2].overlays)}`);
  assert(observed.requests.every((url) => !url.includes("/chunks/bpmn-")), "time-series: isolated", "requested a BPMN chunk");
  const otherErrors = observed.consoleErrors.filter((error) => !error.includes("style-src"));
  assert(otherErrors.length === 0, "time-series: zero other console errors", otherErrors.join(" | "));
  const violations = await observed.violations();
  assert(violations.every((violation) => violation.directive.startsWith("style-src")),
    "time-series: strict CSP", JSON.stringify(violations));
  await observed.close();
}

// Each qualified shell renders its fixture with one document request.
for (const [component, tag, fixture, selector] of SHELL_FIXTURES) {
  const pathname = `/shell/${fixture}`;
  const observed = await openPage(pathname);
  const label = `${component} shell, ${fixture}`;
  await waitFor(observed.page, `() => document.querySelector(${JSON.stringify(tag)})?.shadowRoot?.querySelector(${JSON.stringify(selector)})`,
    20000, label);
  assert(observed.requests.every((url) => url === BASE + pathname), label, `unexpected requests: ${observed.requests.join(", ")}`);
  assert(observed.consoleErrors.length === 0, label, observed.consoleErrors.join(" | "));
  const violations = await observed.violations();
  assert(violations.length === 0, label, JSON.stringify(violations));
  ok(label);
  await observed.close();
}

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
// Focus kit payload and standalone assembler.
// ---------------------------------------------------------------------------

{
  const observed = await openPage("/focus-mount-host.html");
  const doc = JSON.parse(readFileSync(join(FIXTURES, "focus-artifact", "decision-v2.json"), "utf8"));
  const state = await observed.page.evaluate(async (hostDocument, shellDocument, options) => {
    const host = document.querySelector("[data-st-dossier-page]");
    let reads = 0;
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    window.fetch = () => {
      reads++;
      return pending;
    };
    const { mountDossier } = await import("/focus-mount.js");
    const dossier = mountDossier(host);
    dossier.render(hostDocument, options);
    const root = dossier.reviewRoot;
    release({ ok: true, json: async () => shellDocument });
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {
      reads,
      ready: window.__focusReady.length,
      connected: root.parentElement === host,
      title: host.querySelector("h1")?.textContent,
    };
  }, doc, JSON.parse(focusB5), diagramOptions(doc));
  const label = "Public Focus mount leaves bootstrap to the host";
  if (assert(state.reads === 0 && state.ready === 1 && state.connected && state.title === "Decision with embedded evidence",
    label, JSON.stringify(state))) ok(label);
  await observed.close();
}

{
  const { renderMarkdown } = await import(MARKDOWN_MODULE.href);
  const observed = await openPage("/focus-mount-host.html");
  const fixtureDir = join(FIXTURES, "focus-artifact");
  const fixtures = new Map(readdirSync(fixtureDir).filter((file) => file.endsWith(".json"))
    .map((file) => [file, JSON.parse(readFileSync(join(fixtureDir, file), "utf8"))]));
  fixtures.set("dossier-annotated.json", JSON.parse(readFixture("dossier-annotated.json")).root.document);
  const report = fixtures.get("report.json");
  fixtures.set("report with an unanchored backRef", {
    ...report,
    sections: report.sections.map((section) => ({ ...section, targetRef: "shared-target" })),
    annexes: report.annexes.map((annex) => ({ ...annex, backRefs: [...annex.backRefs, "shared-target"] })),
  });
  const decision = fixtures.get("decision-v2.json");
  fixtures.set("decision-v2 with glossary and amendments", {
    ...decision,
    readability: { ...decision.readability, glossary: [{ term: "Contract", definition: "The shared rendering rules." }] },
    sections: [...decision.sections, {
      kind: "amendmentTrace", id: "prior-amendments", targetRef: decision.ref,
      steps: [{ at: "2026-11-01T09:00:00Z", author: "Noor Benali", summary: "Added build evidence." }],
    }],
    amendmentTrace: [{ at: "2026-11-03T12:34:00Z", author: "Camille Martin", summary: "Recorded the chosen contract." }],
  });
  for (const [name, doc] of fixtures) {
    const label = `Packaged Focus mount content matches Focus 0.6 for ${name}`;
    try {
      const ownerHtml = renderHtml(doc, { renderMarkdown: (source) => renderMarkdown(source, true), sanitizeHtml: (html) => html });
      const differences = await observed.page.evaluate(compareFocusMount, doc, ownerHtml, diagramOptions(doc));
      if (assert(differences.length === 0, label, differences.join("\n"))) ok(label);
    } catch (error) {
      assert(false, label, String(error));
    }
  }
  await observed.close();
}

for (const [label, url, offline] of [
  ["Focus strict", "/focus-kit/strict/#annex%3Ameasurements", false],
  ["Focus standalone", `${pathToFileURL(standalone).href}#annex%3Ameasurements`, true],
]) {
  const observed = await openPage(url, { offline });
  const page = observed.page;
  await page.waitForFunction(() => window.__focusReady.length > 0, { timeout: 2000 });
  const state = await page.evaluate(() => {
    const root = document.querySelector("[data-st-dossier]");
    const annex = root.querySelector('[data-anchor-id="annex:measurements"]');
    return {
      title: root.querySelector("header h1").textContent,
      ready: window.__focusReady.length === 1 && window.__focusReady[0] === root && root.getRootNode() === document,
      open: annex.open,
      focused: document.activeElement === annex,
      styled: getComputedStyle(annex.querySelector("td")).borderTopWidth === "1px",
      styles: document.querySelectorAll("style").length,
      imageWidth: root.querySelector('img[alt="Rendered preview"]').naturalWidth,
      embedded: document.querySelector("script[data-st-dossier-document]")?.textContent,
    };
  });
  assert(state.title === "Build report" && state.ready && state.open && state.focused && state.styled &&
    state.styles === Number(offline) && state.imageWidth === 1, label, JSON.stringify({ ...state, embedded: Boolean(state.embedded) }));
  if (offline) {
    assert(Buffer.from(state.embedded ?? "", "base64").toString("utf8") === offlineDocument,
      "Focus standalone preserves canonical JSON bytes", "embedded bytes differ");
  }
  const annex = await page.$('[data-anchor-id="annex:measurements"]');
  await annex.evaluate((details) => { details.open = false; });
  const outline = await page.accessibility.snapshot({ root: annex, interestingOnly: false });
  const hasHeading = (node) => (node?.role === "heading" && node.name === "Measurements" && node.level === 2) ||
    node?.children?.some(hasHeading);
  const headingLabel = `${label}: collapsed annex exposes its level-two heading`;
  if (assert(hasHeading(outline), headingLabel, JSON.stringify(outline))) ok(headingLabel);
  const annexReference = await annex.evaluate((details) => {
    details.open = true;
    const link = details.querySelector('a[href="#shared-input"]');
    link?.click();
    return link?.textContent;
  });
  const referenceLabel = `${label}: annex reference preserves its label and citation link`;
  if (assert(annexReference === "Shared input", referenceLabel, JSON.stringify(annexReference))) {
    await page.waitForFunction(() => document.activeElement?.dataset.anchorId === "shared-input", { timeout: 2000 });
    ok(referenceLabel);
  }
  const hasSourceLink = await page.evaluate(() => {
    const link = document.querySelector('[data-anchor-id="single-build"] a[href="#build-log"]');
    link?.click();
    return link !== null;
  });
  if (assert(hasSourceLink, `${label}: citation links to its embedded source`, "missing #build-log link")) {
    await page.waitForFunction(() => document.activeElement?.dataset.anchorId === "build-log" &&
      document.activeElement.open, { timeout: 2000 });
    ok(`${label}: citation opens and focuses its embedded source`);
  }
  const network = observed.requests.filter((request) => /^https?:/.test(request));
  const external = network.filter((request) => offline || new URL(request).origin !== BASE);
  const violations = await observed.violations();
  assert(external.length === 0 && violations.length === 0 && observed.consoleErrors.length === 0,
    `${label}: no external requests, CSP violations or console errors`,
    JSON.stringify({ external, violations, errors: observed.consoleErrors }));
  record(label, `${external.length} external requests, ${violations.length} CSP violations`);
  await observed.close();
}

for (const [mode, policy] of [["safe", FOCUS_SAFE_CSP], ["application", FOCUS_APPLICATION_CSP]]) {
  const observed = await openPage(`/focus-kit/${mode}/#B`);
  const page = observed.page;
  await page.waitForFunction(() => window.__focusReady.length > 0, { timeout: 2000 });
  const state = await page.evaluate(() => {
    const [root] = window.__focusReady;
    const block = root.querySelector('[data-anchor-id="B"]');
    const containingAnchor = (selector) => root.querySelector(selector)
      ?.closest("[data-anchor-id][data-commentable]")?.dataset.anchorId;
    return {
      ready: window.__focusReady.length,
      lightDom: root.getRootNode() === document,
      ids: [...root.querySelectorAll(":scope > [data-anchor-id]")].map((child) => child.dataset.anchorId),
      descendants: ["header h1", '[data-anchor-id="B"] p strong', "li strong", "table td strong"].map(containingAnchor),
      focused: document.activeElement === block,
      styled: getComputedStyle(block.querySelector("td")).borderTopWidth === "1px",
      styles: document.querySelectorAll("style").length,
      noReviewLayer: document.querySelector(".st-review-layer") === null && document.querySelector("[data-st-dossier-review]") === null,
    };
  });
  assert(observed.response?.headers()["content-security-policy"] === policy, `Focus ${mode}: effective CSP`, "policy mismatch");
  assert(state.ready === 1 && state.lightDom && state.focused && state.styled && state.styles === 0 && state.noReviewLayer &&
    state.ids.join(",") === "focus-test,A,B,C" && state.descendants.join(",") === "focus-test,B,B,B",
    `Focus ${mode}: B5 fixture`, JSON.stringify(state));
  const external = observed.requests.filter((request) => /^https?:/.test(request) && new URL(request).origin !== BASE);
  const blobs = observed.requests.filter((request) => request.startsWith("blob:"));
  const violations = await observed.violations();
  assert(external.length === 0 && violations.length === 0 && observed.consoleErrors.length === 0 &&
    blobs.length === 0 && observed.workers.length === 0, `Focus ${mode}: clean B5 load`,
    JSON.stringify({ external, violations, errors: observed.consoleErrors, blobs, workers: observed.workers }));
  record(`Focus ${mode} B5`, `${external.length} external requests, ${violations.length} CSP violations, ${observed.workers.length} workers`);
  await observed.close();
}

for (const [url, fixture, offline] of [
  ...[...diagramPages].map(([name, fixture]) => [`/focus-kit/${name}/`, fixture, false]),
  [pathToFileURL(standaloneDiagrams).href, { mode: "standalone", views: foldPayload.views, fold: true }, true],
]) {
  const observed = await openPage(url, { offline });
  const { page } = observed;
  await page.waitForSelector(fixture.refuse ? '[role="alert"]' : "[data-st-diagram] svg", { timeout: 2000 });
  if (fixture.refuse) {
    assert(await page.evaluate(() => window.__focusReady.length === 0 && !document.querySelector("[data-st-diagram]")),
      "Focus diagram refusal", "mismatched companion became visible");
  } else {
    const snapshot = () => page.evaluate(() => Array.from(document.querySelectorAll("[data-st-diagram]"), (figure) => {
      const svg = figure.querySelector(".st-dossier__diagramViewport > svg");
      const text = [...svg.querySelectorAll("text")];
      const clipped = text.filter((node) => {
        const box = node.getBoundingClientRect();
        const frame = node.ownerSVGElement.getBoundingClientRect();
        if (box.left < frame.left - 1 || box.right > frame.right + 1 ||
            box.top < frame.top - 1 || box.bottom > frame.bottom + 1) return true;
        const container = node.closest("[data-scene-occurrence], [data-scene-label]")?.querySelector("rect");
        if (container !== undefined && container !== null) {
          const containerBox = container.getBoundingClientRect();
          if (box.left < containerBox.left - 1 || box.right > containerBox.right + 1 ||
              box.top < containerBox.top - 1 || box.bottom > containerBox.bottom + 1) return true;
        }
        return false;
      }).map((node) => node.textContent);
      return {
        id: figure.dataset.stDiagram,
        nodes: svg.querySelectorAll("[data-scene-occurrence]").length,
        edges: svg.querySelectorAll("[data-scene-edge]").length,
        labels: svg.querySelectorAll("[data-scene-label]").length,
        text: text.map((node) => node.textContent).join(" "),
        clipped,
        source: figure.querySelector("pre") !== null,
        overflow: svg.querySelector("[data-card-overflow], [data-zone-overflow]") !== null,
        painted: svg.getBoundingClientRect().width > 0 && svg.getBoundingClientRect().height > 0,
      };
    }));
    const expected = Object.entries(fixture.views.diagrams).map(([id, { scene }]) => ({
      id, nodes: Object.keys(scene.entities).length,
      edges: Object.values(scene.relations).filter(({ type }) => type === "link").length,
      labels: Object.values(scene.relations).filter(({ attributes }) => Boolean(attributes.label?.value.trim())).length,
    }));
    const expanded = await snapshot();
    assert(expanded.length === expected.length && expanded.every((drawing, index) => {
      const { id, nodes, edges, labels } = expected[index];
      return drawing.id === id && drawing.nodes === nodes && drawing.edges === edges && drawing.labels === labels &&
        drawing.painted && !drawing.source && !drawing.overflow && drawing.clipped.length === 0;
    }), `Focus diagram expanded ${url}`, JSON.stringify(expanded));
    if (fixture.fold) {
      const button = await page.$('[data-st-diagram] button[aria-expanded="true"]');
      await button.click();
      const [folded] = await snapshot();
      assert(folded.nodes === 2 && folded.edges === 1 && folded.labels === 1 && folded.painted && !folded.overflow && folded.clipped.length === 0 &&
        !folded.text.includes("Editor") && folded.text.includes("shares draft"),
      `Focus diagram folded ${url}`, JSON.stringify(folded));
      await button.click();
      assert(JSON.stringify(await snapshot()) === JSON.stringify(expanded), `Focus diagram expands again ${url}`, "the expanded scene changed");
    }
  }
  const external = observed.requests.filter((request) => /^https?:/.test(request) && (offline || new URL(request).origin !== BASE));
  const violations = await observed.violations();
  assert(external.length === 0 && observed.workers.length === 0 && violations.length === 0 && observed.consoleErrors.length === 0,
    `Focus diagram CSP ${url}`, JSON.stringify({ external, workers: observed.workers, violations, errors: observed.consoleErrors }));
  record(offline ? "Focus diagram standalone" : url, `${external.length} external requests, ${observed.workers.length} workers, ${violations.length} CSP violations`);
  await observed.close();
}

// ---------------------------------------------------------------------------
// FA-D3 review layer in the compiled kit (B5-1..6 on the real kit page).
// ---------------------------------------------------------------------------

{
  const reviewJs = readFileSync(join(FOCUS_DIST, "renderer", "dossier.js"), "utf8");
  const label = "Focus kit ships CommentLayer with explicit-aid anchors";
  const notFoundCount = (reviewJs.match(/not-found/g) ?? []).length;
  // 0.1.1 emits three "not-found" orphan returns; 0.1.0 emits two and
  // falls through to the selector slot on a missing aid. Live B5-2 below
  // exercises that branch directly in the compiled kit.
  if (assert(reviewJs.includes("st-review-layer__hover-outline") && reviewJs.includes("a1:") &&
    notFoundCount >= 3 && !reviewJs.includes("VennChart") && !reviewJs.includes("ConditionalFormatting"),
    label, `${Buffer.byteLength(reviewJs, "utf8")} bytes, ${notFoundCount} not-found`)) ok(label);
  // K is recalculated in exact UTF-8 bytes over every emitted file of the review kit.
  const reviewKitSizes = [...kitFiles.keys()].sort().map((filePath) => {
    const bytes = readFileSync(join(FOCUS_DIST, filePath)).length;
    return { path: filePath, bytes };
  });
  const reviewKitTotal = reviewKitSizes.reduce((sum, entry) => sum + entry.bytes, 0);
  if (assert(reviewKitTotal === kitBytes && reviewKitSizes.length === kitManifest.files.length,
    "Focus review kit K matches all emitted kit files", JSON.stringify({ reviewKitTotal, kitBytes, reviewKitSizes }))) {
    ok("Focus review kit K matches all emitted kit files");
  }
  record(
    "Focus review kit graph",
    `CommentLayer closure present, unrelated barrel components absent; K=${reviewKitTotal} bytes (${reviewKitSizes.map(({ path: p, bytes }) => `${p}: ${bytes}`).join(", ")})`,
  );
  const elementsPkg = JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf8"));
  const installedSvelte = JSON.parse(
    readFileSync(join(PACKAGE_DIR, "node_modules", "@sentropic", "design-system-svelte", "package.json"), "utf8"),
  );
  assert(
    elementsPkg.dependencies["@sentropic/design-system-svelte"] === "0.43.2" &&
      installedSvelte.version === "0.43.2" &&
      installedSvelte.dependencies["@sentropic/design-system-review-core"] === "0.1.0",
    "Focus review hover qualification pins svelte 0.43.2 with nested review-core 0.1.0",
    JSON.stringify({ dep: elementsPkg.dependencies["@sentropic/design-system-svelte"], installed: installedSvelte.version, nestedCore: installedSvelte.dependencies["@sentropic/design-system-review-core"] }),
  );
  record(
    "Focus review hover qualification",
    `svelte ${installedSvelte.version} (plan names 0.43.0/0.43.1; identical closest('[data-commentable]') primary hover path; nested review-core ${installedSvelte.dependencies["@sentropic/design-system-review-core"]} overridden by 0.1.1 alias)`,
  );
}

{
  const observed = await openPage("/focus-review.html");
  const page = observed.page;
  await page.waitForFunction(() => window.__focusReady.length > 0, { timeout: 5000 });

  async function submitOn(selector, body) {
    await page.evaluate((sel) => {
      const clickable = document.querySelector(sel);
      if (clickable === null) throw new Error(`missing ${sel}`);
      clickable.click();
    }, selector);
    await page.waitForSelector(".st-review-layer__composer .st-review-composer__textarea", { timeout: 5000 });
    await page.type(".st-review-layer__composer .st-review-composer__textarea", body);
    await page.click('.st-review-layer__composer .st-review-composer__actions button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector(".st-review-layer__composer .st-review-composer__textarea"), { timeout: 5000 });
  }

  // Initial hover geometry across h1/p/li/table leaves before any composer
  // click parks the pointer over the dossier: the outline must frame the
  // anchored block (relative to the dossier root) and NOT the smaller inner
  // leaf element. (Pastilles are checked below on decision-v2.json where
  // citations are non-empty.)
  await page.mouse.move(0, 0);
  for (const [name, selector, anchorId] of [
    ["h1", "h1", "focus-test"],
    ["p", '[data-anchor-id="B"] p strong', "B"],
    ["li", '[data-anchor-id="B"] li strong', "B"],
    ["table", '[data-anchor-id="B"] table td strong', "B"],
  ]) {
    await page.evaluate((sel) => {
      document.querySelector(sel).dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    }, selector);
    try {
      await page.waitForFunction((anchor) => {
        const outline = document.querySelector(".st-review-layer__hover-outline");
        const block = document.querySelector(`[data-anchor-id="${anchor}"]`);
        const root = document.querySelector("[data-st-dossier]");
        if (outline === null || block === null || root === null) return false;
        const b = block.getBoundingClientRect();
        const r = root.getBoundingClientRect();
        const close = (a, b) => Math.abs(a - b) <= 1;
        return close(parseFloat(outline.style.top) || 0, b.top - r.top)
          && close(parseFloat(outline.style.left) || 0, b.left - r.left)
          && close(parseFloat(outline.style.width) || 0, b.width)
          && close(parseFloat(outline.style.height) || 0, b.height);
      }, { timeout: 5000 }, anchorId);
    } catch { /* fall through to assertion with full hover diagnostics */ }
    const hover = await page.evaluate((sel, anchor) => {
      const outline = document.querySelector(".st-review-layer__hover-outline");
      const leaf = document.querySelector(sel);
      const block = document.querySelector(`[data-anchor-id="${anchor}"]`);
      const root = document.querySelector("[data-st-dossier]");
      const rootRect = root?.getBoundingClientRect();
      const leafRect = leaf?.getBoundingClientRect();
      return {
        shown: outline !== null,
        closestCommentableMatchesBlock: leaf?.closest("[data-commentable]") === block,
        outline: outline === null ? null : {
          top: parseFloat(outline.style.top) || 0,
          left: parseFloat(outline.style.left) || 0,
          width: parseFloat(outline.style.width) || 0,
          height: parseFloat(outline.style.height) || 0,
        },
        expected: block === null || rootRect === undefined ? null : (() => {
          const b = block.getBoundingClientRect();
          return { top: b.top - rootRect.top, left: b.left - rootRect.left, width: b.width, height: b.height };
        })(),
        leafHeight: leafRect?.height ?? 0,
      };
    }, selector, anchorId);
    const close = (a, b) => Math.abs(a - b) <= 1;
    const hoverLabel = `Focus review hover ${name} frames the anchored block container`;
    if (assert(hover.shown && hover.closestCommentableMatchesBlock && hover.outline !== null && hover.expected !== null &&
      hover.expected.height > hover.leafHeight &&
      close(hover.outline.top, hover.expected.top) && close(hover.outline.left, hover.expected.left) &&
      close(hover.outline.width, hover.expected.width) && close(hover.outline.height, hover.expected.height),
      hoverLabel, JSON.stringify(hover))) ok(hoverLabel);
    record(`Focus review hover ${name}`, JSON.stringify(hover.outline));
  }

  await submitOn("h1", "General header note");
  await submitOn('[data-anchor-id="B"] p strong', "Paragraph note");
  await submitOn('[data-anchor-id="B"] li strong', "List note");
  await submitOn('[data-anchor-id="B"] table td strong', "Table note");

  const created = await page.evaluate(() => window.__reviewRows.map((row) => {
    const key = row.target.sectionKey;
    const bytes = Uint8Array.from(atob(key.slice(3).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return { aid: payload.aid, v: payload.v, length: new TextEncoder().encode(key).length };
  }));
  const label = "Focus review B5-1 capture in compiled kit";
  if (assert(JSON.stringify(created.map((row) => row.aid)) === JSON.stringify(["focus-test", "B", "B", "B"]) &&
    created.every((row) => row.length <= 2048), label, JSON.stringify(created))) ok(label);
  const version = created[0]?.v ?? "";
  if (assert(created.every((row) => row.v === version && version.startsWith("sha256:")), `${label} version`, JSON.stringify(created))) ok(`${label} version`);

  // B5-2/3 + Step 5 on the live compiled kit tree: remove B (orphan, no pin on
  // C — live proof of review-core 0.1.1), reply and resolve from OrphanList,
  // move B after C (aid, zero stored-anchor mutation), and reopen via panel.
  const keysBeforeMove = await page.evaluate(() => window.__reviewRows.map((row) => row.target.sectionKey));
  const b2 = await page.evaluate(() => {
    const root = document.querySelector("[data-st-dossier]");
    const block = root.querySelector('[data-anchor-id="B"]');
    window.__b2Saved = block;
    block.remove();
    return root.querySelector('[data-anchor-id="B"]') === null;
  });
  assert(b2, "Focus review B5-2 fixture removed", "B still present");
  await page.waitForFunction(() => document.querySelector(".st-review-orphans__count") !== null, { timeout: 5000 });
  const orphanState = await page.evaluate(() => ({
    orphans: document.querySelector(".st-review-orphans__count")?.textContent?.trim() ?? "",
    pins: document.querySelectorAll(".st-review-layer__gutter-pin").length,
    orphanItems: document.querySelectorAll(".st-review-orphans__item").length,
    pinAids: [...document.querySelectorAll(".st-review-layer__pins [data-pin-section-key]")].map((pin) => {
      const key = pin.getAttribute("data-pin-section-key") ?? "";
      const bytes = Uint8Array.from(atob(key.slice(3).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
      try { return JSON.parse(new TextDecoder().decode(bytes)).aid; } catch { return "?"; }
    }),
  }));
  // The header thread stays pinned; the three B threads orphan with no pin
  // on C (the remaining pin decodes to the header aid).
  if (assert(orphanState.orphans === "3" && orphanState.pins === 1 && orphanState.orphanItems === 3 &&
    JSON.stringify(orphanState.pinAids) === JSON.stringify(["focus-test"]),
    "Focus review B5-2 orphan without fallback onto C", JSON.stringify(orphanState))) ok("Focus review B5-2 orphan without fallback onto C");

  // Reply to an orphan thread from OrphanList through the layer UI.
  const repliedOrphanId = await page.evaluate(() => {
    const item = document.querySelector(".st-review-orphans__item");
    const id = item?.getAttribute("data-thread-id") ?? "";
    item?.querySelector("button")?.click();
    return id;
  });
  await page.waitForSelector(".st-review-thread__reply textarea, .st-review-composer__textarea", { timeout: 5000 });
  await page.type(".st-review-thread__reply textarea, .st-review-composer__textarea", "Orphan follow-up");
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll(".st-review-thread__reply button[type='submit'], .st-review-composer__actions button[type='submit']")]
      .find((b) => /reply/i.test(b.textContent ?? "")) ??
      document.querySelector(".st-review-thread__reply button[type='submit']");
    btn?.click();
  });
  await page.waitForFunction(() => window.__reviewRows.length === 5, { timeout: 5000 });
  const orphanReplyRow = await page.evaluate(() => window.__reviewRows[4]);
  if (assert(orphanReplyRow.threadId === repliedOrphanId && orphanReplyRow.body === "Orphan follow-up",
    "Focus review B5-2 reply from OrphanList", JSON.stringify({ repliedOrphanId, orphanReplyRow }))) {
    ok("Focus review B5-2 reply from OrphanList");
  }

  // Return to thread list and resolve an orphan directly from OrphanList.
  await page.evaluate(() => {
    const back = [...document.querySelectorAll("button")].find((b) => /back|all threads/i.test(b.textContent ?? "") || b.getAttribute("aria-label")?.toLowerCase().includes("back"));
    back?.click();
  });
  await page.waitForSelector(".st-review-orphans__item", { timeout: 5000 });
  const resolvedOrphanId = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".st-review-orphans__item")];
    const targetItem = items[1] ?? items[0];
    const id = targetItem?.getAttribute("data-thread-id") ?? "";
    const resolveBtn = [...(targetItem?.querySelectorAll("button") ?? [])].find((b) => (b.textContent ?? "").trim() === "Resolve");
    resolveBtn?.click();
    return id;
  });
  await page.waitForFunction((id) => window.__reviewRows.some((r) => r.threadId === id && r.state === "closed"), { timeout: 5000 }, resolvedOrphanId);
  ok("Focus review B5-2 close from OrphanList");

  // B5-3: move B after C — all B threads re-attach by aid with zero anchor rewrite.
  await page.evaluate(() => {
    const root = document.querySelector("[data-st-dossier]");
    const c = root.querySelector('[data-anchor-id="C"]');
    const b = window.__b2Saved;
    if (c && b) root.insertBefore(b, c.nextSibling);
  });
  await page.waitForFunction(() => document.querySelector(".st-review-orphans__count") === null &&
    document.querySelectorAll(".st-review-layer__gutter-pin").length === 2, { timeout: 5000 });
  const movedState = await page.evaluate(() => ({
    orphans: document.querySelector(".st-review-orphans__count")?.textContent?.trim() ?? "none",
    pins: document.querySelectorAll(".st-review-layer__gutter-pin").length,
    pinAids: [...document.querySelectorAll(".st-review-layer__pins [data-pin-section-key]")].map((pin) => {
      const key = pin.getAttribute("data-pin-section-key") ?? "";
      const bytes = Uint8Array.from(atob(key.slice(3).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
      try { return JSON.parse(new TextDecoder().decode(bytes)).aid; } catch { return "?"; }
    }).sort(),
    keysAfterMove: window.__reviewRows.slice(0, 4).map((row) => row.target.sectionKey),
  }));
  if (assert(movedState.orphans === "none" && movedState.pins === 2 &&
    JSON.stringify(movedState.pinAids) === JSON.stringify(["B", "focus-test"]) &&
    JSON.stringify(movedState.keysAfterMove) === JSON.stringify(keysBeforeMove),
    "Focus review B5-3 move resolves by aid without rewriting sectionKey", JSON.stringify(movedState))) {
    ok("Focus review B5-3 move resolves by aid without rewriting sectionKey");
  }

  // Step 5 reopen: open the closed B thread from the panel and reopen it.
  await page.evaluate((id) => {
    const allFilter = [...document.querySelectorAll("button")].find((b) => (b.textContent ?? "").trim().startsWith("All"));
    allFilter?.click();
    setTimeout(() => {
      document.querySelector(`.st-review-panel__thread-card[data-thread-id="${id}"]`)?.click();
    }, 50);
  }, resolvedOrphanId);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => (b.textContent ?? "").trim() === "Reopen" && !b.disabled), { timeout: 5000 });
  await page.evaluate(() => {
    const reopen = [...document.querySelectorAll("button")].find((b) => (b.textContent ?? "").trim() === "Reopen");
    reopen?.click();
  });
  await page.waitForFunction((id) => window.__reviewRows.some((r) => r.threadId === id && r.state === "open"), { timeout: 5000 }, resolvedOrphanId);
  ok("Focus review step 5 reopen in compiled kit");

  // B5-6 text through the layer (keyboard path, trigger never mounted).
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const paragraph = document.querySelector('[data-anchor-id="B"] p');
    const text = paragraph.firstChild;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, text.textContent.length);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, shiftKey: true, key: "c", bubbles: true }));
  });
  await page.waitForSelector(".st-review-layer__composer .st-review-composer__textarea", { timeout: 5000 });
  await page.type(".st-review-layer__composer .st-review-composer__textarea", "Text range note");
  await page.click('.st-review-layer__composer .st-review-composer__actions button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector(".st-review-layer__composer .st-review-composer__textarea"), { timeout: 5000 });
  const textRows = await page.evaluate(() => window.__reviewRows.length);
  const textAnchor = await page.evaluate(() => {
    const row = window.__reviewRows[window.__reviewRows.length - 1];
    const key = row.target.sectionKey;
    const bytes = Uint8Array.from(atob(key.slice(3).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return { t: payload.t, length: new TextEncoder().encode(key).length };
  });
  if (assert(textRows === 6 && textAnchor.t === "text" && textAnchor.length <= 2048,
    "Focus review B5-6 text anchor within 2048", JSON.stringify({ textRows, textAnchor }))) ok("Focus review B5-6 text anchor within 2048");

  const violations = await observed.violations();
  await page.close();
  // The page carries its CSP in a <meta> element here; browsers warn that
  // frame-ancestors is ignored in that delivery — the directive is header-only.
  const otherErrors = observed.consoleErrors.filter((error) => !error.includes("frame-ancestors"));
  assert(violations.length === 0 && otherErrors.length === 0,
    "Focus review load is clean", JSON.stringify({ violations, errors: observed.consoleErrors }));
}

{
  // Packaged dossier-mount export (Focus Web H1 path):
  // 1) without review options mounts no layer;
  // 2) with review options: B5-4 full root replacement (title + hash + block
  //    order changed) never transients an orphan and updates artifactVersion;
  // 3) citations document (decision-v2.json) in review mode: [n] pastilles
  //    carry no anchor/commentable, hover stays clear, clicking [n], a
  //    fragment link to collapsed annex and a collapsed <summary> navigate/
  //    toggle without opening a composer.
  const observed = await openPage("/focus-mount-host.html");
  const page = observed.page;
  const b5Doc = JSON.parse(readFileSync(join(FIXTURES, "focus-artifact", "b5.json"), "utf8"));
  const decisionV2Doc = JSON.parse(readFileSync(join(FIXTURES, "focus-artifact", "decision-v2.json"), "utf8"));

  const noLayer = await page.evaluate(async (hostDocument) => {
    const host = document.querySelector("[data-st-dossier-page]");
    const { mountDossier } = await import("/focus-mount.js");
    const dossier = mountDossier(host);
    dossier.render(hostDocument);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const result = document.querySelector(".st-review-layer") === null && document.querySelector("[data-st-dossier]") !== null;
    dossier.destroy();
    return result;
  }, b5Doc);
  if (assert(noLayer, "Focus review without adapter mounts no layer", "layer present")) ok("Focus review without adapter mounts no layer");

  await page.evaluate(async (hostDocument) => {
    const host = document.querySelector("[data-st-dossier-page]");
    const { mountDossier } = await import("/focus-mount.js");
    window.__mountRows = [];
    let seq = 0;
    const adapter = {
      async list() { return window.__mountRows.map((row) => row.view); },
      async create({ target, body }) {
        const id = "m-" + (++seq);
        const threadId = "mt-" + seq;
        const view = {
          id, threadId, tenant: { workspaceId: "workspace-fixture" }, target,
          author: { id: "user-alice" }, state: "open", body, createdAt: new Date().toISOString(),
          authorship: { author: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" } },
        };
        window.__mountRows.push({ id, threadId, target, body, state: "open", view });
        return view;
      },
      async reply({ threadId, body }) {
        const id = "m-" + (++seq);
        const original = window.__mountRows.find((r) => r.threadId === threadId);
        const view = {
          id, threadId, tenant: { workspaceId: "workspace-fixture" }, target: original.target,
          author: { id: "user-alice" }, state: "open", body, createdAt: new Date().toISOString(),
          authorship: { author: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" } },
        };
        window.__mountRows.push({ id, threadId, target: original.target, body, state: "open", view });
        return view;
      },
      async setState(tenant, threadId, state) {
        for (const r of window.__mountRows) if (r.threadId === threadId) { r.state = state; r.view.state = state; }
      },
    };
    window.__dossierMount = mountDossier(host, {
      review: {
        adapter,
        tenant: "workspace-fixture",
        target: { kind: "artifact", id: "art-focus-mount" },
        currentUser: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" },
        mode: "review",
      },
    });
    window.__dossierMount.render(hostDocument);
  }, b5Doc);
  await page.waitForSelector(".st-review-layer", { timeout: 5000 });
  await page.click("h1");
  await page.waitForSelector(".st-review-composer__textarea", { timeout: 5000 });
  await page.type(".st-review-composer__textarea", "Header thread across root replacement");
  await page.click('.st-review-composer__actions button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector(".st-review-composer__textarea"), { timeout: 5000 });
  await page.waitForSelector(".st-review-layer__gutter-pin", { timeout: 5000 });

  const b54Result = await page.evaluate(async (revisedDoc) => {
    const host = document.querySelector("[data-st-dossier-page]");
    const versionBefore = window.__dossierMount.review.artifactVersion;
    let sawOrphan = false;
    let layerDetached = false;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const removed of record.removedNodes) {
          if (removed instanceof Element && removed.matches("[data-st-dossier-review]")) layerDetached = true;
        }
      }
      if (host.querySelector(".st-review-orphans, .st-review-orphans__count, .st-review-orphans__item") !== null) {
        sawOrphan = true;
      }
    });
    observer.observe(host, { childList: true, subtree: true });
    window.__dossierMount.render(revisedDoc);
    await new Promise((resolve) => setTimeout(resolve, 150));
    observer.disconnect();
    return {
      sawOrphan,
      layerDetached,
      layers: host.querySelectorAll("[data-st-dossier-review]").length,
      versionChanged: window.__dossierMount.review.artifactVersion !== versionBefore,
      order: [...host.querySelectorAll("[data-st-dossier] > [data-anchor-id]")].map((el) => el.dataset.anchorId),
      pins: host.querySelectorAll(".st-review-layer__gutter-pin").length,
      orphans: host.querySelector(".st-review-orphans__count")?.textContent?.trim() ?? "none",
    };
  }, { ...b5Doc, title: "Revised review fixture", hash: "b5-v2", sections: [b5Doc.sections[2], b5Doc.sections[1], b5Doc.sections[0]] });
  if (assert(!b54Result.sawOrphan && !b54Result.layerDetached && b54Result.layers === 1 &&
    b54Result.versionChanged && b54Result.pins === 1 && b54Result.orphans === "none" &&
    JSON.stringify(b54Result.order) === JSON.stringify(["focus-test", "C", "B", "A"]),
    "Focus review B5-4 full root replacement (title/revision/order) never orphans", JSON.stringify(b54Result))) {
    ok("Focus review B5-4 full root replacement (title/revision/order) never orphans");
  }

  // Citations, pastilles, collapsed annex fragment link and <summary> passthrough in review mode.
  await page.evaluate((doc, options) => {
    window.__dossierMount.render(doc, options);
  }, decisionV2Doc, diagramOptions(decisionV2Doc));
  await page.waitForFunction(() => document.querySelector('[data-anchor-id="annex:measurements"]') !== null, { timeout: 5000 });
  const passthroughState = await page.evaluate(async () => {
    const root = document.querySelector("[data-st-dossier]");
    const pastilles = [...root.querySelectorAll("a")].filter((link) => /^\[\d+\]$/.test(link.textContent ?? ""));
    const pastillesNoAnchor = pastilles.every((link) => !link.matches("[data-anchor-id], [data-commentable]"));
    const pastillesPassthrough = pastilles.every((link) => link.hasAttribute("data-review-passthrough"));
    // Hover a [n] pastille: must not show a hover outline.
    pastilles[0]?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 60));
    const hoverOnPastille = document.querySelector(".st-review-layer__hover-outline") !== null;
    // Click a [n] pastille: must focus citation and never open a composer.
    const pastille = root.querySelector('a.focus-citation[href="#shared-input"]');
    pastille?.click();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const focusedAfterPastille = document.activeElement?.dataset?.anchorId ?? null;
    const composerAfterPastille = document.querySelector(".st-review-layer__composer .st-review-composer__textarea") !== null;
    // Click a fragment link targeting collapsed annex: must open & focus annex without opening composer.
    const annex = root.querySelector('[data-anchor-id="annex:measurements"]');
    const annexWasClosed = annex?.open === false;
    const annexLink = document.createElement("a");
    annexLink.href = "#annex%3Ameasurements";
    annexLink.setAttribute("data-review-passthrough", "");
    annexLink.textContent = "Go to measurements annex";
    root.querySelector('[data-anchor-id="p1"]')?.append(annexLink);
    annexLink.click();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const annexOpened = annex?.open === true && document.activeElement === annex;
    const composerAfterAnnexLink = document.querySelector(".st-review-layer__composer .st-review-composer__textarea") !== null;
    // Click a collapsed source <summary>: must toggle details without opening composer.
    const sourceDetails = root.querySelector('[data-anchor-id="build-log"]');
    const sourceWasClosed = sourceDetails?.open === false;
    sourceDetails?.querySelector("summary")?.click();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const sourceOpened = sourceDetails?.open === true;
    const composerAfterSummary = document.querySelector(".st-review-layer__composer .st-review-composer__textarea") !== null;
    window.__dossierMount.destroy();
    return {
      pastilleCount: pastilles.length,
      pastillesNoAnchor,
      pastillesPassthrough,
      hoverOnPastille,
      focusedAfterPastille,
      composerAfterPastille,
      annexWasClosed,
      annexOpened,
      composerAfterAnnexLink,
      sourceWasClosed,
      sourceOpened,
      composerAfterSummary,
    };
  });
  if (assert(passthroughState.pastilleCount > 0 && passthroughState.pastillesNoAnchor && passthroughState.pastillesPassthrough &&
    !passthroughState.hoverOnPastille && passthroughState.focusedAfterPastille === "shared-input" && !passthroughState.composerAfterPastille &&
    passthroughState.annexWasClosed && passthroughState.annexOpened && !passthroughState.composerAfterAnnexLink &&
    passthroughState.sourceWasClosed && passthroughState.sourceOpened && !passthroughState.composerAfterSummary,
    "Focus review passthrough: [n] pastilles, collapsed annex fragment and summary in review mode",
    JSON.stringify(passthroughState))) {
    ok("Focus review passthrough: [n] pastilles, collapsed annex fragment and summary in review mode");
  }
  const mountViolations = await observed.violations();
  assert(mountViolations.length === 0 && observed.consoleErrors.length === 0,
    "Focus mount host review page is clean", JSON.stringify({ violations: mountViolations, errors: observed.consoleErrors }));
  await observed.close();
}

// Focus diagrams at natural size, never enlarged, with the `Tout voir` mode
// (owner feedback 24/11): at 390, 820 and 1280 px a 5-box diagram is never
// wider than its natural width (the SVG width attribute), and the large
// diagram fits the column (`max-width: 100%`). At 390 px `Tout voir` shows
// the whole scene with no scroll and restores the natural size on exit.
{
  for (const width of [390, 820, 1280]) {
    const observed = await openPage("/focus-kit/diagram-sizing/");
    const page = observed.page;
    await page.setViewport({ width, height: 900 });
    await waitFor(
      page,
      "() => { const viewport = document.querySelector('.st-dossier__diagramViewport'); return viewport && viewport.querySelector('svg') ? true : false; }",
      20000,
      `diagram-sizing diagram renders at ${width}px`,
    );
    const metrics = await page.evaluate(() => {
      const viewport = document.querySelector(".st-dossier__diagramViewport");
      const svg = viewport.querySelector("svg");
      return {
        rendered: svg.getBoundingClientRect().width,
        natural: Number(svg.getAttribute("width")),
        hasHeight: svg.getAttribute("height") !== null,
        hasViewBox: svg.getAttribute("viewBox") !== null,
        column: viewport.clientWidth,
      };
    });
    assert(metrics.rendered <= metrics.natural + 1,
      `diagram-sizing ${width}px is never wider than its natural width`, JSON.stringify(metrics));
    assert(metrics.rendered <= metrics.column + 1,
      `diagram-sizing ${width}px fits the column`, JSON.stringify(metrics));
    assert(metrics.hasHeight && metrics.hasViewBox,
      `diagram-sizing ${width}px SVG carries width, height and viewBox`, JSON.stringify(metrics));
    if (assert(observed.consoleErrors.length === 0 && (await observed.violations()).length === 0,
      `diagram-sizing ${width}px page is clean`,
      JSON.stringify({ errors: observed.consoleErrors, violations: await observed.violations() }))) {
      ok(`diagram-sizing ${width}px page is clean`);
    }
    record(`diagram-sizing ${width}px`, `rendered ${metrics.rendered}px, natural ${metrics.natural}px, column ${metrics.column}px`);
    await observed.close();
  }

  const observed = await openPage("/focus-kit/diagram-sizing/");
  const page = observed.page;
  await page.setViewport({ width: 390, height: 844 });
  await waitFor(
    page,
    "() => { const toutVoir = [...document.querySelectorAll('button')].find((button) => button.textContent === 'Tout voir'); return toutVoir ? true : false; }",
    20000,
    "diagram-sizing Tout voir renders",
  );
  const natural = await page.evaluate(() => {
    const viewport = document.querySelector(".st-dossier__diagramViewport");
    const svg = viewport.querySelector("svg");
    return { rendered: svg.getBoundingClientRect().width, natural: Number(svg.getAttribute("width")) };
  });
  assert(natural.rendered <= natural.natural + 1, "diagram-sizing 390px Tout voir starts at natural width",
    JSON.stringify(natural));
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((button) => button.textContent === "Tout voir").click();
  });
  await page.waitForFunction(
    "() => document.querySelector('.st-dossier__diagramViewport')?.getAttribute('data-view-all') === 'true'",
    { timeout: 5000 },
  );
  const viewAll = await page.evaluate(() => {
    const viewport = document.querySelector(".st-dossier__diagramViewport");
    const toutVoir = [...document.querySelectorAll("button")].find((button) => button.textContent === "Tout voir");
    const pleinEcran = document.querySelector('button[aria-label="Plein écran"]');
    return {
      pressed: toutVoir.getAttribute("aria-pressed"),
      offered: pleinEcran !== null && !pleinEcran.hidden,
      scrollWidth: viewport.scrollWidth,
      clientWidth: viewport.clientWidth,
      scrollHeight: viewport.scrollHeight,
      clientHeight: viewport.clientHeight,
    };
  });
  assert(viewAll.pressed === "true" && viewAll.offered,
    "diagram-sizing 390px Tout voir offers fullscreen", JSON.stringify(viewAll));
  assert(viewAll.scrollWidth <= viewAll.clientWidth + 1 && viewAll.scrollHeight <= viewAll.clientHeight + 1,
    "diagram-sizing 390px Tout voir shows the whole scene with no scroll", JSON.stringify(viewAll));
  record("diagram-sizing 390px Tout voir", JSON.stringify(viewAll));
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((button) => button.textContent === "Tout voir").click();
  });
  await page.waitForFunction(
    "() => document.querySelector('.st-dossier__diagramViewport')?.hasAttribute('data-view-all') === false",
    { timeout: 5000 },
  );
  const restored = await page.evaluate(() => {
    const viewport = document.querySelector(".st-dossier__diagramViewport");
    const toutVoir = [...document.querySelectorAll("button")].find((button) => button.textContent === "Tout voir");
    const svg = viewport.querySelector("svg");
    return { pressed: toutVoir.getAttribute("aria-pressed"), rendered: svg.getBoundingClientRect().width, natural: Number(svg.getAttribute("width")) };
  });
  assert(restored.pressed === "false" && restored.rendered <= restored.natural + 1,
    "diagram-sizing 390px Tout voir exit restores the natural size", JSON.stringify(restored));
  await observed.close();
}

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
    await browser?.close();
  } catch { /* already closed */ }
  try {
    server.close();
  } catch { /* already closed */ }
  try {
    rmSync(work, { recursive: true, force: true });
  } catch { /* already removed */ }
  try {
    rmSync(chromiumBase, { recursive: true, force: true });
  } catch { /* already removed */ }
}
