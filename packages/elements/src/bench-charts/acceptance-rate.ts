import { buildAcceptanceRates, type AcceptanceRateRow } from "@sentropic/dataviz-core";
import type { AcceptanceRateChartProps } from "../contracts/acceptance-rate-chart.js";
import {
  formatPercent,
  formatProportion,
  markdownCell,
  renderBoundedMarkdownTable,
  summaryLabel,
} from "./common.js";

/** Compute rendered AcceptanceRateChart rows with Wilson 95 % intervals. */
export function acceptanceRateRows(props: AcceptanceRateChartProps): AcceptanceRateRow[] {
  return buildAcceptanceRates(props.items, { order: props.order ?? "given" });
}

/** One-line summary for AcceptanceRateChart (§5.4 / §8.2). */
export function formatAcceptanceRateChartSummary(props: AcceptanceRateChartProps): string {
  const count = props.items.length;
  const noun = count === 1 ? "item" : "items";
  const targetPart = props.target !== undefined ? `, target ${formatProportion(props.target)}` : "";
  return `AcceptanceRateChart "${summaryLabel(props.label)}": ${count} ${noun}${targetPart}; valid.`;
}

/** Accessible one-sentence description shared by DOM table, fallback, and SVG `<desc>`. */
export function describeAcceptanceRateChart(props: AcceptanceRateChartProps): string {
  const rows = acceptanceRateRows(props);
  const count = rows.length;
  const noun = count === 1 ? "item" : "items";
  if (count === 0) return `0 ${noun}.`;
  const best = [...rows].sort((a, b) => b.rate - a.rate)[0]!;
  const base = `${count} ${noun}; best rate is ${best.valueText} (${best.label})`;
  if (props.target === undefined) return `${base}.`;
  const metCount = rows.filter((row) => row.rate >= props.target!).length;
  return `${base}, ${metCount} of ${count} meet the ${formatPercent(props.target)} target.`;
}

/** Bounded Markdown fallback for validated AcceptanceRateChart props (≤ 4096 UTF-8 bytes). */
export function formatAcceptanceRateChartMarkdown(props: AcceptanceRateChartProps): string {
  const summary = formatAcceptanceRateChartSummary(props);
  const targetCell = props.target !== undefined ? formatProportion(props.target) : "—";
  const rows = acceptanceRateRows(props).map((row) => [
    markdownCell(row.label),
    String(row.accepted),
    String(row.total),
    formatProportion(row.rate),
    `[${formatProportion(row.interval[0])}, ${formatProportion(row.interval[1])}]`,
    targetCell,
  ]);
  return renderBoundedMarkdownTable({
    summary,
    headers: ["Label", "Accepted", "Total", "Rate", "95 % interval", "Target"],
    rows,
  });
}
