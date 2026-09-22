/**
 * Dependency wheel chart data builder.
 *
 * Maps source, target and weight fields from raw rows into DependencyWheelChartLink-
 * compatible objects `{ from, to, weight }`, as expected by the DS
 * DependencyWheelChart component.
 *
 * No aggregation: each row becomes one link. A row is dropped silently when
 * `weight` is non-finite or <= 0 (mirrors the DS guard documented in
 * DependencyWheelChart.d.ts: only links whose `weight` is finite and > 0
 * are taken into account). `from` and `to` are coerced to string.
 */

import { type DataModel, type Row } from './model.js';

export interface DependencyWheelLink {
  from: string;
  to: string;
  weight: number;
}

export interface DependencyWheelConfig {
  /** Field id whose value becomes the link's source node (string-coerced). */
  source: string;
  /** Field id whose value becomes the link's target node (string-coerced). */
  target: string;
  /** Field id whose numeric value becomes the link weight. */
  weight: string;
}

function toFinitePositiveNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : undefined;
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }
  return undefined;
}

/**
 * Build dependency wheel link data from raw rows by mapping source, target and
 * weight fields per row.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { source, target, weight } — field ids
 */
export function buildDependencyWheelData(
  _model: DataModel,
  rows: readonly Row[],
  config: DependencyWheelConfig,
): DependencyWheelLink[] {
  const data: DependencyWheelLink[] = [];

  for (const row of rows) {
    const weight = toFinitePositiveNumber(row[config.weight]);

    if (weight === undefined) {
      continue;
    }

    const fromRaw = row[config.source];
    const toRaw = row[config.target];
    const from = fromRaw == null ? '' : String(fromRaw);
    const to = toRaw == null ? '' : String(toRaw);

    data.push({ from, to, weight });
  }

  return data;
}
