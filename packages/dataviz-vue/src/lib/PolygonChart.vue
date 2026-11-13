<script setup lang="ts">
import { computed } from 'vue';
import {
  PolygonChart as DsPolygonChart,
  type PolygonChartPoint,
  type PolygonChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildPolygonData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PolygonChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'PolygonChart' });
const props = withDefaults(defineProps<PolygonChartProps>(), {
  tone: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<PolygonChartPoint[]>(() => {
  void state.value;
  return buildPolygonData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { x: props.x, y: props.y },
  ) as PolygonChartPoint[];
});
</script>

<template>
  <DsPolygonChart :data="data" :label="props.label" :tone="props.tone as PolygonChartTone | undefined" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
