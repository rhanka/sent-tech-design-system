/**
 * M1-a review pass 1 — RED tests for the ten blocking findings.
 *
 * Each test below fails on f238fff0 and passes once its finding is fixed.
 * The four @1 profiles keep their exact native behaviour: none of these
 * tests touches a retained native diagnostic.
 */
import { describe, expect, it } from "vitest";

import {
  bindingRowFor,
  createProfileRegistry,
  createTypeResolver,
  generic2Profile,
  genericProfile,
  LEGACY_CONSTRAINTS_ADAPTER,
  m3ProfileRegistry,
  quantity,
  SCOPED_CONSTRAINTS_ADAPTER,
  shippedExecutorBindings,
  structValue,
  text,
  validateDocument,
  validateProfile,
  verifyExecutorBindings,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions, validGeneric2Document } from "./m3-helpers.js";

describe("finding 2: the hierarchy constraint member", () => {
  const family: Profile = {
    id: "hierfam@2",
    name: "hierfam",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "box",
        label: "Box",
        container: true,
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
      },
      {
        id: "item",
        label: "Item",
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
      },
    ],
    portTypes: [],
    relationTypes: [
      {
        id: "holds",
        label: "Holds",
        direction: "directed",
        roles: [
          { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
          { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
        ],
        hierarchy: { id: "nesting", shape: "tree", parentRole: "parent", childRole: "child" },
      },
    ],
    constraints: [
      { kind: "hierarchy", relationType: "holds", hierarchyId: "nesting", parentRole: "parent", childRole: "child" },
      { kind: "acyclic-hierarchy", hierarchyId: "nesting" },
    ],
    limits: {},
    notes: [],
  };

  function familyDocument(): SemanticDocument {
    return {
      ...baseDocument(["hierfam@2"]),
      entities: {
        "entity:b": ent("b", "hierfam@2", "box", { name: text("B") }),
        "entity:i": ent("i", "hierfam@2", "item", { name: text("I") }),
      },
      relations: {
        "relation:h": rel("h", "hierfam@2", "holds", [
          { role: "parent", target: "entity:b" },
          { role: "child", target: "entity:i" },
        ]),
      },
    };
  }

  it("dispatches the hierarchy member instead of throwing", () => {
    expect(validateDocument(familyDocument(), scopedOptions([family]))).toEqual([]);
  });

  it("qualifies a hierarchy constraint that names nothing declared", () => {
    const broken: Profile = {
      ...family,
      constraints: [
        { kind: "hierarchy", relationType: "missing", hierarchyId: "nesting", parentRole: "parent", childRole: "child" },
      ],
    };
    expect(validateProfile(broken, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "profiles.hierfam@2.constraints[0]",
        message:
          "hierarchy constraint names relation type missing, which does not declare hierarchy nesting with roles parent/child",
        refs: [],
        details: { check: "hierarchy-constraint-invalid", relationType: "missing", hierarchyId: "nesting" },
      },
    ]);
  });

  it("declares hierarchy(contains, containment, parent, child) on generic@2", () => {
    expect(generic2Profile.constraints).toContainEqual({
      kind: "hierarchy",
      relationType: "contains",
      hierarchyId: "containment",
      parentRole: "parent",
      childRole: "child",
    });
  });
});

describe("finding 3: verified executor-profile-bindings", () => {
  function orphanKeyDocument(): SemanticDocument {
    const document = validGeneric2Document();
    const relations = { ...document.relations };
    delete relations["relation:lk1"];
    return { ...document, entities: { ...document.entities }, relations };
  }

  it("refuses a @2 run with no bindings row instead of silently running legacy", () => {
    expect(validateDocument(orphanKeyDocument(), { registry: m3ProfileRegistry })).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.generic@2",
        message: "no executor binding row selects an adapter for profile generic@2",
        details: { profile: "generic@2" },
      },
    ]);
  });

  it("rejects an explicit generic@2 to legacy row against the imposed mapping", () => {
    expect(
      verifyExecutorBindings(
        {
          schemaVersion: "1",
          rows: [bindingRowFor(generic2Profile, LEGACY_CONSTRAINTS_ADAPTER)],
        },
        m3ProfileRegistry,
      ),
    ).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.rows[0]",
        message: "executor binding for generic@2 must use scoped-constraints@1, not legacy-constraints@1",
        refs: [],
        details: { profile: "generic@2" },
      },
    ]);
  });

  it("executes @2 through the shipped embedded table with verified rows", () => {
    expect(
      validateDocument(orphanKeyDocument(), { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
    ).toEqual([
      {
        code: "legend-key-parent-invalid",
        severity: "error",
        path: "entities.entity:k1",
        message: "key entity entity:k1 has no hierarchy parent; a legend-key must be contained by a legend",
        refs: ["entity:k1"],
        details: { childType: "legend-key", parentType: "none", constraint: "required-parent" },
      },
    ]);
  });
});

describe("finding 4: the resolver cache is keyed by exact profile context", () => {
  const shape = (container: boolean): Profile => ({
    id: "dup@2",
    name: "dup",
    version: 2,
    completeness: "complete",
    entityTypes: [
      container
        ? { id: "t", label: "T", container: true, attributes: [] }
        : { id: "t", label: "T", attributes: [] },
    ],
    portTypes: [],
    relationTypes: [],
    constraints: [],
    limits: {},
    notes: [],
  });

  it("never shares an entry between two same-id profiles with different bytes", () => {
    const resolver = createTypeResolver(baseDocument(["dup@2"]));
    const first = resolver.resolve(shape(true), "t");
    expect(first.ok).toBe(true);
    const second = resolver.resolve(shape(false), "t");
    expect(second).not.toBe(first);
    if (!second.ok) throw new Error("unreachable");
    expect(second.resolved.container).toBe(false);
  });
});

describe("finding 5: generic@2.contains refuses foreign-owner endpoints", () => {
  it("reports endpoint-without-join for a generic@1 child and leaves legacy alone", () => {
    const registry = createProfileRegistry([genericProfile, generic2Profile]);
    const bindings = {
      schemaVersion: "1" as const,
      rows: [
        bindingRowFor(genericProfile, LEGACY_CONSTRAINTS_ADAPTER),
        bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER),
      ],
    };
    const document: SemanticDocument = {
      ...baseDocument(["generic@2", "generic@1"]),
      entities: {
        "entity:c": ent("c", "generic@2", "container", { name: text("C") }),
        "entity:n1": ent("n1", "generic@1", "node", { name: text("N1") }),
      },
      relations: {
        "relation:x": rel("x", "generic@2", "contains", [
          { role: "parent", target: "entity:c" },
          { role: "child", target: "entity:n1" },
        ]),
      },
    };
    expect(validateDocument(document, { registry, bindings })).toEqual([
      {
        code: "endpoint-without-join",
        severity: "error",
        path: "relations.relation:x.endpoints[1].target",
        message:
          "relation relation:x applies generic@2 contains to entity entity:n1 owned by profile generic@1 with no admitted semantic join",
        refs: ["entity:n1"],
        details: { profile: "generic@2", targetProfile: "generic@1" },
      },
    ]);
  });
});

describe("finding 6: K6 validates against the resolved effective schema", () => {
  const structProfile: Profile = {
    id: "structinh@2",
    name: "structinh",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "base-struct",
        label: "Base",
        abstract: true,
        attributes: [{ name: "lower", kind: "quantity", required: true, units: ["unit"] }],
      },
      {
        id: "derived-struct",
        label: "Derived",
        abstract: true,
        supertypes: ["base-struct"],
        attributes: [{ name: "note", kind: "text", maxLength: 20 }],
      },
      {
        id: "holder",
        label: "Holder",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 200 },
          { name: "box", kind: "struct", targetTypes: ["derived-struct"] },
        ],
      },
    ],
    portTypes: [],
    relationTypes: [],
    constraints: [],
    limits: {},
    notes: [],
  };
  const options = scopedOptions([structProfile]);

  function holderDocument(fields: Record<string, never> | Record<string, ReturnType<typeof quantity>>): SemanticDocument {
    return {
      ...baseDocument(["structinh@2"]),
      entities: {
        "entity:h": ent("h", "structinh@2", "holder", {
          name: text("H"),
          box: structValue("derived-struct", fields),
        }),
      },
    };
  }

  it("requires an inherited field the direct declaration does not name", () => {
    expect(validateDocument(holderDocument({}), options)).toEqual([
      {
        code: "attribute-required-missing",
        severity: "error",
        path: "entities.entity:h.attributes.box.fields.lower",
        message: "attribute lower is required by the schema",
        details: { attribute: "lower" },
      },
    ]);
  });

  it("accepts the inherited field instead of reporting it as unknown", () => {
    expect(validateDocument(holderDocument({ lower: quantity(1, "unit") }), options)).toEqual([]);
  });
});

describe("finding 7: bound-pair recurses into nested K6 values", () => {
  const nestedProfile: Profile = {
    id: "nested@2",
    name: "nested",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "rng",
        label: "Range",
        abstract: true,
        attributes: [
          { name: "lower", kind: "quantity", required: true, units: ["unit"] },
          { name: "upper", kind: "quantity", required: true, units: ["unit"] },
        ],
      },
      {
        id: "wrapper",
        label: "Wrapper",
        abstract: true,
        attributes: [{ name: "inner", kind: "struct", targetTypes: ["rng"] }],
      },
      {
        id: "holder",
        label: "Holder",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 200 },
          { name: "outer", kind: "struct", targetTypes: ["wrapper"] },
        ],
      },
    ],
    portTypes: [],
    relationTypes: [],
    constraints: [
      { kind: "bound-pair", valueType: "rng", lowerField: "lower", upperField: "upper", unboundedUpper: -1 },
    ],
    limits: {},
    notes: [],
  };

  it("refuses lower above upper inside a nested struct value", () => {
    const document: SemanticDocument = {
      ...baseDocument(["nested@2"]),
      entities: {
        "entity:p": ent("p", "nested@2", "holder", {
          name: text("P"),
          outer: structValue("wrapper", {
            inner: structValue("rng", { lower: quantity(3, "unit"), upper: quantity(2, "unit") }),
          }),
        }),
      },
    };
    expect(validateDocument(document, scopedOptions([nestedProfile]))).toEqual([
      {
        code: "multiplicity-invalid",
        severity: "error",
        path: "entities.entity:p.attributes.outer.fields.inner",
        message: "multiplicity lower 3 exceeds finite upper 2",
        refs: [],
        details: { lower: 3, upper: 2, constraint: "bound-pair" },
      },
    ]);
  });
});

describe("finding 8: the matrix skips unresolvable endpoints", () => {
  const matrixProfile: Profile = {
    id: "matrixskip@2",
    name: "matrixskip",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "a",
        label: "A",
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
      },
      {
        id: "b",
        label: "B",
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
      },
    ],
    portTypes: [],
    relationTypes: [
      {
        id: "link",
        label: "Link",
        direction: "directed",
        roles: [
          { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
          { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
        ],
      },
    ],
    constraints: [
      {
        kind: "relationship-matrix",
        matrixId: "m",
        sourceRole: "source",
        targetRole: "target",
        tuples: [{ relationType: "link", sourceType: "a", targetType: "b" }],
      },
    ],
    limits: {},
    notes: [],
  };

  it("keeps the resolution diagnostic and emits no matrix comparison", () => {
    const document: SemanticDocument = {
      ...baseDocument(["matrixskip@2"]),
      entities: {
        "entity:e": ent("e", "matrixskip@2", "ghost", { name: text("E") }),
        "entity:ok": ent("ok", "matrixskip@2", "b", { name: text("Ok") }),
      },
      relations: {
        "relation:r": rel("r", "matrixskip@2", "link", [
          { role: "source", target: "entity:e" },
          { role: "target", target: "entity:ok" },
        ]),
      },
    };
    expect(validateDocument(document, scopedOptions([matrixProfile]))).toEqual([
      {
        code: "unknown-entity-type",
        severity: "error",
        path: "entities.entity:e.type",
        message: "neither profile matrixskip@2 nor the document declares entity type ghost",
        details: { type: "ghost", profile: "matrixskip@2" },
      },
    ]);
  });
});

describe("finding 9: collection item schemas qualify recursively", () => {
  it("refuses invalid item grammars and bounds at qualification", () => {
    const profile: Profile = {
      id: "collqual@2",
      name: "collqual",
      version: 2,
      completeness: "complete",
      entityTypes: [
        {
          id: "thing",
          label: "Thing",
          attributes: [
            {
              name: "code",
              kind: "collection",
              item: { kind: "text", pattern: "[", patternName: "key" },
              maxItems: 4,
            },
            {
              name: "count",
              kind: "collection",
              item: { kind: "quantity", units: ["unit"], min: 10, max: 5 },
              maxItems: 4,
            },
          ],
        },
      ],
      portTypes: [],
      relationTypes: [],
      constraints: [],
      limits: {},
      notes: [],
    };
    expect(validateProfile(profile, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "profiles.collqual@2.entityTypes[0].attributes[0].item",
        message: "text schema for code has an invalid pattern or length bounds",
        refs: [],
        details: { check: "text-pattern-invalid", attribute: "code" },
      },
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "profiles.collqual@2.entityTypes[0].attributes[1].item",
        message: "quantity schema for count has invalid numeric bounds",
        refs: [],
        details: { check: "numeric-constraint-invalid", attribute: "count" },
      },
    ]);
  });
});

describe("finding 10: K1 invalid resolution suppresses descendants and aligns cycles", () => {
  function cycleProfile(): Profile {
    const pair = (id: string, supertypes: readonly string[]): Profile["entityTypes"][number] => ({
      id,
      label: id,
      supertypes,
      attributes: [],
    });
    return {
      id: "cycle@2",
      name: "cycle",
      version: 2,
      completeness: "complete",
      entityTypes: [pair("a", ["b"]), pair("b", ["a"])],
      portTypes: [],
      relationTypes: [],
      constraints: [],
      limits: {},
      notes: [],
    };
  }

  function unknownProfile(): Profile {
    return {
      id: "broken@2",
      name: "broken",
      version: 2,
      completeness: "complete",
      entityTypes: [
        {
          id: "a",
          label: "A",
          supertypes: ["missing"],
          attributes: [{ name: "f", kind: "text", maxLength: 10 }],
        },
        {
          id: "b",
          label: "B",
          supertypes: ["a"],
          attributes: [{ name: "f", kind: "text", maxLength: 20 }],
        },
      ],
      portTypes: [],
      relationTypes: [],
      constraints: [],
      limits: {},
      notes: [],
    };
  }

  it("reports a two-cycle once, with path, message and details on the same type", () => {
    expect(validateProfile(cycleProfile(), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "supertype-cycle",
        severity: "error",
        path: "profiles.cycle@2.entityTypes.b.supertypes",
        message: "supertype chain for b is cyclic",
        refs: [],
        details: { type: "b" },
      },
    ]);
  });

  it("reports an unknown parent once and suppresses the descendant conflict", () => {
    expect(validateProfile(unknownProfile(), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "supertype-unknown",
        severity: "error",
        path: "profiles.broken@2.entityTypes.a.supertypes[0]",
        message: "supertype missing is not declared",
        refs: [],
        details: { supertype: "missing" },
      },
    ]);
  });
});
