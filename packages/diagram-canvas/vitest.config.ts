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
    // MAJ-1: the global timeout is back at 10 s; the measured-path budget
    // itself is gated by medians in tests/layout/performance.test.ts, not by
    // timeouts. Per-file explicit timeouts cover the 31-view sweeps.
    testTimeout: 10_000,
  },
});
