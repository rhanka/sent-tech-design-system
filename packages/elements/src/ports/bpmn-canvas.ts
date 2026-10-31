/**
 * The bpmn-canvas port (§4.3 item 2, §5.1): the typed seam to the BPMN
 * engine's `hydrate`, which is the AUTHORITATIVE validator of the F1
 * document. No BPMN engine is installed in this workspace, so nothing here
 * imports one: L6's host injects the port bound to the real engine, and the
 * workspace-side tests bind it to typed stubs. The result type is the part
 * of the F1 surface the envelope contract needs: refuse, accept, or accept
 * with warnings (e.g. `watermark-refused`), each with an optional pointer
 * relative to the document.
 */

import type { SemanticFinding, SemanticPort } from "./types.js";

/** A non-blocking engine fact: rendered, but not exactly as asked. */
export interface BpmnHydrationWarning {
  /** The engine's stable code, e.g. `watermark-refused` (§4.5). */
  readonly code: string;
  readonly message: string;
  /** JSON Pointer relative to the document, when the engine can locate it. */
  readonly pointer?: string;
}

/** What the engine's `hydrate` returns for one F1 document. */
export type BpmnHydrationResult =
  | { readonly ok: true; readonly warnings?: readonly BpmnHydrationWarning[] }
  | { readonly ok: false; readonly code: string; readonly message: string; readonly pointer?: string };

/** The engine binding the host injects: validate by hydrating. */
export type BpmnHydrate = (payload: unknown) => BpmnHydrationResult;

/** Wraps a hydrate binding as the injected `bpmn-canvas` semantic port. */
export function createBpmnCanvasPort(hydrate: BpmnHydrate): SemanticPort {
  return {
    source: "bpmn-canvas",
    validate(payload: unknown): readonly SemanticFinding[] {
      const result = hydrate(payload);
      if (result.ok) {
        return (result.warnings ?? []).map((warning) => ({
          code: warning.code,
          message: warning.message,
          ...(warning.pointer !== undefined ? { pointer: warning.pointer } : {}),
          severity: "warning" as const,
        }));
      }
      return [
        {
          code: result.code,
          message: result.message,
          ...(result.pointer !== undefined ? { pointer: result.pointer } : {}),
          severity: "error" as const,
        },
      ];
    },
  };
}
