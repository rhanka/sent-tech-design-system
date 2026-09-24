/**
 * DOM-free layout COMPUTATION entry point (`@sentropic/graph/processing`).
 *
 * Pure computation: none of the modules re-exported here imports `renderer.ts`,
 * `webgl-*.ts`, or any DOM API, so this entry loads in Node without jsdom.
 *
 * Two modules from the upstream copy set are DELIBERATELY not re-exported:
 *   • `graph-layout.ts`'s `LayoutResult` stays local to that provenance module.
 *     The name is generic enough to collide with consumer-side result types;
 *     the public vocabulary here is `Float32Array` positions and
 *     `LayoutOutcome` (see `../types.ts`), bridged by `toPositions`.
 *   • `scene-layout.ts` is copied for provenance and its tests run, but it
 *     self-imports the `@sentropic/graph` package root (for the typed-layer /
 *     time-oriented cores) — re-exporting it would drag the renderer into this
 *     DOM-free entry. The DS hierarchy-aware path uses
 *     `computeHierarchyAwarePositions` directly through `register.ts`.
 */

export {
  attachLayoutPositions,
  computeLayout,
  defaultLayoutIterations,
  fastLayoutEnabled,
  type ComputeLayoutOptions,
  type LayoutGraphEdge,
  type LayoutGraphNode,
} from "./graph-layout.js";
export {
  computeHierarchyAwarePositions,
  type HierarchyAwareLayoutOptions,
  type HierarchyAwareLayoutResult,
  type HierarchyLayoutForest,
  type HierarchyLayoutNode,
} from "./hierarchy-layout.js";
export {
  FORCE_FA2_LAYOUT_ID,
  HIERARCHY_AWARE_LAYOUT_ID,
  forceFa2Layout,
  hierarchyAwareLayout,
  projectLayoutResults,
  resolveForceFa2Iterations,
  sentropicFastLayoutEnabled,
} from "./register.js";
