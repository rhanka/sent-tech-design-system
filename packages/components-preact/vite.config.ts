import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

// Preact leg. The React aliases of the preset stay off: nothing in this package
// may reach `preact/compat` through a `react` specifier (decision K3).
export default defineConfig({
  plugins: [preact({ reactAliasesEnabled: false })],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 20000,
  },
});
