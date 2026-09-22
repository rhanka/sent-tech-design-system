<script lang="ts" module>
  import type { DashboardStore, HistogramConfig } from '@sentropic/dataviz-core';

  export type HistogramChartProps = {
    store: DashboardStore;
    viewId?: string;
    value: HistogramConfig['value'];
    bins?: HistogramConfig['bins'];
    domain?: HistogramConfig['domain'];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { HistogramChart as DsHistogramChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildHistogramData } from './distributionData.js';

  let { store, viewId, value, bins, domain, label, width, height, class: className }: HistogramChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildHistogramData(store.model, store.applyCrossfilter(viewId), { value, bins, domain });
  });
</script>

<DsHistogramChart {data} {bins} {label} {width} {height} class={className} />
