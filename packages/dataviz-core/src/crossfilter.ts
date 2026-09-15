/**
 * Cross-filter / brushing-and-linking.
 *
 * The {@link CrossfilterGraph} declares, for each *source* view, the set of
 * *target* views its selection should filter. This is the classic crossfilter
 * pattern: selecting a bar in view A narrows views B and C, but A itself is
 * **not** filtered by its own selection (so you can keep refining it).
 *
 * Selections live in the store as `viewId -> selected keys`. Each view must
 * also declare which data field (dimension id) its keys refer to, so a
 * selection can be turned into a row predicate. That mapping is part of the
 * graph (`views[viewId].field`).
 */

import type { Cell, Row } from './model.js';
import type { DashboardState } from './store.js';
import { applyFilters } from './store.js';

export type CrossfilterSelectionMode = 'key' | 'range';

/** Declaration of a single view participating in cross-filtering. */
export interface CrossfilterView {
  /** The dimension id this view's selection keys refer to. */
  field: string;
  /**
   * How selection keys should be interpreted for this view. The default `key`
   * mode compares stringified field values. `range` mode expects keys produced
   * by {@link rangeSelectionKey} and keeps rows whose numeric/date value falls
   * inside at least one selected range.
   */
  selection?: CrossfilterSelectionMode;
  /**
   * The view ids this view's selection filters. If omitted, defaults to
   * "every other view" (a fully-linked dashboard). An empty array means the
   * view's selection affects no other view.
   */
  affects?: string[];
}

/** Declarative scope: which view filters which. */
export interface CrossfilterGraph {
  views: Record<string, CrossfilterView>;
}

const RANGE_SELECTION_PREFIX = 'range:';

interface RangeSelection {
  min: number;
  max: number;
}

export function rangeSelectionKey(min: number, max: number): string {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new Error('Range selection bounds must be finite and ordered');
  }
  return `${RANGE_SELECTION_PREFIX}${min}:${max}`;
}

function parseRangeSelectionKey(key: string): RangeSelection | null {
  if (!key.startsWith(RANGE_SELECTION_PREFIX)) return null;
  const [minRaw, maxRaw] = key.slice(RANGE_SELECTION_PREFIX.length).split(':');
  const min = Number(minRaw);
  const max = Number(maxRaw);
  return Number.isFinite(min) && Number.isFinite(max) && min <= max ? { min, max } : null;
}

/** Stringify a cell the same way selections/groupBy keys are produced. */
function keyOf(value: Cell): string {
  return value == null ? 'null' : String(value);
}

function rangeComparable(value: Cell): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesSelection(
  row: Row,
  field: string,
  selectedKeys: readonly string[],
  mode: CrossfilterSelectionMode | undefined,
): boolean {
  if (mode !== 'range') {
    return new Set(selectedKeys).has(keyOf(row[field] ?? null));
  }
  const ranges = selectedKeys.map(parseRangeSelectionKey).filter((range): range is RangeSelection => range !== null);
  if (ranges.length === 0) return false;
  const value = rangeComparable(row[field] ?? null);
  return value !== null && ranges.some((range) => value >= range.min && value <= range.max);
}

/**
 * Resolve the set of source views whose selection should be applied to
 * `targetViewId`, honouring the declared scope and self-exclusion.
 */
export function sourcesFor(graph: CrossfilterGraph, targetViewId: string): string[] {
  const allViews = Object.keys(graph.views);
  const sources: string[] = [];
  for (const sourceId of allViews) {
    if (sourceId === targetViewId) continue; // a view never filters itself
    const view = graph.views[sourceId]!;
    const affects = view.affects ?? allViews.filter((v) => v !== sourceId);
    if (affects.includes(targetViewId)) {
      sources.push(sourceId);
    }
  }
  return sources;
}

/**
 * Compute the rows visible to a given view.
 *
 * Order of operations:
 *   1. Apply all dimension filters from `state.filters` (global slicers).
 *   2. Apply the selection of every *other* view that, per the graph, affects
 *      this view. The view's own selection is ignored (self-exclusion).
 *
 * When `viewId` is omitted, only the global dimension filters are applied
 * (useful for "what's the unscoped, globally-filtered dataset").
 */
export function applyCrossfilter(
  state: DashboardState,
  data: readonly Row[],
  viewId?: string,
  graph?: CrossfilterGraph,
): Row[] {
  let rows = applyFilters(state, data);

  if (!viewId || !graph) return rows;

  const sources = sourcesFor(graph, viewId);
  for (const sourceId of sources) {
    const selectedKeys = state.selections[sourceId];
    if (!selectedKeys || selectedKeys.length === 0) continue;
    const sourceView = graph.views[sourceId];
    if (!sourceView) continue;
    const field = sourceView.field;
    rows = rows.filter((row) => matchesSelection(row, field, selectedKeys, sourceView.selection));
  }

  return rows;
}
