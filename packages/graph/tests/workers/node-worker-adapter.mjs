/**
 * Bridge a `node:worker_threads` worker to the client's `LayoutWorkerHandle`
 * (test/bench only).
 *
 * The client's handle type is structural precisely so this is possible: the
 * browser `Worker` shape, this bridge and the in-process double all satisfy it,
 * which is what lets the protocol be exercised against a GENUINELY separate
 * thread in a host that has no `Worker` global.
 */
import { Worker as NodeWorker } from "node:worker_threads";

const scopeUrl = new URL("./node-worker-scope.mjs", import.meta.url);

/**
 * @param {URL|string} bundleUrl file: URL of the built `src/worker.ts` bundle.
 * @returns {{ postMessage(message: unknown): void, terminate(): void,
 *   onmessage: ((event: { data?: unknown }) => void) | null,
 *   onerror: ((event: unknown) => void) | null, thread: import("node:worker_threads").Worker }}
 */
export function createNodeWorkerHandle(bundleUrl) {
  const thread = new NodeWorker(scopeUrl, {
    workerData: { bundle: bundleUrl instanceof URL ? bundleUrl.href : String(bundleUrl) },
  });
  const handle = {
    onmessage: null,
    onerror: null,
    postMessage(message) {
      thread.postMessage(message);
    },
    terminate() {
      void thread.terminate();
    },
    thread,
  };
  thread.on("message", (data) => {
    if (typeof handle.onmessage === "function") handle.onmessage({ data });
  });
  thread.on("error", (error) => {
    if (typeof handle.onerror === "function") handle.onerror(error);
  });
  return handle;
}
