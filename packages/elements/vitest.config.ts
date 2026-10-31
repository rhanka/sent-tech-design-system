import { defineConfig } from "vitest/config";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  test: {
    globals: false,
    // `node` is deliberate: the validator is a pure module with no DOM. A jsdom
    // environment slipped in here would not prove anything the purity suite
    // does not already assert, and would mask a DOM dependency instead.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
