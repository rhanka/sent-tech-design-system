<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type VectorFieldChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric value becomes the vector's x coordinate. */
    x: string;
    /** Field id whose numeric value becomes the vector's y coordinate. */
    y: string;
    /** Field id whose numeric value becomes the vector's magnitude (≥ 0). */
    length: string;
    /** Field id whose numeric value becomes the direction in degrees. */
    direction: string;
    width?: number;
    height?: number;
    size?: number;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { VectorFieldChart as DsVectorFieldChart } from '@sentropic/design-system-svelte';
  import type { VectorFieldChartDatum as DsVectorFieldChartDatum } from '@sentropic/design-system-svelte';
  import { buildVectorFieldData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    length,
    direction,
    width,
    height,
    size,
    label,
    class: className,
  }: VectorFieldChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildVectorFieldData(store.model, store.applyCrossfilter(viewId), {
      x,
      y,
      length,
      direction,
    });
  });
</script>

<DsVectorFieldChart
  data={data as DsVectorFieldChartDatum[]}
  {label}
  {width}
  {height}
  {size}
  class={className}
/>
