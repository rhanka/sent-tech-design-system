<script setup lang="ts">
import { computed } from 'vue';
import {
  OHLCChart as DsOHLCChart,
  type OHLCChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildOhlcData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OHLCChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  open: string;
  high: string;
  low: string;
  close: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'OHLCChart' });
const props = withDefaults(defineProps<OHLCChartProps>(), {
  width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<OHLCChartDatum[]>(() => {
  void state.value;
  return buildOhlcData(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    {
      label: props.label_field,
      open: props.open,
      high: props.high,
      low: props.low,
      close: props.close,
    },
  ) as OHLCChartDatum[];
});
</script>

<template>
  <DsOHLCChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>
