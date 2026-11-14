<script setup lang="ts">
import { computed } from 'vue';
import { BulletChart as DsBulletChart } from '@sentropic/design-system-vue';
import type { BulletChartConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildBulletData } from './distributionData.js';

export type BulletChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BulletChartConfig['value'];
  target: BulletChartConfig['target'];
  category?: BulletChartConfig['category'];
  ranges?: BulletChartConfig['ranges'];
  label: string;
  orientation?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'BulletChart' });
const props = withDefaults(defineProps<BulletChartProps>(), {
  viewId: undefined, category: undefined, ranges: undefined, orientation: undefined,
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildBulletData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    value: props.value,
    target: props.target,
    category: props.category,
    ranges: props.ranges,
    label: props.label,
  });
});
</script>

<template>
  <DsBulletChart :data="data" :label="props.label" :orientation="props.orientation" :width="props.width"
    :height="props.height" :class="props.class" />
</template>
