<script setup lang="ts">
import { computed } from 'vue';
import { WindBarbChart as DsWindBarbChart, type WindBarbChartDatum as DsWindBarbChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildWindBarbData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type WindBarbChartProps = {
  store: DashboardStore;
  viewId: string;
  at: string;
  speed: string;
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};
defineOptions({ name: 'WindBarbChart' });
const props = withDefaults(defineProps<WindBarbChartProps>(), {
  width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DsWindBarbChartDatum[]>(() => {
  void state.value;
  return buildWindBarbData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    at: props.at,
    speed: props.speed,
    direction: props.direction,
  }) as DsWindBarbChartDatum[];
});
</script>

<template>
  <DsWindBarbChart :data="data" :label="props.label" :width="props.width" :height="props.height" :size="props.size" :class="props.class" />
</template>
