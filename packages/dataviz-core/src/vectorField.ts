/**
 * Vector field chart data builder.
 *
 * Maps x, y, length and direction fields from raw rows into VectorFieldDatum-
 * compatible objects, as expected by the DS VectorFieldChart component (which
 * draws a grid of arrows whose length encodes magnitude and whose orientation
 * follows `direction`, in degrees: 0° = +X, trig sense).
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * any of `x`, `y`, `length` or `direction` is non-finite (mirrors the
 * null-handling pattern in density2d.ts and ribbon.ts).
 */

import { type DataModel, type Row } from './model.js';

export type VectorFieldDatum = { x: number; y: number; length: number; direction: number };

export interface VectorFieldConfig {
  /** Field id whose numeric value becomes the vector's x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the vector's y coordinate. */
  y: string;
  /** Field id whose numeric value becomes the vector's magnitude (≥ 0). */
  length: string;
  /** Field id whose numeric value becomes the vector's direction in degrees. */
  direction: string;
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
 * Build vector field data from raw rows by mapping x, y, length and direction
 * fields. Rows whose x, y, length or direction is non-finite are dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, y, length, direction } — field ids
 */
export function buildVectorFieldData(
  _model: DataModel,
  rows: readonly Row[],
  config: VectorFieldConfig,
): VectorFieldDatum[] {
  const data: VectorFieldDatum[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[config.x]);
    const y = toFiniteNumber(row[config.y]);
    const length = toFiniteNumber(row[config.length]);
    const direction = toFiniteNumber(row[config.direction]);

    if (
      x === undefined ||
      y === undefined ||
      length === undefined ||
      direction === undefined
    ) {
      continue;
    }

    data.push({ x, y, length, direction });
  }

  return data;
}
