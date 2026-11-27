import { readFileSync } from "node:fs";
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  createView,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  viewRef,
  type SemanticDocument,
  validateView,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_EDGE_CORNER_RADIUS,
  DEFAULT_EDGE_LABEL_SIZE,
  DEFAULT_LINK_EMPHASIS_STROKE_WIDTH,
  DEFAULT_LINK_PRIMARY_STROKE_WIDTH,
  DEFAULT_LINK_RELATED_STROKE_WIDTH,
  DEFAULT_LINK_STROKE_WIDTH,
  isR7ConnectorPresentation,
} from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { layoutScene, resolveScene } from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { hCondInput } from "../layout/dc2a/h-cond.js";
import { flowFixture } from "../../test-support/flowFixture.js";
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";
import { r7AuthoredLegendFixture } from "../../test-support/r7AuthoredLegendFixture.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));
const r7NestedFixture = () => {
  const fixture = nestedZoneFixture({ outside: true });
  return {
    ...fixture,
    view: { ...fixture.view, presentation: { ...fixture.view.presentation, anatomy: "v2" as const } },
    presentation: {
      ...fixture.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    },
  };
};

describe("DE-2 link tokens, emphasis token and edge-label size", () => {
  it("exports dedicated link stroke widths, 5px emphasis width (D-DE3-1), r=16 corner radius and label size defaults", () => {
    expect(DEFAULT_LINK_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_LINK_RELATED_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_LINK_PRIMARY_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_LINK_EMPHASIS_STROKE_WIDTH).toBe(5);
    expect(DEFAULT_EDGE_CORNER_RADIUS).toBe(16);
    expect(DEFAULT_EDGE_LABEL_SIZE).toBe(18);
  });

  it("paints r7 connectors with linkStrokeWidth (not zone borderWidth) and edgeLabelSize in renderSceneSvg while preserving v1 1.5px polylines (REQ-R7-11 / REQ-R7-28)", () => {
    const v1Fixture = nestedZoneFixture({ outside: true });
    const v1Rendered = renderSceneSvg({ ...v1Fixture, measureLines, collapsed: [] });
    expect(v1Rendered.scene.r7Connectors).toBe(false);
    expect(v1Rendered.svg).toContain("<polyline data-scene-edge=");
    expect(v1Rendered.svg).toContain('stroke-width="1.5"');
    expect(v1Rendered.svg).toContain('<marker id="scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--st-component-diagramScene-edgeStroke, #64748b)"/></marker>');
    expect(v1Rendered.svg).not.toContain('data-connector-mode="r7"');

    const fixture = r7NestedFixture();
    const base = renderSceneSvg({ ...fixture, measureLines, collapsed: [] });
    expect(base.scene.r7Connectors).toBe(true);
    expect(base.svg).toContain('data-connector-mode="r7"');
    expect(base.svg).toContain('stroke="var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))"');
    expect(base.svg).toContain('stroke-width="3.5"');
    expect(base.svg).toContain('<marker id="scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10.5" markerHeight="10.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))"/></marker>');
    expect(base.svg).toContain('vector-effect="non-scaling-stroke"');
    expect(base.svg).toContain('font-size="18"');
    expect(base.svg).toContain("--st-component-diagramScene-linkStroke:#0f172a");
    expect(base.svg).toContain("--st-component-diagramScene-linkStrokeWidth:3.5px");
    expect(base.svg).toContain("--st-component-diagramScene-linkRelatedStrokeWidth:3.5px");
    expect(base.svg).toContain("--st-component-diagramScene-linkEmphasisStroke:");
    expect(base.svg).toContain("--st-component-diagramScene-linkEmphasisStrokeWidth:5px");
    expect(base.svg).toContain("--st-component-diagramScene-edgeCornerRadius:16px");
    expect(base.svg).toContain("--st-component-diagramScene-edgeLabelSize:18px");
    expect(base.svg).toContain('data-connector-part="head"');
    expect(base.svg).not.toContain('data-scene-edge="occurrence:lnk-0" d="');
    // Pin DE3-L2a r7 label positions under 3.5 px paintClearance.
    const baselineAt25 = resolveScene(layoutScene({ ...fixture, measureLines, collapsed: [], metrics: { linkStrokeWidth: 2.5 } }) as Extract<ReturnType<typeof layoutScene>, { status: "laid-out" }>, { ...fixture, measureLines, metrics: { linkStrokeWidth: 2.5 } });
    expect(base.scene.labels.map((l) => l.box)).not.toEqual(baselineAt25.labels.map((l) => l.box));

    const thicker = renderSceneSvg({
      ...fixture,
      measureLines,
      collapsed: [],
      metrics: { linkStrokeWidth: 4, edgeLabelSize: 24 },
    });
    expect(thicker.svg).toContain('stroke-width="4"');
    expect(thicker.svg).toContain('font-size="24"');
    // Overriding edgeLabelSize scales measured edge-label boxes proportionally without overflow.
    const baseLabel = base.scene.labels[0]!;
    const biggerLabel = thicker.scene.labels.find((l) => l.occurrence === baseLabel.occurrence)!;
    expect(biggerLabel.box.width).toBeGreaterThan(baseLabel.box.width);
    expect(biggerLabel.box.height).toBeGreaterThan(baseLabel.box.height);
    expect(biggerLabel.box.height).toBeCloseTo(baseLabel.box.height * (24 / 18), 4);
  });

  it("recomputes footer connector cutouts and label clearance from linkStrokeWidth on r7 scenes", () => {
    const fixture = r7NestedFixture();
    const narrowInput = { ...fixture, measureLines, collapsed: [], metrics: { linkStrokeWidth: 2.5 } };
    const wideInput = { ...fixture, measureLines, collapsed: [], metrics: { linkStrokeWidth: 5 } };
    const narrowResult = layoutScene(narrowInput);
    const wideResult = layoutScene(wideInput);
    if (narrowResult.status !== "laid-out" || wideResult.status !== "laid-out") {
      throw new Error("expected laid-out");
    }
    const narrowScene = resolveScene(narrowResult, narrowInput);
    const wideScene = resolveScene(wideResult, wideInput);
    expect(narrowScene.connectorCutouts.length).toBeGreaterThan(0);
    // Wider linkStrokeWidth enlarges connector cutout clearance strictly.
    expect(wideScene.connectorCutouts[0]!.width).toBeGreaterThan(narrowScene.connectorCutouts[0]!.width);
    expect(wideScene.connectorCutouts[0]!.height).toBeGreaterThan(narrowScene.connectorCutouts[0]!.height);
    // At 3.5 px linkStrokeWidth, cutout padding covers both 0.30 floor stroke and 0.45 reserve.
    const defaultResult = layoutScene({ ...fixture, measureLines, collapsed: [] });
    if (defaultResult.status !== "laid-out") throw new Error("expected laid-out");
    const defaultScene = resolveScene(defaultResult, { ...fixture, measureLines });
    const z0 = defaultScene.nodes.find((n) => n.kind === "zone")!;
    const c0 = defaultScene.connectorCutouts[0]!;
    expect(z0.rect.x + 16 - c0.x).toBeGreaterThanOrEqual(4 + 3.5 / 0.6 + 3.5 / 0.9);
  });

  it("decouples r7 edge CSS from diagramZone.borderWidth while preserving 1.5px base for v1/ERD/flow and wiring emphasis + edgeLabelSize tokens", () => {
    const svelteCss = readFileSync(
      new URL("../../../components-svelte/src/lib/DiagramSceneFigure.svelte", import.meta.url),
      "utf8",
    );
    const vueBaseCss = readFileSync(
      new URL("../../../components-vue/src/DiagramSceneFigureBase.vue", import.meta.url),
      "utf8",
    );
    for (const [name, source] of [
      ["DiagramSceneFigure.svelte", svelteCss],
      ["DiagramSceneFigureBase.vue", vueBaseCss],
    ] as const) {
      const baseEdgeBlock = /\.st-diagramSceneFigure-edge\s*\{[^}]*\}/.exec(source)?.[0] ?? "";
      expect(baseEdgeBlock, `${name} base .st-diagramSceneFigure-edge keeps 1.5px zone borderWidth for v1/ERD/flow`).toContain(
        "diagramZone-borderWidth",
      );
      const r7EdgeBlock = /\.st-diagramSceneFigure-edge\[data-connector-mode="r7"\]\s*\{[^}]*\}/.exec(source)?.[0] ?? "";
      expect(r7EdgeBlock, `${name} r7 edge rule uses linkStroke`).toContain("--st-component-diagramScene-linkStroke");
      expect(r7EdgeBlock, `${name} r7 edge rule uses linkStrokeWidth`).toContain("--st-component-diagramScene-linkStrokeWidth");
      expect(r7EdgeBlock, `${name} r7 edge rule must not use zone borderWidth`).not.toContain(
        "diagramZone-borderWidth",
      );
      expect(source, `${name} r7 marker uses linkStroke`).toContain("--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a)");
      expect(source, `${name} emphasis rule`).toContain("--st-component-diagramScene-linkEmphasisStroke");
      expect(source, `${name} emphasis width`).toContain("--st-component-diagramScene-linkEmphasisStrokeWidth");
      expect(source, `${name} edgeLabelSize`).toContain("--st-component-diagramScene-edgeLabelSize");
    }
  });

  it("preserves SVG arrows and numbered-flow geometry with an undrawn link under diagram-presentation@2 (REQ-R7-28)", () => {
    const source = flowFixture(3, { labels: true, folded: true, reverse: true });
    const v1Svg = renderSceneSvg({
      document: source.document,
      registry: source.options.registry,
      bindings: source.options.bindings,
      presentation: source.presentation,
      measureLines,
      collapsed: [],
      flows: { fanOutMax: 4 },
    });
    expect(v1Svg.scene.r7Connectors).toBe(false);
    expect(v1Svg.svg.match(/marker-end="url\(#scene-arrow\)"/g)).toHaveLength(3);

    const v2Svg = renderSceneSvg({
      document: source.document,
      registry: source.options.registry,
      bindings: source.options.bindings,
      presentation: {
        ...source.presentation,
        contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      },
      measureLines,
      collapsed: [],
      flows: { fanOutMax: 4 },
    });
    expect(v2Svg.scene.r7Connectors).toBe(false);
    expect(v2Svg.svg.match(/marker-end="url\(#scene-arrow\)"/g)).toHaveLength(3);
    expect(v2Svg.scene.bounds).toEqual(v1Svg.scene.bounds);
    expect(v2Svg.scene.edges.map((e) => e.points)).toEqual(v1Svg.scene.edges.map((e) => e.points));
    const outside = relationRef("outside-view");
    const withUndrawnLink = renderSceneSvg({
      document: {
        ...source.document,
        relations: {
          ...source.document.relations,
          [outside]: {
            id: outside, type: "link", profile: "generic@2", attributes: {},
            endpoints: [{ role: "source", target: entityRef("a") }, { role: "target", target: entityRef("b") }],
          },
        },
      },
      view: v2Svg.result.view,
      presentation: { ...source.presentation, contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      registry: source.options.registry,
      bindings: source.options.bindings,
      measureLines,
      collapsed: [],
      flows: { fanOutMax: 4 },
    });
    expect(withUndrawnLink.scene.badges).toEqual(v1Svg.scene.badges);
    expect(withUndrawnLink.svg).toBe(v1Svg.svg);
  });

  it("keeps the full-size architecture SVG identical with the existing @2 pin (REQ-R7-28)", () => {
    const input = hCondInput("architecture", false);
    const legacy = renderSceneSvg(input);
    const pinned = renderSceneSvg({
      ...input,
      view: { ...input.view, presentation: { ...input.view.presentation, diagram: { ...input.presentation, contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } } },
      presentation: { ...input.presentation, contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    });
    expect(pinned.scene.r7Connectors).toBe(false);
    expect(pinned.svg).toBe(legacy.svg);
  });

  it("keeps all three compact flow badges fixed when a retained link is excluded by the view filter (REQ-R7-28)", () => {
    const source = flowFixture(3, { labels: true, folded: true, reverse: true });
    const input = {
      document: source.document,
      registry: source.options.registry,
      bindings: source.options.bindings,
      presentation: { ...source.presentation, contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      measureLines,
      collapsed: [],
      flows: { fanOutMax: 4 },
    };
    const initial = renderSceneSvg(input);
    const compact = {
      ...initial.result.view,
      presentation: { ...initial.result.view.presentation, anatomy: "v2" as const },
      filters: [{ id: "only-flow", kind: "relation-type", mode: "include", types: ["flow-step"] }] as const,
    };
    const baseline = renderSceneSvg({ ...input, view: compact });
    const link = relationRef("filtered-link");
    const occurrence = occurrenceRef("r.filtered-link");
    const filtered = renderSceneSvg({
      ...input,
      document: { ...source.document, relations: { ...source.document.relations, [link]: {
        id: link, type: "link", profile: "generic@2", attributes: {},
        endpoints: [{ role: "source", target: entityRef("a") }, { role: "target", target: entityRef("b") }],
      } } },
      view: { ...compact, relationOccurrences: { ...compact.relationOccurrences, [occurrence]: {
        id: occurrence, relation: link, endpoints: [
          { role: "source", occurrence: occurrenceRef("e.a") }, { role: "target", occurrence: occurrenceRef("e.b") },
        ],
      } } },
    });
    expect(baseline.scene.badges.map(badge => badge.box.y)).toEqual([73, 147, 137]);
    expect(filtered.scene.edges).toHaveLength(3);
    expect(filtered.scene.badges).toEqual(baseline.scene.badges);
    expect(filtered.svg).toBe(baseline.svg);

    // Also verify a link hidden via an entity attribute filter on its endpoint (endpoint-hidden)
    // leaves compact numbered-flow badges fixed, and null/partial view inputs do not throw.
    const auxEntity = entityRef("aux");
    const auxOccurrence = occurrenceRef("e.aux");
    const auxLink = relationRef("endpoint-filtered-link");
    const auxLinkOccurrence = occurrenceRef("r.endpoint-filtered-link");
    const entityFilteredView = {
      ...initial.result.view,
      presentation: { ...initial.result.view.presentation, anatomy: "v2" as const },
      filters: [{ id: "exclude-aux-entity", kind: "attribute-equals", mode: "exclude", attribute: "name", value: "Aux" }] as const,
    };
    const entityBaseline = renderSceneSvg({ ...input, view: entityFilteredView });
    const entityFiltered = renderSceneSvg({
      ...input,
      document: {
        ...source.document,
        entities: {
          ...source.document.entities,
          [auxEntity]: { id: auxEntity, type: "node", profile: "generic@2", attributes: { name: { kind: "text", value: "Aux" } } },
        },
        relations: {
          ...source.document.relations,
          [auxLink]: {
            id: auxLink, type: "link", profile: "generic@2", attributes: {},
            endpoints: [{ role: "source", target: entityRef("a") }, { role: "target", target: auxEntity }],
          },
        },
      },
      presentation: {
        ...input.presentation,
        entities: {
          ...input.presentation.entities,
          [auxOccurrence]: { form: "card", text: { title: "Aux" } },
        },
      },
      view: {
        ...entityFilteredView,
        entityOccurrences: {
          ...entityFilteredView.entityOccurrences,
          [auxOccurrence]: { id: auxOccurrence, entity: auxEntity, geometry: { x: 0, y: 0, width: 200, height: 100 } },
        },
        relationOccurrences: {
          ...entityFilteredView.relationOccurrences,
          [auxLinkOccurrence]: {
            id: auxLinkOccurrence, relation: auxLink, endpoints: [
              { role: "source", occurrence: occurrenceRef("e.a") }, { role: "target", occurrence: auxOccurrence },
            ],
          },
        },
      },
    });
    expect(entityFiltered.scene.edges).toHaveLength(3);
    expect(entityFiltered.scene.badges).toEqual(entityBaseline.scene.badges);
    expect(entityFiltered.svg).toBe(entityBaseline.svg);
    expect(isR7ConnectorPresentation(undefined, {} as never, source.document)).toBe(false);
    expect(isR7ConnectorPresentation(undefined, null as never, source.document)).toBe(false);
  });

  it("reopens a mixed-anatomy @1 scene with the same cards and rounded connectors (REQ-R7-05 / REQ-R7-11)", () => {
    const input = nestedZoneFixture({ outside: true });
    const compact = input.cards[0]!;
    const result = renderSceneSvg({
      ...input, measureLines, collapsed: [],
      presentation: {
        ...input.presentation,
        entities: {
          ...input.presentation.entities,
          [compact]: { ...input.presentation.entities[compact]!, anatomy: "v2" as const },
        },
      },
    });
    const saved = result.result.view;
    expect(validateView(saved, input.document, { registry: input.registry, bindings: input.bindings })).toEqual([]);
    expect(saved.presentation.entityAnatomy).toEqual({ [compact]: "v2" });
    const reopened = renderSceneSvg({ ...input, view: saved, presentation: saved.presentation.diagram!, measureLines, collapsed: [] });
    expect(reopened.scene.r7Connectors).toBe(true);
    expect(reopened.svg).toBe(result.svg);
  });

  it("enables DE-2 rounded connectors and r7 routing on compact v2 scenes (view anatomy v2 or entity anatomy v2) under @1 (REQ-R7-05 / REQ-R7-11 / REQ-R7-13 / REQ-R7-14)", () => {
    const base = nestedZoneFixture({ outside: true });
    // 1. view.presentation.anatomy === "v2" via createView under @1
    const v2View = {
      ...base.view,
      presentation: { ...base.view.presentation, anatomy: "v2" as const },
    };
    const byView = renderSceneSvg({ ...base, view: v2View, measureLines, collapsed: [] });
    expect(byView.scene.r7Connectors).toBe(true);
    expect(byView.result.routeSpacing).toBeDefined();
    expect(byView.svg).toContain('data-connector-mode="r7"');
    expect(byView.svg).toContain('stroke-width="3.5"');
    expect(byView.svg).not.toContain("<polyline data-scene-edge=");

    // 2. entity anatomy: "v2" under @1
    const v2Entities = Object.fromEntries(
      Object.entries(base.presentation.entities).map(([id, entry]) => [id, { ...entry, anatomy: "v2" as const }]),
    );
    const byEntity = renderSceneSvg({
      ...base,
      presentation: { ...base.presentation, entities: v2Entities },
      measureLines,
      collapsed: [],
    });
    expect(byEntity.scene.r7Connectors).toBe(true);
    expect(byEntity.result.routeSpacing).toBeDefined();
    expect(byEntity.svg).toContain('data-connector-mode="r7"');
  });

  it("keeps legacy @1 lifted solid+dashed links bundled into one route with a bundle chip (REQ-R7-28)", () => {
    const document = {
      documentId: "document:legacy-fold-bundle",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:zone": { id: "entity:zone", profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Zone" } } },
        "entity:a": { id: "entity:a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "A" } } },
        "entity:b": { id: "entity:b", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "B" } } },
        "entity:ext": { id: "entity:ext", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Ext" } } },
      },
      relations: {
        "relation:c.a": { id: "relation:c.a", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:a" }], attributes: {} },
        "relation:c.b": { id: "relation:c.b", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:b" }], attributes: {} },
        "relation:r1": { id: "relation:r1", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "one" } } },
        "relation:r2": { id: "relation:r2", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:b" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "two" } } },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SemanticDocument;

    const baseView = createView({ viewId: viewRef("legacy"), semanticDocumentId: document.documentId, revision: 1 });
    const view = {
      ...baseView,
      entityOccurrences: {
        "occurrence:e.zone": { id: occurrenceRef("e.zone"), entity: entityRef("zone"), geometry: { x: 0, y: 0, width: 600, height: 300 } },
        "occurrence:e.a": { id: occurrenceRef("e.a"), entity: entityRef("a"), group: "grp.zone", geometry: { x: 20, y: 80, width: 460, height: 200 } },
        "occurrence:e.b": { id: occurrenceRef("e.b"), entity: entityRef("b"), group: "grp.zone", geometry: { x: 500, y: 80, width: 460, height: 200 } },
        "occurrence:e.ext": { id: occurrenceRef("e.ext"), entity: entityRef("ext"), geometry: { x: 1000, y: 80, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r.r1": { id: occurrenceRef("r.r1"), relation: relationRef("r1"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.a") }, { role: "target", occurrence: occurrenceRef("e.ext") }], strokeStyle: "solid" as const },
        "occurrence:r.r2": { id: occurrenceRef("r.r2"), relation: relationRef("r2"), endpoints: [{ role: "source", occurrence: occurrenceRef("e.b") }, { role: "target", occurrence: occurrenceRef("e.ext") }], strokeStyle: "dashed" as const },
      },
      groups: { "grp.zone": { id: "grp.zone", occurrence: occurrenceRef("e.zone") } },
    };
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.zone": { form: "container" as const, text: { title: "Zone" } },
        "occurrence:e.a": { form: "card" as const, text: { title: "A" } },
        "occurrence:e.b": { form: "card" as const, text: { title: "B" } },
        "occurrence:e.ext": { form: "card" as const, text: { title: "Ext" } },
      },
      legends: {},
      categoryTokens: [],
    };
    const res = layoutScene({
      document,
      view,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;
    const scene = resolveScene(res, { document, view, presentation, measureLines });
    expect(scene.r7Connectors).toBe(false);
    expect(scene.edges).toHaveLength(1);
    expect(scene.labels.some((l) => l.bundle !== undefined)).toBe(true);
  });

  it("activates r7 connectors and legend on a retained @4 view declaring only dashed without a frozen @1 pin (REQ-R7-11 / REQ-R7-12)", () => {
    const base = nestedZoneFixture({ outside: true });
    const [r0] = base.relations.map((r) => r.occurrence);
    const dashedView = {
      ...base.view,
      presentation: { camera: base.view.presentation.camera },
      relationOccurrences: {
        ...base.view.relationOccurrences,
        [r0!]: {
          ...base.view.relationOccurrences[r0!]!,
          strokeStyle: "dashed" as const,
        },
      },
    };
    expect(isR7ConnectorPresentation(undefined, dashedView)).toBe(true);
    const presentation = {
      ...base.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    };
    const rendered = renderSceneSvg({ ...base, view: dashedView, presentation, measureLines, collapsed: [] });
    expect(rendered.scene.r7Connectors).toBe(true);
    expect(rendered.svg).toContain('stroke-dasharray="8 6"');
    expect(rendered.scene.linkLegend?.entries.map((e) => e.key)).toEqual(["solid:arrow:default", "dashed:arrow:default"]);

    const saved = JSON.parse(JSON.stringify(rendered.result.view)) as typeof rendered.result.view;
    expect(saved.presentation.diagram?.contractPin).toEqual(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN);
    expect(validateView(saved, base.document, { registry: base.registry, bindings: base.bindings })).toEqual([]);
    const reopened = renderSceneSvg({
      ...base, view: saved, presentation: saved.presentation.diagram!, measureLines, collapsed: [],
    });
    const shaft = reopened.svg.match(new RegExp(`<path data-scene-edge="${r0}"[^>]+>`))?.[0];
    expect.soft(shaft ?? "").toContain('stroke-dasharray="8 6"');
    expect.soft(reopened.scene.linkLegend?.entries.map((e) => e.key)).toEqual(["solid:arrow:default", "dashed:arrow:default"]);
  });

  it("keeps process@1 transitions at 2.5px edgeStroke and emits data-authored-legend on untitled r7 legend text", () => {
    const processDoc = {
      documentId: "document:process-stroke-guard",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["process@1"],
      typeDefinitions: {},
      entities: {
        "entity:a": { id: "entity:a", profile: "process@1", type: "step", attributes: { name: { kind: "text", value: "Start" }, kind: { kind: "enum", value: "start" } } },
        "entity:b": { id: "entity:b", profile: "process@1", type: "step", attributes: { name: { kind: "text", value: "End" }, kind: { kind: "enum", value: "end" } } },
      },
      relations: {
        "relation:a.b": { id: "relation:a.b", profile: "process@1", type: "transition", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:b" }], attributes: {} },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SemanticDocument;
    const renderedProcess = renderSceneSvg({
      document: processDoc,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: { contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN }, entities: {}, legends: {}, categoryTokens: [] },
      measureLines,
      collapsed: [],
    });
    expect(renderedProcess.scene.processConnectors).toBe(true);
    expect(renderedProcess.svg).toContain('stroke="var(--st-component-diagramScene-edgeStroke, #64748b)" stroke-width="2.5"');
    expect(renderedProcess.svg).not.toContain('stroke-width="3.5"');

    const legendFixture = r7AuthoredLegendFixture(false);
    const untitled = renderSceneSvg({
      document: legendFixture.document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
      presentation: {
        ...legendFixture.presentation,
        entities: {
          ...legendFixture.presentation.entities,
          "occurrence:e.legend": { form: "legend", anatomy: "v2", text: {} },
        },
      },
    });
    expect(untitled.svg).toContain('<text data-scene-occurrence="occurrence:e.legend" data-authored-legend=""');
  });
});
