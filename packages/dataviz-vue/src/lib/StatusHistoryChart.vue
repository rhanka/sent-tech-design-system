<script setup lang="ts">
import { computed } from 'vue';
import { StatusHistoryChart as DsStatusHistoryChart, type StatusHistorySeries } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStatusHistoryData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type StatusHistoryChartProps = {
  store: DashboardStore;
  viewId: string;
  series: string;
  at: string;
  value: string;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};
defineOptions({ name: 'StatusHistoryChart' });
const props = withDefaults(defineProps<StatusHistoryChartProps>(), {
  label: undefined, width: undefined, height: undefined, size: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<StatusHistorySeries[]>(() => {
  void state.value;
  return buildStatusHistoryData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    series: props.series,
    at: props.at,
    value: props.value,
  }) as StatusHistorySeries[];
});
</script>

<template>
  <DsStatusHistoryChart :data="data" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>
