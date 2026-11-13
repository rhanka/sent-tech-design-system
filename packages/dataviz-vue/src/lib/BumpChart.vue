<script setup lang="ts">
import { computed } from 'vue';
import {
  BumpChart as DsBumpChart,
  type BumpChartSeries,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBumpModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type BumpChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension whose distinct values form the series (one line each). */
  series: string;
  /** Field id of the ordered dimension whose distinct values form the category axis (x). */
  category: string;
  /** Field id of the numeric measure used to rank series within each category. */
  measure: string;
  /**
   * Ranking direction.
   * - `'desc'` (default): rank 1 = highest measure value.
   * - `'asc'`: rank 1 = lowest measure value.
   */
  direction?: 'asc' | 'desc';
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

defineOptions({ name: 'BumpChart' });
const props = withDefaults(defineProps<BumpChartProps>(), {
  direction: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const bumpModel = computed(() => {
  void state.value;
  return buildBumpModel(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      series: props.series,
      category: props.category,
      measure: props.measure,
      direction: props.direction,
    },
  );
});
</script>

<template>
  <DsBumpChart :data="bumpModel.series as BumpChartSeries[]" :categories="bumpModel.categories" :label="props.label"
    :width="props.width" :height="props.height" :class="props.class" />
</template>
