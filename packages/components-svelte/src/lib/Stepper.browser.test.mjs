/**
 * Browser geometry regression test for Stepper (horizontal & vertical):
 * measures real bounding boxes in headless Chromium via puppeteer-core.
 *
 * Run with:
 *   node packages/components-svelte/src/lib/Stepper.browser.test.mjs
 * optionally with CHROME_BIN set. Exit 0 on pass, 1 with failing assertions.
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { join } = path;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COMPONENT_SOURCE = path.join(HERE, "Stepper.svelte");

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
  import Stepper from "./__STEPPER__.svelte";
  import { sentTechTheme, compileTheme } from "@sentropic/design-system-themes";

  const style = document.createElement("style");
  style.textContent = compileTheme(sentTechTheme);
  document.head.appendChild(style);

  let state = $state({
    steps: [
      { label: "Contexte" },
      { label: "Participants" },
      { label: "Questions" },
      { label: "Publication" }
    ],
    current: 1,
    orientation: "horizontal",
    clickable: false
  });

  window.__setStepper = (next) => {
    state = { ...state, ...next };
  };
</script>

<div data-st-theme={sentTechTheme.id} style="padding: 16px; box-sizing: border-box; width: 100%;">
  <div id="host" style="width: 100%; box-sizing: border-box;">
    <Stepper
      steps={state.steps}
      current={state.current}
      orientation={state.orientation}
      clickable={state.clickable}
    />
  </div>
</div>
`;

const HARNESS_MAIN = `
import { mount, unmount } from "svelte";
import HarnessApp from "./HarnessApp.svelte";

const app = mount(HarnessApp, { target: document.getElementById("app") });
window.__stepperUnmount = () => unmount(app);
window.__stepperReady = true;
`;

const HARNESS_HTML = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>stepper browser harness</title>
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
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "stepper-harness", private: true, type: "module" }));
  writeFileSync(
    join(work, "vite.config.js"),
    `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { plugins: [svelte()], build: { outDir: "dist" } };\n`,
  );
  writeFileSync(join(work, "index.html"), HARNESS_HTML);
  writeFileSync(join(work, "src", "main.js"), HARNESS_MAIN);
  writeFileSync(
    join(work, "src", "HarnessApp.svelte"),
    HARNESS_APP.replaceAll("./__STEPPER__.svelte", COMPONENT_SOURCE),
  );
}

function serveDirectory(root, port) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
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

async function measureGeometry(page) {
  return page.evaluate(() => {
    const host = document.getElementById("host");
    const ol = host.querySelector(".st-stepper");
    const items = [...ol.querySelectorAll(".st-stepper__step")];
    const toBox = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    return {
      host: toBox(host),
      ol: toBox(ol),
      olScrollWidth: ol.scrollWidth,
      olClientWidth: ol.clientWidth,
      steps: items.map((li) => {
        const circle = li.querySelector(".st-stepper__circle");
        const connector = li.querySelector(".st-stepper__connector");
        const label = li.querySelector(".st-stepper__label");
        const svg = circle?.querySelector("svg");
        return {
          classes: [...li.classList],
          hasSvg: Boolean(svg),
          circle: toBox(circle),
          connector: toBox(connector),
          label: toBox(label),
        };
      }),
    };
  });
}

function checkHorizontal(label, geom) {
  const steps = geom.steps;
  assert(
    geom.olScrollWidth <= geom.host.width + 1 && geom.ol.right <= geom.host.right + 1,
    `${label} no horizontal overflow`,
    `ol.scrollWidth=${geom.olScrollWidth} ol.right=${geom.ol.right.toFixed(1)} host.width=${geom.host.width} host.right=${geom.host.right.toFixed(1)}`,
  );

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const circleCenterY = s.circle.top + s.circle.height / 2;
    if (i < steps.length - 1) {
      assert(s.connector !== null, `${label} step ${i + 1} has connector`, "missing connector");
      if (s.connector) {
        const connCenterY = s.connector.top + s.connector.height / 2;
        assert(
          Math.abs(connCenterY - circleCenterY) <= 1,
          `${label} step ${i + 1} connector vertically centred on bubble`,
          `connCenterY=${connCenterY.toFixed(2)} circleCenterY=${circleCenterY.toFixed(2)} delta=${(connCenterY - circleCenterY).toFixed(2)}px`,
        );
        const nextCircle = steps[i + 1].circle;
        assert(
          s.circle.right <= nextCircle.left + 1,
          `${label} step ${i + 1} bubble does not overlap step ${i + 2} bubble`,
          `circle.right=${s.circle.right.toFixed(2)} nextCircle.left=${nextCircle.left.toFixed(2)}`,
        );
        assert(
          Math.abs(s.connector.left - s.circle.right) <= 1,
          `${label} step ${i + 1} connector starts at bubble right edge`,
          `conn.left=${s.connector.left.toFixed(2)} circle.right=${s.circle.right.toFixed(2)}`,
        );
        assert(
          Math.abs(s.connector.right - nextCircle.left) <= 1,
          `${label} step ${i + 1} connector reaches step ${i + 2} bubble`,
          `conn.right=${s.connector.right.toFixed(2)} nextCircle.left=${nextCircle.left.toFixed(2)} gap=${(nextCircle.left - s.connector.right).toFixed(2)}px`,
        );
      }
      assert(
        s.label.right <= steps[i + 1].label.left + 1,
        `${label} step ${i + 1} label does not overlap step ${i + 2} label`,
        `label.right=${s.label.right.toFixed(2)} nextLabel.left=${steps[i + 1].label.left.toFixed(2)}`,
      );
    } else {
      assert(s.connector === null, `${label} last step has no connector`, "unexpected connector on last step");
    }

    assert(
      Math.abs(s.circle.left - s.label.left) <= 1,
      `${label} step ${i + 1} bubble left aligns with label left`,
      `circle.left=${s.circle.left.toFixed(2)} label.left=${s.label.left.toFixed(2)} delta=${(s.circle.left - s.label.left).toFixed(2)}px`,
    );
  }
}

function checkVertical(label, geom) {
  const steps = geom.steps;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const circleCenterX = s.circle.left + s.circle.width / 2;
    if (i < steps.length - 1) {
      assert(s.connector !== null, `${label} step ${i + 1} has connector`, "missing connector");
      if (s.connector) {
        const connCenterX = s.connector.left + s.connector.width / 2;
        assert(
          Math.abs(connCenterX - circleCenterX) <= 1,
          `${label} step ${i + 1} connector horizontally centred on bubble`,
          `connCenterX=${connCenterX.toFixed(2)} circleCenterX=${circleCenterX.toFixed(2)} delta=${(connCenterX - circleCenterX).toFixed(2)}px`,
        );
        assert(
          s.connector.height >= 16,
          `${label} step ${i + 1} vertical connector has positive height`,
          `height=${s.connector.height.toFixed(2)}px`,
        );
      }
    }
  }
}

async function runScenario(page, width, props, label) {
  await page.setViewport({ width, height: 900 });
  await page.evaluate((next) => {
    window.__setStepper(next);
  }, props);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const geom = await measureGeometry(page);
  if (props.orientation === "vertical") {
    checkVertical(label, geom);
  } else {
    checkHorizontal(label, geom);
  }
  return geom;
}

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const work = mkdtempSync(join(tmpdir(), "stepper-harness-"));
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
    profile = mkdtempSync("/tmp/stepper-chrome-profile-");
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.goto(base, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction("window.__stepperReady === true", { timeout: 10000 });

    const fourSteps = [
      { label: "Contexte" },
      { label: "Participants" },
      { label: "Questions" },
      { label: "Publication" },
    ];

    for (const width of [390, 820, 1280]) {
      await runScenario(
        page,
        width,
        { steps: fourSteps, current: 1, orientation: "horizontal", clickable: false },
        `h-4steps-${width}`,
      );
      await runScenario(
        page,
        width,
        { steps: fourSteps, current: 2, orientation: "horizontal", clickable: true },
        `h-4steps-clickable-${width}`,
      );
    }

    for (const count of [1, 2, 3, 4, 5, 6]) {
      const steps = Array.from({ length: count }, (_, i) => ({ label: `Étape ${i + 1}` }));
      for (const width of [390, 820, 1280]) {
        await runScenario(
          page,
          width,
          { steps, current: Math.floor(count / 2), orientation: "horizontal", clickable: false },
          `h-${count}steps-${width}`,
        );
      }
    }

    const longLabelSteps = [
      { label: "Configuration initiale du sondage", description: "Titre et paramètres" },
      { label: "Sélection des répondants cibles", description: "Groupes et invitations" },
      { label: "Rédaction détaillée des questions", description: "Choix multiples" },
      { label: "Validation finale et publication immédiate", description: "Contrôle avant diffusion" },
    ];
    for (const width of [390, 820, 1280]) {
      await runScenario(
        page,
        width,
        { steps: longLabelSteps, current: 2, orientation: "horizontal", clickable: false },
        `h-longlabels-${width}`,
      );
    }

    const verticalSteps = [
      { label: "Compte", description: "Terminé" },
      { label: "Équipe", description: "Terminé" },
      { label: "Projet", description: "En cours" },
      { label: "Invitations" },
    ];
    for (const width of [390, 820, 1280]) {
      await runScenario(
        page,
        width,
        { steps: verticalSteps, current: 2, orientation: "vertical", clickable: false },
        `v-4steps-${width}`,
      );
      await runScenario(
        page,
        width,
        { steps: verticalSteps, current: 2, orientation: "vertical", clickable: true },
        `v-4steps-clickable-${width}`,
      );
    }

    await page.close();
  } finally {
    await cleanup();
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("Stepper browser geometry checks passed");
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
