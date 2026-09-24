import { defineConfig } from "vitest/config";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  // The provenance copy `src/processing/scene-layout.ts` self-imports the
  // `@sentropic/graph` package root (for the typed-layer / time-oriented
  // cores). Resolve the self-name to the workspace source so its tests stay
  // hermetic without a prior build.
  resolve: {
    alias: {
      "@sentropic/graph": new URL("./src/index.ts", import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
  },
});
