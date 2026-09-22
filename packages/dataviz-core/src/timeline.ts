/**
 * Timeline chart data builder.
 *
 * Maps a numeric position field and a label field from raw rows into
 * TimelineChartEvent-compatible objects, as expected by the DS TimelineChart.
 *
 * A row is dropped silently when position is non-finite.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Mirrors TimelineChartTone from the DS (presentation-free). */
export type TimelineTone =
  | 'category1' | 'category2' | 'category3' | 'category4'
  | 'category5' | 'category6' | 'category7' | 'category8';

export interface TimelineDatum {
  position: number;
  label: string;
  description?: string;
  tone?: TimelineTone;
}

export interface TimelineConfig {
  /** Field id whose value becomes the event label (string-coerced). */
  label: string;
  /** Field id whose numeric value becomes the event position on the axis. */
  position: string;
  /** Optional field id whose string value becomes the event description. */
  description?: string;
  /** Optional field id whose string value becomes the tone (e.g. "category1"). */
  tone?: string;
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
 * Build timeline chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, position, description?, tone? } — field ids
 */
export function buildTimelineData(
  _model: DataModel,
  rows: readonly Row[],
  config: TimelineConfig,
): TimelineDatum[] {
  void fieldLabel;
  const data: TimelineDatum[] = [];

  for (const row of rows) {
    const position = toFiniteNumber(row[config.position]);
    if (position === undefined) continue;

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    const datum: TimelineDatum = { position, label };

    if (config.description !== undefined) {
      const descRaw = row[config.description];
      if (descRaw != null) datum.description = String(descRaw);
    }

    if (config.tone !== undefined) {
      const toneRaw = row[config.tone];
      if (toneRaw != null) datum.tone = String(toneRaw) as TimelineTone;
    }

    data.push(datum);
  }

  return data;
}
