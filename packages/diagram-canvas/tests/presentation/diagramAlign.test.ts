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

  it("should keep zone alignment left by default for both v1 and v2 and centre v2 only when explicitly requested", () => {
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
    expect(layoutZone({ ...compact.props, width: 600 }, defaultCardMeasure).header?.title[0]?.anchor).toBe("start");
    const compactCentered = layoutZone({ ...compact.props, width: 600, align: "center" }, defaultCardMeasure);
    expect(compactCentered.header?.title[0]?.anchor).toBe("middle");
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

  it("should pin v1 and fallback-v1 alignment to 0.41.5 values and restrict view-level centring to explicit compact v2", () => {
    const complete = {
      entityId: "entity:complete",
      kicker: "KICKER",
      title: "Title",
      body: ["Body", "Detail"],
      detailCount: 1,
      footer: "Footer",
      toggle: { collapsed: true, label: "Expand" },
    } as const;
    // Direct v1 (absent or explicit "v1"): kicker/title/footer start-anchored;
    // body keeps the 0.41.5 centred leaf box (anchor "middle", x = 232).
    for (const extra of [{}, { anatomy: "v1" as const }, { anatomy: "v1" as const, align: "center" as const }]) {
      const card = layoutCard({ ...complete, ...extra }, defaultCardMeasure);
      expect(card.box).toEqual({ width: 460, height: 200 });
      expect(card.kicker[0]?.anchor).toBe("start");
      expect(card.kicker[0]?.x).toBe(92);
      expect(card.title[0]?.anchor).toBe("start");
      expect(card.title[0]?.x).toBe(92);
      expect(card.footerLines[0]?.anchor).toBe("start");
      expect(card.footerLines[0]?.x).toBe(16);
      expect(card.body.every((line) => line.anchor === "middle" && line.x === 232)).toBe(true);
    }
    // Fallback-v1 from v2 (both without align and with explicit align: "center"):
    // keeps exact 0.41.5 v1 alignment, never centres header or footer.
    for (const align of [undefined, "center" as const]) {
      const card = layoutCard({ ...complete, anatomy: "v2", ...(align === undefined ? {} : { align }) }, defaultCardMeasure);
      expect(card.anatomyFallback).toBe("v1");
      expect(card.box).toEqual({ width: 460, height: 200 });
      expect(card.kicker[0]?.anchor).toBe("start");
      expect(card.kicker[0]?.x).toBe(92);
      expect(card.title[0]?.anchor).toBe("start");
      expect(card.title[0]?.x).toBe(92);
      expect(card.footerLines[0]?.anchor).toBe("start");
      expect(card.footerLines[0]?.x).toBe(16);
      expect(card.body.every((line) => line.anchor === "middle" && line.x === 232)).toBe(true);

      const collapsedZone = layoutZone(
        {
          entityId: "entity:zone",
          kicker: "KICKER",
          title: "Zone",
          subtitle: "Subtitle",
          footer: "Footer",
          collapsed: true,
          toggleLabel: "Toggle",
          anatomy: "v2",
          ...(align === undefined ? {} : { align }),
        },
        defaultCardMeasure,
      );
      expect(collapsedZone.card?.anatomyFallback).toBe("v1");
      expect(collapsedZone.card?.kicker[0]?.anchor).toBe("start");
      expect(collapsedZone.card?.title[0]?.anchor).toBe("start");
      expect(collapsedZone.card?.footerLines[0]?.anchor).toBe("start");
      expect(collapsedZone.card?.body.every((line) => line.anchor === "middle" && line.x === 230)).toBe(true);
    }
    // Compact v2 without align stays left; explicit align: "center" centres title/header.
    const compactDefault = layoutCard({ entityId: "entity:c", title: "Title", body: ["Body"], anatomy: "v2" }, defaultCardMeasure);
    expect(compactDefault.anatomyFallback).toBeUndefined();
    expect(compactDefault.title[0]?.anchor).toBe("start");
    expect(compactDefault.title[0]?.x).toBe(68);
    const compactCentred = layoutCard({ entityId: "entity:c", title: "Title", body: ["Body"], anatomy: "v2", align: "center" }, defaultCardMeasure);
    expect(compactCentred.anatomyFallback).toBeUndefined();
    expect(compactCentred.title[0]?.anchor).toBe("middle");
    expect(compactCentred.title[0]?.x).toBe(compactCentred.headerTextX + compactCentred.headerTextWidth / 2);

    // Explicit v1 expanded zone ignores align: "center" and keeps 0.41.5 left anchors.
    const v1Zone = layoutZone(
      {
        entityId: "entity:z1",
        kicker: "KICKER",
        title: "Zone",
        subtitle: "Subtitle",
        footer: "Footer",
        collapsed: false,
        toggleLabel: "Toggle",
        width: 600,
        anatomy: "v1",
        align: "center",
      },
      defaultCardMeasure,
    );
    expect(v1Zone.header?.kicker[0]?.anchor).toBe("start");
    expect(v1Zone.header?.title[0]?.anchor).toBe("start");
    expect(v1Zone.header?.subtitle[0]?.anchor).toBe("start");
    expect(v1Zone.header?.footer[0]?.anchor).toBe("start");
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

    // A v1 view (absent or explicit anatomy: "v1") strips view-level align: "center".
    const v1View = { ...view, presentation: { ...view.presentation, anatomy: "v1" as const } } as unknown as SceneView;
    const v1Result = layoutScene({
      document,
      view: v1View,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: {
        contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
        entities: {
          "occurrence:e.outer": { form: "container", text: { title: "Outer" }, align: "center" },
          "occurrence:e.inner": { form: "container", text: { title: "Inner" }, align: "center" },
          "occurrence:e.card": { form: "card", text: { title: "Card", body: "Text" }, align: "center" },
        },
        legends: {},
        categoryTokens: [],
      } as unknown as ScenePresentation,
      measureLines: cardLineMeasurer(defaultCardMeasure),
      collapsed: [],
    });
    expect(v1Result.status).toBe("laid-out");
    if (v1Result.status === "laid-out") {
      const emitted = v1Result.view.presentation.diagram?.entities["occurrence:e.card"] as Record<string, unknown> | undefined;
      expect(emitted?.["align"]).toBeUndefined();
    }
  });
});
