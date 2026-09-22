/**
 * Status history chart data builder.
 *
 * Groups raw rows by the `series` field and maps each row into a
 * StatusHistoryBucket-compatible object (at: finite numeric index, value:
 * string-coerced). A row is dropped silently when `at` is non-finite.
 * Buckets within each series are sorted by ascending `at` value.
 *
 * Intended for DS StatusHistoryChart: each series maps to one horizontal lane;
 * buckets are point-in-time events coloured by their `value` (tone derived by the DS).
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Core structural bucket (no DS import). */
export interface StatusHistoryBucketDatum {
  at: number;
  value: string;
}

/** Core structural series (no DS import). */
export interface StatusHistoryDatum {
  series: string;
  buckets: StatusHistoryBucketDatum[];
}

export interface StatusHistoryConfig {
  /** Field id whose value groups rows into lanes. */
  series: string;
  /** Field id whose numeric value becomes the bucket timestamp/index. */
  at: string;
  /** Field id whose value encodes the status label (string-coerced). */
  value: string;
}

function toFiniteNumber(v: unknown): number | undefined {
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string' && v.trim() !== '') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build status history data from raw rows.
 *
 * Groups rows by `config.series`, maps each row to a bucket with a finite `at`
 * index and a string `value`, then sorts each series' buckets by ascending `at`.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { series, at, value } — field ids
 */
export function buildStatusHistoryData(
  _model: DataModel,
  rows: readonly Row[],
  config: StatusHistoryConfig,
): StatusHistoryDatum[] {
  void fieldLabel;
  // Preserve series insertion order.
  const seriesMap = new Map<string, StatusHistoryBucketDatum[]>();

  for (const row of rows) {
    const at = toFiniteNumber(row[config.at]);
    if (at === undefined) continue;

    const seriesRaw = row[config.series];
    const seriesKey = seriesRaw == null ? '' : String(seriesRaw);

    const valueRaw = row[config.value];
    const value = valueRaw == null ? '' : String(valueRaw);

    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, []);
    }
    seriesMap.get(seriesKey)!.push({ at, value });
  }

  const data: StatusHistoryDatum[] = [];
  for (const [series, buckets] of seriesMap) {
    buckets.sort((a, b) => a.at - b.at);
    data.push({ series, buckets });
  }
  return data;
}
