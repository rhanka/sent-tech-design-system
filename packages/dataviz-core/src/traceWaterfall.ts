/**
 * Trace waterfall chart data builder.
 *
 * Maps spanId, parentSpanId, service, start and duration fields from raw rows
 * into TraceSpan-compatible objects, as expected by the DS TraceWaterfallChart
 * component.
 *
 * No aggregation: each row becomes one span. A row is dropped silently when
 * `start` or `duration` is non-finite (mirrors the null-handling pattern in
 * ribbon.ts and anomalySwimLane.ts). `parentSpanId` is normalised to `null`
 * when the source is null/undefined or the empty string (roots).
 */

import { type DataModel, type Row } from './model.js';

/** Core structural span (mirrors the DS datum, no DS import). */
export type TraceSpan = {
  spanId: string;
  parentSpanId?: string | null;
  service: string;
  start: number;
  duration: number;
};

export interface TraceWaterfallConfig {
  /** Field id whose value becomes the span id (string-coerced). */
  spanId: string;
  /** Field id whose value becomes the parent span id (null/empty → root). */
  parentSpanId: string;
  /** Field id whose value becomes the service name (string-coerced). */
  service: string;
  /** Field id whose numeric value becomes the span start time. */
  start: string;
  /** Field id whose numeric value becomes the span duration. */
  duration: string;
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
 * Build trace waterfall data from raw rows by mapping the span fields. Each row
 * becomes one span; rows where `start` or `duration` is non-finite are silently
 * dropped. `parentSpanId` is `null` for roots (null/undefined/empty source).
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { spanId, parentSpanId, service, start, duration } — field ids
 */
export function buildTraceWaterfallData(
  _model: DataModel,
  rows: readonly Row[],
  config: TraceWaterfallConfig,
): { spans: TraceSpan[] } {
  const spans: TraceSpan[] = [];

  for (const row of rows) {
    const start = toFiniteNumber(row[config.start]);
    if (start === undefined) continue;

    const duration = toFiniteNumber(row[config.duration]);
    if (duration === undefined) continue;

    const spanId = String(row[config.spanId] ?? '');
    const service = String(row[config.service] ?? '');

    const parentRaw = row[config.parentSpanId];
    const parentSpanId: string | null =
      parentRaw == null || parentRaw === '' ? null : String(parentRaw);

    spans.push({ spanId, parentSpanId, service, start, duration });
  }

  return { spans };
}
