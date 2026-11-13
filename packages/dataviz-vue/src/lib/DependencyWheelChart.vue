<script setup lang="ts">
import { computed } from 'vue';
import {
  DependencyWheelChart as DsDependencyWheelChart,
  type DependencyWheelChartLink,
} from '@sentropic/design-system-vue';
import { buildDependencyWheelData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DependencyWheelChartProps = {
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

defineOptions({ name: 'DependencyWheelChart' });
const props = withDefaults(defineProps<DependencyWheelChartProps>(), {
  labels: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DependencyWheelChartLink[]>(() => {
  void state.value;
  return buildDependencyWheelData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { source: props.source, target: props.target, weight: props.weight },
  ) as DependencyWheelChartLink[];
});
</script>

<template>
  <DsDependencyWheelChart :data="data" :labels="props.labels" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
