/**
 * Shared contract types for the four bench-result charts (§5.2).
 * Bounds on array items are carried by typed aliases so ts-json-schema-generator
 * emits item constraints directly in the generated JSON Schemas.
 */

/**
 * Stable identifier, unique within the chart.
 * @minLength 1
 * @maxLength 64
 * @pattern ^[A-Za-z0-9._:-]+$
 */
export type BenchId = string;

/**
 * Human-readable name.
 * @minLength 1
 * @maxLength 80
 */
export type BenchLabel = string;

/**
 * A proportion.
 * @minimum 0
 * @maximum 1
 */
export type UnitInterval = number;

/**
 * An iso-F1 level, strictly inside (0, 1).
 * @exclusiveMinimum 0
 * @exclusiveMaximum 1
 */
export type IsoF1Level = number;

/** Optional grouping; drives the categorical tone (category1..8) in first-appearance order. */
export interface BenchGroup {
  id: BenchId;
  label: BenchLabel;
}
