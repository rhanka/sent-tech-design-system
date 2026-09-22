<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

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
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { NumberInput } from '@sentropic/design-system-svelte';
  import { findMeasure, groupAggregate, type Row } from '@sentropic/dataviz-core';

  let {
    store,
    dimension,
    measure,
    defaultN = 5,
    label = 'Top N',
    class: className,
  }: TopNFilterProps = $props();

  // Uncontrolled initial value captured intentionally from the prop.
  let n = $state(untrack(() => defaultN));

  // Apply (and keep in sync) an `include` filter of the dimension's top-N values
  // by the measure, ranked over the full dataset (a stable, predictable Top-N).
  $effect(() => {
    const count = n;
    const m = findMeasure(store.model, measure);
    if (!m || !Number.isFinite(count) || count < 1) return;
    const ranked = groupAggregate([...(store.data as readonly Row[])], dimension, m)
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, count)
      .map((r) => r.key);
    store.setFilter(dimension, { kind: 'include', values: ranked });
  });
</script>

<NumberInput {label} bind:value={n} min={1} step={1} class={className} />
