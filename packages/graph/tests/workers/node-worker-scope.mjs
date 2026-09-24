/**
 * DEDICATED-WORKER SCOPE EMULATED OVER `node:worker_threads` (test/bench only).
 *
 * `src/worker.ts` is written for a Web Worker: it installs itself on a global
 * scope that has `postMessage` and no `document`. Node has no `Worker` global at
 * all (measured on Node 22.22.1: `typeof Worker === "undefined"`) and its worker
 * threads expose `parentPort.postMessage` instead of a global one, so the real
 * worker entry cannot run there unaided.
 *
 * This bootstrap supplies exactly the three things the entry looks for —
 * `globalThis.self`, `globalThis.postMessage`, and the absence of `document` —
 * then imports the entry and forwards `parentPort` messages to whatever
 * `onmessage` handler the entry installed. Nothing of the protocol is
 * reimplemented: the code under test is the built `src/worker.ts` bundle, named
 * by `workerData.bundle`.
 *
 * The transfer list is forwarded as given, so the entry's transferable-positions
 * path is exercised for real rather than bypassed.
 */
import { parentPort, workerData } from "node:worker_threads";

if (parentPort === null) throw new Error("node-worker-scope.mjs must run as a worker thread");
const port = parentPort;

globalThis.self = globalThis;
globalThis.postMessage = (message, transfer) => {
  port.postMessage(message, transfer);
};

await import(workerData.bundle);

port.on("message", (data) => {
  const handler = globalThis.onmessage;
  if (typeof handler === "function") handler({ data });
});
