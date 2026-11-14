<script setup lang="ts">
import { computed } from 'vue';
import { RadarChart as DsRadarChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRadarModel, toRadarAxes, toRadarSeries } from './partOfWholeData.js';

export type RadarChartProps = {
  store: DashboardStore;
  viewId: string;
  axes: string[];
  series?: string;
  maxValue?: number;
  levels?: number;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'RadarChart' });
const props = withDefaults(defineProps<RadarChartProps>(), {
  series: undefined, maxValue: undefined, levels: undefined, legend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildSafeRadarModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    axes: props.axes,
    series: props.series,
  });
});
</script>

<template>
  <DsRadarChart :axes="toRadarAxes(model)" :series="toRadarSeries(model)" :max-value="props.maxValue"
    :levels="props.levels" :legend="props.legend" :width="props.width" :height="props.height"
    :label="props.label" :class="props.class" />
</template>
