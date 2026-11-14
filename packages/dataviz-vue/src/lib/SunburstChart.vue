<script setup lang="ts">
import { computed } from 'vue';
import { SunburstChart as DsSunburstChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeHierarchy, toHierarchyDatum } from './partOfWholeData.js';
export type SunburstChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'SunburstChart' });
const props = withDefaults(defineProps<SunburstChartProps>(), {
  legend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const model = buildSafePartWholeHierarchy(props.store.model, props.store.applyCrossfilter(props.viewId), {
    hierarchy: props.hierarchy,
    measure: props.measure,
  });
  return toHierarchyDatum(model);
});
</script>

<template>
  <DsSunburstChart :data="data" :label="props.label" :legend="props.legend" :width="props.width" :height="props.height" :class="props.class" />
</template>
