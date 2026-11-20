import { describe, expect, it } from "vitest";
import {
  createView,
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  viewRef,
} from "@sentropic/diagram-core";
import {
  anatomyCardGeometry,
  anatomyZoneGeometry,
  CARD_GEOMETRY,
  CARD_GEOMETRY_V2,
  cardLineMeasurer,
  defaultCardMeasure,
  layoutCard,
  layoutZone,
  projectCardProps,
  projectZoneProps,
  ZONE_GEOMETRY,
  ZONE_GEOMETRY_V2,
} from "../../src/presentation/diagramCardModel.js";
import {
  layoutScene,
  resolveScene,
  resolveScenePresentation,
  type SceneDocument,
  type ScenePresentation,
  type SceneView,
} from "../../src/presentation/diagramSceneModel.js";
import { renderCardSvg } from "../../src/presentation/renderCardSvg.js";

const CONTRACT = {
  entityId: "contract",
  kicker: "KICKER",
  title: "Title",
  body: ["Body", "Detail"],
  detailCount: 1,
  footer: "Footer",
  toggle: { collapsed: true, label: "Expand" },
} as const;

const COMPACT = {
  entityId: "compact",
  title: "Title",
  body: ["Body"],
  toggle: { collapsed: true, label: "Expand" },
} as const;

/**
 * DE-1 versioned card anatomy: `diagram-anatomy/v1` stays frozen at
 * 460 × 200 for existing views; `diagram-anatomy/v2` is the compact
 * 352 × 154 default new views pin (padding 6, header inset 12, accent 6,
 * icon 52 / gap 4, type scale unchanged 22 / 32 / 24).
 */
describe("diagram anatomy v2 (DE-1)", () => {
  it("should keep v1 frozen when no anatomy is pinned", () => {
    const layout = layoutCard({ ...CONTRACT }, defaultCardMeasure);
    expect(layout.box).toEqual({ width: 460, height: 200 });
    expect(layout.headerTextX).toBe(92);
    expect(layout.iconBox?.size).toBe(70);
    expect(layout.title[0]?.anchor).toBe("start");
    expect(anatomyCardGeometry(undefined)).toBe(CARD_GEOMETRY);
    expect(anatomyZoneGeometry(undefined)).toBe(ZONE_GEOMETRY);
  });

  it("should lay out the compact 352x154 card with v2 insets and centred default alignment", () => {
    const layout = layoutCard({ ...COMPACT, anatomy: "v2" }, defaultCardMeasure);
    expect(layout.box).toEqual({ width: 352, height: 154 });
    expect(layout.anatomyFallback).toBeUndefined();
    expect(layout.diagnostics).toEqual([]);
    expect(CARD_GEOMETRY_V2.width).toBe(352);
    expect(CARD_GEOMETRY_V2.height).toBe(154);
    expect(CARD_GEOMETRY_V2.padding).toBe(6);
    expect(CARD_GEOMETRY_V2.headerInset).toBe(12);
    expect(CARD_GEOMETRY_V2.accentWidth).toBe(6);
    expect(CARD_GEOMETRY_V2.iconSize).toBe(52);
    expect(CARD_GEOMETRY_V2.iconTextGap).toBe(4);
    // Type scale unchanged (22 / 32 / 24).
    expect(CARD_GEOMETRY_V2.kicker.size).toBe(22);
    expect(CARD_GEOMETRY_V2.title.size).toBe(32);
    expect(CARD_GEOMETRY_V2.body.size).toBe(24);
    // Header text starts after the compact inset + icon + gap.
    expect(layout.headerTextX).toBe(12 + 52 + 4);
    // Folded header keeps the derived compact width (352 − 2 − 6 − 66 − 68).
    expect(layout.headerTextWidth).toBe(210);
    expect(layout.iconBox?.size).toBe(52);
    // Compact-face default alignment is "center" (PLAN DE-1).
    expect(layout.title[0]?.anchor).toBe("middle");
    expect(layout.body.map((line) => line.text)).toEqual(["Body"]);
    // Explicit align: "left" overrides the compact default.
    const left = layoutCard({ ...COMPACT, anatomy: "v2", align: "left" }, defaultCardMeasure);
    expect(left.title[0]?.anchor).toBe("start");
  });

  it("should render the v2 card SVG at the compact box", () => {
    const result = renderCardSvg({ ...COMPACT, anatomy: "v2" }, defaultCardMeasure);
    expect(result.kind).toBe("rendered");
    if (result.kind !== "rendered") return;
    expect(result.svg).toContain('width="352"');
    expect(result.svg).toContain('height="154"');
    expect(result.svg).toContain("viewBox=\"0 0 352 154\"");
    expect(result.layout.box).toEqual({ width: 352, height: 154 });
  });

  it("should fall back per box to frozen v1 keeping the full body when v2 overflows", () => {
    const layout = layoutCard({ ...CONTRACT, anatomy: "v2" }, defaultCardMeasure);
    expect(layout.anatomyFallback).toBe("v1");
    expect(layout.box).toEqual({ width: 460, height: 200 });
    expect(layout.body.map((line) => line.text)).toEqual(["Body", "Detail"]);
    expect(layout.title[0]?.anchor).toBe("middle");
    const overflow = layout.diagnostics.find((diagnostic) => diagnostic.code === "card-overflow");
    expect(overflow?.slot).toBe("body");
    expect(overflow?.reason).toBe("fallback-v1");
    const svg = renderCardSvg({ ...CONTRACT, anatomy: "v2" }, defaultCardMeasure);
    expect(svg.kind).toBe("rendered");
    if (svg.kind !== "rendered") return;
    expect(svg.svg).toContain('width="460"');
    expect(svg.svg).toContain('height="200"');
    expect(svg.svg).toContain("Body");
    expect(svg.svg).toContain("Detail");
  });

  it("should fold a v2 zone into the compact card, fall back on overflow, and expand on compact chrome", () => {
    const compactZone = {
      entityId: "compact-zone",
      title: "Zone",
      subtitle: "Subtitle",
      toggleLabel: "Toggle",
      width: 600,
      anatomy: "v2" as const,
    };
    const collapsed = layoutZone({ ...compactZone, collapsed: true }, defaultCardMeasure);
    expect(collapsed.collapsed).toBe(true);
    expect(collapsed.box).toEqual({ x: 0, y: 0, width: 352, height: 154 });
    expect(collapsed.card?.body.map((line) => line.text)).toEqual(["Subtitle"]);
    expect(collapsed.card?.title[0]?.anchor).toBe("middle");
    expect(collapsed.diagnostics).toEqual([]);

    const fullZone = {
      ...compactZone,
      entityId: "contract-zone",
      kicker: "KICKER",
      footer: "Footer",
    };
    const collapsedFallback = layoutZone({ ...fullZone, collapsed: true }, defaultCardMeasure);
    expect(collapsedFallback.box).toEqual({ x: 0, y: 0, width: 460, height: 200 });
    expect(collapsedFallback.card?.anatomyFallback).toBe("v1");
    expect(collapsedFallback.card?.body.map((line) => line.text)).toEqual(["Subtitle"]);
    expect(collapsedFallback.diagnostics.some((d) => d.code === "zone-overflow" && d.reason === "fallback-v1")).toBe(true);

    const expanded = layoutZone({ ...fullZone, collapsed: false }, defaultCardMeasure);
    expect(expanded.collapsed).toBe(false);
    expect(expanded.header?.headerTextX).toBe(12 + 52 + 4);
    expect(expanded.header?.title[0]?.anchor).toBe("middle");
    expect(ZONE_GEOMETRY_V2.collapsedWidth).toBe(352);
    expect(ZONE_GEOMETRY_V2.collapsedHeight).toBe(154);
  });

  it("should project the pinned anatomy from the presentation through both projectors", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" }, anatomy: "v2" },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect(card.props.anatomy).toBe("v2");
    const zone = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.2", collapsed: false, anatomy: "v2" },
    );
    expect(zone.kind).toBe("zone");
    if (zone.kind !== "zone") return;
    expect(zone.props.anatomy).toBe("v2");
    // Unpinned presentations project no anatomy: the frozen v1 applies.
    const plain = projectCardProps({ form: "card", text: { title: "T" } }, { entityId: "occurrence:e.3" });
    expect(plain.kind).toBe("card");
    if (plain.kind !== "card") return;
    expect(plain.props.anatomy).toBeUndefined();
    expect(layoutCard(plain.props, defaultCardMeasure).box).toEqual({ width: 460, height: 200 });
  });

  it("should propagate view-level anatomy v2 from createView to every card, zone, and legend", () => {
    const document = {
      documentId: "document:v2-view",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:card": { id: entityRef("card"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Card" } } },
        "entity:zone": { id: entityRef("zone"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Zone" } } },
        "entity:legend": { id: entityRef("legend"), profile: "generic@2", type: "legend", attributes: { name: { kind: "text", value: "Legend" } } },
        "entity:pinned": { id: entityRef("pinned"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Pinned" } } },
      },
      relations: {},
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;
    const baseView = createView({ viewId: viewRef("new-v2"), semanticDocumentId: document.documentId, revision: 1 });
    expect(baseView.presentation.anatomy).toBe("v2");
    const view = {
      ...baseView,
      entityOccurrences: {
        "occurrence:e.card": { id: occurrenceRef("e.card"), entity: entityRef("card"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.zone": { id: occurrenceRef("e.zone"), entity: entityRef("zone"), geometry: { x: 400, y: 0, width: 352, height: 154 } },
        "occurrence:e.legend": { id: occurrenceRef("e.legend"), entity: entityRef("legend"), geometry: { x: 800, y: 0, width: 352, height: 154 } },
        "occurrence:e.pinned": { id: occurrenceRef("e.pinned"), entity: entityRef("pinned"), geometry: { x: 1200, y: 0, width: 460, height: 200 } },
      },
    } as unknown as SceneView;
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.card": { form: "card", text: { title: "Card", body: "Compact" } },
        "occurrence:e.zone": { form: "container", text: { title: "Zone", subtitle: "Sub" } },
        "occurrence:e.legend": { form: "legend", text: { title: "Legend" } },
        "occurrence:e.pinned": { form: "card", text: { title: "Pinned", body: "Legacy" }, anatomy: "v1" },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;
    const resolved = resolveScenePresentation(document, presentation, {}, true, view);
    const entities = resolved.presentation.entities as Record<string, { anatomy?: string }>;
    expect(entities["occurrence:e.card"]?.anatomy).toBe("v2");
    expect(entities["occurrence:e.zone"]?.anatomy).toBe("v2");
    expect(entities["occurrence:e.legend"]?.anatomy).toBe("v2");
    expect(entities["occurrence:e.pinned"]?.anatomy).toBe("v1");

    const laidOut = layoutScene({
      document,
      view,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines: cardLineMeasurer(defaultCardMeasure),
      collapsed: [],
    });
    expect(laidOut.status).toBe("laid-out");
    if (laidOut.status !== "laid-out") return;
    const scene = resolveScene(laidOut, {
      document,
      view,
      presentation,
      measureLines: cardLineMeasurer(defaultCardMeasure),
    });
    const cardNode = scene.nodes.find((node) => node.occurrence === "occurrence:e.card");
    const pinnedNode = scene.nodes.find((node) => node.occurrence === "occurrence:e.pinned");
    expect(cardNode?.rect.width).toBe(352);
    expect(cardNode?.rect.height).toBe(154);
    expect(cardNode?.presentation?.anatomy).toBe("v2");
    expect(pinnedNode?.rect.width).toBe(460);
    expect(pinnedNode?.rect.height).toBe(200);
  });

  it("should report a severe title overflow through the diagnostic path even after v1 fallback", () => {
    const title = "W".repeat(100);
    const layout = layoutCard({ entityId: "contract", title, body: ["Body"], anatomy: "v2" }, defaultCardMeasure);
    expect(layout.anatomyFallback).toBe("v1");
    expect(layout.box).toEqual({ width: 460, height: 200 });
    expect(layout.title.at(-1)?.text).toMatch(/…$/u);
    const overflow = layout.diagnostics.find((diagnostic) => diagnostic.code === "card-overflow");
    expect(overflow?.slot).toBe("title");
    expect(overflow?.reason).toBe("truncated");
    expect(overflow?.neededPx).toBeGreaterThan(overflow?.allocatedPx ?? 0);
    expect(overflow?.text).toBe(title);
  });
});
