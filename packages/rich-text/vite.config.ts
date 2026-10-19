import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    testTimeout: 20000,
  },
});
