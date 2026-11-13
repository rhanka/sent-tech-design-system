import { createBpmnCanvas, type Diagnostic as CanvasDiagnostic } from '@sentropic/bpmn-canvas';
import type { Diagnostic } from '../validate/diagnostics.js';
import type { BpmnPayload } from './bpmn-types.js';
/** One canvas diagnostic as a §4.5 diagnostic of the element. */
function asDiagnostic(found: CanvasDiagnostic): Diagnostic {
  return {
    code: found.code,
    path: "",
    message: found.message,
    severity: found.severity === "error" ? "error" : "warning",
    source: "bpmn-canvas",
    ...(found.ids !== undefined ? { detail: { ids: found.ids } } : {}),
  };
}

/**
 * Mount the read-only canvas for one validated payload. The watermark is
 * the §13.3 way-(a) form the runtime derived from the host configuration —
 * this chunk never sees a license value other than through it (§13.4 W4).
 * Returns the cleanup the core action calls on re-render or destroy.
 */
export async function renderBpmn(
  node: Parameters<typeof createBpmnCanvas>[0],
  payload: BpmnPayload,
  noteDiagnostic: (diagnostic: Diagnostic) => void,
  signal?: AbortSignal,
): Promise<() => void> {
  if (signal?.aborted) return () => {};
  const controller = new AbortController();
  const handle = createBpmnCanvas(node, {
    xml: payload.xml,
    readOnly: true,
    styles: "auto",
    signal: controller.signal,
    ...(payload.assetBase !== undefined ? { assetBase: payload.assetBase } : {}),
    ...(payload.watermark !== undefined ? { watermark: payload.watermark } : {}),
    onDiagnostic: (found) => noteDiagnostic(asDiagnostic(found)),
  });
  let disposed = false;
  const cleanup = (): void => {
    if (disposed) return;
    disposed = true;
    signal?.removeEventListener('abort', cleanup);
    controller.abort();
    handle.destroy();
  };
  signal?.addEventListener('abort', cleanup, { once: true });
  if (signal?.aborted) cleanup();
  try { await handle.ready; } catch (error) { cleanup(); throw error; }
  if (disposed) return cleanup;
  // Warnings that predate the callback (import-time) still surface once.
  for (const found of handle.getDiagnostics()) noteDiagnostic(asDiagnostic(found));
  return cleanup;
}
