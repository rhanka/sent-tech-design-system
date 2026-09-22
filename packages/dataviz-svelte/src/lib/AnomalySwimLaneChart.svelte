<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type AnomalySwimLaneChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value groups rows into lanes. */
    job: string;
    /** Field id whose numeric value becomes the bucket timestamp/index. */
    at: string;
    /** Field id whose numeric value encodes the anomaly score. */
    score: string;
    /** Maximum score value for the scale. */
    max?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { AnomalySwimLaneChart as DsAnomalySwimLaneChart } from '@sentropic/design-system-svelte';
  import type { AnomalySwimLaneSeries } from '@sentropic/design-system-svelte';
  import { buildAnomalySwimLaneData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    job,
    at,
    score,
    max,
    label,
    width,
    height,
    size,
    class: className,
  }: AnomalySwimLaneChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildAnomalySwimLaneData(store.model, store.applyCrossfilter(viewId), {
      job,
      at,
      score,
    });
  });
</script>

<DsAnomalySwimLaneChart
  data={data as AnomalySwimLaneSeries[]}
  {max}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
