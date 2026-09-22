/**
 * Point & Figure chart data builder.
 *
 * Maps date and close fields from raw rows into PointAndFigurePoint-compatible
 * objects, as expected by the DS PointAndFigureChart component (which forms
 * columns of X / O marks from the price series, calibrated on a `boxSize` grid
 * and switching columns on a `reversal`).
 *
 * A row is dropped silently when `date` or `close` is non-finite (mirrors the
 * null-handling pattern in density2d.ts and ribbon.ts).
 */

import { type DataModel, type Row } from './model.js';

export type PointAndFigurePoint = { date: number; close: number };

export interface PointAndFigureConfig {
  /** Field id whose numeric value becomes the point's temporal position. */
  date: string;
  /** Field id whose numeric value becomes the point's closing price. */
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
 * Build Point & Figure data from raw rows by mapping the date and close
 * fields. Rows whose date or close is non-finite are dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { date, close } — field ids
 */
export function buildPointAndFigureData(
  _model: DataModel,
  rows: readonly Row[],
  config: PointAndFigureConfig,
): PointAndFigurePoint[] {
  const data: PointAndFigurePoint[] = [];

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
