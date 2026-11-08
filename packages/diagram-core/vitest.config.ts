import { defineConfig } from "vitest/config";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  test: {
    globals: false,
    // The default `node` environment is deliberate and asserted:
    // tests/no-dom-no-deps.test.ts fails if `document` or `window` exists, so a
    // jsdom environment slipped in here would turn that test red instead of
    // silently hiding a DOM dependency.
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Migration tests replay long graph histories; under a full CI scan
    // (all workspaces sharded onto shared runners) the default 5s hook/test
    // budget flakes, so the budget is stated explicitly.
    testTimeout: 20000,
  },
});
