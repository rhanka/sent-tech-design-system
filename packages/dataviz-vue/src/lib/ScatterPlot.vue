<script setup lang="ts">
import { computed } from 'vue';
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildScatterModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScatterPlotProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  series?: string;
  labelField?: string;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ScatterPlot' });
const props = withDefaults(defineProps<ScatterPlotProps>(), {
  series: undefined, labelField: undefined, width: undefined, height: undefined, radius: undefined, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildScatterModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    x: props.x,
    y: props.y,
    series: props.series,
    labelField: props.labelField,
  });
});
</script>

<template>
  <DsScatterPlot :data="model.data as ScatterPlotDatum[]" :x-label="model.xLabel" :y-label="model.yLabel"
    :width="props.width" :height="props.height" :radius="props.radius" :label="props.label"
    :class="props.class" />
</template>
