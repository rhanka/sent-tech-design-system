/**
 * Variable pie chart data builder.
 *
 * Maps label, value, and z (bubble size) fields from raw rows into
 * VariablePieDatum-compatible objects, as expected by the DS
 * VariablePieChart component.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * either `value` or `z` is non-finite (mirrors the null-handling pattern in
 * scatter.ts and candlestick.ts). Tones cycle category1..category8 in
 * row-insertion order.
 */

import { type DataModel, type Row } from './model.js';

const TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type VariablePieTone = (typeof TONES)[number];

export interface VariablePieDatum {
  label: string;
  value: number;
  z: number;
  tone?: VariablePieTone;
}

export interface VariablePieConfig {
  /** Field id whose value becomes the slice label (string-coerced). */
  label: string;
  /** Field id whose numeric value becomes the slice value (angle). */
  value: string;
  /** Field id whose numeric value becomes the slice z (radius). */
  z: string;
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
 * Build variable pie chart data from raw rows by mapping label, value, and z
 * fields and assigning cycling categorical tones.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { label, value, z } — field ids
 */
export function buildVariablePieData(
  _model: DataModel,
  rows: readonly Row[],
  config: VariablePieConfig,
): VariablePieDatum[] {
  const data: VariablePieDatum[] = [];

  for (const row of rows) {
    const value = toFiniteNumber(row[config.value]);
    const z = toFiniteNumber(row[config.z]);

    if (value === undefined || z === undefined) {
      continue;
    }

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);
    const tone = TONES[data.length % TONES.length];

    data.push({ label, value, z, tone });
  }

  return data;
}
