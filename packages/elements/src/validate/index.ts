/**
 * The validator barrel (§4.3–§4.5): the public surface of the pure half,
 * plus the default wiring. `createEnvelopeValidator` fills in the ajv
 * 2020-12 structure bridge (src/structure) when the caller does not
 * inject its own — the core orchestrator stays dependency-free and every
 * piece stays substitutable.
 */

import { createAjvStructure } from "../structure/ajv.js";
import {
  createEnvelopeValidatorCore,
  type EnvelopeValidator,
  type EnvelopeValidatorOptions,
} from "./envelope.js";

export {
  hostCapabilityMissing,
  engineLoadFailed,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticSource,
} from "./diagnostics.js";
export type { StructureIssue, StructureValidator } from "./structure.js";
export {
  createEnvelopeValidatorCore,
  normalizeEnvelopeInput,
  type EnvelopeValidator,
  type EnvelopeValidatorOptions,
  type CatalogDocument,
  type CatalogComponentEntry,
  type NormalizedEnvelopeInput,
} from "./envelope.js";
export { ENVELOPE_LIMIT_BYTES, utf8ByteLength } from "./envelope.js";
export { createFocusPort, focusPathToPointer, type FocusValidate, type FocusValidationResult } from "../ports/focus.js";
export {
  createBpmnCanvasPort,
  type BpmnHydrate,
  type BpmnHydrationResult,
  type BpmnHydrationWarning,
} from "../ports/bpmn-canvas.js";
export type { SemanticFinding, SemanticPort, EngineSource } from "../ports/types.js";

/**
 * Creates the envelope validator for one catalogue. `structure` defaults to
 * the ajv 2020-12 bridge over the given catalogue, envelope schema and
 * vendored common types (see src/structure/ajv.ts).
 */
export function createEnvelopeValidator(options: EnvelopeValidatorOptions): EnvelopeValidator {
  const structure = options.structure ?? createAjvStructure(options);
  return createEnvelopeValidatorCore({ ...options, structure });
}
