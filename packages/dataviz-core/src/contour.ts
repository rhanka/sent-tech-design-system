/**
 * Contour chart data builder.
 *
 * Maps x, y and value fields from raw rows into ContourPoint-compatible
 * objects, as expected by the DS ContourChart component (which paints contour
 * bands over a regular 2D scalar grid, à la Highcharts « contour »).
 *
 * A row is dropped silently when `x`, `y` OR `value` is non-finite (mirrors the
 * null-handling pattern in density2d.ts and ribbon.ts). All three keys are
 * always emitted for surviving rows.
 */

import { type DataModel, type Row } from './model.js';

export type ContourPoint = { x: number; y: number; value: number };

export interface ContourConfig {
  /** Field id whose numeric value becomes the point's x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the point's y coordinate. */
  y: string;
  /** Field id whose numeric value drives the cell's colour band. */
  value: string;
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
 * Build contour data from raw rows by mapping x, y and value fields. Rows whose
 * x, y or value is non-finite are dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, y, value } — field ids
 */
export function buildContourData(
  _model: DataModel,
  rows: readonly Row[],
  config: ContourConfig,
): ContourPoint[] {
  const data: ContourPoint[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[config.x]);
    const y = toFiniteNumber(row[config.y]);
    const value = toFiniteNumber(row[config.value]);

    if (x === undefined || y === undefined || value === undefined) {
      continue;
    }

    data.push({ x, y, value });
  }

  return data;
}
