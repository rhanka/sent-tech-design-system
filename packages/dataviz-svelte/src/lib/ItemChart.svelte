<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ItemChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each item's label. */
    label_field: string;
    /** Field id whose numeric value becomes the item count. */
    value: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ItemChart as DsItemChart } from '@sentropic/design-system-svelte';
  import type { ItemChartDatum } from '@sentropic/design-system-svelte';
  import { buildItemChartData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    value,
    width,
    height,
    label,
    class: className,
  }: ItemChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildItemChartData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      value,
    });
  });
</script>

<DsItemChart
  data={data as ItemChartDatum[]}
  {label}
  {width}
  {height}
  class={className}
/>
