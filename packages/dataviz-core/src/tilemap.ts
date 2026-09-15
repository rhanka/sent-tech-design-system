/**
 * Tile map chart data builder.
 *
 * Maps a label field, two numeric grid-position fields (col/row) and a numeric
 * value field from raw rows into TileMapChartTile-compatible objects, as
 * expected by the DS TileMapChart component.
 *
 * A row is dropped silently when col, row, or value is non-finite.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface TileMapTile {
  label: string;
  col: number;
  row: number;
  value: number;
}

export interface TileMapConfig {
  /** Field id whose value becomes the tile label (string-coerced). */
  label: string;
  /** Field id whose numeric value becomes the column position (0-based). */
  col: string;
  /** Field id whose numeric value becomes the row position (0-based). */
  row: string;
  /** Field id whose numeric value encodes the tile intensity. */
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

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build tile map chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, col, row, value } — field ids
 */
export function buildTileMapData(
  _model: DataModel,
  rows: readonly Row[],
  config: TileMapConfig,
): TileMapTile[] {
  void fieldLabel;
  const data: TileMapTile[] = [];

  for (const row of rows) {
    const col = toFiniteNumber(row[config.col]);
    const rowVal = toFiniteNumber(row[config.row]);
    const value = toFiniteNumber(row[config.value]);

    if (col === undefined || rowVal === undefined || value === undefined) continue;

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    data.push({ label, col, row: rowVal, value });
  }

  return data;
}
