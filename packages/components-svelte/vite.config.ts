import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: "jsdom",
    testTimeout: 20000,
    // test.exclude keeps the real-browser harness out of the jsdom run
    // (spec §11): RichTextEditor.browser.test.mjs runs through node
    // directly, never through `vitest run src`.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/rich-text-editor/*.browser.test.mjs"
    ]
  }
});
