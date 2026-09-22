/**
 * Gantt chart data builder.
 *
 * Maps a task-label field and two numeric fields (start/end day-indices or
 * epoch ms) plus an optional category field from raw rows into GanttChartTask-
 * compatible objects, as expected by the DS GanttChart component.
 *
 * A row is dropped silently when start or end is non-finite.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

export interface GanttDatum {
  task: string;
  start: number;
  end: number;
  category?: string;
}

export interface GanttConfig {
  /** Field id whose value becomes the task name (string-coerced). */
  task: string;
  /** Field id whose numeric value becomes the start (e.g. day index or epoch ms). */
  start: string;
  /** Field id whose numeric value becomes the end. */
  end: string;
  /** Optional field id whose string value becomes the category grouping. */
  category?: string;
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
 * Build Gantt chart data from raw rows.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { task, start, end, category? } — field ids
 */
export function buildGanttData(
  _model: DataModel,
  rows: readonly Row[],
  config: GanttConfig,
): GanttDatum[] {
  void fieldLabel;
  const data: GanttDatum[] = [];

  for (const row of rows) {
    const start = toFiniteNumber(row[config.start]);
    const end = toFiniteNumber(row[config.end]);

    if (start === undefined || end === undefined) continue;

    const taskRaw = row[config.task];
    const task = taskRaw == null ? '' : String(taskRaw);

    const datum: GanttDatum = { task, start, end };

    if (config.category !== undefined) {
      const catRaw = row[config.category];
      if (catRaw != null) datum.category = String(catRaw);
    }

    data.push(datum);
  }

  return data;
}
