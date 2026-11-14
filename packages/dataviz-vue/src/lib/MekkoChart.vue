<script setup lang="ts">
import { computed } from 'vue';
import { MarimekkoChart as DsMarimekkoChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeMekkoModel, toMarimekkoData } from './partOfWholeData.js';

export type MekkoChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'MekkoChart' });
const props = withDefaults(defineProps<MekkoChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const model = buildSafeMekkoModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    series: props.series,
    measure: props.measure,
  });
  return toMarimekkoData(model);
});
</script>

<template>
  <DsMarimekkoChart :data="data" :width="props.width" :height="props.height"
    :label="props.label" :class="props.class" />
</template>
