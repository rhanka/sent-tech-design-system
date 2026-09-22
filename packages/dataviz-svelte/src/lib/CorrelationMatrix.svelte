<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type CorrelationMatrixProps = {
    store: DashboardStore;
    viewId?: string;
    measures: string[];
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
  import { buildCorrelationMatrix } from '@sentropic/dataviz-core';

  let { store, viewId, measures, legend = true, label, width, height, class: className }: CorrelationMatrixProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildCorrelationMatrix(store.model, store.applyCrossfilter(viewId), { measures });
  });
</script>

<DsHeatmapChart {data} {legend} {label} {width} {height} class={className} />
