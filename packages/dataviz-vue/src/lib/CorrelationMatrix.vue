<script setup lang="ts">
import { computed } from 'vue';
import { HeatmapChart as DsHeatmapChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCorrelationMatrix } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CorrelationMatrixProps = {
  store: DashboardStore;
  viewId?: string;
  measures: string[];
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'CorrelationMatrix' });
const props = withDefaults(defineProps<CorrelationMatrixProps>(), {
  viewId: undefined, legend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildCorrelationMatrix(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { measures: props.measures },
  );
});
</script>

<template>
  <DsHeatmapChart :data="data" :legend="props.legend" :label="props.label" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
