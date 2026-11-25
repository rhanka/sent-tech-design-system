import type { BenchId, BenchLabel, UnitInterval } from "./bench-types.js";
import type { ContractModule } from "./types.js";

export interface RankCurveSeries {
  id: BenchId;
  label: BenchLabel;
  /**
   * One value per evaluated item, in any order.
   * @minItems 1
   * @maxItems 2000
   */
  values: UnitInterval[];
}

export interface RankCurveChartProps {
  /** Chart name and accessible name. */
  label: BenchLabel;
  /**
   * Series to compare as small-multiple rank curves.
   * @minItems 1
   * @maxItems 4
   */
  series: RankCurveSeries[];
  /**
   * Axis title of the value. Default "Recall".
   * @minLength 1
   * @maxLength 24
   */
  valueLabel?: string;
  /**
   * Noun for one ranked item, e.g. "query". Default "item".
   * @minLength 1
   * @maxLength 24
   */
  itemLabel?: string;
  /** x axis: absolute rank (default) or rank as a share of the series length. */
  rankAxis?: "rank" | "percent";
}

const source = {
  file: "packages/elements/src/contracts/rank-curve-chart.ts",
  typeName: "RankCurveChartProps",
};

export const rankCurveChartContract: ContractModule = {
  component: "RankCurveChart",
  propsTypeName: "RankCurveChartProps",
  source: {
    ...source,
    packageName: "@sentropic/design-system-elements",
    note: "Sorted per-item distribution rendered as small-multiple rank curves.",
  },
  excluded: [],
  replacedTypes: [],
  narrowedUnions: [],
  callbacks: [],
  frameworks: [
    { ...source, framework: "svelte", role: "source-of-truth" },
    { framework: "react", file: "packages/components-react", typeName: "", role: "no-counterpart" },
    { framework: "vue", file: "packages/components-vue", typeName: "", role: "no-counterpart" },
    { framework: "angular", file: "packages/components-angular", typeName: "", role: "no-counterpart" },
  ],
  metadata: {
    contract: "1.0",
    element: "st-rank-curve-chart",
    engine: "core",
    events: [],
    fallback: "text",
  },
  example: {
    id: "root",
    component: "RankCurveChart",
    label: "Per-query recall distribution",
    valueLabel: "Recall",
    itemLabel: "query",
    series: [
      { id: "sys-a", label: "System A", values: [0.95, 0.82, 0.6, 0] },
      { id: "sys-b", label: "System B", values: [0.9, 0.75, 0.55, 0.2] },
    ],
  },
};
