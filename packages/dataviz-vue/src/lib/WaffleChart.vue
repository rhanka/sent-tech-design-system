<script setup lang="ts">
import { computed } from 'vue';
import { WaffleChart as DsWaffleChart, type WaffleChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildItemChartData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type WaffleChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  value: string;
  totalCells?: number;
  columns?: number;
  label?: string;
  size?: number;
  class?: string;
};
defineOptions({ name: 'WaffleChart' });
const props = withDefaults(defineProps<WaffleChartProps>(), {
  totalCells: undefined, columns: undefined, label: undefined, size: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<WaffleChartDatum[]>(() => {
  void state.value;
  return buildItemChartData(props.store.model, props.store.applyCrossfilter(props.viewId), { label: props.label_field, value: props.value }) as WaffleChartDatum[];
});
</script>

<template>
  <DsWaffleChart :data="data" :total-cells="props.totalCells" :columns="props.columns" :label="props.label" :size="props.size" :class="props.class" />
</template>
