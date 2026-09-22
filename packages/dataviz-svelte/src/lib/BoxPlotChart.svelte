<script lang="ts" module>
  import type { BoxPlotConfig, DashboardStore } from '@sentropic/dataviz-core';

  export type BoxPlotChartProps = {
    store: DashboardStore;
    viewId?: string;
    value: BoxPlotConfig['value'];
    group?: BoxPlotConfig['group'];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { BoxPlotChart as DsBoxPlotChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildBoxPlotData } from './distributionData.js';

  let { store, viewId, value, group, label, width, height, class: className }: BoxPlotChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildBoxPlotData(store.model, store.applyCrossfilter(viewId), { value, group });
  });
</script>

<DsBoxPlotChart {data} {label} {width} {height} class={className} />
