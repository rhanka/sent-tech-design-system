import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { configDefaults } from 'vitest/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeRequire = createRequire(require.resolve('@vue/runtime-core/package.json'));

export default defineConfig({
  plugins: [vue(), svelte(), svelteTesting()],
  ssr: { noExternal: ['@lucide/svelte'] },
  test: {
    environment: "jsdom",
    testTimeout: 20000,
    projects: [
      {
        extends: true,
        resolve: { alias: [
          { find: /^vue$/, replacement: require.resolve('vue/dist/vue.esm-bundler.js') },
          { find: /^@vue\/test-utils$/, replacement: require.resolve('@vue/test-utils').replace('vue-test-utils.cjs.js', 'vue-test-utils.esm-bundler.mjs') },
        ] },
        test: { name: 'components', exclude: [...configDefaults.exclude, 'src/vapor-runtime.test.ts', 'src/vapor-compatibility.test.ts'], server: { deps: { inline: [/@vue\/test-utils/] } } },
      },
      {
        extends: true,
        // Vapor ships in Vue's browser ESM runtime; its Node CJS entry omits it.
        resolve: { alias: ['vue', '@vue/runtime-dom', '@vue/runtime-core', '@vue/reactivity', '@vue/shared', '@vue/server-renderer'].map(name => ({
          find: new RegExp(`^${name}$`), replacement: runtimeRequire.resolve(`${name}/dist/${name === 'vue' ? 'vue.runtime' : name.split('/')[1]}.esm-bundler.js`),
        })) },
        define: { __VUE_OPTIONS_API__: true, __VUE_PROD_DEVTOOLS__: false, __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false },
        ssr: { noExternal: ['vue', /^@vue\//] },
        test: { name: 'vapor', include: ['src/vapor-runtime.test.ts', 'src/vapor-compatibility.test.ts'], server: { deps: { inline: ['vue', /^@vue\//] } } },
      },
    ],
  },
});
