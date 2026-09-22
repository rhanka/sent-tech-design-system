<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type PolygonChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the x coordinate. */
    x: string;
    /** Field id whose numeric value becomes the y coordinate. */
    y: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    tone?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { PolygonChart as DsPolygonChart } from '@sentropic/design-system-svelte';
  import type { PolygonChartPoint } from '@sentropic/design-system-svelte';
  import { buildPolygonData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    width,
    height,
    label,
    tone,
    class: className,
  }: PolygonChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildPolygonData(store.model, store.applyCrossfilter(viewId), {
      x,
      y,
    });
  });
</script>

<DsPolygonChart
  data={data as PolygonChartPoint[]}
  {label}
  {width}
  {height}
  tone={tone as any}
  class={className}
/>
