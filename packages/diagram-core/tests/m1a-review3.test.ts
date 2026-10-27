/**
 * M1-a review pass 3 — RED tests for the three blocking findings plus the minor.
 *
 * Each test below fails on bbf5cf32 and passes once its finding is fixed,
 * except the Engram pin equality case which records the governed divergence.
 * Synthetic profiles use explicit verified rows; no test relies on the
 * version-based bypass.
 */
import { describe, expect, it } from "vitest";

import {
  bindingRowFor,
  createProfileRegistry,
  generic2Profile,
  genericProfile,
  LEGACY_CONSTRAINTS_ADAPTER,
  retainedExecutorBindings,
  SCOPED_CONSTRAINTS_ADAPTER,
  text,
  validateDocument,
  validateProfile,
  verifyExecutorBindings,
  type AttributeKind,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, scopedOptions } from "./m3-helpers.js";

const uniqueOnly = (id: "uniqueonly@1" | "uniqueonly@2"): Profile => ({
  id,
  name: "uniqueonly",
  version: id === "uniqueonly@1" ? 1 : 2,
  completeness: "complete",
  entityTypes: [
    {
      id: "t",
      label: "T",
      attributes: [{ name: "code", kind: "text" }],
    },
  ],
  portTypes: [],
  relationTypes: [],
  constraints: [{ kind: "unique-attribute", entityType: "t", attribute: "code", scope: "document" }],
  limits: {},
  notes: [],
});

function duplicatesOf(profile: Profile): SemanticDocument {
  return {
    ...baseDocument([profile.id]),
    typeDefinitions: {
      ref: { id: "ref", profile: profile.id, baseType: "t", attributes: [] },
    },
    entities: {
      "entity:a": ent("a", profile.id, "ref", { code: text("same") }),
      "entity:b": ent("b", profile.id, "ref", { code: text("same") }),
    },
  };
}

describe("pass-3 finding 1: no version-based binding bypass", () => {
  it("refuses a non-retained @1 profile with no bindings row", () => {
    const profile = uniqueOnly("uniqueonly@1");
    expect(validateDocument(duplicatesOf(profile), { registry: createProfileRegistry([profile]) })).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.uniqueonly@1",
        message: "no executor binding row selects an adapter for profile uniqueonly@1",
        details: { profile: "uniqueonly@1" },
      },
    ]);
  });

  it("refuses an explicit legacy row for a non-retained @2 profile", () => {
    const profile = uniqueOnly("uniqueonly@2");
    const registry = createProfileRegistry([profile]);
    const bindings = {
      schemaVersion: "1" as const,
      rows: [bindingRowFor(profile, LEGACY_CONSTRAINTS_ADAPTER)],
    };
    expect(verifyExecutorBindings(bindings, registry).length).toBeGreaterThan(0);
    expect(validateDocument(duplicatesOf(profile), { registry, bindings })[0]?.code).toBe(
      "type-definition-conflict",
    );
  });

  it("refuses an explicit legacy row for a non-retained @1 profile", () => {
    const profile = uniqueOnly("uniqueonly@1");
    const registry = createProfileRegistry([profile]);
    const bindings = {
      schemaVersion: "1" as const,
      rows: [bindingRowFor(profile, LEGACY_CONSTRAINTS_ADAPTER)],
    };
    const refused = [
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.rows[0]",
        message:
          "executor binding for uniqueonly@1 must use scoped-constraints@1, not legacy-constraints@1",
        refs: [],
        details: { profile: "uniqueonly@1" },
      },
    ];
    expect(verifyExecutorBindings(bindings, registry)).toEqual(refused);
    expect(validateDocument(duplicatesOf(profile), { registry, bindings })).toEqual(refused);
  });

  it("refuses modified retained bytes on the no-table path", () => {
    const modified: Profile = {
      ...genericProfile,
      limits: { ...genericProfile.limits, maxEntities: 123456 },
    };
    const document: SemanticDocument = {
      ...baseDocument(["generic@1"]),
    };
    expect(validateDocument(document, { registry: createProfileRegistry([modified]) })).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "bindings.rows[0]",
        message: "binding for generic@1 does not match the registered bytes",
        details: { profile: "generic@1" },
      },
    ]);
  });

  it("keeps the retained @1 native run without a bindings table", () => {
    const document: SemanticDocument = {
      ...baseDocument(["generic@1"]),
      entities: {
        "entity:c1": ent("c1", "generic@1", "container", { name: text("Same") }),
        "entity:c2": ent("c2", "generic@1", "container", { name: text("Same") }),
      },
    };
    const diagnostics = validateDocument(document, { registry: createProfileRegistry([genericProfile]) });
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
  });

  it("reports the scoped duplication once a verified row is present", () => {
    for (const id of ["uniqueonly@1", "uniqueonly@2"] as const) {
      const profile = uniqueOnly(id);
      expect(validateDocument(duplicatesOf(profile), scopedOptions([profile]))).toEqual([
        {
          code: "unique-attribute-violation",
          severity: "error",
          path: "entities.entity:b.attributes.code",
          message:
            "attribute code must be unique among t entities in scope document; entity:a carries the same value",
          refs: ["entity:b", "entity:a"],
          details: { attribute: "code", type: "t", scope: "document" },
        },
      ]);
    }
  });
});

describe("pass-3 finding 2: P-CONTENT-DIAGRAM pin digest", () => {
  it("ships packaged verified rows for exactly the four retained identities", () => {
    expect(retainedExecutorBindings.schemaVersion).toBe("1");
    expect(retainedExecutorBindings.rows.map((row) => row.profileId).sort()).toEqual([
      "archimate@1",
      "bpmn@1",
      "generic@1",
      "uml@1",
    ]);
    for (const row of retainedExecutorBindings.rows) {
      expect(row.declarationAdapter).toBe(LEGACY_CONSTRAINTS_ADAPTER);
      expect(row.profilePin.contentDigest).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("accepts the independently computed SHA-256 pin and refuses the FNV pin", async () => {
    const { contentDiagramDigest, contentDiagramPreimage, canonicalBytes } = await import("../src/index.js");
    const preimage = contentDiagramPreimage(generic2Profile);
    const sha = contentDiagramDigest(generic2Profile);
    expect(sha).toMatch(/^[0-9a-f]{64}$/);
    expect(sha).toBe("cb103606707577720eba48570c0e49aadd209d8e51a9a0bc2c725b7434f79283");
    expect(canonicalBytes(preimage)).not.toContain("notes");
    const registry = createProfileRegistry([generic2Profile]);
    const good = {
      schemaVersion: "1" as const,
      rows: [
        {
          ...bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER),
          profilePin: { id: "generic@2" as const, version: 2, contentDigest: sha },
        },
      ],
    };
    expect(verifyExecutorBindings(good, registry)).toEqual([]);
    expect(
      verifyExecutorBindings(
        {
          schemaVersion: "1",
          rows: [
            {
              ...bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER),
              profilePin: { id: "generic@2", version: 2, contentDigest: "fnv1a64:a5550162c41988b3" },
            },
          ],
        },
        registry,
      ),
    ).not.toEqual([]);
  });

  it("leaves contentDigest unchanged by a notes-only edit", async () => {
    const { contentDiagramDigest } = await import("../src/index.js");
    expect(contentDiagramDigest({ ...generic2Profile, notes: ["changed"] })).toBe(
      contentDiagramDigest(generic2Profile),
    );
  });

  it("changes contentDigest on a semantic edit", async () => {
    const { contentDiagramDigest } = await import("../src/index.js");
    expect(contentDiagramDigest({ ...generic2Profile, completeness: "skeleton" })).not.toBe(
      contentDiagramDigest(generic2Profile),
    );
  });

  it("equals the Engram-governed generic@2 pin digest", async () => {
    const { contentDiagramDigest } = await import("../src/index.js");
    expect(contentDiagramDigest(generic2Profile)).toBe(
      "cb103606707577720eba48570c0e49aadd209d8e51a9a0bc2c725b7434f79283",
    );
  });
});

describe("pass-3 finding 3: iterative K1 qualification", () => {
  const chain = (count: number, shared: boolean): Profile => ({
    id: "deep@2",
    name: "deep",
    version: 2,
    completeness: "complete",
    entityTypes: Array.from({ length: count }, (_, j) => {
      const i = count - 1 - j;
      return {
        id: `t${i}`,
        label: "T",
        attributes: [],
        ...(i === 0 ? {} : { supertypes: [`t${i - 1}`, ...(shared && i > 1 ? [`t${i - 2}`] : [])] }),
      };
    }),
    portTypes: [],
    relationTypes: [],
    constraints: [],
    limits: {},
    notes: [],
  });

  it("qualifies a valid 5 000-type chain in validateProfile", () => {
    expect(validateProfile(chain(5000, false), SCOPED_CONSTRAINTS_ADAPTER)).toEqual([]);
  });

  it("validates a valid 5 000-type chain document", () => {
    const profile = chain(5000, false);
    const document: SemanticDocument = {
      ...baseDocument([profile.id]),
      schemaVersion: { major: 1, minor: 1 },
    };
    const diagnostics = validateDocument(document, scopedOptions([profile]));
    expect(diagnostics).toEqual([]);
  });

  it("qualifies the 35-type shared-ancestor DAG well under 100 ms", () => {
    const profile = chain(35, true);
    const start = performance.now();
    expect(validateProfile(profile, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([]);
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe("pass-3 minor 6: AttributeKind covers struct", () => {
  it("exposes struct in the AttributeKind union", async () => {
    const structKind: AttributeKind = "struct";
    expect(structKind).toBe("struct");
    const { validateAttributeValue } = await import("../src/index.js");
    expect(
      validateAttributeValue(
        { name: "box", kind: "struct", targetTypes: ["r"] },
        { kind: "struct", type: "r", fields: {} },
        "entities.entity:h.attributes.box",
      ),
    ).toEqual([]);
  });
});
