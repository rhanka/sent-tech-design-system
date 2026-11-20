import { describe, expect, it } from "vitest";
import {
  createView,
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  viewRef,
} from "@sentropic/diagram-core";
import { layoutMeasured } from "../../src/layout/measured.js";
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
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";

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

  it("should align ZONE_GEOMETRY_V2 headerTextInset, child seating, fold recomposition, and icon-none titles with zero drift", () => {
    expect(ZONE_GEOMETRY_V2.headerTextInset).toBe(154);
    const zoneWithIcon = layoutZone(
      { entityId: "z", title: "Platform Zone", collapsed: false, width: 600, toggleLabel: "Collapse", anatomy: "v2" },
      defaultCardMeasure,
    );
    // 68 left (12 + 52 + 4) + 86 right toggle reserve = 154 -> 446 header text width.
    expect(zoneWithIcon.header?.headerTextX).toBe(68);
    expect(zoneWithIcon.header?.headerTextWidth).toBe(600 - 154);
    expect(zoneWithIcon.header?.title[0]?.x).toBe(68 + (600 - 154) / 2);

    const longZoneTitle = "Customer Platform Gateway Cluster";
    const document = {
      documentId: "document:v2-zone-geometry",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:zone": { id: entityRef("zone"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: longZoneTitle } } },
        "entity:child": { id: entityRef("child"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Service" } } },
      },
      relations: {
        "relation:contains.child": {
          id: relationRef("contains.child"),
          profile: "generic@2",
          type: "contains",
          endpoints: [
            { role: "parent", target: entityRef("zone") },
            { role: "child", target: entityRef("child") },
          ],
          attributes: {},
        },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;

    const baseView = createView({ viewId: viewRef("v2-geom"), semanticDocumentId: document.documentId, revision: 1 });
    const view = {
      ...baseView,
      entityOccurrences: {
        "occurrence:e.zone": { id: occurrenceRef("e.zone"), entity: entityRef("zone"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.child": { id: occurrenceRef("e.child"), entity: entityRef("child"), group: "group:fold.zone", geometry: { x: 0, y: 0, width: 352, height: 154 } },
      },
      groups: {
        "group:fold.zone": { id: "group:fold.zone", occurrence: occurrenceRef("e.zone") },
      },
    } as unknown as SceneView;
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.zone": { form: "container", icon: "none", text: { title: longZoneTitle, subtitle: "Sub" }, anatomy: "v2" },
        "occurrence:e.child": { form: "card", text: { title: "Service", body: "Compact" }, anatomy: "v2" },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;

    const measureLines = cardLineMeasurer(defaultCardMeasure);
    const expandedResult = layoutMeasured(document, {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureText: (text) => ({ width: text.length * 10, height: 24 }),
      measureLines,
      collapsed: [],
      targetWidth: 1440,
      rowPack: {},
    }, view);
    expect(expandedResult.status).toBe("laid-out");
    if (expandedResult.status !== "laid-out") return;
    // No 1-line title truncation on icon:"none" expanded v2 zone.
    expect(expandedResult.warnings.filter((w) => w.code === "zone-overflow")).toEqual([]);
    const zoneGeom = expandedResult.view.entityOccurrences["occurrence:e.zone"]?.geometry;
    const childGeom = expandedResult.view.entityOccurrences["occurrence:e.child"]?.geometry;
    expect(zoneGeom).toBeDefined();
    expect(childGeom).toBeDefined();

    // Child y and frame height must match layoutZone's contentTop and height with ZERO 4px vertical drift.
    const renderedZone = layoutZone(
      {
        entityId: "entity:zone",
        title: longZoneTitle,
        subtitle: "Sub",
        icon: "none",
        collapsed: false,
        toggleLabel: "Collapse",
        x: zoneGeom!.x,
        y: zoneGeom!.y,
        width: zoneGeom!.width,
        height: zoneGeom!.height,
        anatomy: "v2",
      },
      defaultCardMeasure,
    );
    expect(renderedZone.diagnostics).toEqual([]);
    expect(renderedZone.header?.title.map((line) => line.text).join("")).toBe(longZoneTitle);
    expect(childGeom!.y).toBe(renderedZone.header?.contentTop);
    expect(zoneGeom!.height).toBe(renderedZone.header!.contentTop - zoneGeom!.y + childGeom!.height + ZONE_GEOMETRY_V2.contentInsetBottom);

    // Long title overflows the fixed 352x154 folded card and falls back to 460x200 v1; unfold restores exact expanded geometry.
    const foldedResult = layoutMeasured(document, {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureText: (text) => ({ width: text.length * 10, height: 24 }),
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
      targetWidth: 1440,
      rowPack: {},
    }, view);
    expect(foldedResult.status).toBe("laid-out");
    if (foldedResult.status !== "laid-out") return;
    expect(foldedResult.view.entityOccurrences["occurrence:e.zone"]?.geometry).toMatchObject({ width: 460, height: 200 });

    const unfoldedResult = layoutMeasured(document, {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureText: (text) => ({ width: text.length * 10, height: 24 }),
      measureLines,
      collapsed: [],
      targetWidth: 1440,
      rowPack: {},
    }, view);
    expect(unfoldedResult.status).toBe("laid-out");
    if (unfoldedResult.status !== "laid-out") return;
    expect(unfoldedResult.view.entityOccurrences["occurrence:e.zone"]?.geometry).toEqual(zoneGeom);
    expect(unfoldedResult.view.entityOccurrences["occurrence:e.child"]?.geometry).toEqual(childGeom);

    // Compact-fitting title folds to 352x154 with zero overflow and unfolds with zero vertical drift.
    const compactPresentation = {
      ...presentation,
      entities: {
        ...presentation.entities,
        "occurrence:e.zone": { form: "container", text: { title: "Zone", subtitle: "Sub" }, anatomy: "v2" },
      },
    } as unknown as ScenePresentation;
    const compactFolded = layoutMeasured(document, {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: compactPresentation,
      measureText: (text) => ({ width: text.length * 10, height: 24 }),
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
      targetWidth: 1440,
      rowPack: {},
    }, view);
    expect(compactFolded.status).toBe("laid-out");
    if (compactFolded.status !== "laid-out") return;
    expect(compactFolded.warnings.filter((w) => w.code === "zone-overflow")).toEqual([]);
    expect(compactFolded.view.entityOccurrences["occurrence:e.zone"]?.geometry).toMatchObject({ width: 352, height: 154 });
  });

  it("should hide all descendants when folding an outer v2 container, reflow neighbours, re-route and bundle links, and unfold cleanly", () => {
    const measureLines = cardLineMeasurer(defaultCardMeasure);
    const entities = {
      "entity:outerA": { id: entityRef("outerA"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Outer A" } } },
      "entity:innerA": { id: entityRef("innerA"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Inner A" } } },
      "entity:a1": { id: entityRef("a1"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Alpha" } } },
      "entity:a2": { id: entityRef("a2"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Beta" } } },
      "entity:aSibling": { id: entityRef("aSibling"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Sibling" } } },
      "entity:outerB": { id: entityRef("outerB"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Outer B" } } },
      "entity:b1": { id: entityRef("b1"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Store" } } },
      "entity:b2": { id: entityRef("b2"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Index" } } },
      "entity:ext": { id: entityRef("ext"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Gateway" } } },
    };
    const contains = (id: string, parent: string, child: string) => [
      `relation:c.${id}`,
      {
        id: relationRef(`c.${id}`),
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      },
    ] as const;
    const link = (id: string, source: string, target: string, label: string) => [
      `relation:l.${id}`,
      {
        id: relationRef(`l.${id}`),
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: entityRef(source) },
          { role: "target", target: entityRef(target) },
        ],
        attributes: { label: { kind: "text", value: label } },
      },
    ] as const;
    const document = {
      documentId: "document:v2-nested-multi",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations: Object.fromEntries([
        contains("innerA", "outerA", "innerA"),
        contains("a1", "innerA", "a1"),
        contains("a2", "innerA", "a2"),
        contains("aSibling", "outerA", "aSibling"),
        contains("b1", "outerB", "b1"),
        contains("b2", "outerB", "b2"),
        link("inner", "a1", "a2", "inner call"),
        link("toSibling", "a1", "aSibling", "sibling call"),
        link("sync1", "a1", "b1", "sync alpha"),
        link("sync2", "a2", "b1", "sync beta"),
        link("sync3", "aSibling", "b1", "sync gamma"),
        link("pub", "a2", "ext", "publishes"),
      ]),
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;

    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.outerA": { form: "container", text: { title: "Outer A", subtitle: "Primary" }, anatomy: "v2" },
        "occurrence:e.innerA": { form: "container", text: { title: "Inner A", subtitle: "Nested" }, anatomy: "v2" },
        "occurrence:e.a1": { form: "card", text: { title: "Alpha", body: "Worker" }, anatomy: "v2" },
        "occurrence:e.a2": { form: "card", text: { title: "Beta", body: "Queue" }, anatomy: "v2" },
        "occurrence:e.aSibling": { form: "card", text: { title: "Sibling", body: "Cache" }, anatomy: "v2" },
        "occurrence:e.outerB": { form: "container", text: { title: "Outer B", subtitle: "Data" }, anatomy: "v2" },
        "occurrence:e.b1": { form: "card", text: { title: "Store", body: "Primary" }, anatomy: "v2" },
        "occurrence:e.b2": { form: "card", text: { title: "Index", body: "Replica" }, anatomy: "v2" },
        "occurrence:e.ext": { form: "card", text: { title: "Gateway", body: "Ingress" }, anatomy: "v2" },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;

    const baseView = createView({ viewId: viewRef("v2-nested-multi"), semanticDocumentId: document.documentId, revision: 1 });
    const explicitView = {
      ...baseView,
      entityOccurrences: {
        "occurrence:e.outerA": { id: occurrenceRef("e.outerA"), entity: entityRef("outerA"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.innerA": { id: occurrenceRef("e.innerA"), entity: entityRef("innerA"), group: "grp.outerA", geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.a1": { id: occurrenceRef("e.a1"), entity: entityRef("a1"), group: "grp.innerA", geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.a2": { id: occurrenceRef("e.a2"), entity: entityRef("a2"), group: "grp.innerA", geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.aSibling": { id: occurrenceRef("e.aSibling"), entity: entityRef("aSibling"), group: "grp.outerA", geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.outerB": { id: occurrenceRef("e.outerB"), entity: entityRef("outerB"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.b1": { id: occurrenceRef("e.b1"), entity: entityRef("b1"), group: "grp.outerB", geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.b2": { id: occurrenceRef("e.b2"), entity: entityRef("b2"), group: "grp.outerB", geometry: { x: 0, y: 0, width: 352, height: 154 } },
        "occurrence:e.ext": { id: occurrenceRef("e.ext"), entity: entityRef("ext"), geometry: { x: 0, y: 0, width: 352, height: 154 } },
      },
      relationOccurrences: {
        "occurrence:r.l.inner": { id: occurrenceRef("r.l.inner"), relation: relationRef("l.inner"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.a1") }, { role: "target", occurrence: occurrenceRef("e.a2") }] },
        "occurrence:r.l.toSibling": { id: occurrenceRef("r.l.toSibling"), relation: relationRef("l.toSibling"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.a1") }, { role: "target", occurrence: occurrenceRef("e.aSibling") }] },
        "occurrence:r.l.sync1": { id: occurrenceRef("r.l.sync1"), relation: relationRef("l.sync1"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.a1") }, { role: "target", occurrence: occurrenceRef("e.b1") }] },
        "occurrence:r.l.sync2": { id: occurrenceRef("r.l.sync2"), relation: relationRef("l.sync2"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.a2") }, { role: "target", occurrence: occurrenceRef("e.b1") }] },
        "occurrence:r.l.sync3": { id: occurrenceRef("r.l.sync3"), relation: relationRef("l.sync3"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.aSibling") }, { role: "target", occurrence: occurrenceRef("e.b1") }] },
        "occurrence:r.l.pub": { id: occurrenceRef("r.l.pub"), relation: relationRef("l.pub"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.a2") }, { role: "target", occurrence: occurrenceRef("e.ext") }] },
      },
      groups: {
        "grp.outerA": { id: "grp.outerA", occurrence: occurrenceRef("e.outerA"), collapsed: false },
        "grp.innerA": { id: "grp.innerA", occurrence: occurrenceRef("e.innerA"), collapsed: false },
        "grp.outerB": { id: "grp.outerB", occurrence: occurrenceRef("e.outerB"), collapsed: false },
      },
    } as unknown as SceneView;

    for (const view of [explicitView, undefined] as const) {
      const run = (collapsed: readonly ReturnType<typeof occurrenceRef>[]) => {
        const input = {
          document,
          ...(view === undefined ? {} : { view }),
          registry: m3ProfileRegistry,
          bindings: shippedExecutorBindings,
          presentation,
          measureLines,
          collapsed,
        };
        const result = layoutScene(input);
        expect(result.status).toBe("laid-out");
        if (result.status !== "laid-out") throw new Error("unexpected refusal");
        return { result, scene: resolveScene(result, input) };
      };

      const expanded = run([]);
      expect(expanded.scene.nodes.map((n) => n.occurrence).sort()).toEqual([
        "occurrence:e.a1",
        "occurrence:e.a2",
        "occurrence:e.aSibling",
        "occurrence:e.b1",
        "occurrence:e.b2",
        "occurrence:e.ext",
        "occurrence:e.innerA",
        "occurrence:e.outerA",
        "occurrence:e.outerB",
      ]);
      expect(expanded.scene.nodes.find((n) => n.occurrence === "occurrence:e.innerA")?.presentation?.depth).toBe(1);
      expect(expanded.scene.nodes.find((n) => n.occurrence === "occurrence:e.a1")?.rect).toMatchObject({ width: 352, height: 154 });
      expect(expanded.scene.edges).toHaveLength(6);
      expect(Object.keys(expanded.result.edgeBundles ?? {})).toEqual([]);

      // Fold innerA: a1 and a2 hide, innerA becomes 352x154 keeping depth 1, a1->b1 and a2->b1 bundle into 1 edge.
      const innerFolded = run([occurrenceRef("e.innerA")]);
      expect(innerFolded.scene.nodes.map((n) => n.occurrence).sort()).toEqual([
        "occurrence:e.aSibling",
        "occurrence:e.b1",
        "occurrence:e.b2",
        "occurrence:e.ext",
        "occurrence:e.innerA",
        "occurrence:e.outerA",
        "occurrence:e.outerB",
      ]);
      const innerNode = innerFolded.scene.nodes.find((n) => n.occurrence === "occurrence:e.innerA")!;
      expect(innerNode.collapsed).toBe(true);
      expect(innerNode.rect).toMatchObject({ width: 352, height: 154 });
      expect(innerNode.presentation?.depth).toBe(1);
      const innerBundles = Object.values(innerFolded.result.edgeBundles ?? {});
      expect(innerBundles).toHaveLength(1);
      expect(innerBundles[0]?.members).toHaveLength(2);
      expect(innerBundles[0]?.relations).toEqual(["sync alpha", "sync beta"]);
      // 6 links minus 1 internal (a1->a2) minus 1 bundled duplicate = 4 drawn edges.
      expect(innerFolded.scene.edges).toHaveLength(4);

      // Fold outerA WITHOUT collapsing innerA: ALL descendants (innerA, a1, a2, aSibling) MUST hide!
      const outerFolded = run([occurrenceRef("e.outerA")]);
      expect(outerFolded.scene.nodes.map((n) => n.occurrence).sort()).toEqual([
        "occurrence:e.b1",
        "occurrence:e.b2",
        "occurrence:e.ext",
        "occurrence:e.outerA",
        "occurrence:e.outerB",
      ]);
      const outerNode = outerFolded.scene.nodes.find((n) => n.occurrence === "occurrence:e.outerA")!;
      expect(outerNode.collapsed).toBe(true);
      expect(outerNode.rect).toMatchObject({ width: 352, height: 154 });
      // Neighbours reflow after outerA shrinks to a compact card.
      const outerBRectBefore = expanded.scene.nodes.find((n) => n.occurrence === "occurrence:e.outerB")!.rect;
      const outerBRectAfter = outerFolded.scene.nodes.find((n) => n.occurrence === "occurrence:e.outerB")!.rect;
      const extRectBefore = expanded.scene.nodes.find((n) => n.occurrence === "occurrence:e.ext")!.rect;
      const extRectAfter = outerFolded.scene.nodes.find((n) => n.occurrence === "occurrence:e.ext")!.rect;
      expect(
        outerBRectBefore.x !== outerBRectAfter.x || outerBRectBefore.y !== outerBRectAfter.y ||
        extRectBefore.x !== extRectAfter.x || extRectBefore.y !== extRectAfter.y,
      ).toBe(true);
      // Internal links (a1->a2, a1->aSibling) vanish; 3 links to b1 bundle into 1; a2->ext re-routes from outerA->ext.
      const outerBundles = Object.values(outerFolded.result.edgeBundles ?? {});
      expect(outerBundles).toHaveLength(1);
      expect(outerBundles[0]?.members).toHaveLength(3);
      expect(outerBundles[0]?.relations).toEqual(["sync alpha", "sync beta", "sync gamma"]);
      expect(outerFolded.scene.edges).toHaveLength(2);
      for (const edge of outerFolded.scene.edges) {
        expect(edge.points.length).toBeGreaterThanOrEqual(2);
        const start = edge.points[0]!;
        expect(start.x).toBeGreaterThanOrEqual(outerNode.rect.x - 1);
        expect(start.x).toBeLessThanOrEqual(outerNode.rect.x + outerNode.rect.width + 1);
        expect(start.y).toBeGreaterThanOrEqual(outerNode.rect.y - 1);
        expect(start.y).toBeLessThanOrEqual(outerNode.rect.y + outerNode.rect.height + 1);
      }

      // Fold BOTH outerA and outerB: only root boxes remain, cross-links bundle onto outerA -> outerB.
      const bothFolded = run([occurrenceRef("e.outerA"), occurrenceRef("e.outerB")]);
      expect(bothFolded.scene.nodes.map((n) => n.occurrence).sort()).toEqual([
        "occurrence:e.ext",
        "occurrence:e.outerA",
        "occurrence:e.outerB",
      ]);
      expect(bothFolded.scene.edges).toHaveLength(2);
      expect(Object.values(bothFolded.result.edgeBundles ?? {})[0]?.members).toHaveLength(3);

      // Unfold back to []: exact same structure, geometry, edges and depth surfaces restored.
      const unfolded = run([]);
      expect(unfolded.scene.nodes.map((n) => [n.occurrence, n.rect, n.presentation?.depth])).toEqual(
        expanded.scene.nodes.map((n) => [n.occurrence, n.rect, n.presentation?.depth]),
      );
      expect(unfolded.scene.edges).toEqual(expanded.scene.edges);
    }

    // Regression witness on nestedZoneFixture: folding outer sys-memory hides ont-session AND all 10 grandchildren.
    const fixture = nestedZoneFixture({ outside: true });
    const foldedFixture = layoutScene({
      document: fixture.document,
      view: fixture.view,
      registry: fixture.registry,
      bindings: fixture.bindings,
      presentation: fixture.presentation,
      measureLines,
      collapsed: [fixture.zones[0]!],
    });
    expect(foldedFixture.status).toBe("laid-out");
    if (foldedFixture.status !== "laid-out") return;
    const foldedScene = resolveScene(foldedFixture, {
      document: fixture.document,
      view: fixture.view,
      presentation: fixture.presentation,
      measureLines,
    });
    expect(foldedScene.nodes.map((n) => n.occurrence)).toEqual([fixture.zones[0]]);
    expect(foldedScene.edges).toEqual([]);
  });
});
