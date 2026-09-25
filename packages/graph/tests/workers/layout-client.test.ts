/**
 * GD-M2-WORKERS protocol invariants, driven through an in-process worker double.
 *
 * The double is NOT an imitation of the protocol: it calls the real
 * `handleLayoutRequest` from `src/worker.ts`, so what these tests exercise is the
 * shipped worker code with the delivery moment under test control. That control
 * is what makes staleness testable at all — a real thread would answer whenever
 * it answered, and "the client dropped the late one" would depend on timing.
 * `worker-thread.test.ts` covers the same properties against a genuinely
 * separate thread, where the timing is real and the equality of the two paths is
 * the thing being proved.
 *
 * ENVIRONMENT COVERAGE, said plainly. These tests run in Node 22, which has NO
 * `Worker` global (measured: `typeof Worker === "undefined"`), so the browser
 * construction form `new Worker(new URL("./worker.js", import.meta.url))` is
 * never executed here; it is covered from the installed tarball by the
 * `pack:smoke` verifier, which resolves the URL and stats the file. jsdom is
 * DECLARED OUT OF MEASURE: its `Worker` cannot load an ES-module worker, so a
 * jsdom run would exercise the fallback and nothing more than this file already
 * does. What is covered here is the client's decision logic and the worker's
 * message contract; what is not is a real browser's `Worker`.
 */
import { describe, expect, it } from "vitest";

import { handleLayoutRequest } from "../../src/worker.js";
import {
  createLayoutClient,
  layoutWorkerSupported,
  WORKER_NODE_THRESHOLD,
  type LayoutRequestOutcome,
  type LayoutSnapshotRequest,
  type LayoutSnapshotResponse,
  type LayoutWorkerHandle,
} from "../../src/layout-client.js";

interface ControlledWorker extends LayoutWorkerHandle {
  /** Requests received and not yet answered (at most one, by design). */
  readonly inbox: readonly LayoutSnapshotRequest[];
  /** Total requests ever received. */
  readonly received: number;
  /** Answer the oldest unanswered request with the real worker code. */
  respondOldest(): void;
  /** Raise the worker-level failure a broken module or a crash would raise. */
  breakWorker(): void;
  readonly terminateCalls: number;
}

function createControlledWorker(): ControlledWorker {
  const inbox: LayoutSnapshotRequest[] = [];
  let received = 0;
  let terminateCalls = 0;
  const worker: ControlledWorker = {
    onmessage: null,
    onerror: null,
    get inbox() {
      return inbox;
    },
    get received() {
      return received;
    },
    get terminateCalls() {
      return terminateCalls;
    },
    postMessage(message) {
      received++;
      inbox.push(message as LayoutSnapshotRequest);
    },
    terminate() {
      terminateCalls++;
    },
    respondOldest() {
      const request = inbox.shift();
      if (request === undefined) throw new Error("respondOldest: nothing received");
      const response = handleLayoutRequest(request) as LayoutSnapshotResponse;
      worker.onmessage?.({ data: response });
    },
    breakWorker() {
      worker.onerror?.(new Error("worker module failed to load"));
    },
  };
  return worker;
}

/** `n` nodes, two edges each — the shape #77 measured. */
function graph(n: number): { nodes: { id: string }[]; edges: { source: string; target: string }[] } {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: `n${i}` }));
  const edges: { source: string; target: string }[] = [];
  for (let i = 0; i < n; i++) {
    edges.push({ source: `n${i}`, target: `n${(i + 1) % n}` });
    edges.push({ source: `n${i}`, target: `n${(i + 7) % n}` });
  }
  return { nodes, edges };
}

/** Let queued macrotasks (the deferred synchronous path) run. */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Settle a promise or say so. Used where the POINT is that the promise settles
 * at all: the upstream `terminateForceWorker()` clears its pending map without
 * settling, so its in-flight awaits never return, and a test that merely awaited
 * would hang instead of reporting.
 */
async function settledWithin<T>(promise: Promise<T>, ms: number): Promise<T | "never settled"> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<"never settled">((resolve) => {
    timer = setTimeout(() => resolve("never settled"), ms);
  });
  try {
    return await Promise.race([promise, guard]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

describe("invariant 1 — a stale result never reaches the caller", () => {
  it("serves only the newest of three closely-spaced versions, discarding the others with the reason", async () => {
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const input = graph(12);

    const first = client.request({ snapshotId: "graph-a", ...input });
    expect(worker.inbox.length).toBe(1);
    const second = client.request({ snapshotId: "graph-a", ...input });
    const third = client.request({ snapshotId: "graph-a", ...input });

    // Version 1 is already in flight and cannot be recalled; 2 was superseded
    // before it ever reached the worker, so it costs nothing.
    expect(worker.received).toBe(1);

    worker.respondOldest(); // version 1's answer, now stale
    expect(worker.inbox.length).toBe(1); // version 3 took the freed slot
    worker.respondOldest(); // version 3's answer

    const outcomes = await Promise.all([first, second, third]);
    expect(outcomes.map((o) => `${o.version}:${o.status}`)).toEqual([
      "1:cancelled",
      "2:cancelled",
      "3:fulfilled",
    ]);
    expect(outcomes[0]).toMatchObject({ status: "cancelled", reason: "superseded" });
    expect(outcomes[1]).toMatchObject({ status: "cancelled", reason: "superseded" });
    expect(outcomes[2]).toHaveProperty("positions");

    const stats = client.stats();
    expect(stats.superseded).toBe(2);
    expect(stats.supersededBeforeDispatch).toBe(1);
    expect(stats.staleResultsDiscarded).toBe(1);
    expect(stats.lastDiscarded).toEqual({
      snapshotId: "graph-a",
      version: 1,
      latestVersion: 3,
      reason: "stale",
    });
    // Two computations for three requests, not three: only the one already in
    // flight was wasted.
    expect(worker.received).toBe(2);
  });

  it("discards every dispatched older result when each request was posted before the next arrived", async () => {
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const input = graph(8);

    const first = client.request({ snapshotId: "graph-b", ...input });
    const second = client.request({ snapshotId: "graph-b", ...input });
    worker.respondOldest(); // v1 answers: stale, dispatches v2
    const third = client.request({ snapshotId: "graph-b", ...input });
    worker.respondOldest(); // v2 answers: stale, dispatches v3
    worker.respondOldest(); // v3 answers: served

    const outcomes = await Promise.all([first, second, third]);
    expect(outcomes.map((o) => o.status)).toEqual(["cancelled", "cancelled", "fulfilled"]);
    expect(client.stats().staleResultsDiscarded).toBe(2);
  });

  it("closes a request for a version already behind without computing it", async () => {
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const input = graph(4);

    const current = client.request({ snapshotId: "graph-c", version: 9, ...input });
    const behind = await client.request({ snapshotId: "graph-c", version: 4, ...input });
    expect(behind).toMatchObject({ status: "cancelled", version: 4, reason: "superseded" });
    expect(worker.received).toBe(1); // only version 9 was ever posted

    worker.respondOldest();
    expect((await current).status).toBe("fulfilled");
  });

  it("allocates the next version per snapshot, independently between snapshots", async () => {
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const input = graph(4);
    const a1 = client.request({ snapshotId: "a", ...input });
    const b1 = client.request({ snapshotId: "b", ...input });
    worker.respondOldest();
    worker.respondOldest();
    const a2 = client.request({ snapshotId: "a", ...input });
    worker.respondOldest();
    expect((await a1).version).toBe(1);
    expect((await b1).version).toBe(1);
    expect((await a2).version).toBe(2);
    // b's request was NOT superseded by a's second version.
    expect((await b1).status).toBe("fulfilled");
  });
});

describe("invariant 2 — cancellation closes as cancelled, never as an error", () => {
  it("closes an in-flight request explicitly, then discards its late result", async () => {
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const pending = client.request({ snapshotId: "graph-d", ...graph(6) });
    expect(worker.inbox.length).toBe(1);

    expect(client.cancel("graph-d")).toBe(1);
    const outcome = await settledWithin(pending, 500);
    expect(outcome).toMatchObject({ status: "cancelled", version: 1, reason: "cancelled" });
    expect(outcome).not.toHaveProperty("error");

    worker.respondOldest();
    await tick();
    const stats = client.stats();
    expect(stats.cancelled).toBe(1);
    expect(stats.discardedAfterCancel).toBe(1);
    expect(stats.unmatchedResults).toBe(0);
    expect(stats.fulfilled).toBe(0);
  });

  it("cancels one version of a snapshot without touching another snapshot", async () => {
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const kept = client.request({ snapshotId: "keep", ...graph(4) });
    const dropped = client.request({ snapshotId: "drop", ...graph(4) });
    expect(client.cancel("drop", 1)).toBe(1);
    expect((await dropped).status).toBe("cancelled");
    worker.respondOldest();
    expect((await kept).status).toBe("fulfilled");
  });

  it("terminate() SETTLES every in-flight request instead of abandoning it", async () => {
    // The upstream defect this exists to not reproduce: `terminateForceWorker()`
    // runs `pending.clear()` without settling, so these awaits would never
    // return. `settledWithin` reports that instead of hanging the suite.
    const worker = createControlledWorker();
    const client = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const a = client.request({ snapshotId: "t1", ...graph(5) });
    const b = client.request({ snapshotId: "t2", ...graph(5) });

    client.terminate();
    expect(worker.terminateCalls).toBe(1);

    expect(await settledWithin(a, 500)).toMatchObject({
      status: "cancelled",
      reason: "terminated",
    });
    expect(await settledWithin(b, 500)).toMatchObject({
      status: "cancelled",
      reason: "terminated",
    });
    expect(client.stats().terminated).toBe(2);
    // An explicit teardown is not a failure: the client can build a worker again.
    expect(client.workerSupported()).toBe(true);
  });
});

describe("invariant 3 — one worker, reused; a worker failure falls back", () => {
  it("builds exactly one worker for many requests and keeps one in flight at a time", async () => {
    let built = 0;
    const worker = createControlledWorker();
    const client = createLayoutClient({
      createWorker: () => {
        built++;
        return worker;
      },
      dispatch: "worker",
    });
    const input = graph(6);
    const outcomes: Promise<LayoutRequestOutcome>[] = [];
    for (let i = 0; i < 4; i++) outcomes.push(client.request({ snapshotId: `s${i}`, ...input }));
    expect(built).toBe(1);
    expect(worker.inbox.length).toBe(1);
    for (let i = 0; i < 4; i++) {
      expect(worker.inbox.length).toBe(1);
      worker.respondOldest();
    }
    expect((await Promise.all(outcomes)).map((o) => o.status)).toEqual([
      "fulfilled",
      "fulfilled",
      "fulfilled",
      "fulfilled",
    ]);
    expect(built).toBe(1);
    expect(client.stats().workerDispatches).toBe(4);
  });

  it("terminates the worker on a worker error, re-serves the victim, and falls back after", async () => {
    const worker = createControlledWorker();
    let built = 0;
    const client = createLayoutClient({
      createWorker: () => {
        built++;
        return worker;
      },
    });
    const input = graph(6);
    const victim = client.request({ snapshotId: "boom", ...input }, "worker");
    expect(worker.inbox.length).toBe(1);

    worker.breakWorker();
    expect(worker.terminateCalls).toBe(1);
    expect(client.workerSupported()).toBe(false);

    // The caller asked for positions and still gets them — computed on the
    // calling thread rather than failed in series.
    const served = await settledWithin(victim, 2000);
    expect(served).toMatchObject({ status: "fulfilled" });

    const next = await client.request({ snapshotId: "after", ...input });
    expect(next.status).toBe("fulfilled");
    const stats = client.stats();
    expect(stats.workerFailures).toBe(1);
    expect(stats.workerDispatches).toBe(1); // the one that died; nothing after
    expect(stats.syncDispatches).toBe(2); // the re-served victim, then "after"
    expect(built).toBe(1); // never rebuilt after the failure
  });

  it("a worker error leaves a request the calling thread was already computing alone", async () => {
    // A live worker can error asynchronously while the in-flight request is a
    // small one the threshold sent to the fallback. VERIFIED, so the claim stays
    // the right size: without the `dispatchedPath` check the request would be
    // scheduled a SECOND slot, and the duplicate would abort on the `settled`
    // check rather than compute twice — the assertions below hold either way.
    // This is a regression net over the counters and the single delivery, not a
    // proof that the check fixes a wrong answer.
    const worker = createControlledWorker();
    const client = createLayoutClient({
      createWorker: () => worker,
      workerNodeThreshold: 5,
    });
    const viaWorker = client.request({ snapshotId: "big", ...graph(10) });
    worker.respondOldest();
    expect((await viaWorker).status).toBe("fulfilled");

    const viaSync = client.request({ snapshotId: "small", ...graph(2) });
    worker.breakWorker(); // the worker dies while the fallback holds the slot
    expect(await settledWithin(viaSync, 1000)).toMatchObject({ status: "fulfilled" });
    await tick();

    const stats = client.stats();
    expect(stats.syncDispatches).toBe(1); // computed once, not twice
    expect(stats.fulfilled).toBe(2);
    expect(stats.unmatchedResults).toBe(0);
  });

  it("falls back when worker construction throws, and never retries it", async () => {
    let attempts = 0;
    const client = createLayoutClient({
      createWorker: () => {
        attempts++;
        throw new Error("no chunk emitted for the worker");
      },
    });
    const input = graph(6);
    expect((await client.request({ snapshotId: "c1", ...input }, "worker")).status).toBe("failed");
    expect((await client.request({ snapshotId: "c2", ...input })).status).toBe("fulfilled");
    expect(attempts).toBe(1);
    expect(client.stats().syncDispatches).toBe(1);
  });

  it("falls back when the host refuses to clone the payload", async () => {
    const worker = createControlledWorker();
    const refusing: LayoutWorkerHandle = {
      ...worker,
      postMessage() {
        throw new Error("could not be cloned");
      },
    };
    const client = createLayoutClient({ createWorker: () => refusing, dispatch: "worker" });
    const outcome = await client.request({ snapshotId: "clone", ...graph(6) });
    expect(outcome.status).toBe("fulfilled");
    expect(client.stats().workerDispatches).toBe(0);
    expect(client.stats().syncDispatches).toBe(1);
  });
});

describe("invariant 6 — the fallback is indistinguishable from the worker path", () => {
  it("computes with no Worker in the host, and returns the same outcome shape", async () => {
    // Node 22 has no Worker global — measured, and the reason the fallback is
    // the default path here rather than a branch nothing takes.
    expect(layoutWorkerSupported()).toBe(false);

    const input = graph(6);
    const fallback = createLayoutClient();
    const viaFallback = await fallback.request({ snapshotId: "same", ...input });

    const worker = createControlledWorker();
    const viaWorker = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const pending = viaWorker.request({ snapshotId: "same", ...input });
    worker.respondOldest();
    const workerOutcome = await pending;

    expect(Object.keys(viaFallback).sort()).toEqual(Object.keys(workerOutcome).sort());
    expect(Object.keys(viaFallback).sort()).toEqual(["positions", "snapshotId", "status", "version"]);
    expect(viaFallback.status).toBe(workerOutcome.status);
    expect(fallback.stats().syncDispatches).toBe(1);
    expect(fallback.stats().workerDispatches).toBe(0);
  });

  it("supersedes a same-tick burst on the fallback path exactly as on the worker path", async () => {
    // This is what the deferred synchronous computation buys: inline, each of
    // these would have resolved with positions before the next was created.
    const client = createLayoutClient({ dispatch: "sync" });
    const input = graph(6);
    const outcomes = await Promise.all([
      client.request({ snapshotId: "burst", ...input }),
      client.request({ snapshotId: "burst", ...input }),
      client.request({ snapshotId: "burst", ...input }),
    ]);
    expect(outcomes.map((o) => o.status)).toEqual(["cancelled", "cancelled", "fulfilled"]);
    expect(client.stats().syncDispatches).toBe(1);
  });

  it("applies the measured threshold: below it \"auto\" never builds a worker", async () => {
    let built = 0;
    const worker = createControlledWorker();
    const client = createLayoutClient({
      createWorker: () => {
        built++;
        return worker;
      },
    });
    const small = await client.request({ snapshotId: "small", ...graph(WORKER_NODE_THRESHOLD - 1) });
    expect(small.status).toBe("fulfilled");
    expect(built).toBe(0);

    const big = client.request({ snapshotId: "big", ...graph(WORKER_NODE_THRESHOLD) });
    expect(built).toBe(1);
    worker.respondOldest();
    expect((await big).status).toBe("fulfilled");
  });
});

describe("failures and contract violations are told apart", () => {
  it("closes as failed, with the message and without rejecting, on both paths", async () => {
    // A hole in the node list makes `computeLayout` dereference null while it
    // derives its seed — a real throw inside the computation, on whichever side
    // it runs, rather than a stubbed error.
    const broken = {
      snapshotId: "bad",
      nodes: [null] as unknown as { id: string }[],
      edges: [],
      options: { iterations: 2 },
    };

    const worker = createControlledWorker();
    const viaWorker = createLayoutClient({ createWorker: () => worker, dispatch: "worker" });
    const pending = viaWorker.request(broken);
    worker.respondOldest();
    const workerOutcome = await pending;
    expect(workerOutcome.status).toBe("failed");
    if (workerOutcome.status === "failed") expect(workerOutcome.error).toMatch(/null/);

    const viaSync = createLayoutClient({ dispatch: "sync" });
    const syncOutcome = await viaSync.request(broken);
    expect(syncOutcome.status).toBe("failed");
    if (syncOutcome.status === "failed" && workerOutcome.status === "failed") {
      // Same failure, same message: the failure arm is as path-agnostic as the
      // success arm.
      expect(syncOutcome.error).toBe(workerOutcome.error);
    }
    expect(viaWorker.stats().failed).toBe(1);
    expect(viaSync.stats().failed).toBe(1);
  });

  it("throws synchronously on a malformed request", () => {
    const client = createLayoutClient({ dispatch: "sync" });
    expect(() => client.request({ snapshotId: "", nodes: [], edges: [] })).toThrow(/snapshotId/);
    expect(() =>
      client.request({ snapshotId: "s", version: 1.5, nodes: [], edges: [] }),
    ).toThrow(/version/);
  });

  it("throws synchronously when worker dispatch is forced in a host with none", () => {
    const client = createLayoutClient();
    expect(() => client.request({ snapshotId: "s", ...graph(4) }, "worker")).toThrow(
      /no worker can be created/,
    );
  });

  it("returns an empty positions buffer for an empty graph", async () => {
    const client = createLayoutClient({ dispatch: "sync" });
    const outcome = await client.request({ snapshotId: "empty", nodes: [], edges: [] });
    expect(outcome.status).toBe("fulfilled");
    if (outcome.status === "fulfilled") expect(outcome.positions.length).toBe(0);
  });

  it("answers a malformed message with an error rather than dropping it, when it can be correlated", () => {
    expect(handleLayoutRequest({ snapshotId: "s", version: 1, nodes: "no", edges: [] })).toMatchObject({
      snapshotId: "s",
      version: 1,
      error: "nodes must be an array",
    });
    // Nothing to correlate ⇒ nothing to answer; inventing a key would let the
    // client settle a promise that was never made.
    expect(handleLayoutRequest({ nodes: [], edges: [] })).toBeUndefined();
    expect(handleLayoutRequest(null)).toBeUndefined();
  });
});
