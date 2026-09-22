/**
 * Anomaly swim lane chart data builder.
 *
 * Groups raw rows by the `job` field and maps each row into an
 * AnomalySwimLaneBucket-compatible object (at: finite numeric index, score:
 * finite number). A row is dropped silently when `at` or `score` is
 * non-finite. Buckets within each job are sorted by ascending `at` value.
 *
 * Intended for DS AnomalySwimLaneChart: each job maps to one horizontal lane;
 * buckets are point-in-time anomaly scores (numeric, 0..max).
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Core structural bucket (no DS import). */
export interface AnomalySwimLaneBucketDatum {
  at: number;
  score: number;
}

/** Core structural series (no DS import). */
export interface AnomalySwimLaneDatum {
  job: string;
  buckets: AnomalySwimLaneBucketDatum[];
}

export interface AnomalySwimLaneConfig {
  /** Field id whose value groups rows into lanes. */
  job: string;
  /** Field id whose numeric value becomes the bucket timestamp/index. */
  at: string;
  /** Field id whose numeric value encodes the anomaly score. */
  score: string;
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
 * Build anomaly swim lane data from raw rows.
 *
 * Groups rows by `config.job`, maps each row to a bucket with a finite `at`
 * index and a finite `score`, then sorts each job's buckets by ascending `at`.
 * Rows where `at` or `score` is non-finite are silently dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { job, at, score } — field ids
 */
export function buildAnomalySwimLaneData(
  _model: DataModel,
  rows: readonly Row[],
  config: AnomalySwimLaneConfig,
): AnomalySwimLaneDatum[] {
  void fieldLabel;
  // Preserve job insertion order.
  const jobMap = new Map<string, AnomalySwimLaneBucketDatum[]>();

  for (const row of rows) {
    const at = toFiniteNumber(row[config.at]);
    if (at === undefined) continue;

    const score = toFiniteNumber(row[config.score]);
    if (score === undefined) continue;

    const jobRaw = row[config.job];
    const jobKey = jobRaw == null ? '' : String(jobRaw);

    if (!jobMap.has(jobKey)) {
      jobMap.set(jobKey, []);
    }
    jobMap.get(jobKey)!.push({ at, score });
  }

  const data: AnomalySwimLaneDatum[] = [];
  for (const [job, buckets] of jobMap) {
    buckets.sort((a, b) => a.at - b.at);
    data.push({ job, buckets });
  }
  return data;
}
