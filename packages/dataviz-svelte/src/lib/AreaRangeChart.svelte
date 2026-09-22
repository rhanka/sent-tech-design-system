<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type AreaRangeChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the x axis position. */
    x_field: string;
    /** Field id whose numeric value becomes the low bound. */
    low: string;
    /** Field id whose numeric value becomes the high bound. */
    high: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    tone?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { AreaRangeChart as DsAreaRangeChart } from '@sentropic/design-system-svelte';
  import type { AreaRangeChartDatum } from '@sentropic/design-system-svelte';
  import { buildAreaRangeData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x_field,
    low,
    high,
    width,
    height,
    label,
    tone,
    class: className,
  }: AreaRangeChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildAreaRangeData(store.model, store.applyCrossfilter(viewId), {
      x: x_field,
      low,
      high,
    });
  });
</script>

<DsAreaRangeChart
  data={data as AreaRangeChartDatum[]}
  {label}
  {width}
  {height}
  tone={tone as any}
  class={className}
/>
