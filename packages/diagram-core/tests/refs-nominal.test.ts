/**
 * The five (here seven) reference types are NOT interchangeable.
 *
 * HOW THIS TEST WORKS, AND WHY IT IS A COMPILER TEST
 * Every illegitimate assignment below carries a `@ts-expect-error`, the
 * mechanism already used in seven files of this repository. The file is part of
 * `tsconfig.check.json`, so `npm run check` compiles it:
 *   - as long as each illegitimate assignment IS an error, `check` stays at
 *     exit 0 and this test file passes at runtime too (a directive is a comment);
 *   - the moment a brand is removed - say `EntityRef` becomes a plain `string` -
 *     the expected errors stop happening and TypeScript reports TS2578,
 *     "Unused '@ts-expect-error' directive", ON EVERY LINE that no longer fails.
 *     That is the regression this file exists to catch: a silently widened
 *     reference type would otherwise let an entity id be read as an occurrence
 *     id for as long as the data happened to look right.
 *
 * To see it fail on purpose: drop the brand from `Ref<K>` in src/refs.ts and run
 * `npm run --workspace @sentropic/diagram-core check`.
 *
 * The 42 ordered pairs are exhaustive: seven namespaces, each one refused in
 * place of each of the six others.
 */
import { describe, expect, it } from "vitest";

import {
  documentRef,
  entityRef,
  isDocumentRef,
  isEntityRef,
  isOccurrenceRef,
  isPortRef,
  isRelationRef,
  isResourceRef,
  isViewRef,
  localIdOf,
  occurrenceRef,
  parseRef,
  portRef,
  REF_KINDS,
  refKindOf,
  RefFormatError,
  relationRef,
  requireRef,
  resourceRef,
  viewRef,
  type DocumentRef,
  type EntityRef,
  type OccurrenceRef,
  type PortRef,
  type RelationRef,
  type ResourceRef,
  type ViewRef,
} from "../src/index.js";

/** One acceptor per namespace: a function that takes THAT reference and no other. */
const accept = {
  entity: (_ref: EntityRef): void => {},
  relation: (_ref: RelationRef): void => {},
  occurrence: (_ref: OccurrenceRef): void => {},
  port: (_ref: PortRef): void => {},
  view: (_ref: ViewRef): void => {},
  resource: (_ref: ResourceRef): void => {},
  document: (_ref: DocumentRef): void => {},
};

const refs = {
  entity: entityRef("a"),
  relation: relationRef("a"),
  occurrence: occurrenceRef("a"),
  port: portRef("a"),
  view: viewRef("a"),
  resource: resourceRef("a"),
  document: documentRef("a"),
};

// The legitimate assignments: each acceptor takes its own namespace. If one of
// these ever became an error, the brands would have stopped being usable at all.
accept.entity(refs.entity);
accept.relation(refs.relation);
accept.occurrence(refs.occurrence);
accept.port(refs.port);
accept.view(refs.view);
accept.resource(refs.resource);
accept.document(refs.document);

// --- the 42 illegitimate assignments, one `@ts-expect-error` each -------------
// @ts-expect-error a relation reference is not assignable to a entity reference
accept.entity(refs.relation);
// @ts-expect-error a occurrence reference is not assignable to a entity reference
accept.entity(refs.occurrence);
// @ts-expect-error a port reference is not assignable to a entity reference
accept.entity(refs.port);
// @ts-expect-error a view reference is not assignable to a entity reference
accept.entity(refs.view);
// @ts-expect-error a resource reference is not assignable to a entity reference
accept.entity(refs.resource);
// @ts-expect-error a document reference is not assignable to a entity reference
accept.entity(refs.document);
// @ts-expect-error a entity reference is not assignable to a relation reference
accept.relation(refs.entity);
// @ts-expect-error a occurrence reference is not assignable to a relation reference
accept.relation(refs.occurrence);
// @ts-expect-error a port reference is not assignable to a relation reference
accept.relation(refs.port);
// @ts-expect-error a view reference is not assignable to a relation reference
accept.relation(refs.view);
// @ts-expect-error a resource reference is not assignable to a relation reference
accept.relation(refs.resource);
// @ts-expect-error a document reference is not assignable to a relation reference
accept.relation(refs.document);
// @ts-expect-error a entity reference is not assignable to a occurrence reference
accept.occurrence(refs.entity);
// @ts-expect-error a relation reference is not assignable to a occurrence reference
accept.occurrence(refs.relation);
// @ts-expect-error a port reference is not assignable to a occurrence reference
accept.occurrence(refs.port);
// @ts-expect-error a view reference is not assignable to a occurrence reference
accept.occurrence(refs.view);
// @ts-expect-error a resource reference is not assignable to a occurrence reference
accept.occurrence(refs.resource);
// @ts-expect-error a document reference is not assignable to a occurrence reference
accept.occurrence(refs.document);
// @ts-expect-error a entity reference is not assignable to a port reference
accept.port(refs.entity);
// @ts-expect-error a relation reference is not assignable to a port reference
accept.port(refs.relation);
// @ts-expect-error a occurrence reference is not assignable to a port reference
accept.port(refs.occurrence);
// @ts-expect-error a view reference is not assignable to a port reference
accept.port(refs.view);
// @ts-expect-error a resource reference is not assignable to a port reference
accept.port(refs.resource);
// @ts-expect-error a document reference is not assignable to a port reference
accept.port(refs.document);
// @ts-expect-error a entity reference is not assignable to a view reference
accept.view(refs.entity);
// @ts-expect-error a relation reference is not assignable to a view reference
accept.view(refs.relation);
// @ts-expect-error a occurrence reference is not assignable to a view reference
accept.view(refs.occurrence);
// @ts-expect-error a port reference is not assignable to a view reference
accept.view(refs.port);
// @ts-expect-error a resource reference is not assignable to a view reference
accept.view(refs.resource);
// @ts-expect-error a document reference is not assignable to a view reference
accept.view(refs.document);
// @ts-expect-error a entity reference is not assignable to a resource reference
accept.resource(refs.entity);
// @ts-expect-error a relation reference is not assignable to a resource reference
accept.resource(refs.relation);
// @ts-expect-error a occurrence reference is not assignable to a resource reference
accept.resource(refs.occurrence);
// @ts-expect-error a port reference is not assignable to a resource reference
accept.resource(refs.port);
// @ts-expect-error a view reference is not assignable to a resource reference
accept.resource(refs.view);
// @ts-expect-error a document reference is not assignable to a resource reference
accept.resource(refs.document);
// @ts-expect-error a entity reference is not assignable to a document reference
accept.document(refs.entity);
// @ts-expect-error a relation reference is not assignable to a document reference
accept.document(refs.relation);
// @ts-expect-error a occurrence reference is not assignable to a document reference
accept.document(refs.occurrence);
// @ts-expect-error a port reference is not assignable to a document reference
accept.document(refs.port);
// @ts-expect-error a view reference is not assignable to a document reference
accept.document(refs.view);
// @ts-expect-error a resource reference is not assignable to a document reference
accept.document(refs.resource);

// --- the runtime half: a prefix guard and a named diagnostic ------------------
describe("references are nominal at runtime too", () => {
  it("carries its identity namespace in the value", () => {
    expect(refs.entity).toBe("entity:a");
    expect(refs.occurrence).toBe("occurrence:a");
    expect(localIdOf(refs.port)).toBe("a");
    // The brand is a type-level phantom: nothing of it survives compilation.
    expect(typeof refs.view).toBe("string");
  });

  it("answers about one namespace per guard", () => {
    const guards = {
      entity: isEntityRef,
      relation: isRelationRef,
      occurrence: isOccurrenceRef,
      port: isPortRef,
      view: isViewRef,
      resource: isResourceRef,
      document: isDocumentRef,
    } as const;
    for (const kind of REF_KINDS) {
      for (const other of REF_KINDS) {
        expect(guards[kind](refs[other])).toBe(kind === other);
      }
    }
  });

  it("names the namespace a value declares, or none", () => {
    expect(refKindOf("occurrence:x")).toBe("occurrence");
    expect(refKindOf("nope:x")).toBeUndefined();
    expect(refKindOf("entity:")).toBeUndefined();
    expect(refKindOf(42)).toBeUndefined();
  });

  it("refuses an entity where an occurrence is required, WITH a diagnostic", () => {
    const refused = requireRef("occurrence", refs.entity, "commands[0].occurrence");
    expect("diagnostic" in refused).toBe(true);
    if (!("diagnostic" in refused)) throw new Error("unreachable");
    expect(refused.diagnostic.code).toBe("reference-type-mismatch");
    expect(refused.diagnostic.details).toEqual({ expectedKind: "occurrence", seenKind: "entity" });
    expect(refused.diagnostic.path).toBe("commands[0].occurrence");
  });

  it("distinguishes a wrong namespace from data that is no reference at all", () => {
    const mismatch = parseRef("entity", refs.view, "at");
    const malformed = parseRef("entity", "just-a-string", "at");
    expect(mismatch.ok).toBe(false);
    expect(malformed.ok).toBe(false);
    if (mismatch.ok || malformed.ok) throw new Error("unreachable");
    expect(mismatch.diagnostic.code).toBe("reference-type-mismatch");
    expect(malformed.diagnostic.code).toBe("malformed-ref");
  });

  it("refuses a local id that would make the namespace ambiguous", () => {
    expect(() => entityRef("has:colon")).toThrow(RefFormatError);
    expect(() => entityRef("")).toThrow(RefFormatError);
    expect(() => entityRef("-leading-dash")).toThrow(RefFormatError);
    expect(entityRef("ok.id_1-2")).toBe("entity:ok.id_1-2");
  });
});
