import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';

export const pins = { vue: '3.6.0-rc.15', '@vue/compiler-sfc': '3.6.0-rc.15',
  '@vue/server-renderer': '3.6.0-rc.15', '@vitejs/plugin-vue': '6.0.11', 'vue-tsc': '3.3.14' };
for (const pkg of ['components-vue', 'dataviz-vue']) {
  const require = createRequire(resolve(`packages/${pkg}/package.json`));
  const manifest = JSON.parse(readFileSync(`packages/${pkg}/package.json`));
  for (const [name, version] of Object.entries(pins)) {
    assert.equal(manifest.devDependencies[name], version, `${pkg}: ${name} must be an exact pin`);
    assert.equal(require(`${name}/package.json`).version, version, `${pkg}: installed ${name} differs`);
  }
  assert.equal(require('vue-compiler-sfc-classic/package.json').version, '3.5.45');
  const { default: vue } = await import(require.resolve('@vitejs/plugin-vue'));
  const output = await build({ configFile: false, logLevel: 'error',
    plugins: [vue({ features: { vapor: true } })],
    build: { write: false, minify: false, lib: { entry: resolve('scripts/fixtures/vue-toolchain/Probe.vue'), formats: ['es'] },
      rolldownOptions: { external: ['vue'] } },
  });
  const chunks = (Array.isArray(output) ? output : [output]).flatMap(result => result.output);
  assert.match(chunks.find(item => item.type === 'chunk').code, /defineVaporComponent/, `${pkg}: plugin Vapor option did not compile a native component`);
}
console.log('Vue toolchain: exact pins verified', pins, { classicCompiler: '3.5.45' });
