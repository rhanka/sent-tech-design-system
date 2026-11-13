<script setup lang="ts">
import { computed } from 'vue';
import { ForceGraph as DsForceGraph } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildForceGraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type ForceGraphProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight?: string;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};
defineOptions({ name: 'ForceGraph' });
const props = withDefaults(defineProps<ForceGraphProps>(), {
  weight: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const graph = computed(() => {
  void state.value;
  return buildForceGraphData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    source: props.source,
    target: props.target,
    weight: props.weight,
  });
});
</script>

<template>
  <DsForceGraph :nodes="graph.nodes" :edges="graph.edges" :label="props.label" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
