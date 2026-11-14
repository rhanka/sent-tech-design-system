<script setup lang="ts">
import { computed } from 'vue';
import {
  ParetoChart as DsParetoChart,
  type ParetoChartDatum,
  type ParetoChartTone,
} from '@sentropic/design-system-vue';
import {
  buildParetoModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ParetoChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as Pareto categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional design-system tone applied to every Pareto bar. */
  tone?: ParetoChartTone;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * Cross-filter-aware Pareto chart built from the core Pareto model and rendered
 * by the design-system chart component.
 */
defineOptions({ name: 'ParetoChart' });
const props = withDefaults(defineProps<ParetoChartProps>(), {
  tone: undefined, width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<ParetoChartDatum[]>(() => {
  void state.value;
  const dim = findDimension(props.store.model, props.category);
  const m = findMeasure(props.store.model, props.measure);
  if (!(dim && m)) return [];
  return buildParetoModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
    category: props.category,
    measure: props.measure,
  }).items.map((item) => props.tone
    ? { label: item.label, value: item.value, tone: props.tone }
    : { label: item.label, value: item.value });
});
</script>

<template>
  <DsParetoChart :data="data" :label="props.label" :width="props.width" :height="props.height"
    :class="props.class" />
</template>
