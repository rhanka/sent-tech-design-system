import { readFileSync } from "node:fs";
import { DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } from "@sentropic/diagram-core";
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
});
