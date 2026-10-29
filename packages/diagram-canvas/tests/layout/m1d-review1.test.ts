/**
 * M1-d review pass 1 RED probes (must fail on c2face1d).
 * Each test reuses Sol's probe shape per the task frame.
 * English in code.
 */
import {
  CURRENT_SCHEMA_VERSION,
  defaultProfileRegistry,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  entityRef,
  formatDiagnostics,
  GENERIC_PROFILE_ID,
  m3ProfileRegistry,
  occurrenceRef,
  projectView,
  relationRef,
  shippedExecutorBindings,
  validateView,
  type Entity,
  type EntityOccurrence,
  type OccurrenceRef,
  type Relation,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { buildScene, layoutDocument } from "../../src/index.js";
import { buildDocument, measure } from "./fixtures.js";
import {
  asGeneric2Document,
  buildMeasuredDocument,
  geometryOf,
  layMeasured,
  layMeasured2,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

function buildLegendDocument(): SemanticDocument {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const add = (local: string, type: "legend" | "legend-key"): void => {
    const ref = entityRef(local);
    entities[ref] = {
      id: ref,
      profile: "generic@2",
      type,
      attributes: { name: { kind: "text", value: local } },
    };
  };
  add("LG", "legend");
  add("k1", "legend-key");
  add("k2", "legend-key");
  for (const key of ["k1", "k2"]) {
    const ref = entityRef(key);
    entities[ref] = {
      ...(entities[ref] as Entity),
      attributes: {
        ...(entities[ref] as Entity).attributes,
        category: { kind: "text", value: key },
        description: { kind: "text", value: `${key} tone` },
      },
    };
  }
  for (const child of ["k1", "k2"]) {
    const relation = relationRef(`contains.${child}`);
    relations[relation] = {
      id: relation,
      profile: "generic@2",
      type: "contains",
      endpoints: [
        { role: "parent", target: entityRef("LG") },
        { role: "child", target: entityRef(child) },
      ],
      attributes: {},
    };
  }
  return {
    documentId: documentRef("m1d-legend-red"),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: [],
  };
}

describe("RED item 1 — occurrence-keyed presentation", () => {
  it("keeps authored legend text and yields a 64-high key", () => {
    const document = buildLegendDocument();
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        [occurrenceOfEntity("LG")]: {
          form: "legend" as const,
          text: { kicker: "Key", title: "Legend authored", subtitle: "tones" },
        },
        [occurrenceOfEntity("k1")]: { form: "legend-key" as const, text: { title: "First tone authored" } },
        [occurrenceOfEntity("k2")]: { form: "legend-key" as const, text: { title: "Second tone authored" } },
      },
      legends: {
        [occurrenceOfEntity("LG")]: { order: [entityRef("k1"), entityRef("k2")] },
      },
      categoryTokens: [],
    };
    const measured = layMeasured2(document, presentation, wordWrapMeasurer({ charWidth: 8 }));
    const key = geometryOf(measured.view, "k1");
    expect(key.height).toBe(64);
    const label = measured.slots.find(
      (slot) => slot.occurrence === occurrenceOfEntity("k1") && slot.role === "legend-label",
    )!;
    expect(label.layout.lines.join(" ")).toBe("First tone authored");
  });
});

describe("RED item 4 — recursive group extents before header", () => {
  it("widens a columns parent to 976 for two 460 cards", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("P", "container");
    add("a", "node");
    add("b", "node");
    for (const child of ["a", "b"]) {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("P") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("m1d-columns-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { P: "card", a: "card", b: "card" },
      texts: { P: { title: "P" }, a: { title: "Alpha" }, b: { title: "Beta" } },
    });
    const measured = layMeasured(document, presentation, wordWrapMeasurer(), {
      hints: {
        grouping: [{ id: "cols", direction: "columns", items: [entityRef("a"), entityRef("b")] }],
      },
    });
    const parent = geometryOf(measured.view, "P");
    expect(parent.width).toBe(976);
    const ax = geometryOf(measured.view, "a").x;
    const bx = geometryOf(measured.view, "b").x;
    expect(bx).toBeGreaterThan(ax);
    expect(bx).toBeLessThan(parent.width);
  });
});

describe("RED item 7 — synthesis requires a LineMeasurer", () => {
  it("refuses measured layout without measureLines", () => {
    const document = buildMeasuredDocument();
    const presentation = makePresentation({
      forms: { C: "card", a: "card", b: "card", lone: "card" },
    });
    const result = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
    });
    expect(result.status).toBe("refused");
    if (result.status === "refused") {
      expect(result.refusals.map((refusal) => refusal.code)).toContain("measure-lines-missing");
    }
  });
});

describe("RED item 9 — gapAfter replaces the inherited gap", () => {
  it("uses an explicit gapAfter of 10, not 34", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("P", "container");
    add("a", "node");
    add("b", "node");
    for (const child of ["a", "b"]) {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("P") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("m1d-gap-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { P: "card", a: "card", b: "card" },
    });
    const measured = layMeasured(document, presentation, wordWrapMeasurer(), {
      hints: {
        grouping: [
          { id: "first", direction: "rows", gapAfter: 10, items: [entityRef("a")] },
          { id: "second", direction: "rows", items: [entityRef("b")] },
        ],
      },
    });
    const ay = geometryOf(measured.view, "a").y;
    const by = geometryOf(measured.view, "b").y;
    expect(by - (ay + 200)).toBe(10);
  });
});

describe("RED item 8 — hint ownership across groups", () => {
  it("refuses a duplicate leaf across two top-level groups", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("P", "container");
    add("a", "node");
    add("b", "node");
    for (const child of ["a", "b"]) {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("P") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("m1d-dup-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const result = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation: makePresentation({ forms: { P: "card", a: "card", b: "card" } }),
      measureLines: wordWrapMeasurer(),
      hints: {
        grouping: [
          { id: "g1", direction: "rows", items: [entityRef("a")] },
          { id: "g2", direction: "rows", items: [entityRef("a"), entityRef("b")] },
        ],
      },
    });
    expect(result.status).toBe("refused");
    if (result.status === "refused") {
      expect(result.refusals.map((refusal) => refusal.code)).toContain("layout-hint-invalid");
    }
  });
});

describe("RED item 12 — depth-dependent paint planes", () => {
  it("paints a nested container above its encloser", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("Z", "container");
    add("A", "container");
    add("leaf", "node");
    const contain = (parent: string, child: string): void => {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    contain("Z", "A");
    contain("A", "leaf");
    const document: SemanticDocument = {
      documentId: documentRef("m1d-depth-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const measured = layMeasured(
      document,
      makePresentation({ forms: { Z: "card", A: "card", leaf: "card" } }),
      wordWrapMeasurer(),
    );
    const zOuter = measured.view.entityOccurrences[occurrenceRef("e.Z")]!.z;
    const zInner = measured.view.entityOccurrences[occurrenceRef("e.A")]!.z;
    expect(zInner).toBeGreaterThan(zOuter ?? -10);
  });
});

describe("RED item 2 — valid generic@2 executes", () => {
  it("lays out a generic@2 document through the shared resolver", async () => {
    const core = await import("@sentropic/diagram-core");
    const registry = (core as unknown as { m3ProfileRegistry: unknown }).m3ProfileRegistry as Parameters<
      typeof layoutDocument
    >[1]["registry"];
    const bindings = (core as unknown as { shippedExecutorBindings: unknown }).shippedExecutorBindings as never;
    const base = {
      documentId: documentRef("m1d-generic2-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        [entityRef("c")]: {
          id: entityRef("c"),
          profile: "generic@2",
          type: "container",
          attributes: { name: { kind: "text", value: "C" } },
        },
        [entityRef("n")]: {
          id: entityRef("n"),
          profile: "generic@2",
          type: "node",
          attributes: { name: { kind: "text", value: "N" } },
        },
      },
      relations: {
        [relationRef("cn")]: {
          id: relationRef("cn"),
          profile: "generic@2",
          type: "contains",
          endpoints: [
            { role: "parent", target: entityRef("c") },
            { role: "child", target: entityRef("n") },
          ],
          attributes: {},
        },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SemanticDocument;
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        [occurrenceOfEntity("c")]: { form: "card" as const, text: { title: "C" } },
        [occurrenceOfEntity("n")]: { form: "card" as const, text: { title: "N" } },
      },
      legends: {},
      categoryTokens: [],
    };
    const result = layoutDocument(base, {
      registry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings,
    } as unknown as Parameters<typeof layoutDocument>[1]);
    expect(result.status).toBe("laid-out");
  });
});

describe("RED item 3 — folding through projectView", () => {
  it("conserves the scene and clears with collapsed []", async () => {
    const { layoutFolded } = await import("../../src/index.js");
    const document = asGeneric2Document(buildMeasuredDocument());
    const presentation = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: { C: { title: "Container" }, a: { title: "Alpha" }, b: { title: "Beta" }, lone: { title: "Lone" } },
    });
    const source = layMeasured2(document, presentation, wordWrapMeasurer());
    const folded = layoutFolded(document, source.view, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
      collapsed: [occurrenceOfEntity("C")],
    });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    expect(folded.view.entityOccurrences[occurrenceOfEntity("a")]).toBeDefined();
    expect(folded.view.entityOccurrences[occurrenceOfEntity("b")]).toBeDefined();
    const relationIds = Object.values(folded.view.relationOccurrences).map((occurrence) => occurrence.relation);
    expect(relationIds).toContain(relationRef("l1"));
    expect(folded.view.groups["grp.3.e.C"]?.collapsed).toBe(true);
    // The synthesized source carries the nested memberships, the folded
    // relation names its projected representative with provenance, the scene
    // excludes the hidden members, and the route attaches to the
    // representative, never to the hidden member.
    expect(source.view.entityOccurrences[occurrenceOfEntity("a")]?.group).toBe("grp.3.e.C");
    expect(source.view.entityOccurrences[occurrenceOfEntity("b")]?.group).toBe("grp.3.e.C");
    expect(source.view.groups["grp.3.e.C"]?.occurrence).toBe(occurrenceOfEntity("C"));
    const endpoints = folded.view.relationOccurrences[occurrenceRef("r.l1")]!.endpoints;
    expect(endpoints).toEqual([
      {
        role: "source",
        occurrence: occurrenceOfEntity("C"),
        semanticTarget: entityRef("a"),
        sourceOccurrence: occurrenceOfEntity("a"),
      },
      { role: "target", occurrence: occurrenceOfEntity("lone") },
    ]);
    const waypoints = folded.view.relationOccurrences[occurrenceRef("r.l1")]!.waypoints ?? [];
    expect(waypoints.length).toBeGreaterThan(0);
    const boxOfOccurrence = (id: OccurrenceRef): { x: number; y: number; width: number; height: number } =>
      folded.view.entityOccurrences[id]!.geometry;
    const sourceBox = boxOfOccurrence(endpoints[0]!.occurrence);
    const targetBox = boxOfOccurrence(endpoints[1]!.occurrence);
    const first = waypoints[0]!;
    const last = waypoints[waypoints.length - 1]!;
    expect(first.x).toBeGreaterThanOrEqual(sourceBox.x);
    expect(first.x).toBeLessThanOrEqual(sourceBox.x + sourceBox.width);
    expect(first.y).toBeGreaterThanOrEqual(sourceBox.y);
    expect(first.y).toBeLessThanOrEqual(sourceBox.y + sourceBox.height);
    expect(last.x).toBeGreaterThanOrEqual(targetBox.x);
    expect(last.x).toBeLessThanOrEqual(targetBox.x + targetBox.width);
    expect(last.y).toBeGreaterThanOrEqual(targetBox.y);
    expect(last.y).toBeLessThanOrEqual(targetBox.y + targetBox.height);
    const frame = buildScene(
      { document, views: { [folded.view.viewId]: folded.view } },
      folded.view.viewId,
    );
    expect(frame.exclusions).toContainEqual({
      occurrence: occurrenceOfEntity("a"),
      kind: "entity",
      reason: "group-collapsed",
      cause: "grp.3.e.C",
    });
    expect(frame.exclusions).toContainEqual({
      occurrence: occurrenceOfEntity("b"),
      kind: "entity",
      reason: "group-collapsed",
      cause: "grp.3.e.C",
    });
    expect(frame.items.some((item) => item.occurrence === occurrenceOfEntity("a"))).toBe(false);
    const edge = frame.items.find((item) => item.occurrence === occurrenceRef("r.l1"));
    if (edge?.kind !== "edge") throw new Error("folded relation r.l1 draws no scene edge");
    const boxOf = (local: string): { x: number; y: number; width: number; height: number } =>
      folded.view.entityOccurrences[occurrenceOfEntity(local)]!.geometry;
    const centreOf = (box: { x: number; y: number; width: number; height: number }): { x: number; y: number } => ({
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    });
    expect(edge.path[0]).toEqual(centreOf(boxOf("C")));
    expect(edge.path[edge.path.length - 1]).toEqual(centreOf(boxOf("lone")));
    const restored = layoutFolded(document, folded.view, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
      collapsed: [],
    });
    expect(restored.status).toBe("laid-out");
    if (restored.status !== "laid-out") return;
    expect(Object.keys(restored.view.entityOccurrences).sort()).toEqual(
      Object.keys(source.view.entityOccurrences).sort(),
    );
  });

  it("routes the authored grouping through its projected representative", async () => {
    const { layoutFolded } = await import("../../src/index.js");
    const document = asGeneric2Document(buildMeasuredDocument());
    const presentation = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: { C: { title: "Container" }, a: { title: "Alpha" }, b: { title: "Beta" }, lone: { title: "Lone" } },
    });
    const source = layMeasured2(document, presentation, wordWrapMeasurer());
    const base = structuredClone(source.view);
    const ungroup = (id: OccurrenceRef): EntityOccurrence => {
      const { group: _dropped, ...rest } = base.entityOccurrences[id]!;
      void _dropped;
      return rest;
    };
    const authored: ViewDocument = {
      ...base,
      groups: { g: { id: "g", occurrence: occurrenceOfEntity("C"), collapsed: false } },
      entityOccurrences: {
        ...base.entityOccurrences,
        [occurrenceOfEntity("a")]: ungroup(occurrenceOfEntity("a")),
        [occurrenceOfEntity("b")]: ungroup(occurrenceOfEntity("b")),
        [occurrenceOfEntity("lone")]: { ...base.entityOccurrences[occurrenceOfEntity("lone")]!, group: "g" },
      },
    };
    expect(
      formatDiagnostics(
        validateView(authored, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
    const expected = projectView(document, authored, [occurrenceOfEntity("C")]);
    expect(expected.relationOccurrences[occurrenceRef("r.l1")]!.endpoints).toEqual([
      { role: "source", occurrence: occurrenceOfEntity("a") },
      {
        role: "target",
        occurrence: occurrenceOfEntity("C"),
        semanticTarget: entityRef("lone"),
        sourceOccurrence: occurrenceOfEntity("lone"),
      },
    ]);
    const result = layoutFolded(document, authored, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
      collapsed: [occurrenceOfEntity("C")],
    });
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(result.view.relationOccurrences[occurrenceRef("r.l1")]!.endpoints).toEqual(
      expected.relationOccurrences[occurrenceRef("r.l1")]!.endpoints,
    );
    const emitted = result.view.relationOccurrences[occurrenceRef("r.l1")]!.endpoints;
    const waypoints = result.view.relationOccurrences[occurrenceRef("r.l1")]!.waypoints ?? [];
    expect(waypoints.length).toBeGreaterThan(0);
    const boxOfOccurrence = (id: OccurrenceRef): { x: number; y: number; width: number; height: number } =>
      result.view.entityOccurrences[id]!.geometry;
    const sourceBox = boxOfOccurrence(emitted[0]!.occurrence);
    const targetBox = boxOfOccurrence(emitted[1]!.occurrence);
    const first = waypoints[0]!;
    const last = waypoints[waypoints.length - 1]!;
    expect(first.x).toBeGreaterThanOrEqual(sourceBox.x);
    expect(first.x).toBeLessThanOrEqual(sourceBox.x + sourceBox.width);
    expect(first.y).toBeGreaterThanOrEqual(sourceBox.y);
    expect(first.y).toBeLessThanOrEqual(sourceBox.y + sourceBox.height);
    expect(last.x).toBeGreaterThanOrEqual(targetBox.x);
    expect(last.x).toBeLessThanOrEqual(targetBox.x + targetBox.width);
    expect(last.y).toBeGreaterThanOrEqual(targetBox.y);
    expect(last.y).toBeLessThanOrEqual(targetBox.y + targetBox.height);
    const frame = buildScene({ document, views: { [result.view.viewId]: result.view } }, result.view.viewId);
    const edge = frame.items.find((item) => item.occurrence === occurrenceRef("r.l1"));
    if (edge?.kind !== "edge") throw new Error("authored relation r.l1 draws no scene edge");
    const centreOfOccurrence = (id: OccurrenceRef): { x: number; y: number } => {
      const box = result.view.entityOccurrences[id]!.geometry;
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    expect(edge.path[0]).toEqual(centreOfOccurrence(occurrenceOfEntity("a")));
    expect(edge.path[edge.path.length - 1]).toEqual(centreOfOccurrence(occurrenceOfEntity("C")));
  });
});

describe("RED item 5 — stretch per group and member", () => {
  it("stretches expanded root siblings under local stretch", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("P1", "container");
    add("P2", "container");
    add("a", "node");
    const contain = (parent: string, child: string): void => {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    contain("P1", "a");
    const document: SemanticDocument = {
      documentId: documentRef("m1d-stretch-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { P1: "card", P2: "card", a: "card" },
      texts: { P1: { title: "P1" }, P2: { title: "P2" }, a: { title: "Alpha" } },
    });
    const measured = layMeasured(document, presentation, wordWrapMeasurer(), {
      hints: {
        grouping: [{ id: "roots", direction: "rows", stretch: true, items: [entityRef("P1"), entityRef("P2")] }],
      },
    });
    const w1 = geometryOf(measured.view, "P1").width;
    const w2 = geometryOf(measured.view, "P2").width;
    expect(w1).toBe(w2);
    expect(w1).toBeGreaterThan(460);
  });

  it("lets local false override a global true", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("P", "container");
    add("E1", "container");
    add("E2", "container");
    add("k", "node");
    const contain = (parent: string, child: string): void => {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    contain("P", "E1");
    contain("P", "E2");
    contain("E1", "k");
    const document: SemanticDocument = {
      documentId: documentRef("m1d-stretch-local-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { P: "card", E1: "card", E2: "card", k: "card" },
    });
    const measured = layMeasured(document, presentation, wordWrapMeasurer(), {
      hints: {
        stretch: true,
        grouping: [
          {
            id: "outer",
            direction: "rows",
            stretch: true,
            items: [
              {
                id: "inner",
                direction: "rows",
                stretch: false,
                items: [entityRef("E1"), entityRef("E2")],
              },
            ],
          },
        ],
      },
    });
    expect(geometryOf(measured.view, "E1").width).toBe(460 + 32);
    expect(geometryOf(measured.view, "E2").width).toBe(460);
  });
});

describe("RED item 6 — fixed-box docking keeps declared spacing", () => {
  it("counts distinct slots and keeps 12px fitted spacing", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type: "node",
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("hub");
    const targets: string[] = [];
    for (let index = 0; index < 45; index += 1) {
      const target = `t${String(index).padStart(2, "0")}`;
      targets.push(target);
      add(target);
      const relation = relationRef(`link.${target}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "link",
        endpoints: [
          { role: "source", target: entityRef("hub") },
          { role: "target", target: entityRef(target) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("m1d-dock-red"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const forms: Record<string, "card"> = { hub: "card" };
    for (const target of targets) forms[target] = "card";
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer());
    const docking = measured.warnings.filter((warning) => warning.code === "docking-overflow");
    expect(docking.length).toBeGreaterThanOrEqual(1);
    const hubWarning = docking.find((warning) => warning.refs.includes(occurrenceOfEntity("hub")))! as unknown as {
      refs: readonly string[];
      details?: Record<string, unknown>;
    };
    expect(hubWarning.details?.["required"]).toBe(45);
    expect((hubWarning.details?.["fitted"] as number) < 45).toBe(true);
    expect(hubWarning.refs).toEqual([occurrenceOfEntity("hub")]);
    expect(geometryOf(measured.view, "hub")).toMatchObject({ width: 460, height: 200 });
  });

  it("shares one slot for a shared port", () => {
    const links: readonly (readonly [string, string, string])[] = Array.from({ length: 45 }, (_, index) => [
      `link.${String(index).padStart(2, "0")}`,
      "hubPort",
      `t${String(index).padStart(2, "0")}`,
    ]);
    const document = buildDocument({
      nodes: ["hub", ...Array.from({ length: 45 }, (_, index) => `t${String(index).padStart(2, "0")}`)],
      links,
      ports: { hubPort: "hub" },
    });
    const forms: Record<string, "card"> = { hub: "card" };
    for (let index = 0; index < 45; index += 1) forms[`t${String(index).padStart(2, "0")}`] = "card";
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer());
    const docking = measured.warnings.filter((warning) => warning.code === "docking-overflow");
    const hubWarnings = docking.filter((warning) => warning.refs.includes(occurrenceOfEntity("hub")));
    expect(hubWarnings.length).toBe(0);
  });
});
