/**
 * Ribbon chart data builder.
 *
 * Maps category, period and value fields from raw rows into RibbonDatum-
 * compatible objects, as expected by the DS RibbonChart component.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * `value` is non-finite (mirrors the null-handling pattern in itemChart.ts and
 * columnPyramid.ts). Tones cycle category1..category8 in first-seen category
 * order so that each unique category gets a stable tone across periods.
 */

import { type DataModel, type Row } from './model.js';

const RIBBON_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type RibbonTone = (typeof RIBBON_TONES)[number];

export interface RibbonDatum {
  category: string;
  period: string | number;
  value: number;
  tone?: RibbonTone;
}

export interface RibbonConfig {
  /** Field id whose value becomes the category (string-coerced). */
  category: string;
  /** Field id whose value becomes the period (string or number preserved). */
  period: string;
  /** Field id whose numeric value becomes the ribbon height/value. */
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
 * Build ribbon chart data from raw rows by mapping category, period and value
 * fields. Tones are assigned per unique category in first-seen order and remain
 * stable across periods.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { category, period, value } — field ids
 */
export function buildRibbonData(
  _model: DataModel,
  rows: readonly Row[],
  config: RibbonConfig,
): RibbonDatum[] {
  const data: RibbonDatum[] = [];
  // Assign tones per unique category in first-seen order for stability.
  const categoryTone = new Map<string, RibbonTone>();

  for (const row of rows) {
    const numericValue = toFiniteNumber(row[config.value]);
    if (numericValue === undefined) continue;

    const categoryRaw = row[config.category];
    const category = categoryRaw == null ? '' : String(categoryRaw);

    const periodRaw = row[config.period];
    // Preserve string | number type as-is for the DS component.
    const period: string | number =
      typeof periodRaw === 'number' ? periodRaw : periodRaw == null ? '' : String(periodRaw);

    if (!categoryTone.has(category)) {
      categoryTone.set(category, RIBBON_TONES[categoryTone.size % RIBBON_TONES.length]);
    }
    const tone = categoryTone.get(category)!;

    data.push({ category, period, value: numericValue, tone });
  }

  return data;
}
