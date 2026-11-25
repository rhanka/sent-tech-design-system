import type { BenchGroup, BenchId, BenchLabel, IsoF1Level, UnitInterval } from "./bench-types.js";
import type { ContractModule } from "./types.js";

export interface PrecisionRecallPoint {
  id: BenchId;
  label: BenchLabel;
  precision: UnitInterval;
  recall: UnitInterval;
  groupId?: BenchId;
}

export interface PrecisionRecallChartProps {
  /** Chart name and accessible name. */
  label: BenchLabel;
  /**
   * Evaluated points in draw order.
   * @minItems 1
   * @maxItems 200
   */
  points: PrecisionRecallPoint[];
  /**
   * Optional groups for categorical tone assignment.
   * @minItems 0
   * @maxItems 8
   */
  groups?: BenchGroup[];
  /**
   * Iso-F1 levels, strictly increasing. Default [0.2, 0.4, 0.6, 0.8].
   * @minItems 0
   * @maxItems 9
   */
  isoF1?: IsoF1Level[];
  /** "unit" = both axes [0, 1] (default). "fit" = tight domain around the points. */
  domain?: "unit" | "fit";
}

// B1 contract-first source; B2 adds the Svelte composition module.
const source = {
  file: "packages/elements/src/contracts/precision-recall-chart.ts",
  typeName: "PrecisionRecallChartProps",
};

export const precisionRecallChartContract: ContractModule = {
  component: "PrecisionRecallChart",
  propsTypeName: "PrecisionRecallChartProps",
  source: {
    ...source,
    packageName: "@sentropic/design-system-elements",
    note: "Precision-recall scatter chart with iso-F1 curves, derived F1, and bounded text fallback.",
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
    element: "st-precision-recall-chart",
    engine: "core",
    events: [],
    fallback: "text",
  },
  example: {
    id: "root",
    component: "PrecisionRecallChart",
    label: "Retrieval precision vs recall",
    groups: [{ id: "g1", label: "Baseline" }],
    points: [
      { id: "sys-a", label: "System A", precision: 0.85, recall: 0.72, groupId: "g1" },
      { id: "sys-b", label: "System B", precision: 0.74, recall: 0.88, groupId: "g1" },
    ],
  },
};
