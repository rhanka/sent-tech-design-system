<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type AnalyticsClusterPlotProps = {
    store: DashboardStore;
    viewId: string;
    fields: string[];
    k: number;
    maxIterations?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ScatterPlot as DsScatterPlot } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildClusterScatterData } from './analyticsDsData.js';

  let {
    store,
    viewId,
    fields,
    k,
    maxIterations,
    width = 360,
    height = 240,
    label,
    class: className,
  }: AnalyticsClusterPlotProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildClusterScatterData(store.model, store.applyCrossfilter(viewId), { fields, k, maxIterations });
  });
  const classes = $derived(['st-analyticsClusterPlot', className].filter(Boolean).join(' '));
</script>

<DsScatterPlot
  data={model.data}
  centroids={model.centroids}
  xLabel={model.xLabel}
  yLabel={model.yLabel}
  {width}
  {height}
  {label}
  class={classes}
/>
