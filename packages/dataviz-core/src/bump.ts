/**
 * Bump chart data builder.
 *
 * Ranks a `series` dimension across an ordered `category` axis by aggregating
 * a numeric `measure`. For each category value, series are ranked by their
 * aggregated measure value (rank 1 = highest by default, configurable via
 * `direction`). Missing series/category combinations produce null in ranks[].
 *
 * Tones cycle category1..category8 in first-seen series order.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

const BUMP_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type BumpTone = (typeof BUMP_TONES)[number];

export interface BumpSeries {
  label: string;
  ranks: (number | null | undefined)[];
  tone?: BumpTone;
}

export interface BumpConfig {
  /** Field id of the dimension whose distinct values form the series (one line each). */
  series: string;
  /** Field id of the ordered dimension whose distinct values form the category axis (x). */
  category: string;
  /** Field id of the numeric measure used to rank series within each category. */
  measure: string;
  /**
   * Ranking direction.
   * - `'desc'` (default): rank 1 = highest measure value (standard for "best = top").
   * - `'asc'`: rank 1 = lowest measure value (useful for elapsed time etc.).
   */
  direction?: 'asc' | 'desc';
}

export interface BumpModel {
  series: BumpSeries[];
  categories: string[];
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

// Keep compiler from warning about unused import while reserving it for future use.
function _fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build bump-chart data by ranking series across ordered categories.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { series, category, measure, direction? }
 */
export function buildBumpModel(
  _model: DataModel,
  rows: readonly Row[],
  config: BumpConfig,
): BumpModel {
  void _fieldLabel; // reserved for future axis-label surface

  const direction = config.direction ?? 'desc';

  // Preserve first-seen order for both axes.
  const seriesOrder: string[] = [];
  const categoryOrder: string[] = [];

  // Accumulate sum + count per (series, category) pair to compute an average.
  const aggregates = new Map<string, { sum: number; count: number }>();

  for (const row of rows) {
    const seriesRaw = row[config.series];
    const categoryRaw = row[config.category];
    const seriesKey = seriesRaw == null ? 'null' : String(seriesRaw);
    const categoryKey = categoryRaw == null ? 'null' : String(categoryRaw);

    if (!seriesOrder.includes(seriesKey)) seriesOrder.push(seriesKey);
    if (!categoryOrder.includes(categoryKey)) categoryOrder.push(categoryKey);

    const v = toFiniteNumber(row[config.measure]);
    if (v === undefined) continue;

    const mapKey = `${seriesKey}\x00${categoryKey}`;
    const existing = aggregates.get(mapKey);
    if (existing) {
      existing.sum += v;
      existing.count += 1;
    } else {
      aggregates.set(mapKey, { sum: v, count: 1 });
    }
  }

  // For each category, rank the series by their aggregated measure value.
  const ranksBySeriesCategory = new Map<string, number | null>();

  for (const cat of categoryOrder) {
    // Collect (seriesKey, avg) pairs that have data for this category.
    const present: Array<{ seriesKey: string; avg: number }> = [];
    for (const seriesKey of seriesOrder) {
      const agg = aggregates.get(`${seriesKey}\x00${cat}`);
      if (agg && agg.count > 0) {
        present.push({ seriesKey, avg: agg.sum / agg.count });
      }
    }

    // Sort by avg value according to direction; rank = position + 1.
    present.sort((a, b) => direction === 'desc' ? b.avg - a.avg : a.avg - b.avg);
    present.forEach(({ seriesKey }, i) => {
      ranksBySeriesCategory.set(`${seriesKey}\x00${cat}`, i + 1);
    });

    // Series absent from this category get null.
    for (const seriesKey of seriesOrder) {
      if (!ranksBySeriesCategory.has(`${seriesKey}\x00${cat}`)) {
        ranksBySeriesCategory.set(`${seriesKey}\x00${cat}`, null);
      }
    }
  }

  // Build the series array.
  const series: BumpSeries[] = seriesOrder.map((seriesKey, idx) => ({
    label: seriesKey,
    ranks: categoryOrder.map((cat) => ranksBySeriesCategory.get(`${seriesKey}\x00${cat}`) ?? null),
    tone: BUMP_TONES[idx % BUMP_TONES.length],
  }));

  return { series, categories: categoryOrder };
}
