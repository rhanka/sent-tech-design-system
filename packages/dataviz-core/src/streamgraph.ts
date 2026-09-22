/**
 * Streamgraph chart data builder.
 *
 * Pivots raw rows into StreamgraphChartDatum-compatible objects as expected by
 * the DS StreamgraphChart component. Each unique value of the category field
 * becomes one datum; within each datum, each row (possibly filtered to that
 * category if the data is already grouped) produces one value entry.
 *
 * Use case: category = time period (x-axis), label = series name, value = measure.
 * Rows where the measure is non-finite are silently dropped.
 */

import { type DataModel, type Row, findMeasure, findDimension } from './model.js';

/** Mirrors StreamgraphChartTone from the DS (presentation-free). */
export type StreamgraphTone =
  | 'category1' | 'category2' | 'category3' | 'category4'
  | 'category5' | 'category6' | 'category7' | 'category8';

export interface StreamgraphSeriesValue {
  label: string;
  value: number;
  tone?: StreamgraphTone;
}

export interface StreamgraphDatum {
  category: string;
  values: StreamgraphSeriesValue[];
}

export interface StreamgraphConfig {
  /** Field id whose value becomes the category (x-axis bucket, e.g. month). */
  category: string;
  /** Field id whose value becomes the series label within each category. */
  label: string;
  /** Field id whose numeric value becomes the stream height. */
  value: string;
  /** Optional field id whose string value becomes the tone for each value entry. */
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
 * Build streamgraph chart data by pivoting rows into one datum per category.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { category, label, value, tone? } — field ids
 */
export function buildStreamgraphData(
  _model: DataModel,
  rows: readonly Row[],
  config: StreamgraphConfig,
): StreamgraphDatum[] {
  void fieldLabel;
  // Preserve category insertion order using a Map.
  const categoryMap = new Map<string, StreamgraphSeriesValue[]>();

  for (const row of rows) {
    const numericValue = toFiniteNumber(row[config.value]);
    if (numericValue === undefined) continue;

    const categoryRaw = row[config.category];
    const category = categoryRaw == null ? '' : String(categoryRaw);

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    const entry: StreamgraphSeriesValue = { label, value: numericValue };

    if (config.tone !== undefined) {
      const toneRaw = row[config.tone];
      if (toneRaw != null) entry.tone = String(toneRaw) as StreamgraphTone;
    }

    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(entry);
  }

  const data: StreamgraphDatum[] = [];
  for (const [category, values] of categoryMap) {
    data.push({ category, values });
  }
  return data;
}
