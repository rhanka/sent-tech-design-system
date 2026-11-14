<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { ScatterPlot } from '@sentropic/design-system-vue';
import { useDashboard } from '../adapter.js';
import { buildClusterScatterData } from './analyticsDsData.js';

export type AnalyticsClusterPlotProps = {
  store: DashboardStore;
  viewId: string;
  fields: string[];
  k: number;
  maxIterations?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'AnalyticsClusterPlot' });
const props = withDefaults(defineProps<AnalyticsClusterPlotProps>(), {
  maxIterations: undefined, width: 360, height: 240, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildClusterScatterData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    fields: props.fields,
    k: props.k,
    maxIterations: props.maxIterations,
  });
});
</script>

<template>
  <ScatterPlot :data="model.data" :centroids="model.centroids" :x-label="model.xLabel" :y-label="model.yLabel"
    :width="props.width" :height="props.height" :label="props.label"
    :class="['st-analyticsClusterPlot', props.class].filter(Boolean).join(' ')" />
</template>
