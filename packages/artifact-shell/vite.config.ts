import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: "jsdom",
    testTimeout: 20000,
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.browser.test.mjs"]
  }
});
