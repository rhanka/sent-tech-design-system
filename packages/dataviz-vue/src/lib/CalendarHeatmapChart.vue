<script setup lang="ts">
import { computed } from 'vue';
import { CalendarHeatmapChart as DsCalendarHeatmapChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildCalendarHeatmapData } from './distributionData.js';

export type CalendarHeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: string;
  measure: string;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'CalendarHeatmapChart' });
const props = withDefaults(defineProps<CalendarHeatmapChartProps>(), {
  viewId: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildCalendarHeatmapData(props.store.model, props.store.applyCrossfilter(props.viewId), props.date, props.measure);
});
</script>

<template>
  <DsCalendarHeatmapChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
