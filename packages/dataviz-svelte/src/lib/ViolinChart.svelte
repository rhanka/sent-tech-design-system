<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ViolinChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id of the dimension used to split data into groups (one violin per group). */
    groupBy: string;
    /** Field id whose numeric values form the distribution for each group. */
    measure: string;
    /** Number of density bins (optional; DS default is 20). */
    bins?: number;
    /** Whether to overlay median / quartile markers (optional; DS default is true). */
    quartiles?: boolean;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ViolinChart as DsViolinChart } from '@sentropic/design-system-svelte';
  import type { ViolinChartDatum } from '@sentropic/design-system-svelte';
  import { buildViolinModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    groupBy,
    measure,
    bins,
    quartiles,
    width,
    height,
    label,
    class: className,
  }: ViolinChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildViolinModel(store.model, store.applyCrossfilter(viewId), {
      groupBy,
      measure,
      bins,
      quartiles,
    });
  });
</script>

<DsViolinChart
  data={model.data as ViolinChartDatum[]}
  bins={model.bins}
  quartiles={model.quartiles}
  {label}
  {width}
  {height}
  class={className}
/>
