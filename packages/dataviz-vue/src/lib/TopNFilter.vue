<script setup lang="ts">
import { ref, watch } from 'vue';
import { NumberInput } from '@sentropic/design-system-vue';
import { findMeasure, groupAggregate, type DashboardStore, type Row } from '@sentropic/dataviz-core';
export type TopNFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension to restrict to its top-N values. */
  dimension: string;
  /** Measure used to rank the dimension's values (descending). */
  measure: string;
  /** Initial N. Defaults to 5. */
  defaultN?: number;
  /** Field label of the number input. */
  label?: string;
  class?: string;
};
/**
 * Restricts a dimension to its top-N values by a measure (ranked over the full
 * dataset), via a design-system NumberInput. Applies on mount and on change.
 */
defineOptions({ name: 'TopNFilter' });
const props = withDefaults(defineProps<TopNFilterProps>(), {
  defaultN: 5, label: 'Top N', class: undefined,
});
const n = ref(props.defaultN);
function apply() {
  const m = findMeasure(props.store.model, props.measure);
  if (!m || !Number.isFinite(n.value) || n.value < 1) return;
  const ranked = groupAggregate([...(props.store.data as readonly Row[])], props.dimension, m)
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, n.value)
    .map((r) => r.key);
  props.store.setFilter(props.dimension, { kind: 'include', values: ranked });
}
watch([n, () => props.store, () => props.dimension, () => props.measure], apply, { immediate: true });
function onUpdate(v: number | null) {
  const num = Number(v);
  if (Number.isFinite(num)) n.value = num;
}
</script>

<template>
  <NumberInput :label="props.label" :model-value="n" :min="1" :step="1" :class="props.class" @update:model-value="onUpdate" />
</template>
