import { entityRef, lowerLayoutHintsV2, occurrenceRef, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutMeasured, validateHints, type HintScope } from "../../../src/index.js";
import {
  buildAll13ReferenceScenes,
  buildAppctxArchitecture16x9,
  buildExampleA,
  buildFigkitTwins,
  enumerateVisibleFoldStates,
} from "./fixtures/referenceSet.js";

describe("H2.2 engine-side validation of ds-layout-hints@2", () => {
  it("validates all 13 §2.1 payloads and appctx-architecture with zero refusals", () => {
    const scenes = [...buildAll13ReferenceScenes(), buildAppctxArchitecture16x9()];
    expect(scenes).toHaveLength(14);
    for (const scene of scenes) {
      const parentOf = new Map<typeof scene.containers[number], typeof scene.containers[number] | undefined>();
      for (const id of Object.keys(scene.document.entities)) {
        parentOf.set(id as typeof scene.containers[number], undefined);
      }
      for (const relation of Object.values(scene.document.relations)) {
        if (relation.type !== "contains") continue;
        const parent = relation.endpoints.find((e) => e.role === "parent")?.target;
        const child = relation.endpoints.find((e) => e.role === "child")?.target;
        if (parent !== undefined && child !== undefined) {
          parentOf.set(child as typeof scene.containers[number], parent as typeof scene.containers[number]);
        }
      }
      const roots = new Set([...parentOf.entries()].filter(([, parent]) => parent === undefined).map(([id]) => id));
      const scope: HintScope = {
        roots,
        parentOf,
        containers: new Set(scene.containers),
      };
      expect(validateHints(scene.hints, scope), scene.id).toEqual([]);
    }
  });

  it("enumerates the 6 figkit generic twins to the exact 38 visible fold states", () => {
    const twins = buildFigkitTwins();
    const counts = twins.map((scene) => ({
      id: scene.id,
      states: enumerateVisibleFoldStates(scene.document, scene.containers).length,
    }));
    expect(counts).toEqual([
      { id: "archi-metier", states: 2 },
      { id: "archi-applicative", states: 2 },
      { id: "archi-technologique", states: 2 },
      { id: "retro-a", states: 6 },
      { id: "retro-b", states: 8 },
      { id: "retro-c", states: 18 },
    ]);
    expect(counts.reduce((sum, entry) => sum + entry.states, 0)).toBe(38);
  });

  it("refuses every engine-side contract violation with layout-hint-invalid", () => {
    const example = buildExampleA();
    const run = (hintsV2: DsLayoutHintsV2, collapsed: readonly ReturnType<typeof occurrenceRef>[] = []) =>
      layoutMeasured(example.document, {
        registry: example.registry,
        bindings: example.bindings,
        presentation: example.presentation,
        measureLines: example.measureLines,
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 1440,
        collapsed,
        hints: lowerLayoutHintsV2(hintsV2),
      });

    const baseHints = example.hintsV2 as Extract<DsLayoutHintsV2, { mode: "stage-columns" }>;
    const baseGrids = baseHints.grids;

    // 1. Unknown grid scope
    const unknownScope = run({
      ...baseHints,
      grids: {
        ...baseGrids,
        [entityRef("ghost")]: { transverse_bands: [{ id: "b1", items: [entityRef("tool-1")] }] },
      },
    });
    expect(unknownScope.status).toBe("refused");
    if (unknownScope.status === "refused") {
      expect(unknownScope.refusals.some((r) => r.code === "layout-hint-invalid" && r.path === "hints.composition.grids.entity:ghost")).toBe(true);
    }

    // 2. Non-container grid scope (p1 is a leaf card)
    const leafScope = run({
      ...baseHints,
      grids: {
        ...baseGrids,
        [entityRef("p1")]: { transverse_bands: [{ id: "b1", items: [entityRef("tool-1")] }] },
      },
    });
    expect(leafScope.status).toBe("refused");
    if (leafScope.status === "refused") {
      expect(leafScope.refusals.some((r) => r.code === "layout-hint-invalid" && r.path === "hints.composition.grids.entity:p1")).toBe(true);
    }

    // 3. Band item with wrong placement parent (tool-1 belongs to tools, not root)
    const wrongParentBand = run({
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          transverse_bands: [{ id: "top", items: [entityRef("tool-1")] }],
        },
      },
    });
    expect(wrongParentBand.status).toBe("refused");
    if (wrongParentBand.status === "refused") {
      expect(wrongParentBand.refusals.some((r) => r.code === "layout-hint-invalid" && r.refs?.includes(entityRef("tool-1")))).toBe(true);
    }

    // 4. Peripheral item with unknown ref
    const unknownPeripheral = run({
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          transverse_bands: [{ id: "top", items: [entityRef("p1")] }],
          peripheral_columns: [{ id: "side", side: "start", items: [entityRef("missing")] }],
        },
      },
    });
    expect(unknownPeripheral.status).toBe("refused");
    if (unknownPeripheral.status === "refused") {
      expect(unknownPeripheral.refusals.some((r) => r.code === "layout-hint-invalid" && r.refs?.includes(entityRef("missing")))).toBe(true);
    }

    // 5. Stack key is not a container
    const leafStack = run({
      ...baseHints,
      stacks: { [entityRef("p1")]: { axis: "column" } },
    });
    expect(leafStack.status).toBe("refused");
    if (leafStack.status === "refused") {
      expect(leafStack.refusals.some((r) => r.code === "layout-hint-invalid" && r.path === "hints.composition.stacks.entity:p1")).toBe(true);
    }

    // 6. Unknown stack key
    const unknownStack = run({
      ...baseHints,
      stacks: { [entityRef("nope")]: { axis: "row" } },
    });
    expect(unknownStack.status).toBe("refused");
    if (unknownStack.status === "refused") {
      expect(unknownStack.refusals.some((r) => r.code === "layout-hint-invalid" && r.path === "hints.composition.stacks.entity:nope")).toBe(true);
    }

    // 7. Stretch on a leaf (justify and align)
    for (const axisKey of ["justify", "align"] as const) {
      const stretchedLeaf = run({
        vocabulary: "ds-layout-hints@2",
        mode: "stage-columns",
        grids: {
          root: {
            stage_columns: ["s1"],
            transverse_bands: [{ id: "top", items: [entityRef("p1")] }],
            cells: { [entityRef("p1")]: { column: "s1", [axisKey]: "stretch" } },
          },
        },
      });
      expect(stretchedLeaf.status).toBe("refused");
      if (stretchedLeaf.status === "refused") {
        expect(stretchedLeaf.refusals.some((r) => r.code === "layout-hint-invalid" && r.path === "hints.composition.grids.root.cells.entity:p1")).toBe(true);
      }
    }

    // 8. Stretch on a container (even folded in the current state) is accepted
    const stretchedFoldedContainer = run(
      {
        vocabulary: "ds-layout-hints@2",
        mode: "stage-columns",
        grids: {
          root: {
            stage_columns: ["s1"],
            transverse_bands: [{ id: "top", items: [entityRef("tools")] }],
            cells: { [entityRef("tools")]: { column: "s1", justify: "stretch", align: "stretch" } },
          },
        },
      },
      [occurrenceRef("e.tools")],
    );
    expect(stretchedFoldedContainer.status).toBe("laid-out");
  });
});
