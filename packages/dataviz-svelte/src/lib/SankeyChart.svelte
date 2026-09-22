<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type SankeyChartProps = {
    store: DashboardStore;
    viewId: string;
    source: string;
    target: string;
    measure: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { SankeyChart as DsSankeyChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeFlowModel } from './partOfWholeData.js';

  let {
    store,
    viewId,
    source,
    target,
    measure,
    width,
    height,
    label,
    class: className,
  }: SankeyChartProps = $props();

  const dash = $derived(useDashboard(store));
  const flow = $derived.by(() => {
    void $dash;
    return buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure });
  });
</script>

<DsSankeyChart nodes={flow.nodes} links={flow.links} {label} {width} {height} class={className} />
