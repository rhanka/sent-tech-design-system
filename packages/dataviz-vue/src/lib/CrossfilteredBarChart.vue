<script setup lang="ts">
import { computed } from 'vue';
import { BarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-vue';
import { findDimension, findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type CrossfilteredBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id to group rows by (one bar per distinct value). */
  dimension: string;
  /** Measure id to aggregate into each bar's value. */
  measure: string;
  /** Accessible label of the chart (required by the design-system BarChart). */
  label: string;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  /**
   * When true (default) clicking a bar toggles this view's selection (brushing
   * input → `store.toggleSelection`); selected bars are highlighted. Set false
   * for an output-only facet.
   */
  selectable?: boolean;
  /** Fixed value-axis domain `[min, max]` for a shared scale across facets. */
  domain?: [number, number];
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};
defineOptions({ name: 'CrossfilteredBarChart' });
const props = withDefaults(defineProps<CrossfilteredBarChartProps>(), {
  tone: undefined, selectable: true, domain: undefined, orientation: 'vertical', width: undefined, height: undefined,
  hoverKey: undefined, onHoverKeyChange: undefined, onSelectKey: undefined, class: undefined,
});
const state = useDashboard(props.store);
const data = computed<BarChartDatum[]>(() => {
  void state.value;
  const dim = findDimension(props.store.model, props.dimension);
  const measure = findMeasure(props.store.model, props.measure);
  return dim && measure ? groupAggregate(props.store.applyCrossfilter(props.viewId), props.dimension, measure)
    .map(({ key, value }) => props.tone ? { label: key, value, tone: props.tone } : { label: key, value }) : [];
});
const selectedKeys = computed(() => props.selectable ? (state.value.selections[props.viewId] ?? []) : []);
const onSelect = computed(() => props.selectable ? (key: string) => props.store.toggleSelection(props.viewId, key) : undefined);
</script>

<template>
  <BarChart :data="data" :label="props.label" :orientation="props.orientation" :width="props.width" :height="props.height"
    :domain="props.domain" :class="props.class" :selected-keys="selectedKeys" :on-select="onSelect"
    :hover-key="props.hoverKey" :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey" />
</template>
