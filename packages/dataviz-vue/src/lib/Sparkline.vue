<script setup lang="ts">
import { computed } from 'vue';
import { Sparkline as DsSparkline } from '@sentropic/design-system-vue';
import type { SparklineTone } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';
export type { SparklineTone };
export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  width?: number;
  height?: number;
  label?: string;
  class?: string;
};
defineOptions({ name: 'Sparkline' });
const props = withDefaults(defineProps<SparklineProps>(), {
  tone: undefined, strokeWidth: undefined, area: undefined, width: undefined, height: undefined, label: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<number[]>(() => {
  void state.value;
  const seriesModel = buildSimpleCategoricalSeries(props.store.model, props.store.applyCrossfilter(props.viewId), props.dimension, props.measure);
  return seriesModel.series[0]?.values ?? [];
});
</script>

<template>
  <DsSparkline :data="data" :tone="props.tone" :stroke-width="props.strokeWidth" :area="props.area" :width="props.width" :height="props.height" :label="props.label" :class="props.class" />
</template>
