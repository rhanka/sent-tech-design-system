import type { BenchGroup, BenchId, BenchLabel, UnitInterval } from "./bench-types.js";
import type { ContractModule } from "./types.js";

export interface ScoreCostPoint {
  id: BenchId;
  label: BenchLabel;
  /**
   * Strictly positive cost in `costUnit`.
   * @exclusiveMinimum 0
   * @maximum 1e12
   */
  cost: number;
  /** The score (F1 by default). */
  score: UnitInterval;
  groupId?: BenchId;
}

export interface ScoreCostChartProps {
  /** Chart name and accessible name. */
  label: BenchLabel;
  /**
   * Evaluated points in draw order.
   * @minItems 1
   * @maxItems 200
   */
  points: ScoreCostPoint[];
  /**
   * Optional groups for categorical tone assignment.
   * @minItems 0
   * @maxItems 8
   */
  groups?: BenchGroup[];
  /**
   * Axis title of the score. Default "F1".
   * @minLength 1
   * @maxLength 24
   */
  scoreLabel?: string;
  /**
   * Unit printed on the cost axis and in the table, e.g. "USD per 1k items".
   * @minLength 1
   * @maxLength 32
   */
  costUnit: string;
  /** Draw the Pareto frontier (lowest cost for a given score or better). Default true. */
  frontier?: boolean;
}

const source = {
  file: "packages/elements/src/contracts/score-cost-chart.ts",
  typeName: "ScoreCostChartProps",
};

export const scoreCostChartContract: ContractModule = {
  component: "ScoreCostChart",
  propsTypeName: "ScoreCostChartProps",
  source: {
    ...source,
    packageName: "@sentropic/design-system-elements",
    note: "Score vs cost scatter chart on a logarithmic x axis with Pareto frontier.",
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
    element: "st-score-cost-chart",
    engine: "core",
    events: [],
    fallback: "text",
  },
  example: {
    id: "root",
    component: "ScoreCostChart",
    label: "F1 vs inference cost",
    costUnit: "USD per 1k items",
    points: [
      { id: "sys-a", label: "System A", cost: 0.4, score: 0.72 },
      { id: "sys-b", label: "System B", cost: 1.8, score: 0.86 },
    ],
  },
};
