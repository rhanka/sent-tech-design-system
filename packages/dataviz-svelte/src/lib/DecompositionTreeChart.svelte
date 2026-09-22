<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type DecompositionTreeChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id of the measure to aggregate (summed per group). */
    measure: string;
    /** Ordered dimension field ids — one decomposition level each. */
    levels: string[];
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { DecompositionTreeChart as DsDecompositionTreeChart } from '@sentropic/design-system-svelte';
  import type { DecompositionTreeData } from '@sentropic/design-system-svelte';
  import { buildDecompositionTreeData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    measure,
    levels,
    width,
    height,
    size,
    label,
    class: className,
  }: DecompositionTreeChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildDecompositionTreeData(store.model, store.applyCrossfilter(viewId), {
      measure,
      levels,
    });
  });
</script>

<DsDecompositionTreeChart
  data={data as DecompositionTreeData}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
