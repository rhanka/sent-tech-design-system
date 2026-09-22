<script lang="ts" module>
  import type { DashboardStore, FilterSpec } from '@sentropic/dataviz-core';

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

  /** Default relative-date presets: all / 7 / 30 / 90 days / 12 months. */
  export const DEFAULT_RELATIVE_PRESETS: RelativeDatePreset[] = [
    { value: 'all', label: 'Tout', days: null },
    { value: '7d', label: '7 derniers jours', days: 7 },
    { value: '30d', label: '30 derniers jours', days: 30 },
    { value: '90d', label: '90 derniers jours', days: 90 },
    { value: '365d', label: '12 derniers mois', days: 365 },
  ];

  const DAY_MS = 24 * 60 * 60 * 1000;

  /**
   * Pure: a trailing window of `days` ending at `now` → a core `range`
   * {@link FilterSpec} in epoch milliseconds, or `null` when `days` is `null`
   * ("all", no filter).
   */
  export function relativeRangeToSpec(days: number | null, now: Date): FilterSpec | null {
    if (days == null) return null;
    const max = now.getTime();
    return { kind: 'range', min: max - days * DAY_MS, max };
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { Select } from '@sentropic/design-system-svelte';

  let {
    store,
    dimension,
    label = 'Période',
    presets = DEFAULT_RELATIVE_PRESETS,
    now = new Date(),
    class: className,
  }: RelativeDateFilterProps = $props();

  // Initial selection is the first preset; thereafter `selected` is user-driven
  // state, so we read the prop's initial value without a reactive dependency.
  let selected = $state(untrack(() => presets[0]?.value ?? 'all'));

  $effect(() => {
    const preset = presets.find((p) => p.value === selected);
    const spec = preset ? relativeRangeToSpec(preset.days, now) : null;
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  });
</script>

<Select {label} bind:value={selected} class={className}>
  {#each presets as preset (preset.value)}
    <option value={preset.value}>{preset.label}</option>
  {/each}
</Select>
