<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type BumpChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id of the dimension whose distinct values form the series (one line each). */
    series: string;
    /** Field id of the ordered dimension whose distinct values form the category axis (x). */
    category: string;
    /** Field id of the numeric measure used to rank series within each category. */
    measure: string;
    /**
     * Ranking direction.
     * - `'desc'` (default): rank 1 = highest measure value.
     * - `'asc'`: rank 1 = lowest measure value.
     */
    direction?: 'asc' | 'desc';
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { BumpChart as DsBumpChart } from '@sentropic/design-system-svelte';
  import type { BumpChartSeries } from '@sentropic/design-system-svelte';
  import { buildBumpModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    series,
    category,
    measure,
    direction,
    width,
    height,
    label,
    class: className,
  }: BumpChartProps = $props();

  const dash = $derived(useDashboard(store));
  const bumpModel = $derived.by(() => {
    void $dash;
    return buildBumpModel(store.model, store.applyCrossfilter(viewId), {
      series,
      category,
      measure,
      direction,
    });
  });
</script>

<DsBumpChart
  data={bumpModel.series as BumpChartSeries[]}
  categories={bumpModel.categories}
  {label}
  {width}
  {height}
  class={className}
/>
