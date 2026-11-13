<script setup lang="ts">
import { computed } from 'vue';
import { StateTimelineChart as DsStateTimelineChart, type StateTimelineSeries } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStateTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type StateTimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  series: string;
  start: string;
  end: string;
  state: string;
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};
defineOptions({ name: 'StateTimelineChart' });
const props = withDefaults(defineProps<StateTimelineChartProps>(), {
  label: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<StateTimelineSeries[]>(() => {
  void state.value;
  return buildStateTimelineData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    series: props.series,
    start: props.start,
    end: props.end,
    state: props.state,
  }) as StateTimelineSeries[];
});
</script>

<template>
  <DsStateTimelineChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
