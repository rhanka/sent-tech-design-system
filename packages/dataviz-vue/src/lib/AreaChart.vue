<script setup lang="ts">
import { computed } from 'vue';
import {
  AreaChart as DsAreaChart,
  type AreaChartTone,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-vue';
import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
} from './categoricalData.js';

export type AreaChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: AreaChartTone;
  smooth?: boolean;
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

defineOptions({ name: 'AreaChart' });
const props = withDefaults(defineProps<AreaChartProps>(), {
  tone: undefined, smooth: false, width: undefined, height: undefined,
  annotations: undefined, dataLabels: undefined, hoverKey: undefined,
  onHoverKeyChange: undefined, onSelectKey: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const seriesModel = buildSimpleCategoricalSeries(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    props.category,
    props.measure,
  );
  return toSimpleCategoricalPoints(seriesModel);
});
</script>

<template>
  <DsAreaChart :data="data" :label="props.label" :tone="props.tone" :smooth="props.smooth"
    :width="props.width" :height="props.height" :annotations="props.annotations"
    :data-labels="props.dataLabels" :hover-key="props.hoverKey"
    :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey" :class="props.class" />
</template>
