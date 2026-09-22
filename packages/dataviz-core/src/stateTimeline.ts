/**
 * State timeline chart data builder.
 *
 * Groups raw rows by the `series` field and maps each row into a
 * StateTimelineSegment-compatible object (start/end numeric indices, state
 * string-coerced). A row is dropped silently when start or end is non-finite.
 * Segments within each series are sorted by ascending start value.
 *
 * Intended for DS StateTimelineChart: each series maps to one horizontal lane;
 * segments are coloured by their `state` value (tone derived by the DS).
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Core structural segment (no DS import). */
export interface StateTimelineSegmentDatum {
  start: number;
  end: number;
  state: string;
}

/** Core structural series (no DS import). */
export interface StateTimelineDatum {
  series: string;
  segments: StateTimelineSegmentDatum[];
}

export interface StateTimelineConfig {
  /** Field id whose value groups rows into lanes. */
  series: string;
  /** Field id whose numeric value becomes the segment start (e.g. hour index). */
  start: string;
  /** Field id whose numeric value becomes the segment end. */
  end: string;
  /** Field id whose value encodes the state label (string-coerced). */
  state: string;
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
 * Build state timeline data from raw rows.
 *
 * Groups rows by `config.series`, maps each row to a segment with finite
 * start/end and a string state, then sorts each series' segments by start.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { series, start, end, state } — field ids
 */
export function buildStateTimelineData(
  _model: DataModel,
  rows: readonly Row[],
  config: StateTimelineConfig,
): StateTimelineDatum[] {
  void fieldLabel;
  // Preserve series insertion order.
  const seriesMap = new Map<string, StateTimelineSegmentDatum[]>();

  for (const row of rows) {
    const start = toFiniteNumber(row[config.start]);
    const end = toFiniteNumber(row[config.end]);

    if (start === undefined || end === undefined) continue;

    const seriesRaw = row[config.series];
    const seriesKey = seriesRaw == null ? '' : String(seriesRaw);

    const stateRaw = row[config.state];
    const state = stateRaw == null ? '' : String(stateRaw);

    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, []);
    }
    seriesMap.get(seriesKey)!.push({ start, end, state });
  }

  const data: StateTimelineDatum[] = [];
  for (const [series, segments] of seriesMap) {
    segments.sort((a, b) => a.start - b.start);
    data.push({ series, segments });
  }
  return data;
}
