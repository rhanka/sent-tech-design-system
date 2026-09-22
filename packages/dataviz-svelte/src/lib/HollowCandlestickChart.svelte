<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type HollowCandlestickChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each bar's label (typically a date or session dimension). */
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
  import { HollowCandlestickChart as DsHollowCandlestickChart } from '@sentropic/design-system-svelte';
  import type { HollowCandlestickChartDatum } from '@sentropic/design-system-svelte';
  import { buildCandlestickData } from '@sentropic/dataviz-core';
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
  }: HollowCandlestickChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildCandlestickData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      open,
      high,
      low,
      close,
    });
  });
</script>

<DsHollowCandlestickChart
  data={data as HollowCandlestickChartDatum[]}
  {label}
  {width}
  {height}
  class={className}
/>
