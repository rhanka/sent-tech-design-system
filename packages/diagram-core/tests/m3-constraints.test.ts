/**
 * M3 §5.4 — the closed `AddedConstraint` union as generic mechanisms.
 *
 * Hierarchy, parent-family, children-restricted, required-parent, the
 * relationship-matrix tuple check, bound-pair, reference-application,
 * incident-type-uniformity, at-most-value and collection-unique are exercised
 * on synthetic families. Renaming legend/key/category/hierarchy to
 * palette/swatch/code/nesting with the same constraints gives identical
 * outcomes after nominal renaming; removing a constraint removes exactly its
 * check.
 */
import { describe, expect, it } from "vitest";

import {
  collection,
  enumeration,
  quantity,
  reference,
  structValue,
  text,
  validateDocument,
  validateProfile,
  SCOPED_CONSTRAINTS_ADAPTER,
  type Entity,
  type Profile,
  type Relation,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions, validGeneric2Document } from "./m3-helpers.js";
import { generic2Profile } from "../src/index.js";

/** A legend-shaped family with renamable ids. */
function familyProfile(names: {
  id: string;
  container: string;
  key: string;
  category: string;
  hierarchy: string;
}): Profile {
  return {
    id: names.id as never,
    name: names.id,
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: names.container,
        label: names.container,
        container: true,
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
      },
      {
        id: names.key,
        label: names.key,
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 120 },
          {
            name: names.category,
            kind: "text",
            required: true,
            minLength: 1,
            maxLength: 40,
            pattern: "^[a-z][a-z0-9-]*$",
            patternName: "key",
          },
        ],
      },
      {
        id: "node",
        label: "Node",
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
        hierarchy: { id: names.hierarchy, shape: "tree", parentRole: "parent", childRole: "child" },
      },
    ],
    constraints: [
      { kind: "parent-family", hierarchyId: names.hierarchy, familyRoots: [names.container] },
      {
        kind: "children-restricted",
        parentFamilyRoots: [names.container],
        childTypes: [names.key],
        hierarchyId: names.hierarchy,
      },
      {
        kind: "required-parent",
        childTypes: [names.key],
        parentFamilyRoots: [names.container],
        hierarchyId: names.hierarchy,
      },
      { kind: "acyclic-hierarchy", hierarchyId: names.hierarchy },
      { kind: "unique-attribute", entityType: names.key, attribute: names.category, scope: { withinType: names.container } },
    ],
    limits: {},
    notes: [],
  };
}

const legendFamily = familyProfile({
  id: "legendfam@2",
  container: "legend",
  key: "legend-key",
  category: "category",
  hierarchy: "containment",
});
const paletteFamily = familyProfile({
  id: "palettefam@2",
  container: "palette",
  key: "swatch",
  category: "code",
  hierarchy: "nesting",
});

/** The full-violation scene in the vocabulary of one family. */
function violationDocument(profileId: string, names: { container: string; key: string; category: string }): SemanticDocument {
  const entities: Record<string, Entity> = {
    "entity:l": ent("l", profileId as never, names.container, { name: text("L") }),
    // Wrong child: a node held by the legend container.
    "entity:n": ent("n", profileId as never, "node", { name: text("N") }),
    // Key under a wrong parent (a node parents it).
    "entity:k": ent("k", profileId as never, names.key, { name: text("K"), [names.category]: text("risk") } as never),
    // Orphan key.
    "entity:o": ent("o", profileId as never, names.key, { name: text("O"), [names.category]: text("solo") } as never),
    // Duplicate category under the same container.
    "entity:k1": ent("k1", profileId as never, names.key, { name: text("K1"), [names.category]: text("risk") } as never),
    "entity:k2": ent("k2", profileId as never, names.key, { name: text("K2"), [names.category]: text("risk") } as never),
    "entity:p": ent("p", profileId as never, "node", { name: text("P") }),
  };
  const relations: Record<string, Relation> = {
    "relation:ln": rel("ln", profileId as never, "holds", [
      { role: "parent", target: "entity:l" },
      { role: "child", target: "entity:n" },
    ]),
    "relation:pk": rel("pk", profileId as never, "holds", [
      { role: "parent", target: "entity:p" },
      { role: "child", target: "entity:k" },
    ]),
    "relation:lk1": rel("lk1", profileId as never, "holds", [
      { role: "parent", target: "entity:l" },
      { role: "child", target: "entity:k1" },
    ]),
    "relation:lk2": rel("lk2", profileId as never, "holds", [
      { role: "parent", target: "entity:l" },
      { role: "child", target: "entity:k2" },
    ]),
  };
  return { ...baseDocument([profileId as never]), entities, relations };
}

/**
 * Nominal substitution for the rename witness: profile, type, attribute and
 * hierarchy names are renamed, while the fixed arm wording (`key entity`,
 * the `legend-key-parent-invalid` code) is preserved byte-for-byte.
 */
function renameForPalette(diagnostics: readonly { [key: string]: unknown }[]): unknown[] {
  const code = "\u0000code\u0000";
  const keyed = "\u0000keyed\u0000";
  return JSON.parse(
    JSON.stringify(diagnostics)
      .split("legend-key-parent-invalid")
      .join(code)
      .split("key entity")
      .join(keyed)
      .split("legend-key")
      .join("swatch")
      .split("legend")
      .join("palette")
      .split("category")
      .join("code")
      .split("containment")
      .join("nesting")
      .split(code)
      .join("legend-key-parent-invalid")
      .split(keyed)
      .join("key entity"),
  ) as unknown[];
}

describe("synthetic rename witnesses", () => {
  it("renaming legend/key/category/hierarchy gives identical outcomes after nominal renaming", () => {
    const legendDiagnostics = validateDocument(
      violationDocument("legendfam@2", { container: "legend", key: "legend-key", category: "category" }),
      scopedOptions([legendFamily]),
    );
    const paletteDiagnostics = validateDocument(
      violationDocument("palettefam@2", { container: "palette", key: "swatch", category: "code" }),
      scopedOptions([paletteFamily]),
    );
    expect(legendDiagnostics.length).toBeGreaterThan(0);
    expect(paletteDiagnostics).toEqual(renameForPalette(legendDiagnostics as never));
  });

  it("removing a constraint removes exactly its check", () => {
    const full = validateDocument(
      violationDocument("palettefam@2", { container: "palette", key: "swatch", category: "code" }),
      scopedOptions([paletteFamily]),
    );
    const kinds = ["parent-family", "children-restricted", "required-parent", "unique-attribute"] as const;
    const codesOf = (constraint: (typeof kinds)[number]): readonly string[] =>
      validateDocument(
        violationDocument("palettefam@2", { container: "palette", key: "swatch", category: "code" }),
        scopedOptions([
          { ...paletteFamily, constraints: paletteFamily.constraints.filter((entry) => entry.kind !== constraint) },
        ]),
      ).map((entry) => `${entry.code}@${entry.path}`);
    const fullCodes = full.map((entry) => `${entry.code}@${entry.path}`);
    // The wrong-child check lives in children-restricted; the orphan and
    // wrong-parent checks in required-parent; duplicates in unique-attribute.
    expect(codesOf("children-restricted")).toEqual(
      fullCodes.filter((code) => !code.startsWith("legend-key-parent-invalid@entities.entity:n")),
    );
    expect(codesOf("unique-attribute")).toEqual(
      fullCodes.filter((code) => !code.startsWith("unique-attribute-violation")),
    );
    // Required-parent owns the key-under-node and the orphan diagnostics; the
    // node-under-legend check stays with children-restricted, the non-family
    // parenting with parent-family, and the duplicate with unique-attribute.
    expect(codesOf("required-parent")).toEqual([
      "endpoint-target-not-allowed@relations.relation:pk.endpoints[0].target",
      "legend-key-parent-invalid@entities.entity:n",
      "unique-attribute-violation@entities.entity:k2.attributes.code",
    ]);
  });
});

describe("legend arms on generic@2", () => {
  const options = scopedOptions([generic2Profile]);

  it("refuses a node held by a legend with the exact wrong-child object", () => {
    const document = validGeneric2Document();
    const broken: SemanticDocument = {
      ...document,
      relations: {
        ...document.relations,
        "relation:ln": rel("ln", "generic@2", "contains", [
          { role: "parent", target: "entity:l" },
          { role: "child", target: "entity:n" },
        ]),
      },
    };
    const { "relation:cn": _dropped, ...relations } = broken.relations;
    void _dropped;
    expect(validateDocument({ ...broken, relations }, options)).toEqual([
      {
        code: "legend-key-parent-invalid",
        severity: "error",
        path: "entities.entity:n",
        message: "key entity entity:n is contained by legend entity:l; only legend-key entities may be contained by a legend",
        refs: ["entity:n", "entity:l"],
        details: { childType: "node", parentType: "legend", constraint: "children-restricted" },
      },
    ]);
  });

  it("refuses a key under a wrong parent with the exact object", () => {
    const document = validGeneric2Document();
    const broken: SemanticDocument = {
      ...document,
      relations: {
        ...document.relations,
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:c" },
          { role: "child", target: "entity:k1" },
        ]),
      },
    };
    const { "relation:lk1": _dropped, ...relations } = broken.relations;
    void _dropped;
    expect(validateDocument({ ...broken, relations }, options)).toEqual([
      {
        code: "legend-key-parent-invalid",
        severity: "error",
        path: "entities.entity:k1",
        message:
          "key entity entity:k1 is contained by entity:c, which is outside the legend family; a legend-key must be contained by a legend",
        refs: ["entity:k1", "entity:c"],
        details: { childType: "legend-key", parentType: "container", constraint: "required-parent" },
      },
    ]);
  });

  it("refuses an orphan key with the exact object", () => {
    const document = validGeneric2Document();
    const { "relation:lk2": _dropped, ...relations } = document.relations;
    void _dropped;
    expect(validateDocument({ ...document, relations }, options)).toEqual([
      {
        code: "legend-key-parent-invalid",
        severity: "error",
        path: "entities.entity:k2",
        message: "key entity entity:k2 has no hierarchy parent; a legend-key must be contained by a legend",
        refs: ["entity:k2"],
        details: { childType: "legend-key", parentType: "none", constraint: "required-parent" },
      },
    ]);
  });

  it("refuses a non-family parent through parent-family with the native type arm", () => {
    const document = validGeneric2Document();
    const child = ent("m", "generic@2", "node", { name: text("M") });
    const broken: SemanticDocument = {
      ...document,
      entities: { ...document.entities, "entity:m": child },
      relations: {
        ...document.relations,
        "relation:nm": rel("nm", "generic@2", "contains", [
          { role: "parent", target: "entity:n" },
          { role: "child", target: "entity:m" },
        ]),
      },
    };
    const expected = validateDocument(broken, options);
    expect(expected).toEqual([
      {
        code: "endpoint-target-not-allowed",
        severity: "error",
        path: "relations.relation:nm.endpoints[0].target",
        message: "role parent accepts entity types container, legend; entity:n is a node",
        refs: ["entity:n"],
        details: { seenType: "node", allowed: "container,legend" },
      },
    ]);
  });
});

describe("bound-pair, reference-application and incident checks", () => {
  const rangeProfile: Profile = {
    id: "ranges@2",
    name: "ranges",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "rng",
        label: "Range",
        abstract: true,
        attributes: [
          { name: "lower", kind: "quantity", required: true, units: ["unit"], integer: true, min: 0, max: 9007199254740991 },
          { name: "upper", kind: "quantity", required: true, units: ["unit"], integer: true, min: -1, max: 9007199254740991 },
        ],
      },
      {
        id: "holder",
        label: "Holder",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 200 },
          { name: "multiplicity", kind: "struct", targetTypes: ["rng"] },
        ],
      },
      {
        id: "badge",
        label: "Badge",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 60 },
          {
            name: "extends",
            kind: "collection",
            required: true,
            item: { kind: "enum", values: ["member", "team"] },
            minItems: 1,
            maxItems: 5,
          },
        ],
      },
      {
        id: "member",
        label: "Member",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 200 },
          { name: "badges", kind: "collection", item: { kind: "reference", refKind: "entity", targetTypes: ["badge"] }, maxItems: 8 },
        ],
      },
      { id: "team", label: "Team", attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }] },
      { id: "hub", label: "Hub", attributes: [{ name: "name", kind: "text", maxLength: 200 }] },
    ],
    portTypes: [],
    relationTypes: [
      {
        id: "flow",
        label: "Flow",
        direction: "directed",
        roles: [
          { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
          { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
        ],
      },
      {
        id: "triggering",
        label: "Triggering",
        direction: "directed",
        roles: [
          { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
          { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
        ],
        attributes: [
          { name: "sourceAggregation", kind: "enum", values: ["none", "shared", "composite"] },
          { name: "targetAggregation", kind: "enum", values: ["none", "shared", "composite"] },
        ],
      },
    ],
    constraints: [
      { kind: "bound-pair", valueType: "rng", lowerField: "lower", upperField: "upper", unboundedUpper: -1 },
      { kind: "reference-application", attribute: "badges", declarationType: "badge", allowedTypesField: "extends" },
      { kind: "incident-type-uniformity", matrixId: "archimate-3.2", entityType: "hub", relationTypes: ["flow", "triggering"] },
      { kind: "at-most-value", relationType: "triggering", attributes: ["sourceAggregation", "targetAggregation"], value: "composite", max: 1 },
    ],
    limits: {},
    notes: [],
  };
  const options = scopedOptions([rangeProfile]);

  function multiplicityValue(lower: number, upper: number): ReturnType<typeof structValue> {
    return structValue("rng", {
      lower: quantity(lower, "unit"),
      upper: quantity(upper, "unit"),
    }) as ReturnType<typeof structValue>;
  }

  function rangeDocument(lower: number, upper: number): SemanticDocument {
    return {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:p": ent("p", "ranges@2", "holder", { name: text("P"), multiplicity: multiplicityValue(lower, upper) }),
      },
    };
  }

  it("refuses a finite upper below the lower with the exact bound-pair object", () => {
    expect(validateDocument(rangeDocument(3, 2), options)).toEqual([
      {
        code: "multiplicity-invalid",
        severity: "error",
        path: "entities.entity:p.attributes.multiplicity",
        message: "multiplicity lower 3 exceeds finite upper 2",
        refs: [],
        details: { lower: 3, upper: 2, constraint: "bound-pair" },
      },
    ]);
  });

  it("accepts equal bounds and the unbounded sentinel", () => {
    expect(validateDocument(rangeDocument(1, 1), options)).toEqual([]);
    expect(validateDocument(rangeDocument(0, -1), options)).toEqual([]);
  });

  it("emits the scalar diagnostic first and never duplicates it with a bound failure", () => {
    const broken: SemanticDocument = {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:p": ent("p", "ranges@2", "holder", {
          name: text("P"),
          multiplicity: structValue("rng", { lower: quantity(0.5, "unit"), upper: quantity(2, "unit") }),
        }),
      },
    };
    expect(validateDocument(broken, options)).toEqual([
      {
        code: "quantity-not-integer",
        severity: "error",
        path: "entities.entity:p.attributes.multiplicity.fields.lower",
        message: "value 0.5 is not an integer",
        refs: [],
        details: { value: 0.5, integer: "required" },
      },
    ]);
  });

  it("refuses an inapplicable stereotype with the exact application object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:s": ent("s", "ranges@2", "badge", {
          name: text("S"),
          extends: collection([{ kind: "enum", value: "team" }]),
        }),
        "entity:i": ent("i", "ranges@2", "member", {
          name: text("I"),
          badges: collection([{ kind: "reference", value: "entity:s" }]),
        }),
      },
    };
    expect(validateDocument(document, options)).toEqual([
      {
        code: "stereotype-application-invalid",
        severity: "error",
        path: "entities.entity:i.attributes.badges[0]",
        message: "stereotype entity:s cannot be applied to type member",
        refs: ["entity:i", "entity:s"],
        details: { attribute: "badges", targetType: "member", allowed: "team" },
      },
    ]);
  });

  it("refuses a reference whose target type is outside the K2 set", () => {
    const document: SemanticDocument = {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:c": ent("c", "ranges@2", "team", { name: text("C") }),
        "entity:i": ent("i", "ranges@2", "member", {
          name: text("I"),
          badges: collection([{ kind: "reference", value: "entity:c" }]),
        }),
      },
    };
    expect(validateDocument(document, options)).toEqual([
      {
        code: "reference-target-type",
        severity: "error",
        path: "entities.entity:i.attributes.badges[0]",
        message: "reference target entity:c has type team; allowed types are badge",
        refs: ["entity:c"],
        details: { seenType: "team", allowed: "badge" },
      },
    ]);
  });

  it("accepts an applicable stereotype", () => {
    const document: SemanticDocument = {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:s": ent("s", "ranges@2", "badge", {
          name: text("S"),
          extends: collection([{ kind: "enum", value: "member" }]),
        }),
        "entity:i": ent("i", "ranges@2", "member", {
          name: text("I"),
          badges: collection([{ kind: "reference", value: "entity:s" }]),
        }),
      },
    };
    expect(validateDocument(document, options)).toEqual([]);
  });

  it("refuses mixed incident relation types with the exact junction object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:junction": ent("junction", "ranges@2", "hub", { name: text("J") }),
        "entity:a": ent("a", "ranges@2", "team", { name: text("A") }),
        "entity:b": ent("b", "ranges@2", "team", { name: text("B") }),
      },
      relations: {
        "relation:flow": rel("flow", "ranges@2", "flow", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:junction" },
        ]),
        "relation:serving": rel("serving", "ranges@2", "triggering", [
          { role: "source", target: "entity:junction" },
          { role: "target", target: "entity:b" },
        ]),
      },
    };
    expect(validateDocument(document, options)).toEqual([
      {
        code: "relationship-matrix-violation",
        severity: "error",
        path: "entities.entity:junction",
        message: "junction entity:junction connects incompatible relation types flow, triggering",
        refs: ["entity:junction", "relation:flow", "relation:serving"],
        details: { matrixId: "archimate-3.2", constraint: "incident-type-uniformity", relationTypes: "flow,triggering" },
      },
    ]);
  });

  it("refuses two composite ends with the exact at-most object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["ranges@2"]),
      entities: {
        "entity:a": ent("a", "ranges@2", "team", { name: text("A") }),
        "entity:b": ent("b", "ranges@2", "team", { name: text("B") }),
      },
      relations: {
        "relation:order-customer": rel(
          "order-customer",
          "ranges@2",
          "triggering",
          [
            { role: "source", target: "entity:a" },
            { role: "target", target: "entity:b" },
          ],
          {
            sourceAggregation: enumeration("composite"),
            targetAggregation: enumeration("composite"),
          },
        ),
      },
    };
    expect(validateDocument(document, options)).toEqual([
      {
        code: "multiplicity-invalid",
        severity: "error",
        path: "relations.relation:order-customer.attributes",
        message: "relation relation:order-customer has 2 composite ends; at most 1 is allowed",
        refs: ["relation:order-customer"],
        details: { count: 2, max: 1, constraint: "at-most-value" },
      },
    ]);
  });
});

describe("collection-unique", () => {
  const uniqueProfile: Profile = {
    id: "unique@2",
    name: "unique",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "stereotype",
        label: "Stereotype",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 60 },
          {
            name: "extends",
            kind: "collection",
            required: true,
            item: { kind: "enum", values: ["class", "interface"] },
            minItems: 1,
            maxItems: 5,
          },
        ],
      },
    ],
    portTypes: [],
    relationTypes: [],
    constraints: [{ kind: "collection-unique", entityType: "stereotype", attribute: "extends" }],
    limits: {},
    notes: [],
  };
  const options = scopedOptions([uniqueProfile]);

  it("refuses a duplicate typed item with the exact object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["unique@2"]),
      entities: {
        "entity:order": ent("order", "unique@2", "stereotype", {
          name: text("Order"),
          extends: collection([
            { kind: "enum", value: "class" },
            { kind: "enum", value: "class" },
          ]),
        }),
      },
    };
    expect(validateDocument(document, options)).toEqual([
      {
        code: "collection-bound-exceeded",
        severity: "error",
        path: "entities.entity:order.attributes.extends[1]",
        message: "collection extends repeats item 1; first occurrence is 0",
        refs: [],
        details: { constraint: "collection-unique", firstIndex: 0, duplicateIndex: 1 },
      },
    ]);
  });

  it("accepts distinct items", () => {
    const document: SemanticDocument = {
      ...baseDocument(["unique@2"]),
      entities: {
        "entity:order": ent("order", "unique@2", "stereotype", {
          name: text("Order"),
          extends: collection([
            { kind: "enum", value: "class" },
            { kind: "enum", value: "interface" },
          ]),
        }),
      },
    };
    expect(validateDocument(document, options)).toEqual([]);
  });
});

describe("K1 declaration arms and structured values on synthetic profiles", () => {
  const kernelProfile: Profile = {
    id: "synthetic@2",
    name: "synthetic",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "multiplicity",
        label: "Multiplicity",
        abstract: true,
        attributes: [
          { name: "lower", kind: "quantity", required: true, units: ["unit"], integer: true, min: 0, max: 9007199254740991 },
          { name: "upper", kind: "quantity", required: true, units: ["unit"], integer: true, min: -1, max: 9007199254740991 },
        ],
      },
      {
        id: "property",
        label: "Property",
        attributes: [
          { name: "name", kind: "text", required: true, maxLength: 200 },
          { name: "multiplicity", kind: "struct", targetTypes: ["multiplicity"] },
        ],
      },
    ],
    portTypes: [],
    relationTypes: [],
    constraints: [],
    limits: {},
    notes: [],
  };
  const withClass = (supertypes: readonly string[]): Profile => ({
    ...kernelProfile,
    entityTypes: [
      ...kernelProfile.entityTypes,
      {
        id: "class",
        label: "Class",
        supertypes,
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
      },
    ],
  });

  it("refuses an unknown supertype with the parallel literal", () => {
    expect(validateProfile(withClass(["missing"]), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "supertype-unknown",
        severity: "error",
        path: "profiles.synthetic@2.entityTypes.class.supertypes[0]",
        message: "supertype missing is not declared",
        refs: [],
        details: { supertype: "missing" },
      },
    ]);
  });

  it("refuses a supertype cycle with the parallel literal", () => {
    expect(validateProfile(withClass(["class"]), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "supertype-cycle",
        severity: "error",
        path: "profiles.synthetic@2.entityTypes.class.supertypes",
        message: "supertype chain for class is cyclic",
        refs: [],
        details: { type: "class" },
      },
    ]);
  });

  it("refuses an inherited attribute conflict with the parallel literal", () => {
    const conflict: Profile = {
      ...kernelProfile,
      entityTypes: [
        { id: "interface", label: "Interface", attributes: [{ name: "name", kind: "text", maxLength: 100 }] },
        { id: "package", label: "Package", attributes: [{ name: "name", kind: "text", maxLength: 200 }] },
        {
          id: "class",
          label: "Class",
          supertypes: ["interface", "package"],
          attributes: [],
        },
        ...kernelProfile.entityTypes.filter((type) => type.id === "multiplicity" || type.id === "property"),
      ],
    };
    const diagnostics = validateProfile(conflict, SCOPED_CONSTRAINTS_ADAPTER);
    expect(diagnostics).toEqual([
      {
        code: "attribute-conflict",
        severity: "error",
        path: "profiles.synthetic@2.entityTypes.class.attributes.name",
        message: "inherited attribute name has incompatible schemas on class",
        refs: [],
        details: { attribute: "name", type: "class" },
      },
    ]);
  });

  it("refuses an abstract instantiation with the exact object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["synthetic@2"]),
      entities: { "entity:order": ent("order", "synthetic@2", "multiplicity") },
    };
    const options = scopedOptions([kernelProfile]);
    expect(validateDocument(document, options)).toEqual([
      {
        code: "abstract-instantiated",
        severity: "error",
        path: "entities.entity:order.type",
        message: "abstract type multiplicity cannot be instantiated as an entity",
        refs: ["entity:order"],
        details: { type: "multiplicity" },
      },
    ]);
  });

  it("refuses an unknown structured type with the exact object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["synthetic@2"]),
      entities: {
        "entity:p": ent("p", "synthetic@2", "property", {
          name: text("P"),
          multiplicity: structValue("unknown-value", {}),
        }),
      },
    };
    expect(validateDocument(document, scopedOptions([kernelProfile]))).toEqual([
      {
        code: "struct-type-unknown",
        severity: "error",
        path: "entities.entity:p.attributes.multiplicity",
        message: "structured value type unknown-value is not declared",
        refs: [],
        details: { type: "unknown-value" },
      },
    ]);
  });

  it("refuses an unknown struct field with the exact object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["synthetic@2"]),
      entities: {
        "entity:p": ent("p", "synthetic@2", "property", {
          name: text("P"),
          multiplicity: structValue("multiplicity", {
            lower: quantity(0, "unit"),
            upper: quantity(-1, "unit"),
            ceiling: quantity(1, "unit"),
          }),
        }),
      },
    };
    expect(validateDocument(document, scopedOptions([kernelProfile]))).toEqual([
      {
        code: "struct-field-not-in-schema",
        severity: "error",
        path: "entities.entity:p.attributes.multiplicity.fields.ceiling",
        message: "field ceiling is not declared by structured type multiplicity",
        refs: [],
        details: { type: "multiplicity", field: "ceiling" },
      },
    ]);
  });

  it("refuses a forbidden structured type with the exact object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["synthetic@2"]),
      entities: {
        "entity:p": ent("p", "synthetic@2", "property", {
          name: text("P"),
          multiplicity: structValue("other-value", {}),
        }),
      },
    };
    const profile: Profile = {
      ...kernelProfile,
      entityTypes: [
        ...kernelProfile.entityTypes,
        { id: "other-value", label: "Other", attributes: [] },
      ],
    };
    expect(validateDocument(document, scopedOptions([profile]))).toEqual([
      {
        code: "struct-type-not-allowed",
        severity: "error",
        path: "entities.entity:p.attributes.multiplicity",
        message: "structured type other-value is not allowed here; allowed types are multiplicity",
        refs: [],
        details: { type: "other-value", allowed: "multiplicity" },
      },
    ]);
  });
});

describe("miscellaneous declaration arms", () => {
  it("refuses an abstract container with the parallel literal", () => {
    const profile: Profile = {
      id: "synthetic@2",
      name: "synthetic",
      version: 2,
      completeness: "complete",
      entityTypes: [{ id: "root", label: "Root", abstract: true, container: true, attributes: [] }],
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
        path: "profiles.synthetic@2.entityTypes[0]",
        message: "abstract type root cannot declare container capability",
        refs: [],
        details: { check: "abstract-container", type: "root" },
      },
    ]);
  });

  it("refuses an invalid matrix declaration with the parallel literal", () => {
    const profile: Profile = {
      id: "synthetic@2",
      name: "synthetic",
      version: 2,
      completeness: "complete",
      entityTypes: [{ id: "a", label: "A", attributes: [] }],
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
          matrixId: "synthetic-matrix",
          sourceRole: "source",
          targetRole: "target",
          tuples: [
            { relationType: "link", sourceType: "a", targetType: "a" },
            { relationType: "link", sourceType: "a", targetType: "a" },
          ],
        },
      ],
      limits: {},
      notes: [],
    };
    expect(validateProfile(profile, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "profiles.synthetic@2.constraints[0]",
        message: "relationship matrix synthetic-matrix has an invalid or duplicate tuple",
        refs: [],
        details: { check: "matrix-constraint-invalid", matrixId: "synthetic-matrix" },
      },
    ]);
  });

  it("refuses a native redeclaration with the exact object and absent refs", () => {
    const document: SemanticDocument = {
      ...baseDocument(["generic@2"]),
      typeDefinitions: {
        refined: {
          id: "refined",
          profile: "generic@2",
          baseType: "node",
          attributes: [{ name: "name", kind: "text" }],
        },
      },
    };
    const diagnostics = validateDocument(document, scopedOptions([generic2Profile]));
    expect(diagnostics).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "typeDefinitions.refined.attributes.name",
        message:
          "type definition refined redeclares name, which base type node already declares; refinements are additive only",
        details: { attribute: "name", baseType: "node" },
      },
    ]);
    expect("refs" in (diagnostics[0] as object)).toBe(false);
  });
});
