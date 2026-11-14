import { configDefaults, defineConfig } from "vitest/config";

const cachePerformance = "tests/layout/cache-performance.test.ts";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  test: {
    globals: false,
    // The `node` environment is deliberate and asserted: tests/no-dom.test.ts
    // fails if `document` or `window` exists, so a jsdom environment slipped in
    // here would turn that test red instead of hiding a DOM dependency.
    environment: "node",
    // MAJ-1: the global timeout is back at 10 s; the measured-path budget
    // itself is gated by medians in tests/layout/performance.test.ts, not by
    // timeouts. Per-file explicit timeouts cover the 31-view sweeps.
    testTimeout: 10_000,
    // DC-2b measures wall time and forces GC. Running alongside the DC-2a
    // layout sweeps exhausted its 10 s timeout in CI. Ordered project groups
    // finish the measurement in one fork before any other test file starts,
    // while keeping the remaining files parallel in a later group.
    projects: [
      {
        extends: true,
        test: {
          name: "cache-performance",
          include: [cachePerformance],
          pool: "forks",
          maxWorkers: 1,
          fileParallelism: false,
          sequence: { groupOrder: 1 },
        },
      },
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts"],
          exclude: [...configDefaults.exclude, cachePerformance],
          sequence: { groupOrder: 2 },
        },
      },
    ],
  },
});
