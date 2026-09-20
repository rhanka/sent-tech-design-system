import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({ plugins: [svelte()], define: { __VARIANTE__: JSON.stringify(process.env.VARIANTE) },
  build: { outDir: 'dist', emptyOutDir: true, cssCodeSplit: false } });
