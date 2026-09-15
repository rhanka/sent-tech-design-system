/**
 * 2D density chart data builder.
 *
 * Maps x, y and optional weight fields from raw rows into Density2DPoint-
 * compatible objects, as expected by the DS Density2DChart component (which
 * bins the points into a regular grid and colours each cell by density).
 *
 * A row is dropped silently when `x` or `y` is non-finite (mirrors the
 * null-handling pattern in ribbon.ts and columnPyramid.ts). The `weight` key is
 * only emitted when a weight field is configured AND its value is finite.
 */

import { type DataModel, type Row } from './model.js';

export type Density2DPoint = { x: number; y: number; weight?: number };

export interface Density2DConfig {
  /** Field id whose numeric value becomes the point's x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the point's y coordinate. */
  y: string;
  /** Optional field id whose numeric value weights the point's density. */
  weight?: string;
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
 * Build 2D density data from raw rows by mapping x, y and optional weight
 * fields. Rows whose x or y is non-finite are dropped. When a weight field is
 * configured, the `weight` key is emitted only for finite weights.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, y, weight? } — field ids
 */
export function buildDensity2DData(
  _model: DataModel,
  rows: readonly Row[],
  config: Density2DConfig,
): Density2DPoint[] {
  const data: Density2DPoint[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[config.x]);
    const y = toFiniteNumber(row[config.y]);

    if (x === undefined || y === undefined) {
      continue;
    }

    if (config.weight !== undefined) {
      const weight = toFiniteNumber(row[config.weight]);
      data.push(weight === undefined ? { x, y } : { x, y, weight });
    } else {
      data.push({ x, y });
    }
  }

  return data;
}
