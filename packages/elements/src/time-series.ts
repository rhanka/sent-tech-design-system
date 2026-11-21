import type { TimeSeriesChartProps } from "./contracts/time-series-chart.js";

/** Observations in timestamp order, with fixture series order breaking ties. */
export function timeSeriesRows({ series }: TimeSeriesChartProps) {
  const seenLabels = new Set<string>();
  const repeatedLabels = new Set<string>();
  for (const { label } of series) {
    if (seenLabels.has(label)) repeatedLabels.add(label);
    seenLabels.add(label);
  }
  return series
    .flatMap(({ id, label, data }) => {
      const seriesLabel = repeatedLabels.has(label) ? `${label} (${id})` : label;
      return data.map(({ x, y }) => ({ x, series: seriesLabel, y }));
    })
    .sort((left, right) => left.x - right.x);
}

/** UTC ISO timestamp with millisecond precision, independent of locale. */
export function formatTimeSeriesInstant(x: number): string {
  return new Date(x).toISOString();
}
