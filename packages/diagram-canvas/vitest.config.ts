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
    // The DC-2a suites lay the ten acceptance scenes out several hundred
    // times (0.1–0.4 s each). On a loaded machine the first layout of a file
    // can pass the 5 s default before any assertion runs; the time budgets
    // that gate (tests/layout/performance.test.ts) are medians, not timeouts.
    testTimeout: 30_000,
  },
});
