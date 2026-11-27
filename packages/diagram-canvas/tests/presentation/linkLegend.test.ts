import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entityRef,
  lowerLayoutHintsV2,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";
import {
  buildSceneLinkLegend,
  collectLegendEntityMarks,
  collectLinkLegendStyles,
  defaultLegendMarkLabel,
  defaultLegendTitle,
  defaultLinkStyleLabel,
  layoutMeasured,
  LINK_LEGEND_CORNER_RADIUS,
  LINK_LEGEND_GAP,
  LINK_LEGEND_HEADER_GAP,
  LINK_LEGEND_HEADER_HEIGHT,
  LINK_LEGEND_MIN_WIDTH,
  LINK_LEGEND_PADDING,
  LINK_LEGEND_ROW_GAP,
  LINK_LEGEND_ROW_HEIGHT,
  linkLegendSwatchGeometry,
  linkStyleKey,
  rectsIntersect,
  resolveLegendKeySwatch,
} from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { layoutScene, resolveScene, sceneFit, type ScenePresentation } from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { r7AuthoredLegendFixture } from "../../test-support/r7AuthoredLegendFixture.js";

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
      "relation:r-dotted": { strokeStyle: "dotted", arrowhead: "arrow" },
      "relation:r-emphasis": { arrowhead: "none", emphasis: "emphasis" },
      "relation:r-default": { strokeStyle: "solid", arrowhead: "arrow" },
      "relation:r-proposed": { strokeStyle: "dashed", arrowhead: "arrow" },
    },
    legends: {},
    categoryTokens: [],
  } as unknown as ScenePresentation;

  return { document, presentation };
}

describe("automatic link-style legend (DE-2 step 4)", () => {
  it("omits the legend for zero edges or a single distinct link style", () => {
    expect(collectLinkLegendStyles([])).toEqual([]);
    expect(collectLinkLegendStyles([{}, { strokeStyle: "solid", arrowhead: "arrow" }, { arrowhead: "arrow", emphasis: "default" }])).toEqual([]);
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
      { strokeStyle: "dotted", arrowhead: "arrow" },
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
      { strokeStyle: "dotted", arrowhead: "arrow" },
    ]);
    expect(forward.map((e) => e.key)).toEqual([
      "solid:arrow:default",
      "solid:none:emphasis",
      "dashed:arrow:default",
      "dashed:arrow:emphasis",
      "dotted:arrow:default",
    ]);
    expect(reversed.map((e) => e.key)).toEqual(forward.map((e) => e.key));
    expect(defaultLinkStyleLabel(forward[0]!)).toBe("Link");
    expect(defaultLinkStyleLabel(forward[2]!)).toBe("Proposed (dashed)");
    expect(defaultLinkStyleLabel(forward[4]!)).toBe("Dotted");

    const swatch = linkLegendSwatchGeometry(forward[4]!);
    expect(swatch.dashArray).toBe("2 5");
    expect(swatch.stroke).toBe("var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))");
    expect(swatch.arrowFill).toBe("var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))");
    expect(swatch.strokeWidth).toBe(3.5);
    expect(swatch.arrowPath).toBeTruthy();
    expect(swatch.arrowStroke).toBeUndefined();
    const undirected = linkLegendSwatchGeometry(forward[1]!);
    expect(undirected.arrowPath).toBeUndefined();
    expect(undirected.strokeWidth).toBe(5);
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
      "solid:arrow:default",
      "solid:none:emphasis",
      "dashed:arrow:default",
      "dotted:arrow:default",
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
    const customKey = linkStyleKey({ strokeStyle: "dashed", arrowhead: "arrow", emphasis: "default" });
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
    expect(svg).toContain('data-legend-style="dotted:arrow:default"');
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

  it("keeps lifted cross-zone edges with distinct strokeStyle, arrowhead, or emphasis separate on fold while bundling identical styles (REQ-R7-05 / REQ-R7-12)", () => {
    const document = {
      documentId: "document:lifted-bundle-styles",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:zone": { id: "entity:zone", profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Core" } } },
        "entity:a": { id: "entity:a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Alpha" } } },
        "entity:b": { id: "entity:b", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Beta" } } },
        "entity:c": { id: "entity:c", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Gamma" } } },
        "entity:d": { id: "entity:d", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Delta" } } },
        "entity:ext": { id: "entity:ext", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "External" } } },
      },
      relations: {
        "relation:contains.a": { id: "relation:contains.a", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:a" }], attributes: {} },
        "relation:contains.b": { id: "relation:contains.b", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:b" }], attributes: {} },
        "relation:contains.c": { id: "relation:contains.c", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:c" }], attributes: {} },
        "relation:contains.d": { id: "relation:contains.d", profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: "entity:d" }], attributes: {} },
        // Two identical dashed links should bundle together on fold.
        "relation:r-dash-1": { id: "relation:r-dash-1", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:a" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "d1" } } },
        "relation:r-dash-2": { id: "relation:r-dash-2", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:b" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "d2" } } },
        // Different strokeStyle (dotted) must NOT merge with dashed.
        "relation:r-dot": { id: "relation:r-dot", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:c" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "dot" } } },
        // Different arrowhead + emphasis (solid, none, emphasis) must NOT merge with either.
        "relation:r-emph": { id: "relation:r-emph", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:d" }, { role: "target", target: "entity:ext" }], attributes: { label: { kind: "text", value: "emph" } } },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SemanticDocument;

    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      entities: {
        "occurrence:e.zone": { form: "container", text: { title: "Core", subtitle: "Zone" }, anatomy: "v2" },
        "occurrence:e.a": { form: "card", text: { title: "Alpha", body: "A" }, anatomy: "v2" },
        "occurrence:e.b": { form: "card", text: { title: "Beta", body: "B" }, anatomy: "v2" },
        "occurrence:e.c": { form: "card", text: { title: "Gamma", body: "C" }, anatomy: "v2" },
        "occurrence:e.d": { form: "card", text: { title: "Delta", body: "D" }, anatomy: "v2" },
        "occurrence:e.ext": { form: "card", text: { title: "External", body: "Peer" }, anatomy: "v2" },
      },
      relations: {
        "relation:r-dash-1": { strokeStyle: "dashed" },
        "relation:r-dash-2": { strokeStyle: "dashed" },
        "relation:r-dot": { strokeStyle: "dotted" },
        "relation:r-emph": { strokeStyle: "solid", arrowhead: "none", emphasis: "emphasis" },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;

    const foldedInput = {
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
    };
    const foldedResult = layoutScene(foldedInput);
    expect(foldedResult.status).toBe("laid-out");
    if (foldedResult.status !== "laid-out") return;

    // 2 identical dashed links bundle into 1; dotted and solid/none/emphasis stay separate => 3 edges total.
    const foldedScene = resolveScene(foldedResult, foldedInput);
    expect(foldedScene.edges).toHaveLength(3);
    expect(Object.keys(foldedResult.edgeBundles ?? {})).toHaveLength(1);
    const [bundle] = Object.values(foldedResult.edgeBundles ?? {});
    expect(bundle?.members).toHaveLength(2);
    expect(foldedScene.linkLegend).toBeDefined();
    expect(foldedScene.linkLegend!.entries.map((e) => [e.strokeStyle, e.arrowhead, e.emphasis])).toEqual([
      ["solid", "none", "emphasis"],
      ["dashed", expect.any(String), "default"],
      ["dotted", expect.any(String), "default"],
    ]);
  });

  it("scales measured legend box width, headerHeight, headerGap, and rowHeight identically for HTML hosts and renderSceneSvg across edgeLabelSize values (REQ-R7-12)", () => {
    const { document, presentation } = multiStyleFixture();
    const baseInput = {
      document,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [] as never[],
    };
    const defaultLayout = layoutScene(baseInput);
    expect(defaultLayout.status).toBe("laid-out");
    if (defaultLayout.status !== "laid-out") return;
    const defaultScene = resolveScene(defaultLayout, baseInput);

    for (const fontSize of [12, 18, 27]) {
      const input = fontSize === 18 ? baseInput : { ...baseInput, metrics: { edgeLabelSize: fontSize } };
      const laid = layoutScene(input);
      expect(laid.status).toBe("laid-out");
      if (laid.status !== "laid-out") return;
      const scene = resolveScene(laid, input);
      const legend = scene.linkLegend!;
      expect(legend).toBeDefined();
      expect(legend.fontSize).toBe(fontSize);
      expect(legend.headerGap).toBeGreaterThan(0);
      expect(legend.rowHeight).toBeGreaterThanOrEqual(legend.swatchHeight);
      // Every entry sits at padding + headerHeight + headerGap + i*(rowHeight + rowGap), and the last row + bottom padding equals rect.height exactly.
      legend.entries.forEach((entry, index) => {
        expect(entry.rowY).toBe(legend.padding + legend.headerHeight + legend.headerGap + index * (legend.rowHeight + legend.rowGap));
      });
      const last = legend.entries.at(-1)!;
      expect(last.rowY + last.rowHeight + legend.padding).toBe(legend.rect.height);

      // HTML host inline geometry variables match buildSceneLinkLegend 1:1.
      const { svg } = renderSceneSvg(input);
      const expectedFirstSwatchY = legend.entries[0]!.rowY + (legend.entries[0]!.rowHeight - legend.swatchHeight) / 2;
      expect(svg).toContain(`transform="translate(${legend.padding} ${expectedFirstSwatchY})"`);
    }

    const largeInput = { ...baseInput, metrics: { edgeLabelSize: 27 } };
    const largeLayout = layoutScene(largeInput);
    expect(largeLayout.status).toBe("laid-out");
    if (largeLayout.status !== "laid-out") return;
    const largeScene = resolveScene(largeLayout, largeInput);
    expect(largeScene.linkLegend!.rect.width).toBeGreaterThan(defaultScene.linkLegend!.rect.width);
    expect(largeScene.linkLegend!.rect.height).toBeGreaterThan(defaultScene.linkLegend!.rect.height);
    expect(largeScene.linkLegend!.headerHeight).toBeGreaterThan(defaultScene.linkLegend!.headerHeight);
    expect(largeScene.linkLegend!.headerGap).toBeGreaterThan(defaultScene.linkLegend!.headerGap);
    expect(largeScene.linkLegend!.entries[0]!.rowHeight).toBeGreaterThan(defaultScene.linkLegend!.entries[0]!.rowHeight);
  });

  it("keeps legend width bounded when a supported CardLineMeasure omits optional lineWidths (REQ-R7-12)", () => {
    const { document, presentation } = multiStyleFixture();
    // Supported CardLineMeasure returning lines + tooWide without optional lineWidths.
    const measureWithoutLineWidths = (text: string, role: "kicker" | "title" | "body" | "footer", availableWidth: number) => {
      const base = defaultCardMeasure(text, role, availableWidth);
      return { lines: base.lines, tooWide: base.tooWide };
    };
    const rendered = renderSceneSvg(
      {
        document,
        presentation,
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        measureLines: cardLineMeasurer(measureWithoutLineWidths),
        collapsed: [],
      },
      { measure: measureWithoutLineWidths },
    );
    const legend = rendered.scene.linkLegend;
    expect(legend).toBeDefined();
    expect(legend!.rect.width).toBeGreaterThanOrEqual(LINK_LEGEND_MIN_WIDTH);
    expect(legend!.rect.width).toBeLessThan(1000);
    expect(legend!.rect.x + legend!.rect.width).toBeCloseTo(rendered.scene.bounds!.x + rendered.scene.bounds!.width, 6);
  });

  it("DE3-L1a: enforces single legend authority (authored form:legend suppresses automatic linkLegend, data-authored-legend is r7-only)", () => {
    const r7 = r7AuthoredLegendFixture(false);
    const r7Base = {
      document: r7.document,
      presentation: r7.presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [] as ReturnType<typeof occurrenceRef>[],
    };
    const unfolded = renderSceneSvg(r7Base);
    expect(unfolded.scene.r7Connectors).toBe(true);
    const authoredUnfolded = unfolded.scene.nodes.filter((n) => n.presentation?.form === "legend");
    expect(authoredUnfolded).toHaveLength(1);
    expect(unfolded.scene.linkLegend).toBeUndefined();
    expect(authoredUnfolded.length + (unfolded.scene.linkLegend ? 1 : 0)).toBeLessThanOrEqual(1);
    expect(unfolded.svg).toContain('data-authored-legend=""');
    expect(unfolded.svg).not.toContain("data-scene-legend");

    const folded = renderSceneSvg({ ...r7Base, collapsed: [occurrenceRef("e.zone-core")] });
    const authoredFolded = folded.scene.nodes.filter((n) => n.presentation?.form === "legend");
    expect(authoredFolded).toHaveLength(1);
    expect(folded.scene.linkLegend).toBeUndefined();
    expect(authoredFolded.length + (folded.scene.linkLegend ? 1 : 0)).toBeLessThanOrEqual(1);
    expect(folded.svg).toContain('data-authored-legend=""');
    expect(folded.svg).not.toContain("data-scene-legend");

    // Composed scene with authored legend (expanded and collapsed) suppresses automatic linkLegend in measured.ts too.
    const composedHints = lowerLayoutHintsV2({
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      legend: "free-cell",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "main", items: [entityRef("zone-core"), entityRef("gamma"), entityRef("delta")] },
            { id: "foot", items: [entityRef("legend")] },
          ],
          cells: {
            [entityRef("zone-core")]: { column: "s1" },
            [entityRef("gamma")]: { column: "s2" },
            [entityRef("delta")]: { column: "s3" },
            [entityRef("legend")]: { column: "s1" },
          },
        },
      },
    });
    for (const collapsed of [[], [occurrenceRef("e.legend")]] as const) {
      const laid = layoutMeasured(r7.document, {
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        presentation: r7.presentation,
        measureLines,
        measureText: (text) => ({ width: text.length * 8, height: 20 }),
        hints: composedHints,
        targetWidth: 1440,
        collapsed: [...collapsed],
      });
      expect(laid.status).toBe("laid-out");
      if (laid.status !== "laid-out") continue;
      expect(laid.legendResolved).toBe(true);
      expect(laid.linkLegend).toBeUndefined();
      const resolved = resolveScene(laid, {
        document: r7.document,
        presentation: r7.presentation,
        measureLines,
      });
      const authored = resolved.nodes.filter((n) => n.presentation?.form === "legend");
      expect(authored).toHaveLength(1);
      expect(resolved.linkLegend).toBeUndefined();
      expect(authored.length + (resolved.linkLegend ? 1 : 0)).toBeLessThanOrEqual(1);
    }

    // Frozen v1 authored legend omits data-authored-legend and keeps combined count <= 1.
    const v1Presentation = {
      ...r7.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: Object.fromEntries(
        Object.entries(r7.presentation.entities).map(([id, entry]) => {
          const { anatomy: _ignored, ...rest } = entry as { anatomy?: unknown; form: string; text: unknown };
          return [id, rest];
        }),
      ),
      relations: {},
    } as unknown as ScenePresentation;
    const v1 = renderSceneSvg({ ...r7Base, presentation: v1Presentation });
    expect(v1.scene.r7Connectors).toBe(false);
    const authoredV1 = v1.scene.nodes.filter((n) => n.presentation?.form === "legend");
    expect(authoredV1).toHaveLength(1);
    expect(v1.scene.linkLegend).toBeUndefined();
    expect(authoredV1.length + (v1.scene.linkLegend ? 1 : 0)).toBeLessThanOrEqual(1);
    expect(v1.svg).not.toContain("data-authored-legend");
  });

  it("DE3-L1a (PR #327 P2 #1): keeps enlarged overview labels clear of linkLegend and re-anchors non-free-cell legends under fitToWindow", () => {
    const { document, presentation } = multiStyleFixture();
    // Make the rightmost cross-zone relation carry a very long label so overview zoom enlargement would reach right-strip legend.
    const wideLabelDoc = {
      ...document,
      relations: {
        ...document.relations,
        "relation:r-proposed": {
          ...document.relations["relation:r-proposed"]!,
          attributes: { label: { kind: "text", value: "extremely long cross boundary edge label near right strip" } },
        },
      },
    } as unknown as SemanticDocument;

    const uncomposedInput = {
      document: wideLabelDoc,
      presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [] as ReturnType<typeof occurrenceRef>[],
    };
    const uncomposedLayout = layoutScene(uncomposedInput);
    expect(uncomposedLayout.status).toBe("laid-out");
    if (uncomposedLayout.status !== "laid-out") return;
    const uncomposedOverview = resolveScene(uncomposedLayout, uncomposedInput, {
      viewWidth: 420,
      windowHeight: 280,
      fitToWindow: true,
    });
    expect(uncomposedOverview.overviewEdgeLabelSize).toBeDefined();
    expect(uncomposedOverview.linkLegend).toBeDefined();
    for (const label of uncomposedOverview.labels) {
      expect(rectsIntersect(label.box, uncomposedOverview.linkLegend!.rect)).toBe(false);
    }

    // Composed scene with right legend and free-cell legend under fitToWindow overview zoom.
    for (const legendMode of ["right", "free-cell"] as const) {
      const hints = lowerLayoutHintsV2({
        vocabulary: "ds-layout-hints@2",
        mode: "stage-columns",
        legend: legendMode,
        grids: {
          root: {
            stage_columns: ["s1", "s2"],
            transverse_bands: [
              { id: "b1", items: [entityRef("zone")] },
              { id: "b2", items: [entityRef("ext")] },
            ],
            cells: {
              [entityRef("zone")]: { column: "s1" },
              [entityRef("ext")]: { column: "s2" },
            },
          },
        },
      });
      const composedInput = { ...uncomposedInput, hints };
      const laid = layoutScene(composedInput);
      expect(laid.status).toBe("laid-out");
      if (laid.status !== "laid-out") continue;
      const overview = resolveScene(laid, composedInput, {
        viewWidth: 420,
        windowHeight: 280,
        fitToWindow: true,
      });
      expect(overview.overviewEdgeLabelSize).toBeDefined();
      expect(overview.linkLegend).toBeDefined();
      for (const label of overview.labels) {
        expect(rectsIntersect(label.box, overview.linkLegend!.rect), `${legendMode}:${label.occurrence}`).toBe(false);
      }
      if (legendMode === "right") {
        const maxLabelRight = Math.max(...overview.labels.map((l) => l.box.x + l.box.width));
        expect(overview.linkLegend!.rect.x).toBeGreaterThanOrEqual(maxLabelRight + LINK_LEGEND_GAP - 1);
      }
    }
  });

  it("DE3-L1b: enforces compact anatomy (<= 154 px for 3 rows, rx=8) and localized labels", () => {
    expect(LINK_LEGEND_MIN_WIDTH).toBe(160);
    expect(LINK_LEGEND_PADDING).toBe(12);
    expect(LINK_LEGEND_HEADER_HEIGHT).toBe(24);
    expect(LINK_LEGEND_HEADER_GAP).toBe(6);
    expect(LINK_LEGEND_ROW_HEIGHT).toBe(24);
    expect(LINK_LEGEND_ROW_GAP).toBe(6);
    expect(LINK_LEGEND_CORNER_RADIUS).toBe(8);

    const { document, presentation } = multiStyleFixture();
    const threeStylePres = {
      ...presentation,
      relations: {
        "relation:r-default": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r-proposed": { strokeStyle: "dashed", arrowhead: "arrow" },
        "relation:r-dotted": { strokeStyle: "dotted", arrowhead: "arrow" },
        "relation:r-emphasis": { strokeStyle: "solid", arrowhead: "arrow" },
      },
    } as ScenePresentation;
    const rendered = renderSceneSvg({
      document,
      presentation: threeStylePres,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });
    const legend = rendered.scene.linkLegend!;
    expect(legend.entries).toHaveLength(3);
    expect(legend.rect.height).toBeLessThanOrEqual(154);
    expect(rendered.svg).toContain('data-scene-legend=""');
    expect(rendered.svg).toContain('rx="8"');

    // French localization preserves canonical meanings.
    expect(defaultLegendTitle("fr")).toBe("Légende");
    expect(defaultLinkStyleLabel({ strokeStyle: "solid", arrowhead: "arrow", emphasis: "default" }, "fr")).toBe("Lien");
    expect(defaultLinkStyleLabel({ strokeStyle: "dashed", arrowhead: "arrow", emphasis: "default" }, "fr")).toBe("Proposé (pointillés)");
    expect(defaultLinkStyleLabel({ strokeStyle: "dotted", arrowhead: "arrow", emphasis: "default" }, "fr")).toBe("Pointillés");
    expect(defaultLinkStyleLabel({ strokeStyle: "solid", arrowhead: "none", emphasis: "emphasis" }, "fr")).toBe("Principal · Non orienté");
    expect(defaultLegendMarkLabel("proposed", "fr")).toBe("Proposé");
    expect(defaultLegendMarkLabel("folded-zone", "fr")).toBe("Zone repliée [+]");

    const frRendered = renderSceneSvg({
      document,
      presentation: threeStylePres,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      legendTitle: "Légende",
      collapsed: [],
    });
    expect(frRendered.scene.linkLegend!.title).toBe("Légende");
    expect(frRendered.scene.linkLegend!.entries.map((e) => e.label)).toEqual([
      "Lien",
      "Proposé (pointillés)",
      "Pointillés",
    ]);
  });

  it("DE3-L1b: emits conditional proposed/[+] marks only when >= 2 link styles exist, never on 1-style scenes", () => {
    const { document, presentation } = multiStyleFixture();
    const docWithSecondOutsideLink = {
      ...document,
      entities: {
        ...document.entities,
        "entity:ext2": { id: "entity:ext2", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "External 2" } } },
      },
      relations: {
        ...document.relations,
        "relation:r-ext-dotted": {
          id: "relation:r-ext-dotted",
          profile: "generic@2",
          type: "link",
          endpoints: [{ role: "source", target: "entity:ext" }, { role: "target", target: "entity:ext2" }],
          attributes: { label: { kind: "text", value: "sync" } },
        },
      },
    } as unknown as SemanticDocument;
    const proposedAndFoldedPres = {
      ...presentation,
      entities: {
        ...presentation.entities,
        "occurrence:e.zone": { ...presentation.entities["occurrence:e.zone"], collapsed: false },
        "occurrence:e.ext": { ...presentation.entities["occurrence:e.ext"], status: "proposed" },
        "occurrence:e.ext2": { form: "card", text: { title: "External 2", body: "Peer 2" }, anatomy: "v2" },
      },
      relations: {
        ...presentation.relations,
        "relation:r-ext-dotted": { strokeStyle: "dotted", arrowhead: "arrow" },
      },
    } as unknown as ScenePresentation;

    // Multiple link styles + collapsed zone + proposed entity => includes both marks cleanly inside linkLegend height.
    const multi = renderSceneSvg({
      document: docWithSecondOutsideLink,
      presentation: proposedAndFoldedPres,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
    });
    expect(multi.scene.linkLegend).toBeDefined();
    expect(multi.scene.linkLegend!.entityMarks?.map((m) => m.kind)).toEqual(["proposed", "folded-zone"]);
    expect(multi.svg).toContain('data-legend-mark="proposed"');
    expect(multi.svg).toContain('data-legend-mark="folded-zone"');

    // Pure collector check when 1 style vs >=2 styles: marks must never trigger a legend alone.
    const marks = collectLegendEntityMarks(multi.scene.nodes, proposedAndFoldedPres, "en");
    expect(marks.map((m) => m.kind)).toEqual(["proposed", "folded-zone"]);
    const oneStylePres = {
      ...proposedAndFoldedPres,
      relations: {
        "relation:r-solid": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r-proposed": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r-dotted": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r-ext-dotted": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r-emphasis": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r-default": { strokeStyle: "solid", arrowhead: "arrow" },
      },
    } as unknown as ScenePresentation;
    const single = renderSceneSvg({
      document: docWithSecondOutsideLink,
      presentation: oneStylePres,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [occurrenceRef("e.zone")],
    });
    expect(single.scene.linkLegend).toBeUndefined();
    expect(single.svg).not.toContain("data-scene-legend");
  });

  it("DE3-L1b: auto anchor selects a >= 24 px clear interior pocket on uncomposed r7 scenes and falls back to right otherwise", () => {
    const doc = {
      documentId: "document:r7-pocket-probe",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:top-a": { id: "entity:top-a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Top A" } } },
        "entity:bot-a": { id: "entity:bot-a", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Bot A" } } },
        "entity:bot-b": { id: "entity:bot-b", profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Bot B" } } },
      },
      relations: {
        "relation:r1": { id: "relation:r1", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:top-a" }, { role: "target", target: "entity:bot-a" }], attributes: {} },
        "relation:r2": { id: "relation:r2", profile: "generic@2", type: "link", endpoints: [{ role: "source", target: "entity:bot-a" }, { role: "target", target: "entity:bot-b" }], attributes: {} },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SemanticDocument;
    const pres = {
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      entities: {
        "occurrence:e.top-a": { form: "card", anatomy: "v2", text: { title: "Top Left" } },
        "occurrence:e.bot-a": { form: "card", anatomy: "v2", text: { title: "Bottom Left" } },
        "occurrence:e.bot-b": { form: "card", anatomy: "v2", text: { title: "Bottom Right" } },
      },
      relations: {
        "relation:r1": { strokeStyle: "solid", arrowhead: "arrow" },
        "relation:r2": { strokeStyle: "dashed", arrowhead: "arrow" },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;

    const autoLegend = buildSceneLinkLegend({
      edges: [
        { points: [{ x: 100, y: 120 }, { x: 100, y: 300 }], strokeStyle: "solid", arrowhead: "arrow", emphasis: "default" },
        { points: [{ x: 200, y: 350 }, { x: 700, y: 350 }], strokeStyle: "dashed", arrowhead: "arrow", emphasis: "default" },
      ],
      nodes: [
        { x: 0, y: 0, width: 220, height: 120 },
        { x: 0, y: 300, width: 220, height: 120 },
        { x: 700, y: 300, width: 220, height: 120 },
      ],
      labelBoxes: [],
      contentBounds: { x: 0, y: 0, width: 920, height: 420 },
      measureLines,
      anchor: "auto",
    });
    expect(autoLegend).toBeDefined();
    expect(autoLegend!.anchor).toBe("pocket");
    expect(autoLegend!.rect.x).toBeGreaterThanOrEqual(0);
    expect(autoLegend!.rect.x + autoLegend!.rect.width).toBeLessThanOrEqual(920);
    expect(autoLegend!.rect.y).toBeGreaterThanOrEqual(0);
    expect(autoLegend!.rect.y + autoLegend!.rect.height).toBeLessThanOrEqual(420);
    // >= 24 px clear of top-left node (right=220) and bottom-right node (top=300)
    expect(autoLegend!.rect.x).toBeGreaterThanOrEqual(220 + 24 - 0.1);
    expect(autoLegend!.rect.y + autoLegend!.rect.height).toBeLessThanOrEqual(300 - 24 + 0.1);

    // When contentBounds is tight around a single filled strip, auto falls back to right.
    const laid = layoutScene({
      document: doc,
      presentation: pres,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      legend: "auto",
      collapsed: [],
    });
    expect(laid.status).toBe("laid-out");
    if (laid.status === "laid-out") {
      const resolved = resolveScene(laid, { document: doc, presentation: pres, measureLines, legend: "auto" });
      expect(resolved.linkLegend).toBeDefined();
      expect(["pocket", "right"]).toContain(resolved.linkLegend!.anchor);
    }
  });

  it("D2D M1 feedback: paints r7 legend-key swatches, combines link styles into authored legend, and omits fold button", () => {
    expect(resolveLegendKeySwatch("accent.primary", "brand").fill).toContain("var(--");
    expect(resolveLegendKeySwatch("st-semantic-data-category3", "ext").fill).toContain("var(--st-semantic-data-category3");

    const r7 = r7AuthoredLegendFixture(false);
    const rendered = renderSceneSvg({
      document: r7.document,
      presentation: r7.presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });

    const authoredZone = rendered.scene.nodes.find((n) => n.presentation?.form === "legend");
    expect(authoredZone).toBeDefined();
    expect(authoredZone!.combinedLegend).toBeDefined();
    expect(authoredZone!.combinedLegend!.entries.length).toBeGreaterThanOrEqual(2);

    const keyNodes = rendered.scene.nodes.filter((n) => n.kind === "legend-key");
    expect(keyNodes.length).toBeGreaterThanOrEqual(2);
    for (const keyNode of keyNodes) {
      expect(keyNode.swatch).toBeDefined();
    }

    // SVG paints swatches, combined link-style entries inside the single authored legend, and NO fold toggle inside legend.
    expect(rendered.svg).toContain('data-legend-key-swatch=""');
    expect(rendered.svg).toContain('data-legend-style=');
    expect(rendered.svg).not.toContain('data-scene-legend');
    const legendMatch = /<g data-authored-legend=""[\s\S]*?(?=<\/svg>)/.exec(rendered.svg)?.[0] ?? "";
    expect(legendMatch).not.toContain("Collapse");
    expect(legendMatch).not.toContain("Expand");

    // Empty presentation.text on an r7 legend-key falls back to semantic entity name.
    const fallbackPres = {
      ...r7.presentation,
      entities: {
        ...r7.presentation.entities,
        "occurrence:e.key-core": {
          ...(r7.presentation.entities["occurrence:e.key-core"] as unknown as Record<string, unknown>),
          text: {},
        },
      },
    } as unknown as ScenePresentation;
    const fallbackRendered = renderSceneSvg({
      document: r7.document,
      presentation: fallbackPres,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });
    const fallbackKey = fallbackRendered.scene.nodes.find((n) => n.occurrence === occurrenceRef("e.key-core"));
    expect(fallbackKey?.text).toBe("Core Services");

    // Frozen v1 authored legend never paints swatches or combined link styles.
    const v1Presentation = {
      ...r7.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: Object.fromEntries(
        Object.entries(r7.presentation.entities).map(([id, entry]) => {
          const { anatomy: _ignored, ...rest } = entry as { anatomy?: unknown; form: string; text: unknown };
          return [id, rest];
        }),
      ),
      relations: {},
    } as unknown as ScenePresentation;
    const v1 = renderSceneSvg({
      document: r7.document,
      presentation: v1Presentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines,
      collapsed: [],
    });
    expect(v1.svg).not.toContain("data-legend-key-swatch");
    expect(v1.svg).not.toContain("data-legend-style");
  });
});
