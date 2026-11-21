import type { TimeSeriesChartProps } from "./contracts/time-series-chart.js";
import { formatTimeSeriesInstant, timeSeriesRows } from "./time-series.js";
import { utf8ByteLength } from "./validate/envelope.js";

export const TIME_SERIES_FALLBACK_LIMIT_BYTES = 4096;

function markdownCell(value: string): string {
  return value
    .replace(/[&<>|\\`*_\[\]~!]/g, (character) => `&#${character.charCodeAt(0)};`)
    .replace(/\r\n|[\r\n]/g, "&#10;");
}

/** Markdown fallback for validated props. Fails if the complete table exceeds 4 KiB. */
export function formatTimeSeriesMarkdown(props: TimeSeriesChartProps): string {
  const header = "| Time (UTC) | Series | Series ID | Value |\n| --- | --- | --- | --- |";
  const lines = [header];
  let bytes = utf8ByteLength(header);
  for (const { x, seriesId, seriesLabel, y } of timeSeriesRows(props)) {
    const line = `| ${formatTimeSeriesInstant(x)} | ${markdownCell(seriesLabel)} | ${markdownCell(seriesId)} | ${y} |`;
    bytes += 1 + utf8ByteLength(line);
    if (bytes > TIME_SERIES_FALLBACK_LIMIT_BYTES) {
      throw new RangeError(`TimeSeriesChart Markdown table exceeds ${TIME_SERIES_FALLBACK_LIMIT_BYTES} UTF-8 bytes`);
    }
    lines.push(line);
  }
  return lines.join("\n");
}
