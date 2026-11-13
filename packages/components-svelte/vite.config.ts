import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [svelte(), svelteTesting(), vue()],
  ssr: { noExternal: ["@lucide/svelte"] },
  test: {
    environment: "jsdom",
    testTimeout: 20000,
    // test.exclude keeps the real-browser harness out of the jsdom run
    // (spec §11): *.browser.test.mjs files — starting with the
    // rich-text-editor ones — run through node directly, never through
    // `vitest run src`.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.browser.test.mjs"
    ]
  }
});
