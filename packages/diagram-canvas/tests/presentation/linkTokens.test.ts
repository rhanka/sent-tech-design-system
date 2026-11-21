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
import { flowFixture } from "../../test-support/flowFixture.js";
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));
const r7NestedFixture = () => {
  const fixture = nestedZoneFixture({ outside: true });
  return {
    ...fixture,
    presentation: {
      ...fixture.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    },
  };
};

describe("DE-2 link tokens, emphasis token and edge-label size", () => {
  it("exports dedicated link stroke widths, emphasis width, corner radius and label size defaults", () => {
    expect(DEFAULT_LINK_STROKE_WIDTH).toBe(2.5);
    expect(DEFAULT_LINK_RELATED_STROKE_WIDTH).toBe(3);
    expect(DEFAULT_LINK_PRIMARY_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_LINK_EMPHASIS_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_EDGE_CORNER_RADIUS).toBe(12);
    expect(DEFAULT_EDGE_LABEL_SIZE).toBe(18);
  });

  it("paints r7 connectors with linkStrokeWidth (not zone borderWidth) and edgeLabelSize in renderSceneSvg while preserving v1 1.5px polylines (REQ-R7-11 / REQ-R7-28)", () => {
    const v1Fixture = nestedZoneFixture({ outside: true });
    const v1Rendered = renderSceneSvg({ ...v1Fixture, measureLines, collapsed: [] });
    expect(v1Rendered.scene.r7Connectors).toBe(false);
    expect(v1Rendered.svg).toContain("<polyline data-scene-edge=");
    expect(v1Rendered.svg).toContain('stroke-width="1.5"');
    expect(v1Rendered.svg).not.toContain('data-connector-mode="r7"');

    const fixture = r7NestedFixture();
    const base = renderSceneSvg({ ...fixture, measureLines, collapsed: [] });
    expect(base.scene.r7Connectors).toBe(true);
    expect(base.svg).toContain('data-connector-mode="r7"');
    expect(base.svg).toContain('stroke-width="2.5"');
    expect(base.svg).toContain('vector-effect="non-scaling-stroke"');
    expect(base.svg).toContain('font-size="18"');
    expect(base.svg).toContain("--st-component-diagramScene-linkStrokeWidth:2.5px");
    expect(base.svg).toContain("--st-component-diagramScene-linkEmphasisStroke:");
    expect(base.svg).toContain("--st-component-diagramScene-linkEmphasisStrokeWidth:3.5px");
    expect(base.svg).toContain("--st-component-diagramScene-edgeLabelSize:18px");
    expect(base.svg).not.toContain('data-scene-edge="occurrence:lnk-0" d="');

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
    const vueStylesCss = readFileSync(
      new URL("../../../components-vue/src/styles.css", import.meta.url),
      "utf8",
    );
    for (const [name, source] of [
      ["DiagramSceneFigure.svelte", svelteCss],
      ["DiagramSceneFigureBase.vue", vueBaseCss],
      ["components-vue/src/styles.css", vueStylesCss],
    ] as const) {
      const baseEdgeBlock = /\.st-diagramSceneFigure-edge\s*\{[^}]*\}/.exec(source)?.[0] ?? "";
      expect(baseEdgeBlock, `${name} base .st-diagramSceneFigure-edge keeps 1.5px zone borderWidth for v1/ERD/flow`).toContain(
        "diagramZone-borderWidth",
      );
      const r7EdgeBlock = /\.st-diagramSceneFigure-edge\[data-connector-mode="r7"\]\s*\{[^}]*\}/.exec(source)?.[0] ?? "";
      expect(r7EdgeBlock, `${name} r7 edge rule uses linkStrokeWidth`).toContain("--st-component-diagramScene-linkStrokeWidth");
      expect(r7EdgeBlock, `${name} r7 edge rule must not use zone borderWidth`).not.toContain(
        "diagramZone-borderWidth",
      );
      expect(source, `${name} emphasis rule`).toContain("--st-component-diagramScene-linkEmphasisStroke");
      expect(source, `${name} emphasis width`).toContain("--st-component-diagramScene-linkEmphasisStrokeWidth");
      expect(source, `${name} edgeLabelSize`).toContain("--st-component-diagramScene-edgeLabelSize");
    }
  });

  it("preserves numbered-flow SVG arrowheads and keeps numbered-flow geometry unchanged under diagram-presentation@2 (REQ-R7-28)", () => {
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
    expect(byView.svg).toContain('stroke-width="2.5"');
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
  });
});
