<script setup lang="ts">
import { computed } from 'vue';
import { HeatmapChart as DsHeatmapChart } from '@sentropic/design-system-vue';
import type { DashboardStore, HeatmapConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildHeatmapData } from './distributionData.js';

export type HeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  x: HeatmapConfig['x'];
  y: HeatmapConfig['y'];
  measure: HeatmapConfig['measure'];
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'HeatmapChart' });
const props = withDefaults(defineProps<HeatmapChartProps>(), {
  viewId: undefined, legend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildHeatmapData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    x: props.x,
    y: props.y,
    measure: props.measure,
  });
});
</script>

<template>
  <DsHeatmapChart :data="data" :legend="props.legend" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
