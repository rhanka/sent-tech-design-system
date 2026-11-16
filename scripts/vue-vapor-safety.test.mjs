import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as source from './vue-vapor-source.mjs';
const sfc=script=>`<script setup lang="ts">${script}</script><template><input v-bind="$attrs" /></template>`;
test('K25 should reject disabled fallthrough without forwarding attrs', () => {
  const input = '<script setup>defineOptions({inheritAttrs:false});</script><template><div /></template>';
  assert.ok(source.sfcSafety(input).some(error => error.includes('unforwarded attrs')));
});
test('K25 should reject attrs forwarded on an ancestor and its descendant', () => {
  for (const bindings of [
    ['v-bind="$attrs"', 'v-bind="$attrs"'],
    ['v-bind="{...attrs}"', 'v-bind="attrs"'],
    ['v-bind="outer()"', 'v-bind="inner"'],
  ]) {
    const input = `<script setup>import {useAttrs} from 'vue';defineOptions({inheritAttrs:false});const attrs=useAttrs();const outer=()=>({...attrs});const inner={...attrs};</script><template><div ${bindings[0]}><button ${bindings[1]} /></div></template>`;
    assert.ok(source.sfcSafety(input).some(error => error.includes('ancestor and descendant')));
  }
});
test('K25 should accept deliberate editor attr rejection and independent sibling targets', () => {
  assert.deepEqual(source.sfcSafety('<script setup>/** @attrs none Editor owns its inner textbox. */\ndefineOptions({inheritAttrs:false});</script><template><div /></template>'), []);
  assert.deepEqual(source.sfcSafety('<script setup>defineOptions({inheritAttrs:false});</script><template><button v-if="open" v-bind="$attrs"/><input v-else v-bind="$attrs"/></template>'), []);
});
for(const [title,input,expected]of [
 ['fallthrough',sfc('defineOptions({name:"X"});'),'inheritAttrs'],
 ['cached attrs',sfc('import {useAttrs as attrsOf,computed as memo} from "vue";defineOptions({inheritAttrs:false});const extra=attrsOf();const p=memo(()=>({...extra}));'),'cached attrs'],
 ['duplicate notification',sfc('defineOptions({inheritAttrs:false});const props=defineProps<{onChange?:Function}>();const notify=defineEmits(["change"]);function update(){props.onChange?.(1);notify("change",1)}'),'double notification'],
 ['camel slot',sfc('defineOptions({inheritAttrs:false});defineSlots<{helperText?:()=>unknown}>();'),'kebab-case'],
])test(`K25 should reject ${title}`,()=>{assert.equal(typeof source.sfcSafety,'function');assert.ok(source.sfcSafety(input,'X.vue').some(x=>x.includes(expected)));});
test('K25 should accept a live attrs merge, local counters and a single emit',()=>{assert.deepEqual(source.sfcSafety(sfc('defineOptions({inheritAttrs:false});const emit=defineEmits(["change"]);let ticket=0;function change(){ticket++;emit("change",ticket)}'),'X.vue'),[]);});
test('K25 should reject mutable module identities, including extracted helpers',()=>{assert.equal(typeof source.moduleCounters,'function');assert.ok(source.moduleCounters('let sequence=0;export function id(){return `st-demo-${++sequence}`}','identity.ts').length);assert.deepEqual(source.moduleCounters('export function local(){let x=0;return ++x}','safe.ts'),[]);});

for (const [name, input, expected] of [
  ['missing rich slot', 'type XProps={title?:unknown};defineProps<XProps>();', 'rich content title requires slot title'],
  ['required rich prop', 'type XProps={title:unknown};defineProps<XProps>();defineSlots<{title?:()=>unknown}>();', 'rich content title must be optional'],
  ['nested rich label', 'type Item={label:unknown};type XProps={items:Item[]};defineProps<XProps>();', 'rich content label'],
  ['VNode children', 'type XProps={caption?:VNodeChild};defineProps<XProps>();', 'rich content caption'],
  ['renamed VNode types', 'import type {VNodeChild as Rich} from "vue";type XProps={caption?:Rich};defineProps<XProps>();', 'rich content caption'],
  ['aliased rich props', 'type Rich=unknown;type XProps={title:Rich};defineProps<XProps>();', 'rich content title'],
  ['parenthesized render callbacks', 'type XProps={content:string | (()=>unknown)};defineProps<XProps>();', 'rich content content'],
  ['unused attrs binding', 'import {useAttrs as attrsOf} from "vue";const attrs=attrsOf();', 'unused Vue binding: attrs'],
  ['unused slots import', 'import {useSlots} from "vue";', 'unused Vue import: useSlots'],
]) test(`K25 should reject ${name}`, () => {
  assert.ok(source.sfcSafety(sfc('defineOptions({inheritAttrs:false});' + input), 'X.vue').some(error => error.includes(expected)));
});
test('K25 should accept optional rich props with declared, rendered slots and data-only unknown inputs', () => {
  const input = '<script setup lang="ts">type XProps={title?:unknown;\n/** @vaporData Serialized input, never rendered as children. */\nenvelope?:unknown};defineProps<XProps>();defineSlots<{title?:()=>unknown}>();</script><template><slot name="title" /></template>';
  assert.deepEqual(source.sfcSafety(input, 'X.vue'), []);
});
for (const [name, expression, expected] of [
  ['lost caller styles', '{ ...$attrs, style: { top: 0 } }', 'style overwrites caller attrs'],
  ['caller-first styles', '{ ...$attrs, style: [$attrs.style, owned] }', 'caller style must have final precedence'],
]) test(`K25 should reject ${name}`, () => {
  const input = `<script setup lang="ts">defineOptions({inheritAttrs:false});const owned={top:0};</script><template><div v-bind="${expression}" /></template>`;
  assert.ok(source.sfcSafety(input, 'X.vue').some(error => error.includes(expected)));
});
test('K25 should reject caller styles cached in computed objects', () => {
  const input = sfc('import {computed,useAttrs} from "vue";defineOptions({inheritAttrs:false});const attrs=useAttrs();const style=computed(()=>({color:"red",...attrs.style}));');
  assert.ok(source.sfcSafety(input, 'X.vue').some(error => error.includes('cached attrs style')));
});
test('K25 should preserve explicit owned positioning precedence', () => {
  const input = '<script setup lang="ts">/** @attrsStyle owned-last */\ndefineOptions({inheritAttrs:false});const owned={top:0};</script><template><div v-bind="{...$attrs,style:[$attrs.style,owned]}" /></template>';
  assert.deepEqual(source.sfcSafety(input, 'X.vue'), []);
});
test('K25 should reject undeclared rendered slots', () => {
  assert.ok(source.sfcSafety('<script setup lang="ts">defineProps<{}>();</script><template><slot name="footer" /></template>', 'X.vue').some(error => error.includes('rendered slot footer requires defineSlots')));
});
test('K25 should reject clobbering a forwarded class when class is not a declared prop', () => {
  const input = '<script setup lang="ts">defineOptions({inheritAttrs:false});</script><template><div v-bind="{...$attrs,class:\'owned\'}" /></template>';
  assert.ok(source.sfcSafety(input, 'X.vue').some(error => error.includes('class overwrites caller attrs')));
});
test('K25 should accept declared class props and explicitly merged caller classes', () => {
  for (const input of [
    '<script setup lang="ts">defineOptions({inheritAttrs:false});defineProps<{class?:string}>();</script><template><div v-bind="{...$attrs,class:props.class}" /></template>',
    '<script setup lang="ts">defineOptions({inheritAttrs:false});</script><template><div v-bind="{...$attrs,class:[\'owned\',$attrs.class]}" /></template>',
  ]) assert.deepEqual(source.sfcSafety(input, 'X.vue'), []);
});
test('K25 should reject declared rich slots that are never rendered', () => {
  const input = '<script setup lang="ts">type XProps={title?:unknown};defineProps<XProps>();defineSlots<{title?:()=>unknown}>();</script><template><p /></template>';
  assert.ok(source.sfcSafety(input, 'X.vue').some(error => error.includes('rich content title requires rendered slot title')));
});
test('K25 should reject converting rich props to strings before their scalar guard', () => {
  const input = '<script setup lang="ts">type XProps={title?:unknown};defineProps<XProps>();defineSlots<{title?:()=>unknown}>();</script><template><slot name="title">{{scalarContent(String(props.title))}}</slot></template>';
  assert.ok(source.sfcSafety(input, 'X.vue').some(error => error.includes('rich content must be checked before String')));
});
