/**
 * M3 §5.3 — scoped uniqueness, with the §5.3.1 compatibility table.
 *
 * `document` / `siblings` / `{ withinType }` group effective members; the
 * first id in UTF-16 order per group is the never-reported reference (the
 * PR #193 rule retained per group). Legacy arrays keep their exact native
 * shape with no scope; the new checks add only the scalar scope detail.
 */
import { describe, expect, it } from "vitest";

import {
  GENERIC_PROFILE_ID,
  bindingRowFor,
  createProfileRegistry,
  genericProfile,
  generic2Profile,
  text,
  validateDocument,
  validateProfile,
  LEGACY_CONSTRAINTS_ADAPTER,
  SCOPED_CONSTRAINTS_ADAPTER,
  type ExecutorProfileBindings,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import {
  baseDocument,
  ent,
  legacyOptions,
  rel,
  scopedOptions,
  validGeneric2Document,
} from "./m3-helpers.js";

function containerDoc(names: Record<string, string>): SemanticDocument {
  const entities: Record<string, ReturnType<typeof ent>> = {};
  for (const [local, name] of Object.entries(names)) {
    entities[`entity:${local}`] = {
      ...ent(local, GENERIC_PROFILE_ID, "container", { name: text(name) }),
    };
  }
  return { ...baseDocument([GENERIC_PROFILE_ID]), entities };
}

describe("legacy uniqueness keeps its exact native shape", () => {
  it("reports a duplicate with refs, details without scope, and the legacy message", () => {
    const diagnostics = validateDocument(containerDoc({ c1: "Same", c2: "Same" }), legacyOptions([genericProfile]));
    expect(diagnostics).toEqual([
      {
        code: "unique-attribute-violation",
        severity: "error",
        path: "entities.entity:c2.attributes.name",
        message: "attribute name must be unique among container entities; entity:c1 carries the same value",
        refs: ["entity:c2", "entity:c1"],
        details: { attribute: "name", type: "container" },
      },
    ]);
    expect("scope" in (diagnostics[0]?.details as object)).toBe(false);
  });
});

describe("scoped uniqueness on generic@2", () => {
  const options = scopedOptions([generic2Profile]);

  it("accepts distinct categories under one legend", () => {
    expect(validateDocument(validGeneric2Document(), options)).toEqual([]);
  });

  it("refuses a duplicate category within a legend with the exact scoped object", () => {
    const document = validGeneric2Document();
    const k2 = document.entities["entity:k2"] as NonNullable<(typeof document.entities)[string]>;
    const broken: SemanticDocument = {
      ...document,
      entities: { ...document.entities, "entity:k2": { ...k2, attributes: { ...k2.attributes, category: text("risk") } } },
    };
    expect(validateDocument(broken, options)).toEqual([
      {
        code: "unique-attribute-violation",
        severity: "error",
        path: "entities.entity:k2.attributes.category",
        message:
          "attribute category must be unique among legend-key entities in scope within:legend; entity:k1 carries the same value",
        refs: ["entity:k2", "entity:k1"],
        details: { attribute: "category", type: "legend-key", scope: "within:legend" },
      },
    ]);
  });

  it("scopes by legend: the same category under two legends is valid", () => {
    const document = validGeneric2Document();
    const l2 = ent("l2", "generic@2", "legend", { name: text("L2") });
    const k3 = ent("k3", "generic@2", "legend-key", { name: text("K3"), category: text("risk") });
    const extended: SemanticDocument = {
      ...document,
      entities: { ...document.entities, "entity:l2": l2, "entity:k3": k3 },
      relations: {
        ...document.relations,
        "relation:lk3": rel("lk3", "generic@2", "contains", [
          { role: "parent", target: "entity:l2" },
          { role: "child", target: "entity:k3" },
        ]),
      },
    };
    expect(validateDocument(extended, options)).toEqual([]);
  });
});

describe("siblings scope", () => {
  const siblingsProfile: Profile = {
    id: "siblings@2",
    name: "siblings",
    version: 2,
    completeness: "complete",
    entityTypes: [
      {
        id: "team",
        label: "Team",
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 100 }],
      },
      {
        id: "member",
        label: "Member",
        attributes: [{ name: "name", kind: "text", required: true, maxLength: 100 }],
      },
    ],
    portTypes: [],
    relationTypes: [
      {
        id: "lineup",
        label: "Lineup",
        direction: "directed",
        roles: [
          { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["team"] },
          { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["member"] },
        ],
        hierarchy: { id: "lineup-tree", shape: "tree", parentRole: "parent", childRole: "child" },
      },
    ],
    constraints: [{ kind: "unique-attribute", entityType: "member", attribute: "name", scope: "siblings" }],
    limits: {},
    notes: [],
  };
  const options = scopedOptions([siblingsProfile]);

  function siblingsDocument(): SemanticDocument {
    return {
      ...baseDocument(["siblings@2"]),
      entities: {
        "entity:t1": ent("t1", "siblings@2", "team", { name: text("T1") }),
        "entity:t2": ent("t2", "siblings@2", "team", { name: text("T2") }),
        "entity:m1": ent("m1", "siblings@2", "member", { name: text("Sam") }),
        "entity:m2": ent("m2", "siblings@2", "member", { name: text("Sam") }),
        "entity:m3": ent("m3", "siblings@2", "member", { name: text("Sam") }),
        "entity:r1": ent("r1", "siblings@2", "member", { name: text("Zed") }),
        "entity:r2": ent("r2", "siblings@2", "member", { name: text("Zed") }),
      },
      relations: {
        "relation:a": rel("a", "siblings@2", "lineup", [
          { role: "parent", target: "entity:t1" },
          { role: "child", target: "entity:m1" },
        ]),
        "relation:b": rel("b", "siblings@2", "lineup", [
          { role: "parent", target: "entity:t1" },
          { role: "child", target: "entity:m2" },
        ]),
        "relation:c": rel("c", "siblings@2", "lineup", [
          { role: "parent", target: "entity:t2" },
          { role: "child", target: "entity:m3" },
        ]),
      },
    };
  }

  it("groups by parent: same name under one parent refuses, under another passes, roots share a group", () => {
    expect(validateDocument(siblingsDocument(), options)).toEqual([
      {
        code: "unique-attribute-violation",
        severity: "error",
        path: "entities.entity:m2.attributes.name",
        message:
          "attribute name must be unique among member entities in scope siblings; entity:m1 carries the same value",
        refs: ["entity:m2", "entity:m1"],
        details: { attribute: "name", type: "member", scope: "siblings" },
      },
      {
        code: "unique-attribute-violation",
        severity: "error",
        path: "entities.entity:r2.attributes.name",
        message:
          "attribute name must be unique among member entities in scope siblings; entity:r1 carries the same value",
        refs: ["entity:r2", "entity:r1"],
        details: { attribute: "name", type: "member", scope: "siblings" },
      },
    ]);
  });
});

describe("declaration qualification for scoped uniqueness", () => {
  it("refuses a new-format unique-attribute without scope under the scoped adapter", () => {
    const unscoped: Profile = {
      ...generic2Profile,
      constraints: [{ kind: "unique-attribute", entityType: "legend-key", attribute: "category" }],
    };
    expect(validateProfile(unscoped, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "profiles.generic@2.constraints[0]",
        message: "unique-attribute constraint for legend-key.category requires an explicit scope",
        refs: [],
        details: { check: "unique-scope-missing", type: "legend-key", attribute: "category" },
      },
    ]);
  });

  it("keeps the legacy adapter silent on the same declaration", () => {
    const unscoped: Profile = {
      ...generic2Profile,
      constraints: [{ kind: "unique-attribute", entityType: "legend-key", attribute: "category" }],
    };
    expect(validateProfile(unscoped, LEGACY_CONSTRAINTS_ADAPTER)).toEqual([]);
  });

  it("refuses an ambiguous hierarchy selection at qualification", () => {
    const ambiguous: Profile = {
      id: "ambiguous@2",
      name: "ambiguous",
      version: 2,
      completeness: "complete",
      entityTypes: [
        { id: "box", label: "Box", attributes: [{ name: "name", kind: "text" }] },
        { id: "leaf", label: "Leaf", attributes: [{ name: "name", kind: "text" }] },
      ],
      portTypes: [],
      relationTypes: [
        {
          id: "one",
          label: "One",
          direction: "directed",
          roles: [
            { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["box"] },
            { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["leaf"] },
          ],
          hierarchy: { id: "first", shape: "tree", parentRole: "parent", childRole: "child" },
        },
        {
          id: "two",
          label: "Two",
          direction: "directed",
          roles: [
            { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["box"] },
            { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["leaf"] },
          ],
          hierarchy: { id: "second", shape: "tree", parentRole: "parent", childRole: "child" },
        },
      ],
      constraints: [{ kind: "unique-attribute", entityType: "leaf", attribute: "name", scope: "siblings" }],
      limits: {},
      notes: [],
    };
    expect(validateProfile(ambiguous, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "profiles.ambiguous@2.constraints[0]",
        message: "unique-attribute constraint for leaf.name selects no unique hierarchy",
        refs: [],
        details: { check: "unique-hierarchy-selection", type: "leaf", attribute: "name" },
      },
    ]);
  });
});

describe("the executor-profile-bindings@1 compatibility table", () => {
  const legacyBindings: ExecutorProfileBindings = {
    schemaVersion: "1",
    rows: [bindingRowFor(genericProfile, LEGACY_CONSTRAINTS_ADAPTER)],
  };

  it("assigns legacy rows to the four @1 profiles and scoped rows to generic@2", () => {
    expect(legacyBindings.rows).toEqual([bindingRowFor(genericProfile, LEGACY_CONSTRAINTS_ADAPTER)]);
    expect(bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER).declarationAdapter).toBe(
      SCOPED_CONSTRAINTS_ADAPTER,
    );
    expect(bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER).profilePin.id).toBe("generic@2");
  });

  it("never changes a retained @1 verdict when a bindings table is present", () => {
    const clash = containerDoc({ c1: "Same", c2: "Same" });
    const options = legacyOptions([genericProfile]);
    expect(validateDocument(clash, { registry: options.registry, bindings: legacyBindings })).toEqual(
      validateDocument(clash, options),
    );
  });

  it("refuses a used profile with no binding row instead of guessing", () => {
    const registry = createProfileRegistry([genericProfile, generic2Profile]);
    const diagnostics = validateDocument(validGeneric2Document(), {
      registry,
      bindings: legacyBindings,
    });
    expect(diagnostics).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.generic@2",
        message: "no executor binding row selects an adapter for profile generic@2",
        details: { profile: "generic@2" },
      },
    ]);
  });

  it("refuses a digest mismatch instead of running on foreign bytes", () => {
    const tampered: ExecutorProfileBindings = {
      schemaVersion: "1",
      rows: [
        {
          ...bindingRowFor(genericProfile, LEGACY_CONSTRAINTS_ADAPTER),
          profilePin: {
            id: "generic@1",
            version: 1,
            contentDigest: "fnv1a64:0000000000000000",
          },
        },
      ],
    };
    expect(
      validateDocument(containerDoc({ c1: "A", c2: "B" }), {
        registry: legacyOptions([genericProfile]).registry,
        bindings: tampered,
      }),
    ).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.rows[0]",
        message: "binding for generic@1 does not match the registered bytes",
        details: { profile: "generic@1" },
      },
    ]);
  });
});
