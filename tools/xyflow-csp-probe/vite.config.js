import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({ plugins: [svelte()], define: { __WITH_MINIMAP__: process.env.WITH_MINIMAP === '1' },
  build: { outDir: 'dist', emptyOutDir: true, cssCodeSplit: false } });
