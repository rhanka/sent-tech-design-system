/**
 * Polygon chart data builder.
 *
 * Maps x and y numeric fields from raw rows into PolygonPoint-compatible
 * objects, as expected by the DS PolygonChart component.
 *
 * No aggregation: each row becomes one point. A row is dropped silently when
 * either `x` or `y` is non-finite (mirrors the null-handling pattern in
 * scatter.ts and candlestick.ts).
 */

import { type DataModel, type Row } from './model.js';

export interface PolygonPoint {
  x: number;
  y: number;
}

export interface PolygonConfig {
  /** Field id whose numeric value becomes the x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the y coordinate. */
  y: string;
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
 * Build polygon chart data from raw rows by mapping x and y numeric fields.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, y } — field ids
 */
export function buildPolygonData(
  _model: DataModel,
  rows: readonly Row[],
  config: PolygonConfig,
): PolygonPoint[] {
  const data: PolygonPoint[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[config.x]);
    const y = toFiniteNumber(row[config.y]);

    if (x === undefined || y === undefined) {
      continue;
    }

    data.push({ x, y });
  }

  return data;
}
