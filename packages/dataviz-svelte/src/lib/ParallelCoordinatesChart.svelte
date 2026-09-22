<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ParallelCoordinatesChartProps = {
    store: DashboardStore;
    viewId: string;
    /** List of measure field ids that become the parallel axes (left to right). */
    measures: string[];
    /** Optional dimension field id used to assign a tone per row. */
    series?: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { ParallelCoordinatesChart as DsParallelCoordinatesChart } from '@sentropic/design-system-svelte';
  import type { ParallelAxis, ParallelCoordinatesChartTone } from '@sentropic/design-system-svelte';
  import { buildParallelCoordinatesModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    measures,
    series,
    width,
    height,
    label,
    class: className,
  }: ParallelCoordinatesChartProps = $props();

  const dash = $derived(useDashboard(store));
  const pcModel = $derived.by(() => {
    void $dash;
    return buildParallelCoordinatesModel(store.model, store.applyCrossfilter(viewId), {
      measures,
      series,
    });
  });
</script>

<DsParallelCoordinatesChart
  axes={pcModel.axes as ParallelAxis[]}
  data={pcModel.data}
  tones={pcModel.tones as ParallelCoordinatesChartTone[] | undefined}
  {label}
  {width}
  {height}
  class={className}
/>
