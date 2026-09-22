<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type DivergingBarChartProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This chart's view id in the cross-filter graph. */
    viewId: string;
    /** Dimension id used as diverging bar categories. */
    category: string;
    /** Measure id aggregated per category. */
    measure: string;
    /** Accessible label of the chart. */
    label: string;
    /** Optional fixed value-axis domain. Defaults to the core model domain. */
    domain?: [number, number];
    format?: (value: number) => string;
    showLegend?: boolean;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import {
    DivergentBarChart,
    type DivergentBarChartDatum,
  } from '@sentropic/design-system-svelte';
  import { buildDivergingBarModel, findDimension, findMeasure } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    measure,
    label,
    domain,
    format,
    showLegend = true,
    width,
    height,
    class: className,
  }: DivergingBarChartProps = $props();

  const dash = $derived(useDashboard(store));
  const chartModel = $derived.by(() => {
    void $dash;
    const dim = findDimension(store.model, category);
    const m = findMeasure(store.model, measure);
    if (!dim || !m) return undefined;
    return buildDivergingBarModel(store.model, store.applyCrossfilter(viewId), { category, measure });
  });
  const data = $derived(
    chartModel?.items.map(
      (item): DivergentBarChartDatum => ({ label: item.label, value: item.value, tone: item.direction }),
    ) ?? [],
  );
  const resolvedDomain = $derived(domain ?? chartModel?.domain);
</script>

<DivergentBarChart
  {data}
  {label}
  {width}
  {height}
  domain={resolvedDomain}
  {format}
  {showLegend}
  class={className}
/>
