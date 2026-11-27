import { entityRef, lowerLayoutHintsV2, occurrenceRef, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutMeasured } from "../../../src/index.js";
import { buildExampleA, buildGenericScene } from "./fixtures/referenceSet.js";

describe("H2.3 peripheral columns", () => {
  it("stretches a shorter peripheral expanded container down to the last band bottom", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [
            { id: "b1", items: [entityRef("a1")] },
            { id: "b2", items: [entityRef("a2")] },
            { id: "b3", items: [entityRef("a3")] },
          ],
          peripheral_columns: [
            { id: "side", side: "end", items: [entityRef("panel")], from_band: "b2" },
          ],
          cells: {
            [entityRef("a1")]: { column: "s1" },
            [entityRef("a2")]: { column: "s1" },
            [entityRef("a3")]: { column: "s1" },
          },
        },
      },
      stacks: { [entityRef("panel")]: { axis: "column" } },
    };
    const scene = buildGenericScene({
      id: "peripheral-short",
      carries: ["H2.3"],
      hintsV2,
      entities: [
        { id: "a1", title: "Band 1" },
        { id: "a2", title: "Band 2" },
        { id: "a3", title: "Band 3" },
        { id: "panel", container: true, title: "Side Panel" },
        { id: "p-only", parent: "panel", title: "Single Item" },
      ],
      relations: [],
    });
    const res = layoutMeasured(scene.document, {
      registry: scene.registry,
      bindings: scene.bindings,
      presentation: scene.presentation,
      measureLines: scene.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: scene.hints,
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;
    const a1 = res.view.entityOccurrences[occurrenceRef("e.a1")]!.geometry;
    const a2 = res.view.entityOccurrences[occurrenceRef("e.a2")]!.geometry;
    const a3 = res.view.entityOccurrences[occurrenceRef("e.a3")]!.geometry;
    const panel = res.view.entityOccurrences[occurrenceRef("e.panel")]!.geometry;
    const pOnly = res.view.entityOccurrences[occurrenceRef("e.p-only")]!.geometry;
    // V-S2 / T-30 (DE3-L6b): cell (b1, side) is free so panel's header shifts up and p-only aligns flush with a2.y,
    // while keeping panel bottom stretched down to b3 bottom.
    expect(pOnly.y).toBe(a2.y);
    expect(panel.y).toBeLessThan(a2.y);
    expect(panel.y).toBeGreaterThanOrEqual(a1.y);
    expect(panel.y + panel.height).toBe(a3.y + a3.height);
    // Placed on the end (right) side after s1
    expect(panel.x).toBeGreaterThan(a2.x + a2.width);
  });

  it("lets a taller peripheral column extend below the bands without growing band heights (Example A, T-28/T-29)", () => {
    const example = buildExampleA();
    const res = layoutMeasured(example.document, {
      registry: example.registry,
      bindings: example.bindings,
      presentation: example.presentation,
      measureLines: example.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: example.hints,
    });
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;
    const root = res.composition!.grids["root"]!;
    const midBand = root.bands.find((b) => b.id === "mid")!;
    const lowBand = root.bands.find((b) => b.id === "low")!;
    const tools = res.view.entityOccurrences[occurrenceRef("e.tools")]!.geometry;
    const j1 = res.view.entityOccurrences[occurrenceRef("e.j1")]!.geometry;

    // Start side: tools sits to the left of stage s1
    expect(tools.x + tools.width).toBeLessThan(j1.x);
    // Starts at mid band top
    expect(tools.y).toBe(midBand.start);
    // Extends below low band bottom without inflating lowBand.size
    expect(tools.y + tools.height).toBeGreaterThan(lowBand.start + lowBand.size);
    expect(lowBand.size).toBe(154);

    // Its 4 children stay stacked in one vertical column inside tools
    const toolCards = ["tool-1", "tool-2", "tool-3", "tool-4"].map(
      (id) => res.view.entityOccurrences[occurrenceRef(`e.${id}`)]!.geometry,
    );
    expect(new Set(toolCards.map((r) => r.x)).size).toBe(1);
    for (let i = 1; i < toolCards.length; i += 1) {
      expect(toolCards[i]!.y).toBeGreaterThan(toolCards[i - 1]!.y + toolCards[i - 1]!.height);
    }

    // V-S2 / T-30: when (top, tools) is free (legend: "right"), tools shifts up into empty cell so tool-1 aligns flush with j1.
    if (example.hintsV2.mode !== "stage-columns") throw new Error("expected stage-columns hints on Example A");
    const freeCellAbove = layoutMeasured(example.document, {
      registry: example.registry,
      bindings: example.bindings,
      presentation: example.presentation,
      measureLines: example.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: lowerLayoutHintsV2({ ...example.hintsV2, legend: "right" }),
    });
    expect(freeCellAbove.status).toBe("laid-out");
    if (freeCellAbove.status === "laid-out") {
      const midBandFree = freeCellAbove.composition!.grids["root"]!.bands.find((b) => b.id === "mid")!;
      const toolsFree = freeCellAbove.view.entityOccurrences[occurrenceRef("e.tools")]!.geometry;
      const tool1Free = freeCellAbove.view.entityOccurrences[occurrenceRef("e.tool-1")]!.geometry;
      const j1Free = freeCellAbove.view.entityOccurrences[occurrenceRef("e.j1")]!.geometry;
      expect(toolsFree.y).toBeLessThan(midBandFree.start);
      expect(toolsFree.y).toBeGreaterThanOrEqual(0);
      expect(tool1Free.y).toBe(j1Free.y);
    }
  });
});
