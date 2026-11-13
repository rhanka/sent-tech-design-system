<script setup lang="ts">
import { computed } from 'vue';
import { StackedBarChart as DsStackedBarChart, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeCategoricalSeries, toStackedCategoricalData, type StackedMode } from './categoricalData.js';
export type StackedBarChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  mode?: StackedMode;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  dataLabels?: ChartDataLabels;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};
defineOptions({ name: 'StackedBarChart' });
const props = withDefaults(defineProps<StackedBarChartProps>(), {
  mode: 'stacked', showLegend: true, width: undefined, height: undefined, dataLabels: undefined, hiddenSeries: undefined, onToggleSeries: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const seriesModel = buildSafeCategoricalSeries(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    series: props.series,
    measures: [props.measure],
    mode: props.mode,
  });
  return toStackedCategoricalData(seriesModel);
});
</script>

<template>
  <DsStackedBarChart :data="data" :label="props.label" :show-legend="props.showLegend" :width="props.width" :height="props.height" :data-labels="props.dataLabels" :hidden-series="props.hiddenSeries" :on-toggle-series="props.onToggleSeries" :class="props.class" />
</template>
