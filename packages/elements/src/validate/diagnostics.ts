/**
 * Diagnostics (§4.5): ONE shape for every refusal and warning the render
 * pipeline can produce. `path` is an RFC 6901 JSON Pointer into the ENVELOPE
 * (not into the component's own schema), so a host can always locate the
 * offending value without knowing which layer produced the diagnostic.
 *
 * The ten codes are exactly the §4.5 list — nothing else may appear:
 *
 *   unknown-component        the envelope's root targets no catalogued entry
 *   component-unavailable    the entry is a placeholder (x-sentropic.status)
 *   unsupported-contract      envelope contract newer than the entry's (§4.4)
 *   unsupported-mode         `preview` is reserved (§10.3)
 *   schema-violation         structure: envelope or component did not conform
 *   semantic-invalid         the owning runtime refused the payload (§4.3)
 *   payload-too-large        over the 1 MiB UTF-8 budget (§4.3 item 3)
 *   host-capability-missing  the host lacks an environment capability
 *   engine-load-failed       a lazy engine chunk failed to load
 *   watermark-refused       engine warning: rendered without the watermark
 *
 * `watermark-refused` is listed so the §4.5 set stays closed; engine
 * warnings surface under their own engine code, and this is the one the
 * spec names.
 */

/** The closed set of §4.5 codes. */
export type DiagnosticCode =
  | "unknown-component"
  | "component-unavailable"
  | "unsupported-contract"
  | "unsupported-mode"
  | "schema-violation"
  | "semantic-invalid"
  | "payload-too-large"
  | "host-capability-missing"
  | "engine-load-failed"
  | "watermark-refused";

/**
 * Who produced the diagnostic: the catalogue itself, a host-environment
 * fact, or an owning runtime through its semantic port (`diagram-core` is
 * reserved for lot L8).
 */
export type DiagnosticSource = "catalog" | "host" | "focus" | "bpmn-canvas" | "diagram-core";

/** The single diagnostic shape (§4.5). */
export interface Diagnostic {
  /**
   * The §4.5 code. Catalogue-side diagnostics are always one of the ten; an
   * engine WARNING keeps its owning runtime's own stable code instead (the
   * one §4.5 names is `watermark-refused`), so the field also accepts a
   * string there.
   */
  readonly code: DiagnosticCode | (string & {});
  /** RFC 6901 JSON Pointer into the envelope ("" for the envelope itself). */
  readonly path: string;
  readonly message: string;
  readonly severity: "error" | "warning";
  readonly source: DiagnosticSource;
  /** Machine-readable extras, e.g. `{ expected, found }`, `{ limitBytes }`. */
  readonly detail?: Readonly<Record<string, unknown>>;
}

/**
 * A host-environment capability is missing (§4.5 `host-capability-missing`):
 * the host calls this for facts it owns BEFORE the render pipeline runs
 * (a missing canvas, a missing engine chunk before a port exists). The
 * envelope validator produces the same code itself when an injected `lazy:`
 * engine has no port.
 */
export function hostCapabilityMissing(capability: string): Diagnostic {
  return {
    code: "host-capability-missing",
    path: "",
    message: `the host environment is missing a required capability: ${capability}`,
    severity: "error",
    source: "host",
    detail: { capability },
  };
}

/**
 * A lazy engine chunk failed to load (§4.5 `engine-load-failed`): the host
 * reports the chunk and the cause; the envelope validator produces the same
 * code when an injected port throws instead of returning findings.
 */
export function engineLoadFailed(chunk: string, cause: string): Diagnostic {
  return {
    code: "engine-load-failed",
    path: "",
    message: `the ${chunk} engine failed to load: ${cause}`,
    severity: "error",
    source: "host",
    detail: { chunk, cause },
  };
}
