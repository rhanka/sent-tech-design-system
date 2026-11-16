<script setup lang="ts">
import { computed } from 'vue';
import { CheckboxGroup, type CheckboxGroupOption } from '@sentropic/design-system-vue';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
export type ValueSlicerProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension whose distinct values become the slicer's checkboxes. */
  dimension: string;
  /** Legend; defaults to the dimension label. */
  legend?: string;
  orientation?: 'vertical' | 'horizontal';
  class?: string;
};
const keyOf = (v: unknown) => (v == null ? 'null' : String(v));
/**
 * A checkbox slicer over a dimension's distinct values: checked values become an
 * `include` filter (an OR within the dimension). Design-system CheckboxGroup.
 */
defineOptions({ name: 'ValueSlicer' });
const props = withDefaults(defineProps<ValueSlicerProps>(), {
  legend: undefined, orientation: 'vertical', class: undefined,
});
const state = useDashboard(props.store);
const resolvedLegend = computed(() => props.legend ?? findDimension(props.store.model, props.dimension)?.label ?? props.dimension);
const options = computed<CheckboxGroupOption[]>(() => {
  void state.value;
  const seen = new Set<string>();
  const list: CheckboxGroupOption[] = [];
  for (const row of props.store.data) {
    const k = keyOf(row[props.dimension]);
    if (!seen.has(k)) {
      seen.add(k);
      list.push({ label: k, value: k });
    }
  }
  return list;
});
const value = computed<string[]>(() => {
  const f = state.value.filters[props.dimension];
  return f && f.kind === 'include' ? [...f.values] : [];
});
function onChange(values: string[]) {
  if (values.length) props.store.setFilter(props.dimension, { kind: 'include', values });
  else props.store.clearFilter(props.dimension);
}
</script>

<template>
  <CheckboxGroup :legend="resolvedLegend" :options="options" :value="value" :orientation="props.orientation" :class="props.class" @change="onChange" />
</template>
