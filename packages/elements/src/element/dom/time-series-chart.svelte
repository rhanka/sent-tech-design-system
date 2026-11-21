<script lang="ts">
  import LineChart, { type LineChartTone } from "../../../../components-svelte/src/lib/LineChart.svelte";
  import type { TimeSeriesChartProps } from "../../contracts/time-series-chart.js";
  import { formatTimeSeriesInstant, timeSeriesRows } from "../../time-series.js";

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

  const rows = $derived(timeSeriesRows({ label, series }));
</script>

<section aria-label={label}>
  {#each series as entry, index (entry.id)}
    <h3>{entry.label}</h3>
    <LineChart
      label={entry.label}
      data={entry.data}
      tone={tones[index % tones.length]}
      {xDomain}
      formatX={(value) => formatTimeSeriesInstant(Number(value))}
      {referenceLines}
      {bands}
      {goalLine}
      showDataList={false}
    />
  {/each}
  <table>
    <caption>{label}</caption>
    <thead>
      <tr>
        <th scope="col">Time (UTC)</th>
        <th scope="col">Series</th>
        <th scope="col">Series ID</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (`${row.x}:${row.seriesId}`)}
        {@const instant = formatTimeSeriesInstant(row.x)}
        <tr>
          <td><time datetime={instant}>{instant}</time></td>
          <td>{row.seriesLabel}</td>
          <td>{row.seriesId}</td>
          <td>{row.y}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  caption,
  th,
  td {
    padding: 0.5rem;
    text-align: start;
  }
  th,
  td {
    border-block-end: 1px solid var(--st-semantic-border-subtle);
  }
</style>
