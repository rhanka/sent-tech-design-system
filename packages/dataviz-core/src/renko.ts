/**
 * Renko chart data builder.
 *
 * Maps the date and close fields from raw rows into RenkoPoint-compatible
 * objects, as expected by the DS RenkoChart component (which stacks fixed-size
 * price bricks, ignoring regular time: a new brick only appears when `boxSize`
 * is crossed).
 *
 * A row is dropped silently when `date` or `close` is non-finite (mirrors the
 * null-handling pattern in density2d.ts and ribbon.ts).
 */

import { type DataModel, type Row } from './model.js';

export type RenkoPoint = { date: number; close: number };

export interface RenkoConfig {
  /** Field id whose numeric value becomes the point's date (timestamp/index). */
  date: string;
  /** Field id whose numeric value becomes the point's close price. */
  close: string;
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
 * Build Renko data from raw rows by mapping the date and close fields. Rows
 * whose date or close is non-finite are dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { date, close } — field ids
 */
export function buildRenkoData(
  _model: DataModel,
  rows: readonly Row[],
  config: RenkoConfig,
): RenkoPoint[] {
  const data: RenkoPoint[] = [];

  for (const row of rows) {
    const date = toFiniteNumber(row[config.date]);
    const close = toFiniteNumber(row[config.close]);

    if (date === undefined || close === undefined) {
      continue;
    }

    data.push({ date, close });
  }

  return data;
}
