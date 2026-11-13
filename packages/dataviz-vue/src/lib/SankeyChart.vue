<script setup lang="ts">
import { computed } from 'vue';
import { SankeyChart as DsSankeyChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel } from './partOfWholeData.js';

export type SankeyChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'SankeyChart' });
const props = withDefaults(defineProps<SankeyChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  return buildSafeFlowModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    source: props.source,
    target: props.target,
    measure: props.measure,
  });
});
</script>

<template>
  <DsSankeyChart :nodes="model.nodes" :links="model.links" :label="props.label" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
