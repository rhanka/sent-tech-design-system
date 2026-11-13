<script setup lang="ts">
import { computed } from 'vue';
import {
  Density2DChart as DsDensity2DChart,
  type Density2DPoint as DsDensity2DPoint,
} from '@sentropic/design-system-vue';
import { buildDensity2DData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type Density2DChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  weight?: string;
  bins?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'Density2DChart' });
const props = withDefaults(defineProps<Density2DChartProps>(), {
  weight: undefined, bins: undefined, width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsDensity2DPoint[]>(() => {
  void state.value;
  return buildDensity2DData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      x: props.x,
      y: props.y,
      weight: props.weight,
    },
  ) as DsDensity2DPoint[];
});
const bins = computed(() => props.bins);
</script>

<template>
  <DsDensity2DChart :data="data" :bins="bins" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>
