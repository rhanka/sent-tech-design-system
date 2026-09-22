<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { ParetoChartTone } from '@sentropic/design-system-svelte';

  export type ParetoChartProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This chart's view id in the cross-filter graph. */
    viewId: string;
    /** Dimension id used as Pareto categories. */
    category: string;
    /** Measure id aggregated per category. */
    measure: string;
    /** Accessible label of the chart. */
    label: string;
    /** Optional design-system tone applied to every Pareto bar. */
    tone?: ParetoChartTone;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import {
    ParetoChart as DsParetoChart,
    type ParetoChartDatum,
  } from '@sentropic/design-system-svelte';
  import { buildParetoModel, findDimension, findMeasure } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    measure,
    label,
    tone,
    width,
    height,
    class: className,
  }: ParetoChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by((): ParetoChartDatum[] => {
    void $dash;
    const dim = findDimension(store.model, category);
    const m = findMeasure(store.model, measure);
    if (!dim || !m) return [];

    return buildParetoModel(store.model, store.applyCrossfilter(viewId), { category, measure }).items.map((item) =>
      tone ? { label: item.label, value: item.value, tone } : { label: item.label, value: item.value },
    );
  });
</script>

<DsParetoChart {data} {label} {width} {height} class={className} />
