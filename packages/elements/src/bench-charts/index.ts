/**
 * Bench-chart formatters, row derivations, and accessible description builders
 * (§5.4, §10, lot B1). Lives outside `pureDirs` so it may import
 * `@sentropic/dataviz-core` while keeping `tests/purity.test.ts` green.
 *
 * P2-7 (track 01M88A0126QTC8DSTFX7AZJH9J): the companion h2a item for MCP
 * render text content is "h2a must call format<Name>Markdown" (status:
 * unverified in this repository; no h2a change in this lot).
 */

export {
  BENCH_CHART_FALLBACK_LIMIT_BYTES,
  formatCost,
  formatFixedHalfEven,
  formatPercent,
  formatProportion,
  markdownCell,
} from "./common.js";
export {
  describePrecisionRecallChart,
  formatPrecisionRecallChartMarkdown,
  formatPrecisionRecallChartSummary,
  precisionRecallRows,
  type PrecisionRecallTableRow,
} from "./precision-recall.js";
export {
  describeScoreCostChart,
  formatScoreCostChartMarkdown,
  formatScoreCostChartSummary,
  scoreCostRows,
  type ScoreCostTableRow,
} from "./score-cost.js";
export {
  describeRankCurveChart,
  formatRankCurveChartMarkdown,
  formatRankCurveChartSummary,
  rankCurveRows,
  type RankCurveTableRow,
} from "./rank-curve.js";
export {
  acceptanceRateRows,
  describeAcceptanceRateChart,
  formatAcceptanceRateChartMarkdown,
  formatAcceptanceRateChartSummary,
} from "./acceptance-rate.js";
