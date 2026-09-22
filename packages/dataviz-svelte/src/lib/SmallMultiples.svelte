<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { BarChartTone } from '@sentropic/design-system-svelte';

  export type SmallMultiplesProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This view's id in the cross-filter graph. */
    viewId: string;
    /** Dimension whose distinct values each produce one facet (panel). */
    facetBy: string;
    /** Dimension to group rows by inside each facet (bar categories). */
    dimension: string;
    /** Measure id aggregated into each bar's value. */
    measure: string;
    /** Accessible label; each facet chart is "<label> — <facet key>". */
    label: string;
    /** Number of grid columns (design-system Grid). Defaults to 2. */
    columns?: number;
    /** Bar colour tone from the design system. */
    tone?: BarChartTone;
    class?: string;
  };
</script>

<script lang="ts">
  import { Grid, BarChart, type BarChartDatum } from '@sentropic/design-system-svelte';
  import { findDimension, findMeasure, groupAggregate } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    facetBy,
    dimension,
    measure,
    label,
    columns = 2,
    tone,
    class: className,
  }: SmallMultiplesProps = $props();

  const key = (v: unknown) => (v == null ? 'null' : String(v));

  const dash = $derived(useDashboard(store));
  // One panel per distinct `facetBy` value, all sharing a single value domain so
  // the facets are visually comparable (the small-multiples invariant).
  const view = $derived.by((): { panels: { key: string; data: BarChartDatum[] }[]; domain?: [number, number] } => {
    void $dash;
    const fdim = findDimension(store.model, facetBy);
    const dim = findDimension(store.model, dimension);
    const m = findMeasure(store.model, measure);
    if (!fdim || !dim || !m) return { panels: [] };
    const rows = store.applyCrossfilter(viewId);
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const k = key(row[facetBy]);
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
    let min = 0;
    let max = 0;
    const panels = keys.map((k) => {
      const facetRows = rows.filter((row) => key(row[facetBy]) === k);
      const data = groupAggregate(facetRows, dimension, m).map(({ key: barKey, value }) => {
        if (value < min) min = value;
        if (value > max) max = value;
        return tone ? { label: barKey, value, tone } : { label: barKey, value };
      });
      return { key: k, data };
    });
    // Shared domain anchored at 0 so positive-only facets get [0, max] and mixed
    // facets keep negatives in view.
    return { panels, domain: panels.length ? [min, max] : undefined };
  });
</script>

<Grid {columns} gap={4} class={className} role="group" aria-label={label}>
  {#each view.panels as panel (panel.key)}
    <BarChart data={panel.data} label={`${label} — ${panel.key}`} domain={view.domain} />
  {/each}
</Grid>
