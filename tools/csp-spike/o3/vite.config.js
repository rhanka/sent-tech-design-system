// Build de production O3 : une entrée HTML par candidat, CSS découpée par page
// (le poids d'une page ne compte que ce qu'elle charge), manifeste pour la pesée.
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

export const PAGES = ['control', 'svelte-empty', 'static-vanilla', 'static-svelte', 'elk-client', 'xyflow',
  'bpmn-viewer', 'bpmn-modeler', 'ssr-static', 'ssr-xyflow', 'ssr-xyflow-sized', 'ssr-xyflow-sized-handles'];
const root = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ isSsrBuild }) => ({
  root,
  publicDir: 'o3/public',
  plugins: [svelte()],
  logLevel: 'warn',
  ssr: { noExternal: true },
  build: isSsrBuild
    ? { outDir: 'dist-o3-ssr', emptyOutDir: true, copyPublicDir: false,
        rollupOptions: { input: { 'ssr-entry': 'o3/src/ssr-entry.js', 'ssr-bpmn': 'o3/src/ssr-bpmn.js' } } }
    : { outDir: 'dist-o3', emptyOutDir: true, manifest: true, cssCodeSplit: true,
        rollupOptions: { input: Object.fromEntries(PAGES.map((p) => [p, `o3/pages/${p}.html`])) } }
}));
