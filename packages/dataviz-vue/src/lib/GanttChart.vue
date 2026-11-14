<script setup lang="ts">
import { computed } from 'vue';
import {
  GanttChart as DsGanttChart,
  type GanttChartTask,
} from '@sentropic/design-system-vue';
import { buildGanttData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type GanttChartProps = {
  store: DashboardStore;
  viewId: string;
  task: string;
  start: string;
  end: string;
  category?: string;
  width?: number;
  height?: number;
  marker?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'GanttChart' });
const props = withDefaults(defineProps<GanttChartProps>(), {
  category: undefined, width: undefined, height: undefined, marker: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<GanttChartTask[]>(() => {
  void state.value;
  return buildGanttData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      task: props.task,
      start: props.start,
      end: props.end,
      category: props.category,
    },
  ) as GanttChartTask[];
});
</script>

<template>
  <DsGanttChart :data="data" :label="props.label" :width="props.width" :height="props.height" :marker="props.marker" :class="props.class" />
</template>
