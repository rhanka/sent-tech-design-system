<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ContourChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the point's x coordinate. */
    x: string;
    /** Field id whose numeric value becomes the point's y coordinate. */
    y: string;
    /** Field id whose numeric value drives the cell's colour band. */
    value: string;
    /** Number of colour bands / levels (pass-through to the DS component). */
    levels?: number;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ContourChart as DsContourChart } from '@sentropic/design-system-svelte';
  import type { ContourChartDatum as DsContourChartDatum } from '@sentropic/design-system-svelte';
  import { buildContourData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    value,
    levels,
    width,
    height,
    size,
    label,
    class: className,
  }: ContourChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildContourData(store.model, store.applyCrossfilter(viewId), {
      x,
      y,
      value,
    });
  });
</script>

<DsContourChart
  data={data as DsContourChartDatum[]}
  {levels}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
