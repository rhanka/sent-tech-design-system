/**
 * Range chart data builders.
 *
 * Provides two builders for range-style charts:
 *
 * - `buildAreaRangeData` — for AreaRangeChart / AreaSplineRangeChart where
 *   each datum uses an `x` field (string or numeric label) and `low`/`high`
 *   numeric bounds.
 *
 * - `buildColumnRangeData` — for ColumnRangeChart / DumbbellChart where each
 *   datum uses a `category` string and `low`/`high` numeric bounds.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * either `low` or `high` is non-finite (mirrors the null-handling pattern in
 * scatter.ts and candlestick.ts).
 */

import { type DataModel, type Row } from './model.js';

export interface AreaRangeDatum {
  x: string;
  low: number;
  high: number;
}

export interface AreaRangeConfig {
  /** Field id whose value becomes the x axis label (string-coerced). */
  x: string;
  /** Field id whose numeric value becomes the lower bound. */
  low: string;
  /** Field id whose numeric value becomes the upper bound. */
  high: string;
}

export interface ColumnRangeDatum {
  category: string;
  low: number;
  high: number;
}

export interface ColumnRangeConfig {
  /** Field id whose value becomes the category label (string-coerced). */
  category: string;
  /** Field id whose numeric value becomes the lower bound. */
  low: string;
  /** Field id whose numeric value becomes the upper bound. */
  high: string;
}

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
 * Build area range chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, low, high } — field ids
 */
export function buildAreaRangeData(
  _model: DataModel,
  rows: readonly Row[],
  config: AreaRangeConfig,
): AreaRangeDatum[] {
  const data: AreaRangeDatum[] = [];

  for (const row of rows) {
    const low = toFiniteNumber(row[config.low]);
    const high = toFiniteNumber(row[config.high]);

    if (low === undefined || high === undefined) {
      continue;
    }

    const xRaw = row[config.x];
    const x = xRaw == null ? '' : String(xRaw);

    data.push({ x, low, high });
  }

  return data;
}

/**
 * Build column range chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { category, low, high } — field ids
 */
export function buildColumnRangeData(
  _model: DataModel,
  rows: readonly Row[],
  config: ColumnRangeConfig,
): ColumnRangeDatum[] {
  const data: ColumnRangeDatum[] = [];

  for (const row of rows) {
    const low = toFiniteNumber(row[config.low]);
    const high = toFiniteNumber(row[config.high]);

    if (low === undefined || high === undefined) {
      continue;
    }

    const categoryRaw = row[config.category];
    const category = categoryRaw == null ? '' : String(categoryRaw);

    data.push({ category, low, high });
  }

  return data;
}
