import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_EDGE_CORNER_RADIUS,
  DEFAULT_EDGE_LABEL_SIZE,
  DEFAULT_LINK_EMPHASIS_STROKE_WIDTH,
  DEFAULT_LINK_PRIMARY_STROKE_WIDTH,
  DEFAULT_LINK_RELATED_STROKE_WIDTH,
  DEFAULT_LINK_STROKE_WIDTH,
} from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { layoutScene, resolveScene } from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));

describe("DE-2 link tokens, emphasis token and edge-label size", () => {
  it("exports dedicated link stroke widths, emphasis width, corner radius and label size defaults", () => {
    expect(DEFAULT_LINK_STROKE_WIDTH).toBe(2.5);
    expect(DEFAULT_LINK_RELATED_STROKE_WIDTH).toBe(3);
    expect(DEFAULT_LINK_PRIMARY_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_LINK_EMPHASIS_STROKE_WIDTH).toBe(3.5);
    expect(DEFAULT_EDGE_CORNER_RADIUS).toBe(12);
    expect(DEFAULT_EDGE_LABEL_SIZE).toBe(18);
  });

  it("paints connectors with linkStrokeWidth (not zone borderWidth) and edgeLabelSize in renderSceneSvg", () => {
    const fixture = nestedZoneFixture({ outside: true });
    const base = renderSceneSvg({ ...fixture, measureLines, collapsed: [] });
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

  it("recomputes footer connector cutouts and label clearance from linkStrokeWidth", () => {
    const fixture = nestedZoneFixture({ outside: true });
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

  it("decouples Svelte and Vue edge CSS from diagramZone.borderWidth and wires emphasis + edgeLabelSize tokens", () => {
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
      const edgeBlock = /\.st-diagramSceneFigure-edge\s*\{[^}]*\}/.exec(source)?.[0] ?? "";
      expect(edgeBlock, `${name} .st-diagramSceneFigure-edge`).toContain("--st-component-diagramScene-linkStrokeWidth");
      expect(edgeBlock, `${name} .st-diagramSceneFigure-edge must not use zone borderWidth`).not.toContain(
        "diagramZone-borderWidth",
      );
      expect(source, `${name} emphasis rule`).toContain("--st-component-diagramScene-linkEmphasisStroke");
      expect(source, `${name} emphasis width`).toContain("--st-component-diagramScene-linkEmphasisStrokeWidth");
      expect(source, `${name} edgeLabelSize`).toContain("--st-component-diagramScene-edgeLabelSize");
    }
  });
});
