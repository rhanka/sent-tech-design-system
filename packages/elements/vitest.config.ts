import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";

const reviewCoreEntry = fileURLToPath(import.meta.resolve("@sentropic/design-system-review-core"));

// The svelte plugin compiles the runes modules the element tests exercise
// (`src/element/dom/element-runtime.svelte.ts` — review 1: the runtime tests
// of the component-bound envelopes and the lazy engine order). It is the
// same hoisted plugin `scripts/build-browser.mjs` builds the browser bundle
// with; it transforms only .svelte / .svelte.js / .svelte.ts files, which no
// other suite imports.
export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  plugins: [svelte()],
  // The dossier review test mounts a real Svelte component through
  // `mount(...)` under jsdom; without the browser condition Vitest resolves
  // `svelte` to its server entry and mounting is refused.
  resolve: {
    conditions: ["browser"],
    // CommentLayer imports review-core too. Its nested 0.1.0 dependency must
    // land on the pinned 0.1.1 entry the elements package ships (mirrors
    // scripts/build-dossier.mjs) or B5-2 would reattach a removed B onto C.
    alias: [{ find: /^@sentropic\/design-system-review-core$/, replacement: reviewCoreEntry }],
    dedupe: ["@sentropic/design-system-review-core"],
  },
  test: {
    globals: false,
    css: { include: [/\/dossier\.css(?:\?raw)?$/] },
    // `node` is deliberate: the validator is a pure module with no DOM. A jsdom
    // environment slipped in here would not prove anything the purity suite
    // does not already assert, and would mask a DOM dependency instead. (The
    // one DOM-needing suite — the DOMPurify sanitizer witness — overrides it
    // with a per-file `@vitest-environment jsdom` docblock.)
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
