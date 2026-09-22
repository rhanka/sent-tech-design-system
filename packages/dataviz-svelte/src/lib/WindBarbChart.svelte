<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type WindBarbChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the point's position on the time axis. */
    at: string;
    /** Field id whose numeric value becomes the wind speed in knots (≥ 0). */
    speed: string;
    /** Field id whose numeric value becomes the wind direction in degrees. */
    direction: string;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { WindBarbChart as DsWindBarbChart } from '@sentropic/design-system-svelte';
  import type { WindBarbChartDatum as DsWindBarbChartDatum } from '@sentropic/design-system-svelte';
  import { buildWindBarbData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    at,
    speed,
    direction,
    width,
    height,
    size,
    label,
    class: className,
  }: WindBarbChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildWindBarbData(store.model, store.applyCrossfilter(viewId), {
      at,
      speed,
      direction,
    });
  });
</script>

<DsWindBarbChart
  data={data as DsWindBarbChartDatum[]}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
