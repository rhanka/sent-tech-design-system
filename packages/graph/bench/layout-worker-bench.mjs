/**
 * GD-M2-WORKERS measurement harness: `npm run bench:worker` (builds first).
 *
 * Measures the four things the spec's §3.3 asks for, against the REAL published
 * artifacts in `dist/` rather than a test-time rebuild:
 *   1. caller-perceived wall time, worker path and synchronous path, at 1 000,
 *      5 000 and 20 000 nodes (two edges per node, as in #77);
 *   2. the crossover sweep that fixes `WORKER_NODE_THRESHOLD`;
 *   3. results discarded as stale across three closely-spaced requests, in both
 *      of the two regimes that exist (supersession before dispatch, and after);
 *   4. the message-boundary cost, measured rather than estimated.
 *
 * The worker is a genuine `node:worker_threads` thread running `dist/worker.js`
 * through the Web-Worker-scope shim in `tests/workers/node-worker-scope.mjs`.
 * Node 22 has no `Worker` global (measured), so the client's injectable
 * `createWorker` is what makes the real thread reachable; the browser
 * construction form is covered separately by the tarball check in `pack:smoke`.
 *
 * WARM basis for the crossover: a client builds its worker once and reuses it,
 * so the steady-state comparison is the one that should pick the threshold. The
 * one-off spawn cost is reported on its own line instead of being smeared over
 * every size.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const clientPath = join(packageDir, "dist", "layout-client.js");
const workerPath = join(packageDir, "dist", "worker.js");
for (const path of [clientPath, workerPath]) {
  if (!existsSync(path)) {
    throw new Error(`${path} missing — run \`npm run build\` in packages/graph first`);
  }
}

const { createLayoutClient, WORKER_NODE_THRESHOLD } = await import(pathToFileURL(clientPath).href);
const { createNodeWorkerHandle } = await import(
  pathToFileURL(join(packageDir, "tests", "workers", "node-worker-adapter.mjs")).href
);

const workerUrl = pathToFileURL(workerPath);

/** A graph of `n` nodes with two edges per node, as measured in #77. */
function graph(n) {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: `n${i}` }));
  const edges = [];
  for (let i = 0; i < n; i++) {
    edges.push({ source: `n${i}`, target: `n${(i + 1) % n}` });
    edges.push({ source: `n${i}`, target: `n${(i + 7) % n}` });
  }
  return { nodes, edges };
}

function workerClient(options = {}) {
  return createLayoutClient({
    createWorker: () => createNodeWorkerHandle(workerUrl),
    dispatch: "worker",
    ...options,
  });
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function timed(fn) {
  const start = performance.now();
  const value = await fn();
  return { ms: performance.now() - start, value };
}

function fail(message) {
  throw new Error(`bench invariant broken: ${message}`);
}

console.log(`node ${process.version} on ${process.platform}/${process.arch}`);
console.log(`WORKER_NODE_THRESHOLD currently compiled in: ${WORKER_NODE_THRESHOLD}`);

// ---------------------------------------------------------------------------
// 1. Worker spawn cost, on its own line.
// ---------------------------------------------------------------------------
{
  const tiny = graph(2);
  const client = workerClient();
  const cold = await timed(() => client.request({ snapshotId: "spawn", ...tiny, options: { iterations: 1 } }));
  const warm = await timed(() => client.request({ snapshotId: "spawn", ...tiny, options: { iterations: 1 } }));
  if (cold.value.status !== "fulfilled" || warm.value.status !== "fulfilled") fail("spawn probe");
  console.log("");
  console.log("=== worker one-off spawn cost (2 nodes, 1 iteration) ===");
  console.log(`  first request (spawn + module import + round trip): ${cold.ms.toFixed(1)} ms`);
  console.log(`  second request (round trip only):                  ${warm.ms.toFixed(1)} ms`);
  console.log(`  spawn attributable:                                ${(cold.ms - warm.ms).toFixed(1)} ms`);
  client.terminate();
}

// ---------------------------------------------------------------------------
// 2. Caller-perceived wall time, both paths, at the three sizes of §3.3.
// ---------------------------------------------------------------------------
console.log("");
console.log("=== caller-perceived wall time, warm worker vs synchronous ===");
console.log("  nodes     worker(ms)     sync(ms)   worker/sync");
for (const n of [1000, 5000, 20000]) {
  const { nodes, edges } = graph(n);
  const wc = workerClient();
  // Warm the thread so the spawn is not counted at every size.
  await wc.request({ snapshotId: "warm", nodes: [{ id: "a" }], edges: [], options: { iterations: 1 } });
  const runs = n >= 20000 ? 1 : 3;
  const workerMs = [];
  for (let i = 0; i < runs; i++) {
    const r = await timed(() => wc.request({ snapshotId: `w${n}`, nodes, edges }));
    if (r.value.status !== "fulfilled") fail(`worker ${n}: ${r.value.status}`);
    workerMs.push(r.ms);
  }
  wc.terminate();

  const sc = createLayoutClient({ dispatch: "sync" });
  const syncMs = [];
  for (let i = 0; i < runs; i++) {
    const r = await timed(() => sc.request({ snapshotId: `s${n}`, nodes, edges }));
    if (r.value.status !== "fulfilled") fail(`sync ${n}: ${r.value.status}`);
    syncMs.push(r.ms);
  }
  const w = median(workerMs);
  const s = median(syncMs);
  console.log(
    `  ${String(n).padStart(5)}  ${w.toFixed(1).padStart(11)}  ${s.toFixed(1).padStart(11)}  ${(w / s).toFixed(3).padStart(12)}`,
  );
}

// ---------------------------------------------------------------------------
// 3. Crossover sweep: where does the worker stop being the slower option?
// ---------------------------------------------------------------------------
console.log("");
console.log("=== crossover sweep (median of 5, warm worker) ===");
console.log("  nodes     worker(ms)     sync(ms)   worker/sync");
for (const n of [50, 100, 200, 300, 400, 500, 600, 700, 800, 1000, 1500]) {
  const { nodes, edges } = graph(n);
  const wc = workerClient();
  await wc.request({ snapshotId: "warm", nodes: [{ id: "a" }], edges: [], options: { iterations: 1 } });
  const workerMs = [];
  for (let i = 0; i < 5; i++) {
    const r = await timed(() => wc.request({ snapshotId: `w${n}`, nodes, edges }));
    if (r.value.status !== "fulfilled") fail(`sweep worker ${n}`);
    workerMs.push(r.ms);
  }
  wc.terminate();
  const sc = createLayoutClient({ dispatch: "sync" });
  const syncMs = [];
  for (let i = 0; i < 5; i++) {
    const r = await timed(() => sc.request({ snapshotId: `s${n}`, nodes, edges }));
    if (r.value.status !== "fulfilled") fail(`sweep sync ${n}`);
    syncMs.push(r.ms);
  }
  const w = median(workerMs);
  const s = median(syncMs);
  console.log(
    `  ${String(n).padStart(5)}  ${w.toFixed(1).padStart(11)}  ${s.toFixed(1).padStart(11)}  ${(w / s).toFixed(3).padStart(12)}`,
  );
}

// ---------------------------------------------------------------------------
// 4. Three closely-spaced requests, in both regimes.
// ---------------------------------------------------------------------------
console.log("");
console.log("=== three closely-spaced requests for one snapshot (5 000 nodes) ===");
{
  const { nodes, edges } = graph(5000);

  // Regime A: all three issued in the same tick. Two are superseded BEFORE they
  // are ever dispatched, so only one computation runs and one result (the first,
  // already in flight) is discarded as stale.
  const a = workerClient();
  await a.request({ snapshotId: "warm", nodes: [{ id: "a" }], edges: [], options: { iterations: 1 } });
  const sameTick = await Promise.all([
    a.request({ snapshotId: "burst", nodes, edges }),
    a.request({ snapshotId: "burst", nodes, edges }),
    a.request({ snapshotId: "burst", nodes, edges }),
  ]);
  const statsA = a.stats();
  a.terminate();
  console.log("  regime A — same tick:");
  console.log(`    outcomes:                 ${sameTick.map((o) => `${o.version}:${o.status}`).join(", ")}`);
  console.log(`    requests superseded:      ${statsA.superseded} (before dispatch: ${statsA.supersededBeforeDispatch})`);
  console.log(`    results discarded stale:  ${statsA.staleResultsDiscarded}`);
  console.log(`    computations dispatched:  ${statsA.workerDispatches + statsA.syncDispatches - 1} (excluding the warm-up)`);
  console.log(`    last discard:             ${JSON.stringify(statsA.lastDiscarded)}`);

  // Regime B: each request is issued only once the previous one has been posted
  // to the worker, which is what a drag or a slider produces. Every request is
  // dispatched, so every superseded answer comes back and is discarded.
  const b = workerClient();
  await b.request({ snapshotId: "warm", nodes: [{ id: "a" }], edges: [], options: { iterations: 1 } });
  const spaced = [];
  for (let i = 0; i < 3; i++) {
    spaced.push(b.request({ snapshotId: "spaced", nodes, edges }));
    // Let the previous request reach the worker AND come back before asking
    // again, so supersession happens after dispatch rather than before.
    if (i < 2) await new Promise((resolve) => setTimeout(resolve, 900));
  }
  const spacedOutcomes = await Promise.all(spaced);
  const statsB = b.stats();
  b.terminate();
  console.log("  regime B — 900 ms apart, each already dispatched:");
  console.log(`    outcomes:                 ${spacedOutcomes.map((o) => `${o.version}:${o.status}`).join(", ")}`);
  console.log(`    requests superseded:      ${statsB.superseded} (before dispatch: ${statsB.supersededBeforeDispatch})`);
  console.log(`    results discarded stale:  ${statsB.staleResultsDiscarded}`);
  console.log(`    last discard:             ${JSON.stringify(statsB.lastDiscarded)}`);
}

// ---------------------------------------------------------------------------
// 5. Message-boundary cost, measured.
// ---------------------------------------------------------------------------
console.log("");
console.log("=== message-boundary cost (iterations: 1, median of 7) ===");
console.log("  nodes   worker(ms)   sync(ms)   boundary(ms)   bytes out");
for (const n of [1000, 5000, 20000]) {
  const { nodes, edges } = graph(n);
  const options = { iterations: 1 };
  const wc = workerClient();
  await wc.request({ snapshotId: "warm", nodes: [{ id: "a" }], edges: [], options });
  const workerMs = [];
  for (let i = 0; i < 7; i++) {
    const r = await timed(() => wc.request({ snapshotId: `w${n}`, nodes, edges, options }));
    if (r.value.status !== "fulfilled") fail(`boundary worker ${n}`);
    workerMs.push(r.ms);
  }
  wc.terminate();
  const sc = createLayoutClient({ dispatch: "sync" });
  const syncMs = [];
  for (let i = 0; i < 7; i++) {
    const r = await timed(() => sc.request({ snapshotId: `s${n}`, nodes, edges, options }));
    if (r.value.status !== "fulfilled") fail(`boundary sync ${n}`);
    syncMs.push(r.ms);
  }
  const w = median(workerMs);
  const s = median(syncMs);
  console.log(
    `  ${String(n).padStart(5)}  ${w.toFixed(2).padStart(10)}  ${s.toFixed(2).padStart(9)}  ${(w - s).toFixed(2).padStart(13)}  ${String(n * 8).padStart(10)}`,
  );
}
console.log("");
console.log("boundary(ms) = worker wall - sync wall at one iteration: the request clone in,");
console.log("the positions transfer out and the thread hop, with the computation held at its floor.");
