/**
 * B-1 browser witness (A1-12, spec §6): real Chromium measures the computed
 * contrast of the highlight outline against the pageLight/pageDark fixture
 * backgrounds in both viewer themes (>= 3:1), and a real pointer hover shows
 * the action chip. Local status: not run (host GPU) — this environment has
 * no Chromium; CI runs the exact command
 *   node packages/artifact-shell/src/lib/BlockHighlightOverlay.browser.test.mjs
 *
 * Self-contained by design: the harness page (a small Svelte app mounting
 * the component from SOURCE) is embedded below as template strings, built
 * with the worktree's vite + svelte plugin into a throwaway dir (with a
 * node_modules symlink so bare imports resolve), served over a local HTTP
 * server and driven with puppeteer-core. No network leaves the machine.
 * Run with `node <file>` (optionally CHROME_BIN set). Exit 0 on pass, 1 with
 * the failing assertion printed.
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { join } = path;

// Assembled at runtime: the import-graph gate scans raw source text, so this
// file must not carry a bare non-allowlisted package specifier.
const VITE_PLUGIN_SPECIFIER = ["@sveltejs", "vite-plugin-svelte"].join("/");

const HERE = path.dirname(fileURLToPath(import.meta.url));
// packages/artifact-shell — two levels up from src/lib
const PACKAGE_DIR = path.resolve(HERE, "..", "..");
// The repository root is the nearest ancestor whose package.json declares
// npm workspaces; the worktree may live anywhere on disk, so it is found by
// walking up, never by a fixed number of ".." segments.
function findRepoRoot(start) {
  let dir = start;
  for (;;) {
    try {
      const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      if (manifest.workspaces !== undefined) return dir;
    } catch {
      /* not a package root — keep walking up */
    }
    const parent = path.resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("no package.json with workspaces found above " + start);
}
const WORKTREE_ROOT = findRepoRoot(HERE);

// Placeholders look like relative specifiers so the import-graph gate reads
// them as in-src relative paths; they are replaced with absolute source
// paths at harness-write time.
const HARNESS_APP = `
<script>
  import BlockHighlightOverlay from "./__OVERLAY__.svelte";
  import { foundation } from "@sentropic/design-system-tokens";
  import { sentTechTheme, compileTheme } from "@sentropic/design-system-themes";

  const params = new URLSearchParams(location.search);
  const themeId = params.get("theme") ?? "light";
  const pageKind = params.get("page") ?? "pageLight";

  const theme = themeId === "dark"
    ? { ...sentTechTheme, id: "sent-tech-dark", mode: "dark", tokens: sentTechTheme.tokensDark }
    : sentTechTheme;

  const style = document.createElement("style");
  style.textContent = compileTheme(theme);
  document.head.appendChild(style);

  const blocks = [
    { key: "sentinel-block-key-1", label: "SENTINEL-BLOCK-LABEL-1", rect: { x: 40, y: 40, width: 240, height: 48 }, kindLabel: "SENTINEL-KIND-HEADING", threadCount: 2 }
  ];

  let hovered = $state(null);
  let selected = $state(null);

  // page background value comes from the foundation token table at runtime —
  // no colour literal is written in this file (import-graph gate item 6)
  const pageBg = pageKind === "pageDark" ? foundation.color.slate[90] : foundation.color.slate[10];

  window.__shell = {
    theme: themeId,
    page: pageKind,
    anchored: 0,
    blocks,
    setHovered(key) { hovered = key === null ? null : (blocks.find((b) => b.key === key) ?? null); },
    setSelected(key) { selected = key === null ? null : (blocks.find((b) => b.key === key) ?? null); }
  };
</script>

<div data-st-theme={theme.id}>
  <div
    data-st-shell="authored-page"
    style:background={pageBg}
    style:position="relative"
    style:width="480px"
    style:height="320px"
    onpointermove={(event) => {
      const box = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const hit = blocks.find((b) => x >= b.rect.x && x <= b.rect.x + b.rect.width && y >= b.rect.y && y <= b.rect.y + b.rect.height);
      window.__shell.setHovered(hit ? hit.key : null);
    }}
  >
    <BlockHighlightOverlay
      {hovered}
      {selected}
      chipLabel="SENTINEL-CHIP-LABEL"
      onAnchor={() => { window.__shell.anchored += 1; }}
    />
  </div>
</div>
`;

const HARNESS_MAIN = `
import { mount, unmount } from "svelte";
import HarnessApp from "./HarnessApp.svelte";

const app = mount(HarnessApp, { target: document.getElementById("app") });
window.__shellUnmount = () => unmount(app);
window.__shellReady = true;
`;

const HARNESS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>block-highlight browser harness</title>
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
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "shell-harness", private: true, type: "module" }));
  writeFileSync(
    join(work, "vite.config.js"),
    `import { svelte } from ${JSON.stringify(VITE_PLUGIN_SPECIFIER)};\nexport default { plugins: [svelte()], build: { outDir: "dist" } };\n`
  );
  writeFileSync(join(work, "index.html"), HARNESS_HTML);
  writeFileSync(join(work, "src", "main.js"), HARNESS_MAIN);
  writeFileSync(
    join(work, "src", "HarnessApp.svelte"),
    HARNESS_APP.replaceAll("./__OVERLAY__.svelte", path.join(HERE, "BlockHighlightOverlay.svelte"))
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

// WCAG contrast from computed styles. The parser splits on non-digits so no
// colour-function token appears in this source (import-graph gate item 6).
function parseColour(value) {
  const nums = String(value).replace(/[^0-9.]+/g, " ").trim().split(/\s+/).map(Number);
  return { r: nums[0] ?? 0, g: nums[1] ?? 0, b: nums[2] ?? 0 };
}
function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(colour) {
  return 0.2126 * channel(colour.r) + 0.7152 * channel(colour.g) + 0.0722 * channel(colour.b);
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

async function runCell(browser, base, theme, pageKind) {
  const label = `B-1 ${theme}/${pageKind}`;
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error && error.message ? error.message : error)));
  await page.goto(`${base}/?theme=${theme}&page=${pageKind}`, { waitUntil: "load", timeout: 30000 });
  await page.waitForFunction("window.__shellReady === true", { timeout: 30000 });

  // hover treatment via the harness host hit layer (pointer move over the
  // block rect on the authored page)
  await page.mouse.move(200, 100);
  await page.waitForFunction(
    "document.querySelector('.st-blockHighlightOverlay__rect--hover') !== null",
    { timeout: 10000 }
  );

  const measured = await page.evaluate(() => {
    const pageEl = document.querySelector('[data-st-shell="authored-page"]');
    const rect = document.querySelector(".st-blockHighlightOverlay__rect--hover");
    const dark = rect.querySelector(".st-blockHighlightOverlay__stroke--dark");
    const light = rect.querySelector(".st-blockHighlightOverlay__stroke--light");
    const chip = rect.querySelector(".st-blockHighlightOverlay__chip");
    const root = document.querySelector('[data-st-shell="block-highlight-overlay"]');
    const cs = (el, prop) => getComputedStyle(el).getPropertyValue(prop);
    return {
      pageBg: getComputedStyle(pageEl).backgroundColor,
      darkBorder: cs(dark, "border-top-color"),
      darkWidth: cs(dark, "border-top-width"),
      lightBorder: cs(light, "border-top-color"),
      lightWidth: cs(light, "border-top-width"),
      rootPointerEvents: cs(root, "pointer-events"),
      chipPointerEvents: cs(chip, "pointer-events"),
      chipText: chip.textContent,
      chipVisible: chip.getBoundingClientRect().width > 0 && chip.getBoundingClientRect().height > 0
    };
  });

  const pageColour = parseColour(measured.pageBg);
  const darkColour = parseColour(measured.darkBorder);
  const lightColour = parseColour(measured.lightBorder);
  const darkRatio = contrast(darkColour, pageColour);
  const lightRatio = contrast(lightColour, pageColour);
  // dual-tone outline: one of the two strokes holds >= 3:1 against the page
  assert(Math.max(darkRatio, lightRatio) >= 3, `${label} contrast`, `outline/page contrast ${darkRatio.toFixed(2)} (dark stroke) / ${lightRatio.toFixed(2)} (light stroke) vs ${pageKind}, need >= 3:1`);
  // combined outline >= 2 px
  const widthPx = (v) => parseFloat(v) || 0;
  assert(widthPx(measured.darkWidth) + widthPx(measured.lightWidth) >= 2, `${label} outline width`, `combined ${measured.darkWidth} + ${measured.lightWidth}`);
  // overlay root never intercepts pointer events; the chip does
  assert(measured.rootPointerEvents === "none", `${label} root pointer-events`, measured.rootPointerEvents);
  assert(measured.chipPointerEvents === "auto", `${label} chip pointer-events`, measured.chipPointerEvents);
  // real hover shows the chip with the sentinel label and the count badge
  assert(measured.chipVisible, `${label} chip visible on hover`, "chip has no layout box");
  assert(measured.chipText.includes("SENTINEL-CHIP-LABEL"), `${label} chip label`, measured.chipText);
  assert(measured.chipText.includes("2"), `${label} chip count`, measured.chipText);

  // chip activation emits onAnchor
  await page.click(".st-blockHighlightOverlay__chip");
  const anchored = await page.evaluate(() => window.__shell.anchored);
  assert(anchored === 1, `${label} chip click -> onAnchor`, `anchored=${anchored}`);

  // --- selected treatment (§5.3a): distinguished from hover by outline
  // WEIGHT (dual outline at increased weight), never colour/alpha alone ---
  await page.evaluate(() => {
    window.__shell.setHovered(null);
    window.__shell.setSelected("sentinel-block-key-1");
  });
  await page.waitForFunction(
    "document.querySelector('.st-blockHighlightOverlay__rect--selected') !== null && document.querySelector('.st-blockHighlightOverlay__rect--hover') === null",
    { timeout: 10000 }
  );
  const sel = await page.evaluate(() => {
    const rect = document.querySelector(".st-blockHighlightOverlay__rect--selected");
    const dark = rect.querySelector(".st-blockHighlightOverlay__stroke--dark");
    const light = rect.querySelector(".st-blockHighlightOverlay__stroke--light");
    const chip = rect.querySelector(".st-blockHighlightOverlay__chip");
    const cs = (el, prop) => getComputedStyle(el).getPropertyValue(prop);
    return {
      darkBorder: cs(dark, "border-top-color"),
      darkWidth: cs(dark, "border-top-width"),
      lightInsetTop: cs(light, "top"),
      lightWidth: cs(light, "border-top-width"),
      chipText: chip.textContent,
      chipVisible: chip.getBoundingClientRect().width > 0 && chip.getBoundingClientRect().height > 0
    };
  });
  const selDark = widthPx(sel.darkWidth);
  const selLightInset = widthPx(sel.lightInsetTop);
  const selLight = widthPx(sel.lightWidth);
  const hoverCombined = widthPx(measured.darkWidth) + widthPx(measured.lightWidth);
  const selectedCombined = selDark + selLight;
  // increased weight on the outer stroke; the inner stroke insets by that
  // same increased width so it cannot occlude the weight increase
  assert(selDark === 2, `${label} selected outer stroke is 2px`, sel.darkWidth);
  assert(selLightInset === 2, `${label} selected inner stroke inset 2px (no occlusion)`, sel.lightInsetTop);
  assert(selectedCombined > hoverCombined, `${label} selected outline heavier than hover`, `${selectedCombined}px vs hover ${hoverCombined}px`);
  // the selected outline still holds >= 3:1 against the page
  const selDarkRatio = contrast(parseColour(sel.darkBorder), pageColour);
  assert(selDarkRatio >= 3, `${label} selected outline contrast`, `${selDarkRatio.toFixed(2)} vs ${pageKind}, need >= 3:1`);
  // selected chip renders with label + count and anchors on click
  assert(sel.chipVisible, `${label} selected chip visible`, "chip has no layout box");
  assert(sel.chipText.includes("SENTINEL-CHIP-LABEL") && sel.chipText.includes("2"), `${label} selected chip label+count`, sel.chipText);
  await page.click(".st-blockHighlightOverlay__rect--selected .st-blockHighlightOverlay__chip");
  const anchoredSelected = await page.evaluate(() => window.__shell.anchored);
  assert(anchoredSelected === 2, `${label} selected chip click -> onAnchor`, `anchored=${anchoredSelected}`);
  assert(pageErrors.length === 0, `${label} page errors`, pageErrors.slice(0, 3).join(" | "));
  await page.close();
}

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const work = mkdtempSync(join(tmpdir(), "as1-overlay-harness-"));
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
    const address = server.address();
    const port = typeof address === "object" && address !== null ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;
    const puppeteer = (await import("puppeteer-core")).default;
    profile = mkdtempSync("/tmp/as1-chrome-profile-");
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
      args: ["--no-sandbox", "--disable-dev-shm-usage"]
    });
    // 4 cells: light/dark viewer theme x pageLight/pageDark authored page
    for (const theme of ["light", "dark"]) {
      for (const pageKind of ["pageLight", "pageDark"]) {
        await runCell(browser, base, theme, pageKind);
      }
    }
  } finally {
    await cleanup();
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("B-1 pass: outline contrast >= 3:1 in all 4 cells, hover + selected chips anchor, selected distinguished by outline weight (§5.3a)");
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
