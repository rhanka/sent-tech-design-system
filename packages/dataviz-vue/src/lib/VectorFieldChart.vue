<script setup lang="ts">
import { computed } from 'vue';
import { VectorFieldChart as DsVectorFieldChart, type VectorFieldChartDatum as DsVectorFieldChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVectorFieldData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type VectorFieldChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  length: string;
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};
defineOptions({ name: 'VectorFieldChart' });
const props = withDefaults(defineProps<VectorFieldChartProps>(), {
  width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsVectorFieldChartDatum[]>(() => {
  void state.value;
  return buildVectorFieldData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    x: props.x,
    y: props.y,
    length: props.length,
    direction: props.direction,
  }) as DsVectorFieldChartDatum[];
});
</script>

<template>
  <DsVectorFieldChart :data="data" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>
