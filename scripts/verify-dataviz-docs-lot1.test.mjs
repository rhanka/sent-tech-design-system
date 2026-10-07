import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

// GD-DATAVIZ-DOCS lot 1 acceptance gate: six adapter pages, no twin pages,
// exact parity counts, and per-framework rendering proven on the BUILT site.
//
// What each layer proves (and does not):
// - source asserts: catalog entries, no-twin slugs, demo builders present.
// - prerender asserts: static coverage tables, API tables, and demo code
//   blocks ship in the HTML. Demo STAGES are intentionally empty in the
//   prerender: dataviz demos resolve through a dynamic import
//   (DatavizSvelteNode) plus client-only islands, so every framework renders
//   after hydration — exactly like the existing React/Vue/Angular islands.
// - browser asserts (Chromium over the built site): each of the four tabs of
//   each page carries live markup, or the explicit missing-adapter block.
//   This is the acceptance criterion 3 proof, on the model of the
//   PriorityMatrix four-tab check.
// - jsdom island asserts live in apps/docs
//   (src/lib/framework/dataviz-islands.test.ts) and mount the SAME demo
//   builders through the SAME island entry points over real stores.

const ROOT = new URL("../", import.meta.url).pathname;
const DOCS = join(ROOT, "apps/docs");
const BUILD = join(DOCS, "build");

const LOT_SLUGS = [
  "url-sync",
  "web-frame",
  "time-series-line-chart",
  "dataviz-score-card",
  "dataviz-data-image",
  "dataviz-dashboard-grid"
];

const NATIVE_SLUGS = ["score-card", "data-image", "dashboard-grid"];

function builtPage(slug) {
  const file = join(BUILD, "components", `${slug}.html`);
  assert.ok(existsSync(file), `built page missing (run the docs build first): ${file}`);
  return readFileSync(file, "utf8");
}

function buildJsChunks() {
  const dir = join(BUILD, "_app", "immutable");
  const out = [];
  for (const sub of ["chunks", "nodes", "entries"]) {
    const full = join(dir, sub);
    if (!existsSync(full)) continue;
    for (const name of readdirSync(full)) {
      if (name.endsWith(".js")) out.push(join(full, name));
    }
  }
  assert.ok(out.length > 0, "no built JS chunks found under _app/immutable");
  return out;
}

// --- The third outcome: "I cannot measure" ----------------------------------
//
// Three tests in this file read a BUILT docs site (apps/docs/build). The
// unsharded `licensing` job runs this file through scripts/run-script-guards.mjs
// after a bare `npm ci`, and builds no site; the sharded `verify` jobs build
// package dists (ensure-theme-dists.mjs), never the site either. With the
// precondition false, those tests reported `not ok`, which reads as "the built
// site does not carry the dataviz code" when the truth is "there is no built
// site here" — the instrument's own gap charged to the subject, turning a
// correct branch red.
//
// So the absent build gets its own outcome: NOT RUN, naming the instrument.
// Mechanism copied from packages/graph/tests/golden (commit f3901806): a
// RUNTIME skip, probed when the test runs. Two node:test specifics:
//   - t.skip() marks the report but does NOT abort the body (unlike vitest's
//     ctx.skip(), which throws), so every guard below returns immediately after.
//   - the collection-time form (node:test's `{ skip }` option, vitest's
//     it.skipIf) is wrong here for the same reason it was wrong in the goldens:
//     the condition must be probed at run time, not when the file is loaded.
// No assertion below was weakened: with the site built they all still run, and
// a neutralized assertion still fails rather than skipping.
const NO_BUILD =
  `docs site NOT built at apps/docs/build — built-site assertions NOT run ` +
  `in this job (build it with: npm run docs:build)`;

function builtSiteMissing() {
  if (!existsSync(BUILD)) return NO_BUILD;
  if (!existsSync(join(BUILD, "_app", "immutable"))) return NO_BUILD;
  return null;
}

test("catalog carries the six lot-1 entries, category data, status documented", () => {
  const catalog = readFileSync(join(DOCS, "src/lib/components-catalog.ts"), "utf8");
  assert.equal(catalog.match(/name: "ScoreCard \(dataviz\)"/g)?.length ?? 0, 1);
  for (const slug of LOT_SLUGS) {
    assert.ok(catalog.includes(`slug: "${slug}"`), `catalog entry missing: ${slug}`);
  }
  for (const slug of LOT_SLUGS) {
    const at = catalog.indexOf(`slug: "${slug}"`);
    const window = catalog.slice(Math.max(0, at - 400), at + 400);
    assert.ok(window.includes('category: "data"'), `${slug}: category data missing`);
    assert.ok(window.includes('status: "documented"'), `${slug}: status documented missing`);
  }
});

test("no twin page: native slugs still serve the native components", () => {
  for (const slug of NATIVE_SLUGS) {
    const page = readFileSync(
      join(DOCS, "src/routes/components", slug, "+page.svelte"),
      "utf8"
    );
    assert.ok(!page.includes("@sentropic/dataviz-"), `${slug}: native page must not import dataviz`);
    assert.ok(!page.includes('library: "dataviz"'), `${slug}: native page must not host store demos`);
  }
  const routes = readdirSync(join(DOCS, "src/routes/components"));
  for (const slug of LOT_SLUGS) {
    assert.ok(routes.includes(slug), `route directory missing: ${slug}`);
  }
});

test("demo builders and the dataviz discriminator exist in examples.ts", () => {
  const examples = readFileSync(join(DOCS, "src/lib/framework/examples.ts"), "utf8");
  for (const fn of [
    "urlSyncDemoNodes",
    "webFrameDemoNodes",
    "timeSeriesDemoNodes",
    "scoreCardStoreDemoNodes",
    "dataImageDemoNodes",
    "dashboardGridDemoNodes",
    "usesDataviz"
  ]) {
    assert.ok(examples.includes(`export function ${fn}`), `builder missing: ${fn}`);
  }
  assert.ok(examples.includes('library?: "ds" | "dataviz"'), "NodeSpec library discriminator missing");
  assert.ok(
    readFileSync(join(DOCS, "src/lib/framework/TabbedExample.svelte"), "utf8").includes(
      'import("./DatavizSvelteNode.svelte")'
    ),
    "TabbedExample must lazy-load the dataviz renderer (dynamic import, never static)"
  );
});

test("parity ledger counts are exact and recomputed", () => {
  const ledger = readFileSync(join(ROOT, "docs/dataviz-docs-parity.md"), "utf8");
  assert.ok(ledger.includes("113 « à documenter »"), "ledger must state 113 remaining");
  assert.ok(ledger.includes("6 « déjà documenté »"), "ledger must state 6 documented");
  assert.equal(ledger.match(/\| à documenter \|/g)?.length ?? 0, 113);
  assert.equal(ledger.match(/\| documenté \(lot 1\) \|/g)?.length ?? 0, 6);
});

test("prerender ships coverage, API, and demo code on all six pages", (t) => {
  const cannotMeasure = builtSiteMissing();
  if (cannotMeasure !== null) {
    t.skip(cannotMeasure);
    return;
  }
  for (const slug of LOT_SLUGS) {
    const html = builtPage(slug);
    assert.ok(html.includes("tex__render"), `${slug}: demo stage missing`);
    assert.ok(html.includes("tex__code"), `${slug}: demo code block missing`);
    assert.ok(html.includes("docs-table"), `${slug}: tables missing`);
  }
  const urlSync = builtPage("url-sync");
  assert.ok(urlSync.includes("useUrlSync"), "url-sync: hook coverage rows missing");
  assert.ok(urlSync.includes("Angular"), "url-sync: Angular absence row missing");
  const timeSeries = builtPage("time-series-line-chart");
  assert.ok(timeSeries.includes("React uniquement"), "time-series: React-only coverage missing");
  const scoreCard = builtPage("dataviz-score-card");
  assert.ok(scoreCard.includes("store={store}"), "score-card: real-store wiring missing from snippet");
  assert.ok(scoreCard.includes("KpiCard"), "score-card: KpiCard relationship note missing");
});

test("dataviz renderer ships in the built client JS", (t) => {
  const cannotMeasure = builtSiteMissing();
  if (cannotMeasure !== null) {
    t.skip(cannotMeasure);
    return;
  }
  const chunks = buildJsChunks();
  const hits = chunks.filter((file) => readFileSync(file, "utf8").includes("Svelte adapter missing"));
  assert.ok(hits.length >= 1, "expected the lazy DatavizSvelteNode block in at least one chunk");
});

// --- Browser proof over the built site (criterion 3) ------------------------

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml"
};

function serveBuild() {
  const root = resolve(BUILD);
  return createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let path = decodeURIComponent(url.pathname);
    let file = resolve(join(root, `.${path}`));
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if (statSync(file).isDirectory()) file = join(file, "index.html");
    } catch {
      if (!file.endsWith(".html")) file += ".html";
    }
    try {
      const body = readFileSync(file);
      const dot = file.lastIndexOf(".");
      res.writeHead(200, { "content-type": TYPES[file.slice(dot)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
}

// slug -> framework -> expected live text (string), live selector
// ([sel, attr?, value?]), or null (the demo mounts but renders nothing by
// design: the wrapper must appear and the stage must stay empty).
const BROWSER_MATRIX = {
  "url-sync": {
    // UrlSync is pure wiring: it renders no markup and writes nothing on a
    // fresh load (useUrlSync only mirrors store *changes* into the URL), so
    // no body text can prove it — the null case proves mount + emptiness.
    svelte: null,
    react: "React adapter missing: UrlSync",
    vue: "Vue adapter missing: UrlSync",
    angular: "Angular component missing: UrlSync"
  },
  "web-frame": {
    svelte: ["iframe", "src", "https://example.com"],
    react: ["iframe", "src", "https://example.com"],
    vue: ["iframe", "src", "https://example.com"],
    angular: "Angular component missing: WebFrame"
  },
  "time-series-line-chart": {
    svelte: "Svelte adapter missing: TimeSeriesLineChart",
    react: ["svg"],
    vue: "Vue adapter missing: TimeSeriesLineChart",
    angular: "Angular component missing: TimeSeriesLineChart"
  },
  "dataviz-score-card": {
    svelte: "480",
    react: "480",
    vue: "480",
    angular: "480"
  },
  "dataviz-data-image": {
    svelte: ["img", "alt", "Product chart for Atlas"],
    react: ["img", "alt", "Product chart for Atlas"],
    vue: ["img", "alt", "Product chart for Atlas"],
    angular: "Angular component missing: DataImage"
  },
  "dataviz-dashboard-grid": {
    // Stage-scoped: bare "pipeline" also matches the static layout snippet,
    // so only a panel inside the live stage proves the render.
    svelte: ["section[aria-label='pipeline']"],
    react: ["section[aria-label='pipeline']"],
    vue: ["section[aria-label='pipeline']"],
    angular: "Angular component missing: DashboardGrid"
  }
};

// Store sections live on existing native pages. The browser proves the
// riskiest path once per page (Svelte tab = dynamic DatavizSvelteNode import
// + hydration); the other three tabs go through the same islands as the six
// pages above and are covered per framework in dataviz-islands.test.ts.
const SECTION_SLUGS = [
  "area-chart",
  "donut-chart",
  "funnel-chart",
  "gantt-chart",
  "gauge-chart",
  "heatmap-chart",
  "sankey-chart",
  "treemap-chart"
];

test("store section demos pass channel ids, never literal numbers", () => {
  // Every dataviz store channel is resolved through the model, so it is an
  // id (string), not a value: GaugeChartConfig.value is a measure id. Passing
  // a number makes resolveMeasure throw, and the buildGaugeData catch then
  // returns displayValue 0 — a gauge that renders a plausible WRONG number
  // instead of failing visibly. Neither svelte-check nor the browser gate can
  // catch that regression: storeChartDemoNodes takes Record<string, unknown>,
  // and the browser section check only requires an <svg> in the stage, which
  // a 0-valued gauge still produces. So assert it on the page source.
  const CHANNELS = [
    "value",
    "measure",
    "category",
    "x",
    "y",
    "source",
    "target",
    "task",
    "start",
    "end"
  ];
  for (const slug of SECTION_SLUGS) {
    const page = readFileSync(
      join(DOCS, "src/routes/components", slug, "+page.svelte"),
      "utf8"
    );
    const at = page.indexOf("storeChartDemoNodes(");
    assert.ok(at > -1, `${slug}: store demo builder call missing`);
    const window = page.slice(at, at + 800);
    const close = window.indexOf("})");
    const call = close === -1 ? window : window.slice(0, close + 2);
    for (const channel of CHANNELS) {
      const found = new RegExp(`\\b${channel}:\\s*([^,\\n]+)`).exec(call);
      if (found === null) continue;
      const literal = found[1].trim();
      assert.ok(
        !/^-?\d/.test(literal),
        `${slug}: store channel "${channel}" must be a measure/dimension id, got the literal ${literal}`
      );
    }
  }
});

test("all four tabs render on the built site (Chromium)", async (t) => {
  // Two independent preconditions, each reported as NOT RUN rather than as a
  // defect of the pages: the built site (checked first, before any server or
  // browser is started) and a runnable browser (checked below).
  const cannotMeasure = builtSiteMissing();
  if (cannotMeasure !== null) {
    t.skip(cannotMeasure);
    return;
  }
  const docsRequire = createRequire(join(DOCS, "package.json"));
  const { chromium } = docsRequire("playwright-core");
  const server = serveBuild();
  await new Promise((done) => server.listen(0, done));
  const port = server.address().port;
  // Same resolution as apps/docs/scripts/csp-check.mjs: env override, then
  // a system browser, then the Playwright bundle. The server MUST close on
  // every path (including launch failure) or the node:test process hangs.
  // No runnable browser exists in some sandboxes (snap confinement, no
  // Playwright build for the host OS, read-only browser cache): then the
  // test SKIPS loudly and the four-tab proof falls back to the jsdom island
  // mounts, which run the same builders through the same entry points.
  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium"
  ];
  const executablePath =
    process.env.CHROMIUM_PATH ?? candidates.find((path) => existsSync(path));
  let browser;
  try {
    browser = await chromium.launch(
      executablePath ? { headless: true, executablePath } : { headless: true }
    );
  } catch (error) {
    server.close();
    t.skip(
      `no runnable browser in this environment (tried CHROMIUM_PATH, system candidates, Playwright bundle): ${error.message.split("\n")[0]}`
    );
    return;
  }
  try {
    for (const [slug, perFramework] of Object.entries(BROWSER_MATRIX)) {
      for (const [framework, expected] of Object.entries(perFramework)) {
        const page = await browser.newPage();
        try {
          await page.goto(`http://localhost:${port}/components/${slug}?framework=${framework}`, {
            waitUntil: "domcontentloaded",
            timeout: 30000
          });
          await page.waitForSelector(".tex__render", { timeout: 15000 });
          if (expected === null) {
            // Renders nothing by design: the demo wrapper must mount (proves
            // hydration ran — prerendered stages are empty) and carry no text.
            // Scope to the wrapper, not the stage: the url-sync page appends a
            // helper paragraph (the exact "?dash=…" query string) inside the
            // same stage, so a stage-wide emptiness check would fail on live
            // scaffolding rather than on the component.
            // "attached", not the default "visible": an empty wrapper has no box,
            // so Playwright reports it hidden even once hydration mounted it.
            await page.waitForSelector(".tex__render .chart-wrapper", {
              state: "attached",
              timeout: 20000
            });
            const text = await page.$eval(".tex__render .chart-wrapper", (el) => el.textContent ?? "");
            assert.equal(text.trim(), "", `${slug}/${framework}: expected an empty component wrapper`);
          } else if (typeof expected === "string") {
            await page.waitForFunction(
              (text) => document.body.textContent?.includes(text) ?? false,
              expected,
              { timeout: 20000 }
            );
          } else {
            const [sel, attr, value] = expected;
            await page.waitForSelector(`.tex__render ${sel}`, { timeout: 20000 });
            if (attr) {
              const actual = await page.getAttribute(`.tex__render ${sel}`, attr);
              assert.ok(
                actual === value || (value && actual?.includes(value)),
                `${slug}/${framework}: <${sel} ${attr}> = ${actual}, expected ${value}`
              );
            }
          }
        } finally {
          await page.close();
        }
      }
    }
    for (const slug of SECTION_SLUGS) {
      const page = await browser.newPage();
      try {
        await page.goto(`http://localhost:${port}/components/${slug}?framework=svelte`, {
          waitUntil: "domcontentloaded",
          timeout: 30000
        });
        await page.waitForSelector(".tex__render", { timeout: 15000 });
        // Last demo on the page is the store section: its title carries
        // "(store)" and its stage must hold the rendered chart.
        const titles = await page.$$eval(".tex__title", (els) =>
          els.map((el) => el.textContent ?? "")
        );
        assert.ok(titles.length >= 2, `${slug}: expected native + store demos`);
        assert.ok(
          (titles[titles.length - 1] ?? "").includes("(store)"),
          `${slug}: last demo is not the store section`
        );
        const stages = await page.$$eval(".tex__render", (els) =>
          els.map((el) => el.innerHTML)
        );
        await page.waitForFunction(
          () => {
            const stages = [...document.querySelectorAll(".tex__render")];
            const last = stages[stages.length - 1];
            return (last?.innerHTML ?? "").includes("<svg");
          },
          null,
          { timeout: 20000 }
        );
        assert.ok(stages.length >= 2, `${slug}: expected native + store stages`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
}, { timeout: 600000 });
