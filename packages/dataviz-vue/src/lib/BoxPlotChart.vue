<script setup lang="ts">
import { computed } from 'vue';
import { BoxPlotChart as DsBoxPlotChart } from '@sentropic/design-system-vue';
import type { BoxPlotConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildBoxPlotData } from './distributionData.js';

export type BoxPlotChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BoxPlotConfig['value'];
  group?: BoxPlotConfig['group'];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'BoxPlotChart' });
const props = withDefaults(defineProps<BoxPlotChartProps>(), {
  viewId: undefined, group: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildBoxPlotData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    value: props.value,
    group: props.group,
  });
});
</script>

<template>
  <DsBoxPlotChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
