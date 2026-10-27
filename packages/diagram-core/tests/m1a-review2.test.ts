/**
 * M1-a review pass 2 — RED tests for the ten blocking/to-fix findings.
 *
 * Each test below fails on 6a838a7c and passes once its finding is fixed.
 * Adapted from scratchpad/rev/m1a-rev2-evidence-6a838a7c probes.mjs and
 * extra-probes.mjs, pinned against src (not dist).
 */
import { describe, expect, it } from "vitest";

import {
  bindingRowFor,
  boolean,
  createProfileRegistry,
  entityRef,
  portRef,
  createTypeResolver,
  generic2Profile,
  genericProfile,
  imposedAdapterFor,
  LEGACY_CONSTRAINTS_ADAPTER,
  qualifyAttributeSchema,
  quantity,
  type RelationRoleDeclaration,
  SCOPED_CONSTRAINTS_ADAPTER,
  structValue,
  text,
  validateDocument,
  validateProfile,
  verifyExecutorBindings,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";

const probeProfile = (id = "probe@2", extra: Partial<Profile> = {}): Profile => ({
  id: id as Profile["id"],
  name: id,
  version: 2,
  completeness: "complete",
  entityTypes: [{ id: "t", label: "T", attributes: [] }],
  portTypes: [],
  relationTypes: [],
  constraints: [],
  limits: {},
  notes: [],
  ...extra,
});

const probeDocument = (profileId: Profile["id"], extra: Partial<SemanticDocument> = {}): SemanticDocument => ({
  ...baseDocument([profileId]),
  ...extra,
});

describe("finding 1: native validation refuses non-object inputs", () => {
  for (const value of [null, undefined, 42, "bad"] as const) {
    it(`returns document-not-an-object for ${String(value)}`, () => {
      expect(validateDocument(value as never, { registry: createProfileRegistry([]) })).toEqual([
        {
          code: "document-not-an-object",
          severity: "error",
          path: "document",
          message: "a document is an object",
        },
      ]);
    });
  }
});

describe("finding 2: verified bindings for every new-format profile", () => {
  const uniqueOnly = probeProfile("uniqueonly@2", {
    entityTypes: [
      {
        id: "t",
        label: "T",
        attributes: [{ name: "code", kind: "text" }],
      },
    ],
    constraints: [{ kind: "unique-attribute", entityType: "t", attribute: "code", scope: "document" }],
  });

  function duplicates(): SemanticDocument {
    return probeDocument(uniqueOnly.id, {
      typeDefinitions: {
        ref: { id: "ref", profile: uniqueOnly.id, baseType: "t", attributes: [] },
      },
      entities: {
        "entity:a": ent("a", uniqueOnly.id, "ref", { code: text("same") }),
        "entity:b": ent("b", uniqueOnly.id, "ref", { code: text("same") }),
      },
    });
  }

  it("refuses a scoped-uniqueness profile with no bindings row instead of running legacy", () => {
    expect(validateDocument(duplicates(), { registry: createProfileRegistry([uniqueOnly]) })).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.uniqueonly@2",
        message: "no executor binding row selects an adapter for profile uniqueonly@2",
        details: { profile: "uniqueonly@2" },
      },
    ]);
  });

  it("reports the scoped duplication once a verified row is present", () => {
    expect(validateDocument(duplicates(), scopedOptions([uniqueOnly]))).toEqual([
      {
        code: "unique-attribute-violation",
        severity: "error",
        path: "entities.entity:b.attributes.code",
        message: "attribute code must be unique among t entities in scope document; entity:a carries the same value",
        refs: ["entity:b", "entity:a"],
        details: { attribute: "code", type: "t", scope: "document" },
      },
    ]);
  });

  it("requires a verified row for a bare new-format profile too", () => {
    const bare = probeProfile("bare@2");
    const document = probeDocument(bare.id, {
      entities: { "entity:a": ent("a", bare.id, "t") },
    });
    expect(validateDocument(document, { registry: createProfileRegistry([bare]) })).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.bare@2",
        message: "no executor binding row selects an adapter for profile bare@2",
        details: { profile: "bare@2" },
      },
    ]);
  });

  it("rejects explicit archimate@2 and uml@2 rows against the imposed scoped adapter", () => {
    for (const id of ["archimate@2", "uml@2"] as const) {
      const profile = probeProfile(id);
      expect(imposedAdapterFor(profile.id)).toBe(SCOPED_CONSTRAINTS_ADAPTER);
      expect(
        verifyExecutorBindings(
          { schemaVersion: "1", rows: [bindingRowFor(profile, LEGACY_CONSTRAINTS_ADAPTER)] },
          createProfileRegistry([profile]),
        ),
      ).toEqual([
        {
          code: "type-definition-conflict",
          severity: "error",
          path: "bindings.rows[0]",
          message: `executor binding for ${id} must use scoped-constraints@1, not legacy-constraints@1`,
          refs: [],
          details: { profile: id },
        },
      ]);
    }
  });
});

describe("finding 3: the matrix runs only after endpoint prerequisites succeed", () => {
  const edgeRoles = (sourceTargets: readonly ("entity" | "port")[]): RelationRoleDeclaration[] => [
    { role: "source", cardinality: { min: 1, max: 1 }, targets: [...sourceTargets] },
    { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
  ];
  const roles = edgeRoles(["entity"]);
  const matrixProfile: Profile = probeProfile("matrix@2", {
    entityTypes: [
      { id: "a", label: "A", attributes: [] },
      { id: "b", label: "B", attributes: [] },
    ],
    relationTypes: [{ id: "edge", label: "Edge", direction: "directed", roles }],
    constraints: [
      {
        kind: "relationship-matrix",
        matrixId: "m",
        sourceRole: "source",
        targetRole: "target",
        tuples: [{ relationType: "edge", sourceType: "a", targetType: "b" }],
      },
    ],
  });

  it("keeps only the unknown-relation-type diagnostic for an undeclared relation type", () => {
    const document = probeDocument(matrixProfile.id, {
      entities: {
        "entity:a": ent("a", matrixProfile.id, "b"),
        "entity:b": ent("b", matrixProfile.id, "a"),
      },
      relations: {
        "relation:r": rel("r", matrixProfile.id, "missing", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:b" },
        ]),
      },
    });
    expect(validateDocument(document, scopedOptions([matrixProfile]))).toEqual([
      {
        code: "unknown-relation-type",
        severity: "error",
        path: "relations.relation:r.type",
        message: "profile matrix@2 does not declare relation type missing",
        details: { type: "missing" },
      },
    ]);
  });

  it("keeps only the role-kind diagnostic when the role rejects the endpoint kind", () => {
    const portOnly: Profile = {
      ...matrixProfile,
      relationTypes: [
        {
          id: "edge",
          label: "Edge",
          direction: "directed",
          roles: edgeRoles(["port"]),
        },
      ],
    };
    const document = probeDocument(portOnly.id, {
      entities: {
        "entity:a": ent("a", portOnly.id, "b"),
        "entity:b": ent("b", portOnly.id, "a"),
      },
      relations: {
        "relation:r": rel("r", portOnly.id, "edge", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:b" },
        ]),
      },
    });
    expect(validateDocument(document, scopedOptions([portOnly]))).toEqual([
      {
        code: "endpoint-target-not-allowed",
        severity: "error",
        path: "relations.relation:r.endpoints[0].target",
        message: "role source accepts port, not a entity",
        refs: ["entity:a"],
        details: { seenKind: "entity", allowed: "port" },
      },
    ]);
  });
});

describe("finding 4: bound-pair visits structured port attributes", () => {
  const portsProfile: Profile = probeProfile("ports@2", {
    entityTypes: [
      { id: "holder", label: "Holder", attributes: [] },
      {
        id: "range",
        label: "Range",
        abstract: true,
        attributes: [
          { name: "lo", kind: "quantity", required: true, units: ["unit"] },
          { name: "hi", kind: "quantity", required: true, units: ["unit"] },
        ],
      },
    ],
    portTypes: [
      {
        id: "p",
        label: "P",
        directions: ["in"],
        attributes: [{ name: "range", kind: "struct", targetTypes: ["range"] }],
      },
    ],
    constraints: [{ kind: "bound-pair", valueType: "range", lowerField: "lo", upperField: "hi", unboundedUpper: -1 }],
  });

  it("refuses an inverted range carried by a port attribute", () => {
    const document = probeDocument(portsProfile.id, {
      entities: { "entity:h": ent("h", portsProfile.id, "holder") },
      ports: {
        "port:p": {
          id: portRef("p"),
          profile: portsProfile.id,
          type: "p",
          owner: entityRef("h"),
          name: "P",
          direction: "in",
          attributes: {
            range: structValue("range", { lo: quantity(3, "unit"), hi: quantity(2, "unit") }),
          },
        },
      },
    });
    expect(validateDocument(document, scopedOptions([portsProfile]))).toEqual([
      {
        code: "multiplicity-invalid",
        severity: "error",
        path: "ports.port:p.attributes.range",
        message: "multiplicity lower 3 exceeds finite upper 2",
        refs: [],
        details: { lower: 3, upper: 2, constraint: "bound-pair" },
      },
    ]);
  });
});

describe("finding 5: ownership and join checks cover every scoped endpoint", () => {
  const registry = createProfileRegistry([genericProfile, generic2Profile]);
  const bindings = {
    schemaVersion: "1" as const,
    rows: [
      bindingRowFor(genericProfile, LEGACY_CONSTRAINTS_ADAPTER),
      bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER),
    ],
  };

  for (const type of ["link", "association"] as const) {
    it(`reports endpoint-without-join for a foreign entity on generic@2 ${type}`, () => {
      const endpoints =
        type === "link"
          ? [
              { role: "source", target: "entity:c" },
              { role: "target", target: "entity:n" },
            ]
          : [
              { role: "member", target: "entity:c" },
              { role: "member", target: "entity:n" },
            ];
      const document: SemanticDocument = {
        ...baseDocument(["generic@2", "generic@1"]),
        entities: {
          "entity:c": ent("c", "generic@2", "container", { name: text("C") }),
          "entity:n": ent("n", "generic@1", "node", { name: text("N") }),
        },
        relations: {
          "relation:x": rel("x", "generic@2", type, endpoints),
        },
      };
      expect(validateDocument(document, { registry, bindings })).toEqual([
        {
          code: "endpoint-without-join",
          severity: "error",
          path: "relations.relation:x.endpoints[1].target",
          message: `relation relation:x applies generic@2 ${type} to entity entity:n owned by profile generic@1 with no admitted semantic join`,
          refs: ["entity:n"],
          details: { profile: "generic@2", targetProfile: "generic@1" },
        },
      ]);
    });
  }
});

describe("finding 6: hierarchy selection uses resolved ancestry", () => {
  const familyScope: Profile = probeProfile("familyscope@2", {
    entityTypes: [
      { id: "base", label: "Base", attributes: [{ name: "code", kind: "text" }] },
      { id: "sub", label: "Sub", supertypes: ["base"], attributes: [] },
    ],
    relationTypes: [
      {
        id: "edge",
        label: "Edge",
        direction: "directed",
        hierarchy: { id: "tree", shape: "tree", parentRole: "source", childRole: "target" },
        roles: [
          { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
          { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["base"] },
        ],
      },
    ],
    constraints: [{ kind: "unique-attribute", entityType: "sub", attribute: "code", scope: "siblings" }],
  });

  it("selects the hierarchy for a refinement of the accepted child family", () => {
    expect(validateProfile(familyScope, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([]);
  });
});

describe("finding 7: the resolver follows a 5000-deep additive chain", () => {
  it("resolves without a stack overflow", () => {
    const profile = probeProfile();
    const mutable: Record<string, SemanticDocument["typeDefinitions"][string]> = {};
    for (let i = 0; i < 5000; i += 1) {
      mutable[`d${i}`] = { id: `d${i}`, profile: profile.id, baseType: i === 0 ? "t" : `d${i - 1}`, attributes: [] };
    }
    const definitions: SemanticDocument["typeDefinitions"] = mutable;
    const resolution = createTypeResolver(probeDocument(profile.id, { typeDefinitions: definitions })).resolve(
      profile,
      "d4999",
    );
    expect(resolution.ok).toBe(true);
    if (resolution.ok) expect(resolution.resolved.ancestry).toHaveLength(5001);
  });
});

describe("finding 8: profile-level inheritance conflicts refuse resolution", () => {
  const clash = probeProfile("clash@2", {
    entityTypes: [
      { id: "a", label: "A", attributes: [{ name: "f", kind: "text" }] },
      { id: "b", label: "B", supertypes: ["a"], attributes: [{ name: "f", kind: "boolean" }] },
    ],
  });

  it("refuses the conflicting subtype instead of retaining the first schema", () => {
    const resolution = createTypeResolver(probeDocument(clash.id)).resolve(clash, "b");
    expect(resolution.ok).toBe(false);
  });

  it("reports no follow-on field mismatch for an instance of the conflicting type", () => {
    const document = probeDocument(clash.id, {
      entities: { "entity:b": ent("b", clash.id, "b", { f: boolean(true) }) },
    });
    const diagnostics = validateDocument(document, scopedOptions([clash]));
    expect(diagnostics.map((entry) => entry.code)).not.toContain("attribute-type-mismatch");
    expect(diagnostics.length).toBeGreaterThan(0);
  });
});

describe("finding 9: disjoint cycles are reported once each", () => {
  const cycles = probeProfile("cycles@2", {
    entityTypes: (
      [
        ["a", "b>c"],
        ["b>c", "a"],
        ["a>b", "c"],
        ["c", "a>b"],
      ] as const
    ).map(([id, parent]) => ({ id, label: id, supertypes: [parent], attributes: [] })),
  });

  it("reports both rotation-independent directed cycles", () => {
    const diagnostics = validateProfile(cycles, SCOPED_CONSTRAINTS_ADAPTER);
    expect(diagnostics.filter((entry) => entry.code === "supertype-cycle")).toHaveLength(2);
  });
});

describe("finding 10: anchored patterns count backslash parity", () => {
  it("accepts a valid anchored pattern matching a trailing literal backslash", () => {
    const pattern = "^a\\\\$";
    expect(new RegExp(pattern).test("a\\")).toBe(true);
    expect(
      qualifyAttributeSchema({ name: "code", kind: "text", pattern, patternName: "backslash" }, "schema"),
    ).toEqual([]);
  });
});
