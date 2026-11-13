<script setup lang="ts">
import { computed } from 'vue';
import { StepLineChart as DsStepLineChart, type StepLineChartTone } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSimpleCategoricalSeries, toSimpleCategoricalPoints } from './categoricalData.js';
export type StepLineChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: StepLineChartTone;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'StepLineChart' });
const props = withDefaults(defineProps<StepLineChartProps>(), {
  tone: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const seriesModel = buildSimpleCategoricalSeries(props.store.model, props.store.applyCrossfilter(props.viewId), props.category, props.measure);
  return toSimpleCategoricalPoints(seriesModel);
});
</script>

<template>
  <DsStepLineChart :data="data" :label="props.label" :tone="props.tone" :width="props.width" :height="props.height" :class="props.class" />
</template>
