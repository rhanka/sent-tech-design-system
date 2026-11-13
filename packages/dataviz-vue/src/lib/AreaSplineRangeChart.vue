<script setup lang="ts">
import { computed } from 'vue';
import {
  AreaSplineRangeChart as DsAreaSplineRangeChart,
  type AreaSplineRangeChartDatum,
  type AreaSplineRangeChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAreaRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AreaSplineRangeChartProps = {
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

defineOptions({ name: 'AreaSplineRangeChart' });
const props = withDefaults(defineProps<AreaSplineRangeChartProps>(), {
  tone: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildAreaRangeData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { x: props.x_field, low: props.low, high: props.high },
  ) as AreaSplineRangeChartDatum[];
});
</script>

<template>
  <DsAreaSplineRangeChart :data="data" :label="props.label" :tone="(props.tone as AreaSplineRangeChartTone | undefined)"
    :width="props.width" :height="props.height" :class="props.class" />
</template>
