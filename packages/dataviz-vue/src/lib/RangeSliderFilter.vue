<script lang="ts">
import type { FilterSpec, Row } from '@sentropic/dataviz-core';

export type NumericDomain = { min: number; max: number };

/**
 * Pure: the numeric `[min, max]` domain of a dimension across rows (finite
 * values only). Returns `{ min: 0, max: 0 }` when no finite value is present.
 */
export function numericDomain(data: readonly Row[], dimension: string): NumericDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const v = row[dimension];
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

/**
 * Pure: the two range-slider handles → a core `range` FilterSpec (bounds
 * normalized so `lo <= hi`), or `null` when they span the whole domain.
 */
export function rangeBoundsToSpec(lower: number, upper: number, domain: NumericDomain): FilterSpec | null {
  const lo = Math.min(lower, upper);
  const hi = Math.max(lower, upper);
  if (lo <= domain.min && hi >= domain.max) return null;
  return { kind: 'range', min: lo, max: hi };
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RangeSlider } from '@sentropic/design-system-vue';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';

export type RangeSliderFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Continuous numeric dimension to filter. */
  dimension: string;
  label?: string;
  /** Lower bound of the track; defaults to the data minimum. */
  min?: number;
  /** Upper bound of the track; defaults to the data maximum. */
  max?: number;
  step?: number;
  class?: string;
};

/**
 * A two-handle numeric range filter built on the design-system RangeSlider,
 * bound to a core `range` filter on a continuous dimension.
 */
defineOptions({ name: 'RangeSliderFilter' });
const props = withDefaults(defineProps<RangeSliderFilterProps>(), {
  label: undefined, min: undefined, max: undefined, step: 1, class: undefined,
});
const d = numericDomain(props.store.data, props.dimension);
const domain: NumericDomain = { min: props.min ?? d.min, max: props.max ?? d.max };
const resolvedLabel = props.label ?? findDimension(props.store.model, props.dimension)?.label ?? props.dimension;
const value = ref<[number, number]>([domain.min, domain.max]);

const apply = () => {
  const spec = rangeBoundsToSpec(value.value[0], value.value[1], domain);
  if (spec) props.store.setFilter(props.dimension, spec);
  else props.store.clearFilter(props.dimension);
};
watch(value, apply, { immediate: true, deep: true });
</script>

<template>
  <RangeSlider :label="resolvedLabel" :model-value="value" :min="domain.min" :max="domain.max"
    :step="props.step" :show-value="true" :class="props.class" @update:model-value="value = $event" />
</template>
