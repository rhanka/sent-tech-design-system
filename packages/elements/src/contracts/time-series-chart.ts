import type { ChartBand, ChartGoalLine, ChartReferenceLine } from "./bar-chart.js";
import type { ContractModule } from "./types.js";

/** A UTC instant as whole milliseconds since 1970-01-01T00:00:00Z. */
export type EpochMilliseconds = number;

export interface TimeSeriesPoint {
  /**
   * Whole UTC Unix epoch milliseconds, in the ISO instant range.
   * @asType integer
   * @minimum -8640000000000000
   * @maximum 8640000000000000
   */
  x: EpochMilliseconds;
  /** Finite measured value. */
  y: number;
}

export interface TimeSeries {
  /**
   * Stable identifier, unique within the chart.
   * @minLength 1
   */
  id: string;
  /**
   * Human-readable series name.
   * @minLength 1
   */
  label: string;
  /** Observations in strictly increasing timestamp order. */
  data: TimeSeriesPoint[];
}

export interface TimeSeriesChartProps {
  /**
   * Human-readable chart name.
   * @minLength 1
   */
  label: string;
  /**
   * Series in display order.
   * @minItems 1
   */
  series: TimeSeries[];
  /** Reference lines. An x-axis value is in whole UTC epoch milliseconds. */
  referenceLines?: ChartReferenceLine[];
  /** Bands in value-axis units, applied to each series. */
  bands?: ChartBand[];
  /** Goal in value-axis units, applied to each series. */
  goalLine?: ChartGoalLine;
}

const source = {
  file: "packages/elements/src/element/dom/time-series-chart.svelte",
  typeName: "TimeSeriesChartProps",
};

export const timeSeriesChartContract: ContractModule = {
  component: "TimeSeriesChart",
  propsTypeName: "TimeSeriesChartProps",
  source: {
    ...source,
    packageName: "@sentropic/design-system-elements",
    note: "Composition of the Svelte LineChart, sharing a UTC time domain and analytical overlays.",
  },
  excluded: [],
  replacedTypes: [],
  narrowedUnions: [],
  callbacks: [],
  frameworks: [
    { ...source, framework: "svelte", role: "source-of-truth" },
    { ...source, framework: "react", role: "no-counterpart" },
    { ...source, framework: "vue", role: "no-counterpart" },
    { ...source, framework: "angular", role: "no-counterpart" },
  ],
  metadata: {
    contract: "1.0",
    element: "st-time-series-chart",
    engine: "core",
    events: [],
    fallback: "text",
  },
  example: {
    id: "root",
    component: "TimeSeriesChart",
    label: "Queue depth",
    series: [{ id: "jobs", label: "Jobs", data: [{ x: 1767225600123, y: 4 }, { x: 1767225601123, y: 7 }] }],
  },
};
