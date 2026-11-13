<script setup lang="ts" vapor generic="T extends string">
import { ref, provide } from 'vue';
import type { WitnessProps } from './context-types.js';
import ContextChild from './ContextChild.vue';
const props = defineProps<WitnessProps<T>>();
const value = ref<string>(props.initial);
provide('v0c-state', value);
defineExpose({ setValue: (next: string) => { value.value = next; } });
</script>

<template>
  <ContextChild @change="value = $event">
    <template #label="{ id }"><label :for="id">Shared value</label></template>
    <span>{{ value }}</span>
  </ContextChild>
  <ContextChild><template #label="{ id }"><label :for="id">Second value</label></template></ContextChild>
</template>
