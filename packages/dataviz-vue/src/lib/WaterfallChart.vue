<script setup lang="ts">
import { computed } from 'vue';
import { WaterfallChart as DsWaterfallChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeWaterfallModel, toWaterfallData } from './partOfWholeData.js';
export type WaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  totalLabel?: string;
  connectors?: boolean;
  format?: (value: number) => string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'WaterfallChart' });
const props = withDefaults(defineProps<WaterfallChartProps>(), {
  totalLabel: undefined, connectors: true, format: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  const model = buildSafeWaterfallModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    measure: props.measure,
    totalLabel: props.totalLabel,
  });
  return toWaterfallData(model);
});
</script>

<template>
  <DsWaterfallChart :data="data" :label="props.label" :connectors="props.connectors" :format="props.format" :width="props.width" :height="props.height" :class="props.class" />
</template>
