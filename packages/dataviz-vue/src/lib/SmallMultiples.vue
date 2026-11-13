<script setup lang="ts">
import { computed } from 'vue';
import { BarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-vue';
import { findDimension, findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type SmallMultiplesProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id in the cross-filter graph. */
  viewId: string;
  /** Dimension whose distinct values each produce one facet (panel). */
  facetBy: string;
  /** Dimension to group rows by inside each facet (bar categories). */
  dimension: string;
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label; each facet chart is "<label> — <facet key>". */
  label: string;
  /** Number of grid columns (design-system Grid). Defaults to 2. */
  columns?: number;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  class?: string;
};
defineOptions({ name: 'SmallMultiples' });
const props = withDefaults(defineProps<SmallMultiplesProps>(), { columns: 2, tone: undefined, class: undefined });
const state = useDashboard(props.store);
const keyOf = (value: unknown) => value == null ? 'null' : String(value);
const model = computed(() => {
  void state.value;
  const facet = findDimension(props.store.model, props.facetBy);
  const dimension = findDimension(props.store.model, props.dimension);
  const measure = findMeasure(props.store.model, props.measure);
  let panels: { key: string; data: BarChartDatum[] }[] = [];
  let domain: [number, number] | undefined;
  if (facet && dimension && measure) {
    const rows = props.store.applyCrossfilter(props.viewId);
    const keys = [...new Set(rows.map(row => keyOf(row[props.facetBy])))];
    let min = 0;
    let max = 0;
    panels = keys.map(key => {
      const data = groupAggregate(rows.filter(row => keyOf(row[props.facetBy]) === key), props.dimension, measure)
        .map(({ key: label, value }) => {
          if (value < min) min = value;
          if (value > max) max = value;
          return props.tone ? { label, value, tone: props.tone } : { label, value };
        });
      return { key, data };
    });
    domain = panels.length ? [min, max] : undefined;
  }
  return { panels, domain };
});
const style = computed(() => ({ display: 'grid', gridTemplateColumns: props.columns == null ? undefined : 'repeat(' + Math.max(1, Math.round(props.columns)) + ', minmax(0, 1fr))', gap: 'var(--st-spacing-4, 1rem)' }));
</script>

<template>
  <div :class="['st-grid', props.class].filter(Boolean).join(' ')" :style="style" role="group" :aria-label="props.label">
    <BarChart v-for="panel in model.panels" :key="panel.key" :data="panel.data" :label="props.label + ' — ' + panel.key" :domain="model.domain" />
  </div>
</template>
