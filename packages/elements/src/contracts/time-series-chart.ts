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
}
