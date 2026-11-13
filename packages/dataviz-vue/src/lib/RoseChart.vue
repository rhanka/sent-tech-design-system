<script setup lang="ts">
import { computed } from 'vue';
import { RoseChart as DsRoseChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRoseModel, toRoseData } from './partOfWholeData.js';

export type RoseChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'RoseChart' });
const props = withDefaults(defineProps<RoseChartProps>(), {
  width: 360, height: 360, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return toRoseData(
    buildSafeRoseModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
      category: props.category,
      measure: props.measure,
    }),
  );
});
</script>

<template>
  <DsRoseChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>
