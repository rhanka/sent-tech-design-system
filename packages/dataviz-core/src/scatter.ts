/**
 * Scatter plot data builder.
 *
 * Maps two numeric fields (x, y) from raw rows into ScatterPlotDatum-compatible
 * objects. An optional `series` dimension assigns categorical tones
 * (category1…category8, cycling). An optional `labelField` emits a per-point label.
 *
 * No aggregation: each row becomes one datum, non-finite x or y values are
 * dropped silently (mirrors the null-handling pattern in analyticsDsData.ts).
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

const SCATTER_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ScatterTone = (typeof SCATTER_TONES)[number];

export interface ScatterDatum {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterTone;
}

export interface ScatterConfig {
  /** Field id whose numeric value becomes the x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the y coordinate. */
  y: string;
  /** Optional dimension whose distinct values are mapped to categorical tones. */
  series?: string;
  /** Optional field whose string value is used as the per-point label. */
  labelField?: string;
}

export interface ScatterModel {
  data: ScatterDatum[];
  xLabel: string;
  yLabel: string;
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
 * Build scatter-plot data from raw rows by mapping two numeric fields to x/y.
 *
 * @param _model  DataModel — used for measure/dimension label lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { x, y, series?, labelField? }
 */
export function buildScatterModel(
  _model: DataModel,
  rows: readonly Row[],
  config: ScatterConfig,
): ScatterModel {
  // Build tone map lazily: series value → tone (stable across rows)
  const toneMap = new Map<string, ScatterTone>();
  let toneIndex = 0;

  const data: ScatterDatum[] = [];

  for (const row of rows) {
    const x = toFiniteNumber(row[config.x]);
    const y = toFiniteNumber(row[config.y]);
    if (x === undefined || y === undefined) continue;

    const datum: ScatterDatum = { x, y };

    if (config.series !== undefined) {
      const key = row[config.series] == null ? 'null' : String(row[config.series]);
      if (!toneMap.has(key)) {
        toneMap.set(key, SCATTER_TONES[toneIndex % SCATTER_TONES.length]!);
        toneIndex++;
      }
      datum.tone = toneMap.get(key);
    }

    if (config.labelField !== undefined) {
      const rawLabel = row[config.labelField];
      if (rawLabel != null) {
        datum.label = String(rawLabel);
      }
    }

    data.push(datum);
  }

  return {
    data,
    xLabel: fieldLabel(_model, config.x),
    yLabel: fieldLabel(_model, config.y),
  };
}
