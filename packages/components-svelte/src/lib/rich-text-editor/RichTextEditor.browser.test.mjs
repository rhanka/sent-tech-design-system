/**
 * RED 4/5/7/8 browser halves + §13.3 invariants 2–5 (selection, locale/theme,
 * capture, network): real-browser witness through puppeteer-core and system
 * Chromium. Spec §11 RED 4, RED 5, RED 7, RED 8, §12 RT-1 gate, §13.3.
 * Environment: B only — jsdom does not implement composition or real
 * selection, and dispatched CompositionEvents alone never establish one.
 *
 * Self-contained by design: the harness page (a small Svelte app mounting
 * the component from SOURCE) is embedded below as template strings, built
 * with the worktree's vite + svelte plugin into a throwaway dir (with a
 * `node_modules` symlink so bare imports resolve), served over a local HTTP
 * server, and driven with puppeteer-core. No network leaves the machine:
 * the build, the server and Chromium are all local, and the network half
 * asserts zero non-harness requests from mount through unmount. Run with:
 *   node packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.browser.test.mjs
 * optionally with CHROME_BIN set. Exit 0 on green, 1 with the failing
 * assertion printed.
 *
 * RED state: fails because the subpath entry does not exist yet (the harness
 * build cannot resolve it).
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { join } = path;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.resolve(HERE, "..", "..", "..");
const WORKTREE_ROOT = path.resolve(PACKAGE_DIR, "..", "..");
const COMPONENT_SOURCE = path.join(HERE, "RichTextEditor.svelte");
const COMPONENT_CSS = path.join(HERE, "rich-text-editor.css");

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
  throw new Error(
    "No Chromium binary found. Set CHROME_BIN. Tried: " + CHROME_CANDIDATES.join(", "),
  );
}

const failures = [];
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

// ---------------------------------------------------------------------------
// Embedded harness: mounts the real component from source with a scriptable
// window.__rt surface. Plain JavaScript (no TS) so no extra preprocess is
// needed for the harness itself; the component under test is compiled by the
// svelte plugin with vitePreprocess exactly like a consumer build.
// ---------------------------------------------------------------------------

const HARNESS_APP = `
<script>
  import RichTextEditor from "__COMPONENT_SOURCE__";
  import "__COMPONENT_CSS__";

  const params = new URLSearchParams(location.search);
  const scenario = params.get("scenario") ?? "conflict-focused";

  const SENTINEL = {
    editorLabel: "SENTINEL-EDITOR-LABEL",
    placeholder: "SENTINEL-PLACEHOLDER",
    preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
    externalConflictLabel: "SENTINEL-CONFLICT",
  };

  const paragraph = (id, text) => ({ paragraphId: id, kind: "paragraph", text });
  const preserved = (id, kind, raw) => ({ paragraphId: id, kind: "preserved", preservedKind: kind, raw });

  const SCENARIOS = {
    "conflict-focused": {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "Alpha one"), paragraph("paragraph:2", "Beta two")] },
    },
    "conflict-blur": {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "Alpha one"), paragraph("paragraph:2", "Beta two")] },
    },
    clean: {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "Alpha one"), paragraph("paragraph:2", "Beta two")] },
    },
    echo: {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "A")] },
    },
    composition: {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "start")] },
    },
    "capture-unmount": {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "start")] },
    },
    "preserved-gestures": {
      value: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "Before"), preserved("paragraph:2", "table", "| a |"), paragraph("paragraph:3", "After")],
      },
    },
    "locale-theme": {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "hello")] },
    },
    "placeholder-locale": {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "")] },
    },
    "disabled-states": {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "Alpha one"), paragraph("paragraph:2", "Beta two")] },
    },
    network: {
      value: { format: "focus.markdown.p0@1", blocks: [paragraph("paragraph:1", "net one"), paragraph("paragraph:2", "net two")] },
    },
  };

  const initial = SCENARIOS[scenario] ?? SCENARIOS["conflict-focused"];
  let value = $state(initial.value);
  let messages = $state({ ...SENTINEL });
  let editable = $state(true);
  let disabled = $state(false);
  let editorRef = $state(null);

  const events = { changes: [], conflicts: [], unsupported: [], readiness: [] };
  const clone = (input) => JSON.parse(JSON.stringify(input));

  function selectionSnapshot() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const describe = (node, offset) => {
      const element = node.nodeType === 3 ? node.parentElement : node;
      const block = element?.closest?.("[data-paragraph-id]");
      if (!block) return { id: null, offset: 0 };
      const range = document.createRange();
      range.selectNodeContents(block);
      range.setEnd(node, offset);
      return { id: block.getAttribute("data-paragraph-id"), offset: range.toString().length };
    };
    return {
      anchor: describe(selection.anchorNode, selection.anchorOffset),
      head: describe(selection.focusNode, selection.focusOffset),
    };
  }

  window.__rt = {
    scenario,
    events,
    setValue(next) {
      value = next;
    },
    setMessages(next) {
      messages = next;
    },
    setEditable(next) {
      editable = next;
    },
    setDisabled(next) {
      disabled = next;
    },
    editor() {
      return editorRef;
    },
    selection: selectionSnapshot,
    async capture() {
      return editorRef.captureDocument();
    },
    readiness() {
      return editorRef.readiness();
    },
  };

</script>

<div>
  <button type="button" data-testid="outside">outside</button>
  <RichTextEditor
    bind:this={editorRef}
    {value}
    {editable}
    {disabled}
    {messages}
    onChange={(event) => events.changes.push(clone(event))}
    onExternalConflict={(event) => events.conflicts.push(clone(event))}
    onUnsupportedPaste={(event) => events.unsupported.push(clone(event))}
    onReadinessChange={(event) => events.readiness.push({ ...event })}
  />
</div>
`;

const HARNESS_MAIN = `
import { mount, unmount } from "svelte";
import HarnessApp from "./HarnessApp.svelte";

const app = mount(HarnessApp, { target: document.getElementById("app") });
window.__rtUnmount = () => unmount(app);
window.__rtReady = true;
`;

const HARNESS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>rich-text browser harness</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

// ---------------------------------------------------------------------------
// Runner: build the harness, serve it locally, drive every scenario with
// puppeteer-core against system Chromium. No network leaves the machine.
// ---------------------------------------------------------------------------

function writeHarnessFiles(work) {
  mkdirSync(join(work, "src"), { recursive: true });
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "rt-harness", private: true, type: "module" }));
  writeFileSync(
    join(work, "vite.config.js"),
    `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { plugins: [svelte()], build: { outDir: "dist" } };\n`,
  );
  writeFileSync(join(work, "index.html"), HARNESS_HTML);
  writeFileSync(join(work, "src", "main.js"), HARNESS_MAIN);
  writeFileSync(
    join(work, "src", "HarnessApp.svelte"),
    HARNESS_APP.replaceAll("__COMPONENT_SOURCE__", COMPONENT_SOURCE).replaceAll(
      "__COMPONENT_CSS__",
      COMPONENT_CSS,
    ),
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function expectChanges(label, events, count) {
  assert(events.changes.length === count, label, `expected ${count} onChange call(s), saw ${events.changes.length}`);
}

async function openScenario(browser, base, scenario) {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error && error.message ? error.message : error)));
  await page.evaluateOnNewDocument(() => {
    window.__fetchCalls = [];
    window.fetch = (...args) => {
      window.__fetchCalls.push(args.map(String));
      return Promise.reject(new Error("fetch is blocked in the offline harness"));
    };
    const open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (...args) {
      window.__fetchCalls.push(["xhr", ...args.map(String)]);
      return open.apply(this, args);
    };
    const send = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function (...args) {
      return send.apply(this, args);
    };
  });
  const requests = [];
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()} ${request.resourceType()}`));
  await page.goto(`${base}/?scenario=${scenario}`, { waitUntil: "load", timeout: 30000 });
  await page.waitForFunction("window.__rtReady === true", { timeout: 30000 });
  // No clearing: mount-time traffic stays observed through unmount. Only
  // known harness assets (the locally served harness files) are excluded at
  // assertion time; everything else, including mount fetches, is a finding.
  return {
    page,
    requests,
    async done(label) {
      const fetchCalls = await page.evaluate(() => window.__fetchCalls);
      assert(fetchCalls.length === 0, label, `fetch/XHR sentinel recorded ${fetchCalls.length} call(s): ${JSON.stringify(fetchCalls).slice(0, 300)}`);
      // Exact harness allowlist: only the served harness document and its
      // own assets are exempt — never every URL containing the base. A
      // same-origin injected image (`/injected.png`) or beacon (`/beacon`)
      // shares the base but matches no entry below, so it fails. `data:`
      // and `blob:` URLs are not network traffic.
      const foreign = requests.filter((entry) => {
        const parts = entry.split(" ");
        const url = parts.slice(1, -1).join(" ");
        if (url.startsWith("data:") || url.startsWith("blob:")) return false;
        if (!url.startsWith(base)) return true;
        let path;
        try {
          const parsed = new URL(url);
          path = parsed.pathname + parsed.search;
        } catch {
          return true;
        }
        if (path === "/" || path === "/index.html") return false;
        if (path.startsWith("/?scenario=")) return false;
        if (path.startsWith("/assets/")) return false;
        if (path.startsWith("/src/")) return false;
        return true;
      });
      assert(foreign.length === 0, label, `non-harness network requests from mount through unmount: ${JSON.stringify(foreign).slice(0, 500)}`);
      assert(pageErrors.length === 0, label, `page errors: ${pageErrors.slice(0, 3).join(" | ")}`);
      await page.close();
    },
  };
}

// Public-surface reads only: the component handle exposes capture (never an
// editor object), so documents come from the deferred capture result.
const docOf = (page) => page.evaluate(() => window.__rt.capture().then((result) => result.document));
const changesOf = (page) => page.evaluate(() => window.__rt.events.changes);
const conflictsOf = (page) => page.evaluate(() => window.__rt.events.conflicts);
const selectionOf = (page) => page.evaluate(() => window.__rt.selection());
// Identity is recorded before operations and compared after: a first call
// made after the operation under test cannot witness a remount.
const recordIdentity = (page) =>
  page.evaluate(() => {
    window.__baselineEditor = window.__rt.editor();
    return true;
  });
const sameComponent = (page) =>
  page.evaluate(() => window.__baselineEditor === window.__rt.editor());

async function scenarioConflictFocused(browser, base) {
  const label = "conflict-focused";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  await page.click(".ProseMirror p:nth-child(2)");
  await page.keyboard.press("End");
  await page.keyboard.type(" XYZ");
  await sleep(300);
  const typed = await docOf(page);
  assert(typed.blocks[1].text.includes("XYZ"), label, "typed text is not in paragraph 2");
  const afterType = await selectionOf(page);
  await page.evaluate(() =>
    window.__rt.setValue({
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:1", kind: "paragraph", text: "Alpha CHANGED" },
        { paragraphId: "paragraph:2", kind: "paragraph", text: "Beta two" },
      ],
    }),
  );
  await sleep(300);
  const conflicts = await conflictsOf(page);
  assert(conflicts.length === 1, label, `expected exactly one onExternalConflict, saw ${conflicts.length}`);
  assert(conflicts[0].incoming.blocks[0].text === "Alpha CHANGED", label, "conflict does not carry the incoming document");
  assert(conflicts[0].local.blocks[1].text.includes("XYZ"), label, "conflict does not carry the local document");
  const displayed = await docOf(page);
  assert(displayed.blocks[1].text.includes("XYZ"), label, "local paragraph 2 was overwritten by the external update");
  const after = await selectionOf(page);
  assert(
    after && after.anchor.id === afterType.anchor.id && after.anchor.offset === afterType.anchor.offset,
    label,
    `caret moved across the external update (was ${JSON.stringify(afterType)}, now ${JSON.stringify(after)})`,
  );
  assert(await sameComponent(page), label, "conflict update remounted the component");
  await done(label);
  ok(label);
}

async function scenarioConflictBlur(browser, base) {
  const label = "conflict-blur";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  await page.click(".ProseMirror p:nth-child(2)");
  await page.keyboard.type(" blur");
  await sleep(300);
  await page.click('[data-testid="outside"]');
  await sleep(200);
  await page.evaluate(() =>
    window.__rt.setValue({
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:1", kind: "paragraph", text: "Alpha CHANGED" },
        { paragraphId: "paragraph:2", kind: "paragraph", text: "Beta two" },
      ],
    }),
  );
  await sleep(300);
  const conflicts = await conflictsOf(page);
  assert(conflicts.length === 1, label, `expected exactly one onExternalConflict after blur, saw ${conflicts.length}`);
  const displayed = await docOf(page);
  assert(displayed.blocks[1].text.includes("blur"), label, "local text was cleaned by the blur-time external update");
  assert(await sameComponent(page), label, "blur-time conflict remounted the component");
  await done(label);
  ok(label);
}

async function scenarioClean(browser, base) {
  const label = "clean";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  await page.click(".ProseMirror p:nth-child(2)");
  await page.keyboard.press("End");
  await sleep(200);
  const before = await selectionOf(page);
  await page.evaluate(() =>
    window.__rt.setValue({
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:1", kind: "paragraph", text: "Alpha CHANGED" },
        { paragraphId: "paragraph:2", kind: "paragraph", text: "Beta two" },
      ],
    }),
  );
  await sleep(300);
  const conflicts = await conflictsOf(page);
  assert(conflicts.length === 0, label, `clean update surfaced ${conflicts.length} conflict(s)`);
  const displayed = await docOf(page);
  assert(displayed.blocks[0].text === "Alpha CHANGED", label, "clean update was not applied");
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    return active !== null && active.closest(".st-rich-text-editor") !== null;
  });
  assert(focused, label, "focus left the editor on a clean update");
  const after = await selectionOf(page);
  assert(
    after && before && after.anchor.id === before.anchor.id && after.anchor.offset === before.anchor.offset,
    label,
    `real selection was not preserved (was ${JSON.stringify(before)}, now ${JSON.stringify(after)})`,
  );
  assert(await sameComponent(page), label, "clean update remounted the component");
  await done(label);
  ok(label);
}

async function scenarioEcho(browser, base) {
  const label = "echo";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  await page.click(".ProseMirror p");
  await sleep(200);
  await page.keyboard.press("End");
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.type("B");
  await sleep(300);
  const changes = await changesOf(page);
  assert(changes.length >= 1, label, "typing B emitted no change");
  const last = changes[changes.length - 1];
  assert(last.document.blocks[0].text === "B", label, `typed document is not B: ${JSON.stringify(last.document.blocks[0])}`);
  const caretBefore = await selectionOf(page);
  await page.evaluate((doc) => window.__rt.setValue(doc), last.document);
  await sleep(300);
  assert((await conflictsOf(page)).length === 0, label, "the echo was treated as a conflict");
  assert(await sameComponent(page), label, "the echo remounted the component");
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    return active !== null && active.closest(".st-rich-text-editor") !== null;
  });
  assert(focused, label, "the echo moved focus out of the editor");
  const caretAfter = await selectionOf(page);
  assert(
    caretAfter && caretAfter.anchor.id === caretBefore.anchor.id && caretAfter.anchor.offset === caretBefore.anchor.offset,
    label,
    "the echo reset the caret",
  );
  await page.evaluate(() => window.__rt.setValue({ format: "focus.markdown.p0@1", blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "C" }] }));
  await sleep(300);
  assert((await conflictsOf(page)).length === 0, label, "C after the echo surfaced a conflict");
  const displayed = await docOf(page);
  assert(displayed.blocks[0].text === "C", label, "C was not applied after the echo");
  const captured = await page.evaluate(() => window.__rt.capture());
  assert(captured.document.blocks[0].text === "C", label, "capture after C does not equal C");
  await done(label);
  ok(label);
}

async function scenarioComposition(browser, base) {
  const label = "composition";
  const { page, done } = await openScenario(browser, base, label);
  await page.click(".ProseMirror p");
  await page.keyboard.press("End");
  await sleep(200);
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 5, selectionEnd: 5, text: "caf" });
  await sleep(200);
  let readiness = await page.evaluate(() => window.__rt.events.readiness);
  assert(readiness.length === 1 && readiness[0].composing === true && readiness[0].ready === false, label, `no single composition-start signal: ${JSON.stringify(readiness)}`);
  expectChanges(label, await page.evaluate(() => window.__rt.events), 0);
  await page.evaluate(() => {
    window.__capOutcome = null;
    window.__rt
      .capture()
      .then((result) => {
        window.__capOutcome = { status: "resolved", document: result.document };
      })
      .catch((error) => {
        window.__capOutcome = { status: "rejected", name: error && error.name, message: error && error.message };
      });
  });
  await sleep(300);
  let capOutcome = await page.evaluate(() => window.__capOutcome);
  assert(capOutcome === null, label, `deferred capture settled mid-composition: ${JSON.stringify(capOutcome)}`);
  await cdp.send("Input.imeSetComposition", { selectionStart: 5, selectionEnd: 8, text: "café" });
  await sleep(200);
  await cdp.send("Input.insertText", { text: "café" });
  await sleep(400);
  const events = await page.evaluate(() => window.__rt.events);
  expectChanges(label, events, 1);
  const change = events.changes[0];
  assert(change.gesture.kind === "composition-commit", label, `commit gesture is not composition-commit: ${change.gesture.kind}`);
  const text = change.document.blocks[0].text;
  assert(text === "startcafé", label, `composed text is not exactly "startcafé": ${JSON.stringify(text)}`);
  readiness = await page.evaluate(() => window.__rt.events.readiness);
  assert(readiness.length === 2 && readiness[1].composing === false && readiness[1].ready === true, label, `no composition-end signal: ${JSON.stringify(readiness)}`);
  capOutcome = await page.evaluate(() => window.__capOutcome);
  assert(capOutcome !== null && capOutcome.status === "resolved", label, `deferred capture did not resolve after commit: ${JSON.stringify(capOutcome)}`);
  assert(capOutcome.document.blocks[0].text === "startcafé", label, "deferred capture resolved with a stale document");
  const captured = await page.evaluate(() => window.__rt.capture());
  assert(captured.document.blocks[0].text === "startcafé", label, "post-commit capture does not equal the commit document");
  // Second run: an emoji commits through the same deferred path.
  const current = await docOf(page);
  const end = current.blocks[0].text.length;
  await cdp.send("Input.imeSetComposition", { selectionStart: end, selectionEnd: end, text: "😀" });
  await sleep(200);
  await cdp.send("Input.insertText", { text: "😀" });
  await sleep(400);
  const eventsAfter = await page.evaluate(() => window.__rt.events);
  expectChanges(label, eventsAfter, 2);
  const emojiText = eventsAfter.changes[1].document.blocks[0].text;
  assert(emojiText === "startcafé😀", label, `emoji run did not commit exactly once: ${JSON.stringify(emojiText)}`);
  await cdp.detach();
  await done(label);
  ok(label);
}

async function scenarioCaptureUnmount(browser, base) {
  const label = "capture-unmount";
  const { page, done } = await openScenario(browser, base, label);
  await page.click(".ProseMirror p");
  await page.keyboard.press("End");
  await sleep(200);
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 5, selectionEnd: 5, text: "pen" });
  await sleep(200);
  await page.evaluate(() => {
    window.__capSettlements = 0;
    window.__capOutcome = null;
    window.__changesAtUnmount = window.__rt.events.changes.length;
    window.__readinessAtUnmount = window.__rt.events.readiness.length;
    window.__stale = window.__rt.editor();
    window.__rt
      .capture()
      .then(
        (result) => {
          window.__capSettlements += 1;
          window.__capOutcome = { status: "resolved", document: result.document };
        },
        (error) => {
          window.__capSettlements += 1;
          window.__capOutcome = { status: "rejected", name: error && error.name, message: error && error.message };
        },
      );
  });
  await sleep(200);
  await page.evaluate(() => window.__rtUnmount());
  await sleep(500);
  const outcome = await page.evaluate(() => ({ settlements: window.__capSettlements, outcome: window.__capOutcome }));
  assert(outcome.settlements === 1, label, `pending capture settled ${outcome.settlements} time(s), expected exactly once`);
  assert(
    outcome.outcome !== null &&
      outcome.outcome.status === "rejected" &&
      outcome.outcome.name === "RichTextCaptureUnavailable" &&
      outcome.outcome.message === "rich-text.capture-unavailable",
    label,
    `pending capture did not reject with the neutral error: ${JSON.stringify(outcome.outcome)}`,
  );
  const after = await page.evaluate(() => ({
    changes: window.__rt.events.changes.length,
    readiness: window.__rt.events.readiness.length,
    beforeChanges: window.__changesAtUnmount,
    beforeReadiness: window.__readinessAtUnmount,
  }));
  assert(after.changes === after.beforeChanges, label, "onChange fired after unmount");
  assert(after.readiness === after.beforeReadiness, label, "onReadinessChange fired after unmount");
  const stale = await page.evaluate(async () => {
    const result = { capture: null, readiness: null, threw: false };
    try {
      await window.__stale.captureDocument();
      result.capture = "resolved";
    } catch (error) {
      result.capture = `${error && error.name}:${error && error.message}`;
    }
    try {
      result.readiness = window.__stale.readiness();
    } catch {
      result.threw = true;
    }
    return result;
  });
  assert(stale.capture === "RichTextCaptureUnavailable:rich-text.capture-unavailable", label, `stale capture did not reject neutrally: ${stale.capture}`);
  assert(stale.threw === false && stale.readiness.composing === false && stale.readiness.ready === false, label, `stale readiness is not neutral: ${JSON.stringify(stale.readiness)}`);
  await cdp.detach();
  await done(label);
  ok(label);
}

function blocksEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function scenarioPreservedGestures(browser, base) {
  const label = "preserved-gestures";
  const { page, done } = await openScenario(browser, base, label);
  const initial = await docOf(page);
  const preservedBefore = initial.blocks.find((block) => block.kind === "preserved");
  assert(preservedBefore && preservedBefore.raw === "| a |", label, "harness document does not carry the preserved table");
  // (a) Select-all delete across the preserved block.
  await page.click(".ProseMirror p");
  await sleep(200);
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.press("Delete");
  await sleep(400);
  let events = await page.evaluate(() => window.__rt.events);
  let displayed = await docOf(page);
  let preserved = displayed.blocks.filter((block) => block.kind === "preserved");
  assert(
    preserved.length === 1 && preserved[0].paragraphId === preservedBefore.paragraphId && preserved[0].raw === preservedBefore.raw,
    label,
    `select-all delete removed or altered the preserved block: ${JSON.stringify(displayed.blocks)}`,
  );
  if (events.changes.length === 0) {
    assert(blocksEqual(displayed.blocks, initial.blocks), label, "refused delete still changed the document");
  } else {
    for (const block of displayed.blocks) {
      if (block.kind === "paragraph") {
        const before = initial.blocks.find((entry) => entry.paragraphId === block.paragraphId);
        assert(before !== undefined || block.text === "", label, `reduced delete invented a paragraph: ${JSON.stringify(block)}`);
      }
    }
    const last = events.changes[events.changes.length - 1];
    assert(blocksEqual(last.document.blocks, displayed.blocks), label, "the emitted document is not the displayed revision");
  }
  // (b) Paste plain text over the same spanning selection.
  const changesBefore = events.changes.length;
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.evaluate(() => {
    const editable = document.querySelector(".ProseMirror");
    const transfer = {
      getData: (type) => (type === "text/plain" || type === "Text" ? "replacement" : ""),
      types: ["text/plain"],
    };
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: transfer });
    editable.dispatchEvent(event);
  });
  await sleep(400);
  events = await page.evaluate(() => window.__rt.events);
  displayed = await docOf(page);
  preserved = displayed.blocks.filter((block) => block.kind === "preserved");
  assert(
    preserved.length === 1 && preserved[0].paragraphId === preservedBefore.paragraphId && preserved[0].raw === preservedBefore.raw,
    label,
    `spanning paste removed or altered the preserved block: ${JSON.stringify(displayed.blocks)}`,
  );
  assert(events.changes.length === changesBefore, label, "spanning paste emitted a change while the preserved block stood in the span");
  assert(blocksEqual(displayed.blocks, initial.blocks), label, "refused spanning paste still changed the document");
  await done(label);
  ok(label);
}

async function scenarioLocaleTheme(browser, base) {
  const label = "locale-theme";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  // Tall document so the editor scrolls: the scroll position is part of the
  // locale/theme preservation contract.
  const tall = Array.from({ length: 30 }, (_, index) => ({
    paragraphId: `paragraph:${index + 1}`,
    kind: "paragraph",
    text: `scroll line ${index + 1} with enough words to wrap and grow the editor`,
  }));
  await page.evaluate((blocks) =>
    window.__rt.setValue({ format: "focus.markdown.p0@1", blocks }), tall);
  await sleep(400);
  assert((await conflictsOf(page)).length === 0, label, "tall-document setup surfaced a conflict");
  await page.click(".ProseMirror p:nth-child(15)");
  await page.keyboard.press("End");
  await sleep(200);
  await page.evaluate(() => {
    const editable = document.querySelector(".ProseMirror");
    editable.style.height = "120px";
    editable.style.overflow = "auto";
    editable.scrollTop = 48;
  });
  await sleep(200);
  const before = await selectionOf(page);
  const scrollBefore = await page.evaluate(() => document.querySelector(".ProseMirror").scrollTop);
  assert(scrollBefore > 0, label, `editor scroll setup did not reach a nonzero position: ${scrollBefore}`);
  await page.evaluate(() =>
    window.__rt.setMessages({
      editorLabel: "SENTINEL-EDITOR-LABEL-2",
      placeholder: "SENTINEL-PLACEHOLDER-2",
      preservedBlockLabel: "SENTINEL-PRESERVED-2-{kind}",
      externalConflictLabel: "SENTINEL-CONFLICT-2",
    }),
  );
  await sleep(300);
  const aria = await page.evaluate(() => document.querySelector(".ProseMirror").getAttribute("aria-label"));
  assert(aria === "SENTINEL-EDITOR-LABEL-2", label, `locale switch did not re-render the label: ${JSON.stringify(aria)}`);
  assert(await sameComponent(page), label, "locale switch remounted the component");
  assert((await page.evaluate(() => window.__rt.events.changes)).length === 0, label, "locale switch emitted a change");
  const afterLocale = await selectionOf(page);
  assert(
    afterLocale && before && afterLocale.anchor.id === before.anchor.id && afterLocale.anchor.offset === before.anchor.offset,
    label, "locale switch moved the real selection",
  );
  const scrollAfterLocale = await page.evaluate(() => document.querySelector(".ProseMirror").scrollTop);
  assert(scrollAfterLocale > 0, label, `editor scroll collapsed to zero across the locale switch: ${scrollAfterLocale}`);
  assert(scrollAfterLocale === scrollBefore, label, `locale switch moved the editor scroll (${scrollBefore} -> ${scrollAfterLocale})`);
  // Contrasting token sets through the real stylesheet path: two themes set
  // the surface token to opposite colors and the computed style must follow.
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.setAttribute("data-testid", "rt-contrast-tokens");
    style.textContent = [
      '[data-st-theme="rt-contrast-a"] { --st-component-richTextEditor-surface: rgb(255, 0, 0); }',
      '[data-st-theme="rt-contrast-b"] { --st-component-richTextEditor-surface: rgb(0, 0, 255); }',
    ].join("\n");
    document.head.appendChild(style);
    document.documentElement.setAttribute("data-st-theme", "rt-contrast-a");
  });
  await sleep(300);
  const bgA = await page.evaluate(() => getComputedStyle(document.querySelector(".ProseMirror")).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute("data-st-theme", "rt-contrast-b"));
  await sleep(300);
  const bgB = await page.evaluate(() => getComputedStyle(document.querySelector(".ProseMirror")).backgroundColor);
  assert(bgA.includes("255, 0, 0"), label, `contrast theme A did not paint the editor surface red: ${bgA}`);
  assert(bgB.includes("0, 0, 255"), label, `contrast theme B did not paint the editor surface blue: ${bgB}`);
  assert(bgA !== bgB, label, "switching token sets did not change the computed editor style");
  assert(await sameComponent(page), label, "theme switch remounted the component");
  const afterTheme = await selectionOf(page);
  assert(
    afterTheme && afterTheme.anchor.id === before.anchor.id && afterTheme.anchor.offset === before.anchor.offset,
    label, "theme switch moved the real selection",
  );
  const scrollAfterTheme = await page.evaluate(() => document.querySelector(".ProseMirror").scrollTop);
  assert(scrollAfterTheme > 0, label, `editor scroll collapsed to zero across the theme switch: ${scrollAfterTheme}`);
  assert(scrollAfterTheme === scrollBefore, label, `theme switch moved the editor scroll (${scrollBefore} -> ${scrollAfterTheme})`);
  await done(label);
  ok(label);
}

async function scenarioPlaceholderLocale(browser, base) {
  const label = "placeholder-locale";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  await page.click(".ProseMirror p");
  await sleep(300);
  const showing = await page.evaluate(() => {
    const p = document.querySelector(".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]");
    return p === null
      ? null
      : { placeholder: p.getAttribute("data-placeholder"), untranslated: p.getAttribute("data-untranslated") };
  });
  assert(showing !== null, label, "empty paragraph carries no placeholder decoration");
  assert(showing.placeholder === "SENTINEL-PLACEHOLDER", label, `initial placeholder text mismatch: ${JSON.stringify(showing.placeholder)}`);
  assert(showing.untranslated === null, label, `translated placeholder carries a marker: ${showing.untranslated}`);
  const beforeContent = await page.evaluate(() => {
    const p = document.querySelector(".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]");
    return getComputedStyle(p, "::before").content;
  });
  assert(beforeContent.includes("SENTINEL-PLACEHOLDER"), label, `computed ::before does not render the placeholder: ${beforeContent}`);
  await page.evaluate(() =>
    window.__rt.setMessages({
      editorLabel: "SENTINEL-EDITOR-LABEL",
      placeholder: "SENTINEL-PLACEHOLDER-2",
      preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
      externalConflictLabel: "SENTINEL-CONFLICT",
    }),
  );
  await sleep(300);
  const after = await page.evaluate(() => {
    const p = document.querySelector(".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]");
    return {
      placeholder: p.getAttribute("data-placeholder"),
      untranslated: p.getAttribute("data-untranslated"),
      content: getComputedStyle(p, "::before").content,
    };
  });
  assert(after.placeholder === "SENTINEL-PLACEHOLDER-2", label, `locale switch did not re-render the paragraph placeholder: ${after.placeholder}`);
  assert(after.untranslated === null, label, `translated placeholder carries a marker: ${after.untranslated}`);
  assert(after.content.includes("SENTINEL-PLACEHOLDER-2"), label, `computed ::before kept the old locale: ${after.content}`);
  assert(await sameComponent(page), label, "locale switch remounted the component");
  assert((await page.evaluate(() => window.__rt.events.changes)).length === 0, label, "locale switch emitted a change");
  // Missing key: the marker text and its data attribute sit on the
  // displaying paragraph, and the computed content follows it.
  await page.evaluate(() => window.__rt.setMessages({}));
  // The marker is decoration-backed: it lands with the next decoration
  // build after the catalogue switch, so poll instead of sleeping once.
  await page.waitForFunction(
    () => {
      const p = document.querySelector(".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]");
      return p !== null && p.getAttribute("data-untranslated") === "rich-text.placeholder";
    },
    { timeout: 5000 },
  );
  const missing = await page.evaluate(() => {
    const p = document.querySelector(".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]");
    return {
      placeholder: p.getAttribute("data-placeholder"),
      untranslated: p.getAttribute("data-untranslated"),
      content: getComputedStyle(p, "::before").content,
    };
  });
  assert(missing.placeholder === "⟦untranslated:rich-text.placeholder⟧", label, `missing placeholder marker mismatch: ${missing.placeholder}`);
  assert(missing.untranslated === "rich-text.placeholder", label, `missing placeholder marker attribute mismatch: ${missing.untranslated}`);
  assert(missing.content.includes("untranslated:rich-text.placeholder"), label, `computed ::before does not render the marker: ${missing.content}`);
  await done(label);
  ok(label);
}

async function scenarioDisabledStates(browser, base) {
  const label = "disabled-states";
  const { page, done } = await openScenario(browser, base, label);
  await recordIdentity(page);
  // Host-like token base: semantic tokens come from the host theme, so the
  // harness defines the fallback endpoint the outline chain resolves to.
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.setAttribute("data-testid", "rt-token-base");
    style.textContent = ":root { --st-semantic-border-strong: rgb(51, 51, 51); }";
    document.head.appendChild(style);
  });
  await sleep(100);
  const stateOf = () => page.evaluate(() => ({
    ariaDisabled: document.querySelector(".ProseMirror").getAttribute("aria-disabled"),
    tabindex: document.querySelector(".ProseMirror").getAttribute("tabindex"),
    userSelect: getComputedStyle(document.querySelector(".ProseMirror")).userSelect,
  }));
  const initial = await stateOf();
  assert(initial.ariaDisabled === "false", label, `read-only state misreports aria-disabled: ${initial.ariaDisabled}`);
  assert(initial.tabindex === "0", label, `read-only editor left the tab order: ${initial.tabindex}`);
  // Editable baseline: typing emits exactly one change.
  await page.click(".ProseMirror p");
  await page.keyboard.press("End");
  await page.keyboard.type("Q");
  await sleep(300);
  const changesAfterQ = (await changesOf(page)).length;
  assert(changesAfterQ === 1, label, `editable baseline emitted ${changesAfterQ} change(s), expected 1`);
  // Disabled: exposed, untabbable, non-selectable, inert.
  await page.evaluate(() => window.__rt.setDisabled(true));
  await sleep(300);
  const disabled = await stateOf();
  assert(disabled.ariaDisabled === "true", label, `disabled state misses aria-disabled: ${disabled.ariaDisabled}`);
  assert(disabled.tabindex === "-1", label, `disabled editor stays in the tab order: ${disabled.tabindex}`);
  assert(disabled.userSelect === "none", label, `disabled text stays selectable (user-select: ${disabled.userSelect})`);
  // Disabled takes no focus: neither a real pointer click on the paragraph
  // (`tabindex="-1"` alone still lets the mousedown default move focus)
  // nor a programmatic focus() lands inside the editor.
  await page.click('[data-testid="outside"]');
  await sleep(100);
  await page.click(".ProseMirror p");
  await sleep(200);
  let disabledFocused = await page.evaluate(() => {
    const active = document.activeElement;
    return active !== null && active.closest(".st-rich-text-editor") !== null;
  });
  assert(!disabledFocused, label, "clicking a disabled paragraph focused the editor");
  await page.evaluate(() => document.querySelector(".ProseMirror").focus());
  await sleep(200);
  disabledFocused = await page.evaluate(() => {
    const active = document.activeElement;
    return active !== null && active.closest(".st-rich-text-editor") !== null;
  });
  assert(!disabledFocused, label, "programmatic focus() landed in the disabled editor");
  await page.keyboard.type("X");
  await page.evaluate(() => {
    const editable = document.querySelector(".ProseMirror");
    const transfer = { getData: () => "", types: ["text/plain"] };
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: transfer });
    editable.dispatchEvent(event);
  });
  await sleep(300);
  assert((await changesOf(page)).length === changesAfterQ, label, "disabled state accepted typing or paste");
  assert(await sameComponent(page), label, "disabled transition remounted the component");
  // Read-only: focusable with its caret, selectable, still inert.
  await page.evaluate(() => {
    window.__rt.setDisabled(false);
    window.__rt.setEditable(false);
  });
  await sleep(300);
  const readonly = await stateOf();
  assert(readonly.ariaDisabled === "false", label, `read-only state reports disabled: ${readonly.ariaDisabled}`);
  assert(readonly.tabindex === "0", label, `read-only editor left the tab order: ${readonly.tabindex}`);
  assert(readonly.userSelect !== "none", label, "read-only text is not selectable");
  // Keyboard focus: Tab from the outside button lands in the editor, which
  // matches :focus-visible (a mouse click on a non-editable region does not
  // request a visible indicator), so the focus-ring assertion below is real.
  await page.click('[data-testid="outside"]');
  await sleep(100);
  await page.keyboard.press("Tab");
  await sleep(200);
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    return active !== null && active.closest(".st-rich-text-editor") !== null;
  });
  assert(focused, label, "read-only editor is not focusable");
  // Visible focus outline from the focus tokens: solid, nonzero, colored.
  const outline = await page.evaluate(() => {
    const editable = document.querySelector(".ProseMirror");
    const style = getComputedStyle(editable);
    return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
  });
  assert(outline.style === "solid", label, `focus outline style is not solid: ${outline.style}`);
  assert(outline.width !== "0px" && outline.width !== "", label, `focus outline has no width: ${outline.width}`);
  await page.keyboard.type("Z");
  await sleep(300);
  assert((await changesOf(page)).length === changesAfterQ, label, "read-only state accepted typing");
  const captured = await page.evaluate(() => window.__rt.capture());
  assert(captured.document.blocks[0].text.includes("Q"), label, "disabled/read-only transitions altered the document");
  assert(!captured.document.blocks[0].text.includes("X"), label, "disabled typing leaked into the document");
  assert(!captured.document.blocks[0].text.includes("Z"), label, "read-only typing leaked into the document");
  // Live selection over read-only text: select-all reports a real range.
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await sleep(200);
  const selection = await selectionOf(page);
  assert(selection !== null && selection.anchor !== null, label, "read-only text cannot be selected");
  await done(label);
  ok(label);
}

async function scenarioNetwork(browser, base) {
  const label = "network";
  const { page, done } = await openScenario(browser, base, label);
  await page.click(".ProseMirror p:nth-child(2)");
  await page.keyboard.type(" net");
  await sleep(300);
  await page.evaluate(() => {
    const editable = document.querySelector(".ProseMirror");
    const transfer = {
      getData: (type) => (type === "text/plain" || type === "Text" ? "plain paste" : ""),
      types: ["text/plain"],
    };
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: transfer });
    editable.dispatchEvent(event);
  });
  await sleep(300);
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 0, selectionEnd: 0, text: "c" });
  await sleep(200);
  await cdp.send("Input.insertText", { text: "c" });
  await sleep(300);
  await cdp.detach();
  assert((await page.evaluate(() => document.querySelectorAll("img").length)) === 0, label, "an image element was rendered");
  await page.evaluate(() => window.__rtUnmount());
  await sleep(300);
  await done(label);
  ok(label);
}

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const work = mkdtempSync(join(tmpdir(), "rt-harness-"));
  // Cleanup handles are established before any launch so a failure after
  // this point still closes the server, the browser and both temp dirs.
  let server;
  let browser;
  let profile;
  const cleanup = async () => {
    try {
      if (browser !== undefined) await browser.close();
    } catch { /* already closed */ }
    try {
      if (server !== undefined) server.close();
    } catch { /* already closed */ }
    try {
      if (profile !== undefined) rmSync(profile, { recursive: true, force: true });
    } catch { /* already removed */ }
    try {
      rmSync(work, { recursive: true, force: true });
    } catch { /* already removed */ }
  };
  try {
    writeHarnessFiles(work);
    symlinkSync(join(WORKTREE_ROOT, "node_modules"), join(work, "node_modules"), "dir");
    console.log("building harness with vite");
    execFileSync(join(WORKTREE_ROOT, "node_modules", ".bin", "vite"), ["build"], { cwd: work, stdio: "inherit" });
    // Ephemeral port: the OS assigns a free one, so parallel runs never
    // collide on a fixed value.
    server = await serveDirectory(join(work, "dist"), 0);
    const address = server.address();
    const port = typeof address === "object" && address !== null ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;
    const puppeteer = (await import("puppeteer-core")).default;
    // Snap-confined Chromium cannot create its SingletonLock under $TMPDIR
    // (Permission denied, measured); /tmp is writable to it, so the throwaway
    // browser profile lives there, never in the session tmp root.
    profile = mkdtempSync("/tmp/rt-chrome-profile-");
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    await scenarioConflictFocused(browser, base);
    await scenarioConflictBlur(browser, base);
    await scenarioClean(browser, base);
    await scenarioEcho(browser, base);
    await scenarioComposition(browser, base);
    await scenarioCaptureUnmount(browser, base);
    await scenarioPreservedGestures(browser, base);
    await scenarioLocaleTheme(browser, base);
    await scenarioPlaceholderLocale(browser, base);
    await scenarioDisabledStates(browser, base);
    await scenarioNetwork(browser, base);
  } finally {
    await cleanup();
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("\nall browser scenarios green");
}

await main();
