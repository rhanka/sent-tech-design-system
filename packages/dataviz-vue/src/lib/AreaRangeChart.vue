<script setup lang="ts">
import { computed } from 'vue';
import {
  AreaRangeChart as DsAreaRangeChart,
  type AreaRangeChartDatum,
  type AreaRangeChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAreaRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AreaRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  x_field: string;
  low: string;
  high: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'AreaRangeChart' });
const props = withDefaults(defineProps<AreaRangeChartProps>(), {
  tone: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildAreaRangeData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { x: props.x_field, low: props.low, high: props.high },
  ) as AreaRangeChartDatum[];
});
</script>

<template>
  <DsAreaRangeChart :data="data" :label="props.label" :tone="(props.tone as AreaRangeChartTone | undefined)" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
