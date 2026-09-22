<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type WordCloudChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes each word in the cloud. */
    word_field: string;
    /** Field id whose numeric value becomes the word's display weight. */
    weight: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { WordCloudChart as DsWordCloudChart } from '@sentropic/design-system-svelte';
  import type { WordCloudChartWord } from '@sentropic/design-system-svelte';
  import { buildWordCloudData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    word_field,
    weight,
    width,
    height,
    label,
    class: className,
  }: WordCloudChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildWordCloudData(store.model, store.applyCrossfilter(viewId), {
      word: word_field,
      weight,
    });
  });
</script>

<DsWordCloudChart
  data={data as WordCloudChartWord[]}
  {label}
  {width}
  {height}
  class={className}
/>
