<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type RoseChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { RoseChart as DsRoseChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeRoseModel, toRoseData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    width = 360,
    height = 360,
    label,
    class: className,
  }: RoseChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return toRoseData(buildSafeRoseModel(store.model, store.applyCrossfilter(viewId), { category, measure }));
  });
</script>

<DsRoseChart {data} {label} {width} {height} class={className} />
