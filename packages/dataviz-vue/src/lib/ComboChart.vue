<script setup lang="ts">
import { computed } from 'vue';
import {
  ComboChart as DsComboChart,
  type ComboChartBarSeries,
  type ComboChartLineSeries,
  type DataLabelsProp,
} from '@sentropic/design-system-vue';
import type {
  ChartAnnotation,
  CategoricalMeasureInput,
  CategoricalMode,
  DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeCategoricalSeries } from './categoricalData.js';

export type ComboChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measures: CategoricalMeasureInput[];
  series?: string;
  mode?: CategoricalMode;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ComboChart' });
const props = withDefaults(defineProps<ComboChartProps>(), {
  series: undefined, mode: 'grouped', leftAxisLabel: undefined, rightAxisLabel: undefined, legend: true,
  hiddenSeries: undefined, onToggleSeries: undefined, annotations: undefined, dataLabels: undefined,
  hoverKey: undefined, onHoverKeyChange: undefined, onSelectKey: undefined, width: undefined, height: undefined,
  class: undefined,
});
const state = useDashboard(props.store);
const seriesModel = computed(() => {
  void state.value;
  return buildSafeCategoricalSeries(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    series: props.series,
    measures: props.measures,
    mode: props.mode,
  });
});
const bars = computed<ComboChartBarSeries[]>(() =>
  seriesModel.value.series
    .filter((item) => item.mark === 'bar')
    .map((item) => ({ label: item.label, data: item.values })),
);
const lines = computed<ComboChartLineSeries[]>(() =>
  seriesModel.value.series
    .filter((item) => item.mark === 'line')
    .map((item) => ({ label: item.label, data: item.values })),
);
</script>

<template>
  <DsComboChart :categories="seriesModel.categories" :bars="bars" :lines="lines" :left-axis-label="props.leftAxisLabel"
    :right-axis-label="props.rightAxisLabel" :legend="props.legend" :hidden-series="props.hiddenSeries"
    :on-toggle-series="props.onToggleSeries" :annotations="props.annotations" :data-labels="props.dataLabels"
    :hover-key="props.hoverKey" :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey"
    :width="props.width" :height="props.height" :label="props.label" :class="props.class" />
</template>
