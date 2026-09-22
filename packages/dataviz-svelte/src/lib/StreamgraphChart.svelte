<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type StreamgraphChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the category (x-axis bucket, e.g. month). */
    category: string;
    /** Field id whose value becomes the series label within each category. */
    series: string;
    /** Field id whose numeric value becomes the stream height. */
    measure: string;
    /** Optional field id whose value becomes the series tone. */
    tone?: string;
    smooth?: boolean;
    showLegend?: boolean;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { StreamgraphChart as DsStreamgraphChart } from '@sentropic/design-system-svelte';
  import type { StreamgraphChartDatum } from '@sentropic/design-system-svelte';
  import { buildStreamgraphData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    series,
    measure,
    tone,
    smooth,
    showLegend,
    width,
    height,
    label,
    class: className,
  }: StreamgraphChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildStreamgraphData(store.model, store.applyCrossfilter(viewId), {
      category,
      label: series,
      value: measure,
      tone,
    });
  });
</script>

<DsStreamgraphChart
  data={data as StreamgraphChartDatum[]}
  {label}
  {smooth}
  {showLegend}
  {width}
  {height}
  class={className}
/>
