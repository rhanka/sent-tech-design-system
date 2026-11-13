<script setup lang="ts">
import { computed } from 'vue';
import {
  ContourChart as DsContourChart,
  type ContourChartDatum as DsContourChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildContourData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ContourChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  value: string;
  levels?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'ContourChart' });
const props = withDefaults(defineProps<ContourChartProps>(), {
  levels: undefined, width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildContourData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      x: props.x,
      y: props.y,
      value: props.value,
    },
  ) as DsContourChartDatum[];
});
</script>

<template>
  <DsContourChart :data="data" :levels="props.levels" :label="props.label" :width="props.width"
    :height="props.height" :size="props.size" :class="props.class" />
</template>
