import { defineConfig } from 'vitest/config';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export default defineConfig({
  resolve: { alias: ['vue', '@vue/runtime-dom', '@vue/runtime-core', '@vue/reactivity', '@vue/shared'].map(name => ({
    find: new RegExp(`^${name}$`), replacement: require.resolve(`${name}/dist/${name === 'vue' ? 'vue.runtime' : name.split('/')[1]}.esm-bundler.js`),
  })) },
  ssr: { noExternal: ['vue', /^@vue\//, /^@sentropic\//] },
  define: { __VUE_OPTIONS_API__: true, __VUE_PROD_DEVTOOLS__: false, __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false },
  test: { environment: 'jsdom', server: { deps: { inline: ['vue', /@vue\//, /@sentropic\//] } } },
});
