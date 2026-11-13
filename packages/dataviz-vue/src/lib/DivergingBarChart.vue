<script setup lang="ts">
import { computed } from 'vue';
import {
  DivergentBarChart,
  type DivergentBarChartDatum,
} from '@sentropic/design-system-vue';
import {
  buildDivergingBarModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DivergingBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as diverging bar categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional fixed value-axis domain. Defaults to the core model domain. */
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  width?: number;
  height?: number;
  class?: string;
};

defineOptions({ name: 'DivergingBarChart' });
const props = withDefaults(defineProps<DivergingBarChartProps>(), {
  domain: undefined, format: undefined, showLegend: true, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const model = computed(() => {
  void state.value;
  const dim = findDimension(props.store.model, props.category);
  const m = findMeasure(props.store.model, props.measure);
  return dim && m
    ? buildDivergingBarModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        measure: props.measure,
      })
    : undefined;
});
const data = computed<DivergentBarChartDatum[]>(() =>
  model.value?.items.map((item) => ({ label: item.label, value: item.value, tone: item.direction })) ?? [],
);
const domain = computed(() => props.domain ?? model.value?.domain);
</script>

<template>
  <DivergentBarChart :data="data" :label="props.label" :width="props.width" :height="props.height" :domain="domain" :format="props.format" :show-legend="props.showLegend" :class="props.class" />
</template>
