/**
 * Correlation matrix data builder.
 *
 * Computes pairwise Pearson correlation coefficients between a set of numeric
 * measures and returns HeatmapChart-compatible datum objects (one per cell in
 * the full NxN matrix, diagonal included).
 *
 * A row is excluded from a pair's computation when either of the two measure
 * values is non-finite (mirrors the null-handling pattern used in scatter.ts
 * and candlestick.ts).
 */

import { type DataModel, type Row, findMeasure } from './model.js';

/** One cell in the correlation matrix, compatible with DS HeatmapChartDatum. */
export interface CorrelationDatum {
  /** Label of the measure on the X axis. */
  x: string;
  /** Label of the measure on the Y axis. */
  y: string;
  /** Pearson correlation coefficient, rounded to 4 decimal places. */
  value: number;
}

/** Configuration for {@link buildCorrelationMatrix}. */
export interface CorrelationConfig {
  /**
   * List of measure field ids to include in the matrix.
   * At least two ids are required for a meaningful matrix.
   */
  measures: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Compute the Pearson correlation coefficient between two numeric arrays
 * (must be the same length, length ≥ 2, otherwise returns NaN).
 */
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return NaN;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = xs[i]!;
    const y = ys[i]!;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (den === 0) return NaN;
  return num / den;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a full NxN correlation matrix from raw rows.
 *
 * For each pair (i, j) of measures, pairs of row values are collected, rows
 * where either value is non-finite are silently dropped, and the Pearson
 * coefficient is computed on the filtered pairs. The diagonal always equals 1.
 *
 * @param model  DataModel — used to resolve measure labels via `findMeasure`.
 * @param rows   Filtered rows from `store.applyCrossfilter(viewId)`.
 * @param config `{ measures }` — ordered list of measure field ids.
 * @returns      Array of `CorrelationDatum` objects (length = measures.length²).
 */
export function buildCorrelationMatrix(
  model: DataModel,
  rows: readonly Row[],
  config: CorrelationConfig,
): CorrelationDatum[] {
  const { measures } = config;

  // Resolve labels once
  const labels: string[] = measures.map(
    (id) => findMeasure(model, id)?.label ?? id,
  );

  const result: CorrelationDatum[] = [];

  for (let i = 0; i < measures.length; i++) {
    for (let j = 0; j < measures.length; j++) {
      const xi = measures[i]!;
      const xj = measures[j]!;
      const labelI = labels[i]!;
      const labelJ = labels[j]!;

      // Diagonal — exact 1 by definition
      if (i === j) {
        result.push({ x: labelI, y: labelJ, value: 1 });
        continue;
      }

      // Collect finite pairs
      const xs: number[] = [];
      const ys: number[] = [];
      for (const row of rows) {
        const a = toFiniteNumber(row[xi]);
        const b = toFiniteNumber(row[xj]);
        if (a === undefined || b === undefined) continue;
        xs.push(a);
        ys.push(b);
      }

      const r = pearson(xs, ys);
      // Round to 4 decimal places; clamp to [-1, 1] to absorb float drift
      const value = Number.isFinite(r)
        ? Math.round(Math.max(-1, Math.min(1, r)) * 10000) / 10000
        : 0;

      result.push({ x: labelI, y: labelJ, value });
    }
  }

  return result;
}
