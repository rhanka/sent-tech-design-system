import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// The svelte plugin compiles the runes modules the element tests exercise
// (`src/element/dom/element-runtime.svelte.ts` — review 1: the runtime tests
// of the component-bound envelopes and the lazy engine order). It is the
// same hoisted plugin `scripts/build-browser.mjs` builds the browser bundle
// with; it transforms only .svelte / .svelte.js / .svelte.ts files, which no
// other suite imports.
export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  plugins: [svelte()],
  test: {
    globals: false,
    // `node` is deliberate: the validator is a pure module with no DOM. A jsdom
    // environment slipped in here would not prove anything the purity suite
    // does not already assert, and would mask a DOM dependency instead. (The
    // one DOM-needing suite — the DOMPurify sanitizer witness — overrides it
    // with a per-file `@vitest-environment jsdom` docblock.)
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
