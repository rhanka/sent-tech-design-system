/**
 * M1-e review pass 2 RED witnesses (must fail on c08835ed, pass after fix).
 * English in code.
 */
import { describe, expect, it } from "vitest";

import {
  archimate2Profile,
  createState,
  createView,
  documentRef,
  entityRef,
  generic2Profile,
  occurrenceRef,
  uml2Profile,
  viewRef,
} from "../src/index.js";
import { baseDocument, ent, scopedOptions } from "./m3-helpers.js";
import { enumeration, text } from "../src/index.js";

const archimateActor = () =>
  ent("actor", "archimate@1", "element", {
    name: text("A"),
    layer: enumeration("business"),
    aspect: enumeration("active"),
  });

const archimateMapping = { entityTypes: { "entity:actor": "business-actor" } };

describe("finding 1: verified source bindings with imposed adapters", () => {
  it("migrates source [archimate@1, generic@2]", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1", "generic@2"]),
      entities: {
        "entity:actor": archimateActor(),
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source as never, archimateMapping);
    expect(outcome.status).toBe("ok");
  });

  it("migrates mixed @1/@2 sources for archimate and uml", async () => {
    const { migrateArchimateV1ToV2, migrateUmlV1ToV2 } = await import("../src/index.js");
    const archimateMixed = {
      ...baseDocument(["archimate@1", "generic@2"]),
      entities: {
        "entity:actor": archimateActor(),
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
      relations: {},
    };
    expect(migrateArchimateV1ToV2(archimateMixed as never, archimateMapping).status).toBe("ok");

    const umlMixed = {
      ...baseDocument(["uml@1", "generic@2"]),
      entities: {
        "entity:c": ent("c", "uml@1", "class", { name: text("C") }),
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
      relations: {},
    };
    expect(migrateUmlV1ToV2(umlMixed as never, { stereotypes: {} }).status).toBe("ok");

    const umlWithArchimate2 = {
      ...baseDocument(["uml@1", "archimate@2"]),
      entities: {
        "entity:c": ent("c", "uml@1", "class", { name: text("C") }),
        "entity:a": ent("a", "archimate@2", "business-actor", {
          name: text("A"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    expect(migrateUmlV1ToV2(umlWithArchimate2 as never, { stereotypes: {} }).status).toBe("ok");
  });

  it("runs successive migrations archimate then uml and the reverse order", async () => {
    const { migrateArchimateV1ToV2, migrateUmlV1ToV2 } = await import("../src/index.js");
    const start = {
      ...baseDocument(["archimate@1", "uml@1", "generic@2"]),
      entities: {
        "entity:actor": archimateActor(),
        "entity:c": ent("c", "uml@1", "class", { name: text("C") }),
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
      relations: {},
    };
    const firstState = createState(start as never, []);
    const afterArchimate = migrateArchimateV1ToV2(firstState as never, archimateMapping);
    expect(afterArchimate.status).toBe("ok");
    if (afterArchimate.status !== "ok") return;
    expect(afterArchimate.state.document.profileRefs).toEqual(["archimate@2", "uml@1", "generic@2"]);
    const afterUml = migrateUmlV1ToV2(afterArchimate.state as never, { stereotypes: {} });
    expect(afterUml.status).toBe("ok");
    if (afterUml.status !== "ok") return;
    expect(afterUml.state.document.profileRefs).toEqual(["archimate@2", "uml@2", "generic@2"]);

    const reverseFirst = migrateUmlV1ToV2(firstState as never, { stereotypes: {} });
    expect(reverseFirst.status).toBe("ok");
    if (reverseFirst.status !== "ok") return;
    expect(reverseFirst.state.document.profileRefs).toEqual(["archimate@1", "uml@2", "generic@2"]);
    const reverseSecond = migrateArchimateV1ToV2(reverseFirst.state as never, archimateMapping);
    expect(reverseSecond.status).toBe("ok");
    if (reverseSecond.status !== "ok") return;
    expect(reverseSecond.state.document.profileRefs).toEqual(["archimate@2", "uml@2", "generic@2"]);
  });
});

describe("finding 2: unserialisable retained view refuses typed without throwing", () => {
  it("refuses DiagramState with geometry.x=NaN with native diagnostics and keeps input", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const document = {
      ...baseDocument(["archimate@1"]),
      entities: { "entity:actor": archimateActor() },
      relations: {},
    };
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:a": {
          id: occurrenceRef("a"),
          entity: entityRef("actor"),
          geometry: { x: NaN, y: 0, width: 100, height: 100 },
        },
      },
      relationOccurrences: {},
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    const state = createState(document as never, [view as never]);
    const snapshot = structuredClone(state);
    let outcome: unknown;
    expect(() => {
      outcome = migrateArchimateV1ToV2(state as never, archimateMapping);
    }).not.toThrow();
    const typed = outcome as { status: string; unmigrated: readonly { path: string; reason: string; detail?: string }[]; originalCanonical: string; originalHash: string };
    expect(typed.status).toBe("refused");
    expect(typed.unmigrated.map((entry) => `${entry.detail ?? ""}`).join(" ")).toContain("value-not-finite");
    expect(state).toEqual(snapshot);
    const freshView = (state.views["view:v"] as unknown as { entityOccurrences: Record<string, { geometry: { x: number } }> | undefined })?.entityOccurrences?.["occurrence:a"]?.geometry.x;
    expect(typeof freshView).toBe("number");
    expect(Number.isNaN(freshView as number)).toBe(true);
    expect(typed.originalCanonical).toBe("");
    expect(typed.originalHash).toBe("");
  });
});

describe("finding 8b: operation order by section, raw UTF-16 identifier, then operation", () => {
  it("orders entity:a before entity:a-", async () => {
    const { migrateArchimateV1ToV2 } = await import("../src/index.js");
    const source = {
      ...baseDocument(["archimate@1"]),
      entities: {
        "entity:a": ent("a", "archimate@1", "element", {
          name: text("A"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
        "entity:a-": ent("a-", "archimate@1", "element", {
          name: text("A-"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source as never, {
      entityTypes: { "entity:a": "business-actor", "entity:a-": "business-actor" },
    });
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    const paths = outcome.operations.map((operation) => operation.path);
    const firstA = paths.findIndex((path) => path.startsWith("entities.entity:a."));
    const firstADash = paths.findIndex((path) => path.startsWith("entities.entity:a-."));
    expect(firstA).toBeGreaterThanOrEqual(0);
    expect(firstADash).toBeGreaterThanOrEqual(0);
    expect(firstA).toBeLessThan(firstADash);
    const sectionOf = (path: string): number =>
      path === "profileRefs" || path.startsWith("profileRefs")
        ? 0
        : path.startsWith("typeDefinitions")
          ? 1
          : path.startsWith("entities")
            ? 2
            : path.startsWith("relations")
              ? 3
              : path.startsWith("ports")
                ? 4
                : path.startsWith("views")
                  ? 5
                  : 6;
    const identifierOf = (path: string): string => {
      if (path === "profileRefs" || path === "mapping" || path === "") return "";
      const firstDot = path.indexOf(".");
      if (firstDot === -1) return path;
      const rest = path.slice(firstDot + 1);
      const secondDot = rest.indexOf(".");
      return secondDot === -1 ? rest : rest.slice(0, secondDot);
    };
    const remainderOf = (path: string): string => {
      if (path === "profileRefs" || path === "mapping" || path === "") return "";
      const firstDot = path.indexOf(".");
      if (firstDot === -1) return "";
      const rest = path.slice(firstDot + 1);
      const secondDot = rest.indexOf(".");
      if (secondDot === -1) return "";
      return rest.slice(secondDot + 1);
    };
    const compareOperations = (
      left: { path: string; action: string },
      right: { path: string; action: string },
    ): number => {
      const sectionLeft = sectionOf(left.path);
      const sectionRight = sectionOf(right.path);
      if (sectionLeft !== sectionRight) return sectionLeft - sectionRight;
      const identifierLeft = identifierOf(left.path);
      const identifierRight = identifierOf(right.path);
      if (identifierLeft < identifierRight) return -1;
      if (identifierLeft > identifierRight) return 1;
      const remainderLeft = remainderOf(left.path);
      const remainderRight = remainderOf(right.path);
      if (remainderLeft < remainderRight) return -1;
      if (remainderLeft > remainderRight) return 1;
      if (left.path < right.path) return -1;
      if (left.path > right.path) return 1;
      if (left.action < right.action) return -1;
      if (left.action > right.action) return 1;
      return 0;
    };
    const sorted = [...outcome.operations].sort(compareOperations);
    expect(sorted.map((operation) => operation.path)).toEqual(paths);
    void archimate2Profile;
    void generic2Profile;
    void uml2Profile;
    void documentRef;
    void scopedOptions;
  });
});
