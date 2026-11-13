<script setup lang="ts">
import { computed } from 'vue';
import {
  CandlestickChart as DsCandlestickChart,
  type CandlestickChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCandlestickData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CandlestickChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

defineOptions({ name: 'CandlestickChart' });
const props = withDefaults(defineProps<CandlestickChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildCandlestickData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      label: props.label_field,
      open: props.open,
      high: props.high,
      low: props.low,
      close: props.close,
    },
  ) as CandlestickChartDatum[];
});
</script>

<template>
  <DsCandlestickChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
