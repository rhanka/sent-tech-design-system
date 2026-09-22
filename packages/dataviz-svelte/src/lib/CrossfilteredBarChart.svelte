<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { BarChartTone } from '@sentropic/design-system-svelte';

  export type CrossfilteredBarChartProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This chart's view id in the cross-filter graph. */
    viewId: string;
    /** Dimension id to group rows by (one bar per distinct value). */
    dimension: string;
    /** Measure id to aggregate into each bar's value. */
    measure: string;
    /** Accessible label of the chart (required by the design-system BarChart). */
    label: string;
    /** Bar colour tone from the design system. */
    tone?: BarChartTone;
    /**
     * When true (default) clicking a bar toggles this view's selection
     * (brushing input → `store.toggleSelection`); selected bars are highlighted.
     * Set false for an output-only facet.
     */
    selectable?: boolean;
    /** Fixed value-axis domain `[min, max]` for a shared scale across facets. */
    domain?: [number, number];
    orientation?: 'vertical' | 'horizontal';
    width?: number;
    height?: number;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { BarChart, type BarChartDatum } from '@sentropic/design-system-svelte';
  import { findDimension, findMeasure, groupAggregate } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    dimension,
    measure,
    label,
    tone,
    selectable = true,
    domain,
    orientation = 'vertical',
    width,
    height,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    class: className,
  }: CrossfilteredBarChartProps = $props();

  // `$dash` establishes the reactive dependency so the chart re-aggregates on
  // every store mutation; the rows visible to this view come from the core
  // cross-filter scope.
  const dash = $derived(useDashboard(store));
  const data = $derived.by((): BarChartDatum[] => {
    void $dash;
    const dim = findDimension(store.model, dimension);
    const m = findMeasure(store.model, measure);
    if (!dim || !m) return [];
    const rows = store.applyCrossfilter(viewId);
    return groupAggregate(rows, dimension, m).map(({ key, value }) =>
      tone ? { label: key, value, tone } : { label: key, value },
    );
  });
  const selectedKeys = $derived($dash.selections[viewId] ?? []);
</script>

<BarChart
  {data}
  {label}
  {orientation}
  {width}
  {height}
  {domain}
  class={className}
  selectedKeys={selectable ? selectedKeys : []}
  onSelect={selectable ? (key) => store.toggleSelection(viewId, key) : undefined}
  {hoverKey}
  {onHoverKeyChange}
  {onSelectKey}
/>
