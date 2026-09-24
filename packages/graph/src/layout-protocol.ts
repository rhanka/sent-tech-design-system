/**
 * SHARED LAYOUT MESSAGE PROTOCOL (GD-M2-WORKERS) — internal module.
 *
 * Not a public subpath: `@sentropic/graph/worker` and
 * `@sentropic/graph/layout-client` both re-export the parts of it a consumer
 * needs. Keeping the wire shape AND the computation in one module is what makes
 * the two dispatch paths byte-equal by CONSTRUCTION rather than by convention:
 * {@link computeSnapshotPositions} is the only place either path computes, so
 * "worker positions equal synchronous positions" cannot drift into a claim that
 * two near-copies of the same loop happen to agree today.
 *
 * VERSIONED PER SNAPSHOT, and that is the whole point. `snapshotId` names the
 * input graph; `version` is a caller-side integer that MUST increase for a
 * given `snapshotId`. At the measured cost of this computation (11 490 ms for
 * 20 000 nodes, #77) a result can easily arrive after the graph it describes
 * has been replaced twice over, so the pair `(snapshotId, version)` — not a
 * bare request id — is what lets the client drop a late answer instead of
 * painting it. The upstream `studio/src/lib/forceLayoutClient.js` keys its
 * pending map on a monotonic `id` alone, which identifies a REQUEST but says
 * nothing about whether its answer is still wanted; measured consequence: a
 * stale response there resolves its promise all the same.
 *
 * The request carries plain structured-cloneable data only (arrays of plain
 * objects, numbers, strings). No `Map`, no class instance, no function: the
 * browser `postMessage` clone algorithm and `node:worker_threads` agree on this
 * subset, so the same request object crosses either boundary unchanged.
 *
 * DELIBERATELY NOT re-used here: `processing/register.ts`'s
 * {@link projectLayoutResults}. It is the right projection, but importing it
 * drags `layout-registry.ts` — and with it the git-flow / radial / metro / grid
 * engines and their registration side effects — into the worker bundle, for a
 * nine-line loop. The loop below therefore re-derives the projection and
 * ASSERTS the ordering contract it relies on (`computeLayout` returns one
 * result per input node, in input order) on every call, so a future upstream
 * change to that ordering fails loudly instead of silently transposing
 * positions.
 */

import { computeLayout } from "./processing/graph-layout.js";

/** One input node: id, plus optional pin coordinates (`fx`/`fy` held fixed). */
export interface LayoutSnapshotNode {
  id: string;
  fx?: number;
  fy?: number;
}

/** One input edge, by node id. */
export interface LayoutSnapshotEdge {
  source: string;
  target: string;
}

/**
 * Tuning forwarded verbatim to `computeLayout`.
 *
 * A structured-clone-safe subset of `ComputeLayoutOptions`: its
 * `initialPositions` accepts a `ReadonlyMap`, which clones fine but would make
 * the wire shape depend on a host type, so warm starts are expressed as a plain
 * record here. `seed` is absent on purpose — `computeLayout` derives its seed
 * internally from the SORTED node ids (`stableSeed` → `mulberry32`) and ignores
 * any caller seed, exactly as `processing/register.ts` documents for
 * `"force-fa2"`.
 */
export interface LayoutSnapshotOptions {
  iterations?: number;
  width?: number;
  height?: number;
  repulsion?: number;
  linkDistance?: number;
  theta?: number;
  /** Warm-start coordinates keyed by node id (does not pin — see `fx`/`fy`). */
  initialPositions?: Record<string, { x: number; y: number }>;
}

/** A layout request as it crosses the worker boundary. */
export interface LayoutSnapshotRequest {
  /** Identity of the input graph. */
  snapshotId: string;
  /** Strictly increasing integer per `snapshotId`. */
  version: number;
  nodes: readonly LayoutSnapshotNode[];
  edges: readonly LayoutSnapshotEdge[];
  options?: LayoutSnapshotOptions;
}

/** A successful answer: positions in `nodes` order, `2 * nodes.length` long. */
export interface LayoutSnapshotSuccess {
  snapshotId: string;
  version: number;
  positions: Float32Array;
}

/** A failed answer: the message of whatever the computation threw. */
export interface LayoutSnapshotFailure {
  snapshotId: string;
  version: number;
  error: string;
}

export type LayoutSnapshotResponse = LayoutSnapshotSuccess | LayoutSnapshotFailure;

/** Narrow a response to its failure arm. */
export function isLayoutSnapshotFailure(
  response: LayoutSnapshotResponse,
): response is LayoutSnapshotFailure {
  return typeof (response as LayoutSnapshotFailure).error === "string";
}

/**
 * Validate a value received over the message boundary as a layout request.
 *
 * Returns the reason it is not one, or `undefined` when it is. Used on BOTH
 * sides: the worker refuses a malformed message instead of throwing inside the
 * layout, and the client refuses a malformed request before it allocates a
 * version for it.
 */
export function layoutRequestProblem(value: unknown): string | undefined {
  if (value === null || typeof value !== "object") return "request is not an object";
  const request = value as Partial<LayoutSnapshotRequest>;
  if (typeof request.snapshotId !== "string" || request.snapshotId === "") {
    return "snapshotId must be a non-empty string";
  }
  if (typeof request.version !== "number" || !Number.isInteger(request.version)) {
    return "version must be an integer";
  }
  if (!Array.isArray(request.nodes)) return "nodes must be an array";
  if (!Array.isArray(request.edges)) return "edges must be an array";
  return undefined;
}

/**
 * THE single layout computation for both dispatch paths.
 *
 * @returns positions as `[x0, y0, x1, y1, …]` in `request.nodes` order, a fresh
 *   `Float32Array` on every call — never a view onto a shared buffer, so the
 *   worker may hand its buffer over as a transferable without any risk of the
 *   detached buffer being read again on a later request.
 * @throws when `computeLayout` breaks its documented ordering contract, naming
 *   the index and both ids.
 */
export function computeSnapshotPositions(request: LayoutSnapshotRequest): Float32Array {
  const nodes = request.nodes;
  const out = new Float32Array(nodes.length * 2);
  if (nodes.length === 0) return out;

  const results = computeLayout(nodes, request.edges, request.options ?? {});
  if (results.length !== nodes.length) {
    throw new Error(
      `computeLayout returned ${results.length} results for ${nodes.length} nodes`,
    );
  }
  for (let i = 0; i < results.length; i++) {
    const result = results[i] as { id: string; x: number; y: number };
    const node = nodes[i] as LayoutSnapshotNode;
    if (result.id !== node.id) {
      throw new Error(
        `computeLayout result order drifted at index ${i}: expected "${node.id}", got "${result.id}"`,
      );
    }
    out[i * 2] = result.x;
    out[i * 2 + 1] = result.y;
  }
  return out;
}
