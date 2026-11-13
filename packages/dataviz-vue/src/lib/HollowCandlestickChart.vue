<script setup lang="ts">
import { computed } from 'vue';
import {
  HollowCandlestickChart as DsHollowCandlestickChart,
  type HollowCandlestickChartDatum,
} from '@sentropic/design-system-vue';
import { buildCandlestickData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type HollowCandlestickChartProps = {
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

defineOptions({ name: 'HollowCandlestickChart' });
const props = withDefaults(defineProps<HollowCandlestickChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<HollowCandlestickChartDatum[]>(() => {
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
  ) as HollowCandlestickChartDatum[];
});
</script>

<template>
  <DsHollowCandlestickChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
