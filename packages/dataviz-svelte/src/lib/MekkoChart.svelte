<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type MekkoChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    series: string;
    measure: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { MarimekkoChart as DsMarimekkoChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeMekkoModel, toMarimekkoData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    series,
    measure,
    width,
    height,
    label,
    class: className,
  }: MekkoChartProps = $props();

  const dash = $derived(useDashboard(store));
  const mekko = $derived.by(() => {
    void $dash;
    return buildSafeMekkoModel(store.model, store.applyCrossfilter(viewId), {
      category,
      series,
      measure,
    });
  });
  const data = $derived(toMarimekkoData(mekko));
</script>

<DsMarimekkoChart {data} {width} {height} {label} class={className} />
