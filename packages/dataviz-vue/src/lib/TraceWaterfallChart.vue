<script setup lang="ts">
import { computed } from 'vue';
import { TraceWaterfallChart as DsTraceWaterfallChart, type TraceSpan } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTraceWaterfallData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type TraceWaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  spanId: string;
  parentSpanId: string;
  service: string;
  start: string;
  duration: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};
defineOptions({ name: 'TraceWaterfallChart' });
const props = withDefaults(defineProps<TraceWaterfallChartProps>(), {
  width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildTraceWaterfallData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    spanId: props.spanId,
    parentSpanId: props.parentSpanId,
    service: props.service,
    start: props.start,
    duration: props.duration,
  }) as { spans: TraceSpan[] };
});
</script>

<template>
  <DsTraceWaterfallChart :data="data" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>
