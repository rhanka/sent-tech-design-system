import type { TimeSeriesChartProps } from "./contracts/time-series-chart.js";

/** Observations in timestamp order, with fixture series order breaking ties. */
export function timeSeriesRows({ series }: TimeSeriesChartProps) {
  return series
    .flatMap(({ id, label, data }) => data.map(({ x, y }) => ({ x, seriesId: id, seriesLabel: label, y })))
    .sort((left, right) => left.x - right.x);
}

/** UTC ISO timestamp with millisecond precision, independent of locale. */
export function formatTimeSeriesInstant(x: number): string {
  return new Date(x).toISOString();
}
