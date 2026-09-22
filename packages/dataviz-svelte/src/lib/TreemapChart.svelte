<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TreemapChartProps = {
    store: DashboardStore;
    viewId: string;
    hierarchy: string[];
    measure: string;
    showLabels?: boolean;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TreemapChart as DsTreemapChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafePartWholeHierarchy, toTreemapData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    hierarchy,
    measure,
    showLabels = true,
    legend = true,
    width,
    height,
    label,
    class: className,
  }: TreemapChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    const model = buildSafePartWholeHierarchy(store.model, store.applyCrossfilter(viewId), { hierarchy, measure });
    return toTreemapData(model);
  });
</script>

<DsTreemapChart {data} {label} {showLabels} {legend} {width} {height} class={className} />
