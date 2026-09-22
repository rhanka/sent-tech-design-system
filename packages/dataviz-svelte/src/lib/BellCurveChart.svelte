<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type BellCurveChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose numeric values are used to compute the bell curve distribution. */
    measure: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    tone?: string;
    smooth?: boolean;
    intervals?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { BellCurveChart as DsBellCurveChart } from '@sentropic/design-system-svelte';
  import { buildBellCurveData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    measure,
    width,
    height,
    label,
    tone,
    smooth,
    intervals,
    class: className,
  }: BellCurveChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildBellCurveData(store.model, store.applyCrossfilter(viewId), {
      measure,
    });
  });
</script>

<DsBellCurveChart
  {data}
  {label}
  {width}
  {height}
  tone={tone as any}
  {smooth}
  {intervals}
  class={className}
/>
