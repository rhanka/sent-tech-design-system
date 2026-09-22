<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

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
</script>

<script lang="ts">
  import { CheckboxGroup, type CheckboxGroupOption } from '@sentropic/design-system-svelte';
  import { findDimension } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let { store, dimension, legend, orientation = 'vertical', class: className }: ValueSlicerProps = $props();

  const dash = $derived(useDashboard(store));
  const key = (v: unknown) => (v == null ? 'null' : String(v));
  const resolvedLegend = $derived(legend ?? findDimension(store.model, dimension)?.label ?? dimension);

  const options = $derived.by((): CheckboxGroupOption[] => {
    const seen = new Set<string>();
    const opts: CheckboxGroupOption[] = [];
    for (const row of store.data) {
      const k = key(row[dimension]);
      if (!seen.has(k)) {
        seen.add(k);
        opts.push({ label: k, value: k });
      }
    }
    return opts;
  });

  // Checked = the dimension's active `include` filter (an OR over values).
  const value = $derived.by((): string[] => {
    const f = $dash.filters[dimension];
    return f && f.kind === 'include' ? [...f.values] : [];
  });

  function onchange(values: string[]) {
    if (values.length) store.setFilter(dimension, { kind: 'include', values });
    else store.clearFilter(dimension);
  }
</script>

<CheckboxGroup
  legend={resolvedLegend}
  {options}
  {value}
  {orientation}
  class={className}
  {onchange}
/>
