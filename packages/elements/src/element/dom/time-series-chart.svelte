<script lang="ts">
  import LineChart, { type LineChartTone } from "../../../../components-svelte/src/lib/LineChart.svelte";
  import type { TimeSeriesChartProps } from "../../contracts/time-series-chart.js";

  let { label, series }: TimeSeriesChartProps = $props();
  const tones: readonly LineChartTone[] = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
  ];
</script>

<section aria-label={label}>
  {#each series as entry, index (entry.id)}
    <h3>{entry.label}</h3>
    <LineChart label={entry.label} data={entry.data} tone={tones[index % tones.length]} />
  {/each}
</section>
