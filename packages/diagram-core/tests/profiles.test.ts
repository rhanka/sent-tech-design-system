/**
 * Profiles: the registry, the one complete profile, the three declared
 * skeletons, and the checks that keep a profile from being unenforceable.
 */
import { describe, expect, it } from "vitest";

import {
  ARCHIMATE_SKELETON_PROFILE_ID,
  BPMN_SKELETON_PROFILE_ID,
  GENERIC_PROFILE_ID,
  UML_SKELETON_PROFILE_ID,
  createProfileRegistry,
  defaultProfileRegistry,
  entityRef,
  genericProfile,
  relationRef,
  skeletonProfiles,
  validateDocument,
  validateProfile,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { distinctErrorCodes, readFixture, stateOf } from "./fixtures.js";
import { chainProfile, predicates } from "./endpoint-provenance-fixtures.js";
import { tryCanonicalise, type ChainPredicate } from "../src/index.js";

const registry = defaultProfileRegistry;

describe("AC-20 chain declaration DATA gate", () => {
  const base = predicates[0]!;
  const path = `profiles.${chainProfile.id}.chainPredicates[0]`;
  it("accepts all four DATA predicates", () => expect(validateProfile(chainProfile)).toEqual([]));
  it.each([
    ["chain-duplicate-id", { ...base, id: "" }, ".id"],
    ["chain-unknown-type", { ...base, appliesTo: { ...base.appliesTo, startTypes: ["missing"] } }, ".appliesTo.startTypes"],
    ["chain-unknown-type", { ...base, alternatives: [] }, ".alternatives"],
    ["chain-unknown-type", { ...base, alternatives: [{ ...base.alternatives[0], steps: [] }] }, ".alternatives[0].steps"],
    ["chain-unknown-type", { ...base, startConstraints: [{ attribute: "absent", equals: true }] }, ".startConstraints[0].attribute"],
    ["chain-invalid-direction", { ...base, alternatives: [{ ...base.alternatives[0], steps: [{ ...base.alternatives[0]!.steps[0], direction: "sideways" }] }] }, ".alternatives[0].steps[0].direction"],
    ["chain-invalid-repeat", { ...base, alternatives: [{ ...base.alternatives[0], steps: [{ ...base.alternatives[0]!.steps[0], repeat: "many" }] }] }, ".alternatives[0].steps[0].repeat"],
    ["chain-members-not-aggregate", { ...base, aggregation: predicates[3]!.aggregation }, ".aggregation"],
    ["chain-members-not-aggregate", { ...predicates[3], aggregation: undefined }, ".aggregation"],
    ["chain-members-not-aggregate", { ...predicates[3], aggregation: { ...predicates[3]!.aggregation, sort: "locale" } }, ".aggregation.sort"],
    ["chain-unknown-type", { ...predicates[3], aggregation: { ...predicates[3]!.aggregation, memberRelationTypes: ["missing"] } }, ".aggregation.memberRelationTypes"],
    ["chain-unknown-type", { ...predicates[3], aggregation: { ...predicates[3]!.aggregation, memberTargetChain: { ...predicates[3]!.aggregation!.memberTargetChain, endTypes: ["missing"] } } }, ".aggregation.memberTargetChain.endTypes"],
  ] as const)("refuses %s at %s", (check, predicate, field) => {
    expect(validateProfile({ ...chainProfile, chainPredicates: [predicate as unknown as ChainPredicate] })).toEqual([{
      code: "type-definition-conflict", severity: "error", path: path + field,
      message: `chain predicate ${predicate.id} fails check ${check}`, details: { check },
    }]);
  });
  it("refuses duplicate ids and function values", () => {
    expect(validateProfile({ ...chainProfile, chainPredicates: [base, base] })).toMatchObject([
      { code: "type-definition-conflict", path: `profiles.${chainProfile.id}.chainPredicates[1].id`, details: { check: "chain-duplicate-id" } },
    ]);
    const malformed = { ...chainProfile, chainPredicates: [{ ...base, callback: () => true }] };
    expect(validateProfile(malformed)).toMatchObject([{ code: "value-not-serialisable" }]);
    expect(tryCanonicalise(malformed)).toMatchObject({ ok: false, diagnostics: [{ code: "value-not-serialisable" }] });
  });
});

describe("the registry", () => {
  it("holds the four declared profiles and nothing else", () => {
    expect(registry.list()).toEqual([
      ARCHIMATE_SKELETON_PROFILE_ID,
      BPMN_SKELETON_PROFILE_ID,
      GENERIC_PROFILE_ID,
      UML_SKELETON_PROFILE_ID,
    ]);
  });

  it("refuses to register a profile id twice: an id is a version, not a name", () => {
    expect(() => createProfileRegistry([genericProfile, genericProfile])).toThrow(/registered twice/);
  });

  it("is not ambient: a document may be validated against a registry of one", () => {
    const only = createProfileRegistry([genericProfile]);
    const fixture = readFixture("valid/bpmn-skeleton-document.json");
    expect(distinctErrorCodes(validateDocument(stateOf(fixture).document, { registry: only }))).toEqual([
      "unknown-profile",
    ]);
  });
});

describe("generic@1 is the only complete profile of this lot", () => {
  it("says so about itself", () => {
    expect(registry.get(GENERIC_PROFILE_ID)?.completeness).toBe("complete");
    for (const profile of skeletonProfiles) expect(profile.completeness).toBe("skeleton");
  });

  it("validates as a profile", () => {
    expect(validateProfile(genericProfile)).toEqual([]);
  });

  it("declares a bounded collection, a pinned unit and a typed reference", () => {
    const node = genericProfile.entityTypes.find((type) => type.id === "node");
    const tags = node?.attributes.find((attribute) => attribute.name === "tags");
    expect(tags).toMatchObject({ kind: "collection", maxItems: 8 });
    const weight = node?.attributes.find((attribute) => attribute.name === "weight");
    expect(weight).toMatchObject({ kind: "quantity", units: ["unit"] });
    const owner = node?.attributes.find((attribute) => attribute.name === "owner");
    expect(owner).toMatchObject({ kind: "reference", refKind: "entity" });
  });

  it("bounds its hyperrelation and its endpoint count", () => {
    const association = genericProfile.relationTypes.find((type) => type.id === "association");
    expect(association?.roles[0]?.cardinality).toEqual({ min: 2, max: 8 });
    expect(genericProfile.limits.maxEndpointsPerRelation).toBe(8);
  });
});

describe("the three skeletons declare what they do NOT cover", () => {
  for (const profile of skeletonProfiles) {
    it(`${profile.id}: first note says SKELETON, and a note says what is not declared`, () => {
      expect(profile.notes[0]).toMatch(/^SKELETON\./);
      expect(profile.notes.some((note) => note.startsWith("NOT declared:"))).toBe(true);
      expect(profile.notes.some((note) => /partial/i.test(note))).toBe(true);
      expect(validateProfile(profile)).toEqual([]);
    });
  }

  it("bpmn@1 claims nothing about executability", () => {
    const bpmn = registry.get(BPMN_SKELETON_PROFILE_ID) as Profile;
    expect(bpmn.notes.some((note) => note.includes("not an executable process"))).toBe(true);
  });

  it("archimate@1 says the relation matrix is not declared", () => {
    const archimate = registry.get(ARCHIMATE_SKELETON_PROFILE_ID) as Profile;
    expect(archimate.relationTypes).toHaveLength(11);
    expect(archimate.notes.some((note) => note.includes("matrix"))).toBe(true);
    expect(archimate.notes.some((note) => note.includes("No ArchiMate conformance is claimed"))).toBe(true);
  });

  it("the skeletons run through the SAME machinery: a bpmn containment cycle is refused", () => {
    const fixture = readFixture("valid/bpmn-skeleton-document.json");
    const document = stateOf(fixture).document;
    const cyclic: SemanticDocument = {
      ...document,
      relations: {
        ...document.relations,
        "relation:c2": {
          id: relationRef("c2"),
          profile: BPMN_SKELETON_PROFILE_ID,
          type: "flowElementContainment",
          endpoints: [
            { role: "parent", target: entityRef("task") },
            { role: "child", target: entityRef("process") },
          ],
          attributes: {},
        },
      },
    };
    expect(distinctErrorCodes(validateDocument(cyclic, { registry }))).toContain("hierarchy-cycle");
  });

  it("a bpmn event without its position is refused, because the skeleton requires it", () => {
    const fixture = readFixture("valid/bpmn-skeleton-document.json");
    const document = stateOf(fixture).document;
    const start = document.entities["entity:start"] as NonNullable<(typeof document.entities)[string]>;
    const broken: SemanticDocument = {
      ...document,
      entities: {
        ...document.entities,
        "entity:start": { ...start, attributes: { name: { kind: "text", value: "Order received" } } },
      },
    };
    expect(distinctErrorCodes(validateDocument(broken, { registry }))).toEqual(["attribute-required-missing"]);
  });
});

describe("a profile that could not be enforced is refused", () => {
  const broken: Profile = {
    id: "broken@1",
    name: "broken",
    version: 1,
    completeness: "skeleton",
    entityTypes: [
      { id: "thing", label: "Thing", attributes: [{ name: "n", kind: "text" }, { name: "n", kind: "boolean" }] },
      { id: "thing", label: "Thing again", attributes: [] },
    ],
    portTypes: [],
    relationTypes: [
      {
        id: "rel",
        label: "Rel",
        direction: "directed",
        roles: [
          { role: "a", cardinality: { min: 2, max: 1 }, targets: ["entity"] },
          { role: "b", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["nope"] },
        ],
        // The hierarchy names a role the relation type does not declare, which
        // would make the cycle check unreachable.
        hierarchy: { id: "h", shape: "tree", parentRole: "a", childRole: "missing" },
      },
    ],
    constraints: [
      { kind: "acyclic-hierarchy", hierarchyId: "not-declared" },
      { kind: "unique-attribute", entityType: "absent", attribute: "n" },
    ],
    limits: {},
    notes: [],
  };

  it("names every way it is unenforceable", () => {
    const codes = [...new Set(validateProfile(broken).map((entry) => entry.code))].sort();
    expect(codes).toEqual([
      "duplicate-id",
      "endpoint-cardinality-violation",
      "endpoint-role-unknown",
      "type-definition-conflict",
      "unknown-entity-type",
    ]);
  });
});

describe("a document may not use a profile it does not declare", () => {
  it("reports profile-not-declared, separately from unknown-profile", () => {
    const fixture = readFixture("valid/generic-state.json");
    const document = stateOf(fixture).document;
    const alpha = document.entities["entity:alpha"] as NonNullable<(typeof document.entities)[string]>;
    const smuggled: SemanticDocument = {
      ...document,
      entities: { ...document.entities, "entity:alpha": { ...alpha, profile: UML_SKELETON_PROFILE_ID } },
    };
    expect(distinctErrorCodes(validateDocument(smuggled, { registry }))).toEqual(["profile-not-declared"]);
  });
});

describe("the executable constraints of generic@1", () => {
  const fixture = readFixture("valid/generic-state.json");
  const document = stateOf(fixture).document;
  const root = document.entities["entity:root"] as NonNullable<(typeof document.entities)[string]>;

  /** A document with `count` containers, all named `name`. */
  function withContainers(count: number, name: (index: number) => string): SemanticDocument {
    const entities: Record<string, typeof root> = {};
    for (let index = 0; index < count; index += 1) {
      const id = entityRef(`c${index}`);
      entities[id] = { ...root, id, attributes: { name: { kind: "text", value: name(index) } } };
    }
    return { ...document, typeDefinitions: {}, entities, ports: {}, relations: {}, extensions: [] };
  }

  it("enforces unique-attribute, naming both entities that collide", () => {
    const clash = withContainers(2, () => "Same name");
    const diagnostics = validateDocument(clash, { registry });
    expect(distinctErrorCodes(diagnostics)).toEqual(["unique-attribute-violation"]);
    expect(diagnostics[0]?.refs).toEqual(["entity:c1", "entity:c0"]);
    // Distinct names are accepted: the constraint is about collisions, not about
    // the attribute being present.
    expect(validateDocument(withContainers(2, (index) => `Name ${index}`), { registry })).toEqual([]);
  });

  it("enforces max-entities-of-type, and says how many it saw", () => {
    const atLimit = withContainers(64, (index) => `Name ${index}`);
    expect(validateDocument(atLimit, { registry })).toEqual([]);
    const overLimit = withContainers(65, (index) => `Name ${index}`);
    const diagnostics = validateDocument(overLimit, { registry });
    expect(distinctErrorCodes(diagnostics)).toEqual(["limit-exceeded"]);
    expect(diagnostics[0]?.details).toEqual({ type: "container", seen: 65, max: 64 });
  });

  it("reports unique-attribute duplicates in id order, independent of insertion order", () => {
    const values: Record<string, string> = {
      aaa: "Dup",
      mmm: "Dup",
      zzz: "Dup",
      u1: "Unique 1",
      u2: "Unique 2",
    };
    function withOrder(ids: readonly string[]): SemanticDocument {
      const entities: Record<string, typeof root> = {};
      for (const local of ids) {
        const id = entityRef(local);
        entities[id] = { ...root, id, attributes: { name: { kind: "text", value: values[local] as string } } };
      }
      return { ...document, typeDefinitions: {}, entities, ports: {}, relations: {}, extensions: [] };
    }
    const forward = withOrder(["zzz", "mmm", "aaa", "u2", "u1"]);
    const reversed = withOrder(["u1", "u2", "aaa", "mmm", "zzz"]);
    const forwardDiagnostics = validateDocument(forward, { registry });
    const reversedDiagnostics = validateDocument(reversed, { registry });
    expect(reversedDiagnostics).toEqual(forwardDiagnostics);
    expect(forwardDiagnostics).toHaveLength(2);
    expect(forwardDiagnostics.map((entry) => entry.code)).toEqual([
      "unique-attribute-violation",
      "unique-attribute-violation",
    ]);
    expect(forwardDiagnostics.map((entry) => entry.refs)).toEqual([
      ["entity:mmm", "entity:aaa"],
      ["entity:zzz", "entity:aaa"],
    ]);
    expect(forwardDiagnostics.map((entry) => entry.path)).toEqual([
      "entities.entity:mmm.attributes.name",
      "entities.entity:zzz.attributes.name",
    ]);
    for (const entry of forwardDiagnostics) {
      expect(entry.message).toBe(
        "attribute name must be unique among container entities; entity:aaa carries the same value",
      );
      expect(entry.details).toEqual({ attribute: "name", type: "container" });
    }
  });
});
