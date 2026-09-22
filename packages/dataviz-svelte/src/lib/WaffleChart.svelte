<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type WaffleChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each segment's label. */
    label_field: string;
    /** Field id whose numeric value becomes the segment count. */
    value: string;
    totalCells?: number;
    columns?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    size?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { WaffleChart as DsWaffleChart } from '@sentropic/design-system-svelte';
  import type { WaffleChartDatum } from '@sentropic/design-system-svelte';
  import { buildItemChartData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    value,
    totalCells,
    columns,
    label,
    size,
    class: className,
  }: WaffleChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildItemChartData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      value,
    });
  });
</script>

<DsWaffleChart
  data={data as WaffleChartDatum[]}
  {totalCells}
  {columns}
  {label}
  {size}
  class={className}
/>
