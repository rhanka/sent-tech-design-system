<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ChordChartProps = {
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
  import { ChordDiagram as DsChordDiagram } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeFlowModel, toFlowData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    source,
    target,
    measure,
    width = 480,
    height = 360,
    label,
    class: className,
  }: ChordChartProps = $props();

  const dash = $derived(useDashboard(store));
  const flow = $derived.by(() => {
    void $dash;
    return toFlowData(buildSafeFlowModel(store.model, store.applyCrossfilter(viewId), { source, target, measure }));
  });
</script>

<DsChordDiagram data={flow.data} labels={flow.labels} {label} {width} {height} class={className} />
