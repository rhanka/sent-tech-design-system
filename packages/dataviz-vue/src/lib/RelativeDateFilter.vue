<script lang="ts">
import type { FilterSpec } from '@sentropic/dataviz-core';

/**
 * A relative-date preset: a labelled choice resolving to a trailing window of
 * `days` ending "now", or `null` days for "all" (no filter).
 */
export type RelativeDatePreset = {
  value: string;
  label: string;
  /** Trailing window length in days, or `null` for "all" (clears the filter). */
  days: number | null;
};

/** Default relative-date presets: all / 7 / 30 / 90 days / 12 months. */
export const DEFAULT_RELATIVE_PRESETS: RelativeDatePreset[] = [
  { value: 'all', label: 'Tout', days: null },
  { value: '7d', label: '7 derniers jours', days: 7 },
  { value: '30d', label: '30 derniers jours', days: 30 },
  { value: '90d', label: '90 derniers jours', days: 90 },
  { value: '365d', label: '12 derniers mois', days: 365 },
];

/**
 * Pure: a trailing window of `days` ending at `now` → a core `range` FilterSpec
 * in epoch milliseconds, or `null` when `days` is `null` ("all", no filter).
 */
export function relativeRangeToSpec(days: number | null, now: Date): FilterSpec | null {
  if (days == null) return null;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const max = now.getTime();
  return { kind: 'range', min: max - days * DAY_MS, max };
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Select } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';

export type RelativeDateFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  /** Selectable presets; defaults to {@link DEFAULT_RELATIVE_PRESETS}. */
  presets?: RelativeDatePreset[];
  /** Reference "now" for the trailing windows; defaults to the current time. */
  now?: Date;
  class?: string;
};

/**
 * A relative-date filter: a design-system Select of trailing-window presets
 * bound to a core `range` filter on a date dimension (epoch-millisecond cells).
 */
defineOptions({ name: 'RelativeDateFilter' });
const props = withDefaults(defineProps<RelativeDateFilterProps>(), {
  label: 'Période', presets: () => DEFAULT_RELATIVE_PRESETS, now: undefined, class: undefined,
});
const baseNow = props.now ?? new Date();
const selected = ref(props.presets[0]?.value ?? 'all');
const apply = () => {
  const preset = props.presets.find((p) => p.value === selected.value);
  const spec = preset ? relativeRangeToSpec(preset.days, baseNow) : null;
  if (spec) props.store.setFilter(props.dimension, spec);
  else props.store.clearFilter(props.dimension);
};
watch(selected, apply, { immediate: true });
</script>

<template>
  <Select :label="props.label" :model-value="selected" :options="props.presets.map((p) => ({ value: p.value, label: p.label }))"
    :class="props.class" @update:model-value="selected = $event" />
</template>
