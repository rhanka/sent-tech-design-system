<script setup lang="ts">
import { computed } from 'vue';
import { ViolinChart as DsViolinChart, type ViolinChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildViolinModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type ViolinChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension used to split data into groups (one violin per group). */
  groupBy: string;
  /** Field id whose numeric values form the distribution for each group. */
  measure: string;
  /** Number of density bins (optional; DS default is 20). */
  bins?: number;
  /** Whether to overlay median / quartile markers (optional; DS default is true). */
  quartiles?: boolean;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};
defineOptions({ name: 'ViolinChart' });
const props = withDefaults(defineProps<ViolinChartProps>(), {
  bins: undefined, quartiles: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildViolinModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    groupBy: props.groupBy,
    measure: props.measure,
    bins: props.bins,
    quartiles: props.quartiles,
  });
});
const data = computed<ViolinChartDatum[]>(() => model.value.data as ViolinChartDatum[]);
</script>

<template>
  <DsViolinChart :data="data" :bins="model.bins" :quartiles="model.quartiles" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
