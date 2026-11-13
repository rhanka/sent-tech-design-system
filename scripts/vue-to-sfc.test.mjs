import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { convertModule } from './vue-to-sfc.mjs';

const require = createRequire(import.meta.url);
const compilers = [require('@vue/compiler-sfc'), require('vue-compiler-sfc-classic')];
function compiles(source) {
  for (const compiler of compilers) for (const vapor of compiler.version.startsWith('3.6') ? [false, true] : [false]) {
    const { descriptor, errors } = compiler.parse(source, { filename: 'Probe.vue' });
    assert.deepEqual(errors, []);
    if (vapor) descriptor.scriptSetup.attrs.vapor = true;
    const script = compiler.compileScript(descriptor, { id: 'probe' });
    const result = compiler.compileTemplate({ source: descriptor.template.content, filename: 'Probe.vue', id: 'probe', vapor,
      compilerOptions: { bindingMetadata: script.bindings } });
    assert.deepEqual(result.errors, []);
  }
}
test('Badge draft preserves exported types/defaults/attrs and compiles in both modes and stable 3.5', () => {
  const { source, report } = convertModule(readFileSync(new URL('./fixtures/vue-codemod/Badge.ts', import.meta.url), 'utf8'), 'Badge.ts');
  assert.deepEqual(report.unsupported, []);
  assert.match(source, /export type BadgeProps/);
  assert.match(source, /defineProps<BadgeProps>/);
  assert.match(source, /tone: "neutral"/);
  assert.match(source, /<slot \/>/);
  assert.match(source, /v-bind="\$attrs"/);
  compiles(source);
});
test('typed emits and render children become a compilable template', () => {
  const { source, report } = convertModule(`import { h, defineComponent } from 'vue';
export type ProbeProps = { value: string };
export const Probe = defineComponent({ props: { value: { type: String, required: true } },
emits: { change: (value: string) => true }, setup(props, { emit }) {
return () => h('button', { onClick: () => emit('change', props.value) }, props.value);
} });`);
  assert.deepEqual(report.unsupported, []);
  assert.match(source, /defineEmits<\{ change: \[value: string\]/);
  assert.match(source, /@click=/);
  compiles(source);
});
test('rich props become named slots with a migration report and unresolved branches stay visible', () => {
  const { source, report } = convertModule(`import { h, defineComponent } from 'vue';
export type ProbeProps = { title?: unknown };
export const Probe = defineComponent({ setup(props) { return () => h('aside', null, [props.title as string, items.map(item => h('i', item))]); } });`);
  assert.match(source, /<slot name="title">/);
  assert.ok(report.migrations.some(m => m.includes('title → #title')));
  assert.ok(report.unsupported.some(m => m.includes('Render helper/map')));
  assert.match(source, /TODO: translate/);
});
test('array emits, instance internals, and Lucide require explicit review', () => {
  const { source, report } = convertModule(`import { h, defineComponent, getCurrentInstance } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
export type ProbeProps = {};
export const Probe = defineComponent({ emits: ['change'], setup(props, { emit }) { const instance = getCurrentInstance(); return () => h(ChevronDown); } });`);
  assert.match(source, /<DSIcon name="chevron-down">/);
  assert.doesNotMatch(source, /from ['"]lucide-vue-next/);
  assert.ok(report.migrations.some(m => m.startsWith('K7:')));
  assert.ok(report.unsupported.some(m => m.includes('getCurrentInstance')));
  assert.ok(report.unsupported.some(m => m.includes('Array emits')));
});
test('ambiguous modules fail before emitting a plausible SFC', () => {
  assert.throws(() => convertModule('export const A = {};'), /exactly one/);
  assert.throws(() => convertModule(`import { defineComponent } from 'vue'; export const A = defineComponent({ setup() {} });`), /exported AProps/);
});
test('UID-only instance access becomes useId without guessing coordination semantics', () => {
  const { source, report } = convertModule(`import { h, defineComponent, getCurrentInstance as current } from 'vue';
export type ProbeProps = {};
export const Probe = defineComponent({ setup(props) { const uid = current()!.uid; return () => h('label', { id: uid }, 'Name'); } });`);
  assert.deepEqual(report.unsupported, []);
  assert.match(source, /useId as __sfcUseId/);
  assert.match(source, /const uid = __sfcUseId\(\)/);
  assert.doesNotMatch(source, /current\(\)/);
  assert.ok(report.migrations.some(m => m.includes('Instance uid')));
  compiles(source);
});
