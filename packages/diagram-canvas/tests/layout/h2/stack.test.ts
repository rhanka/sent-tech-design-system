import { entityRef, occurrenceRef, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutMeasured } from "../../../src/index.js";
import { buildGenericScene } from "./fixtures/referenceSet.js";

describe("H2.3 single-line stacks", () => {
  for (const count of [2, 4, 8, 12]) {
    it(`keeps a column stack of ${String(count)} children on one vertical line without wrapping`, () => {
      const children = Array.from({ length: count }, (_, i) => ({
        id: `c-${String(i + 1).padStart(2, "0")}`,
        parent: "stack",
        title: `Item ${String(i + 1)}`,
      }));
      const hintsV2: DsLayoutHintsV2 = {
        vocabulary: "ds-layout-hints@2",
        mode: "stage-columns",
        grids: {
          root: {
            transverse_bands: [{ id: "main", items: [entityRef("stack")] }],
          },
        },
        stacks: {
          [entityRef("stack")]: { axis: "column" },
        },
      };
      const scene = buildGenericScene({
        id: `stack-col-${String(count)}`,
        carries: ["H2.3"],
        hintsV2,
        entities: [{ id: "stack", container: true, title: "Column Stack" }, ...children],
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
      const rects = children.map((c) => res.view.entityOccurrences[occurrenceRef(`e.${c.id}`)]!.geometry);
      const xs = new Set(rects.map((r) => r.x));
      expect(xs.size).toBe(1);
      for (let i = 1; i < rects.length; i += 1) {
        expect(rects[i]!.y - (rects[i - 1]!.y + rects[i - 1]!.height)).toBe(72);
      }
    });
  }

  it("keeps a row stack on one horizontal line and honours ordering and cross-axis align", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      ordering: {
        [entityRef("stack")]: [entityRef("z3"), entityRef("z1"), entityRef("z2")],
      },
      grids: {
        root: {
          transverse_bands: [{ id: "main", items: [entityRef("stack")] }],
        },
      },
      stacks: {
        [entityRef("stack")]: { axis: "row", align: "center" },
      },
    };
    const scene = buildGenericScene({
      id: "stack-row",
      carries: ["H2.3"],
      hintsV2,
      entities: [
        { id: "stack", container: true, title: "Row Stack" },
        { id: "z1", title: "Card One" },
        { id: "z2", title: "Card Two" },
        { id: "z3", container: true, parent: "stack", title: "Tall Zone" },
        { id: "inner-a", parent: "z3", title: "Inner A" },
        { id: "inner-b", parent: "z3", title: "Inner B" },
      ].map((e) => (e.id === "z1" || e.id === "z2" ? { ...e, parent: "stack" } : e)),
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
    const z3 = res.view.entityOccurrences[occurrenceRef("e.z3")]!.geometry;
    const z1 = res.view.entityOccurrences[occurrenceRef("e.z1")]!.geometry;
    const z2 = res.view.entityOccurrences[occurrenceRef("e.z2")]!.geometry;
    expect(z3.x).toBeLessThan(z1.x);
    expect(z1.x).toBeLessThan(z2.x);
    // Cross-axis center alignment: z1 & z2 vertically centred against tall zone z3
    expect(z1.y + z1.height / 2).toBeCloseTo(z3.y + z3.height / 2, 6);
    expect(z2.y + z2.height / 2).toBeCloseTo(z3.y + z3.height / 2, 6);
  });
});
