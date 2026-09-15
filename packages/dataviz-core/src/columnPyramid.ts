/**
 * Column pyramid chart data builder.
 *
 * Maps category and value fields from raw rows into ColumnPyramidChartDatum-
 * compatible objects, as expected by the DS ColumnPyramidChart component.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * `value` is non-finite (mirrors the null-handling pattern in itemChart.ts and
 * candlestick.ts). Tones cycle category1..category8 in row-insertion order.
 */

import { type DataModel, type Row } from './model.js';

const COLUMN_PYRAMID_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ColumnPyramidTone = (typeof COLUMN_PYRAMID_TONES)[number];

export interface ColumnPyramidDatum {
  category: string;
  value: number;
  tone?: ColumnPyramidTone;
}

export interface ColumnPyramidConfig {
  /** Field id whose value becomes the column category (string-coerced). */
  category: string;
  /** Field id whose numeric value becomes the column height. */
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
 * Build column pyramid data from raw rows by mapping category and value fields
 * and assigning cycling categorical tones.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { category, value } — field ids
 */
export function buildColumnPyramidData(
  _model: DataModel,
  rows: readonly Row[],
  config: ColumnPyramidConfig,
): ColumnPyramidDatum[] {
  const data: ColumnPyramidDatum[] = [];

  for (const row of rows) {
    const value = toFiniteNumber(row[config.value]);

    if (value === undefined) {
      continue;
    }

    const categoryRaw = row[config.category];
    const category = categoryRaw == null ? '' : String(categoryRaw);
    const tone = COLUMN_PYRAMID_TONES[data.length % COLUMN_PYRAMID_TONES.length];

    data.push({ category, value, tone });
  }

  return data;
}
