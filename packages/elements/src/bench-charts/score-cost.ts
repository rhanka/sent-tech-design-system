import { paretoFrontier } from "@sentropic/dataviz-core";
import type { ScoreCostChartProps } from "../contracts/score-cost-chart.js";
import {
  formatCost,
  formatProportion,
  markdownCell,
  renderBoundedMarkdownTable,
  resolveGroupMap,
  summaryLabel,
} from "./common.js";

export interface ScoreCostTableRow {
  readonly index: number;
  readonly id: string;
  readonly label: string;
  readonly groupLabel: string;
  readonly cost: number;
  readonly score: number;
  readonly onFrontier: boolean;
}

/**
 * Canonical row order for ScoreCostChart: frontier points first by cost
 * ascending, then remaining points by score descending, then id ascending.
 */
export function scoreCostRows(props: ScoreCostChartProps): ScoreCostTableRow[] {
  const groupMap = resolveGroupMap(props.groups);
  const showFrontier = props.frontier !== false;
  const frontierSet = showFrontier
    ? new Set(paretoFrontier(props.points, { minimize: "cost", maximize: "score" }).ids)
    : new Set<string>();

  const rows: ScoreCostTableRow[] = props.points.map((point, idx) => ({
    index: idx + 1,
    id: point.id,
    label: point.label,
    groupLabel: point.groupId !== undefined ? (groupMap.get(point.groupId) ?? "—") : "—",
    cost: point.cost,
    score: point.score,
    onFrontier: frontierSet.has(point.id),
  }));

  rows.sort((a, b) => {
    if (a.onFrontier !== b.onFrontier) return a.onFrontier ? -1 : 1;
    if (a.onFrontier) {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return rows;
}

/** One-line summary for ScoreCostChart (§5.4 / §8.2). */
export function formatScoreCostChartSummary(props: ScoreCostChartProps): string {
  const pointCount = props.points.length;
  const groupCount = props.groups?.length ?? 0;
  const pNoun = pointCount === 1 ? "point" : "points";
  const gNoun = groupCount === 1 ? "group" : "groups";
  return `ScoreCostChart "${summaryLabel(props.label)}": ${pointCount} ${pNoun}, ${groupCount} ${gNoun}; valid.`;
}

/** Accessible one-sentence description shared by DOM table, fallback, and SVG `<desc>`. */
export function describeScoreCostChart(props: ScoreCostChartProps): string {
  const rows = scoreCostRows(props);
  const pointCount = props.points.length;
  const pText = `${pointCount} ${pointCount === 1 ? "point" : "points"} in ${props.costUnit}`;
  if (rows.length === 0) return `${pText}.`;
  const frontierCount = rows.filter((row) => row.onFrontier).length;
  const top = [...rows].sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1))[0]!;
  const scoreName = props.scoreLabel ?? "F1";
  const frontierText = props.frontier === false ? "" : `${frontierCount} on the Pareto frontier, `;
  return `${pText}; ${frontierText}top ${scoreName} is ${formatProportion(top.score)} (${top.label}).`;
}

/** Bounded Markdown fallback for validated ScoreCostChart props (≤ 4096 UTF-8 bytes). */
export function formatScoreCostChartMarkdown(props: ScoreCostChartProps): string {
  const summary = formatScoreCostChartSummary(props);
  const scoreHeader = markdownCell(props.scoreLabel ?? "F1");
  const costHeader = `Cost (${markdownCell(props.costUnit)})`;
  const rows = scoreCostRows(props).map((row) => [
    String(row.index),
    markdownCell(row.label),
    markdownCell(row.groupLabel),
    formatCost(row.cost),
    formatProportion(row.score),
    row.onFrontier ? "yes" : "no",
  ]);
  return renderBoundedMarkdownTable({
    summary,
    headers: ["#", "Label", "Group", costHeader, scoreHeader, "Frontier"],
    rows,
  });
}
