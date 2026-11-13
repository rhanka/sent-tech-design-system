<script setup lang="ts">
import { computed } from 'vue';
import {
  HLCChart as DsHLCChart,
  type HLCChartDatum,
} from '@sentropic/design-system-vue';
import { buildHlcData, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type HLCChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
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

defineOptions({ name: 'HLCChart' });
const props = withDefaults(defineProps<HLCChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<HLCChartDatum[]>(() => {
  void state.value;
  return buildHlcData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      label: props.label_field,
      high: props.high,
      low: props.low,
      close: props.close,
    },
  ) as HLCChartDatum[];
});
</script>

<template>
  <DsHLCChart :data="data" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
