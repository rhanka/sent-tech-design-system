<script lang="ts" module>
  import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';

  export type PackedBubbleChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    sort?: PartWholeSort;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { PackedBubblesChart as DsPackedBubblesChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafePackedBubbleModel, toPackedBubbleData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    sort = 'value-desc',
    width = 420,
    height = 320,
    label,
    class: className,
  }: PackedBubbleChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return toPackedBubbleData(
      buildSafePackedBubbleModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort }),
    );
  });
</script>

<DsPackedBubblesChart {data} {label} {width} {height} class={className} />
