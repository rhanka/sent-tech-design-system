<script setup lang="ts">
import { computed } from 'vue';
import {
  ParallelCoordinatesChart as DsParallelCoordinatesChart,
  type ParallelAxis,
  type ParallelCoordinatesChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildParallelCoordinatesModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ParallelCoordinatesChartProps = {
  store: DashboardStore;
  viewId: string;
  /** List of measure field ids that become the parallel axes (left to right). */
  measures: string[];
  /** Optional dimension field id used to assign a tone per row. */
  series?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

defineOptions({ name: 'ParallelCoordinatesChart' });
const props = withDefaults(defineProps<ParallelCoordinatesChartProps>(), {
  series: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const pcModel = computed(() => {
  void state.value;
  return buildParallelCoordinatesModel(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      measures: props.measures,
      series: props.series,
    },
  );
});
</script>

<template>
  <DsParallelCoordinatesChart :axes="pcModel.axes as ParallelAxis[]" :data="pcModel.data"
    :tones="pcModel.tones as ParallelCoordinatesChartTone[] | undefined"
    :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
