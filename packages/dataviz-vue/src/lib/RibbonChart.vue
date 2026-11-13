<script setup lang="ts">
import { computed } from 'vue';
import {
  RibbonChart as DsRibbonChart,
  type RibbonChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildRibbonData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type RibbonChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  period: string;
  value: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

defineOptions({ name: 'RibbonChart' });
const props = withDefaults(defineProps<RibbonChartProps>(), {
  width: undefined, height: undefined, size: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<RibbonChartDatum[]>(() => {
  void state.value;
  return buildRibbonData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      category: props.category,
      period: props.period,
      value: props.value,
    },
  ) as RibbonChartDatum[];
});
</script>

<template>
  <DsRibbonChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :size="props.size" :class="props.class" />
</template>
