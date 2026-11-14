<script setup lang="ts">
import { computed } from 'vue';
import {
  DecompositionTreeChart as DsDecompositionTreeChart,
  type DecompositionTreeData,
} from '@sentropic/design-system-vue';
import { buildDecompositionTreeData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DecompositionTreeChartProps = {
  store: DashboardStore;
  viewId: string;
  measure: string;
  levels: string[];
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'DecompositionTreeChart' });
const props = withDefaults(defineProps<DecompositionTreeChartProps>(), {
  width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DecompositionTreeData>(() => {
  void state.value;
  return buildDecompositionTreeData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      measure: props.measure,
      levels: props.levels,
    },
  ) as DecompositionTreeData;
});
</script>

<template>
  <DsDecompositionTreeChart :data="data" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>
