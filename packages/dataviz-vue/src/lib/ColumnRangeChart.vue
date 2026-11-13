<script setup lang="ts">
import { computed } from 'vue';
import {
  ColumnRangeChart as DsColumnRangeChart,
  type ColumnRangeChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ColumnRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  low: string;
  high: string;
  orientation?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ColumnRangeChart' });
const props = withDefaults(defineProps<ColumnRangeChartProps>(), {
  orientation: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildColumnRangeData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { category: props.category, low: props.low, high: props.high },
  ) as ColumnRangeChartDatum[];
});
</script>

<template>
  <DsColumnRangeChart :data="data" :label="props.label" :orientation="(props.orientation as 'vertical' | 'horizontal' | undefined)"
    :width="props.width" :height="props.height" :class="props.class" />
</template>
