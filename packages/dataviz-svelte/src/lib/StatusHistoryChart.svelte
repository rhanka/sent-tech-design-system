<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type StatusHistoryChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value groups rows into lanes. */
    series: string;
    /** Field id whose numeric value becomes the bucket timestamp/index. */
    at: string;
    /** Field id whose value encodes the status label. */
    value: string;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { StatusHistoryChart as DsStatusHistoryChart } from '@sentropic/design-system-svelte';
  import type { StatusHistorySeries } from '@sentropic/design-system-svelte';
  import { buildStatusHistoryData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    series,
    at,
    value,
    label,
    width,
    height,
    size,
    class: className,
  }: StatusHistoryChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildStatusHistoryData(store.model, store.applyCrossfilter(viewId), {
      series,
      at,
      value,
    });
  });
</script>

<DsStatusHistoryChart
  data={data as StatusHistorySeries[]}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
