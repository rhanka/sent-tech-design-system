/**
 * Violin chart data builder.
 *
 * Groups raw rows by a `groupBy` dimension, collects finite values of a
 * `measure` field per group, and returns one ViolinDatum per group with
 * categorical tones cycling category1..category8 in first-seen order.
 *
 * Non-finite measure values are dropped silently per group (mirrors the
 * null-handling pattern in scatter.ts and analyticsDsData.ts). Groups
 * that end up with zero finite values are still emitted (the DS ViolinChart
 * handles empty-values arrays gracefully by skipping the violin).
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

const VIOLIN_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ViolinTone = (typeof VIOLIN_TONES)[number];

export interface ViolinDatum {
  label: string;
  values: number[];
  tone?: ViolinTone;
}

export interface ViolinConfig {
  /** Field id of the dimension used to split data into groups (one violin per group). */
  groupBy: string;
  /** Field id whose numeric values form the distribution for each group. */
  measure: string;
  /** Number of density bins forwarded to the DS component (optional; DS default is 20). */
  bins?: number;
  /** Whether to overlay median / quartile markers (optional; DS default is true). */
  quartiles?: boolean;
}

export interface ViolinModel {
  data: ViolinDatum[];
  /** bins/quartiles passthrough so wrappers can forward them to the DS component. */
  bins?: number;
  quartiles?: boolean;
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

// Keep compiler from warning about unused import while reserving it for future use.
function _fieldLabel(model: DataModel, fieldId: string): string {
  return findMeasure(model, fieldId)?.label ?? findDimension(model, fieldId)?.label ?? fieldId;
}

/**
 * Build violin chart data by grouping rows on a dimension and collecting
 * finite measure values per group.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { groupBy, measure, bins?, quartiles? }
 */
export function buildViolinModel(
  _model: DataModel,
  rows: readonly Row[],
  config: ViolinConfig,
): ViolinModel {
  void _fieldLabel; // reserved for future axis-label surface

  // Preserve first-seen group order; collect values per group.
  const groupOrder: string[] = [];
  const groupValues = new Map<string, number[]>();

  for (const row of rows) {
    const groupRaw = row[config.groupBy];
    const groupKey = groupRaw == null ? 'null' : String(groupRaw);

    if (!groupValues.has(groupKey)) {
      groupOrder.push(groupKey);
      groupValues.set(groupKey, []);
    }

    const v = toFiniteNumber(row[config.measure]);
    if (v !== undefined) {
      groupValues.get(groupKey)!.push(v);
    }
  }

  const data: ViolinDatum[] = groupOrder.map((key, idx) => ({
    label: key,
    values: groupValues.get(key)!,
    tone: VIOLIN_TONES[idx % VIOLIN_TONES.length],
  }));

  return {
    data,
    bins: config.bins,
    quartiles: config.quartiles,
  };
}
