<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type HLCChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each bar's label (typically a date or session dimension). */
    label_field: string;
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
  import { HLCChart as DsHLCChart } from '@sentropic/design-system-svelte';
  import type { HLCChartDatum } from '@sentropic/design-system-svelte';
  import { buildHlcData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    high,
    low,
    close,
    width,
    height,
    label,
    class: className,
  }: HLCChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildHlcData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      high,
      low,
      close,
    });
  });
</script>

<DsHLCChart
  data={data as HLCChartDatum[]}
  {label}
  {width}
  {height}
  class={className}
/>
