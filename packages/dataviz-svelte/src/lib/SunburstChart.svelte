<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type SunburstChartProps = {
    store: DashboardStore;
    viewId: string;
    hierarchy: string[];
    measure: string;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { SunburstChart as DsSunburstChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafePartWholeHierarchy, toHierarchyDatum } from './partOfWholeData.js';

  let {
    store,
    viewId,
    hierarchy,
    measure,
    legend = true,
    width,
    height,
    label,
    class: className,
  }: SunburstChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    const model = buildSafePartWholeHierarchy(store.model, store.applyCrossfilter(viewId), { hierarchy, measure });
    return toHierarchyDatum(model);
  });
</script>

<DsSunburstChart {data} {label} {legend} {width} {height} class={className} />
