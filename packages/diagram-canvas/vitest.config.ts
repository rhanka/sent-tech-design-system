import { defineConfig } from "vitest/config";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  test: {
    globals: false,
    // The `node` environment is deliberate and asserted: tests/no-dom.test.ts
    // fails if `document` or `window` exists, so a jsdom environment slipped in
    // here would turn that test red instead of hiding a DOM dependency.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
