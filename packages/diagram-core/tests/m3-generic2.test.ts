/**
 * M3 §5.5 — the `generic@2` profile literal.
 *
 * A complete replacement base in a new file, registered next to the @1
 * profiles; `generic.ts` and `skeletons.ts` keep their exact bytes.
 * `EntityTypeDeclaration` gains `container` only: no footprint, icon or token
 * field. The declaration carries the §5.4 constraint values verbatim.
 */
import { describe, expect, it } from "vitest";

import {
  GENERIC2_CONTAINMENT_HIERARCHY,
  GENERIC2_PROFILE_ID,
  GENERIC_PROFILE_ID,
  LEGACY_CONSTRAINTS_ADAPTER,
  SCOPED_CONSTRAINTS_ADAPTER,
  bindingRowFor,
  createProfileRegistry,
  defaultProfileRegistry,
  generic2Profile,
  genericProfile,
  m3ProfileRegistry,
  text,
  validateDocument,
  validateProfile,
  type ExecutorProfileBindings,
  type SemanticDocument,
} from "../src/index.js";
import { rel, scopedOptions, validGeneric2Document } from "./m3-helpers.js";

const options = scopedOptions([generic2Profile]);

describe("generic@2 registration", () => {
  it("is a distinct profile id next to the @1 profiles", () => {
    expect(GENERIC2_PROFILE_ID).toBe("generic@2");
    expect(generic2Profile.id).toBe("generic@2");
    expect(generic2Profile.version).toBe(2);
    expect(generic2Profile.completeness).toBe("complete");
    expect(m3ProfileRegistry.list()).toContain("generic@2");
    expect(m3ProfileRegistry.list()).toContain(GENERIC_PROFILE_ID);
    expect(() => createProfileRegistry([genericProfile, generic2Profile, generic2Profile])).toThrow(
      /registered twice/,
    );
  });

  it("leaves the default registry on the four @1 profiles", () => {
    expect(defaultProfileRegistry.list()).toEqual(["archimate@1", "bpmn@1", "generic@1", "uml@1"]);
    expect(defaultProfileRegistry.get("generic@2" as never)).toBeUndefined();
  });

  it("validates cleanly under both adapters", () => {
    expect(validateProfile(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER)).toEqual([]);
    expect(validateProfile(generic2Profile, LEGACY_CONSTRAINTS_ADAPTER)).toEqual([]);
  });
});

describe("generic@2 declaration shape", () => {
  it("declares node, container, legend and legend-key with the specified attributes", () => {
    const byId = new Map(generic2Profile.entityTypes.map((type) => [type.id, type] as const));
    expect([...byId.keys()].sort()).toEqual(["container", "legend", "legend-key", "node"]);
    expect(byId.get("node")?.attributes.map((schema) => schema.name)).toEqual([
      "name",
      "state",
      "weight",
      "duration",
      "createdAt",
      "pinned",
      "tags",
      "owner",
      "category",
    ]);
    expect(byId.get("node")?.container).toBeUndefined();
    expect(byId.get("container")?.container).toBe(true);
    expect(byId.get("legend")?.container).toBe(true);
    expect(byId.get("legend-key")?.container).toBeUndefined();
    // No container carries the removed collapsed attribute.
    expect(byId.get("container")?.attributes.map((schema) => schema.name)).toEqual(["name", "category"]);
    expect(byId.get("legend-key")?.attributes.find((schema) => schema.name === "category")).toMatchObject({
      kind: "text",
      required: true,
      minLength: 1,
      maxLength: 40,
      pattern: "^[a-z][a-z0-9-]*$",
      patternName: "key",
    });
  });

  it("has no footprint, icon or token field on any entity type", () => {
    for (const type of generic2Profile.entityTypes) {
      for (const key of Object.keys(type)) {
        expect(["attributes", "id", "label", "abstract", "container", "supertypes"]).toContain(key);
      }
    }
  });

  it("raises link.label to 200 and carries the exact §5.4 constraint values", () => {
    const link = generic2Profile.relationTypes.find((type) => type.id === "link");
    expect(link?.attributes?.find((schema) => schema.name === "label")).toMatchObject({
      kind: "text",
      maxLength: 200,
    });
    expect(generic2Profile.constraints).toEqual([
      {
        kind: "hierarchy",
        relationType: "contains",
        hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
        parentRole: "parent",
        childRole: "child",
      },
      {
        kind: "parent-family",
        hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
        familyRoots: ["container", "legend"],
      },
      {
        kind: "children-restricted",
        parentFamilyRoots: ["legend"],
        childTypes: ["legend-key"],
        hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
      },
      {
        kind: "required-parent",
        childTypes: ["legend-key"],
        parentFamilyRoots: ["legend"],
        hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
      },
      { kind: "acyclic-hierarchy", hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY },
      {
        kind: "unique-attribute",
        entityType: "legend-key",
        attribute: "category",
        scope: { withinType: "legend" },
      },
    ]);
    expect(generic2Profile.limits).toEqual({ maxEntities: 100000, maxRelations: 500000, maxEndpointsPerRelation: 8 });
  });
});

describe("generic@2 documents", () => {
  it("accepts the canonical valid scene with no diagnostic", () => {
    expect(validateDocument(validGeneric2Document(), options)).toEqual([]);
  });

  it("accepts a 150-character link label under the raised bound", () => {
    const document = validGeneric2Document();
    const long: SemanticDocument = {
      ...document,
      relations: {
        ...document.relations,
        "relation:long": {
          ...rel("long", "generic@2", "link", [
            { role: "source", target: "entity:n" },
            { role: "target", target: "entity:n" },
          ]),
          attributes: { label: text("l".repeat(150)) },
        },
      },
    };
    expect(validateDocument(long, options)).toEqual([]);
  });

  it("no longer limits containers to 64 and no longer unifies their names", () => {
    const extra: Record<string, SemanticDocument["entities"][string]> = {};
    for (let index = 0; index < 65; index += 1) {
      extra[`entity:c${index}`] = {
        id: `entity:c${index}` as never,
        profile: "generic@2",
        type: "container",
        attributes: { name: text("Same name") },
      };
    }
    const document = validGeneric2Document();
    expect(validateDocument({ ...document, entities: { ...document.entities, ...extra } }, options)).toEqual([]);
  });

  it("registers generic@2 in a bindings table with the scoped adapter", () => {
    const bindings: ExecutorProfileBindings = {
      schemaVersion: "1",
      rows: [bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER)],
    };
    expect(bindings.rows[0]?.profilePin).toEqual({
      id: "generic@2",
      version: 2,
      contentDigest: bindings.rows[0]?.profilePin.contentDigest,
    });
    expect(validateDocument(validGeneric2Document(), { registry: options.registry, bindings })).toEqual([]);
  });
});
