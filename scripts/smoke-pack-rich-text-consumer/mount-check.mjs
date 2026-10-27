// Real-consumer mount check for the rich-text subpath. Runs inside the
// strict (no --legacy-peer-deps) throwaway install built by smoke-pack.mjs,
// after `vite build` of the neighbouring consumer app. It imports the built
// bundle under a jsdom DOM and asserts the editor actually mounted from the
// packed tarballs: no workspace symlinks, no registry fallback, no network.
import { JSDOM } from "jsdom";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL rich-text consumer: ${message}`);
}

const dom = new JSDOM(
  `<!doctype html><html><head></head><body><div id="app"></div></body></html>`,
  { url: "http://localhost/" },
);
const { window } = dom;
for (const key of Object.getOwnPropertyNames(window)) {
  if (key in globalThis) continue;
  try {
    globalThis[key] = window[key];
  } catch {
    // Read-only globals (e.g. a host-provided navigator) stay untouched.
  }
}
try {
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
} catch {
  // Keep the host navigator when it cannot be replaced.
}
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
}
globalThis.fetch = () => {
  fail("the consumer bundle issued a fetch call (offline witness violated)");
  return Promise.reject(new Error("fetch is blocked in the offline consumer"));
};

const assets = join(here, "dist", "assets");
let entries = [];
try {
  entries = readdirSync(assets);
} catch {
  fail("vite build emitted no dist/assets directory");
}
const bundle = entries.find((entry) => entry.endsWith(".js"));
const css = entries.find((entry) => entry.endsWith(".css"));
if (!bundle) fail("vite build emitted no JS bundle");
if (!css) fail("vite build emitted no CSS asset (stylesheet subpath unresolved?)");
if (css) {
  const cssText = readFileSync(join(assets, css), "utf8");
  if (!cssText.includes("--st-component-richTextEditor")) {
    fail("the built CSS carries no --st-component-richTextEditor token binding");
  }
}

if (bundle && failures.length === 0) {
  await import(pathToFileURL(join(assets, bundle)).href);
  const editable = document.querySelector(".ProseMirror");
  if (!editable) {
    fail("the consumer bundle mounted no .ProseMirror editor");
  } else {
    if (editable.getAttribute("aria-label") !== "SMOKE-LABEL") {
      fail(`editable aria-label is ${JSON.stringify(editable.getAttribute("aria-label"))}, expected "SMOKE-LABEL"`);
    }
    const block = document.querySelector('[data-paragraph-id="paragraph:1"]');
    if (!block) fail("the mounted editor carries no data-paragraph-id block");
    else if (!block.textContent.includes("smoke")) {
      fail(`mounted block text is ${JSON.stringify(block.textContent)}, expected it to contain "smoke"`);
    }
  }
  if (document.querySelectorAll("img").length !== 0) fail("the mounted DOM contains an img element");
  if (window.__smokeMounted !== true) fail("the consumer app did not run to mount");
}

if (failures.length > 0) {
  console.error(`FAILED rich-text consumer mount check (${failures.length} failure(s))`);
  process.exit(1);
}
console.log("OK rich-text consumer: subpath + stylesheet resolved, editor mounted from packed tarballs, offline");
