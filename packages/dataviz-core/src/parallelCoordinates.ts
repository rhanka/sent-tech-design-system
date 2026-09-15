/**
 * Parallel coordinates chart data builder.
 *
 * Maps a list of measure field ids to ParallelAxis descriptors and converts
 * each row into a record keyed by those field ids (values finite-coerced;
 * non-finite values become `undefined` in the record, which the DS
 * ParallelCoordinatesChart ignores per-axis).
 *
 * An optional `series` dimension assigns one tone per row cycling
 * category1..category8 in first-seen series order.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

const PARALLEL_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ParallelTone = (typeof PARALLEL_TONES)[number];

export interface ParallelAxisDef {
  key: string;
  label: string;
  min?: number;
  max?: number;
}

export interface ParallelCoordinatesConfig {
  /** List of measure field ids that become the parallel axes (left to right). */
  measures: string[];
  /** Optional dimension field id used to assign a tone per row. */
  series?: string;
}

export interface ParallelCoordinatesModel {
  axes: ParallelAxisDef[];
  data: Record<string, unknown>[];
  tones?: ParallelTone[];
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
 * Build parallel coordinates data from raw rows.
 *
 * @param model   DataModel — used to derive axis labels from measure/dimension metadata
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { measures, series? }
 */
export function buildParallelCoordinatesModel(
  model: DataModel,
  rows: readonly Row[],
  config: ParallelCoordinatesConfig,
): ParallelCoordinatesModel {
  // Build axis definitions from the model metadata.
  const axes: ParallelAxisDef[] = config.measures.map((fieldId) => ({
    key: fieldId,
    label: fieldLabel(model, fieldId),
  }));

  // Build tone map lazily if a series dimension is provided.
  const toneMap = config.series !== undefined ? new Map<string, ParallelTone>() : undefined;
  let toneIndex = 0;

  const data: Record<string, unknown>[] = [];
  const tonesArr: ParallelTone[] = [];

  for (const row of rows) {
    const record: Record<string, unknown> = {};
    for (const fieldId of config.measures) {
      const v = toFiniteNumber(row[fieldId]);
      if (v !== undefined) {
        record[fieldId] = v;
      }
    }
    data.push(record);

    if (toneMap !== undefined && config.series !== undefined) {
      const seriesRaw = row[config.series];
      const seriesKey = seriesRaw == null ? 'null' : String(seriesRaw);
      if (!toneMap.has(seriesKey)) {
        toneMap.set(seriesKey, PARALLEL_TONES[toneIndex % PARALLEL_TONES.length]!);
        toneIndex++;
      }
      tonesArr.push(toneMap.get(seriesKey)!);
    }
  }

  return {
    axes,
    data,
    tones: toneMap !== undefined ? tonesArr : undefined,
  };
}
