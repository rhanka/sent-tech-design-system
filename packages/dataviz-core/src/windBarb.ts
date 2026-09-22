/**
 * Wind barb chart data builder.
 *
 * Maps at, speed and direction fields from raw rows into WindBarbDatum-
 * compatible objects, as expected by the DS WindBarbChart component (which
 * draws one meteorological wind barb per point along a time axis: the staff is
 * oriented by `direction`, in degrees — 0° = North, the source of the wind —
 * and the barbs encode `speed`, in knots, by the standard 5/10/50 kt steps).
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * any of `at`, `speed` or `direction` is non-finite (mirrors the null-handling
 * pattern in vectorField.ts and density2d.ts).
 */

import { type DataModel, type Row } from './model.js';

export type WindBarbDatum = { at: number; speed: number; direction: number };

export interface WindBarbConfig {
  /** Field id whose numeric value becomes the point's position on the time axis. */
  at: string;
  /** Field id whose numeric value becomes the wind speed in knots (≥ 0). */
  speed: string;
  /** Field id whose numeric value becomes the wind direction in degrees. */
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
 * Build wind barb data from raw rows by mapping at, speed and direction fields.
 * Rows whose at, speed or direction is non-finite are dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { at, speed, direction } — field ids
 */
export function buildWindBarbData(
  _model: DataModel,
  rows: readonly Row[],
  config: WindBarbConfig,
): WindBarbDatum[] {
  const data: WindBarbDatum[] = [];

  for (const row of rows) {
    const at = toFiniteNumber(row[config.at]);
    const speed = toFiniteNumber(row[config.speed]);
    const direction = toFiniteNumber(row[config.direction]);

    if (at === undefined || speed === undefined || direction === undefined) {
      continue;
    }

    data.push({ at, speed, direction });
  }

  return data;
}
