import assert from "node:assert/strict";
import { realpathSync, writeFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { build, normalizePath } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const core = "@sentropic/design-system-review-core";
const components = "@sentropic/design-system-svelte";
const coreEntry = fileURLToPath(import.meta.resolve(core));
const modulesDir = fileURLToPath(new URL("./node_modules/", import.meta.url));
assert.equal(coreEntry, `${modulesDir}${core}/dist/index.js`);
assert.equal(realpathSync(coreEntry), coreEntry);
const componentsEntry = fileURLToPath(import.meta.resolve(components));
assert.equal(componentsEntry, `${modulesDir}${components}/dist/index.js`);
assert.equal(realpathSync(componentsEntry), componentsEntry);

function reviewGraph(environment) {
  return {
    name: `review-graph-${environment}`,
    generateBundle(_, output) {
      const modules = Object.values(output).flatMap((entry) => entry.type === "chunk" ? entry.moduleIds : []);
      const layer = normalizePath(`${modulesDir}${components}/dist/CommentLayer.svelte`);
      const direct = normalizePath(coreEntry);
      const fromHost = normalizePath(modulesDir);
      assert.ok(modules.includes(layer), `${environment} must bundle the packaged CommentLayer`);
      const layerImports = this.getModuleInfo(layer).importedIds;
      assert.ok(layerImports.includes(direct), `${environment} CommentLayer must import the direct core`);
      const coreModules = modules.filter((id) => id.includes(`/node_modules/${core}/`));
      assert.ok(coreModules.some((id) => id === direct || id.endsWith(`/${core}/dist/anchor-dom.js`)));
      assert.ok(coreModules.every((id) => id.startsWith(`${fromHost}${core}/`)), `${environment} bundled another core copy`);
      assert.ok(modules.every((id) => !id.includes("/node_modules/") || id.startsWith(fromHost)),
        `${environment} resolved a dependency outside the isolated host`);
      writeFileSync(`graph-${environment}.json`, JSON.stringify({ layer, layerImports, coreModules }, null, 2));
      console.log(`OK ${environment} graph: CommentLayer uses the direct core`);
    },
  };
}

const config = (environment) => ({
  configFile: false,
  envDir: false,
  plugins: [svelte({ configFile: false, preprocess: vitePreprocess({ script: true }) }), reviewGraph(environment)],
  resolve: {
    alias: [{ find: /^@sentropic\/design-system-review-core$/, replacement: coreEntry }],
    dedupe: [core],
  },
});
await build({
  ...config("client"),
  build: { lib: { entry: "client.mjs", formats: ["es"], fileName: "review" } },
});
await build({
  ...config("ssr"),
  ssr: { noExternal: [components, core, "@lucide/svelte"] },
  build: { ssr: "server.mjs", outDir: "dist-ssr" },
});

const target = { kind: "artifact", id: "artifact-test" };
const artifactVersion = "sha256:focus-test";
const currentUser = { actorId: "alice", kind: "human", displayLabel: "Alice", color: "#2563eb" };
const props = { mode: "review", artifactVersion, target, currentUser, comments: [] };
const { renderReview } = await import("./dist-ssr/server.js");
assert.match(renderReview({ ...props, panelOpen: true }).body, /st-review-panel/);
console.log("OK packaged CommentLayer rendered on the server");

const { window } = new JSDOM(`<!doctype html><main data-review-root>
  <header data-anchor-id="focus-test"><h1>Rapport</h1></header>
  <section data-anchor-id="A"><p>Section A</p></section>
  <section data-anchor-id="B">
    <p data-commentable>Échéance <em>commune</em></p>
    <ul><li>Action <span>commune</span></li></ul>
    <table><tbody><tr><td>Calendrier</td></tr></tbody></table>
  </section>
  <section data-anchor-id="C"><p>Section C</p></section>
</main><div id="review"></div>`);
for (const name of ["window", "document", "Node", "Element", "HTMLElement", "Text", "Comment", "Event", "MutationObserver"]) {
  globalThis[name] = window[name];
}

const { CommentLayer, reviewComponents, createFixtureCommentsAdapter, decodeAnchor, resolveAnchor, flushSync, mount, tick, unmount } = await import("./dist/review.js");
for (const [name, component] of Object.entries(reviewComponents)) {
  assert.equal(typeof component, "function", `${name} must be a public Svelte component`);
}
const root = document.querySelector("main");
const block = root.querySelector('[data-anchor-id="B"]');
const lastBlock = root.querySelector('[data-anchor-id="C"]');
const tenant = "ws-review-consumer";
const { adapter } = createFixtureCommentsAdapter({ caller: { userId: currentUser.actorId } });
const review = document.querySelector("#review");
const mountLayer = (overrides) => mount(CommentLayer, {
  target: review,
  props: { ...props, rootEl: root, ...overrides },
});

async function submit(input, body) {
  assert.ok(input, "the packaged comment composer must open");
  input.value = body;
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  flushSync();
  input.form.querySelector('button[type="submit"]').click();
  await setImmediate();
  await tick();
}

async function captureComment(body) {
  const before = await adapter.list(tenant, target);
  const previousIds = new Set(before.map((row) => row.id));
  await submit(review.querySelector("textarea"), body);
  const after = await adapter.list(tenant, target);
  const created = after.filter((row) => !previousIds.has(row.id));
  assert.equal(after.length, before.length + 1, `Expected one additional row for ${body}`);
  assert.equal(created.length, 1, `Expected one new row ID for ${body}`);
  assert.equal(created[0].body, body);
  return created[0];
}

const captureLayer = mountLayer({
  onCreate: ({ target, body }) => adapter.create({ tenant, target, body }),
});

try {
  flushSync();
  const captureTargets = [
    [root.querySelector("h1"), "focus-test"],
    ...["p", "p em", "li", "li span", "table", "td"].map((selector) => [block.querySelector(selector), "B"]),
  ];
  for (const [element, aid] of captureTargets) {
    element.click();
    flushSync();
    const comment = await captureComment(`Comment on ${element.tagName}`);
    const anchor = decodeAnchor(comment.target.sectionKey);
    assert.equal(anchor?.t, "element");
    assert.equal(anchor.aid, aid, "packaged CommentLayer must use the corrected core for inner targets");
    assert.equal(anchor.v, artifactVersion);
  }

  const textNode = block.querySelector("p").firstChild;
  window.getSelection().setBaseAndExtent(textNode, 0, textNode, "Échéance".length);
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "C", altKey: true, shiftKey: true, bubbles: true }));
  flushSync();
  const textKey = (await captureComment("Check the deadline")).target.sectionKey;
  assert.match(textKey, /^a1:[A-Za-z0-9_-]+$/);
  assert.ok(textKey.length <= 2048);
  const textAnchor = decodeAnchor(textKey);
  assert.equal(textAnchor?.t, "text");
  assert.equal(textAnchor.q.exact, "Échéance");
  assert.equal(textAnchor.aid, "B");
} finally {
  await unmount(captureLayer);
}

const [headerComment, blockComment] = await adapter.list(tenant, target);
const sectionKey = blockComment.target.sectionKey;
const blockAnchor = decodeAnchor(sectionKey);
const revision = "sha256:focus-revised";
let orphans = [];
const layer = mountLayer({
  artifactVersion: revision,
  comments: [headerComment, blockComment],
  onOrphansChange: (threads) => { orphans = threads.map((thread) => thread.threadId); },
  onReply: (threadId, body) => adapter.reply({ tenant, target, threadId, body }),
  onResolve: (threadId) => adapter.setState(tenant, threadId, "closed"),
});

try {
  flushSync();
  assert.deepEqual(orphans, []);
  block.remove();
  await setImmediate();
  await tick();
  assert.deepEqual(orphans, [blockComment.threadId]);
  assert.equal(root.querySelector(blockAnchor.sel)?.closest("section"), lastBlock);
  const missing = resolveAnchor(root, blockAnchor, { artifactVersion: revision });
  assert.equal(missing.status, "orphan");
  assert.equal(missing.reason, "not-found");
  review.querySelector(`[aria-label="Open thread ${blockComment.threadId}"]`).click();
  await tick();
  await submit(review.querySelector(".st-review-thread__reply textarea"), "Still replyable");
  [...review.querySelectorAll("button")].find((button) => button.textContent.trim() === "Resolve").click();
  await setImmediate();
  const thread = (await adapter.list(tenant, target)).filter((row) => row.threadId === blockComment.threadId);
  assert.equal(thread.length, 2);
  assert.ok(thread.every((row) => row.state === "closed" && row.target.sectionKey === sectionKey));

  root.insertBefore(block, lastBlock);
  await setImmediate();
  await tick();
  assert.deepEqual(orphans, []);
  root.append(block);
  root.querySelector("h1").textContent = "Rapport révisé";
  await setImmediate();
  await tick();
  assert.deepEqual(orphans, []);
  const moved = resolveAnchor(root, blockAnchor, { artifactVersion: revision });
  assert.equal(moved.status, "resolved");
  assert.equal(moved.strategy, "aid");
  assert.equal(moved.element, block);
  assert.equal(resolveAnchor(root, decodeAnchor(headerComment.target.sectionKey), { artifactVersion: revision }).element,
    root.querySelector("header"));
  console.log("OK packaged CommentLayer captured element and text anchors, orphaned deleted blocks, and reattached moved blocks");
} finally {
  await unmount(layer);
  window.close();
}
