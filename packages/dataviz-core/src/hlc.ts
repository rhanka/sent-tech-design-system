/**
 * HLC chart data builder.
 *
 * Maps three numeric fields (high, low, close) plus a label field from
 * raw rows into HlcDatum-compatible objects, as expected by the DS
 * HLCChart component.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * any of high/low/close is non-finite (mirrors the null-handling pattern
 * used in scatter.ts and candlestick.ts).
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface HlcDatum {
  label: string;
  high: number;
  low: number;
  close: number;
}

export interface HlcConfig {
  /** Field id whose value becomes the bar label (string-coerced; typically a date or category dimension). */
  label: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
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

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build HLC chart data from raw rows by mapping HLC numeric fields
 * and a label field per row.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, high, low, close } — field ids
 */
export function buildHlcData(
  _model: DataModel,
  rows: readonly Row[],
  config: HlcConfig,
): HlcDatum[] {
  void fieldLabel; // fieldLabel reserved for future axis-label surface
  const data: HlcDatum[] = [];

  for (const row of rows) {
    const high = toFiniteNumber(row[config.high]);
    const low = toFiniteNumber(row[config.low]);
    const close = toFiniteNumber(row[config.close]);

    if (high === undefined || low === undefined || close === undefined) {
      continue;
    }

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    data.push({ label, high, low, close });
  }

  return data;
}
