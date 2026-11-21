import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  validateView,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";
import {
  connectorDashArray,
  connectorMarkerIds,
  connectorMarkerKind,
  connectorMarkerRef,
  extraConnectorMarkers,
  layoutMeasured,
  type LayoutOptions,
} from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { layoutScene, resolveScene, type ScenePresentation } from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));

function connectorFixture() {
  const document = {
    documentId: "document:connector-registry",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities: {
      "entity:zone": { id: "entity:zone", profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Zone" } } },
      "entity:a": { id: "entity:a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Alpha" } } },
      "entity:b": { id: "entity:b", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Beta" } } },
      "entity:c": { id: "entity:c", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Gamma" } } },
      "entity:ext": { id: "entity:ext", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "External" } } },
    },
    relations: {
      "relation:contains.a": { id: "relation:contains.a", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:a" }], attributes: {} },
      "relation:contains.b": { id: "relation:contains.b", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:b" }], attributes: {} },
      "relation:contains.c": { id: "relation:contains.c", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:c" }], attributes: {} },
      "relation:solid-default": { id: "relation:solid-default", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:b" }], attributes: { label: { kind: "text", value: "default" } } },
      "relation:dotted-open": { id: "relation:dotted-open", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:b" }, { role: "target", target: "entity:c" }], attributes: { label: { kind: "text", value: "realizes" } } },
      "relation:emphasis-none": { id: "relation:emphasis-none", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:c" }], attributes: { label: { kind: "text", value: "critical" } } },
      "relation:proposed-cross": { id: "relation:proposed-cross", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "proposed" } } },
    },
    ports: {},
    resources: {},
    extensions: [],
  } as unknown as SemanticDocument;

  const presentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      "occurrence:e.zone": { form: "container", text: { title: "Zone", subtitle: "Group" }, anatomy: "v2" },
      "occurrence:e.a": { form: "card", text: { title: "Alpha", body: "Service A" }, anatomy: "v2" },
      "occurrence:e.b": { form: "card", text: { title: "Beta", body: "Service B" }, anatomy: "v2" },
      "occurrence:e.c": { form: "card", text: { title: "Gamma", body: "Service C" }, anatomy: "v2" },
      "occurrence:e.ext": { form: "card", text: { title: "External", body: "Peer" }, anatomy: "v2" },
    },
    relations: {
      "relation:solid-default": { strokeStyle: "solid", arrowhead: "arrow", emphasis: "default" },
      "relation:dotted-open": { strokeStyle: "dotted", arrowhead: "arrow" },
      "relation:emphasis-none": { arrowhead: "none", emphasis: "emphasis" },
      "relation:proposed-cross": { strokeStyle: "dashed", arrowhead: "arrow", emphasis: "emphasis" },
    },
    legends: {},
    categoryTokens: [],
  } as unknown as ScenePresentation;

  return { document, presentation };
}

describe("connectorStyle helpers (DE-2 step 3)", () => {
  it("maps closed dash words and arrowhead kinds to deterministic SVG attributes", () => {
    expect(connectorDashArray(undefined)).toBeUndefined();
    expect(connectorDashArray("solid")).toBeUndefined();
    expect(connectorDashArray("dashed")).toBe("8 6");
    expect(connectorDashArray("dotted")).toBe("2 5");

    expect(connectorMarkerKind(undefined)).toBe("arrow");
    expect(connectorMarkerKind("arrow")).toBe("arrow");
    expect(connectorMarkerKind("none")).toBe("none");

    const ids = connectorMarkerIds("scene-arrow");
    expect(ids).toEqual({
      filled: "scene-arrow",
      filledEmphasis: "scene-arrow-emphasis",
    });
    expect(connectorMarkerRef({}, ids)).toBe("url(#scene-arrow)");
    expect(connectorMarkerRef({ arrowhead: "arrow" }, ids)).toBe("url(#scene-arrow)");
    expect(connectorMarkerRef({ emphasis: "emphasis" }, ids)).toBe("url(#scene-arrow-emphasis)");
    expect(connectorMarkerRef({ arrowhead: "none", emphasis: "emphasis" }, ids)).toBeUndefined();
    expect(connectorMarkerRef({ directed: true }, ids)).toBeUndefined();
    expect(connectorMarkerRef({ markers: "<path/>" }, ids)).toBeUndefined();

    // Default scenes emit zero extra markers.
    expect(extraConnectorMarkers([{}, { arrowhead: "arrow" }, { arrowhead: "none" }], ids)).toEqual([]);
    const extras = extraConnectorMarkers(
      [{ arrowhead: "arrow", emphasis: "emphasis" }, { arrowhead: "none", emphasis: "emphasis" }],
      ids,
    );
    expect(extras.map((m) => m.id)).toEqual(["scene-arrow-emphasis"]);
  });
});

describe("renderSceneSvg connector registries and fold preservation (DE-2 step 3)", () => {
  it("paints dash patterns, arrowheads and emphasis independently while keeping default marker first", () => {
    const { document, presentation } = connectorFixture();
    const { svg, result, scene } = renderSceneSvg({
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });

    // Emitted view passes diagram-core validateView cleanly (transient relations stripped from presentation.diagram).
    expect(validateView(result.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    expect(scene.edges).toHaveLength(4);

    // Default arrow marker stays FIRST in <defs>; emphasis marker follows; both lock userSpaceOnUse 10.5x10.5.
    const markerIdsInOrder = [...svg.matchAll(/<marker id="([^"]+)"/g)].map((m) => m[1]);
    expect(markerIdsInOrder[0]).toBe("scene-arrow");
    expect(markerIdsInOrder).toEqual(["scene-arrow", "scene-arrow-emphasis"]);
    expect(svg).toContain('<marker id="scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10.5" markerHeight="10.5"');
    expect(svg).toContain('markerUnits="userSpaceOnUse" markerWidth="10.5" markerHeight="10.5"');

    const edgeTag = (id: string) => {
      const match = svg.match(new RegExp(`<path data-scene-edge="${id}"[^>]*/>`));
      expect(match, `missing edge ${id}`).not.toBeNull();
      return match![0];
    };

    // solid + arrow + default
    const solidTag = edgeTag("occurrence:r.solid-default");
    expect(solidTag).not.toContain("stroke-dasharray");
    expect(solidTag).toContain('stroke="var(--st-component-diagramScene-edgeStroke, #64748b)"');
    expect(solidTag).toContain('stroke-width="2.5"');
    expect(solidTag).toContain('marker-end="url(#scene-arrow)"');

    // dotted + arrow
    const dottedTag = edgeTag("occurrence:r.dotted-open");
    expect(dottedTag).toContain('stroke-dasharray="2 5"');
    expect(dottedTag).toContain('data-edge-stroke="dotted"');
    expect(dottedTag).toContain('marker-end="url(#scene-arrow)"');

    // emphasis + none: emphasis changes colour + width ONLY (NOT dash!), arrowhead none omits marker-end
    const emphasisTag = edgeTag("occurrence:r.emphasis-none");
    expect(emphasisTag).not.toContain("stroke-dasharray");
    expect(emphasisTag).not.toContain("marker-end");
    expect(emphasisTag).toContain('data-edge-emphasis="emphasis"');
    expect(emphasisTag).toContain('data-edge-arrowhead="none"');
    expect(emphasisTag).toContain('stroke="var(--st-component-diagramScene-linkEmphasisStroke, var(--st-semantic-border-interactive, #001f33))"');
    expect(emphasisTag).toContain('stroke-width="3.5"');

    // dashed (proposed) + arrow + emphasis: dash and emphasis compose cleanly
    const crossTag = edgeTag("occurrence:r.proposed-cross");
    expect(crossTag).toContain('stroke-dasharray="8 6"');
    expect(crossTag).toContain('data-edge-stroke="dashed"');
    expect(crossTag).toContain('data-edge-emphasis="emphasis"');
    expect(crossTag).toContain('stroke="var(--st-component-diagramScene-linkEmphasisStroke, var(--st-semantic-border-interactive, #001f33))"');
    expect(crossTag).toContain('stroke-width="3.5"');
    expect(crossTag).toContain('marker-end="url(#scene-arrow-emphasis)"');

    // Standalone SVG scopes token defaults to svg:root (preserving inline host dark-theme inheritance)
    // and aligns linkEmphasisStroke fallback to the core light token (#001f33).
    expect(svg).toContain("svg:root{");
    expect(svg).not.toContain("}svg{");
    expect(svg).toContain("--st-component-diagramScene-linkEmphasisStroke:#001f33;");
  });

  it("re-routes connectors with rounded elbows and preserves dash, arrowhead and emphasis across fold/unfold", () => {
    const { document, presentation } = connectorFixture();
    const folded = renderSceneSvg({
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
    });
    expect(validateView(folded.result.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    expect(folded.scene.edges).toHaveLength(1);
    const edge = folded.scene.edges[0]!;
    expect(edge.occurrence).toBe("occurrence:r.proposed-cross");
    expect(edge.strokeStyle).toBe("dashed");
    expect(edge.arrowhead).toBeUndefined();
    expect(edge.emphasis).toBe("emphasis");
    expect(folded.svg).toContain('data-scene-edge="occurrence:r.proposed-cross"');
    expect(folded.svg).toContain('stroke-dasharray="8 6"');
    expect(folded.svg).toContain('stroke="var(--st-component-diagramScene-linkEmphasisStroke, var(--st-semantic-border-interactive, #001f33))"');
    expect(folded.svg).toContain('stroke-width="3.5"');
    expect(folded.svg).toContain('marker-end="url(#scene-arrow-emphasis)"');
    expect(folded.svg).not.toContain("<polyline");

    // Unfolding from the same retained source restores all 4 styled connectors.
    const unfolded = layoutScene({
      document,
      view: folded.result.view,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });
    expect(unfolded.status).toBe("laid-out");
    if (unfolded.status !== "laid-out") return;
    const scene = resolveScene(unfolded, { document, view: folded.result.view, presentation, measureLines });
    expect(scene.edges).toHaveLength(4);
    expect(scene.edges.find((e) => e.occurrence === "occurrence:r.dotted-open")).toMatchObject({
      strokeStyle: "dotted",
    });
    expect(scene.edges.find((e) => e.occurrence === "occurrence:r.emphasis-none")).toMatchObject({
      arrowhead: "none",
      emphasis: "emphasis",
    });
  });

  it("refuses raw geometry and unknown words in presentation.relations", () => {
    const { document, presentation } = connectorFixture();
    const invalid = layoutMeasured(document, {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureText: () => ({ width: 40, height: 20 }),
      measureLines,
      targetWidth: 1280,
      presentation: {
        ...presentation,
        relations: {
          "relation:solid-default": {
            strokeStyle: "4 4" as never,
            arrowhead: "M0 0L10 5L0 10Z" as never,
            emphasis: "dashed" as never,
            dashArray: [4, 4],
          } as never,
        },
      },
    } as LayoutOptions);
    expect(invalid.status).toBe("refused");
    if (invalid.status !== "refused") return;
    expect(invalid.refusals.map((r) => r.path).sort()).toEqual([
      "presentation.relations.relation:solid-default.arrowhead",
      "presentation.relations.relation:solid-default.dashArray",
      "presentation.relations.relation:solid-default.emphasis",
      "presentation.relations.relation:solid-default.strokeStyle",
    ]);
  });

  it("refuses presentation.relations under frozen diagram-presentation@1 and unknown arrowheads in retained views without throwing TypeError (REQ-R7-11 / REQ-R7-17)", () => {
    const { document, presentation } = connectorFixture();
    // Frozen @1 + presentation.relations refuses cleanly instead of emitting a validateView-invalid view.
    const v1Refused = layoutScene({
      document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      presentation: {
        ...presentation,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      },
      collapsed: [],
    });
    expect(v1Refused.status).toBe("refused");
    if (v1Refused.status === "refused") {
      expect(v1Refused.refusals.some((r) => r.path.startsWith("presentation.relations."))).toBe(true);
    }

    // Valid @2 layout -> retained view with an injected unknown arrowhead / literal fields refuses cleanly (never throws).
    const base = layoutScene({
      document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      presentation,
      collapsed: [],
    });
    expect(base.status).toBe("laid-out");
    if (base.status !== "laid-out") return;
    expect(validateView(base.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);

    const tampered = {
      ...base.view,
      relationOccurrences: {
        ...base.view.relationOccurrences,
        "occurrence:r.solid-default": {
          ...base.view.relationOccurrences["occurrence:r.solid-default"]!,
          arrowhead: "diamond" as never,
          color: "#ff0000" as never,
        },
      },
    };
    const unknownHead = layoutScene({
      document,
      view: tampered,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      presentation: base.view.presentation.diagram!,
      collapsed: [],
    });
    expect(unknownHead.status).toBe("refused");
    if (unknownHead.status === "refused") {
      expect(unknownHead.refusals.map((r) => r.path).sort()).toEqual([
        "sourceView.relationOccurrences.occurrence:r.solid-default.arrowhead",
        "sourceView.relationOccurrences.occurrence:r.solid-default.color",
      ]);
    }
  });

  it("round-trips a persisted @2 dashed-only view cleanly through validateView without losing r7 mode, dashes, or legend (REQ-R7-11 / REQ-R7-12)", () => {
    const { document, presentation } = connectorFixture();
    const dashedOnlyPresentation = {
      ...presentation,
      relations: {
        "relation:proposed-cross": { strokeStyle: "dashed" as const },
      },
    };
    const first = layoutScene({
      document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      presentation: dashedOnlyPresentation,
      collapsed: [],
    });
    expect(first.status).toBe("laid-out");
    if (first.status !== "laid-out") return;
    expect(validateView(first.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);

    // Re-render and fold from the persisted view alone (presentation.relations stripped).
    const persistedPres = first.view.presentation.diagram!;
    const second = layoutScene({
      document,
      view: first.view,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      presentation: persistedPres,
      collapsed: [],
    });
    expect(second.status).toBe("laid-out");
    if (second.status !== "laid-out") return;
    const scene = resolveScene(second, {
      document,
      view: first.view,
      presentation: persistedPres,
      measureLines,
    });
    expect(scene.r7Connectors).toBe(true);
    expect(scene.edges.find((e) => e.occurrence === "occurrence:r.proposed-cross")?.strokeStyle).toBe("dashed");
    expect(scene.linkLegend?.entries.map((e) => e.key)).toEqual(["solid:arrow:default", "dashed:arrow:default"]);
  });
});
