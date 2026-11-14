<script setup lang="ts">
import { computed } from 'vue';
import { ChordDiagram as DsChordDiagram } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel, toFlowData } from './partOfWholeData.js';

export type ChordChartProps = {
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

defineOptions({ name: 'ChordChart' });
const props = withDefaults(defineProps<ChordChartProps>(), {
  width: 480, height: 360, class: undefined,
});
const state = useDashboard(props.store);
const flow = computed(() => {
  void state.value;
  return toFlowData(
    buildSafeFlowModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
      source: props.source,
      target: props.target,
      measure: props.measure,
    }),
  );
});
</script>

<template>
  <DsChordDiagram :data="flow.data" :labels="flow.labels" :label="props.label" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
