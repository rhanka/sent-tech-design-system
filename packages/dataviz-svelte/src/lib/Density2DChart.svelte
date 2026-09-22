<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type Density2DChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the point's x coordinate. */
    x: string;
    /** Field id whose numeric value becomes the point's y coordinate. */
    y: string;
    /** Optional field id whose numeric value weights the point's density. */
    weight?: string;
    /** Number of bins per axis (pass-through to the DS component). */
    bins?: number;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Density2DChart as DsDensity2DChart } from '@sentropic/design-system-svelte';
  import type { Density2DPoint as DsDensity2DPoint } from '@sentropic/design-system-svelte';
  import { buildDensity2DData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    weight,
    bins,
    width,
    height,
    size,
    label,
    class: className,
  }: Density2DChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildDensity2DData(store.model, store.applyCrossfilter(viewId), {
      x,
      y,
      weight,
    });
  });
</script>

<DsDensity2DChart
  data={data as DsDensity2DPoint[]}
  {bins}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
