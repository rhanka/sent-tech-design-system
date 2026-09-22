<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { BarChartTone } from '@sentropic/design-system-svelte';

  export type DrillBarChartProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This view's id (drill state + cross-filter scope live under it). */
    viewId: string;
    /** Ordered dimension hierarchy; bars group by the current drill level. */
    hierarchy: string[];
    /** Measure id aggregated into each bar's value. */
    measure: string;
    /** Accessible label of the chart. */
    label: string;
    tone?: BarChartTone;
    orientation?: 'vertical' | 'horizontal';
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { BarChart, type BarChartDatum } from '@sentropic/design-system-svelte';
  import { findMeasure, groupAggregate } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    hierarchy,
    measure,
    label,
    tone,
    orientation = 'vertical',
    width,
    height,
    class: className,
  }: DrillBarChartProps = $props();

  const dash = $derived(useDashboard(store));
  // Current depth = length of the drill path, capped at the deepest level.
  const level = $derived(
    Math.min(($dash.drill[viewId] ?? []).length, Math.max(hierarchy.length - 1, 0)),
  );
  const currentDim = $derived(hierarchy[level]);
  const canDrill = $derived(level < hierarchy.length - 1);

  const data = $derived.by((): BarChartDatum[] => {
    void $dash;
    const m = findMeasure(store.model, measure);
    if (!m || !currentDim) return [];
    return groupAggregate(store.applyCrossfilter(viewId), currentDim, m).map(({ key, value }) =>
      tone ? { label: key, value, tone } : { label: key, value },
    );
  });

  const selectedKeys = $derived($dash.selections[viewId] ?? []);

  // Clicking a bar drills one level deeper (filter the clicked value, push the
  // next hierarchy dimension as group-by). At the deepest level there is nowhere
  // to drill, so a click toggles this view's selection (brushing) instead.
  function onSelect(key: string) {
    if (canDrill) {
      store.setFilter(currentDim, { kind: 'include', values: [key] });
      store.drillDown(viewId, hierarchy[level + 1]);
    } else {
      store.toggleSelection(viewId, key);
    }
  }
</script>

<BarChart
  {data}
  {label}
  {orientation}
  {width}
  {height}
  class={className}
  selectedKeys={canDrill ? [] : selectedKeys}
  {onSelect}
/>
