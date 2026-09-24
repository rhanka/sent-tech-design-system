/**
 * LAYOUT CLIENT (`@sentropic/graph/layout-client`, GD-M2-WORKERS).
 *
 * The caller's half. It creates ONE worker when `Worker` exists, falls back to
 * the synchronous computation otherwise (SSR, jsdom, Node), and returns an
 * outcome that does not say which of the two paths served it.
 *
 * WHAT THIS HAS THAT THE UPSTREAM CLIENT DOES NOT — the reason the lot exists.
 * `computeLayout` is measured at 11 490 ms for 20 000 nodes (#77). At that cost
 * an answer routinely arrives after the graph it describes has been replaced, so
 * the question is not "did the computation finish" but "is this answer still the
 * one to paint". `studio/src/lib/forceLayoutClient.js` (85 lines) cannot answer
 * it: its pending map is keyed on a monotonic request `id`, which identifies a
 * request but carries no notion of which input graph it belongs to. Two measured
 * consequences are reproduced nowhere below, on purpose:
 *   • its `terminateForceWorker()` runs `pending.clear()` WITHOUT settling, so
 *     every in-flight promise is abandoned forever — a component unmount leaks
 *     an await that never returns. Here {@link LayoutClient.terminate} closes
 *     each in-flight request as `cancelled` / `"terminated"`.
 *   • a late response there RESOLVES its promise all the same, so a caller that
 *     re-asked receives both answers in arrival order with no way to tell the
 *     stale one. Here a response whose `version` is below the latest requested
 *     version for its `snapshotId` is DISCARDED by the client and never reaches
 *     the caller; {@link LayoutClient.stats} counts it and records the reason.
 *
 * ONE REQUEST IN FLIGHT PER CLIENT, and that is a deliberate addition to the
 * protocol the spec fixes (it requires one reused worker; it says nothing about
 * concurrency). A worker processes its message queue serially, so posting three
 * requests for the same snapshot would make the newest wait behind two answers
 * nobody wants — at 20 000 nodes, ~34 s before the useful one. The client
 * therefore keeps at most one request in flight and queues the rest; a queued
 * request superseded before it is ever posted costs NOTHING. Measured
 * consequence on the three-rapid-requests scenario: two requests close as
 * superseded, exactly one result is discarded as stale, and exactly one
 * computation is wasted, instead of three computations and two discards.
 *
 * NEITHER PATH SETTLES EARLIER THAN THE OTHER, which forces one non-obvious
 * choice: the synchronous computation is deferred to a macrotask instead of
 * running inline. Inline, three requests issued in the same tick would each
 * compute and resolve before the next was even created, so all three callers
 * would receive positions — the opposite of the worker path's behaviour, and a
 * way to tell the paths apart. Deferring costs the sync path one macrotask of
 * latency (measured at well under 1 ms) and buys identical supersession
 * semantics on both paths.
 *
 * `request()` NEVER REJECTS for a runtime outcome: cancellation, supersession
 * and computation failure are all arms of {@link LayoutRequestOutcome}, so a
 * caller has one code path instead of a `try`/`catch` plus a status check. It
 * DOES throw synchronously for a contract violation (a malformed request, or a
 * forced worker dispatch in a host with no `Worker`), because that is a bug in
 * the caller and not a result.
 */

import {
  computeSnapshotPositions,
  isLayoutSnapshotFailure,
  layoutRequestProblem,
  type LayoutSnapshotRequest,
  type LayoutSnapshotResponse,
} from "./layout-protocol.js";

export type {
  LayoutSnapshotEdge,
  LayoutSnapshotNode,
  LayoutSnapshotOptions,
  LayoutSnapshotRequest,
  LayoutSnapshotResponse,
} from "./layout-protocol.js";

/**
 * Node count below which `"auto"` dispatch prefers the synchronous path.
 *
 * MEASURED, not guessed — see the PR body for the full table. The message
 * boundary is not free: posting the request and cloning the answer back costs a
 * roughly node-count-proportional amount that the worker's parallelism only
 * starts to repay once the computation itself dominates. Below this count the
 * worker's wall time as perceived by the caller EXCEEDS the synchronous one, so
 * `"auto"` picks the synchronous path there; the freeze it causes at those sizes
 * is a few milliseconds, far below a frame.
 *
 * Re-measure with `node bench/layout-worker-bench.mjs` after any change to the
 * computation or to the message shape.
 */
export const WORKER_NODE_THRESHOLD = 700;

/** Which path a client is allowed to take. `"auto"` applies the threshold. */
export type LayoutDispatchMode = "auto" | "worker" | "sync";

/** Why a request closed without positions. */
export type LayoutCancelReason =
  /** A higher `version` was requested for the same `snapshotId`. */
  | "superseded"
  /** {@link LayoutClient.cancel} closed it explicitly. */
  | "cancelled"
  /** {@link LayoutClient.terminate} tore the client down. */
  | "terminated";

export interface FulfilledLayoutOutcome {
  status: "fulfilled";
  snapshotId: string;
  version: number;
  /** `[x0, y0, x1, y1, …]` in request-node order, `2 * nodes.length` long. */
  positions: Float32Array;
}

export interface CancelledLayoutOutcome {
  status: "cancelled";
  snapshotId: string;
  version: number;
  reason: LayoutCancelReason;
}

export interface FailedLayoutOutcome {
  status: "failed";
  snapshotId: string;
  version: number;
  /** Message of whatever the computation threw, wherever it ran. */
  error: string;
}

/**
 * What a request resolves to.
 *
 * Carries NO marker of the path that served it: the same three arms, with the
 * same fields, whether the positions came from a worker or from the synchronous
 * fallback. Path counters live out of band in {@link LayoutClientStats}, which
 * is instrumentation for benchmarks and tests and not part of this contract.
 */
export type LayoutRequestOutcome =
  | FulfilledLayoutOutcome
  | CancelledLayoutOutcome
  | FailedLayoutOutcome;

/** A request as a caller submits it — `version` may be left to the client. */
export interface LayoutClientRequest extends Omit<LayoutSnapshotRequest, "version"> {
  /**
   * Strictly increasing per `snapshotId`. Omitted ⇒ the client allocates the
   * next integer for that snapshot. A value at or below the latest already
   * requested closes immediately as `cancelled` / `"superseded"`: it is a
   * request for a graph state the caller has already moved past.
   */
  version?: number;
}

/** The last result the client refused to forward, for tests and diagnostics. */
export interface DiscardedLayoutResult {
  snapshotId: string;
  version: number;
  /** Latest version requested for that snapshot when the result arrived. */
  latestVersion: number;
  reason: "stale" | "cancelled" | "unmatched";
}

/**
 * Out-of-band counters. Instrumentation only: nothing here is part of the
 * request/response contract, and a caller cannot reach it from an outcome.
 */
export interface LayoutClientStats {
  /** Requests accepted (a request refused for contract reasons throws). */
  requests: number;
  fulfilled: number;
  failed: number;
  /** Requests closed as `cancelled` / `"superseded"`. */
  superseded: number;
  /** Of those, the ones superseded before they were ever dispatched. */
  supersededBeforeDispatch: number;
  /** Requests closed by {@link LayoutClient.cancel}. */
  cancelled: number;
  /** Requests closed by {@link LayoutClient.terminate}. */
  terminated: number;
  /** RESULTS dropped because their version was below the snapshot's latest. */
  staleResultsDiscarded: number;
  /** Results dropped because their request had been cancelled explicitly. */
  discardedAfterCancel: number;
  /** Results that matched no known request at all (protocol anomaly). */
  unmatchedResults: number;
  /** Requests actually posted to a worker. */
  workerDispatches: number;
  /** Requests actually computed on the calling thread. */
  syncDispatches: number;
  /** Worker `onerror` events handled (each one tears the worker down). */
  workerFailures: number;
  /** The last discarded result, or `undefined` when none was. */
  lastDiscarded?: DiscardedLayoutResult;
}

/**
 * The slice of a `Worker` this client uses.
 *
 * Structural on purpose: a browser `Worker`, a `node:worker_threads` bridge and
 * an in-process test double all satisfy it, so the protocol can be exercised for
 * real in a host that has no `Worker` global at all (Node 22 has none — measured
 * — while jsdom's is not usable for a module worker).
 */
export interface LayoutWorkerHandle {
  postMessage(message: unknown, transfer?: readonly unknown[]): void;
  terminate(): void;
  onmessage: ((event: { data?: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export interface LayoutClientOptions {
  /**
   * Build the worker. Defaults to the published form
   * `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })`.
   * Override it to bridge a host whose worker is not a browser `Worker`.
   */
  createWorker?: () => LayoutWorkerHandle;
  /** Override {@link WORKER_NODE_THRESHOLD} for this client. */
  workerNodeThreshold?: number;
  /** Default dispatch mode; per-request `dispatch` wins. Default `"auto"`. */
  dispatch?: LayoutDispatchMode;
}

export interface LayoutClient {
  /** Submit a request. Never rejects for a runtime outcome. */
  request(
    request: LayoutClientRequest,
    dispatch?: LayoutDispatchMode,
  ): Promise<LayoutRequestOutcome>;
  /**
   * Close open requests for `snapshotId` (all versions, or one) as
   * `cancelled` / `"cancelled"`.
   *
   * @returns how many requests were closed.
   */
  cancel(snapshotId: string, version?: number): number;
  /**
   * Tear the worker down and close every open request as `cancelled` /
   * `"terminated"`. A later request builds a fresh worker.
   */
  terminate(): void;
  /** True when this client can build a worker (and has not broken one). */
  workerSupported(): boolean;
  /** A snapshot copy of the out-of-band counters. */
  stats(): LayoutClientStats;
}

/**
 * URL of the worker entry, in the published form bundlers rewrite.
 *
 * `new URL("./worker.js", import.meta.url)` is the shape Vite, webpack and
 * Rollup all recognise as a worker asset reference, and the shape upstream uses.
 * In the published package `dist/layout-client.js` and `dist/worker.js` are
 * siblings, so the relative specifier resolves inside the installed tarball —
 * which the pack smoke test verifies from the tarball rather than from source.
 *
 * @throws in a CommonJS host, where `import.meta` does not exist. That is why
 *   the two new subpaths are published ESM-only; a `require()` consumer has the
 *   synchronous path, which needs no URL.
 */
export function resolveLayoutWorkerUrl(): URL {
  return new URL("./worker.js", import.meta.url);
}

/** True when this host can construct a module worker from a URL. */
export function layoutWorkerSupported(): boolean {
  return typeof Worker !== "undefined" && typeof URL !== "undefined";
}

function defaultCreateWorker(): LayoutWorkerHandle {
  // One cast, deliberately: the DOM lib types `Worker.onmessage` as taking a
  // full `MessageEvent`, which is not assignable to this client's structural
  // handle under `strictFunctionTypes`. The runtime shapes match exactly.
  return new Worker(resolveLayoutWorkerUrl(), { type: "module" }) as unknown as LayoutWorkerHandle;
}

interface PendingRequest {
  request: LayoutSnapshotRequest;
  settle: (outcome: LayoutRequestOutcome) => void;
  settled: boolean;
  dispatch: LayoutDispatchMode;
  dispatched: boolean;
}

function requestKey(snapshotId: string, version: number): string {
  return `${snapshotId}\u0000${version}`;
}

function emptyStats(): LayoutClientStats {
  return {
    requests: 0,
    fulfilled: 0,
    failed: 0,
    superseded: 0,
    supersededBeforeDispatch: 0,
    cancelled: 0,
    terminated: 0,
    staleResultsDiscarded: 0,
    discardedAfterCancel: 0,
    unmatchedResults: 0,
    workerDispatches: 0,
    syncDispatches: 0,
    workerFailures: 0,
  };
}

/**
 * Build a layout client.
 *
 * Each client owns at most one worker and its own version bookkeeping, so two
 * clients never supersede each other's requests.
 */
export function createLayoutClient(options: LayoutClientOptions = {}): LayoutClient {
  const createWorker = options.createWorker ?? defaultCreateWorker;
  const canCreateWorker = options.createWorker !== undefined || layoutWorkerSupported();
  const threshold = options.workerNodeThreshold ?? WORKER_NODE_THRESHOLD;
  const defaultDispatch = options.dispatch ?? "auto";

  const stats = emptyStats();
  /** Latest version REQUESTED per snapshot — the staleness reference. */
  const latestVersion = new Map<string, number>();
  /** Open requests by `(snapshotId, version)`. */
  const open = new Map<string, PendingRequest>();
  /** Order in which open requests wait for the single dispatch slot. */
  const queue: PendingRequest[] = [];
  /**
   * Keys of requests cancelled explicitly while their computation was already
   * dispatched, so their late result is discarded with the right reason rather
   * than counted as a protocol anomaly. Entries are removed when the result
   * arrives, and on teardown, so the set stays bounded by the in-flight count.
   */
  const cancelledAfterDispatch = new Set<string>();

  let worker: LayoutWorkerHandle | null = null;
  let workerBroken = false;
  let inFlight: PendingRequest | null = null;

  function close(entry: PendingRequest, outcome: LayoutRequestOutcome): void {
    if (entry.settled) return;
    entry.settled = true;
    open.delete(requestKey(entry.request.snapshotId, entry.request.version));
    entry.settle(outcome);
  }

  function closeSuperseded(entry: PendingRequest): void {
    if (entry.settled) return;
    stats.superseded++;
    if (!entry.dispatched) stats.supersededBeforeDispatch++;
    close(entry, {
      status: "cancelled",
      snapshotId: entry.request.snapshotId,
      version: entry.request.version,
      reason: "superseded",
    });
  }

  function isStale(entry: PendingRequest): boolean {
    const latest = latestVersion.get(entry.request.snapshotId);
    return latest !== undefined && entry.request.version < latest;
  }

  /**
   * The SHARED result handling for both paths: staleness, explicit-cancel and
   * unmatched-result decisions live here once, so a worker answer and a
   * synchronous answer are judged by exactly the same rule.
   */
  function deliver(response: LayoutSnapshotResponse): void {
    const key = requestKey(response.snapshotId, response.version);
    if (inFlight !== null && requestKey(inFlight.request.snapshotId, inFlight.request.version) === key) {
      inFlight = null;
    }
    const latest = latestVersion.get(response.snapshotId);
    if (latest !== undefined && response.version < latest) {
      // THE property this lot exists for: a result for a graph state the caller
      // has moved past is dropped here and never reaches it.
      stats.staleResultsDiscarded++;
      stats.lastDiscarded = {
        snapshotId: response.snapshotId,
        version: response.version,
        latestVersion: latest,
        reason: "stale",
      };
      cancelledAfterDispatch.delete(key);
      pump();
      return;
    }
    const entry = open.get(key);
    if (entry === undefined) {
      if (cancelledAfterDispatch.delete(key)) {
        stats.discardedAfterCancel++;
        stats.lastDiscarded = {
          snapshotId: response.snapshotId,
          version: response.version,
          latestVersion: latest ?? response.version,
          reason: "cancelled",
        };
      } else {
        stats.unmatchedResults++;
        stats.lastDiscarded = {
          snapshotId: response.snapshotId,
          version: response.version,
          latestVersion: latest ?? response.version,
          reason: "unmatched",
        };
      }
      pump();
      return;
    }
    if (isLayoutSnapshotFailure(response)) {
      stats.failed++;
      close(entry, {
        status: "failed",
        snapshotId: response.snapshotId,
        version: response.version,
        error: response.error,
      });
    } else {
      stats.fulfilled++;
      close(entry, {
        status: "fulfilled",
        snapshotId: response.snapshotId,
        version: response.version,
        positions: response.positions,
      });
    }
    pump();
  }

  function ensureWorker(): LayoutWorkerHandle | null {
    if (worker !== null) return worker;
    if (workerBroken || !canCreateWorker) return null;
    let created: LayoutWorkerHandle;
    try {
      created = createWorker();
    } catch {
      // Construction failure (a bundler that did not emit the chunk, a CSP that
      // refuses the worker URL) is permanent for this client: mark it broken so
      // later requests go straight to the synchronous path instead of paying a
      // failed construction each time.
      workerBroken = true;
      return null;
    }
    created.onmessage = (event) => {
      const data = event?.data as LayoutSnapshotResponse | undefined;
      if (data === undefined || typeof data.snapshotId !== "string") return;
      deliver(data);
    };
    created.onerror = () => {
      handleWorkerFailure();
    };
    worker = created;
    return worker;
  }

  /**
   * A worker-level failure (a module that would not load, a crash) tears the
   * worker down and marks the client so later requests take the synchronous
   * path — failing them in series would be the worse answer. A request that was
   * in flight when the worker died is RE-DISPATCHED synchronously rather than
   * failed: the caller asked for positions and can still have them.
   */
  function handleWorkerFailure(): void {
    stats.workerFailures++;
    workerBroken = true;
    const victim = inFlight;
    inFlight = null;
    if (worker !== null) {
      worker.onmessage = null;
      worker.onerror = null;
      try {
        worker.terminate();
      } catch {
        // A handle that refuses to terminate is already gone; nothing to undo.
      }
      worker = null;
    }
    cancelledAfterDispatch.clear();
    if (victim !== null && !victim.settled) {
      if (isStale(victim)) closeSuperseded(victim);
      else queue.unshift(victim);
    }
    pump();
  }

  function resolvePath(entry: PendingRequest): "worker" | "sync" {
    if (entry.dispatch === "sync") return "sync";
    if (entry.dispatch === "worker") return "worker";
    const available = !workerBroken && (worker !== null || canCreateWorker);
    if (!available) return "sync";
    return entry.request.nodes.length >= threshold ? "worker" : "sync";
  }

  function dispatch(entry: PendingRequest): void {
    const path = resolvePath(entry);
    entry.dispatched = true;
    inFlight = entry;
    if (path === "worker") {
      const handle = ensureWorker();
      if (handle !== null) {
        try {
          handle.postMessage(entry.request);
          stats.workerDispatches++;
          return;
        } catch {
          // A payload the host refused to clone must not break the feature: take
          // the synchronous path for this request instead.
        }
      } else if (entry.dispatch === "worker") {
        // Forced worker dispatch whose construction failed AFTER the up-front
        // availability check passed. A runtime outcome, not a caller bug.
        inFlight = null;
        stats.failed++;
        close(entry, {
          status: "failed",
          snapshotId: entry.request.snapshotId,
          version: entry.request.version,
          error: "layout client: worker construction failed",
        });
        pump();
        return;
      }
    }
    stats.syncDispatches++;
    // Deferred, not inline — see the module header: an inline computation would
    // settle before a same-tick supersession could reach it, which is the one
    // way a caller could tell the two paths apart.
    setTimeout(() => {
      if (entry.settled) {
        if (inFlight === entry) inFlight = null;
        pump();
        return;
      }
      let response: LayoutSnapshotResponse;
      try {
        response = {
          snapshotId: entry.request.snapshotId,
          version: entry.request.version,
          positions: computeSnapshotPositions(entry.request),
        };
      } catch (error) {
        response = {
          snapshotId: entry.request.snapshotId,
          version: entry.request.version,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      deliver(response);
    }, 0);
  }

  /** Give the single dispatch slot to the oldest request still worth running. */
  function pump(): void {
    if (inFlight !== null) return;
    while (queue.length > 0) {
      const entry = queue.shift() as PendingRequest;
      if (entry.settled) continue;
      if (isStale(entry)) {
        closeSuperseded(entry);
        continue;
      }
      dispatch(entry);
      return;
    }
  }

  function request(
    clientRequest: LayoutClientRequest,
    dispatchMode?: LayoutDispatchMode,
  ): Promise<LayoutRequestOutcome> {
    const snapshotId = clientRequest.snapshotId;
    const version = clientRequest.version ?? (latestVersion.get(snapshotId) ?? 0) + 1;
    const full: LayoutSnapshotRequest = {
      snapshotId,
      version,
      nodes: clientRequest.nodes,
      edges: clientRequest.edges,
      ...(clientRequest.options !== undefined ? { options: clientRequest.options } : {}),
    };
    const problem = layoutRequestProblem(full);
    if (problem !== undefined) throw new Error(`layout client: ${problem}`);
    const mode = dispatchMode ?? defaultDispatch;
    if (mode === "worker" && (workerBroken || !canCreateWorker)) {
      throw new Error(
        'layout client: dispatch "worker" requested but no worker can be created in this host',
      );
    }

    stats.requests++;
    const latest = latestVersion.get(snapshotId);
    if (latest !== undefined && version <= latest) {
      // Already behind: answering it would mean painting a graph state the
      // caller has moved past, so it closes without ever being computed.
      stats.superseded++;
      stats.supersededBeforeDispatch++;
      return Promise.resolve<LayoutRequestOutcome>({
        status: "cancelled",
        snapshotId,
        version,
        reason: "superseded",
      });
    }
    latestVersion.set(snapshotId, version);

    // Everything older for this snapshot is now stale by definition.
    for (const entry of [...open.values()]) {
      if (entry.request.snapshotId === snapshotId && entry.request.version < version) {
        closeSuperseded(entry);
      }
    }

    return new Promise<LayoutRequestOutcome>((resolve) => {
      const entry: PendingRequest = {
        request: full,
        settle: resolve,
        settled: false,
        dispatch: mode,
        dispatched: false,
      };
      open.set(requestKey(snapshotId, version), entry);
      queue.push(entry);
      pump();
    });
  }

  function cancel(snapshotId: string, version?: number): number {
    let closed = 0;
    for (const entry of [...open.values()]) {
      if (entry.request.snapshotId !== snapshotId) continue;
      if (version !== undefined && entry.request.version !== version) continue;
      const key = requestKey(snapshotId, entry.request.version);
      if (entry.dispatched) cancelledAfterDispatch.add(key);
      stats.cancelled++;
      closed++;
      close(entry, {
        status: "cancelled",
        snapshotId,
        version: entry.request.version,
        reason: "cancelled",
      });
    }
    return closed;
  }

  function terminate(): void {
    // The upstream defect this fixes: `pending.clear()` without settling leaves
    // every in-flight promise unresolved forever.
    const victims = [...open.values()];
    queue.length = 0;
    inFlight = null;
    for (const entry of victims) {
      stats.terminated++;
      close(entry, {
        status: "cancelled",
        snapshotId: entry.request.snapshotId,
        version: entry.request.version,
        reason: "terminated",
      });
    }
    open.clear();
    cancelledAfterDispatch.clear();
    if (worker !== null) {
      worker.onmessage = null;
      worker.onerror = null;
      try {
        worker.terminate();
      } catch {
        // Already gone.
      }
      worker = null;
    }
    // An explicit teardown is not a failure: a later request may build a fresh
    // worker. Only `handleWorkerFailure` marks the client broken.
  }

  return {
    request,
    cancel,
    terminate,
    workerSupported: () => !workerBroken && canCreateWorker,
    stats: () => ({ ...stats }),
  };
}

let shared: LayoutClient | null = null;

function sharedClient(): LayoutClient {
  if (shared === null) shared = createLayoutClient();
  return shared;
}

/** Submit a request on the process-wide default client. */
export function requestLayout(
  request: LayoutClientRequest,
  dispatch?: LayoutDispatchMode,
): Promise<LayoutRequestOutcome> {
  return sharedClient().request(request, dispatch);
}

/** Cancel open requests on the process-wide default client. */
export function cancelLayout(snapshotId: string, version?: number): number {
  return sharedClient().cancel(snapshotId, version);
}

/**
 * Tear down the process-wide default client's worker, closing every in-flight
 * request as `cancelled` / `"terminated"`. Safe to call when none exists.
 */
export function terminateLayoutWorker(): void {
  if (shared !== null) shared.terminate();
}

/** Out-of-band counters of the process-wide default client. */
export function layoutClientStats(): LayoutClientStats {
  return sharedClient().stats();
}
