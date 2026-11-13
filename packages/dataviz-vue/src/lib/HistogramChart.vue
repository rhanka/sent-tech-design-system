<script setup lang="ts">
import { computed } from 'vue';
import { HistogramChart as DsHistogramChart } from '@sentropic/design-system-vue';
import type { DashboardStore, HistogramConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildHistogramData } from './distributionData.js';

export type HistogramChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: HistogramConfig['value'];
  bins?: HistogramConfig['bins'];
  domain?: HistogramConfig['domain'];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'HistogramChart' });
const props = withDefaults(defineProps<HistogramChartProps>(), {
  viewId: undefined, bins: undefined, domain: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed(() => {
  void state.value;
  return buildHistogramData(props.store.model, props.store.applyCrossfilter(props.viewId), {
    value: props.value,
    bins: props.bins,
    domain: props.domain,
  });
});
</script>

<template>
  <DsHistogramChart :data="data" :bins="props.bins" :label="props.label" :width="props.width" :height="props.height" :class="props.class" />
</template>
