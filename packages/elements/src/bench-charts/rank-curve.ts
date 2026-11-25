import { buildRankCurve, type RankCurveModel } from "@sentropic/dataviz-core";
import type { RankCurveChartProps } from "../contracts/rank-curve-chart.js";
import {
  formatProportion,
  markdownCell,
  renderBoundedMarkdownTable,
  summaryLabel,
} from "./common.js";

export interface RankCurveTableRow {
  readonly id: string;
  readonly label: string;
  readonly model: RankCurveModel;
}

/** Build rank-curve summaries for every series in input order. */
export function rankCurveRows(props: RankCurveChartProps): RankCurveTableRow[] {
  const axis = props.rankAxis ?? "rank";
  return props.series.map((entry) => ({
    id: entry.id,
    label: entry.label,
    model: buildRankCurve(entry.values, { axis }),
  }));
}

/** One-line summary for RankCurveChart (§5.4 / §8.2). */
export function formatRankCurveChartSummary(props: RankCurveChartProps): string {
  const seriesCount = props.series.length;
  const totalValues = props.series.reduce((sum, entry) => sum + entry.values.length, 0);
  const itemNoun = props.itemLabel ?? "item";
  return `RankCurveChart "${summaryLabel(props.label)}": ${seriesCount} series, ${totalValues} ${itemNoun} values; valid.`;
}

/** Accessible one-sentence description shared by DOM table, fallback, and SVG `<desc>`. */
export function describeRankCurveChart(props: RankCurveChartProps): string {
  const rows = rankCurveRows(props);
  const seriesCount = rows.length;
  if (seriesCount === 0) return "0 series.";
  const best = [...rows].sort((a, b) => b.model.summary.median - a.model.summary.median)[0]!;
  const valueName = props.valueLabel ?? "Recall";
  const { n, median, zeroCount } = best.model.summary;
  return `${seriesCount} series; best median ${valueName} is ${formatProportion(median)} (${best.label}, n=${n}, ${zeroCount} at 0).`;
}

/** Bounded Markdown fallback for validated RankCurveChart props (≤ 4096 UTF-8 bytes). */
export function formatRankCurveChartMarkdown(props: RankCurveChartProps): string {
  const summary = formatRankCurveChartSummary(props);
  const rows = rankCurveRows(props).map(({ label, model }) => {
    const s = model.summary;
    return [
      markdownCell(label),
      String(s.n),
      formatProportion(s.mean),
      formatProportion(s.min),
      formatProportion(s.p10),
      formatProportion(s.median),
      formatProportion(s.p90),
      formatProportion(s.max),
      String(s.zeroCount),
    ];
  });
  return renderBoundedMarkdownTable({
    summary,
    headers: ["Series", "n", "Mean", "Min", "P10", "Median", "P90", "Max", "Zeros"],
    rows,
  });
}
