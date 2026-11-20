import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";
import {
  buildSceneLinkLegend,
  collectLinkLegendStyles,
  defaultLinkStyleLabel,
  LINK_LEGEND_GAP,
  linkLegendSwatchGeometry,
  linkStyleKey,
  rectsIntersect,
} from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { layoutScene, resolveScene, sceneFit, type ScenePresentation } from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));

function multiStyleFixture() {
  const document = {
    documentId: "document:auto-link-legend",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities: {
      "entity:zone": { id: "entity:zone", profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Core" } } },
      "entity:a": { id: "entity:a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Alpha" } } },
      "entity:b": { id: "entity:b", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Beta" } } },
      "entity:c": { id: "entity:c", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Gamma" } } },
      "entity:ext": { id: "entity:ext", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "External" } } },
    },
    relations: {
      "relation:contains.a": { id: "relation:contains.a", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:a" }], attributes: {} },
      "relation:contains.b": { id: "relation:contains.b", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:b" }], attributes: {} },
      "relation:contains.c": { id: "relation:contains.c", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:c" }], attributes: {} },
      "relation:r-dotted": { id: "relation:r-dotted", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:b" }], attributes: { label: { kind: "text", value: "observes" } } },
      "relation:r-emphasis": { id: "relation:r-emphasis", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:b" }, { role: "target", target: "entity:c" }], attributes: { label: { kind: "text", value: "critical" } } },
      "relation:r-default": { id: "relation:r-default", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:c" }], attributes: { label: { kind: "text", value: "calls" } } },
      "relation:r-proposed": { id: "relation:r-proposed", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "proposed" } } },
    },
    ports: {},
    resources: {},
    extensions: [],
  } as unknown as SemanticDocument;

  const presentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      "occurrence:e.zone": { form: "container", text: { title: "Core", subtitle: "Zone" }, anatomy: "v2" },
      "occurrence:e.a": { form: "card", text: { title: "Alpha", body: "Service A" }, anatomy: "v2" },
      "occurrence:e.b": { form: "card", text: { title: "Beta", body: "Service B" }, anatomy: "v2" },
      "occurrence:e.c": { form: "card", text: { title: "Gamma", body: "Service C" }, anatomy: "v2" },
      "occurrence:e.ext": { form: "card", text: { title: "External", body: "Peer" }, anatomy: "v2" },
    },
    relations: {
      "relation:r-dotted": { strokeStyle: "dotted", arrowhead: "open-triangle" },
      "relation:r-emphasis": { arrowhead: "none", emphasis: "emphasis" },
      "relation:r-default": { strokeStyle: "solid", arrowhead: "arrow" },
      "relation:r-proposed": { strokeStyle: "dashed", arrowhead: "filled-triangle" },
    },
    legends: {},
    categoryTokens: [],
  } as unknown as ScenePresentation;

  return { document, presentation };
}

describe("automatic link-style legend (DE-2 step 4)", () => {
  it("omits the legend for zero edges or a single distinct link style", () => {
    expect(collectLinkLegendStyles([])).toEqual([]);
    expect(collectLinkLegendStyles([{}, { strokeStyle: "solid", arrowhead: "arrow" }, { arrowhead: "filled-triangle", emphasis: "default" }])).toEqual([]);
    expect(collectLinkLegendStyles([{ strokeStyle: "dashed" }, { strokeStyle: "dashed", arrowhead: "arrow" }])).toEqual([]);

    // ERD and flow edges are not counted as link-style legend entries.
    expect(collectLinkLegendStyles([{ strokeStyle: "dashed", markers: "<path/>" }, { strokeStyle: "dotted", directed: true }])).toEqual([]);

    const contentBounds = { x: 0, y: 0, width: 800, height: 400 };
    expect(buildSceneLinkLegend({ edges: [{}], contentBounds, measureLines })).toBeUndefined();
    expect(
      buildSceneLinkLegend({
        edges: [{ strokeStyle: "solid" }, { strokeStyle: "dashed" }],
        contentBounds,
        measureLines,
        anchor: "none",
      }),
    ).toBeUndefined();
  });

  it("orders distinct styles in fixed canonical order regardless of edge order", () => {
    const forward = collectLinkLegendStyles([
      { strokeStyle: "dotted", arrowhead: "open-triangle" },
      { strokeStyle: "dashed", emphasis: "emphasis" },
      { strokeStyle: "solid", arrowhead: "none", emphasis: "emphasis" },
      { strokeStyle: "solid", arrowhead: "arrow" },
      { strokeStyle: "dashed" },
    ]);
    const reversed = collectLinkLegendStyles([
      { strokeStyle: "dashed" },
      { strokeStyle: "solid", arrowhead: "arrow" },
      { strokeStyle: "solid", arrowhead: "none", emphasis: "emphasis" },
      { strokeStyle: "dashed", emphasis: "emphasis" },
      { strokeStyle: "dotted", arrowhead: "open-triangle" },
    ]);
    expect(forward.map((e) => e.key)).toEqual([
      "solid:filled-triangle:default",
      "solid:none:emphasis",
      "dashed:filled-triangle:default",
      "dashed:filled-triangle:emphasis",
      "dotted:open-triangle:default",
    ]);
    expect(reversed.map((e) => e.key)).toEqual(forward.map((e) => e.key));
    expect(defaultLinkStyleLabel(forward[0]!)).toBe("Link");
    expect(defaultLinkStyleLabel(forward[2]!)).toBe("Proposed (dashed)");
    expect(defaultLinkStyleLabel(forward[4]!)).toBe("Dotted · Open arrow");

    const swatch = linkLegendSwatchGeometry(forward[4]!);
    expect(swatch.dashArray).toBe("2 5");
    expect(swatch.arrowPath).toBeTruthy();
    expect(swatch.arrowStroke).toBeTruthy();
    const undirected = linkLegendSwatchGeometry(forward[1]!);
    expect(undirected.arrowPath).toBeUndefined();
    expect(undirected.strokeWidth).toBe(3.5);
  });

  it("anchors on the right edge strip outside functional zones, joins bounds/fit, and recomputes across fold/unfold", () => {
    const { document, presentation } = multiStyleFixture();
    const baseInput = {
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [] as never[],
    };

    const unfoldedResult = layoutScene(baseInput);
    expect(unfoldedResult.status).toBe("laid-out");
    if (unfoldedResult.status !== "laid-out") return;

    const withLegend = resolveScene(unfoldedResult, baseInput);
    const suppressed = resolveScene(unfoldedResult, { ...baseInput, legend: "none" });

    expect(suppressed.linkLegend).toBeUndefined();
    expect(withLegend.linkLegend).toBeDefined();
    const legend = withLegend.linkLegend!;
    expect(legend.anchor).toBe("right");
    expect(legend.entries.map((e) => e.key)).toEqual([
      "solid:filled-triangle:default",
      "solid:none:emphasis",
      "dashed:filled-triangle:default",
      "dotted:open-triangle:default",
    ]);

    // Anchored on the right edge strip strictly outside every functional zone, card, edge and label.
    const functionalRight = suppressed.bounds!.x + suppressed.bounds!.width;
    expect(legend.rect.x).toBeGreaterThanOrEqual(functionalRight + LINK_LEGEND_GAP - 0.1);
    expect(legend.rect.y).toBeCloseTo(suppressed.bounds!.y, 1);
    for (const node of withLegend.nodes) {
      expect(rectsIntersect(node.rect, legend.rect)).toBe(false);
    }
    for (const label of withLegend.labels) {
      expect(rectsIntersect(label.box, legend.rect)).toBe(false);
    }

    // Legend is part of scene.bounds and camera fit.
    expect(withLegend.bounds!.x + withLegend.bounds!.width).toBeGreaterThanOrEqual(legend.rect.x + legend.rect.width - 1 / 64);
    expect(withLegend.bounds!.width).toBeGreaterThan(suppressed.bounds!.width);
    const fitWithLegend = sceneFit({ bounds: withLegend.bounds!, viewWidth: 1440, windowHeight: 900 });
    const fitWithout = sceneFit({ bounds: suppressed.bounds!, viewWidth: 1440, windowHeight: 900 });
    expect(fitWithLegend.zoomFit).toBeLessThanOrEqual(fitWithout.zoomFit);

    // Fold the zone: 3 internal styled links hide, only 1 cross-boundary dashed link remains -> single style -> NO legend!
    const foldedInput = { ...baseInput, collapsed: [occurrenceRef("e.zone")] };
    const foldedResult = layoutScene(foldedInput);
    expect(foldedResult.status).toBe("laid-out");
    if (foldedResult.status !== "laid-out") return;
    const foldedScene = resolveScene(foldedResult, foldedInput);
    expect(foldedScene.edges).toHaveLength(1);
    expect(foldedScene.linkLegend).toBeUndefined();

    // Unfold again from retained view: all 4 styles and right-anchored legend return deterministically.
    const refoldedInput = { ...baseInput, view: foldedResult.view, collapsed: [] as never[] };
    const refoldedResult = layoutScene(refoldedInput);
    expect(refoldedResult.status).toBe("laid-out");
    if (refoldedResult.status !== "laid-out") return;
    const refoldedScene = resolveScene(refoldedResult, refoldedInput);
    expect(refoldedScene.linkLegend?.entries.map((e) => e.key)).toEqual(legend.entries.map((e) => e.key));
    expect(refoldedScene.linkLegend?.rect).toEqual(legend.rect);
  });

  it("renders the legend group in renderSceneSvg and supports custom labels and bottom anchor", () => {
    const { document, presentation } = multiStyleFixture();
    const customKey = linkStyleKey({ strokeStyle: "dashed", arrowhead: "filled-triangle", emphasis: "default" });
    const { svg, scene } = renderSceneSvg({
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
      legendTitle: "Connectors",
      legendLabels: { [customKey]: "Planned link" },
    });

    expect(scene.linkLegend?.title).toBe("Connectors");
    expect(svg).toContain('data-scene-legend=""');
    expect(svg).toContain('data-legend-anchor="right"');
    expect(svg).toContain(">Connectors</text>");
    expect(svg).toContain(">Planned link</text>");
    expect(svg).toContain('data-legend-style="dotted:open-triangle:default"');
    expect(svg).toContain('stroke-dasharray="2 5"');

    // Bottom anchor places legend below functional bounds.
    const bottom = renderSceneSvg({
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
      legend: "bottom",
    });
    expect(bottom.scene.linkLegend?.anchor).toBe("bottom");
    expect(bottom.svg).toContain('data-legend-anchor="bottom"');

    // Single-style scene omits the legend entirely in SVG output.
    const single = renderSceneSvg({
      document,
      presentation: { ...presentation, relations: {} },
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });
    expect(single.scene.linkLegend).toBeUndefined();
    expect(single.svg).not.toContain("data-scene-legend");
  });
});
