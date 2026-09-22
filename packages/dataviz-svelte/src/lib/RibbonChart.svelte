<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type RibbonChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the category (string-coerced). */
    category: string;
    /** Field id whose value becomes the period (string | number preserved). */
    period: string;
    /** Field id whose numeric value becomes the ribbon height/value. */
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
  import { RibbonChart as DsRibbonChart } from '@sentropic/design-system-svelte';
  import type { RibbonChartDatum } from '@sentropic/design-system-svelte';
  import { buildRibbonData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    period,
    value,
    width,
    height,
    size,
    label,
    class: className,
  }: RibbonChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildRibbonData(store.model, store.applyCrossfilter(viewId), {
      category,
      period,
      value,
    });
  });
</script>

<DsRibbonChart
  data={data as RibbonChartDatum[]}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>

