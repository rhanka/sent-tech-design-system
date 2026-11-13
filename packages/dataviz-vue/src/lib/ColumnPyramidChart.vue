<script setup lang="ts">
import { computed } from 'vue';
import {
  ColumnPyramidChart as DsColumnPyramidChart,
  type ColumnPyramidChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnPyramidData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ColumnPyramidChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ColumnPyramidChart' });
const props = withDefaults(defineProps<ColumnPyramidChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildColumnPyramidData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { category: props.category, value: props.value },
  ) as ColumnPyramidChartDatum[];
});
</script>

<template>
  <DsColumnPyramidChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>
