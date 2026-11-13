// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { renderCalls } from '../vue-vapor-source.mjs';

it('should reject aliased and namespace render calls while accepting signal helpers', () => {
  expect(renderCalls(`import {h as render, defineComponent as component} from 'vue'; component({setup:()=>()=>render('p')})`)).toHaveLength(2);
  expect(renderCalls(`import * as Vue from 'vue'; Vue.defineComponent({}); Vue.h('p');`)).toHaveLength(2);
  expect(renderCalls(`import { ref, computed } from 'vue'; const value=ref(1); computed(()=>value.value);`)).toEqual([]);
});

it('should compile a future dataviz SFC with imported props, slots and declarations in both modes', () => {
  const root = mkdtempSync(join(tmpdir(), 'dataviz-sfc-'));
  try {
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    mkdirSync(join(root, 'src'));
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: {
      target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true,
      declaration: true, outDir: 'dist', rootDir: 'src', skipLibCheck: true,
    }, include: ['src'] }));
    writeFileSync(join(root, 'src/props.ts'), 'export interface ChartProps { label: string }');
    writeFileSync(join(root, 'src/Chart.vue'), `<script setup lang="ts">
import type { ChartProps } from './props.js';
defineProps<ChartProps>();
defineSlots<{default(props: {label: string}): unknown}>();
</script><template><figure><slot :label="label" />{{ label }}</figure></template>`);
    writeFileSync(join(root, 'src/index.ts'), "export { default as Chart } from './Chart.vue';");
    const require = createRequire(resolve('packages/dataviz-vue/package.json'));
    const run = (args: string[]) => spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
    const declarations = run([require.resolve('vue-tsc/bin/vue-tsc.js'), '-p', 'tsconfig.json']);
    expect(declarations.status, declarations.stdout + declarations.stderr).toBe(0);
    const build = run([resolve('scripts/vue-sfc-build.mjs')]);
    expect(build.status, build.stdout + build.stderr).toBe(0);
    expect(readFileSync(join(root, 'dist/Chart.vue.js'), 'utf8')).not.toContain('defineVaporComponent');
    expect(readFileSync(join(root, 'dist/vapor/Chart.vue.js'), 'utf8')).toContain('defineVaporComponent');
    expect(readFileSync(join(root, 'dist/Chart.vue.d.ts'), 'utf8')).toContain('ChartProps');
    expect(readFileSync(join(root, 'dist/vapor/index.js'), 'utf8')).toContain('Chart.vue.js');
    const classic = run([resolve('scripts/vue-sfc-build.mjs'), '--stable']);
    expect(classic.status, classic.stdout + classic.stderr).toBe(0);
    expect(readFileSync(join(root, 'dist/classic-3.5/Chart.vue.js'), 'utf8')).not.toContain('defineVaporComponent');
  } finally { rmSync(root, { recursive: true, force: true }); }
}, 15000);

it('should fail the build lint for a new module and require removal after conversion', () => {
  const root = mkdtempSync(join(tmpdir(), 'k25-'));
  try {
    mkdirSync(join(root, 'scripts'));
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    for (const name of ['vue-vapor-lint.mjs', 'vue-vapor-source.mjs']) cpSync(resolve('scripts', name), join(root, 'scripts', name));
    for (const name of ['components-vue', 'dataviz-vue']) mkdirSync(join(root, 'packages', name, 'src'), { recursive: true });
    const module = 'packages/dataviz-vue/src/Chart.ts';
    writeFileSync(join(root, 'scripts/vue-vapor-legacy.json'), '[]');
    writeFileSync(join(root, module), `import {h as render} from 'vue'; export const chart=()=>render('p');`);
    const lint = () => spawnSync(process.execPath, [join(root, 'scripts/vue-vapor-lint.mjs')], { encoding: 'utf8' });
    expect(lint().status).toBe(1); expect(lint().stderr).toContain('new render-function module');
    writeFileSync(join(root, 'scripts/vue-vapor-legacy.json'), JSON.stringify([module]));
    expect(lint().status).toBe(0);
    writeFileSync(join(root, module), `export const value = 1;`);
    expect(lint().status).toBe(1); expect(lint().stderr).toContain('remove converted/deleted file');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
