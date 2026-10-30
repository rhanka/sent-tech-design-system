/**
 * Semantic ports (§4.3 item 2): the seam through which each component's
 * OWNING RUNTIME validates the semantic payload. The validator never imports
 * a runtime itself — the host injects the port for every `lazy:` engine, so
 * the workspace-side validator stays pure and the engine chunk stays optional.
 *
 * `diagram-core` is reserved for lot L8 (§14): no port factory exists for it
 * yet, but the source union names it so L8 can register one without touching
 * the diagnostic contract.
 */

/**
 * One finding of a semantic port: an engine-level fact about the payload.
 * `pointer` is an RFC 6901 JSON Pointer RELATIVE TO THE PAYLOAD ("" for the
 * payload itself); the envelope validator anchors it into the envelope.
 */
export interface SemanticFinding {
  /** The owning runtime's stable code, e.g. `duplicate_id`, `watermark-refused`. */
  readonly code: string;
  readonly message: string;
  readonly pointer?: string;
  readonly severity: "error" | "warning";
}

/** The engines that can own a component's semantics (§4.3 item 2). */
export type EngineSource = "focus" | "bpmn-canvas" | "diagram-core";

/**
 * A semantic port: the injected binding to one owning runtime. `validate`
 * must be pure (no I/O, no mutation of the payload); a port that cannot run
 * throws, and the envelope validator surfaces that as `engine-load-failed`
 * (§4.5) — the host uses {@link engineLoadFailed} for the same fact when it
 * fails BEFORE the port exists.
 */
export interface SemanticPort {
  readonly source: EngineSource;
  validate(payload: unknown): readonly SemanticFinding[];
}
