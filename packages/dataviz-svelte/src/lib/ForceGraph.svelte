<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ForceGraphProps = {
    store: DashboardStore;
    viewId: string;
    source: string;
    target: string;
    weight?: string;
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { ForceGraph as DsForceGraph } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildForceGraphData } from '@sentropic/dataviz-core';

  let {
    store,
    viewId,
    source,
    target,
    weight,
    label,
    width,
    height,
    class: className,
  }: ForceGraphProps = $props();

  const dash = $derived(useDashboard(store));
  const graph = $derived.by(() => {
    void $dash;
    return buildForceGraphData(store.model, store.applyCrossfilter(viewId), { source, target, weight });
  });
</script>

<DsForceGraph nodes={graph.nodes} edges={graph.edges} {label} {width} {height} class={className} />
