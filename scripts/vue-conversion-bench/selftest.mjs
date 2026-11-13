import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { resolve } from 'node:path';
import { checkTemplateSource } from './template-source.mjs';
import { compilers, compileSfc, src, normalizeHtml } from '../../packages/dataviz-vue/bench/lib.mjs';

const file = resolve(src, 'Proof.vue');
const source = companion => `<script lang="ts">${companion}</script>\n<script setup lang="ts">defineProps<{ value?: string }>();</script>\n<template><div>{{ value }}</div></template>`;
const check = text => checkTemplateSource(text, file, compilers);

test('companion type and helper exports pass G1 and both compilers', () => {
  const text = source(`export type Extra = string; export interface Row { value: number }
    export const LIMIT = 5; export function label(value: number) { return String(value); }`);
  assert.doesNotThrow(() => check(text));
  for (const mode of ['classic', 'vapor']) assert(compileSfc(text, file, mode).length);
  assert.doesNotThrow(() => check(source('export type { Ref } from "vue";')));
});

test('companion script rejects rendering, JSX, mutable exports and executable statements', () => {
  for (const body of [
    'export default {};', 'export default function helper() {}',
    'export const render = () => null;', 'export function render() {}',
    'export const options = { "render"() { return null; } };',
    'export const options = { ["render"]() { return null; } };',
    'export const options = { get render() { return () => null; } };',
    'export const helper = () => h("div");',
    'import { h as makeNode } from "vue"; export const helper = () => makeNode("div");',
    'export const helper = () => Vue.h("div");',
    'export const helper = defineComponent({ render() {} });',
    'export const helper = () => <div />;', 'export let count = 0;',
    'console.log("side effect");', 'export { helper } from "./render.js";',
  ]) assert.throws(() => check(source(body)), undefined, body);
  assert.throws(() => check(source('export const VALUE = 1;').replace('<script lang="ts">', '<script>')));
  assert.throws(() => check(source('').replace('<script lang="ts">', '<script lang="ts" src="./helper.ts">')));
});

test('setup and template retain render guards', () => {
  assert.throws(() => check(source('').replace('defineProps', 'h("div"); defineProps')));
  assert.throws(() => check(source('').replace('{{ value }}', '{{ h("div") }}')));
});

test('dataviz G1 applies the K25 attrs, notification, slot and identity rules', () => {
  for (const body of [
    'import { useAttrs } from "vue"; const attrs = useAttrs();',
    'import { useAttrs, computed } from "vue"; defineOptions({inheritAttrs:false}); const attrs=useAttrs(); const cached=computed(()=>({...attrs}));',
    'const props=defineProps<{onChange?:Function}>(); const emit=defineEmits(["change"]); function update(){props.onChange?.(1);emit("change",1)}',
    'defineSlots<{helperText?:()=>unknown}>();',
  ]) {
    const input = `<script setup lang="ts">${body}</script><template><div /></template>`;
    assert.throws(() => check(input));
  }
  assert.throws(() => check(source('export function id(){return ++sequence}').replace('export function', 'let sequence=0; export function')));
});

const normalize = html => normalizeHtml(html, JSDOM);
test('random SVG IDs and useId references match without losing suffix relationships', () => {
  const svg = (id, ref = '1') => `<svg><defs><clipPath id="${id}-0"></clipPath><clipPath id="${id}-1"></clipPath></defs><g clip-path="url(#${id}-${ref})"></g></svg>`;
  assert.equal(normalize(svg('st-treemap-clip-abc1234')), normalize(svg('st-treemap-clip-v0')));
  assert.notEqual(normalize(svg('st-treemap-clip-abc1234')), normalize(svg('st-treemap-clip-v0', '0')));
  for (const chart of ['areachart', 'arearangechart', 'areasplinerangechart', 'bellcurve']) {
    const gradient = id => `<svg><linearGradient id="${id}"></linearGradient><path fill="url(#${id})"></path></svg>`;
    assert.equal(normalize(gradient(`st-${chart}-gradient-0-abc1234`)), normalize(gradient(`st-${chart}-gradient-v-0`)));
  }
  assert.equal(normalize('<label for="st-input-21">Name</label><input id="st-input-21">'), normalize('<label for="st-input-v-0">Name</label><input id="st-input-v-0">'));
  assert.notEqual(normalize('<div id="consumer-a"></div>'), normalize('<div id="consumer-b"></div>'));
  assert.notEqual(normalize(svg('st-treemap-clip-v0')), normalize(svg('st-treemap-clip-v0').replace('<g ', '<g class="changed" ')));
  assert.equal(normalize(normalize(svg('st-treemap-clip-abc1234'))), normalize(svg('st-treemap-clip-abc1234')));
});

test('previously normalized IDs and newly masked IDs share one collision-free identity map', () => {
  const frozen = '<input id="generated-1"><svg><clipPath id="st-treemap-clip-abc1234-0"></clipPath><g clip-path="url(#st-treemap-clip-abc1234-0)"></g></svg>';
  const candidate = frozen.replace('generated-1', 'st-input-v-0').replaceAll('st-treemap-clip-abc1234', 'st-treemap-clip-v1');
  assert.equal(normalize(frozen), normalize(candidate));
  assert.match(normalize(frozen), /id="generated-2-0"/);
});
