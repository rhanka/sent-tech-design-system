import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^vue$/, replacement: require.resolve("vue/dist/vue.runtime.esm-bundler.js") },
      { find: /^@vue\/test-utils$/, replacement: require.resolve("@vue/test-utils").replace("vue-test-utils.cjs.js", "vue-test-utils.esm-bundler.mjs") },
    ],
  },
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "index" },
    rollupOptions: {
      external: ["vue", "lucide-vue-next", /^@sentropic\//],
    },
  },
  test: {
    server: { deps: { inline: [/@vue\/test-utils/] } },
    environment: "jsdom",
    testTimeout: 20000,
  },
});
