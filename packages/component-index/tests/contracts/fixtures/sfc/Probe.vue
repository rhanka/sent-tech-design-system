<script setup lang="ts">
import type { ImportedProps } from './props.js';
export type ProbeProps = ImportedProps;
defineProps<ProbeProps>();
defineEmits<{ change: [value: string, index: number]; 'update:value': [value: string]; done: [] }>();
defineSlots<{
  default?: () => unknown;
  header: (scope: { label: string }) => unknown;
  row?: (scope: { value: string; index: number }) => unknown;
}>();
defineExpose({ focus: () => undefined });
</script>
<template><section><slot name="header" :label="value" /><slot /><slot name="row" :value="value" :index="0" /></section></template>
