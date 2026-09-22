<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type DumbbellChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the category label. */
    category: string;
    /** Field id whose numeric value becomes the low point. */
    low: string;
    /** Field id whose numeric value becomes the high point. */
    high: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    lowTone?: string;
    highTone?: string;
    lowLabel?: string;
    highLabel?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { DumbbellChart as DsDumbbellChart } from '@sentropic/design-system-svelte';
  import type { DumbbellChartDatum } from '@sentropic/design-system-svelte';
  import { buildColumnRangeData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    category,
    low,
    high,
    width,
    height,
    label,
    lowTone,
    highTone,
    lowLabel,
    highLabel,
    class: className,
  }: DumbbellChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildColumnRangeData(store.model, store.applyCrossfilter(viewId), {
      category,
      low,
      high,
    });
  });
</script>

<DsDumbbellChart
  data={data as DumbbellChartDatum[]}
  {label}
  {width}
  {height}
  lowTone={lowTone as any}
  highTone={highTone as any}
  {lowLabel}
  {highLabel}
  class={className}
/>
