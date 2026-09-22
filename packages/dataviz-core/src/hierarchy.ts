/**
 * Hierarchy chart data builder.
 *
 * Converts flat rows into HierarchyNode objects suitable for both
 * OrganizationChart and TreegraphChart DS components. Each row becomes one
 * node; `id`, `parentId`, and `label` are all string-coerced from their
 * respective fields. A `parentId` that is null, undefined, or an empty string
 * is normalised to null (= root node). Tones cycle category1..category8 in
 * row-insertion order.
 *
 * No rows are dropped: hierarchy data is structural, so non-numeric field
 * values are still valid (string coercion handles all cases).
 */

import { type DataModel, type Row } from './model.js';

const HIERARCHY_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type HierarchyTone = (typeof HIERARCHY_TONES)[number];

export interface HierarchyNode {
  id: string;
  parentId?: string | null;
  label: string;
  tone?: HierarchyTone;
}

export interface HierarchyConfig {
  /** Field id that becomes the node id (string-coerced). */
  id: string;
  /** Field id for parent id (string-coerced; if null/empty/undefined → null = root). */
  parentId: string;
  /** Field id for the display label (string-coerced). */
  label: string;
}

/**
 * Build hierarchy chart data from raw rows by mapping id, parentId, and label
 * fields and assigning cycling categorical tones.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { id, parentId, label } — field ids
 */
export function buildHierarchyData(
  _model: DataModel,
  rows: readonly Row[],
  config: HierarchyConfig,
): HierarchyNode[] {
  const data: HierarchyNode[] = [];

  for (const row of rows) {
    const idRaw = row[config.id];
    const id = idRaw == null ? '' : String(idRaw);

    const parentIdRaw = row[config.parentId];
    const parentId =
      parentIdRaw == null || parentIdRaw === '' ? null : String(parentIdRaw);

    const labelRaw = row[config.label];
    const label = labelRaw == null ? '' : String(labelRaw);

    const tone = HIERARCHY_TONES[data.length % HIERARCHY_TONES.length];

    data.push({ id, parentId, label, tone });
  }

  return data;
}
