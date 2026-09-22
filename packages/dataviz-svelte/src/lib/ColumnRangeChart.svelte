<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ColumnRangeChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the category label. */
    category: string;
    /** Field id whose numeric value becomes the low bound. */
    low: string;
    /** Field id whose numeric value becomes the high bound. */
    high: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    orientation?: 'vertical' | 'horizontal';
    class?: string;
  };
</script>

<script lang="ts">
  import { ColumnRangeChart as DsColumnRangeChart } from '@sentropic/design-system-svelte';
  import type { ColumnRangeChartDatum } from '@sentropic/design-system-svelte';
  import { buildColumnRangeData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    low,
    high,
    width,
    height,
    label,
    orientation,
    class: className,
  }: ColumnRangeChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildColumnRangeData(store.model, store.applyCrossfilter(viewId), {
      category,
      low,
      high,
    });
  });
</script>

<DsColumnRangeChart
  data={data as ColumnRangeChartDatum[]}
  {label}
  {width}
  {height}
  {orientation}
  class={className}
/>
