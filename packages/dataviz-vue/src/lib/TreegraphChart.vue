<script setup lang="ts">
import { computed } from 'vue';
import { TreegraphChart as DsTreegraphChart, type TreegraphChartNode } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHierarchyData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type TreegraphChartProps = {
  store: DashboardStore;
  viewId: string;
  id_field: string;
  parent_field: string;
  label_field: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'TreegraphChart' });
const props = withDefaults(defineProps<TreegraphChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<TreegraphChartNode[]>(() => {
  void state.value;
  return buildHierarchyData(props.store.model, props.store.applyCrossfilter(props.viewId), { id: props.id_field, parentId: props.parent_field, label: props.label_field }) as TreegraphChartNode[];
});
</script>

<template>
  <DsTreegraphChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
