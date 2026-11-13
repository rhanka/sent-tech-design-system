<script setup lang="ts">
import { computed } from 'vue';
import { buildTrendLineModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
export type TrendLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};
defineOptions({ name: 'TrendLineChart' });
const props = withDefaults(defineProps<TrendLineChartProps>(), {
  width: 360, height: 220, annotations: undefined, dataLabels: undefined, hoverKey: undefined, onHoverKeyChange: undefined, onSelectKey: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<LineChartDatum[]>(() => {
  void state.value;
  const model = buildTrendLineModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    x: props.x,
    y: props.y,
  });
  return model.points.map((point) => ({ x: point.x, y: point.y }));
});
</script>

<template>
  <LineChart :data="data" :width="props.width" :height="props.height" :label="props.label" :annotations="props.annotations" :data-labels="props.dataLabels" :trend="true" :hover-key="props.hoverKey" @hover-key-change="props.onHoverKeyChange" @select-key="props.onSelectKey" :class="['st-trendLineChart', props.class].filter(Boolean).join(' ')" />
</template>
