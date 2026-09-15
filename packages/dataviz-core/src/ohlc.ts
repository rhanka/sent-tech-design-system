/**
 * OHLC chart data builder.
 *
 * Datum shape is identical to CandlestickDatum. This independent module keeps
 * OHLCChart concerns separate from CandlestickChart concerns — neither imports
 * the other.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface OhlcDatum {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OhlcConfig {
  /** Field id whose value becomes the bar label. */
  label: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
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
 * Build OHLC chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, open, high, low, close } — field ids
 */
export function buildOhlcData(
  _model: DataModel,
  rows: readonly Row[],
  config: OhlcConfig,
): OhlcDatum[] {
  void fieldLabel;
  const data: OhlcDatum[] = [];

  for (const row of rows) {
    const open = toFiniteNumber(row[config.open]);
    const high = toFiniteNumber(row[config.high]);
    const low = toFiniteNumber(row[config.low]);
    const close = toFiniteNumber(row[config.close]);

    if (open === undefined || high === undefined || low === undefined || close === undefined) {
      continue;
    }

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    data.push({ label, open, high, low, close });
  }

  return data;
}
