/**
 * Item chart data builder.
 *
 * Maps label and value fields from raw rows into ItemChartDatum-compatible
 * objects, as expected by the DS ItemChart component.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * `value` is non-finite (mirrors the null-handling pattern in scatter.ts and
 * candlestick.ts). Tones cycle category1..category8 in row-insertion order.
 */

import { type DataModel, type Row } from './model.js';

const ITEM_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ItemChartTone = (typeof ITEM_TONES)[number];

export interface ItemChartDatum {
  label: string;
  value: number;
  tone?: ItemChartTone;
}

export interface ItemChartConfig {
  /** Field id whose value becomes the item label (string-coerced). */
  label: string;
  /** Field id whose numeric value becomes the item count/value. */
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
 * Build item chart data from raw rows by mapping label and value fields and
 * assigning cycling categorical tones.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, value } — field ids
 */
export function buildItemChartData(
  _model: DataModel,
  rows: readonly Row[],
  config: ItemChartConfig,
): ItemChartDatum[] {
  const data: ItemChartDatum[] = [];

  for (const row of rows) {
    const value = toFiniteNumber(row[config.value]);

    if (value === undefined) {
      continue;
    }

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);
    const tone = ITEM_TONES[data.length % ITEM_TONES.length];

    data.push({ label, value, tone });
  }

  return data;
}
