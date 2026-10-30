/**
 * The structure seam (§4.3): JSON Schema 2020-12 validation of the envelope
 * and of the targeted component, behind a dependency-free interface.
 *
 * The pure half of the package (validate, ports, contracts) defines and uses
 * this interface; the default implementation is the ajv bridge in
 * `src/structure/ajv.ts` (the generator is the other Node-side module).
 * A host that compiles its schemas ahead of time, or ships a different
 * 2020-12 implementation, can inject its own through
 * `createEnvelopeValidator`'s `structure` option.
 */

/**
 * One structure failure. `pointer` is an RFC 6901 JSON Pointer RELATIVE TO
 * THE VALIDATED VALUE (the envelope, or the root component object), so the
 * envelope validator can anchor it into the envelope.
 */
export interface StructureIssue {
  readonly pointer: string;
  readonly message: string;
  /** The failing keyword, e.g. `type`, `required`, `unevaluatedProperties`. */
  readonly keyword: string;
  /** For `required`: the missing property name. */
  readonly missingProperty?: string;
  /** For `unevaluatedProperties`/`additionalProperties`: the stray name. */
  readonly additionalProperty?: string;
}

/** Structure validation of both layers (§4.3: envelope, then component). */
export interface StructureValidator {
  validateEnvelope(value: unknown): readonly StructureIssue[];
  validateComponent(component: string, root: unknown): readonly StructureIssue[];
}
