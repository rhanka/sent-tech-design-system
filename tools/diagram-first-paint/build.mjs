// Static compilation only. This module never imports a browser driver.
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('.', import.meta.url));
export async function buildHarness(outDir) {
  await build({ configFile: false, envFile: false, root, plugins: [svelte(), vue()],
    build: { outDir, emptyOutDir: true },
    define: { __VUE_OPTIONS_API__: true, __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false } });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Supply a temporary output directory');
  await buildHarness(resolve(process.argv[2]));
}
