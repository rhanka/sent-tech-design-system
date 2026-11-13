import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as source from './vue-vapor-source.mjs';
const sfc=script=>`<script setup lang="ts">${script}</script><template><input v-bind="$attrs" /></template>`;
for(const [title,input,expected]of [
 ['fallthrough',sfc('defineOptions({name:"X"});'),'inheritAttrs'],
 ['cached attrs',sfc('import {useAttrs as attrsOf,computed as memo} from "vue";defineOptions({inheritAttrs:false});const extra=attrsOf();const p=memo(()=>({...extra}));'),'cached attrs'],
 ['duplicate notification',sfc('defineOptions({inheritAttrs:false});const props=defineProps<{onChange?:Function}>();const notify=defineEmits(["change"]);function update(){props.onChange?.(1);notify("change",1)}'),'double notification'],
 ['camel slot',sfc('defineOptions({inheritAttrs:false});defineSlots<{helperText?:()=>unknown}>();'),'kebab-case'],
])test(`K25 should reject ${title}`,()=>{assert.equal(typeof source.sfcSafety,'function');assert.ok(source.sfcSafety(input,'X.vue').some(x=>x.includes(expected)));});
test('K25 should accept a live attrs merge, local counters and a single emit',()=>{assert.deepEqual(source.sfcSafety(sfc('defineOptions({inheritAttrs:false});const emit=defineEmits(["change"]);let ticket=0;function change(){ticket++;emit("change",ticket)}'),'X.vue'),[]);});
test('K25 should reject mutable module identities, including extracted helpers',()=>{assert.equal(typeof source.moduleCounters,'function');assert.ok(source.moduleCounters('let sequence=0;export function id(){return `st-demo-${++sequence}`}','identity.ts').length);assert.deepEqual(source.moduleCounters('export function local(){let x=0;return ++x}','safe.ts'),[]);});
