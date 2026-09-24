/**
 * PROCESSING ADAPTER (GD-M2-PROCESSING).
 *
 * Monorepo-authored module (NOT a provenance copy): it bridges the upstream
 * layout cores in `processing/graph-layout.ts` / `processing/hierarchy-layout.ts`
 * — which keep their upstream signatures — to the design-system {@link LayoutFn}
 * contract `(graph: RenderGraphBuffers, options?: LayoutOptions) => Float32Array`.
 * Importing this module registers `"force-fa2"` and `"hierarchy-aware"` in the
 * layout registry as a side effect; the `"force"` DEFAULT is untouched (it stays
 * the baked-positions passthrough — see `layout-registry.ts`).
 *
 * Upstream signatures vs the DS contract (measured):
 *   • `computeLayout(nodes: { id, fx?, fy? }[], edges: { source, target }[])`
 *     returns `LayoutResult[]` keyed by `id`, NOT node-order-keyed positions.
 *     {@link projectLayoutResults} re-keys them onto `graph.nodeIds` order and
 *     fails loudly on a missing or extra id.
 *   • `computeHierarchyAwarePositions(nodes, hierarchies)` takes a MANDATORY
 *     `hierarchies` second argument the DS `LayoutOptions` did not transport,
 *     and returns a `Float64Array`. The adapter reads the forests from
 *     `LayoutOptions.hierarchies` (see the tranche note below) and narrows the
 *     result to `Float32Array` — a LOSSY conversion, assumed and tested for
 *     itself (reproducibility of the 32-bit output, never equality with the
 *     64-bit buffer).
 *   • `LayoutOptions.seed` is IGNORED by `"force-fa2"` (tranche 1, option (b)):
 *     wiring it would mean editing the provenance copy, which must stay
 *     byte-identical. The effective seed is derived internally from the SORTED
 *     node ids (`stableSeed`, FNV-1a in `graph-layout.ts`) fed to `mulberry32`.
 *     Determinism therefore holds per input graph, independent of `seed`.
 *
 * Environment (tranche 2): `GRAPHIFY_FAST_LAYOUT` cannot live under that name
 * as the primary key of a `@sentropic/*` package. The DS path reads
 * `SENTROPIC_FAST_LAYOUT` first with `GRAPHIFY_FAST_LAYOUT` as the legacy
 * fallback (same truthy set as upstream: `1`/`true`/`on`/`yes`). An explicit
 * `options.iterations` ALWAYS wins over the environment — mirroring the
 * upstream posture — and is tested. The upstream `fastLayoutEnabled()` helper
 * keeps its own (`ENGRAM_FAST_LAYOUT` → `GRAPHIFY_FAST_LAYOUT`) semantics and
 * is NOT consulted on the DS path.
 *
 * `hierarchies` transport (tranche 3): the forest travels as
 * `LayoutOptions.hierarchies`, NOT as a dedicated `hierarchy-aware` signature.
 * The registry contract fixes `LayoutFn` to `(graph, options?)` — a dedicated
 * signature could not satisfy `resolveLayout` / `createLayoutEngine`, so any
 * extra input must ride on `options`. Both `hierarchies` and the
 * `hierarchyLayout` tuning passthrough are optional & additive and ignored by
 * every other layout, exactly like the existing `nodeTypes` / `nodeTimes`.
 *
 * `defaultLayoutIterations` / fast path (measured upstream, WP1): layout cost
 * is linear in iterations and the macro-structure settles within ~60-120 ticks,
 * so the adaptive budget (300 @ n<=300, easing to 120 @ n>=1500, floor 90 @
 * n>=20000) cuts only wasted compute — never nodes. With the env unset the
 * path uses a flat 300 ticks.
 */

import {
  computeLayout,
  defaultLayoutIterations,
  type LayoutGraphEdge,
  type LayoutGraphNode,
  type LayoutResult,
} from "./graph-layout.js";
import {
  computeHierarchyAwarePositions,
  type HierarchyLayoutNode,
} from "./hierarchy-layout.js";
import { registerLayout, type LayoutFn } from "../layout-registry.js";
import type { LayoutOptions, NodeId, RenderGraphBuffers } from "../types.js";

/** Registered id of the computed FA2 force layout (OPT-IN; never the default). */
export const FORCE_FA2_LAYOUT_ID = "force-fa2";

/** Registered id of the hierarchy-aware layout (OPT-IN; never the default). */
export const HIERARCHY_AWARE_LAYOUT_ID = "hierarchy-aware";

/**
 * True when the DS fast-layout opt-in is enabled: env `SENTROPIC_FAST_LAYOUT`
 * truthy (`1`/`true`/`on`/`yes`), falling back to legacy
 * `GRAPHIFY_FAST_LAYOUT`. OFF by default. Never consults `options` — an
 * explicit `options.iterations` wins over this in {@link resolveForceFa2Iterations}.
 */
export function sentropicFastLayoutEnabled(): boolean {
  const raw =
    typeof process !== "undefined" && process.env
      ? (process.env.SENTROPIC_FAST_LAYOUT ?? process.env.GRAPHIFY_FAST_LAYOUT)
      : undefined;
  if (!raw) return false;
  const v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

/**
 * Effective FA2 iteration budget for `nodeCount` nodes: the explicit
 * `options.iterations` when set (never overridden by the environment),
 * otherwise the adaptive `defaultLayoutIterations(nodeCount)` under the
 * fast-layout opt-in, otherwise the flat 300.
 */
export function resolveForceFa2Iterations(
  nodeCount: number,
  options?: LayoutOptions,
): number {
  if (options?.iterations !== undefined) {
    return Math.max(1, Math.round(options.iterations));
  }
  if (sentropicFastLayoutEnabled()) return defaultLayoutIterations(nodeCount);
  return 300;
}

/**
 * Re-key id-keyed `LayoutResult[]` onto node order.
 *
 * @throws with the offending id when a result references a node id absent from
 * `nodeIds` (extra) or when a node id has no result (missing).
 */
export function projectLayoutResults(
  nodeIds: readonly NodeId[],
  results: readonly LayoutResult[],
): Float32Array {
  const known = new Set<string>(nodeIds);
  for (const result of results) {
    if (!known.has(result.id)) {
      throw new Error(`layout result for unknown node id "${result.id}"`);
    }
  }
  const byId = new Map<string, LayoutResult>();
  for (const result of results) byId.set(result.id, result);
  const out = new Float32Array(nodeIds.length * 2);
  for (let i = 0; i < nodeIds.length; i++) {
    const id = nodeIds[i] as string;
    const result = byId.get(id);
    if (!result) {
      throw new Error(`layout result missing node id "${id}"`);
    }
    out[i * 2] = result.x;
    out[i * 2 + 1] = result.y;
  }
  return out;
}

function projectBuffersToInputs(graph: RenderGraphBuffers): {
  nodes: LayoutGraphNode[];
  edges: LayoutGraphEdge[];
} {
  const nodes: LayoutGraphNode[] = graph.nodeIds.map((id, i) => {
    if (graph.nodeFlags?.fixed[i] === 1) {
      return { id, fx: graph.positions[i * 2] as number, fy: graph.positions[i * 2 + 1] as number };
    }
    return { id };
  });
  const edges: LayoutGraphEdge[] = [];
  for (let e = 0; e + 1 < graph.edges.length; e += 2) {
    const source = graph.nodeIds[graph.edges[e] as number] as string;
    const target = graph.nodeIds[graph.edges[e + 1] as number] as string;
    edges.push({ source, target });
  }
  return { nodes, edges };
}

/**
 * `"force-fa2"` as a {@link LayoutFn}: the deterministic Barnes-Hut FA2
 * computation projected onto node order. Pinned nodes (`nodeFlags`) are held
 * fixed at their baked positions. `LayoutOptions.seed` is ignored (see the
 * header); `repulsion` / `theta` are forwarded when set.
 */
export const forceFa2Layout: LayoutFn = (graph, options) => {
  const { nodes, edges } = projectBuffersToInputs(graph);
  const results = computeLayout(nodes, edges, {
    iterations: resolveForceFa2Iterations(graph.nodeIds.length, options),
    repulsion: options?.repulsion,
    theta: options?.theta,
  });
  return projectLayoutResults(graph.nodeIds, results);
};

/**
 * `"hierarchy-aware"` as a {@link LayoutFn}: the simulation-free tidy-tree +
 * phyllotaxis layout over `options.hierarchies`, narrowed to `Float32Array`.
 * Node membership is matched on the node id (the DS buffers carry no
 * `registry_record_id`; loose nodes reuse `options.nodeTypes` for their type
 * discs). With no usable forest this degrades to the `"force-fa2"`
 * computation, mirroring the upstream fallback to the force bake.
 */
export const hierarchyAwareLayout: LayoutFn = (graph, options) => {
  const forests = options?.hierarchies ?? {};
  const usable = Object.values(forests).some(
    (forest) => forest && Object.keys(forest.nodes_by_id ?? {}).length > 0,
  );
  if (!usable) return forceFa2Layout(graph, options);
  const types = options?.nodeTypes;
  const nodes: HierarchyLayoutNode[] = graph.nodeIds.map((id, i) => {
    const type = types?.[i];
    return typeof type === "string" && type.trim() !== "" ? { id, type } : { id };
  });
  const result = computeHierarchyAwarePositions(nodes, forests, options?.hierarchyLayout ?? {});
  // Narrowing 64→32 bits: lossy by construction (see the header). The 32-bit
  // output itself is deterministic for identical inputs.
  return new Float32Array(result.positions);
};

registerLayout(FORCE_FA2_LAYOUT_ID, forceFa2Layout);
registerLayout(HIERARCHY_AWARE_LAYOUT_ID, hierarchyAwareLayout);
