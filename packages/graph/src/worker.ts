/**
 * WORKER ENTRY (`@sentropic/graph/worker`, GD-M2-WORKERS).
 *
 * The half of the layout that runs INSIDE the worker. It speaks
 * `self.onmessage` / `self.postMessage` and nothing else: no DOM, no renderer,
 * no registry. The layout itself comes from `../layout-protocol.js`, which is
 * also what the client's synchronous fallback calls — one computation, two
 * hosts, hence the byte-equality of the two paths.
 *
 * WHY A SUBPATH OF ITS OWN, and not a flag inside `processing`: nothing here is
 * impossible in `processing` — the guard there forbids `document` / `window` /
 * `navigator` and `tsconfig.json` already includes `DOM` in `lib`, so a module
 * hiding a `Worker` reference behind `typeof Worker !== "undefined"` would have
 * passed it unchanged (measured; the first framing of this lot claimed a
 * technical impossibility that does not exist). The real reason is the other
 * side: `layout-client.ts` writes `new Worker(new URL("./worker.js",
 * import.meta.url))`, which EMITS A BUNDLER-VISIBLE ASSET REFERENCE. A pure
 * computation entry has no business carrying one, and a consumer importing
 * `@sentropic/graph/processing` should not have a second chunk appear in its
 * build graph. So the boundary is now ENFORCED, not asserted: the `processing`
 * guard in `tests/processing/no-dom-or-renderer.test.ts` forbids `Worker`
 * alongside the three DOM globals, and `tests/workers/boundaries.test.ts`
 * asserts the dependency direction runs client → computation and never back.
 *
 * NO PROGRESS REPORTING, and for the measured reason rather than the plausible
 * one. An observation point does exist without touching the frozen copy:
 * `computeLayout` takes `iterations` and `initialPositions`, so a caller can
 * slice the run and report between slices. But slicing does NOT reproduce a
 * single call — measured upstream at 200 nodes, six slices of 50 iterations
 * against one call of 300 diverge by up to 400.6 px. Progress would therefore
 * cost the determinism this programme has protected since #77, which is what
 * disqualifies it; the absence of a callback hook never was the obstacle.
 */

import {
  computeSnapshotPositions,
  layoutRequestProblem,
  type LayoutSnapshotRequest,
  type LayoutSnapshotResponse,
} from "./layout-protocol.js";

export type {
  LayoutSnapshotEdge,
  LayoutSnapshotFailure,
  LayoutSnapshotNode,
  LayoutSnapshotOptions,
  LayoutSnapshotRequest,
  LayoutSnapshotResponse,
  LayoutSnapshotSuccess,
} from "./layout-protocol.js";

/**
 * The slice of a dedicated worker global scope this entry uses.
 *
 * Declared structurally rather than as `DedicatedWorkerGlobalScope` so the
 * module typechecks under this package's `lib: ["ES2022", "DOM"]` — the DOM
 * lib types `self` as a `Window`, whose `postMessage` demands a second
 * `targetOrigin` argument a worker scope does not take.
 */
export interface LayoutWorkerScope {
  onmessage: ((event: { data?: unknown }) => void) | null;
  postMessage(message: unknown, transfer?: readonly unknown[]): void;
}

/**
 * Answer one received message.
 *
 * Exported so the request/response contract is testable without a worker host
 * at all, and so the in-process test double drives the SAME code a real worker
 * runs rather than an imitation of it.
 *
 * @returns the response to post back, or `undefined` when the message carries
 *   no usable `(snapshotId, version)` pair. A malformed message is dropped
 *   rather than answered: with no correlation key there is no request to answer,
 *   and inventing one would let the client settle a promise that was never made.
 *   The client's own `layoutRequestProblem` check means a well-behaved caller
 *   cannot reach this arm.
 */
export function handleLayoutRequest(data: unknown): LayoutSnapshotResponse | undefined {
  const problem = layoutRequestProblem(data);
  const partial = (data ?? {}) as Partial<LayoutSnapshotRequest>;
  if (problem !== undefined) {
    if (typeof partial.snapshotId !== "string" || typeof partial.version !== "number") {
      return undefined;
    }
    return { snapshotId: partial.snapshotId, version: partial.version, error: problem };
  }
  const request = data as LayoutSnapshotRequest;
  try {
    return {
      snapshotId: request.snapshotId,
      version: request.version,
      positions: computeSnapshotPositions(request),
    };
  } catch (error) {
    return {
      snapshotId: request.snapshotId,
      version: request.version,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Wire {@link handleLayoutRequest} onto a worker scope.
 *
 * The positions buffer is handed over as a TRANSFERABLE: it is freshly
 * allocated by `computeSnapshotPositions` on every call and never read again on
 * this side, so detaching it here cannot strand a later request. Transferring
 * an unsupported value throws in some hosts, so the transfer is attempted and
 * the plain copy is the fallback — the received positions are identical either
 * way, only the copy cost differs.
 */
export function installLayoutWorker(scope: LayoutWorkerScope): void {
  scope.onmessage = (event) => {
    const response = handleLayoutRequest(event?.data);
    if (response === undefined) return;
    if ("positions" in response) {
      try {
        scope.postMessage(response, [response.positions.buffer]);
        return;
      } catch {
        // Host refused the transfer list (or the buffer was already detached by
        // a host that clones eagerly): post the clone instead.
      }
    }
    scope.postMessage(response);
  };
}

/**
 * True when `globalThis` looks like a dedicated worker scope.
 *
 * `postMessage` alone is not enough — a browser `window` has one too — so the
 * absence of `document` is required as well. This module only ever loads as a
 * worker in production; the check exists so importing it on a main thread (a
 * test, a bundler's module-graph walk) neither throws nor hijacks the host's
 * `onmessage`.
 */
function isWorkerScope(scope: unknown): scope is LayoutWorkerScope {
  if (scope === null || typeof scope !== "object") return false;
  const candidate = scope as Record<string, unknown>;
  if (typeof candidate.postMessage !== "function") return false;
  if (typeof candidate.WorkerGlobalScope !== "undefined") return true;
  return typeof candidate.document === "undefined";
}

if (isWorkerScope(globalThis)) installLayoutWorker(globalThis as unknown as LayoutWorkerScope);
