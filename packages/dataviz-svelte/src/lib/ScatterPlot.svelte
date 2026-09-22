<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ScatterPlotProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id for x-axis values (numeric). */
    x: string;
    /** Field id for y-axis values (numeric). */
    y: string;
    /** Optional dimension whose values drive categorical tones. */
    series?: string;
    /** Optional field used as per-point tooltip label. */
    labelField?: string;
    width?: number;
    height?: number;
    radius?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ScatterPlot as DsScatterPlot } from '@sentropic/design-system-svelte';
  import type { ScatterPlotDatum } from '@sentropic/design-system-svelte';
  import { buildScatterModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    series,
    labelField,
    width,
    height,
    radius,
    label,
    class: className,
  }: ScatterPlotProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildScatterModel(store.model, store.applyCrossfilter(viewId), { x, y, series, labelField });
  });
</script>

<DsScatterPlot
  data={model.data as ScatterPlotDatum[]}
  xLabel={model.xLabel}
  yLabel={model.yLabel}
  {width}
  {height}
  {radius}
  {label}
  class={className}
/>
