<script lang="ts" module>
  import type { DashboardStore, FilterSpec, Row } from '@sentropic/dataviz-core';

  export type NumericDomain = { min: number; max: number };

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
   * Pure: the two range-slider handles → a core `range` {@link FilterSpec}
   * (bounds normalized so `lo <= hi`), or `null` when they span the whole domain
   * (no effective constraint).
   */
  export function rangeBoundsToSpec(lower: number, upper: number, domain: NumericDomain): FilterSpec | null {
    const lo = Math.min(lower, upper);
    const hi = Math.max(lower, upper);
    if (lo <= domain.min && hi >= domain.max) return null;
    return { kind: 'range', min: lo, max: hi };
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { RangeSlider } from '@sentropic/design-system-svelte';
  import { findDimension } from '@sentropic/dataviz-core';

  let { store, dimension, label, min, max, step = 1, class: className }: RangeSliderFilterProps = $props();

  // The track domain is resolved once (props override the data extent).
  const domain = untrack((): NumericDomain => {
    const d = numericDomain(store.data, dimension);
    return { min: min ?? d.min, max: max ?? d.max };
  });

  const resolvedLabel = $derived(label ?? findDimension(store.model, dimension)?.label ?? dimension);

  let value = $state<[number, number]>([domain.min, domain.max]);

  $effect(() => {
    const spec = rangeBoundsToSpec(value[0], value[1], domain);
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  });
</script>

<RangeSlider
  label={resolvedLabel}
  {value}
  min={domain.min}
  max={domain.max}
  {step}
  showValue
  class={className}
  onChange={(v) => (value = v)}
/>
