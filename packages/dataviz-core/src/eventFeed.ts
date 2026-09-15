/**
 * Event feed data builder.
 *
 * Maps timestamp, type, severity and message fields from raw rows into
 * EventFeedEvent-compatible objects, as expected by the DS EventFeedPanel
 * component.
 *
 * No aggregation: each row becomes one event. A row is dropped silently when
 * `at` is non-finite (mirrors the null-handling pattern in ribbon.ts and
 * itemChart.ts). No sorting is applied here — the DS EventFeedPanel sorts its
 * items by `at` descending itself.
 */

import { type DataModel, type Row } from './model.js';

export type EventFeedEvent = {
  at: number;
  type: string;
  severity: string;
  message: string;
};

export interface EventFeedConfig {
  /** Field id whose numeric value becomes the event timestamp (epoch ms). */
  at: string;
  /** Field id whose value becomes the event type/category (string-coerced). */
  type: string;
  /** Field id whose value becomes the severity (string-coerced, default 'info'). */
  severity: string;
  /** Field id whose value becomes the displayed message (string-coerced). */
  message: string;
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
 * Build event feed data from raw rows by mapping timestamp, type, severity and
 * message fields. Rows with a non-finite `at` are dropped. The result is left
 * unsorted; the DS EventFeedPanel orders items by `at` descending.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { at, type, severity, message } — field ids
 */
export function buildEventFeedData(
  _model: DataModel,
  rows: readonly Row[],
  config: EventFeedConfig,
): EventFeedEvent[] {
  const data: EventFeedEvent[] = [];

  for (const row of rows) {
    const at = toFiniteNumber(row[config.at]);
    if (at === undefined) continue;

    const type = String(row[config.type] ?? '');
    const severity = String(row[config.severity] ?? 'info');
    const message = String(row[config.message] ?? '');

    data.push({ at, type, severity, message });
  }

  return data;
}
