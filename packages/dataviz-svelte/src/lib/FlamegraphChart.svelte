<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type FlamegraphChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value is the node id (string-coerced). */
    id: string;
    /** Field id whose value references the parent node id (empty ⇒ root). */
    parentId: string;
    /** Field id whose value becomes the node label (string-coerced). */
    name: string;
    /** Field id whose numeric value becomes the node weight (non-finite ⇒ 0). */
    value: string;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { FlamegraphChart as DsFlamegraphChart } from '@sentropic/design-system-svelte';
  import type { FlamegraphNode as DsFlamegraphNode } from '@sentropic/design-system-svelte';
  import { buildFlamegraphData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    id,
    parentId,
    name,
    value,
    width,
    height,
    size,
    label,
    class: className,
  }: FlamegraphChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildFlamegraphData(store.model, store.applyCrossfilter(viewId), {
      id,
      parentId,
      name,
      value,
    });
  });
</script>

<DsFlamegraphChart
  data={data as DsFlamegraphNode}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
