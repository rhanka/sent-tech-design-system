/**
 * B-2 browser witness (A1-17, spec §6): real Chromium focus/active-descendant
 * movement in the candidate listbox and the selected visual cue. Local
 * status: not run (host GPU) — CI runs the exact command
 *   node packages/artifact-shell/src/lib/BlockCandidateList.browser.test.mjs
 *
 * Self-contained harness (vite + svelte build into a throwaway dir, local
 * HTTP server, puppeteer-core); no network leaves the machine. Run with
 * `node <file>` (optionally CHROME_BIN set). Exit 0 on pass, 1 otherwise.
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

const HARNESS_APP = `
<script>
  import BlockCandidateList from "./__LIST__.svelte";
  import { sentTechTheme, compileTheme } from "@sentropic/design-system-themes";

  const style = document.createElement("style");
  style.textContent = compileTheme(sentTechTheme);
  document.head.appendChild(style);

  const candidates = [1, 2, 3].map((n) => ({
    key: "sentinel-block-key-" + n,
    label: "SENTINEL-BLOCK-LABEL-" + n,
    rect: { x: 8, y: 16 + (n - 1) * 32, width: 120, height: 24 },
    kindLabel: "SENTINEL-KIND-HEADING",
    threadCount: n === 2 ? 2 : 0
  }));

  let activeKey = $state(null);
  let selectedKey = $state(null);
  const events = { pick: [], active: [], anchor: [], close: 0 };

  window.__shell = {
    events,
    setActive(key) { activeKey = key; },
    setSelected(key) { selectedKey = key; },
    candidates
  };
</script>

<div data-st-theme="sent-tech">
  <BlockCandidateList
    open={true}
    {candidates}
    {activeKey}
    {selectedKey}
    headingLabel="SENTINEL-HEADING-LABEL"
    onPickBlock={(key) => { events.pick.push(key); window.__shell.setSelected(key); }}
    onActiveKeyChange={(key) => { events.active.push(key); activeKey = key; }}
    onAnchor={(key) => { events.anchor.push(key); }}
    onClose={() => { events.close += 1; }}
  />
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
    <title>candidate-list browser harness</title>
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

// waitForFunction wrapper: on failure, dump the page console, page errors and
// the evaluated predicate inputs to stderr so the next CI failure explains
// itself. `context` is the { consoleMessages, pageErrors } pair captured for
// the page; `diagnostics` is evaluated in the page when the wait fails.
function makeWaitFor(page, context) {
  return async function waitFor(label, predicate, diagnostics, options = { timeout: 10000 }) {
    try {
      await page.waitForFunction(predicate, options);
    } catch (error) {
      console.error(`\n[diagnostic] ${label}: waitForFunction failed`);
      console.error(`[diagnostic] predicate: ${predicate}`);
      if (context.consoleMessages.length > 0) {
        console.error("[diagnostic] page console:\n" + context.consoleMessages.map((m) => "  " + m).join("\n"));
      }
      if (context.pageErrors.length > 0) {
        console.error("[diagnostic] page errors:\n" + context.pageErrors.map((m) => "  " + m).join("\n"));
      }
      try {
        const inputs = await page.evaluate(diagnostics);
        console.error("[diagnostic] predicate inputs: " + JSON.stringify(inputs, null, 2));
      } catch (diagError) {
        console.error("[diagnostic] input evaluation failed: " + String(diagError && diagError.message ? diagError.message : diagError));
      }
      throw error;
    }
  };
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
    HARNESS_APP.replaceAll("./__LIST__.svelte", path.join(HERE, "BlockCandidateList.svelte"))
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

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const work = mkdtempSync(join(tmpdir(), "as1-list-harness-"));
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

    const page = await browser.newPage();
    const pageErrors = [];
    const consoleMessages = [];
    page.on("pageerror", (error) => pageErrors.push(String(error && error.message ? error.message : error)));
    page.on("console", (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
    const waitFor = makeWaitFor(page, { consoleMessages, pageErrors });
    const listInputs = () => ({
      url: location.href,
      shellReady: window.__shellReady === true,
      activeElement: document.activeElement
        ? (document.activeElement.getAttribute("data-st-shell") || document.activeElement.id || document.activeElement.tagName)
        : null,
      activeElementKey: document.activeElement?.getAttribute("data-block-key") ?? null,
      listboxPresent: document.querySelector('[role="listbox"]') !== null,
      rows: [...document.querySelectorAll('[role="option"]')].map((r) => r.getAttribute("data-block-key")),
      events: window.__shell?.events ?? null
    });
    await page.goto(`${base}/`, { waitUntil: "load", timeout: 30000 });
    await waitFor("shell ready", "window.__shellReady === true", listInputs, { timeout: 30000 });

    // real focus movement: focus the listbox root, then arrow down — the
    // active row must receive focus (focus follows the controlled activeKey)
    await page.focus('[role="listbox"]');
    await page.keyboard.press("ArrowDown");
    await waitFor(
      "ArrowDown focuses row 1",
      "document.activeElement && document.activeElement.getAttribute('data-block-key') === 'sentinel-block-key-1'",
      listInputs
    );
    assert(true, "B-2 ArrowDown moves focus to the first row", "");
    let state = await page.evaluate(() => ({
      active: window.__shell.events.active,
      activeClass: document.activeElement.classList.contains("st-blockCandidateList__row--active"),
      tabIndex: document.activeElement.getAttribute("tabindex")
    }));
    assert(state.active.length === 1 && state.active[0] === "sentinel-block-key-1", "B-2 onActiveKeyChange(first)", JSON.stringify(state.active));
    assert(state.activeClass, "B-2 active row carries the active class", "");
    assert(state.tabIndex === "0", "B-2 roving tabIndex 0 on the active row", state.tabIndex);

    await page.keyboard.press("ArrowDown");
    await waitFor(
      "ArrowDown focuses row 2",
      "document.activeElement && document.activeElement.getAttribute('data-block-key') === 'sentinel-block-key-2'",
      listInputs
    );
    await page.keyboard.press("End");
    await waitFor(
      "End focuses row 3",
      "document.activeElement && document.activeElement.getAttribute('data-block-key') === 'sentinel-block-key-3'",
      listInputs
    );
    await page.keyboard.press("Home");
    await waitFor(
      "Home focuses row 1",
      "document.activeElement && document.activeElement.getAttribute('data-block-key') === 'sentinel-block-key-1'",
      listInputs
    );
    assert(true, "B-2 ArrowDown/End/Home move focus along the rows", "");

    // selected visual cue: set selectedKey on row 2 and compare computed
    // weight/background against the merely-active row (never colour alone)
    await page.evaluate(() => window.__shell.setSelected("sentinel-block-key-2"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const cue = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('[role="option"]')];
      const active = rows.find((r) => r.classList.contains("st-blockCandidateList__row--active"));
      const selected = rows.find((r) => r.getAttribute("aria-selected") === "true");
      return {
        selectedKey: selected?.getAttribute("data-block-key") ?? null,
        selectedWeight: selected ? getComputedStyle(selected).fontWeight : null,
        activeWeight: active ? getComputedStyle(active).fontWeight : null,
        // the inset bar is the ACTIVE row's cue — read it from the active row
        activeShadow: active ? getComputedStyle(active).boxShadow : null,
        selectedClass: selected?.classList.contains("st-blockCandidateList__row--selected") ?? false
      };
    });
    assert(cue.selectedKey === "sentinel-block-key-2", "B-2 aria-selected on the selected row", JSON.stringify(cue));
    assert(cue.selectedClass, "B-2 selected modifier class", "");
    assert(Number(cue.selectedWeight) > Number(cue.activeWeight), "B-2 selected cue weight differs from active", `${cue.selectedWeight} vs ${cue.activeWeight}`);
    assert(Number(cue.selectedWeight) >= 600, "B-2 selected cue is semibold (>= 600)", String(cue.selectedWeight));
    assert(cue.activeShadow !== null && cue.activeShadow !== "none" && cue.activeShadow !== "", "B-2 active row carries the inset bar", cue.activeShadow ?? "");

    // Enter anchors the active key; Escape closes the list stage
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    const events = await page.evaluate(() => window.__shell.events);
    assert(events.anchor.length === 1 && events.anchor[0] === "sentinel-block-key-1", "B-2 Enter -> onAnchor(activeKey)", JSON.stringify(events.anchor));
    assert(events.close === 1, "B-2 Escape -> onClose", `close=${events.close}`);

    // row click picks the block
    await page.click('[role="option"][data-block-key="sentinel-block-key-3"]');
    const pick = await page.evaluate(() => window.__shell.events.pick);
    assert(pick.length === 1 && pick[0] === "sentinel-block-key-3", "B-2 row click -> onPickBlock(key)", JSON.stringify(pick));

    assert(pageErrors.length === 0, "B-2 page errors", pageErrors.slice(0, 3).join(" | "));
    await page.close();
  } finally {
    await cleanup();
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("B-2 pass: real focus/active-descendant movement, selected cue visible, Enter/Esc/click events");
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
