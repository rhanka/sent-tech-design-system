<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type RenkoChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the point's date (timestamp/index). */
    date: string;
    /** Field id whose numeric value becomes the point's close price. */
    close: string;
    /** Brick size (pass-through to the DS component). */
    boxSize?: number;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { RenkoChart as DsRenkoChart } from '@sentropic/design-system-svelte';
  import type { RenkoChartDatum as DsRenkoChartDatum } from '@sentropic/design-system-svelte';
  import { buildRenkoData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    date,
    close,
    boxSize,
    width,
    height,
    size,
    label,
    class: className,
  }: RenkoChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildRenkoData(store.model, store.applyCrossfilter(viewId), {
      date,
      close,
    });
  });
</script>

<DsRenkoChart
  data={data as DsRenkoChartDatum[]}
  {boxSize}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
