import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "404.html",
      precompress: false,
      strict: true
    }),
    paths: {
      relative: false
    },
    prerender: {
      handleHttpError: "warn",
      handleUnseenRoutes: "ignore",
      handleMissingId: "warn"
    }
  }
};
