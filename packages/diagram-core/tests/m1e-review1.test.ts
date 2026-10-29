/**
 * M1-e review pass 1 RED witnesses (must fail on e881248b, pass after fix).
 * English in code.
 */
import { describe, expect, it, vi } from "vitest";

import {
  archimate2Profile,
  bindingRowFor,
  canonicalise,
  contentDiagramDigest,
  createProfileRegistry,
  createState,
  createView,
  documentRef,
  entityRef,
  occurrenceRef,
  relationRef,
  SCOPED_CONSTRAINTS_ADAPTER,
  uml2Profile,
  validateDocument,
  viewRef,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";
import { collection, enumeration, quantity, structValue, text } from "../src/index.js";

const archimateScoped = () =>
  scopedOptions([archimate2Profile]);

describe("finding 1: retained schemas keep exact bounds", () => {
  it("code.maxLength=12 still rejects 13 characters after migration", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1"]),
      typeDefinitions: {
        "my-grouping": {
          id: "my-grouping",
          profile: "archimate@1" as const,
          baseType: "grouping",
          attributes: [{ name: "code", kind: "text", maxLength: 12 } as never],
        },
      },
      entities: {
        "entity:g": ent("g", "archimate@1", "my-grouping", {
          name: text("G"),
          code: text("012345678901"),
        }),
      },
      relations: {},
    };
    expect(validateDocument(source, { registry: createProfileRegistry((await import("../src/index.js")).archimateSkeletonProfile ? [(await import("../src/index.js")).archimateSkeletonProfile, (await import("../src/index.js")).genericProfile] : []) })).toEqual([]);
    const outcome = migrateArchimateV1ToV2(source, { entityTypes: {} });
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    const overlong = {
      ...outcome.document,
      entities: {
        ...outcome.document.entities,
        "entity:g": {
          ...outcome.document.entities["entity:g"]!,
          attributes: {
            ...(outcome.document.entities["entity:g"] as { attributes: Record<string, unknown> }).attributes,
            code: text("0123456789012"),
          },
        },
      },
    };
    const diagnostics = validateDocument(overlong as never, archimateScoped());
    expect(diagnostics.map((d) => d.code)).toContain("text-too-long");
  });
});

describe("finding 2: authored-value collisions refuse atomically", () => {
  it("layer=technology mapped to business-actor refuses", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1"]),
      entities: {
        "entity:actor": ent("actor", "archimate@1", "element", {
          name: text("A"),
          layer: enumeration("technology"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source, { entityTypes: { "entity:actor": "business-actor" } });
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") return;
    expect(outcome.unmigrated[0]?.path).toContain("entity:actor");
    expect(outcome.originalCanonical).toContain("archimate@1");
    expect(outcome.operations).toEqual([]);
  });
});

describe("finding 3: whole-state transaction", () => {
  it("migrates a DiagramState and inverts byte-exact", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const document = {
      ...baseDocument(["archimate@1"]),
      revision: 1,
      entities: {
        "entity:actor": ent("actor", "archimate@1", "element", {
          name: text("A"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      revision: 1,
      entityOccurrences: {
        "occurrence:a": {
          id: occurrenceRef("a"),
          entity: entityRef("actor"),
          geometry: { x: 0, y: 0, width: 100, height: 100 },
        },
      },
      relationOccurrences: {},
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    const state = createState(document as never, [view as never]);
    const outcome = (migrateArchimateV1ToV2 as never as (s: unknown, m: unknown) => { status: string })(state, {
      entityTypes: { "entity:actor": "business-actor" },
    }) as { status: string; state?: unknown; document?: unknown; invert?: (c?: unknown) => { status: string; state?: unknown; document?: unknown } };
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.state).toBeDefined();
    const inverted = outcome.invert!();
    expect(inverted.status).toBe("ok");
    if (inverted.status !== "ok") return;
    expect(canonicalise((inverted as { state: unknown }).state)).toBe(canonicalise(state));
  });
});

describe("finding 4: per-profile adapters for retained @1", () => {
  it("migrates while retaining generic@1", async () => {
    const { genericProfile, migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1", "generic@1"]),
      entities: {
        "entity:actor": ent("actor", "archimate@1", "element", {
          name: text("A"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
        "entity:n": ent("n", "generic@1", "node", { name: text("N") }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source as never, { entityTypes: { "entity:actor": "business-actor" } });
    expect(outcome.status).toBe("ok");
  });
});

describe("finding 5: source preflight and bounded resolution", () => {
  it("refuses a refinement cycle without throwing", async () => {
    const { migrateUmlV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["uml@1"]),
      typeDefinitions: {
        a: { id: "a", profile: "uml@1" as const, baseType: "b", attributes: [] },
        b: { id: "b", profile: "uml@1" as const, baseType: "a", attributes: [] },
      },
      entities: {
        "entity:x": ent("x", "uml@1", "a", { name: text("X") }),
      },
      relations: {},
    };
    let outcome: unknown;
    expect(() => {
      outcome = migrateUmlV1ToV2(source as never, { stereotypes: {} });
    }).not.toThrow();
    expect((outcome as { status: string }).status).toBe("refused");
  });

  it("refuses a missing required ArchiMate layer instead of repairing", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1"]),
      entities: {
        "entity:actor": ent("actor", "archimate@1", "element", {
          name: text("A"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source as never, { entityTypes: { "entity:actor": "business-actor" } });
    expect(outcome.status).toBe("refused");
  });
});

describe("finding 8: mapping shape and operation order", () => {
  it("rejects extra mapping fields", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1"]),
      entities: {},
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source as never, { entityTypes: {}, guess: true } as never);
    expect(outcome.status).toBe("refused");
  });

  it("orders operations by section order", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1"]),
      typeDefinitions: {
        "my-type": {
          id: "my-type",
          profile: "archimate@1" as const,
          baseType: "element",
          attributes: [],
        },
      },
      entities: {
        "entity:actor": ent("actor", "archimate@1", "my-type", {
          name: text("A"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source as never, { entityTypes: { "entity:actor": "business-actor" } });
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    const paths = outcome.operations.map((o) => o.path);
    const sectionOf = (p: string): number =>
      p === "profileRefs" || p.startsWith("profileRefs") ? 0
      : p.startsWith("typeDefinitions") ? 1
      : p.startsWith("entities") ? 2
      : p.startsWith("relations") ? 3
      : p.startsWith("ports") ? 4
      : 5;
    const sections = paths.map(sectionOf);
    expect([...sections].sort((a, b) => a - b)).toEqual(sections);
    expect(paths[0]).toBe("profileRefs");
  });
});

describe("finding 9: bound-pair only after scalar validation", () => {
  it("upper=-2 yields one diagnostic", () => {
    const doc = {
      ...baseDocument(["uml@2"]),
      entities: {
        "entity:p": ent("p", "uml@2", "property", {
          name: text("total"),
          visibility: enumeration("public"),
          stereotypes: collection([]),
          multiplicity: structValue("multiplicity", {
            lower: quantity(0, "unit"),
            upper: quantity(-2, "unit"),
          }),
        }),
      },
      relations: {},
    };
    const diagnostics = validateDocument(doc, scopedOptions([uml2Profile]));
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.code).not.toBe("multiplicity-invalid");
  });
});

describe("finding 10: lazy binding preimage", () => {
  it("root import does not eagerly compute the binding preimage", async () => {
    const mod = await import("../src/profiles/index.js");
    const descriptor = Object.getOwnPropertyDescriptor(mod.shippedExecutorBindings, "rows");
    expect(descriptor?.get).toBeDefined();
    expect(mod.shippedExecutorBindings.rows.length).toBeGreaterThan(0);
    expect(contentDiagramDigest(archimate2Profile)).toHaveLength(64);
  });

  it("imports the root in a fresh context and counts preimage builds 0, 1, 1", async () => {
    vi.resetModules();
    let builds = 0;
    vi.doMock("../src/bindings.js", async () => {
      const actual = (await vi.importActual("../src/bindings.js")) as Record<string, unknown>;
      const embedded = actual["embeddedExecutorBindings"] as (profiles: never) => unknown;
      return {
        ...(actual as object),
        embeddedExecutorBindings: (profiles: never) => {
          builds += 1;
          return embedded(profiles);
        },
      };
    });
    const fresh = (await import("../src/index.js")) as typeof import("../src/index.js");
    expect(builds).toBe(0);
    const first = fresh.shippedExecutorBindings.rows;
    expect(first.length).toBeGreaterThan(0);
    expect(builds).toBe(1);
    const second = fresh.shippedExecutorBindings.rows;
    expect(second.length).toBeGreaterThan(0);
    expect(builds).toBe(1);
    expect(second).toBe(first);
    vi.doUnmock("../src/bindings.js");
    vi.resetModules();
  });
});
