import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [vue(), svelte(), svelteTesting()],
  ssr: { noExternal: ['@lucide/svelte'] },
  test: {
    environment: "jsdom",
    testTimeout: 20000,
  },
});
