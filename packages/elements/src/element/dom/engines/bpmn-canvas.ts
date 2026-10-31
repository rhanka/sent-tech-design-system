/**
 * The `bpmn-canvas` ENGINE CHUNK (§6.6): everything `<st-bpmn-canvas>` needs
 * beyond the core — the F1 → BPMN 2.0 serialization, the semantic port that
 * makes F1 hydration the authoritative validation, and the canvas mount.
 * Dynamically imported by the element's core action (`render-action.ts`),
 * so a page that never mounts the element never downloads this chunk —
 * bpmn-moddle and the canvas library live here, not in the core bundle.
 */

import { createBpmnCanvas, type Diagnostic as CanvasDiagnostic } from "@sentropic/bpmn-canvas";
import { f1ToXml, hydrateF1 } from "../../f1/f1-to-xml.js";
import { createBpmnCanvasPort } from "../../../ports/bpmn-canvas.js";
import type { SemanticPort } from "../../../ports/types.js";
import type { Diagnostic } from "../../../validate/diagnostics.js";
import type { ElementPayload } from "../element-runtime.svelte.js";

/** The §4.3 semantic port: hydrating the F1 document IS the validation. */
export const port: SemanticPort = createBpmnCanvasPort((document: unknown) => hydrateF1(document));

/** The payload serializer the runtime calls (§4.3: engine owns the semantics). */
export const toXml = f1ToXml;

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
  node: HTMLElement,
  payload: Extract<ElementPayload, { kind: "bpmn" }>,
  noteDiagnostic: (diagnostic: Diagnostic) => void,
): Promise<() => void> {
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
  await handle.ready;
  // Warnings that predate the callback (import-time) still surface once.
  for (const found of handle.getDiagnostics()) noteDiagnostic(asDiagnostic(found));
  return () => {
    controller.abort();
    handle.destroy();
  };
}
