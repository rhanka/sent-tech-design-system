<script setup lang="ts">
import { computed } from 'vue';
import {
  DumbbellChart as DsDumbbellChart,
  type DumbbellChartDatum,
  type DumbbellChartTone,
} from '@sentropic/design-system-vue';
import { buildColumnRangeData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DumbbellChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  low: string;
  high: string;
  lowTone?: string;
  highTone?: string;
  lowLabel?: string;
  highLabel?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'DumbbellChart' });
const props = withDefaults(defineProps<DumbbellChartProps>(), {
  lowTone: undefined, highTone: undefined, lowLabel: undefined, highLabel: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<DumbbellChartDatum[]>(() => {
  void state.value;
  return buildColumnRangeData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    { category: props.category, low: props.low, high: props.high },
  ) as DumbbellChartDatum[];
});
</script>

<template>
  <DsDumbbellChart :data="data" :label="props.label" :low-tone="(props.lowTone as DumbbellChartTone | undefined)" :high-tone="(props.highTone as DumbbellChartTone | undefined)" :low-label="props.lowLabel" :high-label="props.highLabel" :width="props.width" :height="props.height" :class="props.class" />
</template>
