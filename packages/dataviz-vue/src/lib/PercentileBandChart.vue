<script setup lang="ts">
import { computed } from 'vue';
import { buildPercentileBandModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';

export type PercentileBandChartProps = {
  store: DashboardStore;
  viewId: string;
  value: string;
  lower: number;
  upper: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'PercentileBandChart' });
const props = withDefaults(defineProps<PercentileBandChartProps>(), {
  width: 360, height: 96, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildPercentileBandModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    value: props.value,
    lower: props.lower,
    upper: props.upper,
  });
});
const data = computed<LineChartDatum[]>(() => [
  { x: `${Math.round(props.lower * 100)}%`, y: model.value.lowerValue },
  { x: 'median', y: model.value.median },
  { x: `${Math.round(props.upper * 100)}%`, y: model.value.upperValue },
]);
</script>

<template>
  <LineChart :data="data" :width="props.width" :height="props.height" :label="props.label"
    :bands="[{ from: model.lowerValue, to: model.upperValue, label: 'Percentiles', tone: 'success' }]"
    :reference-lines="[{ value: model.median, label: 'Median', tone: 'success' }]"
    :class="['st-percentileBandChart', props.class].filter(Boolean).join(' ')" />
</template>
