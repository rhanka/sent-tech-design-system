<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type OHLCChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each bar's label. */
    label_field: string;
    /** Field id whose numeric value becomes the open price. */
    open: string;
    /** Field id whose numeric value becomes the high price. */
    high: string;
    /** Field id whose numeric value becomes the low price. */
    low: string;
    /** Field id whose numeric value becomes the close price. */
    close: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { OHLCChart as DsOHLCChart } from '@sentropic/design-system-svelte';
  import type { OHLCChartDatum } from '@sentropic/design-system-svelte';
  import { buildOhlcData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    open,
    high,
    low,
    close,
    width,
    height,
    label,
    class: className,
  }: OHLCChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildOhlcData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      open,
      high,
      low,
      close,
    });
  });
</script>

<DsOHLCChart
  data={data as OHLCChartDatum[]}
  {label}
  {width}
  {height}
  class={className}
/>
