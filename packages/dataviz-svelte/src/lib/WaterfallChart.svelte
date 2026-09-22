<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type WaterfallChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    totalLabel?: string;
    connectors?: boolean;
    format?: (value: number) => string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { WaterfallChart as DsWaterfallChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeWaterfallModel, toWaterfallData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    totalLabel,
    connectors = true,
    format,
    width,
    height,
    label,
    class: className,
  }: WaterfallChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    const model = buildSafeWaterfallModel(store.model, store.applyCrossfilter(viewId), {
      category,
      measure,
      totalLabel,
    });
    return toWaterfallData(model);
  });
</script>

<DsWaterfallChart {data} {label} {connectors} {format} {width} {height} class={className} />
