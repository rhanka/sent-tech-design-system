/**
 * CL-3b2 bound real-IME witness + F-3 perf (spec §4.6.1 witness 5 real-IME
 * half, §8.5 envelope, register entry AMB-4).
 *
 * Bound Chromium suite: mounts bound editors through the injected
 * `"./editor/collaboration"` runtime over in-memory test-double `Y.Doc`s
 * exchanging updates (two editable participants plus a read-only replica
 * and an authoritative doc), drives composition with CDP
 * `Input.imeSetComposition` / `Input.insertText` as the existing scenarios
 * do, and asserts the same shared-state facts in the page. Local render is a
 * real browser render, never jsdom dispatch.
 *
 * AMB-4: the two existing suites stay unmodified and provider-free; this
 * suite is the only harness allowed to load the collaboration runtime. It
 * keeps the offline network gates (no fetch, no socket, no provider
 * globals) and asserts its own build references the collaboration entry —
 * the behavioural scenarios prove the runtime actually runs.
 *
 * Run with:
 *   node packages/components-svelte/src/lib/rich-text-editor/RichTextEditorBound.browser.test.mjs
 * optionally with CHROME_BIN set. Exit 0 on green, 1 with the failing
 * assertion printed.
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
const RICH_TEXT_SRC = join(WORKTREE_ROOT, "packages", "rich-text", "src");

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
// Embedded bound harness: plain JS (no Svelte component — Svelte bound
// mounting is CL-5, AMB-5) mounting bound core editors into plain divs.
// ---------------------------------------------------------------------------

const HARNESS_MAIN = `
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { TextSelection } from "@tiptap/pm/state";
import { createBoundRichTextEditor } from "__RT_EDITOR_BOUND__";
import { seedFieldFromDocument, captureDocumentFromField, fieldTextName, fieldMetaName } from "__RT_CODEC__";
import { buildSelectionMap } from "__RT_PROJECTION__";
import { selectionToCursorJson } from "__RT_SELECTION__";

const params = new URLSearchParams(location.search);
const scenario = params.get("scenario") ?? "bound-ime-commit";

const P0 = "focus.markdown.p0@1";
const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const world = {
  docs: {},
  editors: {},
  elements: {},
  awareness: {},
  sources: {},
  changes: {},
  errors: {},
  conflicts: {},
  updates: {},
  counters: {},
  syncOn: true,
  syncing: false,
};

const paragraph = (id, text) => ({ paragraphId: id, kind: "paragraph", text });

function textOf(doc, fieldKey) {
  return doc.getText(fieldTextName(fieldKey));
}
function metaOf(doc, fieldKey) {
  return doc.getMap(fieldMetaName(fieldKey));
}
function seedDoc(doc, fieldKey, blocks) {
  seedFieldFromDocument(textOf(doc, fieldKey), metaOf(doc, fieldKey), fieldKey, { format: P0, blocks });
}

function wireSync() {
  // One listener per distinct doc (shareDoc modes alias several tags to one
  // doc); the tag counter only advances on that tag's own listener.
  const seen = new Set();
  for (const [tag, doc] of Object.entries(world.docs)) {
    if (seen.has(doc)) continue;
    seen.add(doc);
    doc.on("update", (update) => {
      for (const [alias, candidate] of Object.entries(world.docs)) {
        if (candidate === doc) world.updates[alias] = (world.updates[alias] ?? 0) + 1;
      }
      if (!world.syncOn || world.syncing) return;
      world.syncing = true;
      try {
        for (const other of new Set(Object.values(world.docs))) {
          if (other !== doc) Y.applyUpdate(other, update);
        }
      } finally {
        world.syncing = false;
      }
    });
  }
}

const registry = new Map();

function sourceFor(doc, awareness) {
  return {
    resolveBinding: (identity) => ({
      identity: { ...identity },
      text: textOf(doc, identity.fieldKey),
      fieldMeta: metaOf(doc, identity.fieldKey),
      awareness,
    }),
    releaseBinding: () => {},
    registerActor: (actor) => {
      registry.set(actor.actorId, { displayLabel: actor.displayLabel, color: actor.color });
    },
    revokeActor: (actorId) => {
      registry.delete(actorId);
    },
    admittedActorOf: (actorId) => registry.get(actorId) ?? null,
  };
}

async function mountEditor({ tag, fieldKey, doc, awareness, actorId, label, color, editable, documentId, sessionId }) {
  const element = document.createElement("div");
  element.setAttribute("data-testid", "bound-" + tag);
  document.body.appendChild(element);
  world.elements[tag] = element;
  world.changes[tag] = [];
  world.errors[tag] = [];
  world.conflicts[tag] = [];
  world.updates[tag] = 0;
  let n = 0;
  const source = sourceFor(doc, awareness);
  world.sources[tag] = source;
  const editor = await createBoundRichTextEditor({
    document: { format: P0, blocks: world.blocks.map((block) => ({ ...block })) },
    messages: { ...MESSAGES },
    allocateId: () => "fresh:bound:" + tag + ":" + (n += 1),
    collaborationBinding: { documentId, sessionId, fieldKey },
    collaborationSource: source,
    collaborationActor: { actorId, kind: "human", displayLabel: label, color },
    element,
    editable,
    onChange: (event) => world.changes[tag].push(JSON.parse(JSON.stringify(event))),
    onExternalConflict: (event) => world.conflicts[tag].push(JSON.parse(JSON.stringify(event))),
    onBindingError: (event) => world.errors[tag].push(JSON.parse(JSON.stringify(event))),
  });
  world.editors[tag] = editor;
  return editor;
}

async function setupWorld(config) {
  world.blocks = config.blocks.map((block) => ({ ...block }));
  const fieldList = config.fields ?? [config.fieldKey ?? "body"];
  world.fieldList = fieldList;
  const authority = new Y.Doc();
  for (const fieldKey of fieldList) seedDoc(authority, fieldKey, world.blocks);
  world.docs.authority = authority;
  if (config.shareDoc) {
    const shared = new Y.Doc();
    Y.applyUpdate(shared, Y.encodeStateAsUpdate(authority));
    const awareness = new Awareness(shared);
    world.docs.shared = shared;
    world.awareness.shared = awareness;
    for (const participant of config.participants) {
      world.docs[participant.tag] = shared;
    }
  } else {
    for (const participant of config.participants) {
      const fork = new Y.Doc();
      Y.applyUpdate(fork, Y.encodeStateAsUpdate(authority));
      world.docs[participant.tag] = fork;
      world.awareness[participant.tag] = new Awareness(fork);
    }
  }
  wireSync();
  for (const participant of config.participants) {
    const doc = world.docs[participant.tag];
    const awareness = config.shareDoc ? world.awareness.shared : world.awareness[participant.tag];
    await mountEditor({
      tag: participant.tag,
      fieldKey: participant.fieldKey ?? config.fieldKey ?? "body",
      doc,
      awareness,
      actorId: participant.actorId,
      label: participant.label ?? participant.actorId,
      color: participant.color ?? "#112233",
      editable: participant.editable ?? true,
      documentId: "bound:" + scenario + ":canvas",
      sessionId: "bound:" + scenario + ":session",
    });
  }
  return true;
}

function docOf(tag) {
  return world.docs[tag];
}

window.__bound = {
  scenario,
  isBound: true,
  setup: setupWorld,
  sharedText(tag) {
    return textOf(docOf(tag), "body").toString();
  },
  fieldText(tag, fieldKey) {
    const editor = world.editors[tag];
    return editor.view.state.doc.textContent;
  },
  pmText(tag) {
    const editor = world.editors[tag];
    return editor.view.state.doc.textBetween(0, editor.view.state.doc.content.size, "\\n\\n", "\\n");
  },
  changes(tag) {
    return world.changes[tag] ?? [];
  },
  errors(tag) {
    return world.errors[tag] ?? [];
  },
  conflicts(tag) {
    return world.conflicts[tag] ?? [];
  },
  updateCount(tag) {
    return world.updates[tag] ?? 0;
  },
  resetUpdates(tag) {
    world.updates[tag] = 0;
  },
  async capture(tag) {
    return world.editors[tag].captureDocument();
  },
  vectors() {
    const out = {};
    for (const [tag, doc] of Object.entries(world.docs)) {
      if (tag === "authority" || tag === "shared") continue;
      const bytes = new Uint8Array(Y.encodeStateVector(doc));
      out[tag] = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    return out;
  },
  readiness(tag) {
    return world.editors[tag].readiness();
  },
  setEditable(tag, next) {
    world.editors[tag].setEditable(next);
  },
  typeText(tag, paragraphId, text) {
    world.editors[tag].typeText(paragraphId, text);
  },
  splitParagraph(tag, paragraphId, offset) {
    world.editors[tag].splitParagraph(paragraphId, offset);
  },
  undo(tag) {
    world.editors[tag].undo();
  },
  registerActor(actor) {
    for (const source of Object.values(world.sources)) source.registerActor(actor);
  },
  revokeActor(actorId) {
    for (const source of Object.values(world.sources)) source.revokeActor(actorId);
  },
  localCursor() {
    const awareness = world.awareness.shared ?? Object.values(world.awareness)[0];
    return awareness.getLocalState();
  },
  cursorOf(tag) {
    const awareness = world.awareness[tag] ?? world.awareness.shared;
    const state = awareness.getLocalState();
    return state?.cursor ?? null;
  },
  clearRemote(clientId) {
    const awareness = world.awareness.shared ?? Object.values(world.awareness)[0];
    const states = awareness.getStates();
    const state = states.get(clientId);
    if (state) {
      states.set(clientId, { ...state, cursor: null });
      awareness.emit("change", [{ added: [], updated: [clientId], removed: [] }, "test"]);
    }
  },
  undo(tag) {
    world.editors[tag].undo();
  },
  redo(tag) {
    world.editors[tag].redo();
  },
  stopCapturing(tag) {
    world.editors[tag].stopCapturing();
  },
  disconnect() {
    world.syncOn = false;
  },
  reconnect() {
    world.syncOn = true;
    const docs = Object.values(world.docs);
    for (let round = 0; round < 2; round += 1) {
      for (const src of docs) {
        const update = Y.encodeStateAsUpdate(src);
        for (const dst of docs) {
          if (dst !== src) Y.applyUpdate(dst, update);
        }
      }
    }
  },
  authorityText() {
    return textOf(world.docs.authority, (world.fieldList ?? ["body"])[0]).toString();
  },
  pmLength(tag) {
    return world.editors[tag].view.state.doc.textContent.length;
  },
  sel(tag) {
    const selection = world.editors[tag].view.state.selection;
    return { anchor: selection.anchor, head: selection.head };
  },
  collapse(tag, pos) {
    const editor = world.editors[tag];
    editor.view.dispatch(
      editor.view.state.tr.setSelection(TextSelection.create(editor.view.state.doc, pos)),
    );
  },
  publishRemote({ clientId, actorId, name, color, tag, fieldKey, anchorPm, headPm }) {
    const key = fieldKey ?? "body";
    const editor = world.editors[tag];
    const doc = docOf(tag);
    const map = buildSelectionMap(editor.view.state.doc, textOf(doc, key));
    const cursor = selectionToCursorJson(textOf(doc, key), key, map, anchorPm, headPm);
    const awareness = world.awareness[tag] ?? world.awareness.shared;
    awareness.getStates().set(clientId, {
      actorId,
      user: { name, color },
      cursor: { fieldKey: key, anchor: cursor.anchor, head: cursor.head },
    });
    awareness.emit("change", [{ added: [clientId], updated: [], removed: [] }, "test"]);
  },
  caretCount(tag, actorId) {
    return world.elements[tag].querySelectorAll('[data-remote-caret="' + actorId + '"]').length;
  },
  caretLabel(tag, actorId) {
    const node = world.elements[tag].querySelector('[data-remote-caret="' + actorId + '"]');
    return node ? node.textContent : null;
  },
  awarenessBytes() {
    const states = [];
    for (const awareness of Object.values(world.awareness)) {
      states.push(JSON.stringify(awareness.getLocalState() ?? null).length);
    }
    return Math.max(...states);
  },
};

window.__boundReady = true;
`;

// ---------------------------------------------------------------------------
// Runner: build the harness, serve it locally, drive every scenario with
// puppeteer-core against system Chromium. No network leaves the machine.
// ---------------------------------------------------------------------------

const HARNESS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>bound rich-text harness</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

function writeHarnessFiles(work) {
  mkdirSync(join(work, "src"), { recursive: true });
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "rt-bound-harness", private: true, type: "module" }));
  writeFileSync(
    join(work, "vite.config.js"),
    `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { plugins: [svelte()], build: { outDir: "dist" } };\n`,
  );
  writeFileSync(join(work, "index.html"), HARNESS_HTML);
  // AMB-4: this is the only harness allowed to load the collaboration
  // runtime — the build references the injected "./editor/collaboration"
  // entry, and the scenarios below prove it runs.
  assert(
    HARNESS_MAIN.includes("__RT_EDITOR_BOUND__"),
    "bound-entry",
    "the bound harness no longer references the collaboration runtime entry",
  );
  writeFileSync(
    join(work, "src", "main.js"),
    HARNESS_MAIN.replaceAll("__RT_EDITOR_BOUND__", join(RICH_TEXT_SRC, "editor-bound.ts"))
      .replaceAll("__RT_EDITOR_COLLABORATION__", join(RICH_TEXT_SRC, "editor-collaboration.ts"))
      .replaceAll("__RT_CODEC__", join(RICH_TEXT_SRC, "collab-codec.ts"))
      .replaceAll("__RT_PROJECTION__", join(RICH_TEXT_SRC, "collab-projection.ts"))
      .replaceAll("__RT_SELECTION__", join(RICH_TEXT_SRC, "collab-selection.ts")),
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

async function openScenario(browser, base, scenario) {
  const page = await browser.newPage();
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
    const RealWebSocket = window.WebSocket;
    window.WebSocket = function (...args) {
      window.__wsCalls.push(args.map(String));
      throw new Error("websocket is blocked in the offline harness");
    };
    window.WebSocket.prototype = RealWebSocket.prototype;
  });
  await page.goto(`${base}/?scenario=${scenario}`, { waitUntil: "load", timeout: 30000 });
  await page.waitForFunction("window.__boundReady === true", { timeout: 30000 });
  return {
    page,
    async done(label) {
      const fetchCalls = await page.evaluate(() => window.__fetchCalls);
      assert(fetchCalls.length === 0, label, `fetch/XHR sentinel recorded ${fetchCalls.length} call(s)`);
      const wsCalls = await page.evaluate(() => window.__wsCalls);
      assert(wsCalls.length === 0, label, `websocket sentinel recorded ${wsCalls.length} call(s)`);
      const providerGlobals = await page.evaluate(() => ({
        y: typeof window.Y,
        hocuspocus: typeof window.Hocuspocus,
      }));
      assert(providerGlobals.y === "undefined", label, "a Yjs global landed on the offline page");
      assert(providerGlobals.hocuspocus === "undefined", label, "a Hocuspocus global landed on the offline page");
      assert(await page.evaluate(() => window.__bound.isBound) === true, label, "the page did not run the bound harness");
      assert(pageErrors.length === 0, label, `page errors: ${pageErrors.slice(0, 3).join(" | ")}`);
      await page.close();
    },
  };
}

function percentile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((q / 100) * sorted.length) - 1)];
}
const p95 = (values) => percentile(values, 95);
const p50 = (values) => percentile(values, 50);

const btext = (page, tag) => page.evaluate((t) => window.__bound.sharedText(t), tag);
const bpmt = (page, tag) => page.evaluate((t) => window.__bound.pmText(t), tag);
const bchanges = (page, tag) => page.evaluate((t) => window.__bound.changes(t), tag);
const bvectors = (page) => page.evaluate(() => window.__bound.vectors());

// Witness 5 real-IME half: replica A composes uncommitted X while replica B
// commits Y in the same paragraph. Browser ordering note: clicking B
// mid-composition would commit A's composition through the real IME blur
// path, so the browser variant commits Y (real typing) before A starts
// composing (real CDP composition), then lands a second remote Y2 through
// the core gesture path while A composes — the same shared facts as the
// jsdom run (X absent/Y present pre-commit, deferred repaint, exactly one
// commit transaction, Y survives, convergence after Z + reconnect).
async function scenarioBoundImeCommit(browser, base) {
  const label = "bound-ime-commit";
  const { page, done } = await openScenario(browser, base, label);
  await page.evaluate(() => window.__bound.setup({
    blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "ab" }],
    participants: [
      { tag: "A", actorId: "actor-a", label: "A", color: "#112233", editable: true },
      { tag: "B", actorId: "actor-b", label: "B", color: "#445566", editable: true },
      { tag: "C", actorId: "actor-c", label: "C", color: "#778899", editable: false },
    ],
  }));
  // B commits Y with real typing; it lands everywhere through update sync.
  await page.click('[data-testid="bound-B"] .ProseMirror p');
  await page.keyboard.press("End");
  await page.keyboard.type("Y");
  await sleep(500);
  for (const tag of ["A", "B", "C"]) {
    assert((await btext(page, tag)).includes("Y"), label, `${tag} shared text lacks Y`);
  }
  assert((await page.evaluate(() => window.__bound.authorityText())).includes("Y"), label, "authority lacks Y");
  // A composes uncommitted X after `a` through real CDP composition.
  await page.click('[data-testid="bound-A"] .ProseMirror p');
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await sleep(200);
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 1, selectionEnd: 1, text: "X" });
  await sleep(400);
  const readiness = await page.evaluate(() => window.__bound.readiness("A"));
  assert(readiness.composing === true && readiness.ready === false, label, `no composition-start signal: ${JSON.stringify(readiness)}`);
  assert((await bchanges(page, "A")).length === 0, label, "onChange fired mid-composition");
  assert(!(await btext(page, "A")).includes("X"), label, "X reached A's shared text mid-composition");
  assert(!(await btext(page, "B")).includes("X"), label, "X reached B mid-composition");
  assert(!(await page.evaluate(() => window.__bound.authorityText())).includes("X"), label, "X reached the authority mid-composition");
  // A second remote Y2 lands while A composes: the composing paragraph is
  // not rebuilt under the composition (same-document display keeps X first).
  await page.evaluate(() => window.__bound.typeText("B", "p:1", "Y2"));
  await sleep(500);
  assert((await btext(page, "A")).includes("Y2"), label, "Y2 never reached A's shared text");
  const stagedDisplay = await bpmt(page, "A");
  assert(stagedDisplay.includes("X"), label, `staged X vanished from the display: ${JSON.stringify(stagedDisplay)}`);
  assert(!stagedDisplay.includes("Y2"), label, `composing range rebuilt under the composition: ${JSON.stringify(stagedDisplay)}`);
  // Commit: exactly one shared transaction carries the composition result.
  await page.evaluate(() => window.__bound.resetUpdates("A"));
  await cdp.send("Input.insertText", { text: "X" });
  await sleep(500);
  assert(await page.evaluate(() => window.__bound.updateCount("A")) === 1, label, "commit did not transact exactly once on the shared doc");
  const events = await bchanges(page, "A");
  assert(events.length === 1, label, `expected exactly one coalesced change, saw ${events.length}`);
  assert(events[0].gesture.kind === "composition-commit", label, `commit gesture is not composition-commit: ${events[0].gesture.kind}`);
  for (const tag of ["A", "B", "C"]) {
    const shared = await btext(page, tag);
    assert(shared.includes("X"), label, `${tag} shared text lacks the committed X`);
    assert(shared.includes("Y"), label, `${tag} lost Y across the commit`);
    assert(shared.includes("Y2"), label, `${tag} lost Y2 across the commit`);
  }
  // Review 1 BLOCKING-1: deferred remote text paints into the local view on
  // commit — the rendered document equals the shared projection, not only
  // the shared Y.Text.
  for (const tag of ["A", "B", "C"]) {
    const display = await bpmt(page, tag);
    for (const needle of ["X", "Y", "Y2"]) {
      assert(display.includes(needle), label, `${tag} display lacks ${needle} after commit: ${JSON.stringify(display)}`);
    }
  }
  assert((await page.evaluate(() => window.__bound.errors("A"))).length === 0, label, "binding errors surfaced");
  // A following edit plus disconnect/reconnect converges everywhere.
  await page.keyboard.type("Z");
  await sleep(500);
  await page.evaluate(() => window.__bound.disconnect());
  await page.evaluate(() => window.__bound.typeText("B", "p:1", "W"));
  await sleep(300);
  await page.evaluate(() => window.__bound.reconnect());
  await sleep(500);
  const vectors = await bvectors(page);
  const distinct = new Set(Object.values(vectors));
  assert(distinct.size === 1, label, `state vectors diverge after reconnect: ${JSON.stringify(vectors)}`);
  for (const tag of ["A", "B", "C"]) {
    const shared = await btext(page, tag);
    for (const needle of ["X", "Y", "Y2", "Z", "W"]) {
      assert(shared.includes(needle), label, `${tag} lacks ${needle} after reconnect`);
    }
  }
  await cdp.detach();
  await done(label);
  ok(label);
}

// F-1 in the real browser: typing within 500 ms before or after a
// composition never merges with the committed composition step.
async function scenarioBoundImeF1(browser, base) {
  const label = "bound-ime-f1";
  const { page, done } = await openScenario(browser, base, label);
  await page.evaluate(() => window.__bound.setup({
    blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "ab" }],
    participants: [
      { tag: "A", actorId: "actor-a", label: "A", color: "#112233", editable: true },
    ],
  }));
  await page.click('[data-testid="bound-A"] .ProseMirror p');
  await page.keyboard.press("End");
  await page.keyboard.type("pre");
  await sleep(300);
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 1, selectionEnd: 1, text: "X" });
  await sleep(300);
  await cdp.send("Input.insertText", { text: "X" });
  await sleep(400);
  await page.keyboard.type("post");
  await sleep(400);
  // Real typing emits one change per keystroke: three for "pre", one
  // coalesced composition-commit, four for "post".
  const kinds = (await bchanges(page, "A")).map((event) => event.gesture.kind);
  assert(kinds.length === 8, label, `unexpected change count: ${JSON.stringify(kinds)}`);
  assert(kinds[3] === "composition-commit", label, `commit is not the fourth change: ${JSON.stringify(kinds)}`);
  assert(kinds.filter((kind) => kind === "composition-commit").length === 1, label, `more than one commit: ${JSON.stringify(kinds)}`);
  await page.evaluate(() => window.__bound.undo("A"));
  await sleep(300);
  assert((await btext(page, "A")) === "aXbpre", label, "first undo did not remove only the post text");
  await page.evaluate(() => window.__bound.undo("A"));
  await sleep(300);
  assert((await btext(page, "A")) === "abpre", label, "second undo did not remove only the composition");
  await page.evaluate(() => window.__bound.undo("A"));
  await sleep(300);
  assert((await btext(page, "A")) === "ab", label, "third undo did not remove only the pre text");
  await page.evaluate(() => window.__bound.redo("A"));
  await sleep(300);
  assert((await btext(page, "A")) === "abpre", label, "redo did not restore the pre text");
  await cdp.detach();
  await done(label);
  ok(label);
}

// Witness 6 Chromium half: the read-only mount renders remote updates and
// stays inert; toggling enables editing; revocation mid-composition
// discards through the same Task 1 path.
async function scenarioBoundReadonly(browser, base) {
  const label = "bound-readonly";
  const { page, done } = await openScenario(browser, base, label);
  await page.evaluate(() => window.__bound.setup({
    blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "ab" }],
    participants: [
      { tag: "viewer", actorId: "actor-v", label: "V", color: "#112233", editable: false },
      { tag: "writer", actorId: "actor-w", label: "W", color: "#445566", editable: true },
    ],
  }));
  // Review 1 BLOCKING-4: a read-only mount publishes cursor null.
  assert(await page.evaluate(() => window.__bound.cursorOf("viewer")) === null, label, "read-only mount publishes a cursor");
  await page.evaluate(() => window.__bound.typeText("writer", "p:1", "XY"));
  await sleep(500);
  assert((await bpmt(page, "viewer")).includes("XY"), label, "read-only mount did not render the remote text");
  assert(await page.evaluate(() => window.__bound.cursorOf("viewer")) === null, label, "remote render publishes a cursor on the viewer");
  const vectorBefore = JSON.stringify(await bvectors(page));
  await page.evaluate(() => window.__bound.typeText("viewer", "p:1", "LOCAL"));
  await page.click('[data-testid="bound-viewer"] .ProseMirror p');
  await page.keyboard.type("Q");
  await sleep(400);
  assert(JSON.stringify(await bvectors(page)) === vectorBefore, label, "read-only surface moved the shared state vector");
  assert((await bchanges(page, "viewer")).length === 0, label, "read-only surface emitted a change");
  assert(!(await btext(page, "viewer")).includes("LOCAL") && !(await btext(page, "viewer")).includes("Q"), label, "read-only typing leaked into shared state");
  assert(await page.evaluate(() => window.__bound.cursorOf("viewer")) === null, label, "read-only selection moves publish a cursor");
  // Toggling the same mount enables editing.
  await page.evaluate(() => window.__bound.setEditable("viewer", true));
  await page.evaluate(() => window.__bound.typeText("viewer", "p:1", "NOW"));
  await sleep(400);
  assert((await bchanges(page, "viewer")).length === 1, label, "re-enabled surface emitted no change");
  // Revocation mid-composition discards through the Task 1 path.
  await page.click('[data-testid="bound-viewer"] .ProseMirror p');
  await page.keyboard.press("End");
  const cdp = await page.createCDPSession();
  await cdp.send("Input.imeSetComposition", { selectionStart: 5, selectionEnd: 5, text: "STAGED" });
  await sleep(400);
  await page.evaluate(() => window.__bound.setEditable("viewer", false));
  await sleep(200);
  assert(await page.evaluate(() => window.__bound.cursorOf("viewer")) === null, label, "toggled read-only publishes a cursor");
  await page.evaluate(() => {
    document.querySelector('[data-testid="bound-viewer"] .ProseMirror').dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
  });
  await sleep(400);
  assert(!(await btext(page, "viewer")).includes("STAGED"), label, "revoked composition staged into shared state");
  assert(!(await bpmt(page, "viewer")).includes("STAGED"), label, "revoked composition stayed on the display");
  await cdp.detach();
  await done(label);
  ok(label);
}

// Witness 12 Chromium half: one shared awareness, two fields, one remote
// actor plus the local publisher — each field renders exactly its own
// field's carets, strangers render nothing, colours validate, and the local
// payload stays within the §8.5 budget.
async function scenarioBoundCursor(browser, base) {
  const label = "bound-cursor";
  const { page, done } = await openScenario(browser, base, label);
  const blocks = [{ paragraphId: "p:1", kind: "paragraph", text: "ab" }];
  await page.evaluate((seed) => window.__bound.setup({
    blocks: seed,
    fields: ["body", "notes"],
    shareDoc: true,
    participants: [
      { tag: "body", fieldKey: "body", actorId: "local-1", label: "Local", color: "#00aa00", editable: true },
      { tag: "notes", fieldKey: "notes", actorId: "local-1", label: "Local", color: "#00aa00", editable: true },
    ],
  }), blocks);
  await page.evaluate(() => window.__bound.registerActor({ actorId: "r1", displayLabel: "R One", color: "#112233" }));
  await page.evaluate(() => window.__bound.publishRemote({ clientId: 1001, actorId: "r1", name: "R One", color: "#112233", tag: "body", anchorPm: 2, headPm: 2 }));
  await sleep(400);
  const bodyCount = await page.evaluate(() => window.__bound.caretCount("body", "r1"));
  assert(bodyCount === 1, label, `body renders ${bodyCount} r1 carets, expected 1`);
  const bodyLabel = await page.evaluate(() => window.__bound.caretLabel("body", "r1"));
  assert(bodyLabel === "R One", label, `body caret label mismatch: ${JSON.stringify(bodyLabel)}`);
  assert(await page.evaluate(() => window.__bound.caretCount("notes", "r1")) === 0, label, "notes render the body caret");
  await page.evaluate(() => window.__bound.publishRemote({ clientId: 1003, actorId: "r3", name: "R Three", color: "#778899", tag: "body", anchorPm: 2, headPm: 2 }));
  await sleep(300);
  assert(await page.evaluate(() => window.__bound.caretCount("body", "r3")) === 0, label, "stranger renders a caret");
  await page.evaluate(() => window.__bound.clearRemote(1001));
  await sleep(300);
  assert(await page.evaluate(() => window.__bound.caretCount("body", "r1")) === 0, label, "cleared cursor keeps its decoration");
  await page.evaluate(() => window.__bound.revokeActor("r1"));
  await page.evaluate(() => window.__bound.publishRemote({ clientId: 1001, actorId: "r1", name: "R One", color: "#112233", tag: "body", anchorPm: 2, headPm: 2 }));
  await sleep(300);
  assert(await page.evaluate(() => window.__bound.caretCount("body", "r1")) === 0, label, "revoked actor renders a caret");
  // Publisher: focus the body editor, place the caret programmatically,
  // then move it one step with the keyboard — the last move publishes.
  await page.click('[data-testid="bound-body"] .ProseMirror p');
  await sleep(200);
  await page.evaluate(() => window.__bound.collapse("body", 2));
  await sleep(300);
  await page.keyboard.press("ArrowRight");
  await sleep(300);
  const local = await page.evaluate(() => window.__bound.localCursor());
  assert(local && local.actorId === "local-1", label, `local cursor actor mismatch: ${JSON.stringify(local && local.actorId)}`);
  assert(local && local.cursor && local.cursor.fieldKey === "body", label, "local cursor carries the wrong field");
  assert(!/"(anchor|head)":\d/.test(JSON.stringify(local.cursor)), label, "numeric offsets on the wire");
  const bytes = await page.evaluate(() => window.__bound.awarenessBytes());
  assert(bytes <= 4096, label, `awareness payload ${bytes} B exceeds the §8.5 budget`);
  console.log(`bound cursor awareness payload: ${bytes} B (budget 4096 B)`);
  await done(label);
  ok(label);
}

// F-3: keystroke-to-render p95 in the real browser render path, manager
// active, 3 bound participants, at 400 blocks and at the §8.5 envelope
// (2 000 paragraphs). Prints numbers and hardware; the envelope row is a
// measurement for the dedicated perf lot, not a gate of this lot.
async function scenarioBoundPerf(browser, base, size) {
  const label = `bound-perf-${size}`;
  const { page, done } = await openScenario(browser, base, label);
  const blocks = Array.from({ length: size }, (_, index) => ({
    paragraphId: `p:${index + 1}`,
    kind: "paragraph",
    text: `perf line ${index + 1} with enough words to wrap and grow the editor`,
  }));
  await page.evaluate((seed) => window.__bound.setup({
    blocks: seed,
    participants: [
      { tag: "A", actorId: "actor-a", label: "A", color: "#112233", editable: true },
      { tag: "B", actorId: "actor-b", label: "B", color: "#445566", editable: true },
      { tag: "C", actorId: "actor-c", label: "C", color: "#778899", editable: true },
    ],
  }), blocks);
  await page.click('[data-testid="bound-A"] .ProseMirror p:last-child');
  await page.keyboard.press("End");
  await sleep(300);
  const alphabet = "abcdefghijklmnopqrstuvwxyz012345";
  const deltas = [];
  let expected = await page.evaluate(() => window.__bound.pmLength("A"));
  for (let i = 0; i < 30; i += 1) {
    const char = alphabet[i % alphabet.length];
    const before = Date.now();
    await page.keyboard.press(char);
    expected += 1;
    await page.waitForFunction((want) => window.__bound.pmLength("A") >= want, { timeout: 60000 }, expected);
    deltas.push(Date.now() - before);
  }
  const p95value = p95(deltas);
  // Manager active: an undo after typing shortens the document again.
  const lengthBeforeUndo = await page.evaluate(() => window.__bound.pmLength("A"));
  await page.evaluate(() => window.__bound.undo("A"));
  await sleep(400);
  const lengthAfterUndo = await page.evaluate(() => window.__bound.pmLength("A"));
  assert(lengthAfterUndo < lengthBeforeUndo, label, "the field manager is not tracking (undo changed nothing after typing)");
  console.log(`${label}: keystroke-to-render ms over 30 reps: p50=${p50(deltas)} p95=${p95value} max=${Math.max(...deltas)}`);
  console.log(`${label}: samples: ${deltas.join(",")}`);
  const BUDGET = 50;
  if (size <= 400) {
    assert(p95value <= BUDGET, label, `p95 ${p95value} ms exceeds the §8.5 row budget of ${BUDGET} ms at ${size} blocks`);
  } else if (p95value > BUDGET) {
    console.log(`${label} FINDING for the dedicated perf lot: p95 ${p95value} ms exceeds ${BUDGET} ms at the 2 000-paragraph envelope with the per-transaction scratch clone active; not optimised in this lot.`);
  }
  await done(label);
  ok(label);
}

async function main() {
  const chrome = findChrome();
  const { execFileSync } = await import("node:child_process");
  const { cpus, arch, platform } = await import("node:os");
  const work = mkdtempSync(join(tmpdir(), "rt-bound-harness-"));
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
    console.log("building bound harness with vite");
    execFileSync(join(WORKTREE_ROOT, "node_modules", ".bin", "vite"), ["build"], { cwd: work, stdio: "inherit" });
    server = await serveDirectory(join(work, "dist"), 0);
    const address = server.address();
    const port = typeof address === "object" && address !== null ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;
    const puppeteer = (await import("puppeteer-core")).default;
    profile = mkdtempSync("/tmp/rt-bound-chrome-profile-");
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const version = await browser.version();
    const model = (() => {
      try {
        const cpu = cpus()[0];
        return cpu ? cpu.model : "unknown-cpu";
      } catch {
        return "unknown-cpu";
      }
    })();
    console.log(`bound harness hardware: ${platform()}/${arch()} cpu=${model} chromium=${version}`);
    const concurrency = await (await browser.newPage()).evaluate(() => navigator.hardwareConcurrency);
    console.log(`bound harness concurrency: ${concurrency}`);
    // Iteration aid: BOUND_SCENARIO=name runs a single scenario; unset runs all.
    const only = process.env.BOUND_SCENARIO;
    const run = async (name, fn) => {
      if (!only || only === name) await fn();
    };
    await run("bound-ime-commit", () => scenarioBoundImeCommit(browser, base));
    await run("bound-ime-f1", () => scenarioBoundImeF1(browser, base));
    await run("bound-readonly", () => scenarioBoundReadonly(browser, base));
    await run("bound-cursor", () => scenarioBoundCursor(browser, base));
    await run("bound-perf-400", () => scenarioBoundPerf(browser, base, 400));
    await run("bound-perf-2000", () => scenarioBoundPerf(browser, base, 2000));
  } finally {
    await cleanup();
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} bound browser assertion(s) failed`);
    process.exit(1);
  }
  console.log("\nall bound browser scenarios green");
}

await main();




