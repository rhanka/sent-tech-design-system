import type { BenchId, BenchLabel, UnitInterval } from "./bench-types.js";
import type { ContractModule } from "./types.js";

export interface AcceptanceRateItem {
  id: BenchId;
  label: BenchLabel;
  /**
   * Accepted count.
   * @asType integer
   * @minimum 0
   * @maximum 1000000000
   */
  accepted: number;
  /**
   * Total evaluated count.
   * @asType integer
   * @minimum 1
   * @maximum 1000000000
   */
  total: number;
}

export interface AcceptanceRateChartProps {
  /** Chart name and accessible name. */
  label: BenchLabel;
  /**
   * Systems or configurations to compare.
   * @minItems 1
   * @maxItems 24
   */
  items: AcceptanceRateItem[];
  /** Target rate, drawn as the bullet target on every row. */
  target?: UnitInterval;
  /** Row order: as given (default) or by rate descending. */
  order?: "given" | "rate";
  /**
   * Name of the accepted outcome in labels. Default "accepted".
   * @minLength 1
   * @maxLength 24
   */
  acceptedLabel?: string;
}

const source = {
  file: "packages/elements/src/contracts/acceptance-rate-chart.ts",
  typeName: "AcceptanceRateChartProps",
};

export const acceptanceRateChartContract: ContractModule = {
  component: "AcceptanceRateChart",
  propsTypeName: "AcceptanceRateChartProps",
  source: {
    ...source,
    packageName: "@sentropic/design-system-elements",
    note: "Horizontal bullet chart comparing acceptance rates with 95% Wilson intervals.",
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
    element: "st-acceptance-rate-chart",
    engine: "core",
    events: [],
    fallback: "text",
  },
  example: {
    id: "root",
    component: "AcceptanceRateChart",
    label: "Acceptance rate by configuration",
    target: 0.8,
    items: [
      { id: "sys-a", label: "System A", accepted: 330, total: 400 },
      { id: "sys-b", label: "System B", accepted: 3, total: 4 },
    ],
  },
};
