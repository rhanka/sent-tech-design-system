/**
 * The seven reference types, nominal and NOT interchangeable.
 *
 * SPEC 3.2 names five (`EntityRef`, `OccurrenceRef`, `PortRef`, `ViewRef`,
 * `ResourceRef`). Two more are declared here because the model cannot be
 * expressed without them, and expressing them as one of the five would be
 * exactly the mis-typing the spec forbids:
 *   - `RelationRef`: a relation occurrence points at a relation (SPEC 3.4), and
 *     a relation is not an entity. Typing that field `EntityRef` would let an
 *     entity id be accepted where a relation id is required.
 *   - `DocumentRef`: `ViewDocument.semanticDocumentId` points at a document
 *     (SPEC 3.4), which is neither a view nor an entity.
 * Both are reported as a spec gap in the PR body rather than smuggled in.
 *
 * NOMINALITY: each type is `string` intersected with a phantom property keyed by
 * a module-private `unique symbol`. The symbol is `declare`d, so nothing is
 * emitted at runtime and the brand exists only in the type system. Two branded
 * types with different brand values have no assignability relation in either
 * direction, which is what tests/refs-nominal.test.ts proves with one
 * `@ts-expect-error` per illegitimate assignment.
 *
 * RUNTIME IDENTITY: a reference is not a bare id. It carries its own identity
 * namespace as a prefix (`entity:`, `relation:`, …), so a function that expects
 * an occurrence can refuse an entity AT RUNTIME too, with a diagnostic
 * (`reference-type-mismatch`) rather than a silent misread. The two checks are
 * independent on purpose: types protect our own code, the prefix protects data
 * that crossed a process or a file boundary.
 */

import { type Diagnostic, diagnostic } from "./diagnostics.js";

declare const refBrand: unique symbol;

/** The identity namespaces. One per reference type, no aliasing. */
export const REF_KINDS = ["entity", "relation", "occurrence", "port", "view", "resource", "document"] as const;

export type RefKind = (typeof REF_KINDS)[number];

type Ref<K extends RefKind> = string & { readonly [refBrand]: K };

export type EntityRef = Ref<"entity">;
export type RelationRef = Ref<"relation">;
export type OccurrenceRef = Ref<"occurrence">;
export type PortRef = Ref<"port">;
export type ViewRef = Ref<"view">;
export type ResourceRef = Ref<"resource">;
export type DocumentRef = Ref<"document">;

/** Any reference, when only the namespace matters (diagnostics, key checks). */
export type AnyRef = EntityRef | RelationRef | OccurrenceRef | PortRef | ViewRef | ResourceRef | DocumentRef;

/**
 * Local ids are deliberately narrow: the canonical serialisation sorts record
 * keys, ids appear in diagnostics and in fixtures, and a `:` inside a local id
 * would make the namespace prefix ambiguous.
 */
const LOCAL_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export class RefFormatError extends Error {
  readonly kind: RefKind;
  readonly localId: string;

  constructor(kind: RefKind, localId: string) {
    super(
      `invalid ${kind} local id ${JSON.stringify(localId)}: expected /${LOCAL_ID.source}/ ` +
        "(a reference is `<namespace>:<localId>`, so the local id may not contain `:`)",
    );
    this.name = "RefFormatError";
    this.kind = kind;
    this.localId = localId;
  }
}

function makeRef<K extends RefKind>(kind: K, localId: string): Ref<K> {
  if (!LOCAL_ID.test(localId)) throw new RefFormatError(kind, localId);
  return `${kind}:${localId}` as Ref<K>;
}

function hasKind(value: unknown, kind: RefKind): boolean {
  if (typeof value !== "string") return false;
  const separator = value.indexOf(":");
  if (separator !== kind.length) return false;
  if (!value.startsWith(`${kind}:`)) return false;
  return LOCAL_ID.test(value.slice(separator + 1));
}

/**
 * Constructors. They THROW on a malformed local id, because a bad literal in
 * our own code is a programmer error, not data to be diagnosed. Untrusted input
 * goes through {@link parseRef} or {@link requireRef}, which return diagnostics.
 */
export const entityRef = (localId: string): EntityRef => makeRef("entity", localId);
export const relationRef = (localId: string): RelationRef => makeRef("relation", localId);
export const occurrenceRef = (localId: string): OccurrenceRef => makeRef("occurrence", localId);
export const portRef = (localId: string): PortRef => makeRef("port", localId);
export const viewRef = (localId: string): ViewRef => makeRef("view", localId);
export const resourceRef = (localId: string): ResourceRef => makeRef("resource", localId);
export const documentRef = (localId: string): DocumentRef => makeRef("document", localId);

/** Runtime shape guards. Each one answers about ONE namespace. */
export const isEntityRef = (value: unknown): value is EntityRef => hasKind(value, "entity");
export const isRelationRef = (value: unknown): value is RelationRef => hasKind(value, "relation");
export const isOccurrenceRef = (value: unknown): value is OccurrenceRef => hasKind(value, "occurrence");
export const isPortRef = (value: unknown): value is PortRef => hasKind(value, "port");
export const isViewRef = (value: unknown): value is ViewRef => hasKind(value, "view");
export const isResourceRef = (value: unknown): value is ResourceRef => hasKind(value, "resource");
export const isDocumentRef = (value: unknown): value is DocumentRef => hasKind(value, "document");

/** The namespace a reference declares, or `undefined` if it declares none. */
export function refKindOf(value: unknown): RefKind | undefined {
  for (const kind of REF_KINDS) if (hasKind(value, kind)) return kind;
  return undefined;
}

/** The local id, without its namespace. */
export function localIdOf(ref: AnyRef): string {
  return ref.slice(ref.indexOf(":") + 1);
}

/** Maps a namespace to the branded type it names, for generic call sites. */
export interface RefOfKind {
  entity: EntityRef;
  relation: RelationRef;
  occurrence: OccurrenceRef;
  port: PortRef;
  view: ViewRef;
  resource: ResourceRef;
  document: DocumentRef;
}

/**
 * Parse untrusted input into a reference of ONE expected namespace.
 *
 * The two failure modes are distinct diagnostics on purpose: a value that is no
 * reference at all is `malformed-ref` (bad data), while a well-formed reference
 * of the wrong namespace is `reference-type-mismatch` (the runtime half of the
 * non-interchangeability rule).
 */
export function parseRef<K extends RefKind>(
  kind: K,
  value: unknown,
  path: string,
): { readonly ok: true; readonly ref: RefOfKind[K] } | { readonly ok: false; readonly diagnostic: Diagnostic } {
  if (hasKind(value, kind)) return { ok: true, ref: value as RefOfKind[K] };
  const seen = refKindOf(value);
  if (seen === undefined) {
    return {
      ok: false,
      diagnostic: diagnostic({
        code: "malformed-ref",
        path,
        message: `expected a ${kind} reference, got ${JSON.stringify(value)}`,
        details: { expectedKind: kind },
      }),
    };
  }
  return {
    ok: false,
    diagnostic: diagnostic({
      code: "reference-type-mismatch",
      path,
      message: `expected a ${kind} reference, got a ${seen} reference (${String(value)})`,
      refs: [String(value)],
      details: { expectedKind: kind, seenKind: seen },
    }),
  };
}

/**
 * The shape guard SPEC 3.2 asks for at call boundaries: "a function that expects
 * an occurrence must not accept an entity, at compile time AS WELL AS at
 * runtime". Returns the diagnostic instead of throwing, so a caller can collect
 * several before refusing a whole transaction.
 */
export function requireRef<K extends RefKind>(
  kind: K,
  value: unknown,
  path: string,
): { readonly ref: RefOfKind[K] } | { readonly diagnostic: Diagnostic } {
  const parsed = parseRef(kind, value, path);
  return parsed.ok ? { ref: parsed.ref } : { diagnostic: parsed.diagnostic };
}
