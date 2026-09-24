/**
 * The same protocol against a GENUINELY separate thread.
 *
 * `layout-client.test.ts` controls when the worker answers, which is what makes
 * staleness deterministic; this file gives that control up on purpose. The
 * worker here is a real `node:worker_threads` thread running the real bundled
 * `src/worker.ts` through the Web-Worker-scope shim, so the message boundary —
 * structured clone in, transferable `Float32Array` out, a thread hop each way —
 * is exercised rather than simulated. That is the only setting in which "the two
 * paths agree to the byte" means anything: inside one process, both paths run
 * the same instructions on the same heap and could not disagree.
 *
 * ENVIRONMENT: Node's `worker_threads`, deliberately. Node has no browser
 * `Worker` global (measured: `typeof Worker === "undefined"` on 22.22.1) and
 * jsdom's cannot load an ES-module worker, so this is the only host in the test
 * matrix with a real second thread. The browser construction form
 * `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })` is
 * covered from the installed tarball by `scripts/smoke-pack.mjs`; no test here
 * claims to cover a browser.
 */
import { describe, expect, it } from "vitest";

import { createLayoutClient } from "../../src/layout-client.js";
import { createNodeWorkerHandle } from "./node-worker-adapter.mjs";
import { workerBundleUrl } from "./worker-bundle.mjs";

function graph(n: number): { nodes: { id: string }[]; edges: { source: string; target: string }[] } {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: `n${i}` }));
  const edges: { source: string; target: string }[] = [];
  for (let i = 0; i < n; i++) {
    edges.push({ source: `n${i}`, target: `n${(i + 1) % n}` });
    edges.push({ source: `n${i}`, target: `n${(i + 7) % n}` });
  }
  return { nodes, edges };
}

function bytes(positions: Float32Array): Buffer {
  return Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
}

describe("invariant 4 — the two paths agree to the byte, across a real thread", () => {
  // Two sizes, one on each side of `WORKER_NODE_THRESHOLD` (250): the smaller
  // one is a size `"auto"` would never send to a worker, so forcing it proves
  // the equality holds where the client does not rely on it either.
  for (const n of [120, 900]) {
    it(`${n} nodes: identical Float32Array bytes through the worker and synchronously`, async () => {
      const bundle = await workerBundleUrl();
      const input = graph(n);
      const viaWorker = createLayoutClient({
        createWorker: () => createNodeWorkerHandle(bundle),
        dispatch: "worker",
      });
      const workerOutcome = await viaWorker.request({ snapshotId: `eq-${n}`, ...input });
      viaWorker.terminate();

      const viaSync = createLayoutClient({ dispatch: "sync" });
      const syncOutcome = await viaSync.request({ snapshotId: `eq-${n}`, ...input });

      expect(workerOutcome.status).toBe("fulfilled");
      expect(syncOutcome.status).toBe("fulfilled");
      if (workerOutcome.status !== "fulfilled" || syncOutcome.status !== "fulfilled") return;

      expect(workerOutcome.positions.length).toBe(2 * n);
      expect(bytes(workerOutcome.positions).equals(bytes(syncOutcome.positions))).toBe(true);
      expect(viaWorker.stats().workerDispatches).toBe(1);
      expect(viaSync.stats().syncDispatches).toBe(1);
    });
  }

  it("the transferable positions buffer arrives intact and is not a detached view", async () => {
    // The worker hands its buffer over rather than copying it. The received
    // buffer must therefore be a live one of the right length — a detached
    // buffer would read back as byteLength 0.
    const bundle = await workerBundleUrl();
    const client = createLayoutClient({
      createWorker: () => createNodeWorkerHandle(bundle),
      dispatch: "worker",
    });
    const first = await client.request({ snapshotId: "transfer", ...graph(40) });
    const second = await client.request({ snapshotId: "transfer", ...graph(40) });
    client.terminate();
    expect(first.status).toBe("fulfilled");
    expect(second.status).toBe("fulfilled");
    if (first.status !== "fulfilled" || second.status !== "fulfilled") return;
    expect(first.positions.buffer.byteLength).toBe(40 * 2 * 4);
    expect(second.positions.buffer.byteLength).toBe(40 * 2 * 4);
    // A second request after a transfer must not reuse the first answer's
    // detached buffer — the two answers are distinct buffers with equal content.
    expect(first.positions.buffer).not.toBe(second.positions.buffer);
    expect(bytes(first.positions).equals(bytes(second.positions))).toBe(true);
  });
});

describe("invariant 1 across a real thread", () => {
  it("serves only the newest of three requests and discards the stale answer", async () => {
    const bundle = await workerBundleUrl();
    const input = graph(600);
    const client = createLayoutClient({
      createWorker: () => createNodeWorkerHandle(bundle),
      dispatch: "worker",
    });
    // Warm the thread so the three requests are genuinely close together rather
    // than spread by the one-off spawn.
    await client.request({ snapshotId: "warm", nodes: [{ id: "a" }], edges: [], options: { iterations: 1 } });

    const outcomes = await Promise.all([
      client.request({ snapshotId: "burst", ...input }),
      client.request({ snapshotId: "burst", ...input }),
      client.request({ snapshotId: "burst", ...input }),
    ]);
    const stats = client.stats();
    client.terminate();

    expect(outcomes.map((o) => `${o.version}:${o.status}`)).toEqual([
      "1:cancelled",
      "2:cancelled",
      "3:fulfilled",
    ]);
    expect(stats.superseded).toBe(2);
    expect(stats.staleResultsDiscarded).toBe(1);
    expect(stats.lastDiscarded).toMatchObject({ snapshotId: "burst", version: 1, reason: "stale" });
    // The warm-up plus one wasted run plus the useful one: three computations
    // for four requests, not four.
    expect(stats.workerDispatches).toBe(3);
  });

  it("terminating a real thread settles the in-flight request as terminated", async () => {
    const bundle = await workerBundleUrl();
    const client = createLayoutClient({
      createWorker: () => createNodeWorkerHandle(bundle),
      dispatch: "worker",
    });
    const pending = client.request({ snapshotId: "kill", ...graph(3000) });
    // The request is posted synchronously, so the thread is already grinding.
    client.terminate();
    const outcome = await pending;
    expect(outcome).toMatchObject({ status: "cancelled", reason: "terminated" });
  });
});
