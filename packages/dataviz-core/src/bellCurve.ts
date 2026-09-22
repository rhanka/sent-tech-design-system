/**
 * Bell curve chart data builder.
 *
 * Collects finite numeric values of a `measure` field from raw rows and
 * returns them as a plain number array — the DS BellCurveChart component
 * accepts a raw numeric sample and computes the normal distribution curve
 * internally.
 *
 * Non-finite values are dropped silently (mirrors the null-handling pattern
 * used in scatter.ts and candlestick.ts).
 */

import { type DataModel, type Row } from './model.js';

export interface BellCurveConfig {
  /** Field id whose finite numeric values form the sample distribution. */
  measure: string;
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
 * Build bell curve sample data from raw rows by collecting finite numeric
 * values of the configured measure field.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { measure } — field id of the numeric sample
 */
export function buildBellCurveData(
  _model: DataModel,
  rows: readonly Row[],
  config: BellCurveConfig,
): number[] {
  const data: number[] = [];

  for (const row of rows) {
    const v = toFiniteNumber(row[config.measure]);
    if (v !== undefined) {
      data.push(v);
    }
  }

  return data;
}
