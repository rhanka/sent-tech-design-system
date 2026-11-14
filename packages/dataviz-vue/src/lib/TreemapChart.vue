<script setup lang="ts">
import { computed } from 'vue';
import { TreemapChart as DsTreemapChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeHierarchy, toTreemapData } from './partOfWholeData.js';
export type TreemapChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  showLabels?: boolean;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'TreemapChart' });
const props = withDefaults(defineProps<TreemapChartProps>(), {
  showLabels: true, legend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const model = buildSafePartWholeHierarchy(props.store.model, props.store.applyCrossfilter(props.viewId), {
    hierarchy: props.hierarchy,
    measure: props.measure,
  });
  return toTreemapData(model);
});
</script>

<template>
  <DsTreemapChart :data="data" :label="props.label" :show-labels="props.showLabels" :legend="props.legend" :width="props.width" :height="props.height" :class="props.class" />
</template>
