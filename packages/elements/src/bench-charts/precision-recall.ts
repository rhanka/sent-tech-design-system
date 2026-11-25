import type { PrecisionRecallChartProps } from "../contracts/precision-recall-chart.js";
import {
  formatProportion,
  markdownCell,
  renderBoundedMarkdownTable,
  resolveGroupMap,
  summaryLabel,
} from "./common.js";

export interface PrecisionRecallTableRow {
  readonly index: number;
  readonly id: string;
  readonly label: string;
  readonly groupLabel: string;
  readonly precision: number;
  readonly recall: number;
  readonly f1: number;
}

function computeF1(precision: number, recall: number): number {
  const sum = precision + recall;
  return sum > 0 ? (2 * precision * recall) / sum : 0;
}

/**
 * Canonical row order for PrecisionRecallChart: F1 descending, then id
 * ascending, keeping the 1-based `#` index in input `points` order.
 */
export function precisionRecallRows(props: PrecisionRecallChartProps): PrecisionRecallTableRow[] {
  const groupMap = resolveGroupMap(props.groups);
  const rows: PrecisionRecallTableRow[] = props.points.map((point, idx) => ({
    index: idx + 1,
    id: point.id,
    label: point.label,
    groupLabel: point.groupId !== undefined ? (groupMap.get(point.groupId) ?? "—") : "—",
    precision: point.precision,
    recall: point.recall,
    f1: computeF1(point.precision, point.recall),
  }));
  rows.sort((a, b) => {
    if (b.f1 !== a.f1) return b.f1 - a.f1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return rows;
}

/** One-line summary for PrecisionRecallChart (§5.4 / §8.2). */
export function formatPrecisionRecallChartSummary(props: PrecisionRecallChartProps): string {
  const pointCount = props.points.length;
  const groupCount = props.groups?.length ?? 0;
  const pNoun = pointCount === 1 ? "point" : "points";
  const gNoun = groupCount === 1 ? "group" : "groups";
  return `PrecisionRecallChart "${summaryLabel(props.label)}": ${pointCount} ${pNoun}, ${groupCount} ${gNoun}; valid.`;
}

/** Accessible one-sentence description shared by DOM table, fallback, and SVG `<desc>`. */
export function describePrecisionRecallChart(props: PrecisionRecallChartProps): string {
  const rows = precisionRecallRows(props);
  const best = rows[0];
  const pointCount = props.points.length;
  const groupCount = props.groups?.length ?? 0;
  const pText = `${pointCount} ${pointCount === 1 ? "point" : "points"}`;
  const gText = groupCount > 0 ? ` across ${groupCount} ${groupCount === 1 ? "group" : "groups"}` : "";
  if (best === undefined) return `${pText}${gText}.`;
  return `${pText}${gText}; highest F1 is ${formatProportion(best.f1)} (${best.label}).`;
}

/** Bounded Markdown fallback for validated PrecisionRecallChart props (≤ 4096 UTF-8 bytes). */
export function formatPrecisionRecallChartMarkdown(props: PrecisionRecallChartProps): string {
  const summary = formatPrecisionRecallChartSummary(props);
  const rows = precisionRecallRows(props).map((row) => [
    String(row.index),
    markdownCell(row.label),
    markdownCell(row.groupLabel),
    formatProportion(row.precision),
    formatProportion(row.recall),
    formatProportion(row.f1),
  ]);
  return renderBoundedMarkdownTable({
    summary,
    headers: ["#", "Label", "Group", "Precision", "Recall", "F1"],
    rows,
  });
}
