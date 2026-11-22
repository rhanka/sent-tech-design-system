import { defineConfig } from "vitest/config";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  test: {
    globals: false,
    // The `node` environment is deliberate: the package is DOM-free, and a
    // jsdom environment slipped in here would hide a DOM dependency.
    environment: "node",
    testTimeout: 10_000,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts"],
        },
      },
    ],
  },
});
