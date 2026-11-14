<script setup lang="ts">
import { computed } from 'vue';
import { Button, Inline, type BarChartTone } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { drillLevel, onDrillSelect } from './drill.js';
import DrillBarChart from './DrillBarChart.vue';
import DonutChart from './DonutChart.vue';
import TreemapChart from './TreemapChart.vue';

/** Which design-system chart renders the current drill level. */
export type DrillChartKind = 'bar' | 'donut' | 'treemap';

export type DrillChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; the chart groups by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each datum's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Design-system chart to render for the current level. Defaults to `'bar'`. */
  kind?: DrillChartKind;
  /** Bar tone (only used by `kind="bar"`). */
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  /** Donut diameter (only used by `kind="donut"`). */
  size?: number;
  /** Donut ring thickness (only used by `kind="donut"`). */
  thickness?: number;
  class?: string;
};

defineOptions({ name: 'DrillChart' });
const props = withDefaults(defineProps<DrillChartProps>(), {
  kind: 'bar', tone: undefined, orientation: 'vertical', width: undefined, height: undefined, size: undefined, thickness: undefined, class: undefined,
});
const state = useDashboard(props.store);
const level = computed(() => {
  void state.value;
  return drillLevel(props.store, props.viewId, props.hierarchy, props.measure);
});
const selectedKeys = computed(() => state.value.selections[props.viewId] ?? []);
function select(key: string) {
  onDrillSelect(props.store, props.viewId, props.hierarchy, key);
}
const isBar = computed(() => props.kind === 'bar');
const isDonut = computed(() => props.kind === 'donut');
function variantFor(key: string) {
  return !level.value.canDrill && selectedKeys.value.includes(key) ? 'primary' : 'ghost';
}
</script>

<template>
  <DrillBarChart v-if="isBar" :store="props.store" :view-id="props.viewId" :hierarchy="props.hierarchy" :measure="props.measure" :label="props.label" :tone="props.tone" :orientation="props.orientation" :width="props.width" :height="props.height" :class="props.class" />
  <Inline v-else :gap="2" :class="props.class">
    <DonutChart v-if="isDonut" :store="props.store" :view-id="props.viewId" :category="level.dimension ?? props.hierarchy[0]" :measure="props.measure" :label="props.label" :size="props.size" :thickness="props.thickness" />
    <TreemapChart v-else :store="props.store" :view-id="props.viewId" :hierarchy="level.dimension ? [level.dimension] : props.hierarchy" :measure="props.measure" :label="props.label" :width="props.width" :height="props.height" />
    <Inline :gap="1" role="group" :aria-label="`${props.label} — ${level.canDrill ? 'drill' : 'select'}`">
      <Button v-for="datum in level.data" :key="datum.key" :variant="variantFor(datum.key)" @click="select(datum.key)">{{ `${datum.key}: ${datum.value}` }}</Button>
    </Inline>
  </Inline>
</template>
