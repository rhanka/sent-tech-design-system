<script setup lang="ts">
import { computed } from 'vue';
import { BarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-vue';
import { findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type DrillBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; bars group by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  class?: string;
};
defineOptions({ name: 'DrillBarChart' });
const props = withDefaults(defineProps<DrillBarChartProps>(), {
  tone: undefined, orientation: 'vertical', width: undefined, height: undefined, class: undefined,
});
const state = useDashboard(props.store);
const level = computed(() => Math.min((state.value.drill[props.viewId] ?? []).length, Math.max(props.hierarchy.length - 1, 0)));
const currentDim = computed(() => props.hierarchy[level.value]);
const canDrill = computed(() => level.value < props.hierarchy.length - 1);
const data = computed<BarChartDatum[]>(() => {
  void state.value;
  const measure = findMeasure(props.store.model, props.measure);
  return measure && currentDim.value ? groupAggregate(props.store.applyCrossfilter(props.viewId), currentDim.value, measure)
    .map(({ key, value }) => props.tone ? { label: key, value, tone: props.tone } : { label: key, value }) : [];
});
const selectedKeys = computed(() => canDrill.value ? [] : (state.value.selections[props.viewId] ?? []));
function onSelect(key: string) {
  if (canDrill.value) {
    props.store.setFilter(currentDim.value, { kind: 'include', values: [key] });
    props.store.drillDown(props.viewId, props.hierarchy[level.value + 1]);
  } else props.store.toggleSelection(props.viewId, key);
}
</script>

<template>
  <BarChart :data="data" :label="props.label" :orientation="props.orientation" :width="props.width" :height="props.height"
    :class="props.class" :selected-keys="selectedKeys" :on-select="onSelect" />
</template>
