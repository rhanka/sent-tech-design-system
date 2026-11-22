import { describe, expect, it } from "vitest";

import {
  buildSceneLinkLegend,
  linkStyleKey,
  measureSceneLinkLegend,
} from "../../../src/index.js";
import { layoutScene, resolveScene } from "../../../src/presentation/diagramSceneModel.js";
import { buildExampleA } from "./fixtures/referenceSet.js";

describe("H2.2 legend measurement in layout", () => {
  it("matches buildSceneLinkLegend / resolveScene dimensions for default and custom titles and labels", () => {
    const example = buildExampleA();
    const dashedKey = linkStyleKey({ strokeStyle: "dashed", arrowhead: "arrow", emphasis: "default" });
    const emphasisKey = linkStyleKey({ strokeStyle: "solid", arrowhead: "arrow", emphasis: "emphasis" });
    const cases = [
      { name: "defaults", legendTitle: undefined, legendLabels: undefined, legend: "right" as const },
      { name: "custom title", legendTitle: "Architecture Connector Styles Legend", legendLabels: undefined, legend: "right" as const },
      {
        name: "custom labels and bottom anchor",
        legendTitle: "Links",
        legendLabels: { [dashedKey]: "Governance Policy Edge", [emphasisKey]: "Primary Execution Bus" },
        legend: "bottom" as const,
      },
    ];

    for (const testCase of cases) {
      // Uncomposed baseline: resolveScene calls buildSceneLinkLegend directly.
      const uncomposedInput = {
        document: example.document,
        presentation: example.presentation,
        registry: example.registry,
        bindings: example.bindings,
        measureLines: example.measureLines,
        collapsed: [],
        legend: testCase.legend,
        ...(testCase.legendTitle === undefined ? {} : { legendTitle: testCase.legendTitle }),
        ...(testCase.legendLabels === undefined ? {} : { legendLabels: testCase.legendLabels }),
      };
      const uncomposedLayout = layoutScene(uncomposedInput);
      expect(uncomposedLayout.status, testCase.name).toBe("laid-out");
      if (uncomposedLayout.status !== "laid-out") continue;
      expect(uncomposedLayout.linkLegend).toBeUndefined();
      const uncomposedScene = resolveScene(uncomposedLayout, uncomposedInput);
      expect(uncomposedScene.linkLegend, testCase.name).toBeDefined();

      // Composed call: layoutScene forwards legend inputs and layoutMeasured measures the legend.
      const composedHints = {
        ...example.hints,
        composition: { ...example.hints.composition!, legend: "host" as const },
      };
      const composedInput = { ...uncomposedInput, hints: composedHints };
      const composedLayout = layoutScene(composedInput);
      expect(composedLayout.status, testCase.name).toBe("laid-out");
      if (composedLayout.status !== "laid-out") continue;
      expect(composedLayout.legendResolved, testCase.name).toBe(true);
      expect(composedLayout.linkLegend, testCase.name).toBeDefined();

      // Size measured in layout equals the size resolveScene computes today.
      expect(composedLayout.linkLegend!.rect.width, testCase.name).toBe(uncomposedScene.linkLegend!.rect.width);
      expect(composedLayout.linkLegend!.rect.height, testCase.name).toBe(uncomposedScene.linkLegend!.rect.height);
      expect(composedLayout.linkLegend!.entries, testCase.name).toEqual(uncomposedScene.linkLegend!.entries);

      // Pure measureSceneLinkLegend agrees with buildSceneLinkLegend.
      const pure = measureSceneLinkLegend({
        edges: uncomposedScene.edges,
        measureLines: example.measureLines,
        ...(testCase.legendTitle === undefined ? {} : { title: testCase.legendTitle }),
        ...(testCase.legendLabels === undefined ? {} : { labels: testCase.legendLabels }),
      });
      const built = buildSceneLinkLegend({
        edges: uncomposedScene.edges,
        contentBounds: { x: 0, y: 0, width: 1000, height: 600 },
        measureLines: example.measureLines,
        anchor: testCase.legend,
        ...(testCase.legendTitle === undefined ? {} : { title: testCase.legendTitle }),
        ...(testCase.legendLabels === undefined ? {} : { labels: testCase.legendLabels }),
      });
      expect(pure?.width, testCase.name).toBe(built?.rect.width);
      expect(pure?.height, testCase.name).toBe(built?.rect.height);

      // resolveScene reuses the layout-measured legend rect on composed scenes.
      const composedScene = resolveScene(composedLayout, composedInput);
      expect(composedScene.linkLegend, testCase.name).toEqual(composedLayout.linkLegend);
    }
  });

  it("suppresses the legend in resolveScene when composition.legend is none", () => {
    const example = buildExampleA();
    const noneHints = {
      ...example.hints,
      composition: { ...example.hints.composition!, legend: "none" as const },
    };
    const input = {
      document: example.document,
      presentation: example.presentation,
      registry: example.registry,
      bindings: example.bindings,
      measureLines: example.measureLines,
      collapsed: [],
      hints: noneHints,
    };
    const layout = layoutScene(input);
    expect(layout.status).toBe("laid-out");
    if (layout.status !== "laid-out") return;
    expect(layout.legendResolved).toBe(true);
    expect(layout.linkLegend).toBeUndefined();
    const scene = resolveScene(layout, input);
    expect(scene.linkLegend).toBeUndefined();
  });
});
