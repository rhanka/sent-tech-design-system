/**
 * The package root: the catalogue registry and the envelope validator.
 * Everything a renderer imports at runtime is here; the Node-side
 * generator (src/generator) and the structure bridge it defaults to
 * (src/structure) are reachable through the validate barrel and never
 * re-exported separately.
 */

export {
  contracts,
  CATALOG_ID,
  ENVELOPE_ID,
  standaloneId,
  A2UI_COMMON_TYPES_ID,
  A2UI_PROTOCOL_VERSION,
} from "./contracts/index.js";
export type { ContractModule } from "./contracts/index.js";
export type { EpochMilliseconds, TimeSeries, TimeSeriesChartProps, TimeSeriesPoint } from "./contracts/index.js";
export type {
  AcceptanceRateChartProps,
  AcceptanceRateItem,
  BenchGroup,
  BenchId,
  BenchLabel,
  IsoF1Level,
  PrecisionRecallChartProps,
  PrecisionRecallPoint,
  RankCurveChartProps,
  RankCurveSeries,
  ScoreCostChartProps,
  ScoreCostPoint,
  UnitInterval,
} from "./contracts/index.js";
export { formatTimeSeriesMarkdown, TIME_SERIES_FALLBACK_LIMIT_BYTES } from "./format-time-series-markdown.js";
// P2-7 (track 01M88A0126QTC8DSTFX7AZJH9J): h2a companion item is
// "h2a must call format<Name>Markdown" (unverified; no h2a change here).
export {
  BENCH_CHART_FALLBACK_LIMIT_BYTES,
  acceptanceRateRows,
  describeAcceptanceRateChart,
  describePrecisionRecallChart,
  describeRankCurveChart,
  describeScoreCostChart,
  formatAcceptanceRateChartMarkdown,
  formatAcceptanceRateChartSummary,
  formatPrecisionRecallChartMarkdown,
  formatPrecisionRecallChartSummary,
  formatRankCurveChartMarkdown,
  formatRankCurveChartSummary,
  formatScoreCostChartMarkdown,
  formatScoreCostChartSummary,
  precisionRecallRows,
  rankCurveRows,
  scoreCostRows,
  type PrecisionRecallTableRow,
  type RankCurveTableRow,
  type ScoreCostTableRow,
} from "./bench-charts/index.js";
export * from "./validate/index.js";
