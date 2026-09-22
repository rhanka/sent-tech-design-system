<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type DependencyWheelChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the link's source node. */
    source: string;
    /** Field id whose value becomes the link's target node. */
    target: string;
    /** Field id whose numeric value becomes the link weight. */
    weight: string;
    /** Optional display labels per node id. */
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { DependencyWheelChart as DsDependencyWheelChart } from '@sentropic/design-system-svelte';
  import type { DependencyWheelChartLink } from '@sentropic/design-system-svelte';
  import { buildDependencyWheelData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    source,
    target,
    weight,
    labels,
    width,
    height,
    label,
    class: className,
  }: DependencyWheelChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildDependencyWheelData(store.model, store.applyCrossfilter(viewId), {
      source,
      target,
      weight,
    });
  });
</script>

<DsDependencyWheelChart
  data={data as DependencyWheelChartLink[]}
  {labels}
  {label}
  {width}
  {height}
  class={className}
/>
