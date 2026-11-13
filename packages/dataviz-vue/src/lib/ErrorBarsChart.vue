<script setup lang="ts">
import { computed } from 'vue';
import { buildErrorBarsModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { BarChart, type BarChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
export type ErrorBarsChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  class?: string;
};
defineOptions({ name: 'ErrorBarsChart' });
const props = withDefaults(defineProps<ErrorBarsChartProps>(), {
  interval: undefined, width: 420, height: 240, annotations: undefined, dataLabels: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<BarChartDatum[]>(() => {
  void state.value;
  const model = buildErrorBarsModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    value: props.value,
    interval: props.interval,
  });
  return model.items.map((item) => ({
    label: item.label,
    value: item.mean,
    errorLow: item.lower,
    errorHigh: item.upper,
  }));
});
</script>

<template>
  <BarChart :data="data" :width="props.width" :height="props.height" :label="props.label"
    :annotations="props.annotations" :data-labels="props.dataLabels"
    :class="['st-errorBarsChart', props.class].filter(Boolean).join(' ')" />
</template>
