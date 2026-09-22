/**
 * Grouping and aggregation primitives.
 *
 * All functions are pure and side-effect free. Aggregations guard against
 * non-finite numbers (NaN, Infinity). Empty sum/count return 0; empty
 * avg/min/max return NaN so callers can distinguish "no data" from a real 0.
 */

import type { Aggregation, Measure, Row } from './model.js';

/**
 * Partition rows by the distinct value of `dimensionId`.
 *
 * The returned map preserves first-seen key order. Keys are stringified so the
 * map is stable regardless of the underlying cell type (number/boolean/string).
 * A `null`/`undefined` cell groups under the literal key `"null"`.
 */
export function groupBy(rows: Row[], dimensionId: string): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const raw = row[dimensionId];
    const key = raw == null ? 'null' : String(raw);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
}

/** Coerce a cell to a finite number, or `undefined` if it is not numeric. */
function toFinite(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Aggregate the `measure` over `rows` using the measure's aggregation.
 *
 * - `count` counts *rows* (not non-null values) — it returns `rows.length`.
 * - `sum`/`avg`/`min`/`max` ignore non-finite / non-numeric cells.
 * - An empty input (or one with no numeric cells) returns `0` for sum/count
 *   and `NaN` for avg/min/max.
 */
export function aggregate(rows: Row[], measure: Measure): number {
  return aggregateValues(extractNumbers(rows, measure.id), measure.aggregation, rows.length);
}

/** Lower-level helper: aggregate a raw value array by aggregation kind. */
export function aggregateValues(
  values: number[],
  aggregation: Aggregation,
  rowCount = values.length,
): number {
  switch (aggregation) {
    case 'count':
      return rowCount;
    case 'sum':
      return values.reduce((acc, v) => acc + v, 0);
    case 'avg':
      return values.length === 0
        ? Number.NaN
        : values.reduce((acc, v) => acc + v, 0) / values.length;
    case 'min':
      return values.length === 0
        ? Number.NaN
        : values.reduce((acc, v) => (v < acc ? v : acc), values[0]!);
    case 'max':
      return values.length === 0
        ? Number.NaN
        : values.reduce((acc, v) => (v > acc ? v : acc), values[0]!);
    default: {
      // Exhaustiveness guard — unreachable for a valid Aggregation.
      const _never: never = aggregation;
      throw new Error(`Unknown aggregation: ${String(_never)}`);
    }
  }
}

/** Extract the finite numeric values of `field` across `rows`. */
export function extractNumbers(rows: Row[], field: string): number[] {
  const out: number[] = [];
  for (const row of rows) {
    const n = toFinite(row[field]);
    if (n !== undefined) out.push(n);
  }
  return out;
}

/**
 * Group rows by a dimension then aggregate a measure within each group.
 * Returns one `{ key, value }` per distinct dimension value, in first-seen order.
 */
export function groupAggregate(
  rows: Row[],
  dimensionId: string,
  measure: Measure,
): Array<{ key: string; value: number }> {
  const groups = groupBy(rows, dimensionId);
  const out: Array<{ key: string; value: number }> = [];
  for (const [key, bucket] of groups) {
    out.push({ key, value: aggregate(bucket, measure) });
  }
  return out;
}
