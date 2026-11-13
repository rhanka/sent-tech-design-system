<script lang="ts">
import type { FilterSpec } from '@sentropic/dataviz-core';

/**
 * Pure: a DatePicker `{ start, end }` range → a core `range` FilterSpec in epoch
 * milliseconds (bounds optional), or `null` when the range is empty.
 */
export function dateRangeToSpec(range: { start: Date | null; end: Date | null }): FilterSpec | null {
  const min = range.start ? range.start.getTime() : undefined;
  const max = range.end ? range.end.getTime() : undefined;
  if (min === undefined && max === undefined) return null;
  return { kind: 'range', min, max };
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  DatePicker,
  type DatePickerRange,
  type DatePickerValue,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';

export type DateRangeFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  class?: string;
};

/**
 * A date-range filter: a design-system DatePicker (range mode) bound to a core
 * `range` filter on a date dimension (epoch-millisecond cells).
 */

const asRange = (value: DatePickerValue): DatePickerRange =>
  value && typeof value === 'object' && 'start' in value ? value : { start: null, end: null };

defineOptions({ name: 'DateRangeFilter' });
const props = withDefaults(defineProps<DateRangeFilterProps>(), {
  label: 'Période', class: undefined,
});
const range = ref<DatePickerRange>({ start: null, end: null });
const apply = () => {
  const spec = dateRangeToSpec(range.value);
  if (spec) props.store.setFilter(props.dimension, spec);
  else props.store.clearFilter(props.dimension);
};
watch(range, apply, { deep: true, immediate: true });
</script>

<template>
  <DatePicker mode="range" :label="props.label" :model-value="range" :class="props.class"
    @update:model-value="(v: DatePickerValue) => { range = asRange(v); }" />
</template>
