<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ColumnPyramidChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each column's category label. */
    category: string;
    /** Field id whose numeric value becomes the column height. */
    value: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ColumnPyramidChart as DsColumnPyramidChart } from '@sentropic/design-system-svelte';
  import type { ColumnPyramidChartDatum } from '@sentropic/design-system-svelte';
  import { buildColumnPyramidData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    value,
    width,
    height,
    label,
    class: className,
  }: ColumnPyramidChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildColumnPyramidData(store.model, store.applyCrossfilter(viewId), {
      category,
      value,
    });
  });
</script>

<DsColumnPyramidChart
  data={data as ColumnPyramidChartDatum[]}
  {label}
  {width}
  {height}
  class={className}
/>
