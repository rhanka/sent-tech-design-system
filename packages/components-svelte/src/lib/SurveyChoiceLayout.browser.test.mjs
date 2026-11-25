/**
 * Browser layout regression test for CheckboxGroup, RadioGroup and LikertScale:
 * verifies real bounding boxes in headless Chromium inside a flex-wrap container
 * (matching docs TabbedExample `.tex__render` and `Inline`) across 390 / 820 / 1280 px.
 *
 * Run with:
 *   node packages/components-svelte/src/lib/SurveyChoiceLayout.browser.test.mjs
 * optionally with CHROME_BIN set. Exit 0 on pass, 1 with failing assertions.
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { join } = path;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECKBOX_GROUP_SOURCE = path.join(HERE, "CheckboxGroup.svelte");
const RADIO_GROUP_SOURCE = path.join(HERE, "RadioGroup.svelte");
const LIKERT_SCALE_SOURCE = path.join(HERE, "LikertScale.svelte");

function findRepoRoot(start) {
  let dir = start;
  for (;;) {
    try {
      const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      if (manifest.workspaces !== undefined) return dir;
    } catch {
      /* keep walking up */
    }
    const parent = path.resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("no package.json with workspaces found above " + start);
}

const WORKTREE_ROOT = findRepoRoot(HERE);

const HARNESS_APP = `
<script>
  import CheckboxGroup from "__CHECKBOX_GROUP__";
  import RadioGroup from "__RADIO_GROUP__";
  import LikertScale from "__LIKERT_SCALE__";
  import { sentTechTheme, compileTheme } from "@sentropic/design-system-themes";

  const style = document.createElement("style");
  style.textContent = compileTheme(sentTechTheme);
  document.head.appendChild(style);

  const dayOptions = [
    { label: "Lun", value: "lun" },
    { label: "Mar", value: "mar" },
    { label: "Mer", value: "mer" }
  ];

  const cardOptions = [
    { label: "PME produit", value: "pme" },
    { label: "Startup", value: "startup" },
    { label: "Services", value: "services" },
    { label: "Secteur public", value: "public" }
  ];

  const likertOptions = [
    { value: "1", label: "Jamais" },
    { value: "2", label: "Rarement" },
    { value: "3", label: "Parfois" },
    { value: "4", label: "Souvent" },
    { value: "5", label: "Toujours" }
  ];
</script>

<div data-st-theme={sentTechTheme.id} style="padding: 16px; box-sizing: border-box; width: 100%;">
  <div id="flex-list-cb" class="flex-stage">
    <CheckboxGroup
      legend="Jours disponibles"
      name="days-cb"
      orientation="horizontal"
      options={dayOptions}
    />
  </div>

  <div id="flex-list-radio" class="flex-stage">
    <RadioGroup
      legend="Rythme de livraison"
      name="days-radio"
      orientation="horizontal"
      options={dayOptions}
    />
  </div>

  <div id="flex-card-cb" class="flex-stage">
    <CheckboxGroup
      legend="Outils utilisés"
      name="card-cb"
      variant="card"
      columns={2}
      options={cardOptions}
    />
  </div>

  <div id="flex-card-radio" class="flex-stage">
    <RadioGroup
      legend="Type d'organisation"
      name="card-radio"
      variant="card"
      orientation="horizontal"
      options={cardOptions}
    />
  </div>

  <div id="flex-likert" class="flex-stage">
    <LikertScale
      legend="Fréquence d'utilisation"
      name="freq-likert"
      options={likertOptions}
      minLabel="Jamais"
      maxLabel="Toujours"
    />
  </div>
</div>

<style>
  .flex-stage {
    align-items: flex-start;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    width: 100%;
  }
</style>
`;

const HARNESS_MAIN = `
import { mount, unmount } from "svelte";
import HarnessApp from "./HarnessApp.svelte";

const app = mount(HarnessApp, { target: document.getElementById("app") });
window.__surveyUnmount = () => unmount(app);
window.__surveyReady = true;
`;

const HARNESS_HTML = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>survey choice layout browser harness</title>
    <style>
      html, body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/snap/bin/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable"
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
function assert(condition, label, message) {
  if (condition) {
    console.log(`ok ${label}`);
  } else {
    failures.push(`${label}: ${message}`);
    console.error(`FAIL ${label}: ${message}`);
  }
  return Boolean(condition);
}

function writeHarnessFiles(work) {
  mkdirSync(join(work, "src"), { recursive: true });
  writeFileSync(
    join(work, "package.json"),
    JSON.stringify({ name: "survey-choice-layout-harness", private: true, type: "module" })
  );
  writeFileSync(
    join(work, "vite.config.js"),
    `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { plugins: [svelte()], build: { outDir: "dist" } };\n`
  );
  writeFileSync(join(work, "index.html"), HARNESS_HTML);
  writeFileSync(join(work, "src", "main.js"), HARNESS_MAIN);
  writeFileSync(
    join(work, "src", "HarnessApp.svelte"),
    HARNESS_APP
      .replaceAll("__CHECKBOX_GROUP__", CHECKBOX_GROUP_SOURCE)
      .replaceAll("__RADIO_GROUP__", RADIO_GROUP_SOURCE)
      .replaceAll("__LIKERT_SCALE__", LIKERT_SCALE_SOURCE)
  );
}

function serveDirectory(root, port) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
  const server = http.createServer((req, res) => {
    const urlPath = new URL(req.url, "http://localhost").pathname;
    const file = join(root, urlPath === "/" ? "index.html" : urlPath.slice(1));
    try {
      const body = readFileSync(file);
      const ext = file.slice(file.lastIndexOf("."));
      res.writeHead(200, { "content-type": types[ext] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("no such file");
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

async function measureAll(page) {
  return page.evaluate(() => {
    const toBox = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    const measureGroup = (hostId, optionSelector) => {
      const host = document.getElementById(hostId);
      const fieldset = host.querySelector("fieldset");
      const legend = fieldset.querySelector("legend");
      const options = [...fieldset.querySelectorAll(optionSelector)];
      return {
        host: toBox(host),
        fieldset: toBox(fieldset),
        legend: toBox(legend),
        options: options.map(toBox)
      };
    };
    return {
      listCb: measureGroup("flex-list-cb", "label.st-choice"),
      listRadio: measureGroup("flex-list-radio", "label.st-choice"),
      cardCb: measureGroup("flex-card-cb", "label.st-choice--card"),
      cardRadio: measureGroup("flex-card-radio", "label.st-choice--card"),
      likert: measureGroup("flex-likert", "label.st-likert__option")
    };
  });
}

function checkListHorizontal(name, width, m) {
  assert(
    m.fieldset.width >= 120,
    `${name}@${width} fieldset does not collapse inside flex-wrap`,
    `fieldset.width=${m.fieldset.width.toFixed(1)}px`
  );
  assert(
    m.legend.height <= 40,
    `${name}@${width} legend stays single-line (no word-by-word wrapping)`,
    `legend.height=${m.legend.height.toFixed(1)}px legend.width=${m.legend.width.toFixed(1)}px`
  );
  for (let i = 1; i < m.options.length; i++) {
    assert(
      Math.abs(m.options[i].top - m.options[0].top) <= 2 && m.options[i].left > m.options[i - 1].right - 1,
      `${name}@${width} option ${i + 1} sits horizontally beside option ${i}`,
      `prev=${JSON.stringify(m.options[i - 1])} curr=${JSON.stringify(m.options[i])}`
    );
  }
}

function checkCardResponsive(name, width, m) {
  assert(
    m.fieldset.width >= m.host.width - 2,
    `${name}@${width} card fieldset fills flex-wrap host width`,
    `fieldset.width=${m.fieldset.width.toFixed(1)}px host.width=${m.host.width.toFixed(1)}px`
  );
  for (let i = 0; i < m.options.length; i++) {
    assert(
      m.options[i].height >= 48,
      `${name}@${width} card ${i + 1} touch height >= 48px`,
      `height=${m.options[i].height.toFixed(1)}px`
    );
  }
  if (width < 520) {
    assert(
      m.options[1].top >= m.options[0].bottom - 1,
      `${name}@${width} stacks to 1 column below 520px`,
      `opt0.bottom=${m.options[0].bottom.toFixed(1)} opt1.top=${m.options[1].top.toFixed(1)}`
    );
  } else {
    assert(
      Math.abs(m.options[1].top - m.options[0].top) <= 2 && m.options[1].left > m.options[0].right - 1,
      `${name}@${width} switches to 2 columns at >= 520px`,
      `opt0=${JSON.stringify(m.options[0])} opt1=${JSON.stringify(m.options[1])}`
    );
  }
}

function checkLikertResponsive(width, m) {
  assert(
    m.fieldset.width >= m.host.width - 2,
    `likert@${width} fieldset fills flex-wrap host width`,
    `fieldset.width=${m.fieldset.width.toFixed(1)}px host.width=${m.host.width.toFixed(1)}px`
  );
  for (let i = 0; i < m.options.length; i++) {
    assert(
      m.options[i].height >= 48,
      `likert@${width} option ${i + 1} touch height >= 48px`,
      `height=${m.options[i].height.toFixed(1)}px`
    );
  }
  if (width < 600) {
    assert(
      m.options[1].top >= m.options[0].bottom - 1,
      `likert@${width} stays stacked below 600px`,
      `opt0.bottom=${m.options[0].bottom.toFixed(1)} opt1.top=${m.options[1].top.toFixed(1)}`
    );
  } else {
    for (let i = 1; i < m.options.length; i++) {
      assert(
        Math.abs(m.options[i].top - m.options[0].top) <= 2 && m.options[i].left > m.options[i - 1].right - 1,
        `likert@${width} option ${i + 1} renders in horizontal strip at >= 600px`,
        `prev=${JSON.stringify(m.options[i - 1])} curr=${JSON.stringify(m.options[i])}`
      );
    }
  }
}

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const work = mkdtempSync(join(tmpdir(), "survey-layout-harness-"));
  let server;
  let browser;
  let profile;
  const cleanup = async () => {
    try { if (browser !== undefined) await browser.close(); } catch { /* closed */ }
    try { if (server !== undefined) server.close(); } catch { /* closed */ }
    try { if (profile !== undefined) rmSync(profile, { recursive: true, force: true }); } catch { /* removed */ }
    try { rmSync(work, { recursive: true, force: true }); } catch { /* removed */ }
  };

  try {
    writeHarnessFiles(work);
    symlinkSync(join(WORKTREE_ROOT, "node_modules"), join(work, "node_modules"), "dir");
    execFileSync(join(WORKTREE_ROOT, "node_modules", ".bin", "vite"), ["build"], { cwd: work, stdio: "inherit" });
    server = await serveDirectory(join(work, "dist"), 0);
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    const puppeteer = (await import("puppeteer-core")).default;
    profile = mkdtempSync("/tmp/survey-layout-chrome-profile-");
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
      args: ["--no-sandbox", "--disable-dev-shm-usage"]
    });
    const page = await browser.newPage();
    await page.goto(base, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction("window.__surveyReady === true", { timeout: 10000 });

    for (const width of [390, 820, 1280]) {
      await page.setViewport({ width, height: 1400 });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const m = await measureAll(page);
      checkListHorizontal("checkbox-list", width, m.listCb);
      checkListHorizontal("radio-list", width, m.listRadio);
      checkCardResponsive("checkbox-card", width, m.cardCb);
      checkCardResponsive("radio-card", width, m.cardRadio);
      checkLikertResponsive(width, m.likert);
    }

    await page.close();
  } finally {
    await cleanup();
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("Survey choice layout browser checks passed");
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
