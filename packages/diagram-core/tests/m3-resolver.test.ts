/**
 * M3 §5.1 — the shared resolver.
 *
 * One resolver accepts (document, owning profile context, type id): full base
 * chain with a visited set, typed refusals (unknown base, cross-owner base
 * without a join, cycle, inherited attribute redeclaration), the abstract base
 * rule, and a cache scoped to the revision and the exact profile context.
 */
import { describe, expect, it } from "vitest";

import {
  createTypeResolver,
  text,
  validateDocument,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, explicitLegacyOptions, scopedOptions } from "./m3-helpers.js";

const resolverProfile: Profile = {
  id: "resolver@2",
  name: "resolver",
  version: 2,
  completeness: "complete",
  entityTypes: [
    { id: "base", label: "Base", attributes: [{ name: "title", kind: "text", maxLength: 50 }] },
    {
      id: "mid",
      label: "Mid",
      supertypes: ["base"],
      attributes: [{ name: "extra", kind: "boolean" }],
    },
    { id: "abs", label: "Abs", abstract: true, attributes: [] },
  ],
  portTypes: [],
  relationTypes: [],
  constraints: [],
  limits: {},
  notes: [],
};

const otherProfile: Profile = {
  id: "other@2",
  name: "other",
  version: 2,
  completeness: "complete",
  entityTypes: [{ id: "beta", label: "Beta", attributes: [] }],
  portTypes: [],
  relationTypes: [],
  constraints: [],
  limits: {},
  notes: [],
};

function documentWithDefinitions(definitions: SemanticDocument["typeDefinitions"]): SemanticDocument {
  return { ...baseDocument(["resolver@2"]), typeDefinitions: definitions };
}

describe("the shared resolver", () => {
  it("resolves a direct profile type with its own schema", () => {
    const resolver = createTypeResolver(baseDocument(["resolver@2"]));
    const resolution = resolver.resolve(resolverProfile, "base");
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) throw new Error("unreachable");
    expect(resolution.resolved.ancestry).toEqual(["base"]);
    expect(resolution.resolved.familyType).toBe("base");
    expect(resolution.resolved.schemas).toEqual([{ name: "title", kind: "text", maxLength: 50 }]);
    expect(resolution.resolved.container).toBe(false);
    expect(resolution.resolved.abstract).toBe(false);
  });

  it("follows a document refinement chain, base first", () => {
    const document = documentWithDefinitions({
      d1: { id: "d1", profile: "resolver@2", baseType: "base", attributes: [{ name: "dattr", kind: "text" }] },
      d2: {
        id: "d2",
        profile: "resolver@2",
        baseType: "d1",
        attributes: [{ name: "d2attr", kind: "boolean" }],
      },
    });
    const resolution = createTypeResolver(document).resolve(resolverProfile, "d2");
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) throw new Error("unreachable");
    expect(resolution.resolved.ancestry).toEqual(["d2", "d1", "base"]);
    expect(resolution.resolved.familyType).toBe("base");
    expect(resolution.resolved.schemas.map((schema) => schema.name)).toEqual(["title", "dattr", "d2attr"]);
  });

  it("follows profile supertypes depth-first", () => {
    const resolution = createTypeResolver(baseDocument(["resolver@2"])).resolve(resolverProfile, "mid");
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) throw new Error("unreachable");
    expect(resolution.resolved.ancestry).toEqual(["mid", "base"]);
    expect(resolution.resolved.familyType).toBe("mid");
    expect(resolution.resolved.schemas.map((schema) => schema.name)).toEqual(["title", "extra"]);
  });

  it("refuses an unknown start type with the native literal", () => {
    const resolution = createTypeResolver(baseDocument(["resolver@2"])).resolve(resolverProfile, "nope");
    expect(resolution.ok).toBe(false);
    if (resolution.ok) throw new Error("unreachable");
    expect(resolution.diagnostic).toEqual({
      code: "unknown-entity-type",
      severity: "error",
      path: "profiles.resolver@2.entityTypes.nope",
      message: "neither profile resolver@2 nor the document declares entity type nope",
      details: { type: "nope", profile: "resolver@2" },
    });
  });

  it("refuses an unknown refinement base at the definition", () => {
    const document = documentWithDefinitions({
      dx: { id: "dx", profile: "resolver@2", baseType: "nope", attributes: [] },
    });
    expect(validateDocument(document, scopedOptions([resolverProfile]))).toEqual([
      {
        code: "unknown-entity-type",
        severity: "error",
        path: "typeDefinitions.dx.baseType",
        message: "profile resolver@2 does not declare base type nope",
      },
    ]);
  });

  it("refuses a cross-owner base without an admitted join", () => {
    const document = {
      ...baseDocument(["resolver@2", "other@2"]),
      typeDefinitions: {
        x: { id: "x", profile: "resolver@2" as const, baseType: "beta", attributes: [] },
      },
    };
    // `beta` exists, but in another profile with no admitted join: the owning
    // context still refuses it.
    expect(validateDocument(document, scopedOptions([resolverProfile, otherProfile]))).toEqual([
      {
        code: "unknown-entity-type",
        severity: "error",
        path: "typeDefinitions.x.baseType",
        message: "profile resolver@2 does not declare base type beta",
      },
    ]);
  });

  it("refuses a refinement cycle with the visited chain", () => {
    const document = documentWithDefinitions({
      a: { id: "a", profile: "resolver@2", baseType: "b", attributes: [] },
      b: { id: "b", profile: "resolver@2", baseType: "a", attributes: [] },
    });
    const resolution = createTypeResolver(document).resolve(resolverProfile, "a");
    expect(resolution.ok).toBe(false);
    if (resolution.ok) throw new Error("unreachable");
    expect(resolution.diagnostic).toEqual({
      code: "type-definition-conflict",
      severity: "error",
      path: "typeDefinitions.a.baseType",
      message: "type definition a closes base cycle a>b>a",
      refs: [],
      details: { check: "resolution-cycle", cycle: "a>b>a" },
    });
    // Each definition that closes a cycle is reported once, in key order.
    expect(validateDocument(document, scopedOptions([resolverProfile])).map((entry) => entry.path)).toEqual([
      "typeDefinitions.a.baseType",
      "typeDefinitions.b.baseType",
    ]);
  });

  it("refuses an inherited attribute redeclaration with the native literal and no refs", () => {
    const document = documentWithDefinitions({
      r: {
        id: "r",
        profile: "resolver@2",
        baseType: "base",
        attributes: [{ name: "title", kind: "boolean" }],
      },
    });
    const diagnostics = validateDocument(document, scopedOptions([resolverProfile]));
    expect(diagnostics).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "typeDefinitions.r.attributes.title",
        message:
          "type definition r redeclares title, which base type base already declares; refinements are additive only",
        details: { attribute: "title", baseType: "base" },
      },
    ]);
    expect("refs" in (diagnostics[0] as object)).toBe(false);
  });

  it("keeps a refinement of an abstract base instantiable, and refuses the base itself", () => {
    const document: SemanticDocument = {
      ...documentWithDefinitions({
        conc: { id: "conc", profile: "resolver@2", baseType: "abs", attributes: [] },
      }),
      entities: {
        "entity:ok": ent("ok", "resolver@2", "conc"),
        "entity:bad": ent("bad", "resolver@2", "abs"),
      },
    };
    expect(validateDocument(document, scopedOptions([resolverProfile]))).toEqual([
      {
        code: "abstract-instantiated",
        severity: "error",
        path: "entities.entity:bad.type",
        message: "abstract type abs cannot be instantiated as an entity",
        refs: ["entity:bad"],
        details: { type: "abs" },
      },
    ]);
  });

  it("caches per revision and profile context, and never crosses them", () => {
    const document = baseDocument(["resolver@2"]);
    const resolver = createTypeResolver(document);
    expect(resolver.revision).toBe(0);
    const first = resolver.resolve(resolverProfile, "base");
    expect(resolver.resolve(resolverProfile, "base")).toBe(first);
    // Another profile context never shares the entry.
    expect(resolver.resolve(otherProfile, "base")).not.toBe(first);
    // A revision change rescopes the cache: the same query recomputes.
    (document as { revision: number }).revision = 1;
    expect(resolver.resolve(resolverProfile, "base")).not.toBe(first);
  });

  it("leaves legacy validation bound to its native abstract shape", () => {
    const legacyProfile: Profile = { ...resolverProfile, id: "resolver@1", version: 1 };
    const document: SemanticDocument = {
      ...baseDocument(["resolver@1"]),
      entities: { "entity:bad": ent("bad", "resolver@1", "abs") },
    };
    const diagnostics = validateDocument(document, explicitLegacyOptions([legacyProfile]));
    expect(diagnostics.map((entry) => entry.code)).toEqual(["unknown-entity-type"]);
    expect(diagnostics[0]?.details).toEqual({ abstract: true });
  });

  it("validates an entity through the refinement chain, including text bounds", () => {
    const document: SemanticDocument = {
      ...documentWithDefinitions({
        d1: { id: "d1", profile: "resolver@2", baseType: "base", attributes: [] },
      }),
      entities: {
        "entity:e": ent("e", "resolver@2", "d1", { title: text("way too long ".repeat(10)) }),
      },
    };
    expect(validateDocument(document, scopedOptions([resolverProfile]))).toEqual([
      {
        code: "text-too-long",
        severity: "error",
        path: "entities.entity:e.attributes.title",
        message: "text is 130 characters, the schema allows 50",
        details: { length: 130, maxLength: 50 },
      },
    ]);
  });
});
