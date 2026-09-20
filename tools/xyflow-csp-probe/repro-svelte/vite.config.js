import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({ plugins: [svelte()], define: { __AVEC_PROP_CSS__: process.env.AVEC === '1' },
  build: { outDir: 'dist', emptyOutDir: true, cssCodeSplit: false } });
