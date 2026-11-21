<script lang="ts">
  import LineChart, { type LineChartTone } from "../../../../components-svelte/src/lib/LineChart.svelte";
  import type { TimeSeriesChartProps } from "../../contracts/time-series-chart.js";

  let { label, series, referenceLines, bands, goalLine }: TimeSeriesChartProps = $props();
  const tones: readonly LineChartTone[] = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
  ];

  const xDomain = $derived.by<[number, number] | undefined>(() => {
    let start = Infinity;
    let end = -Infinity;
    for (const { data } of series) {
      if (data.length === 0) continue;
      start = Math.min(start, data[0]!.x);
      end = Math.max(end, data[data.length - 1]!.x);
    }
    for (const { axis, value } of referenceLines ?? []) {
      if (axis !== "x") continue;
      start = Math.min(start, value);
      end = Math.max(end, value);
    }
    return start === Infinity ? undefined : [start, end];
  });

  function formatTime(value: number | string): string {
    return new Date(Number(value)).toISOString();
  }
</script>

<section aria-label={label}>
  {#each series as entry, index (entry.id)}
    <h3>{entry.label}</h3>
    <LineChart
      label={entry.label}
      data={entry.data}
      tone={tones[index % tones.length]}
      {xDomain}
      formatX={formatTime}
      {referenceLines}
      {bands}
      {goalLine}
      showDataList={false}
    />
  {/each}
</section>
