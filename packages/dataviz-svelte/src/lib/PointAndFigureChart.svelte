<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type PointAndFigureChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the point's temporal position. */
    date: string;
    /** Field id whose numeric value becomes the point's closing price. */
    close: string;
    /** Box size — price granularity of the grid (pass-through to the DS component). */
    boxSize?: number;
    /** Number of boxes required to reverse the column (pass-through to the DS component). */
    reversal?: number;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { PointAndFigureChart as DsPointAndFigureChart } from '@sentropic/design-system-svelte';
  import type { PointAndFigureChartDatum as DsPointAndFigureChartDatum } from '@sentropic/design-system-svelte';
  import { buildPointAndFigureData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    date,
    close,
    boxSize,
    reversal,
    width,
    height,
    size,
    label,
    class: className,
  }: PointAndFigureChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildPointAndFigureData(store.model, store.applyCrossfilter(viewId), {
      date,
      close,
    });
  });
</script>

<DsPointAndFigureChart
  data={data as DsPointAndFigureChartDatum[]}
  {boxSize}
  {reversal}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
