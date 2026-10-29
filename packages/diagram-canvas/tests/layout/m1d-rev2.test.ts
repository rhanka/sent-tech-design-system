/**
 * M1-d review pass-2 RED probes (must fail on 5688dbf7).
 * Each test reuses Sol's probe shape per the task frame.
 * English in code.
 */
import {
  CURRENT_SCHEMA_VERSION,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  projectView,
  relationRef,
  shippedExecutorBindings,
  validateView,
  formatDiagnostics,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  type DiagramPresentation,
  type Entity,
  type Relation,
  type RelationOccurrence,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";
import { type LayoutHints, layoutDocument, layoutFolded } from "../../src/index.js";
import { buildDocument, measure } from "./fixtures.js";
import {
  asGeneric2Document,
  buildMeasuredDocument,
  geometryOf,
  layMeasured,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

// Item 1 — folding retains the M1-c projection.
describe("REV2 item 1 — folding conserves the projected scene", () => {
  it("conserves 6 occurrences through a collapse with valid provenance", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("C", "container");
    add("a", "node");
    add("b", "node");
    add("lone", "node");
    for (const child of ["a", "b"]) {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("C") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const internal = relationRef("internal");
    relations[internal] = {
      id: internal,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef("a") },
        { role: "target", target: entityRef("b") },
      ],
      attributes: {},
    };
    const external = relationRef("l1");
    relations[external] = {
      id: external,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef("a") },
        { role: "target", target: entityRef("lone") },
      ],
      attributes: {},
    };
    const document: SemanticDocument = {
      documentId: documentRef("rev2-fold-6"),
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
    const presentation = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: { C: { title: "Container" }, a: { title: "Alpha" }, b: { title: "Beta" }, lone: { title: "Lone" } },
    });
    const source = layoutDocument(document, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
    });
    expect(source.status).toBe("laid-out");
    if (source.status !== "laid-out") return;
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
    const entityCount = Object.keys(folded.view.entityOccurrences).length;
    const relationCount = Object.keys(folded.view.relationOccurrences).length;
    expect(entityCount + relationCount).toBe(6);
    expect(
      formatDiagnostics(
        validateView(folded.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
  });

  it("keeps arbitrary source ids, authored titles and dashed style with provenance", async () => {
    const core = await import("@sentropic/diagram-core");
    const { projectView, createView, viewRef } = core as unknown as {
      projectView: (document: SemanticDocument, view: import("@sentropic/diagram-core").ViewDocument, collapsed: readonly import("@sentropic/diagram-core").OccurrenceRef[]) => import("@sentropic/diagram-core").ViewDocument;
      createView: (input: { viewId: import("@sentropic/diagram-core").ViewRef; semanticDocumentId: import("@sentropic/diagram-core").DocumentRef }) => import("@sentropic/diagram-core").ViewDocument;
      viewRef: (id: string) => import("@sentropic/diagram-core").ViewRef;
    };
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("C", "container");
    add("a", "node");
    add("lone", "node");
    for (const child of ["a"]) {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("C") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const link = relationRef("l1");
    relations[link] = {
      id: link,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef("a") },
        { role: "target", target: entityRef("lone") },
      ],
      attributes: {},
    };
    const document: SemanticDocument = {
      documentId: documentRef("rev2-fold-arbitrary"),
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
    const retained = {
      ...createView({ viewId: viewRef("retained"), semanticDocumentId: document.documentId }),
      revision: document.revision,
      entityOccurrences: {
        [occurrenceRef("custom-C")]: {
          id: occurrenceRef("custom-C"),
          entity: entityRef("C"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        [occurrenceRef("custom-a")]: {
          id: occurrenceRef("custom-a"),
          entity: entityRef("a"),
          geometry: { x: 10, y: 10, width: 460, height: 200 },
          group: "grp.8.custom-C",
        },
        [occurrenceRef("custom-lone")]: {
          id: occurrenceRef("custom-lone"),
          entity: entityRef("lone"),
          geometry: { x: 500, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {
        [occurrenceRef("custom-r1")]: {
          id: occurrenceRef("custom-r1"),
          relation: link,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("custom-a") },
            { role: "target", occurrence: occurrenceRef("custom-lone") },
          ],
          strokeStyle: "dashed" as const,
        },
      },
      portOccurrences: {},
      groups: { "grp.8.custom-C": { id: "grp.8.custom-C", occurrence: occurrenceRef("custom-C"), collapsed: false } },
      filters: [],
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: { ...(await import("@sentropic/diagram-core") as unknown as { DIAGRAM_PRESENTATION_CONTRACT_PIN: import("@sentropic/diagram-core").DiagramPresentation["contractPin"] }).DIAGRAM_PRESENTATION_CONTRACT_PIN },
          entities: {
            [occurrenceRef("custom-C")]: { form: "container" as const, text: { title: "Authored Container" } },
            [occurrenceRef("custom-a")]: { form: "card" as const, text: { title: "Authored Alpha" } },
            [occurrenceRef("custom-lone")]: { form: "card" as const, text: { title: "Lone" } },
          },
          legends: {},
          categoryTokens: [],
        },
      },
    } as unknown as import("@sentropic/diagram-core").ViewDocument;
    const projected = projectView(document, retained, [occurrenceRef("custom-C")]);
    expect(Object.keys(projected.entityOccurrences)).toContain(occurrenceRef("custom-a"));
    const presentation = (retained.presentation as unknown as { diagram: import("@sentropic/diagram-core").DiagramPresentation }).diagram;
    const folded = layoutFolded(document, retained, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
      collapsed: [occurrenceRef("custom-C")],
    });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    expect(folded.view.entityOccurrences[occurrenceRef("custom-C")]).toBeDefined();
    expect(folded.view.entityOccurrences[occurrenceRef("custom-a")]).toBeDefined();
    expect(folded.view.relationOccurrences[occurrenceRef("custom-r1")]?.strokeStyle).toBe("dashed");
    const endpoints = folded.view.relationOccurrences[occurrenceRef("custom-r1")]?.endpoints;
    expect(endpoints?.some((endpoint) => endpoint.semanticTarget !== undefined)).toBe(true);
    expect(
      formatDiagnostics(
        validateView(folded.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
  });

  it("conserves a folded port-edge scene with its external relation", async () => {
    const { portRef } = (await import("@sentropic/diagram-core")) as unknown as {
      portRef: (id: string) => import("@sentropic/diagram-core").PortRef;
    };
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("C", "container");
    add("A", "node");
    add("B", "node");
    for (const child of ["A"]) {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("C") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("rev2-port-fold"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations: { ...relations },
      ports: {
        [portRef("pb")]: {
          id: portRef("pb"),
          profile: "generic@2",
          type: "port",
          owner: entityRef("B"),
          name: "pb",
          direction: "inout",
          attributes: {},
        } as unknown as SemanticDocument["ports"][string],
      },
      resources: {},
      extensions: [],
    };
    const link = relationRef("r1");
    (document.relations as Record<string, Relation>)[link] = {
      id: link,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef("A") },
        { role: "target", target: portRef("pb") as unknown as string },
      ],
      attributes: {},
    } as unknown as Relation;
    const presentation = makePresentation({
      forms: { C: "container", A: "card", B: "card" },
      texts: { C: { title: "C" }, A: { title: "A" }, B: { title: "B" } },
    });
    const sourceResult = layoutDocument(document, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
    });
    expect(sourceResult.status).toBe("laid-out");
    if (sourceResult.status !== "laid-out") return;
    const source = { view: sourceResult.view };
    const total =
      Object.keys(source.view.entityOccurrences).length +
      Object.keys(source.view.portOccurrences).length +
      Object.keys(source.view.relationOccurrences).length;
    expect(total).toBe(5);
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
    const foldedTotal =
      Object.keys(folded.view.entityOccurrences).length +
      Object.keys(folded.view.portOccurrences).length +
      Object.keys(folded.view.relationOccurrences).length;
    expect(foldedTotal).toBe(5);
    expect(
      formatDiagnostics(
        validateView(folded.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
  });

  it("emits an authored port occurrence with its own key and no generated twin", () => {
    const genericPortDoc = buildDocument({
      nodes: ["a", "lone"],
      containers: { C: ["a"] },
      ports: { pb: "lone" },
      links: [["r1", "a", "pb"]],
    });
    const portDoc: SemanticDocument = {
      ...asGeneric2Document(genericPortDoc),
      ports: Object.fromEntries(
        Object.entries(genericPortDoc.ports).map(([key, value]) => [key, { ...value, profile: "generic@2" }]),
      ),
    };
    const presentation = makePresentation({ forms: { C: "container", a: "card", lone: "card" } });
    const options = {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
    };
    const source = layoutDocument(portDoc, options);
    expect(source.status).toBe("laid-out");
    if (source.status !== "laid-out") return;
    const base = structuredClone(source.view);
    const oldPort = Object.keys(base.portOccurrences)[0]!;
    const baseRelation = base.relationOccurrences[occurrenceRef("r.r1")]!;
    const authored: ViewDocument = {
      ...base,
      portOccurrences: {
        [occurrenceRef("authored-port")]: {
          ...base.portOccurrences[oldPort]!,
          id: occurrenceRef("authored-port"),
        },
      },
      relationOccurrences: {
        ...base.relationOccurrences,
        [occurrenceRef("r.r1")]: {
          ...baseRelation,
          endpoints: baseRelation.endpoints.map((endpoint) =>
            endpoint.occurrence === oldPort ? { ...endpoint, occurrence: occurrenceRef("authored-port") } : endpoint,
          ),
          strokeStyle: "dashed" as const,
        },
      },
      groups: { g: { id: "g", occurrence: occurrenceOfEntity("C"), collapsed: false } },
      entityOccurrences: {
        ...base.entityOccurrences,
        [occurrenceOfEntity("a")]: { ...base.entityOccurrences[occurrenceOfEntity("a")]!, group: "g" },
      },
    };
    expect(
      formatDiagnostics(
        validateView(authored, portDoc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
    const expected = projectView(portDoc, authored, [occurrenceOfEntity("C")]);
    const countOf = (view: typeof expected): number =>
      Object.keys(view.entityOccurrences).length +
      Object.keys(view.relationOccurrences).length +
      Object.keys(view.portOccurrences).length;
    expect(countOf(expected)).toBe(5);
    const folded = layoutFolded(portDoc, authored, { ...options, collapsed: [occurrenceOfEntity("C")] });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    expect(countOf(folded.view)).toBe(5);
    expect(Object.keys(folded.view.entityOccurrences).sort()).toEqual(
      Object.keys(expected.entityOccurrences).sort(),
    );
    expect(Object.keys(folded.view.relationOccurrences).sort()).toEqual(
      Object.keys(expected.relationOccurrences).sort(),
    );
    expect(Object.keys(folded.view.portOccurrences).sort()).toEqual(
      Object.keys(expected.portOccurrences).sort(),
    );
    expect(
      formatDiagnostics(
        validateView(folded.view, portDoc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
  });

  it("keys the edge-label measurement by the authored relation occurrence", () => {
    const document = asGeneric2Document(buildMeasuredDocument());
    const presentation = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: { C: { title: "Container" }, a: { title: "Alpha" }, b: { title: "Beta" }, lone: { title: "Lone" } },
    });
    const options = {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
    };
    const source = layoutDocument(document, options);
    expect(source.status).toBe("laid-out");
    if (source.status !== "laid-out") return;
    const base = structuredClone(source.view);
    const renamed: Record<string, RelationOccurrence> = {};
    for (const [key, value] of Object.entries(base.relationOccurrences)) {
      if (key === occurrenceRef("r.l1")) {
        renamed[occurrenceRef("drawn-link")] = { ...value, id: occurrenceRef("drawn-link") };
      } else {
        renamed[key] = value;
      }
    }
    const authored: ViewDocument = { ...base, relationOccurrences: renamed };
    const folded = layoutFolded(document, authored, { ...options, collapsed: [occurrenceOfEntity("C")] });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    const edgeSlots = folded.measurements!.slots.filter((slot) => slot.role === "edge-label");
    expect(edgeSlots.map((slot) => slot.occurrence)).toEqual([occurrenceRef("drawn-link")]);
    expect(
      formatDiagnostics(
        validateView(folded.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
  });
});

// Item 2 — fresh synthesis emits presentation.diagram.
describe("REV2 item 2 — fresh synthesis emits presentation.diagram", () => {
  it("persists forms, slots and legend declarations", () => {
    const document = buildMeasuredDocument();
    const presentation = makePresentation({
      forms: { C: "card", a: "card", b: "card", lone: "card" },
      texts: {
        C: { kicker: "Zone", title: "Container" },
        a: { title: "Alpha", body: "alpha body" },
        b: { title: "Beta" },
        lone: { title: "Lone" },
      },
    });
    const result = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
    });
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(result.view.presentation.diagram).toEqual(presentation);
    expect(formatDiagnostics(validateView(result.view, document, { registry: defaultProfileRegistry }))).toBe("");
  });
});

// Item 3 — stretch then ancestors then headers.
describe("REV2 item 3 — stretch before ancestor extents and headers", () => {
  it("gives a columns parent wide enough for two widened children", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container", name?: string): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@1",
        type,
        attributes: { name: { kind: "text", value: name ?? local } },
      };
    };
    add("P", "container", "Parent");
    add("E1", "container", "E1");
    add("E2", "container", "E2 with a very long title that drives its computed width far beyond the narrow sibling and forces stretch to widen the narrow one to match it exactly here");
    add("k1", "node", "k1");
    add("k2", "node", "k2");
    const contain = (parent: string, child: string): void => {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@1",
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
    contain("E1", "k1");
    contain("E2", "k2");
    const document: SemanticDocument = {
      documentId: documentRef("rev2-stretch-cols"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@1"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { P: "card", E1: "card", E2: "card", k1: "card", k2: "card" },
      texts: {
        P: { title: "Parent" },
        E1: { title: "E1" },
        E2: { title: "E2 with a very long title that drives its computed width far beyond the narrow sibling and forces stretch to widen the narrow one to match it exactly here" },
        k1: { title: "k1" },
        k2: { title: "k2" },
      },
    });
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured(document, presentation, measurer, {
      hints: {
        grouping: [{ id: "cols", direction: "columns", stretch: true, items: [entityRef("E1"), entityRef("E2")] }],
      },
    });
    const pWidth = geometryOf(measured.view, "P").width;
    const e1Width = geometryOf(measured.view, "E1").width;
    const e2Width = geometryOf(measured.view, "E2").width;
    expect(e1Width).toBe(e2Width);
    expect(pWidth).toBe(e1Width + 24 + e2Width + 32);
    expect(pWidth).toBeGreaterThan(1612);
    const titleCall = measurer.calls.find((call) => call.role === "title" && call.text === "Parent");
    expect(titleCall).toBeDefined();
  });
});

// Item 3b — eleven-level columns reach their fixed point in one layout.
describe("REV2 item 3b — eleven-level stretched columns", () => {
  const DEPTH = 11;
  const buildDeep = (): { document: SemanticDocument; presentation: DiagramPresentation; hints: LayoutHints } => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@1",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("leaf", "node");
    for (let level = 0; level < DEPTH; level += 1) {
      add(`A${level}`, "container");
      add(`B${level}`, "container");
      add(`b${level}`, "node");
    }
    add(`A${DEPTH}`, "container");
    const contain = (parent: string, child: string): void => {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: "generic@1",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    for (let level = 0; level < DEPTH; level += 1) {
      contain(`A${level}`, `A${level + 1}`);
      contain(`A${level}`, `B${level}`);
      contain(`B${level}`, `b${level}`);
    }
    contain(`A${DEPTH}`, "leaf");
    const document: SemanticDocument = {
      documentId: documentRef("rev2-stretch-deep"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@1"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const title = `${"a ".repeat(80)}`;
    const presentation = makePresentation({
      forms: {
        ...Object.fromEntries(Array.from({ length: DEPTH + 1 }, (_, level) => [`A${level}`, "card"])),
        ...Object.fromEntries(Array.from({ length: DEPTH }, (_, level) => [`B${level}`, "card"])),
        leaf: "card",
        ...Object.fromEntries(Array.from({ length: DEPTH }, (_, level) => [`b${level}`, "card"])),
      },
      texts: { [`A${DEPTH}`]: { title } },
    });
    const hints = {
      grouping: Array.from({ length: DEPTH }, (_, level) => ({
        id: `g${level}`,
        direction: "columns" as const,
        stretch: true,
        items: [entityRef(`A${level + 1}`), entityRef(`B${level}`)],
      })),
    };
    return { document, presentation, hints };
  };

  it("equalises every stretched sibling pair, contains children and measures the header at the final width", async () => {
    const { headerAvailableWidth, innerWidthOf, UNWRAPPED_PROBE_WIDTH } = await import("../../src/index.js");
    const { document, presentation, hints } = buildDeep();
    const title = "a ".repeat(80);
    const measurer = wordWrapMeasurer();
    const measured = layMeasured(document, presentation, measurer, { hints });
    expect(Object.keys(document.entities)).toHaveLength(35);
    for (let level = 0; level < DEPTH; level += 1) {
      expect(geometryOf(measured.view, `A${level + 1}`).width).toBe(geometryOf(measured.view, `B${level}`).width);
    }
    for (const [parent, child] of Object.entries({
      [`A${DEPTH}`]: ["leaf"],
      ...Object.fromEntries(
        Array.from({ length: DEPTH }, (_, level) => [`A${level}`, [`A${level + 1}`, `B${level}`]]),
      ),
      ...Object.fromEntries(Array.from({ length: DEPTH }, (_, level) => [`B${level}`, [`b${level}`]])),
    }).flatMap(([parent, children]) => (children as readonly string[]).map((child) => [parent, child] as const))) {
      const outer = geometryOf(measured.view, parent);
      const inner = geometryOf(measured.view, child);
      expect(inner.x).toBeGreaterThanOrEqual(outer.x);
      expect(inner.y).toBeGreaterThanOrEqual(outer.y);
      expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width);
      expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height);
    }
    const deepest = geometryOf(measured.view, `A${DEPTH}`);
    const probeWidth = headerAvailableWidth(UNWRAPPED_PROBE_WIDTH, true);
    const finals = measurer.calls.filter(
      (call) => call.role === "title" && call.text === title && call.availableWidth !== probeWidth,
    );
    expect(finals.map((call) => call.availableWidth)).toEqual([
      headerAvailableWidth(innerWidthOf(deepest.width), true),
    ]);
  });

  it("stays byte-identical across record-insertion permutations", async () => {
    const { serialiseView } = await import("@sentropic/diagram-core");
    const { shuffled } = await import("./fixtures.js");
    const { document, presentation, hints } = buildDeep();
    const reference = serialiseView(layMeasured(document, presentation, wordWrapMeasurer(), { hints }).view);
    for (const seed of [1, 2, 3, 4, 5]) {
      expect(serialiseView(layMeasured(shuffled(document, seed), presentation, wordWrapMeasurer(), { hints }).view)).toBe(
        reference,
      );
    }
  });
});

// Item 4 — nested stretch:false respected under outer/global stretch.
describe("REV2 item 4 — nested stretch false stays narrow", () => {
  it("keeps the disabled expanded member at 492", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container", name?: string): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@1",
        type,
        attributes: { name: { kind: "text", value: name ?? local } },
      };
    };
    add("E1", "container", "E1");
    add("E2", "container", "E2 with a very long title that drives its computed width far beyond the narrow sibling and forces stretch to widen the narrow one to match it exactly here");
    add("k1", "node", "k1");
    add("k2", "node", "k2");
    const contain = (parent: string, child: string): void => {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@1",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    contain("E1", "k1");
    contain("E2", "k2");
    const document: SemanticDocument = {
      documentId: documentRef("rev2-nested-false"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@1"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { E1: "card", E2: "card", k1: "card", k2: "card" },
      texts: {
        E1: { title: "E1" },
        E2: {
          title:
            "E2 with a very long title that drives its computed width far beyond the narrow sibling and forces stretch to widen the narrow one to match it exactly here",
        },
        k1: { title: "k1" },
        k2: { title: "k2" },
      },
    });
    const measured = layMeasured(document, presentation, wordWrapMeasurer(), {
      hints: {
        grouping: [
          {
            id: "outer",
            direction: "rows",
            stretch: true,
            items: [{ id: "inner", direction: "rows", stretch: false, items: [entityRef("E1")] }, entityRef("E2")],
          },
        ],
      },
    });
    expect(geometryOf(measured.view, "E1").width).toBe(492);
  });
});

// Item 5 — discriminating witness (c) for a toggle-bearing occurrence.
describe("REV2 item 5 — toggle-bearing collapsed header wraps at the reduced width", () => {
  it("asserts the collapsed container title array measured at the reduced width", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("C", "container");
    add("a", "node");
    add("b", "node");
    for (const child of ["a", "b"]) {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("C") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("rev2-witness-c"),
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
    const title = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau";
    const presentation = makePresentation({
      forms: { C: "container", a: "card", b: "card" },
      texts: { C: { title }, a: { title: "Alpha" }, b: { title: "Beta" } },
    });
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const result = layoutDocument(document, {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: measurer,
      bindings: shippedExecutorBindings,
      collapsed: [occurrenceOfEntity("C")],
    });
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out" || result.measurements === undefined) return;
    const measured = { headers: result.measurements.headers };
    const header = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"))!;
    const reduced = wordWrapMeasurer({ charWidth: 8 })({
      text: title,
      role: "title",
      availableWidth: 396,
      allocatedLines: 2,
      folded: true,
    });
    const full = wordWrapMeasurer({ charWidth: 8 })({
      text: title,
      role: "title",
      availableWidth: 428,
      allocatedLines: 2,
      folded: true,
    });
    expect(JSON.stringify(reduced.lines)).not.toBe(JSON.stringify(full.lines));
    expect(header.title.lines).toEqual(reduced.lines);
  });
});

// Item 7 — hint ownership independent of group id equality.
describe("REV2 item 7 — duplicate claim refused even with equal group ids", () => {
  it("refuses two groups both named g1 claiming a", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@1",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("P", "container");
    add("a", "node");
    add("b", "node");
    for (const child of ["a", "b"]) {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@1",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("P") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("rev2-hint-dup-id"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@1"],
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
          { id: "g1", direction: "rows", items: [entityRef("a"), entityRef("b")] },
        ],
      },
    });
    expect(result.status).toBe("refused");
    if (result.status === "refused") {
      expect(result.refusals.map((refusal) => refusal.code)).toContain("layout-hint-invalid");
    }
  });
});

// Item 8 — one docking-overflow per occurrence.
describe("REV2 item 8 — docking overflow aggregates sides", () => {
  it("emits one warning for a hub overflowing two sides", () => {
    const before: string[] = Array.from({ length: 45 }, (_, index) => `a${String(index).padStart(2, "0")}`);
    const after: string[] = Array.from({ length: 45 }, (_, index) => `z${String(index).padStart(2, "0")}`);
    const nodes = [...before, "mmm", ...after];
    const links: readonly (readonly [string, string, string])[] = [
      ...before.map(
        (target, index) => [`link.a${String(index).padStart(2, "0")}`, "mmm", target] as const,
      ),
      ...after.map((target, index) => [`link.z${String(index).padStart(2, "0")}`, "mmm", target] as const),
    ];
    const document = buildDocument({ nodes, links });
    const forms: Record<string, "card"> = { mmm: "card" };
    for (const target of [...before, ...after]) forms[target] = "card";
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer());
    const docking = measured.warnings.filter((warning) => warning.code === "docking-overflow");
    const hubWarnings = docking.filter((warning) => warning.refs.includes(occurrenceOfEntity("mmm")));
    expect(hubWarnings.length).toBe(1);
    expect(hubWarnings[0]!.refs).toEqual([occurrenceOfEntity("mmm")]);
  });
});

// Item 9 — legend-key fixed height overflow.
describe("REV2 item 9 — legend-key height overflow warns", () => {
  it("warns when a two-line label of height 80 sits in a 64-high key", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@1",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("LG", "container");
    add("k1", "node");
    for (const child of ["k1"]) {
      const r = relationRef(`contains.${child}`);
      relations[r] = {
        id: r,
        profile: "generic@1",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("LG") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("rev2-legend-height"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@1"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = makePresentation({
      forms: { LG: "legend", k1: "legend-key" },
      texts: { LG: { title: "Legend" }, k1: { title: "First tone with enough words to wrap to two lines here" } },
      legends: { LG: ["k1"] },
    });
    const tallMeasurer = ((request: Parameters<ReturnType<typeof wordWrapMeasurer>>[0]) => {
      const base = wordWrapMeasurer({ charWidth: 8 })(request);
      if (request.role === "legend-label" && base.lines.length === 2) {
        return { ...base, height: 80, overflow: false };
      }
      return base;
    }) as ReturnType<typeof wordWrapMeasurer>;
    const result = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: tallMeasurer,
    });
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    const codes = result.warnings.map((warning) => warning.code);
    expect(codes).toContain("card-overflow");
  });
});
