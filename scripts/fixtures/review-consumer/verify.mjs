import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { build } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const core = "@sentropic/design-system-review-core";
const coreEntry = fileURLToPath(import.meta.resolve(core));
assert.equal(coreEntry, fileURLToPath(new URL(`./node_modules/${core}/dist/index.js`, import.meta.url)));
assert.equal(realpathSync(coreEntry), coreEntry);

await build({
  configFile: false,
  envDir: false,
  plugins: [svelte({ configFile: false, preprocess: vitePreprocess({ script: true }) })],
  resolve: {
    alias: [{ find: /^@sentropic\/design-system-review-core$/, replacement: coreEntry }],
    dedupe: [core],
  },
  build: { lib: { entry: "client.mjs", formats: ["es"], fileName: "review" } },
});

const { window } = new JSDOM(`<!doctype html><main data-review-root>
  <header data-anchor-id="focus-test"><h1>Rapport</h1></header>
  <section data-anchor-id="A"><p>Section A</p></section>
  <section data-anchor-id="B"><p data-commentable>Échéance</p></section>
  <section data-anchor-id="C"><p>Section C</p></section>
</main><div id="review"></div>`);
for (const name of ["window", "document", "Node", "Element", "HTMLElement", "Text", "Comment", "Event", "MutationObserver"]) {
  globalThis[name] = window[name];
}

const { CommentLayer, decodeAnchor, flushSync, mount, tick, unmount } = await import("./dist/review.js");
const root = document.querySelector("main");
const target = { kind: "artifact", id: "artifact-test" };
const artifactVersion = "sha256:focus-test";
const currentUser = { actorId: "alice", kind: "human", displayLabel: "Alice", color: "#2563eb" };
const created = [];
const layer = mount(CommentLayer, {
  target: document.querySelector("#review"),
  props: {
    rootEl: root,
    mode: "review",
    artifactVersion,
    target,
    currentUser,
    comments: [],
    onCreate: (payload) => created.push(payload),
  },
});

try {
  flushSync();
  root.querySelector('[data-anchor-id="B"] p').click();
  flushSync();
  const input = document.querySelector("textarea");
  assert.ok(input, "click must open the packaged comment composer");
  input.value = "Check the deadline";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  flushSync();
  document.querySelector('button[type="submit"]').click();
  await tick();
  assert.equal(created.length, 1);
  const anchor = decodeAnchor(created[0].sectionKey);
  assert.equal(anchor?.t, "element");
  assert.equal(anchor.aid, "B", "packaged CommentLayer must use the corrected core for explicit inner targets");
  assert.equal(anchor.v, artifactVersion);
  console.log("OK packaged CommentLayer captured the enclosing block aid");
} finally {
  await unmount(layer);
  window.close();
}
