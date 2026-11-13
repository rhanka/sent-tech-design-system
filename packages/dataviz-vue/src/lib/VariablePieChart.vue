<script setup lang="ts">
import { computed } from 'vue';
import { VariablePieChart as DsVariablePieChart, type VariablePieChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVariablePieData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type VariablePieChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  value: string;
  z: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'VariablePieChart' });
const props = withDefaults(defineProps<VariablePieChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<VariablePieChartDatum[]>(() => {
  void state.value;
  return buildVariablePieData(props.store.model, props.store.applyCrossfilter(props.viewId), { label: props.label_field, value: props.value, z: props.z }) as VariablePieChartDatum[];
});
</script>

<template>
  <DsVariablePieChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
