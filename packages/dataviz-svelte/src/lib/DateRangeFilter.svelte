<script lang="ts" module>
  import type { DashboardStore, FilterSpec } from '@sentropic/dataviz-core';

  export type DateRangeFilterProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
    dimension: string;
    label?: string;
    class?: string;
  };

  /**
   * Pure: a DatePicker `{ start, end }` range → a core `range` {@link FilterSpec}
   * in epoch milliseconds (bounds optional), or `null` when the range is empty.
   */
  export function dateRangeToSpec(range: { start: Date | null; end: Date | null }): FilterSpec | null {
    const min = range.start ? range.start.getTime() : undefined;
    const max = range.end ? range.end.getTime() : undefined;
    if (min === undefined && max === undefined) return null;
    return { kind: 'range', min, max };
  }
</script>

<script lang="ts">
  import { DatePicker, type DatePickerRange } from '@sentropic/design-system-svelte';

  let { store, dimension, label = 'Période', class: className }: DateRangeFilterProps = $props();

  let range = $state<DatePickerRange>({ start: null, end: null });

  $effect(() => {
    const spec = dateRangeToSpec(range);
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  });
</script>

<DatePicker mode="range" {label} bind:value={range} class={className} />
