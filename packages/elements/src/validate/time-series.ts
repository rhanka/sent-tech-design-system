import type { TimeSeriesChartProps } from "../contracts/time-series-chart.js";
import type { Diagnostic } from "./diagnostics.js";

function invalid(path: string, message: string): Diagnostic {
  return { code: "semantic-invalid", path, message, severity: "error", source: "catalog" };
}

/** Cross-record rules, after the JSON Schema has accepted the shape. */
export function validateTimeSeries({ series, referenceLines }: TimeSeriesChartProps): readonly Diagnostic[] {
  const ids = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  for (const [index, entry] of series.entries()) {
    const path = `/root/series/${index}`;
    if (ids.has(entry.id)) diagnostics.push(invalid(`${path}/id`, "series id must be unique"));
    ids.add(entry.id);
    let previous = -Infinity;
    for (const [pointIndex, { x }] of entry.data.entries()) {
      if (x <= previous) {
        diagnostics.push(invalid(`${path}/data/${pointIndex}/x`, "timestamps must increase strictly within a series"));
      }
      previous = x;
    }
  }
  for (const [index, line] of (referenceLines ?? []).entries()) {
    if (line.axis === "x" && (!Number.isInteger(line.value) || Math.abs(line.value) > 8_640_000_000_000_000)) {
      diagnostics.push(invalid(`/root/referenceLines/${index}/value`, "x-axis references require whole UTC epoch milliseconds"));
    }
  }
  return diagnostics;
}
