<script setup lang="ts">
import { computed } from 'vue';
import { StreamgraphChart as DsStreamgraphChart, type StreamgraphChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStreamgraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type StreamgraphChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'StreamgraphChart' });
const props = withDefaults(defineProps<StreamgraphChartProps>(), {
  tone: undefined, smooth: undefined, showLegend: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<StreamgraphChartDatum[]>(() => {
  void state.value;
  return buildStreamgraphData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    label: props.series,
    value: props.measure,
    tone: props.tone,
  }) as StreamgraphChartDatum[];
});
</script>

<template>
  <DsStreamgraphChart :data="data" :label="props.label" :smooth="props.smooth" :show-legend="props.showLegend" :width="props.width" :height="props.height" :class="props.class" />
</template>
