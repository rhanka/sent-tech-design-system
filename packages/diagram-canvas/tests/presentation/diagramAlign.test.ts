import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  createView,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  validateView,
  viewRef,
} from "@sentropic/diagram-core";
import {
  cardLineMeasurer,
  defaultCardMeasure,
  layoutCard,
  layoutZone,
  projectCardProps,
  projectZoneProps,
} from "../../src/presentation/diagramCardModel.js";
import {
  layoutScene,
  type SceneDocument,
  type ScenePresentation,
  type SceneView,
} from "../../src/presentation/diagramSceneModel.js";

/**
 * DE-1 step 2 — alignment carried by the presentation and passed by the
 * projectors to `layoutCard`/`layoutZone` (both hosts share the projectors
 * by re-export, so parity holds by construction). Governed
 * `diagram-presentation@1` bytes stay untouched: `align` travels as an
 * additive canvas-side pin (`AlignPinned` pattern), absent means `"left"`.
 */
describe("diagram presentation alignment (DE-1 step 2)", () => {
  it("should keep left alignment frozen when no pin is present", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" } },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect(card.props.align).toBeUndefined();
    const layout = layoutCard(card.props, defaultCardMeasure);
    expect(layout.title[0]?.anchor).toBe("start");
  });

  it("should pass the presentation align pin through projectCardProps", () => {
    for (const align of ["left", "center"] as const) {
      const card = projectCardProps(
        { form: "card", text: { title: "T" }, align },
        { entityId: "occurrence:e.1" },
      );
      expect(card.kind).toBe("card");
      if (card.kind !== "card") return;
      expect(card.props.align).toBe(align);
    }
  });

  it("should prefer the presentation pin over the opts fallback", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" }, align: "left" },
      { entityId: "occurrence:e.1", align: "center" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect(card.props.align).toBe("left");
    const fallback = projectCardProps(
      { form: "card", text: { title: "T" } },
      { entityId: "occurrence:e.2", align: "center" },
    );
    expect(fallback.kind).toBe("card");
    if (fallback.kind !== "card") return;
    expect(fallback.props.align).toBe("center");
  });

  it("should centre the title line on the middle anchor when pinned center", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "Centred" }, align: "center" },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    const layout = layoutCard(card.props, defaultCardMeasure);
    expect(layout.title[0]?.anchor).toBe("middle");
    expect(layout.title[0]?.x).toBe(layout.headerTextX + layout.headerTextWidth / 2);
  });

  it("should pass the presentation align pin through projectZoneProps folded and unfolded", () => {
    for (const collapsed of [true, false]) {
      const zone = projectZoneProps(
        { form: "container", text: { title: "Z" }, align: "center" },
        { entityId: "occurrence:e.2", collapsed, toggleLabel: "Toggle" },
      );
      expect(zone.kind).toBe("zone");
      if (zone.kind !== "zone") return;
      expect(zone.props.align).toBe("center");
      const layout = layoutZone(
        { ...zone.props, width: 600 },
        defaultCardMeasure,
      );
      if (collapsed) {
        expect(layout.collapsed).toBe(true);
      } else {
        expect(layout.collapsed).toBe(false);
        expect(layout.header?.title[0]?.anchor).toBe("middle");
      }
    }
  });

  it("should keep zone alignment left by default for v1 and center by default for v2", () => {
    const plain = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.2", collapsed: true },
    );
    expect(plain.kind).toBe("zone");
    if (plain.kind !== "zone") return;
    expect(plain.props.align).toBeUndefined();
    expect(layoutZone({ ...plain.props, collapsed: false, width: 600 }, defaultCardMeasure).header?.title[0]?.anchor).toBe("start");
    const compact = projectZoneProps(
      { form: "container", text: { title: "Z" }, anatomy: "v2" },
      { entityId: "occurrence:e.4", collapsed: false },
    );
    expect(compact.kind).toBe("zone");
    if (compact.kind !== "zone") return;
    expect(layoutZone({ ...compact.props, width: 600 }, defaultCardMeasure).header?.title[0]?.anchor).toBe("middle");
    const compactLeft = layoutZone({ ...compact.props, width: 600, align: "left" }, defaultCardMeasure);
    expect(compactLeft.header?.title[0]?.anchor).toBe("start");
    const fallback = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.3", collapsed: false, align: "center" },
    );
    expect(fallback.kind).toBe("zone");
    if (fallback.kind !== "zone") return;
    expect(fallback.props.align).toBe("center");
  });

  it("should emit ViewDocuments from layoutScene/layoutMeasured that pass validateView for @1 and @2 DE-1 scenes", () => {
    const document = {
      documentId: "document:validate-de1",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:outer": { id: entityRef("outer"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Outer" } } },
        "entity:inner": { id: entityRef("inner"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Inner" } } },
        "entity:card": { id: entityRef("card"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Card" } } },
      },
      relations: {
        "relation:c1": {
          id: "relation:c1",
          profile: "generic@2",
          type: "contains",
          endpoints: [
            { role: "parent", target: "entity:outer" },
            { role: "child", target: "entity:inner" },
          ],
          attributes: {},
        },
        "relation:c2": {
          id: "relation:c2",
          profile: "generic@2",
          type: "contains",
          endpoints: [
            { role: "parent", target: "entity:inner" },
            { role: "child", target: "entity:card" },
          ],
          attributes: {},
        },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;

    const view = {
      ...createView({ viewId: viewRef("de1"), semanticDocumentId: document.documentId, revision: 1 }),
      entityOccurrences: {
        "occurrence:e.outer": { id: occurrenceRef("e.outer"), entity: entityRef("outer"), geometry: { x: 0, y: 0, width: 600, height: 400 } },
        "occurrence:e.inner": { id: occurrenceRef("e.inner"), entity: entityRef("inner"), group: "grp.7.e.outer", geometry: { x: 16, y: 80, width: 400, height: 240 } },
        "occurrence:e.card": { id: occurrenceRef("e.card"), entity: entityRef("card"), group: "grp.7.e.inner", geometry: { x: 32, y: 140, width: 352, height: 154 } },
      },
      groups: {
        "grp.7.e.outer": { id: "grp.7.e.outer", occurrence: occurrenceRef("e.outer") },
        "grp.7.e.inner": { id: "grp.7.e.inner", occurrence: occurrenceRef("e.inner") },
      },
    } as unknown as SceneView;

    const validationOptions = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings };

    for (const [label, contractPin, extra] of [
      ["@1", DIAGRAM_PRESENTATION_CONTRACT_PIN, {}],
      ["@2", DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, { align: "center" as const }],
    ] as const) {
      const presentation = {
        contractPin: { ...contractPin },
        entities: {
          "occurrence:e.outer": { form: "container", text: { title: "Outer" }, ...extra },
          "occurrence:e.inner": { form: "container", text: { title: "Inner" }, ...extra },
          "occurrence:e.card": { form: "card", text: { title: "Card", body: "Text" }, ...extra },
        },
        legends: {},
        categoryTokens: [],
      } as unknown as ScenePresentation;

      const result = layoutScene({
        document,
        view,
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        presentation,
        measureLines: cardLineMeasurer(defaultCardMeasure),
        collapsed: [],
        depthParityStart: 1,
      });
      expect(result.status, label).toBe("laid-out");
      if (result.status !== "laid-out") continue;
      expect(validateView(result.view, document, validationOptions), label).toEqual([]);
      const emittedCard = result.view.presentation.diagram?.entities["occurrence:e.card"] as Record<string, unknown> | undefined;
      expect(emittedCard?.["anatomy"]).toBeUndefined();
      expect(emittedCard?.["depth"]).toBeUndefined();
      expect(emittedCard?.["depthParityStart"]).toBeUndefined();
      if (label === "@2") expect(emittedCard?.["align"]).toBe("center");
    }
  });
});
