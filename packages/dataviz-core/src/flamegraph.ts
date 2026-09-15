/**
 * Flamegraph chart data builder.
 *
 * Folds parent/child rows into a single recursive {@link FlamegraphNode} tree,
 * as expected by the DS FlamegraphChart component (width ∝ value, depth = level).
 *
 * Hierarchy data is structural: rows are NOT dropped. A non-finite `value`
 * coerces to 0 (mirrors the toFiniteNumber pattern in ribbon.ts and
 * columnPyramid.ts). Leaf nodes omit the `children` key entirely; internal
 * nodes carry a `children` array. Self-links (a node whose parent is itself)
 * are skipped so a node never nests under itself.
 */

import { type DataModel, type Row } from './model.js';

export type FlamegraphNode = { name: string; value: number; children?: FlamegraphNode[] };

export interface FlamegraphConfig {
  /** Field id whose value is the node id (string-coerced). */
  id: string;
  /** Field id whose value references the parent node id (empty/null ⇒ root). */
  parentId: string;
  /** Field id whose value becomes the node label (string-coerced). */
  name: string;
  /** Field id whose numeric value becomes the node weight (non-finite ⇒ 0). */
  value: string;
  /** Label of the synthesized wrapper when rows yield zero or many roots. */
  rootLabel?: string;
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
 * Build a flamegraph tree from raw parent/child rows.
 *
 * Two-pass: first build a node per row keyed by id (insertion order
 * preserved), then attach each node to its parent's `children` array. A node
 * whose parent id is empty/null, or references an unknown id, is a root. A
 * single root is returned directly; zero roots yield `{ name: rootLabel, value:
 * 0 }`; multiple roots are wrapped in `{ name: rootLabel, value: <sum>, children
 * }`.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { id, parentId, name, value, rootLabel? } — field ids
 */
export function buildFlamegraphData(
  _model: DataModel,
  rows: readonly Row[],
  config: FlamegraphConfig,
): FlamegraphNode {
  const rootLabel = config.rootLabel ?? 'root';

  // First pass — one node per row, keyed by id, insertion order preserved.
  const entries = new Map<string, { node: FlamegraphNode; parentId: string | null }>();

  for (const row of rows) {
    const id = String(row[config.id] ?? '');

    const parentRaw = row[config.parentId];
    const parentId = parentRaw == null || parentRaw === '' ? null : String(parentRaw);

    const name = String(row[config.name] ?? '');
    const value = toFiniteNumber(row[config.value]) ?? 0;

    entries.set(id, { node: { name, value }, parentId });
  }

  // Second pass — attach each node to its parent; collect roots.
  const roots: FlamegraphNode[] = [];

  for (const [id, { node, parentId }] of entries) {
    // Self-link guard: a node may not nest under itself.
    if (parentId === null || parentId === id || !entries.has(parentId)) {
      roots.push(node);
      continue;
    }
    const parent = entries.get(parentId)!.node;
    if (parent.children === undefined) parent.children = [];
    parent.children.push(node);
  }

  if (roots.length === 1) return roots[0]!;
  if (roots.length === 0) return { name: rootLabel, value: 0 };

  const total = roots.reduce((sum, root) => sum + root.value, 0);
  return { name: rootLabel, value: total, children: roots };
}
