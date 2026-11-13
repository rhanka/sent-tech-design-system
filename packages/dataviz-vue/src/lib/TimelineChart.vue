<script setup lang="ts">
import { computed } from 'vue';
import { TimelineChart as DsTimelineChart, type TimelineChartEvent } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type TimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  position: string;
  description?: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
defineOptions({ name: 'TimelineChart' });
const props = withDefaults(defineProps<TimelineChartProps>(), {
  description: undefined, tone: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<TimelineChartEvent[]>(() => {
  void state.value;
  return buildTimelineData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    label: props.label_field,
    position: props.position,
    description: props.description,
    tone: props.tone,
  }) as TimelineChartEvent[];
});
</script>

<template>
  <DsTimelineChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
