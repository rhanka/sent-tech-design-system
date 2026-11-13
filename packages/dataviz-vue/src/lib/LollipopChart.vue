<script setup lang="ts">
import { computed } from 'vue';
import {
  LollipopChart as DsLollipopChart,
  type LollipopChartDatum,
  type LollipopChartTone,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalData,
} from './categoricalData.js';

export type LollipopChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: LollipopChartTone;
  orientation?: 'vertical' | 'horizontal';
  domain?: [number, number];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

defineOptions({ name: 'LollipopChart' });
const props = withDefaults(defineProps<LollipopChartProps>(), {
  tone: undefined, orientation: 'vertical', domain: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<LollipopChartDatum[]>(() => {
  void state.value;
  const seriesModel = buildSimpleCategoricalSeries(
    props.store.model,
    props.store.applyCrossfilter(props.viewId),
    props.category,
    props.measure,
  );
  return toSimpleCategoricalData(seriesModel).map((item) => props.tone ? { ...item, tone: props.tone } : item);
});
</script>

<template>
  <DsLollipopChart :data="data" :label="props.label" :orientation="props.orientation" :domain="props.domain"
    :width="props.width" :height="props.height" :class="props.class" />
</template>
