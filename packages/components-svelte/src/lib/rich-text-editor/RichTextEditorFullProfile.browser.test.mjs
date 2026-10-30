/**
 * CL-2F FK1–FK4 browser witnesses + §6.2.1 host-handled Enter: the full
 * `profile` in a real browser through puppeteer-core and system Chromium.
 * Spec §8 (CL-2F RED keyboard witnesses): FK1 Tab/Shift+Tab indent/outdent
 * with content/id/start retention, FK2 Enter/Backspace split/lift/join plus
 * undo, FK3 code Enter/triple-Enter exit/Backspace with language and LF
 * round-trip, FK4 Shift+Enter as inline hard break (paragraphs and list
 * items). Each path runs with composition coverage nearby and a host-handled
 * Enter that inserts no newline (§6.2.1 `ComposerKeyEvent` forwarding), with
 * capture and no-remount asserted after every path.
 *
 * Self-contained like the P0 browser suite: the harness page mounts the
 * components from SOURCE, is built with the worktree's vite + svelte plugin
 * into a throwaway dir (with a `node_modules` symlink so bare imports
 * resolve), served locally, and driven with puppeteer-core. No network
 * leaves the machine. Run with:
 *   node packages/components-svelte/src/lib/rich-text-editor/RichTextEditorFullProfile.browser.test.mjs
 * optionally with CHROME_BIN set. Exit 0 on green, 1 with the failing
 * assertion printed.
 *
 * RED state: fails because the `full` profile selection does not exist yet
 * (the harness cannot mount an unknown profile).
 */
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { join } = path;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.resolve(HERE, "..", "..", "..");
const WORKTREE_ROOT = path.resolve(PACKAGE_DIR, "..", "..");
const COMPONENT_SOURCE = path.join(HERE, "RichTextEditor.svelte");
const COMPOSER_SOURCE = path.join(HERE, "ComposerEditor.svelte");
const COMPONENT_CSS = path.join(HERE, "rich-text-editor.css");
// CL-2 offline gate: the browser harness must never load a collaboration
// runtime. Any of these markers in a served harness asset fails the run.
const PROVIDER_RUNTIME_MARKERS = [
  "yjs",
  "y-protocols",
  "y-prosemirror",
  "hocuspocus",
  "HocuspocusProvider",
  "WebsocketProvider",
];

// Boundary-aware marker scan: a bare `includes` false-positives on
// `linkifyjs` (bundled by the link extension), so a marker only counts when
// no identifier character flanks it. A real collaboration import still
// matches (`"yjs"`, `(yjs`, ` yjs;` …).
function containsRuntimeMarker(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9_$])${escaped}([^A-Za-z0-9_$]|$)`).test(text);
}

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

// Follow-up fixtures: the boundary-aware provider-free scan still catches
// real collaboration imports while ignoring linkifyjs. Runs at load, before
// any browser work, and fails the run on a scan regression.
for (const [text, marker, expected] of [
  [`import { Doc } from "yjs"`, "yjs", true],
  [`import { awarenessProtocol } from "y-protocols/awareness"`, "y-protocols", true],
  [`import "y-protocols/awareness"`, "yjs", false],
  [`import "y-prosemirror"`, "y-prosemirror", true],
  [`const provider = new HocuspocusProvider()`, "HocuspocusProvider", true],
  [`new WebsocketProvider(url, name, doc)`, "WebsocketProvider", true],
  [`/* yjs collaboration */`, "yjs", true],
  [`import { linkify } from "linkifyjs"`, "yjs", false],
  [`import "linkify-html"`, "yjs", false],
  [`const myjs = 1`, "yjs", false],
  [`const yjsx = 1`, "yjs", false],
]) {
  assert(
    containsRuntimeMarker(text, marker) === expected,
    "provider-markers",
    `scan ${expected ? "missed" : "flagged"} ${JSON.stringify(marker)} in ${JSON.stringify(text)}`,
  );
}

// ---------------------------------------------------------------------------
// Embedded harness: mounts the real components from source with `profile`
// set to `full`, exposing a scriptable window.__full surface (document) and
// window.__composer surface (composer with host key handling).
// ---------------------------------------------------------------------------

const HARNESS_APP = `
<script>
  import RichTextEditor from "__COMPONENT_SOURCE__";
  import ComposerEditor from "__COMPOSER_SOURCE__";
  import "__COMPONENT_CSS__";

  const params = new URLSearchParams(location.search);
  const scenario = params.get("scenario") ?? "full-list";
  const surface = params.get("surface") ?? "document";
  const editableParam = params.get("editable");
  const disabledParam = params.get("disabled");

  const SENTINEL = {
    editorLabel: "SENTINEL-EDITOR-LABEL",
    placeholder: "SENTINEL-PLACEHOLDER",
    preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
    externalConflictLabel: "SENTINEL-CONFLICT",
  };

  const FORMAT = "ds.markdown.full@1";
  const seg = (text) => ({ type: "text", text, marks: {} });
  const meta = (partial = {}) => ({
    blockKind: "paragraph",
    listKind: "none",
    listDepth: 0,
    blockquoteDepth: 0,
    containerOrder: [],
    ...partial,
  });
  const para = (id, segments, partial) => ({ paragraphId: id, kind: "paragraph", metadata: meta(partial), segments });
  const item = (id, text, run, depth = 0, extra = {}) => para(id, [seg(text)], {
    listKind: "bullet",
    listDepth: depth,
    listRunId: run,
    listItemId: id,
    listTight: true,
    containerOrder: ["list"],
    ...extra,
  });
  // Ordered item: one order entry per nesting level (item 5/13).
  const oitem = (id, text, run, depth = 0, extra = {}) => {
    const order = [];
    for (let level = 0; level <= depth; level += 1) order.push("list");
    return para(id, [seg(text)], {
      listKind: "ordered",
      listDepth: depth,
      listRunId: run,
      listItemId: id,
      listTight: true,
      containerOrder: order,
      ...extra,
    });
  };

  const SCENARIOS = {
    "full-list": {
      value: { format: FORMAT, blocks: [item("k1", "First", "k1"), item("k2", "Second", "k1")] },
    },
    "full-link": {
      value: {
        format: FORMAT,
        blocks: [
          para("p1", [
            { type: "text", text: "Go ", marks: {} },
            { type: "text", text: "there", marks: { link: "https://example.com/" } },
          ]),
        ],
      },
    },
    "full-list-break": {
      value: { format: FORMAT, blocks: [item("b1", "Alpha beta", "b1"), item("b2", "Gamma", "b1")] },
    },
    "full-ordered": {
      value: {
        format: FORMAT,
        blocks: [
          oitem("o1", "First", "o1", 0, { orderedStart: 2 }),
          oitem("o2", "Second", "o1"),
        ],
      },
    },
    "full-nested": {
      value: {
        format: FORMAT,
        blocks: [
          oitem("o1", "First", "o1", 0, { orderedStart: 3 }),
          oitem("o2", "Second", "o1"),
          para("b1", [seg("Nested")], {
            listKind: "bullet",
            listDepth: 1,
            listRunId: "b1",
            listItemId: "b1",
            listTight: true,
            containerOrder: ["list", "list"],
          }),
        ],
      },
    },
    "full-code": {
      value: {
        format: FORMAT,
        blocks: [
          para("c1", [seg("line one")], { blockKind: "codeBlock", codeLanguage: "js" }),
          para("p2", [seg("After")]),
        ],
      },
    },
    "full-break": {
      value: { format: FORMAT, blocks: [para("p1", [seg("Hello world")])] },
    },
    "full-composition": {
      value: {
        format: FORMAT,
        blocks: [para("h1", [seg("Topic")], { blockKind: "heading", headingLevel: 2 })],
      },
    },
    "full-composer": {
      composer: "",
    },
  };

  const initial = SCENARIOS[scenario] ?? SCENARIOS["full-list"];
  // Item 13 remounts set window.__harnessValue to the captured document;
  // a fresh load uses the scenario fixture.
  let value = $state(window.__harnessValue ?? initial.value);
  let messages = $state({ ...SENTINEL });
  let editorRef = $state(null);
  let composerValue = $state(initial.composer ?? "");
  let composerRef = $state(null);

  const events = { changes: [], conflicts: [], unsupported: [], readiness: [] };
  const composerEvents = { changes: [], readiness: [] };
  // Plain (non-state) log: a state array of objects crosses
  // page.evaluate as empty objects (proxy-clone quirk), so the host key
  // facts live in a plain array the page can clone exactly.
  const keyLog = [];
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

  // §6.2.1 host key policy: a plain Enter is host-handled (prevented, so no
  // newline is inserted); Shift+Enter passes through to the editor. Every
  // forwarded key is recorded with its modifiers and composition fact.
  function hostKey(event) {
    keyLog.push({
      key: event.key,
      code: event.code,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
      isComposing: event.isComposing,
    });
    if (event.key === "Enter" && !event.shiftKey) event.preventDefault();
    return false;
  }

  window.__composer = {
    scenario,
    surface,
    events: composerEvents,
    keys: keyLog,
    setValue(next) {
      composerValue = next;
    },
    editor() {
      return composerRef;
    },
    async capture() {
      return composerRef.captureComposer();
    },
    readiness() {
      return composerRef.readiness();
    },
  };

  window.__full = {
    scenario,
    events,
    setValue(next) {
      value = next;
    },
    setMessages(next) {
      messages = next;
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
  {#if surface === "composer"}
    <ComposerEditor
      bind:this={composerRef}
      value={composerValue}
      profile="full"
      {messages}
      onChange={(text) => composerEvents.changes.push(text)}
      onReadinessChange={(event) => composerEvents.readiness.push({ ...event })}
      onKeyDown={hostKey}
    />
  {:else}
    <RichTextEditor
      bind:this={editorRef}
      {value}
      profile="full"
      editable={editableParam === null ? true : editableParam !== "0"}
      disabled={disabledParam === "1"}
      {messages}
      onChange={(event) => events.changes.push(clone(event))}
      onExternalConflict={(event) => events.conflicts.push(clone(event))}
      onUnsupportedPaste={(event) => events.unsupported.push(clone(event))}
      onReadinessChange={(event) => events.readiness.push({ ...event })}
    />
  {/if}
</div>
`;

const HARNESS_MAIN = `
import { mount, unmount } from "svelte";
import HarnessApp from "./HarnessApp.svelte";

let app = mount(HarnessApp, { target: document.getElementById("app") });
window.__rtUnmount = () => unmount(app);
// Item 13 remount: destroy the app and mount it again on the supplied
// document (capture → remount → capture equality after every FK path).
window.__rtRemount = (doc) => {
  unmount(app);
  window.__harnessValue = doc;
  window.__rtReady = false;
  app = mount(HarnessApp, { target: document.getElementById("app") });
  scheduleReadyMark();
  return true;
};
// Full construction loads the extension graph on demand (dynamic import),
// so the core settles after mount: readiness gates on the component
// reporting ready, absorbing the async gap (review 2 blocking 1). The
// harness exposes the surfaces as __full/__composer (never __rt).
window.__rtReady = false;
function currentReadiness() {
  try {
    const composer = window.__composer;
    if (composer && composer.editor()) return composer.readiness();
  } catch {
    // Not the composer surface: fall through to the document surface.
  }
  return window.__full.readiness();
}
function scheduleReadyMark() {
  let ready = false;
  try {
    ready = currentReadiness().ready === true;
  } catch {
    ready = false;
  }
  if (ready) {
    window.__rtReady = true;
    return;
  }
  setTimeout(scheduleReadyMark, 25);
}
scheduleReadyMark();
`;

const HARNESS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>rich-text full-profile browser harness</title>
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
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "rt-full-harness", private: true, type: "module" }));
  writeFileSync(
    join(work, "vite.config.js"),
    `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { plugins: [svelte()], build: { outDir: "dist" } };\n`,
  );
  writeFileSync(join(work, "index.html"), HARNESS_HTML);
  writeFileSync(join(work, "src", "main.js"), HARNESS_MAIN);
  writeFileSync(
    join(work, "src", "HarnessApp.svelte"),
    HARNESS_APP.replaceAll("__COMPONENT_SOURCE__", COMPONENT_SOURCE)
      .replaceAll("__COMPOSER_SOURCE__", COMPOSER_SOURCE)
      .replaceAll("__COMPONENT_CSS__", COMPONENT_CSS),
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

async function openScenario(browser, base, scenario, surface = "document", extraQuery = "") {
  const page = await browser.newPage();
  // Cache off: every navigation re-requests its modules, so the lazy
  // full-graph chunk is observable on every full mount (positive control
  // for review 2 blocking 1).
  await page.setCacheEnabled(false);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error && error.message ? error.message : error)));
  await page.evaluateOnNewDocument(() => {
    window.__fetchCalls = [];
    window.__wsCalls = [];
    window.fetch = (...args) => {
      window.__fetchCalls.push(args.map(String));
      return Promise.reject(new Error("fetch is blocked in the offline harness"));
    };
    const open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (...args) {
      window.__fetchCalls.push(["xhr", ...args.map(String)]);
      return open.apply(this, args);
    };
    const RealWebSocket = window.WebSocket;
    window.WebSocket = function (...args) {
      window.__wsCalls.push(args.map(String));
      throw new Error("websocket is blocked in the offline harness");
    };
    window.WebSocket.prototype = RealWebSocket.prototype;
  });
  const requests = [];
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()} ${request.resourceType()}`));
  await page.goto(`${base}/?surface=${surface}&scenario=${scenario}${extraQuery}`, { waitUntil: "load", timeout: 30000 });
  await page.waitForFunction("window.__rtReady === true", { timeout: 30000 });
  return {
    page,
    requests,
    async done(label) {
      const fetchCalls = await page.evaluate(() => window.__fetchCalls);
      assert(fetchCalls.length === 0, label, `fetch/XHR sentinel recorded ${fetchCalls.length} call(s): ${JSON.stringify(fetchCalls).slice(0, 300)}`);
      const wsCalls = await page.evaluate(() => window.__wsCalls);
      assert(wsCalls.length === 0, label, `websocket sentinel recorded ${wsCalls.length} call(s): ${JSON.stringify(wsCalls).slice(0, 300)}`);
      const providerGlobals = await page.evaluate(() => ({
        y: typeof window.Y,
        hocuspocus: typeof window.Hocuspocus,
      }));
      assert(providerGlobals.y === "undefined", label, "a Yjs global landed on the offline page");
      assert(providerGlobals.hocuspocus === "undefined", label, "a Hocuspocus global landed on the offline page");
      // Review 2 blocking 1, lazy-graph positive control: the full mount
      // resolves its extension graph on demand through a dynamic chunk
      // named after `editor-full-extensions`.
      const fullChunk = requests.filter((entry) => entry.includes("editor-full-extensions"));
      assert(fullChunk.length > 0, label, "full mount never requested the lazy extension graph chunk");
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
        if (path.startsWith("/?surface=")) return false;
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
const docOf = (page) => page.evaluate(() => window.__full.capture().then((result) => result.document));
const changesOf = (page) => page.evaluate(() => window.__full.events.changes);
const recordIdentity = (page) =>
  page.evaluate(() => {
    window.__baselineEditor = window.__full.editor();
    return true;
  });
const sameComponent = (page) =>
  page.evaluate(() => window.__baselineEditor === window.__full.editor());
const composerRecordIdentity = (page) =>
  page.evaluate(() => {
    window.__baselineComposer = window.__composer.editor();
    return true;
  });
const sameComposer = (page) =>
  page.evaluate(() => window.__baselineComposer === window.__composer.editor());

const runItemsOf = (doc, run) => doc.blocks.filter((block) => block.metadata && block.metadata.listRunId === run);

// Item 13: destroy the app and mount it again on the captured document,
// re-baseline the component identity, and assert the capture round-trips.
// Every ordered/nested FK path ends with one of these.
const remountCapture = async (page, label, step) => {
  const before = await docOf(page);
  await page.evaluate((doc) => window.__rtRemount(doc), before);
  // The remounted full core settles after its on-demand graph load.
  await page.waitForFunction("window.__rtReady === true", { timeout: 30000 });
  await recordIdentity(page);
  const after = await docOf(page);
  assert(JSON.stringify(after) === JSON.stringify(before), label, `${step} remount changed the capture`);
  assert(await sameComponent(page), label, `${step} remounted the component`);
  return after;
};
const segmentsTextOf = (block) =>
  ((block.kind === "paragraph" ? block.segments : []) ?? [])
    .map((segment) => (segment.type === "hardBreak" ? "\n" : segment.text ?? ""))
    .join("");
const hasHardBreak = (block) =>
  ((block.kind === "paragraph" ? block.segments : []) ?? []).some((segment) => segment.type === "hardBreak");

// CL-2F-FK1: Tab indents and Shift+Tab outdents the second bullet item,
// retaining content, the run identity and the item identity; every path ends
// with a capture and no remount.
async function scenarioFullFk1(browser, base) {
  const label = "full-fk1";
  const { page, done } = await openScenario(browser, base, "full-list");
  await recordIdentity(page);
  await page.click('[data-paragraph-id="k2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Tab");
  await sleep(400);
  let displayed = await docOf(page);
  let second = displayed.blocks.find((block) => block.paragraphId === "k2");
  assert(second !== undefined, label, `second item lost its identity across Tab: ${JSON.stringify(displayed.blocks)}`);
  assert(second.metadata.listDepth === 1, label, `Tab did not indent the item: ${JSON.stringify(second.metadata)}`);
  // The indented item opens its own nested run (opener rule §4.3.2); the
  // item identity and content stay with it, the depth-0 run keeps k1.
  assert(second.metadata.listRunId === "k2", label, `nested run did not open on the indented item: ${JSON.stringify(second.metadata)}`);
  assert(second.metadata.listItemId === "k2", label, `Tab broke the item identity: ${JSON.stringify(second.metadata)}`);
  assert(segmentsTextOf(second) === "Second", label, `Tab altered the item content: ${JSON.stringify(second.segments)}`);
  assert((await changesOf(page)).length >= 1, label, "Tab indent emitted no change");
  assert(await sameComponent(page), label, "Tab indent remounted the component");
  await page.click('[data-paragraph-id="k2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.down("Shift");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Shift");
  await sleep(400);
  displayed = await docOf(page);
  second = displayed.blocks.find((block) => block.paragraphId === "k2");
  assert(second !== undefined, label, "second item lost its identity across Shift+Tab");
  assert(second.metadata.listDepth === 0, label, `Shift+Tab did not outdent the item: ${JSON.stringify(second.metadata)}`);
  assert(second.metadata.listRunId === "k1", label, `Shift+Tab broke the run lineage: ${JSON.stringify(second.metadata)}`);
  assert(segmentsTextOf(second) === "Second", label, "Shift+Tab altered the item content");
  assert(await sameComponent(page), label, "Shift+Tab outdent remounted the component");
  await done(label);
  ok(label);
}

// CL-2F-FK2: Enter mid-item splits with run lineage, Backspace at the tail
// start rejoins, Enter at the end opens a fresh sibling (undone), and Enter
// on an empty item lifts it out of the list. Capture and no-remount after
// every path.
async function scenarioFullFk2(browser, base) {
  const label = "full-fk2";
  const { page, done } = await openScenario(browser, base, "full-list");
  await recordIdentity(page);
  // Split "First" into "Fir" + "st" (End, two chars back, Enter).
  await page.click('[data-paragraph-id="k1"]');
  await sleep(300);
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  let displayed = await docOf(page);
  let run = runItemsOf(displayed, "k1");
  assert(run.length === 3, label, `split did not open a sibling in the same run: ${JSON.stringify(displayed.blocks)}`);
  assert(run[0].paragraphId === "k1" && segmentsTextOf(run[0]) === "Fir", label, `split head is wrong: ${JSON.stringify(run[0])}`);
  const tail = run[1];
  assert(tail.paragraphId !== "k1", label, "split tail reused the head identity");
  assert(tail.metadata.listItemId !== "k1", label, "split tail reused the head item identity");
  assert(segmentsTextOf(tail) === "st", label, `split tail text is wrong: ${JSON.stringify(tail.segments)}`);
  assert(await sameComponent(page), label, "list split remounted the component");
  // Backspace at the tail start rejoins into the head.
  await page.click(`[data-paragraph-id="${tail.paragraphId}"]`);
  await sleep(300);
  await page.keyboard.press("Home");
  await sleep(200);
  await page.keyboard.press("Backspace");
  await sleep(400);
  displayed = await docOf(page);
  run = runItemsOf(displayed, "k1");
  assert(run.length === 2, label, `Backspace did not rejoin the tail: ${JSON.stringify(displayed.blocks)}`);
  assert(segmentsTextOf(run[0]) === "First", label, `rejoin lost content: ${JSON.stringify(run[0].segments)}`);
  assert(await sameComponent(page), label, "list rejoin remounted the component");
  // Enter at the end of the last item opens a fresh sibling without a start.
  await page.click('[data-paragraph-id="k2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  run = runItemsOf(displayed, "k1");
  assert(run.length === 3, label, `end-of-item Enter opened no sibling: ${JSON.stringify(displayed.blocks)}`);
  const fresh = run[2];
  assert(fresh.paragraphId !== "k2", label, "fresh sibling reused the previous item identity");
  assert(fresh.metadata.orderedStart === undefined, label, "fresh bullet sibling carries an opener-only start");
  // Undo removes the fresh sibling.
  await page.keyboard.down("Control");
  await page.keyboard.press("z");
  await page.keyboard.up("Control");
  await sleep(400);
  displayed = await docOf(page);
  run = runItemsOf(displayed, "k1");
  assert(run.length === 2, label, `undo did not remove the fresh sibling: ${JSON.stringify(displayed.blocks)}`);
  assert(await sameComponent(page), label, "undo remounted the component");
  // Enter on an empty item lifts it out of the list.
  await page.click('[data-paragraph-id="k2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  let empty = runItemsOf(displayed, "k1")[2];
  assert(empty !== undefined && segmentsTextOf(empty) === "", label, "expected a fresh empty sibling before the lift");
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  const lifted = displayed.blocks.find((block) => block.paragraphId === empty.paragraphId);
  assert(lifted !== undefined, label, "empty item vanished instead of lifting out");
  assert((lifted.metadata.listKind ?? "none") === "none", label, `empty-item Enter did not lift out of the list: ${JSON.stringify(lifted.metadata)}`);
  assert(await sameComponent(page), label, "empty-item lift remounted the component");
  await done(label);
  ok(label);
}

// CL-2F-FK3: Enter inside the code block adds a line, triple-Enter at the
// end exits into a paragraph, and Backspace at the exited paragraph start
// returns to code-plus-paragraph. Language and LF survive every capture.
async function scenarioFullFk3(browser, base) {
  const label = "full-fk3";
  const { page, done } = await openScenario(browser, base, "full-code");
  await recordIdentity(page);
  await page.click(".ProseMirror pre");
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  let displayed = await docOf(page);
  let code = displayed.blocks.find((block) => block.paragraphId === "c1");
  assert(code !== undefined, label, "code block lost its identity across Enter");
  assert(code.metadata.blockKind === "codeBlock", label, `Enter left the code block: ${JSON.stringify(code.metadata)}`);
  assert(segmentsTextOf(code) === "line one\n", label, `code lines did not grow exactly: ${JSON.stringify(code.segments)}`);
  assert(await sameComponent(page), label, "code Enter remounted the component");
  // Two more Enters at the end exit the code block (exitOnTripleEnter).
  await page.keyboard.press("Enter");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  code = displayed.blocks.find((block) => block.paragraphId === "c1");
  assert(code !== undefined && code.metadata.blockKind === "codeBlock", label, "triple-Enter destroyed the code block");
  assert(segmentsTextOf(code).includes("line one"), label, `triple-Enter dropped code lines: ${JSON.stringify(code.segments)}`);
  const exitedIndex = displayed.blocks.findIndex((block) => block.paragraphId === "c1");
  const exited = displayed.blocks[exitedIndex + 1];
  assert(
    exited !== undefined && (exited.metadata.blockKind ?? "paragraph") === "paragraph" && (exited.metadata.listKind ?? "none") === "none",
    label,
    `triple-Enter opened no plain paragraph after the code: ${JSON.stringify(displayed.blocks)}`,
  );
  assert(await sameComponent(page), label, "code exit remounted the component");
  // Backspace at the start of the exited paragraph removes it at the
  // paragraph/code boundary, keeping the code block and its lines.
  await page.click(`[data-paragraph-id="${exited.paragraphId}"]`);
  await sleep(300);
  await page.keyboard.press("Home");
  await sleep(200);
  await page.keyboard.press("Backspace");
  await sleep(400);
  displayed = await docOf(page);
  code = displayed.blocks.find((block) => block.paragraphId === "c1");
  assert(code !== undefined && segmentsTextOf(code).includes("line one"), label, "boundary Backspace damaged the code lines");
  assert(code.metadata.codeLanguage === "js", label, `language did not survive: ${JSON.stringify(code.metadata)}`);
  assert(await sameComponent(page), label, "boundary Backspace remounted the component");
  await done(label);
  ok(label);
}

// CL-2F-FK4: Shift+Enter stays an inline hard break (one block, no split)
// in a paragraph and in a list item; a plain Enter then splits prose.
async function scenarioFullFk4(browser, base) {
  const label = "full-fk4";
  const { page, done } = await openScenario(browser, base, "full-break");
  await recordIdentity(page);
  await page.click('[data-paragraph-id="p1"]');
  await sleep(300);  // Let the click focus settle before positioning: keys dispatched into an
  // unfocused editor are lost and the Shift+Enter would land at the click
  // caret instead of the intended offset.
  await sleep(300);
  await page.keyboard.press("Home");
  for (let step = 0; step < 5; step += 1) await page.keyboard.press("ArrowRight");
  await sleep(200);
  const caret = await page.evaluate(() => window.__full.selection());
  assert(caret !== null && caret.anchor.id === "p1" && caret.anchor.offset === 5, label, `caret is not at the intended offset: ${JSON.stringify(caret)}`);
  await page.keyboard.down("Shift");
  await sleep(100);
  await page.keyboard.press("Enter");
  await page.keyboard.up("Shift");
  await sleep(400);
  let displayed = await docOf(page);
  assert(displayed.blocks.length === 1, label, `Shift+Enter split the paragraph: ${JSON.stringify(displayed.blocks)}`);
  assert(hasHardBreak(displayed.blocks[0]), label, "Shift+Enter left no hard break in the paragraph");
  assert(segmentsTextOf(displayed.blocks[0]) === "Hello\n world", label, `hard-break content is wrong: ${JSON.stringify(displayed.blocks[0].segments)}`);
  assert(await sameComponent(page), label, "Shift+Enter remounted the component");
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  assert(displayed.blocks.length === 2, label, `plain Enter did not split prose: ${JSON.stringify(displayed.blocks)}`);
  assert(await sameComponent(page), label, "prose split remounted the component");
  await done(label);
  ok(label);
}

// CL-2F-FK4 list half: Shift+Enter inside an item keeps the item count and
// stores the hard break in the item; plain Enter still opens a sibling.
async function scenarioFullFk4List(browser, base) {
  const label = "full-fk4-list";
  const { page, done } = await openScenario(browser, base, "full-list-break");
  await recordIdentity(page);
  await page.click('[data-paragraph-id="b1"]');
  await sleep(300);  // Same focus-settling guard as the paragraph half: no positioning key may
  // run before the click focus lands.
  await sleep(300);
  await page.keyboard.press("Home");
  for (let step = 0; step < 5; step += 1) await page.keyboard.press("ArrowRight");
  await sleep(200);
  const itemCaret = await page.evaluate(() => window.__full.selection());
  assert(itemCaret !== null && itemCaret.anchor.id === "b1" && itemCaret.anchor.offset === 5, label, `caret is not at the intended offset: ${JSON.stringify(itemCaret)}`);
  await page.keyboard.down("Shift");
  await sleep(100);
  await page.keyboard.press("Enter");
  await page.keyboard.up("Shift");
  await sleep(400);
  let displayed = await docOf(page);
  let run = runItemsOf(displayed, "b1");
  assert(run.length === 2, label, `Shift+Enter split the list item: ${JSON.stringify(displayed.blocks)}`);
  const first = run[0];
  assert(first.paragraphId === "b1" && hasHardBreak(first), label, "Shift+Enter left no hard break in the item");
  assert(await sameComponent(page), label, "item Shift+Enter remounted the component");
  await page.click('[data-paragraph-id="b2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  run = runItemsOf(displayed, "b1");
  assert(run.length === 3, label, `plain Enter opened no sibling: ${JSON.stringify(displayed.blocks)}`);
  assert(await sameComponent(page), label, "item split remounted the component");
  await done(label);
  ok(label);
}

// CL-2F-FK-ORDERED (item 13): ordered edges — Enter at the end of an item
// opens a numbered sibling on the same run keeping the opener start, and a
// mid-item split keeps run lineage and continued numbering. Capture and
// remount after each path.
async function scenarioFullFkOrdered(browser, base) {
  const label = "full-fk-ordered";
  const { page, done } = await openScenario(browser, base, "full-ordered");
  await recordIdentity(page);
  // Path 1: Enter at the end of o2 opens an empty o3 on run o1.
  await page.click('[data-paragraph-id="o2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  let displayed = await docOf(page);
  let run = runItemsOf(displayed, "o1");
  assert(run.length === 3, label, `end-of-item Enter opened no sibling: ${JSON.stringify(displayed.blocks)}`);
  assert(run[0].paragraphId === "o1" && segmentsTextOf(run[0]) === "First", label, `head moved: ${JSON.stringify(run[0])}`);
  assert(run[0].metadata.orderedStart === 2, label, `opener lost its start: ${JSON.stringify(run[0].metadata)}`);
  assert(segmentsTextOf(run[1]) === "Second", label, `middle moved: ${JSON.stringify(run[1])}`);
  const third = run[2];
  assert(segmentsTextOf(third) === "", label, `fresh sibling not empty: ${JSON.stringify(third.segments)}`);
  assert(third.metadata.listRunId === "o1", label, "fresh sibling left the run");
  assert(third.metadata.orderedStart === undefined, label, "fresh sibling carries an opener-only start");
  assert(await sameComponent(page), label, "ordered sibling remounted the component");
  await remountCapture(page, label, "end-of-item Enter");
  // Path 2: split o1 mid-word keeps the run and continues numbering.
  await page.click('[data-paragraph-id="o1"]');
  await sleep(300);
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(400);
  displayed = await docOf(page);
  run = runItemsOf(displayed, "o1");
  assert(run.length === 4, label, `mid-item split opened no sibling: ${JSON.stringify(displayed.blocks)}`);
  assert(run[0].paragraphId === "o1" && segmentsTextOf(run[0]) === "Fir", label, `split head is wrong: ${JSON.stringify(run[0])}`);
  assert(segmentsTextOf(run[1]) === "st", label, `split tail is wrong: ${JSON.stringify(run[1])}`);
  assert(run[1].metadata.listRunId === "o1", label, "split tail left the run");
  assert(segmentsTextOf(run[2]) === "Second", label, `middle moved across the split: ${JSON.stringify(run[2])}`);
  assert(run[0].metadata.orderedStart === 2, label, "split moved the opener start");
  assert(await sameComponent(page), label, "ordered split remounted the component");
  await remountCapture(page, label, "mid-item split");
  await done(label);
  ok(label);
}

// CL-2F-FK-NESTED (item 13): nested edges on a mixed ordered/bullet run
// pair — outdenting the nested bullet to depth 0 keeps its content and
// order entries, and indenting an ordered item opens a nested run.
// Capture and remount after each path.
async function scenarioFullFkNested(browser, base) {
  const label = "full-fk-nested";
  const { page, done } = await openScenario(browser, base, "full-nested");
  await recordIdentity(page);
  // Path 1: Shift+Tab outdents the nested bullet to depth 0.
  await page.click('[data-paragraph-id="b1"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.down("Shift");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Shift");
  await sleep(400);
  let displayed = await docOf(page);
  let nested = displayed.blocks.find((block) => block.paragraphId === "b1");
  assert(nested !== undefined, label, "nested item lost its identity across Shift+Tab");
  assert(nested.metadata.listDepth === 0, label, `Shift+Tab did not outdent the item: ${JSON.stringify(nested.metadata)}`);
  assert(JSON.stringify(nested.metadata.containerOrder) === JSON.stringify(["list"]), label, `outdent broke the order entries: ${JSON.stringify(nested.metadata)}`);
  assert(segmentsTextOf(nested) === "Nested", label, `Shift+Tab altered the item content: ${JSON.stringify(nested.segments)}`);
  assert(await sameComponent(page), label, "nested outdent remounted the component");
  await remountCapture(page, label, "nested outdent");
  // Path 2: Tab indents o2 under o1, opening a nested run.
  await page.click('[data-paragraph-id="o2"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  await page.keyboard.press("Tab");
  await sleep(400);
  displayed = await docOf(page);
  const indented = displayed.blocks.find((block) => block.paragraphId === "o2");
  assert(indented !== undefined, label, "indented item lost its identity across Tab");
  assert(indented.metadata.listDepth === 1, label, `Tab did not indent the item: ${JSON.stringify(indented.metadata)}`);
  assert(indented.metadata.listRunId !== "o1", label, "nested item kept the parent run");
  assert(segmentsTextOf(indented) === "Second", label, `Tab altered the item content: ${JSON.stringify(indented.segments)}`);
  assert(await sameComponent(page), label, "nested indent remounted the component");
  await remountCapture(page, label, "nested indent");
  await done(label);
  ok(label);
}

// Full-profile composition: a real IME commit inside a heading emits one
// composition-commit change carrying the composed text, with readiness
// start/end and a matching capture.
async function scenarioFullComposition(browser, base) {
  const label = "full-composition";
  const { page, done } = await openScenario(browser, base, "full-composition");
  await recordIdentity(page);
  await page.click('[data-paragraph-id="h1"]');
  await sleep(300);
  await page.keyboard.press("End");
  await sleep(200);
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 5, selectionEnd: 5, text: "caf" });
  await sleep(200);
  let readiness = await page.evaluate(() => window.__full.events.readiness);
  assert(readiness.length === 1 && readiness[0].composing === true && readiness[0].ready === false, label, `no composition-start signal: ${JSON.stringify(readiness)}`);
  assert((await changesOf(page)).length === 0, label, "composition start emitted a change");
  await cdp.send("Input.imeSetComposition", { selectionStart: 5, selectionEnd: 8, text: "café" });
  await sleep(200);
  await cdp.send("Input.insertText", { text: "café" });
  await sleep(400);
  const events = await page.evaluate(() => window.__full.events);
  assert(events.changes.length === 1, label, `composition commit emitted ${events.changes.length} change(s), expected 1`);
  assert(events.changes[0].gesture.kind === "composition-commit", label, `commit gesture is not composition-commit: ${events.changes[0].gesture.kind}`);
  const text = segmentsTextOf(events.changes[0].document.blocks[0]);
  assert(text === "Topiccafé", label, `composed heading text is wrong: ${JSON.stringify(text)}`);
  readiness = await page.evaluate(() => window.__full.events.readiness);
  assert(readiness.length === 2 && readiness[1].composing === false && readiness[1].ready === true, label, `no composition-end signal: ${JSON.stringify(readiness)}`);
  const captured = await docOf(page);
  assert(segmentsTextOf(captured.blocks[0]) === "Topiccafé", label, "post-commit capture does not carry the commit");
  assert(captured.blocks[0].metadata.blockKind === "heading", label, "composition changed the block kind");
  assert(await sameComponent(page), label, "composition remounted the component");
  await cdp.detach();
  await done(label);
  ok(label);
}

// §6.2.1 host-handled Enter on the composer surface (`profile="full"`):
// the host prevents a plain Enter (no newline is inserted, capture is
// unchanged) while Shift+Enter passes through; the forwarded key carries
// modifiers and the composition fact. A real IME commit then sends once.
async function scenarioFullComposerEnter(browser, base) {
  const label = "full-composer-enter";
  const { page, done } = await openScenario(browser, base, "full-composer", "composer");
  await composerRecordIdentity(page);
  await page.click(".ProseMirror p");
  await sleep(300);
  await page.keyboard.type("hello");
  await sleep(400);
  let captured = await page.evaluate(() => window.__composer.capture());
  assert(captured.text === "hello", label, `composer capture is not hello: ${JSON.stringify(captured.text)}`);
  await page.keyboard.press("Enter");
  await sleep(400);
  captured = await page.evaluate(() => window.__composer.capture());
  assert(captured.text === "hello", label, `host-handled Enter inserted a newline: ${JSON.stringify(captured.text)}`);
  let keys = await page.evaluate(() => window.__composer.keys);
  const enter = keys[keys.length - 1];
  assert(
    enter !== undefined && enter.key === "Enter" && enter.shiftKey === false && enter.isComposing === false,
    label,
    `host did not receive the plain Enter facts: ${JSON.stringify(enter)}`,
  );
  assert(await sameComposer(page), label, "host-handled Enter remounted the composer");
  // Shift+Enter passes through: the composer string carries the canonical
  // full wire, so the hard break lands in backslash form (HARD-BREAK-FORM);
  // a bare LF would re-parse as a space and lose the line break.
  await page.keyboard.down("Shift");
  await sleep(100);
  await page.keyboard.press("Enter");
  await page.keyboard.up("Shift");
  await sleep(200);
  await page.keyboard.type("world");
  await sleep(400);
  captured = await page.evaluate(() => window.__composer.capture());
  const backslash = String.fromCharCode(92);
  assert(
    captured.text.length === 12 &&
      captured.text.startsWith("hello") &&
      captured.text.endsWith("\nworld") &&
      captured.text.includes(backslash),
    label,
    `Shift+Enter did not break the line in canonical form: ${JSON.stringify(captured.text)}`,
  );
  // Composition commit sends once through the same surface.
  const changesBeforeClear = await page.evaluate(() => window.__composer.events.changes.length);
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await sleep(300);
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 0, selectionEnd: 0, text: "caf" });
  await sleep(200);
  await cdp.send("Input.insertText", { text: "café" });
  await sleep(400);
  const events = await page.evaluate(() => window.__composer.events);
  assert(events.changes.length === changesBeforeClear + 2, label, `expected clear + commit changes, saw ${events.changes.length - changesBeforeClear}`);
  assert(events.changes[events.changes.length - 1] === "café", label, `commit did not send café: ${JSON.stringify(events.changes[events.changes.length - 1])}`);
  captured = await page.evaluate(() => window.__composer.capture());
  assert(captured.text === "café", label, `composer capture after the commit is not café: ${JSON.stringify(captured.text)}`);
  assert(await sameComposer(page), label, "composition remounted the composer");
  await cdp.detach();
  await done(label);
  ok(label);
}

// CL-2F-F-URL item 1: links stay inert in a real browser — plain click,
// Ctrl/Meta click, middle click and keyboard Enter open nothing (no new
// tab, no navigation); read-only/disabled mounts render no navigable
// attributes while the text stays selectable. Capture and no-remount after
// every path.
async function scenarioFullLink(browser, base) {
  const label = "full-link";
  const { page, done } = await openScenario(browser, base, "full-link");
  await recordIdentity(page);
  const urlBefore = page.url();
  const targetsBefore = (await browser.targets()).length;
  const assertCalm = async (step, expectSplit = false) => {
    await sleep(400);
    const targets = await browser.targets();
    assert(targets.length === targetsBefore, label, `${step} opened a new tab (${targetsBefore} -> ${targets.length})`);
    assert(page.url() === urlBefore, label, `${step} navigated the page (${urlBefore} -> ${page.url()})`);
    const displayed = await docOf(page);
    const joined = displayed.blocks
      .map((block) => ((block.kind === "paragraph" ? block.segments : []) ?? [])
        .map((segment) => segment.text ?? "")
        .join(""))
      .join("\n");
    // Enter legitimately splits the paragraph at the selection left by the
    // middle click; every other path keeps a single block. Either way no
    // character may be lost or added.
    const expected = expectSplit ? joined.replace(/\n/g, "") : joined;
    assert(expected === "Go there", label, `${step} altered the text: ${JSON.stringify(joined)}`);
    assert(await sameComponent(page), label, `${step} remounted the component`);
  };
  const href = await page.evaluate(() => document.querySelector("a[href]")?.getAttribute("href"));
  assert(href === "https://example.com/", label, `editable link href missing: ${href}`);
  // Plain click opens nothing.
  await page.click("a[href]");
  await assertCalm("plain click");
  // Ctrl/Meta click opens nothing.
  await page.keyboard.down("Control");
  await page.click("a[href]");
  await page.keyboard.up("Control");
  await assertCalm("ctrl click");
  // Middle click opens nothing.
  await page.click("a[href]", { button: "middle" });
  await assertCalm("middle click");
  // Keyboard Enter on the focused link opens nothing (the paragraph split is
  // the legitimate editing behavior).
  await page.evaluate(() => document.querySelector("a[href]")?.focus());
  await sleep(200);
  await page.keyboard.press("Enter");
  await assertCalm("keyboard enter", true);
  await done(label);
  ok(`${label} editable`);

  // Read-only: no navigable attribute rendered, text selectable, clicks inert.
  {
    const read = await openScenario(browser, base, "full-link", "document", "&editable=0");
    const readUrlBefore = read.page.url();
    const readTargetsBefore = (await browser.targets()).length;
    const roHref = await read.page.evaluate(() => document.querySelector("a[href]"));
    assert(roHref === null, label, "read-only mount rendered a navigable href");
    const roText = await read.page.evaluate(() => document.querySelector("a")?.textContent);
    assert(roText === "there", label, `read-only link text lost: ${roText}`);
    await read.page.click("a");
    await sleep(400);
    assert(read.page.url() === readUrlBefore, label, "read-only click navigated the page");
    assert((await browser.targets()).length === readTargetsBefore, label, "read-only click opened a new tab");
    const roDoc = await docOf(read.page);
    assert(roDoc.blocks.length >= 1, label, "read-only capture lost the document");
    await read.done(`${label} readonly`);
    ok(`${label} readonly`);
  }

  // Disabled: same inert rendering and behavior.
  {
    const dis = await openScenario(browser, base, "full-link", "document", "&disabled=1");
    const disUrlBefore = dis.page.url();
    const disTargetsBefore = (await browser.targets()).length;
    const disHref = await dis.page.evaluate(() => document.querySelector("a[href]"));
    assert(disHref === null, label, "disabled mount rendered a navigable href");
    const disText = await dis.page.evaluate(() => document.querySelector("a")?.textContent);
    assert(disText === "there", label, `disabled link text lost: ${disText}`);
    await dis.page.click("a");
    await sleep(400);
    assert(dis.page.url() === disUrlBefore, label, "disabled click navigated the page");
    assert((await browser.targets()).length === disTargetsBefore, label, "disabled click opened a new tab");
    await dis.done(`${label} disabled`);
    ok(`${label} disabled`);
  }
}

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const work = mkdtempSync(join(tmpdir(), "rt-full-harness-"));
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
    } catch { /* already removed */ }
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
    console.log("building full-profile harness with vite");
    execFileSync(join(WORKTREE_ROOT, "node_modules", ".bin", "vite"), ["build"], { cwd: work, stdio: "inherit" });
    // CL-2 offline dossier, asserted provider-free: the built harness
    // (document + composer full surfaces) carries no collaboration runtime.
    {
      const assets = readdirSync(join(work, "dist", "assets")).filter((name) => name.endsWith(".js"));
      assert(assets.length > 0, "provider-free", "harness build produced no JS assets to scan");
      for (const name of assets) {
        const text = readFileSync(join(work, "dist", "assets", name), "utf8");
        for (const marker of PROVIDER_RUNTIME_MARKERS) {
          assert(!containsRuntimeMarker(text, marker), "provider-free", `harness asset ${name} loads the collaboration runtime (${marker})`);
        }
      }
      console.log(`ok provider-free: ${assets.length} harness asset(s) scanned, no collaboration runtime`);
    }
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
    profile = mkdtempSync("/tmp/rt-full-chrome-profile-");
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    await scenarioFullFk1(browser, base);
    await scenarioFullFk2(browser, base);
    await scenarioFullFk3(browser, base);
    await scenarioFullFk4(browser, base);
    await scenarioFullFk4List(browser, base);
    await scenarioFullFkOrdered(browser, base);
    await scenarioFullFkNested(browser, base);
    await scenarioFullComposition(browser, base);
    await scenarioFullComposerEnter(browser, base);
    await scenarioFullLink(browser, base);
  } finally {
    await cleanup();
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("\nall full-profile browser scenarios green");
}

await main();
