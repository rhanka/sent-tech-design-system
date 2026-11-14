// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { renderCalls } from '../vue-vapor-source.mjs';

const aliasFixtures = readdirSync(resolve('scripts/fixtures/vue-render-aliases'));

it.each(aliasFixtures)('should reject %s aliases in K25 and exclude them from the native barrel', (fixture) => {
  const root = mkdtempSync(join(tmpdir(), 'k25-alias-'));
  try {
    mkdirSync(join(root, 'scripts'));
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    for (const name of ['vue-vapor-lint.mjs', 'vue-vapor-source.mjs', 'dataviz-vue-text.mjs']) cpSync(resolve('scripts', name), join(root, 'scripts', name));
    for (const name of ['components-vue', 'dataviz-vue']) mkdirSync(join(root, 'packages', name, 'src'), { recursive: true });
    writeFileSync(join(root, 'scripts/vue-vapor-legacy.json'), '[]');
    const pkg = join(root, 'packages/dataviz-vue');
    writeFileSync(join(pkg, 'src/Widget.ts'), readFileSync(resolve('scripts/fixtures/vue-render-aliases', fixture), 'utf8'));
    writeFileSync(join(pkg, 'src/index.ts'), "export { Widget } from './Widget.js';");
    writeFileSync(join(pkg, 'package.json'), '{"type":"module"}');
    const lint = spawnSync(process.execPath, [join(root, 'scripts/vue-vapor-lint.mjs')], { encoding: 'utf8' });
    expect(lint.status, lint.stdout + lint.stderr).toBe(1);
    expect(lint.stderr).toContain('new render-function module: packages/dataviz-vue/src/Widget.ts');
    const build = spawnSync(process.execPath, [resolve('scripts/vue-sfc-build.mjs')], { cwd: pkg, encoding: 'utf8' });
    expect(build.status, build.stdout + build.stderr).toBe(0);
    expect(readFileSync(join(pkg, 'dist/vapor/index.js'), 'utf8')).not.toContain('Widget');
    expect(readFileSync(join(pkg, 'dist/vapor/index.d.ts'), 'utf8')).not.toContain('Widget');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('should reject aliased and namespace render calls while accepting signal helpers', () => {
  expect(renderCalls(`import {h as render, defineComponent as component} from 'vue'; component({setup:()=>()=>render('p')})`)).not.toHaveLength(0);
  expect(renderCalls(`import * as Vue from 'vue'; Vue.defineComponent({}); Vue.h('p');`)).not.toHaveLength(0);
  expect(renderCalls(`import { ref, computed } from 'vue'; const value=ref(1); computed(()=>value.value);`)).toEqual([]);
  expect(renderCalls(`import * as Vue from 'vue'; const value=Vue.ref(1); Vue['computed'](()=>value.value);`)).toEqual([]);
  expect(renderCalls(`import type { h } from 'vue'; import { type defineComponent } from 'vue';`)).toEqual([]);
  expect(renderCalls(`// h('p')\nconst text = "Vue.h('p')"; const api = { h() {} }; api.h();`)).toEqual([]);
});

it('should resolve a dataviz child through its native DS SFC without adding DS-only helpers', () => {
  const root = mkdtempSync(join(tmpdir(), 'dataviz-native-child-'));
  try {
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    const pkg = join(root, 'packages/dataviz-vue');
    const ds = join(root, 'packages/components-vue/src');
    mkdirSync(join(pkg, 'src'), { recursive: true });
    mkdirSync(ds, { recursive: true });
    writeFileSync(join(pkg, 'package.json'), '{"type":"module"}');
    writeFileSync(join(ds, 'index.ts'), "export { ForceGraph } from './ForceGraph.js';");
    writeFileSync(join(ds, 'ForceGraph.ts'), "import { defineComponent } from 'vue'; export const ForceGraph = defineComponent({});");
    writeFileSync(join(ds, 'ForceGraph.vue'), '<script setup lang="ts">defineProps<{label?:string}>();</script><template><div>{{label}}</div></template>');
    writeFileSync(join(pkg, 'src/ForceGraph.vue'), `<script setup lang="ts">
import { ForceGraph as Presenter } from '@sentropic/design-system-vue';
</script><template><Presenter label="Native graph" /></template>`);
    writeFileSync(join(pkg, 'src/index.ts'), "export { default as ForceGraph } from './ForceGraph.vue';");
    const build = spawnSync(process.execPath, [resolve('scripts/vue-sfc-build.mjs')], { cwd: pkg, encoding: 'utf8' });
    expect(build.status, build.stdout + build.stderr).toBe(0);
    const entry = readFileSync(join(pkg, 'dist/vapor/index.js'), 'utf8');
    expect(entry).toContain('default as ForceGraph');
    expect(entry).not.toContain('nodeShapePath');
    expect(entry).not.toContain('edgeDashArray');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('should keep compatibility helpers separate from native SFC named exports', () => {
  const root = mkdtempSync(join(tmpdir(), 'vue-native-exports-'));
  try {
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    const pkg = join(root, 'packages/components-vue');
    mkdirSync(join(pkg, 'src'), { recursive: true });
    writeFileSync(join(pkg, 'package.json'), '{"type":"module"}');
    writeFileSync(join(pkg, 'src/ForceGraph.ts'), "export { default as ForceGraph } from './ForceGraph.vue'; export { nodeShapePath, edgeDashArray } from '@sentropic/graph/presentation';");
    writeFileSync(join(pkg, 'src/ForceGraph.vue'), '<script setup lang="ts">defineProps<{label?:string}>();</script><template><div>{{label}}</div></template>');
    writeFileSync(join(pkg, 'src/Filter.vue'), '<script lang="ts">export const toSpec = (value: string) => value;</script><script setup lang="ts">defineProps<{label?:string}>();</script><template><div>{{label}}</div></template>');
    writeFileSync(join(pkg, 'src/index.ts'), "export { ForceGraph, nodeShapePath, edgeDashArray } from './ForceGraph.js';\nexport { default as Filter, toSpec } from './Filter.vue';");
    const build = spawnSync(process.execPath, [resolve('scripts/vue-sfc-build.mjs')], { cwd: pkg, encoding: 'utf8' });
    expect(build.status, build.stdout + build.stderr).toBe(0);
    for (const file of ['index.js', 'index.d.ts']) {
      const entry = readFileSync(join(pkg, 'dist/vapor', file), 'utf8');
      expect(entry.match(/nodeShapePath/g)).toHaveLength(1);
      expect(entry.match(/edgeDashArray/g)).toHaveLength(1);
      expect(entry).toContain("from '@sentropic/graph/presentation'");
      expect(entry).toContain("export { toSpec } from './Filter.vue.js'");
      expect(entry).not.toMatch(/export \{ (?:nodeShapePath|edgeDashArray) \} from '.\/ForceGraph/);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
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
    for (const name of ['vue-vapor-lint.mjs', 'vue-vapor-source.mjs', 'dataviz-vue-text.mjs']) cpSync(resolve('scripts', name), join(root, 'scripts', name));
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
    writeFileSync(join(root, 'scripts/vue-vapor-legacy.json'), '[]');
    writeFileSync(join(root, module), "export const key = '\u0000';");
    expect(lint().status).toBe(1); expect(lint().stderr).toContain('control byte 0x00');
    writeFileSync(join(root, module), "export const key = '\\u0000';");
    expect(lint().status).toBe(0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
