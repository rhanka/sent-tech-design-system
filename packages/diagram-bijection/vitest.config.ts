import { defineConfig } from "vitest/config";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  test: {
    globals: false,
    // The `node` environment is deliberate: this harness is pure computation
    // plus CLI; any browser step reports « not run (host GPU) » instead of
    // running, so a jsdom environment slipped in here would be a lie.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
