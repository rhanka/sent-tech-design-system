/**
 * Generalized drill engine — the shared, framework-agnostic core of every
 * drillable categorical chart. It reads/writes the dashboard store's drill
 * contract (`state.drill[viewId]` = the ordered path of dimensions already
 * drilled into) exactly like {@link DrillBarChart}, but factored out so any
 * chart kind (bar / donut / treemap / …) can reuse it without re-implementing
 * the level maths or the drill-vs-select decision.
 *
 * It is pure-ish: every function takes the store and reads/calls its public API
 * only. No framework imports, no presentation — components below compose the DS
 * chart wrappers around the data this returns.
 */

import { findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';

/** One aggregated row at the current drill level: a categorical key + measure. */
export type DrillDatum = { key: string; value: number };

/**
 * A resolved view of a drill at one point in time.
 * - `dimension`: the hierarchy dimension currently grouped by (the active level).
 * - `level`: depth of the drill path, capped at the deepest hierarchy index.
 * - `canDrill`: true when there is a deeper level to drill into.
 * - `data`: aggregated `{ key, value }` rows for the current crossfiltered path.
 */
export type DrillLevel = {
  dimension: string | undefined;
  level: number;
  canDrill: boolean;
  data: DrillDatum[];
};

/**
 * Current depth of a view's drill: the length of its drill path, clamped so it
 * never points past the deepest hierarchy level.
 */
export function drillDepth(store: DashboardStore, viewId: string, hierarchy: string[]): number {
  const path = store.getState().drill[viewId] ?? [];
  return Math.min(path.length, Math.max(hierarchy.length - 1, 0));
}

/**
 * Resolve the current drill level for a view: which dimension is active, whether
 * a deeper level exists, and the aggregated rows to render at this level.
 *
 * Rows come from the store's per-view cross-filter scope, so previously-drilled
 * values (applied as include-filters) are already reflected.
 */
export function drillLevel(
  store: DashboardStore,
  viewId: string,
  hierarchy: string[],
  measure: string,
): DrillLevel {
  const level = drillDepth(store, viewId, hierarchy);
  const dimension = hierarchy[level];
  const canDrill = level < hierarchy.length - 1;
  const m = findMeasure(store.model, measure);
  const data: DrillDatum[] =
    m && dimension ? groupAggregate(store.applyCrossfilter(viewId), dimension, m) : [];
  return { dimension, level, canDrill, data };
}

/**
 * Perform one drill step for a selected key at the current level.
 *
 * When a deeper level exists: filter the clicked value (`include`) and push the
 * next hierarchy dimension as the new group-by — drilling one level deeper.
 * At the deepest level there is nowhere to drill, so the key toggles this view's
 * selection (brushing) instead. Mirrors {@link DrillBarChart}'s `onSelect`.
 */
export function onDrillSelect(
  store: DashboardStore,
  viewId: string,
  hierarchy: string[],
  key: string,
): void {
  const level = drillDepth(store, viewId, hierarchy);
  const dimension = hierarchy[level];
  const canDrill = level < hierarchy.length - 1;
  if (canDrill && dimension) {
    store.setFilter(dimension, { kind: 'include', values: [key] });
    store.drillDown(viewId, hierarchy[level + 1]);
  } else {
    store.toggleSelection(viewId, key);
  }
}
