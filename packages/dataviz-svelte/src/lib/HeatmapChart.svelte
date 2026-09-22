<script lang="ts" module>
  import type { DashboardStore, HeatmapConfig } from '@sentropic/dataviz-core';

  export type HeatmapChartProps = {
    store: DashboardStore;
    viewId?: string;
    x: HeatmapConfig['x'];
    y: HeatmapConfig['y'];
    measure: HeatmapConfig['measure'];
    legend?: boolean;
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { HeatmapChart as DsHeatmapChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildHeatmapData } from './distributionData.js';

  let { store, viewId, x, y, measure, legend = true, label, width, height, class: className }: HeatmapChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildHeatmapData(store.model, store.applyCrossfilter(viewId), { x, y, measure });
  });
</script>

<DsHeatmapChart {data} {legend} {label} {width} {height} class={className} />
