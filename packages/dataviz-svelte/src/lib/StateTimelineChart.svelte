<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type StateTimelineChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value groups rows into lanes. */
    series: string;
    /** Field id whose numeric value becomes the segment start. */
    start: string;
    /** Field id whose numeric value becomes the segment end. */
    end: string;
    /** Field id whose value encodes the state label. */
    state: string;
    /** Accessible label for the chart (aria-label). */
    label?: string;
    width?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { StateTimelineChart as DsStateTimelineChart } from '@sentropic/design-system-svelte';
  import type { StateTimelineSeries } from '@sentropic/design-system-svelte';
  import { buildStateTimelineData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    series,
    start,
    end,
    state,
    label,
    width,
    height,
    class: className,
  }: StateTimelineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildStateTimelineData(store.model, store.applyCrossfilter(viewId), {
      series,
      start,
      end,
      state,
    });
  });
</script>

<DsStateTimelineChart
  data={data as StateTimelineSeries[]}
  {label}
  {width}
  {height}
  class={className}
/>
