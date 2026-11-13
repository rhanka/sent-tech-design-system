<script setup lang="ts">
import { computed } from 'vue';
import {
  ArcDiagramChart as DsArcDiagramChart,
  type ArcDiagramChartLink,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildArcDiagramData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ArcDiagramChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight: string;
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'ArcDiagramChart' });
const props = withDefaults(defineProps<ArcDiagramChartProps>(), {
  labels: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildArcDiagramData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { source: props.source, target: props.target, weight: props.weight },
  ) as ArcDiagramChartLink[];
});
</script>

<template>
  <DsArcDiagramChart :data="data" :labels="props.labels" :label="props.label" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
