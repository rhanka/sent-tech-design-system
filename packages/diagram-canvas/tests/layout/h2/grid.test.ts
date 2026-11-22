import { canonicalise, entityRef, occurrenceRef, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { distributeWholeExcess, layoutMeasured } from "../../../src/index.js";
import {
  buildAll13ReferenceScenes,
  buildExampleA,
  buildGenericScene,
  type H2ReferenceScene,
} from "./fixtures/referenceSet.js";

function lay(scene: H2ReferenceScene, collapsed: readonly ReturnType<typeof occurrenceRef>[] = []) {
  const result = layoutMeasured(scene.document, {
    registry: scene.registry,
    bindings: scene.bindings,
    presentation: scene.presentation,
    measureLines: scene.measureLines,
    measureText: () => ({ width: 80, height: 20 }),
    targetWidth: 1440,
    collapsed,
    hints: scene.hints,
  });
  expect(result.status, scene.id).toBe("laid-out");
  if (result.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(result.refusals)}`);
  return result;
}

describe("H2.3 grids, spans, alignment, holes and trailing band", () => {
  it("distributes spanning excess in whole world units with remainder to the last track", () => {
    const widths = [100, 100, 100];
    distributeWholeExcess(widths, 0, 2, 10);
    expect(widths).toEqual([103, 103, 104]);
  });

  it("supports single & spanning contributions, all four alignments on both axes, and keeps holes", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "b1", items: [entityRef("wide"), entityRef("c-end")] },
            { id: "b2", items: [entityRef("c-start"), entityRef("c-center"), entityRef("zone")] },
          ],
          cells: {
            [entityRef("wide")]: { column: "s1", to_column: "s2", justify: "center", align: "start" },
            [entityRef("c-end")]: { column: "s3", justify: "end", align: "end" },
            [entityRef("c-start")]: { column: "s1", justify: "start", align: "start" },
            [entityRef("c-center")]: { column: "s2", justify: "center", align: "center" },
            [entityRef("zone")]: { column: "s3", justify: "stretch", align: "stretch" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "align-span",
      carries: ["H2.3"],
      hintsV2,
      entities: [
        { id: "wide", container: true, title: "Wide Container" },
        { id: "w1", parent: "wide", title: "Alpha" },
        { id: "w2", parent: "wide", title: "Beta" },
        { id: "w3", parent: "wide", title: "Gamma" },
        { id: "c-end", title: "End Card" },
        { id: "c-start", title: "Start Card" },
        { id: "c-center", title: "Center Card" },
        { id: "zone", container: true, title: "Stretched Zone" },
        { id: "z1", parent: "zone", title: "Child One" },
        { id: "z2", parent: "zone", title: "Child Two" },
      ],
      relations: [],
    });
    const res = lay(scene);
    const rootReport = res.composition!.grids["root"]!;
    const cellOf = (local: string) => rootReport.cells.find((c) => c.entity === entityRef(local))!;

    // Alignments inside slots
    const startCell = cellOf("c-start");
    expect(startCell.boxRect.x).toBe(startCell.slotRect.x);
    expect(startCell.boxRect.y).toBe(startCell.slotRect.y);

    const endCell = cellOf("c-end");
    expect(endCell.boxRect.x + endCell.boxRect.width).toBeCloseTo(endCell.slotRect.x + endCell.slotRect.width, 6);
    expect(endCell.boxRect.y + endCell.boxRect.height).toBeCloseTo(endCell.slotRect.y + endCell.slotRect.height, 6);

    const centerCell = cellOf("c-center");
    expect(centerCell.boxRect.x + centerCell.boxRect.width / 2).toBeCloseTo(centerCell.slotRect.x + centerCell.slotRect.width / 2, 6);
    expect(centerCell.boxRect.y + centerCell.boxRect.height / 2).toBeCloseTo(centerCell.slotRect.y + centerCell.slotRect.height / 2, 6);

    const zoneCell = cellOf("zone");
    expect(zoneCell.boxRect.width).toBe(zoneCell.slotRect.width);
    expect(zoneCell.boxRect.height).toBe(zoneCell.slotRect.height);

    // Wide container spanning s1..s2 widens s1 and s2 to cover its width
    const s1 = rootReport.columns[0]!;
    const s2 = rootReport.columns[1]!;
    const wideCell = cellOf("wide");
    expect(s1.size + 96 + s2.size).toBeGreaterThanOrEqual(wideCell.boxRect.width);

    // Folded container with stretch reads as center (fixed footprint never enlarged)
    const folded = lay(scene, [occurrenceRef("e.zone")]);
    const foldedZone = folded.composition!.grids["root"]!.cells.find((c) => c.entity === entityRef("zone"))!;
    expect(foldedZone.boxRect.width).toBeLessThanOrEqual(foldedZone.slotRect.width);
    expect(foldedZone.boxRect.x + foldedZone.boxRect.width / 2).toBeCloseTo(
      foldedZone.slotRect.x + foldedZone.slotRect.width / 2,
      6,
    );
  });

  it("collapses an uncovered stage column and merges its two surrounding gutters into one", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "empty-col", "s3"],
          transverse_bands: [{ id: "b1", items: [entityRef("a"), entityRef("b")] }],
          cells: {
            [entityRef("a")]: { column: "s1" },
            [entityRef("b")]: { column: "s3" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "collapse-col",
      carries: ["H2.3"],
      hintsV2,
      entities: [{ id: "a", title: "Left" }, { id: "b", title: "Right" }],
      relations: [],
    });
    const res = lay(scene);
    const rootReport = res.composition!.grids["root"]!;
    expect(rootReport.columns.map((c) => c.id)).toEqual(["s1", "s3"]);
    const a = res.view.entityOccurrences[occurrenceRef("e.a")]!.geometry;
    const b = res.view.entityOccurrences[occurrenceRef("e.b")]!.geometry;
    // Merged into a single 96px card gap (not 2 * 96 = 192)
    expect(b.x - (a.x + a.width)).toBe(96);
  });

  it("I-13 span-only empty band: takes split excess height when positive, and stays non-collapsed with distinct gutters when excess is zero (Review P2)", () => {
    // Case 1: positive excess — tall container spanning r2..r3 with r3 empty (items: [])
    const positiveHints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "r1", items: [entityRef("top")] },
            { id: "r2", items: [entityRef("spanner")] },
            { id: "r3", items: [] },
            { id: "r4", items: [entityRef("bottom")] },
          ],
          cells: {
            [entityRef("top")]: { column: "s1" },
            [entityRef("spanner")]: { column: "s1", to_band: "r3" },
            [entityRef("bottom")]: { column: "s1" },
          },
        },
      },
    };
    const positiveScene = buildGenericScene({
      id: "i13-positive",
      carries: ["I-13"],
      hintsV2: positiveHints,
      entities: [
        { id: "top", title: "Top" },
        { id: "spanner", title: "Spanning Card" },
        { id: "bottom", title: "Bottom" },
      ],
      relations: [],
    });
    const posRes = lay(positiveScene);
    const posBands = posRes.composition!.grids["root"]!.bands;
    expect(posBands.map((b) => b.id)).toEqual(["r1", "r2", "r3", "r4"]);
    const posR2 = posBands.find((b) => b.id === "r2")!;
    const posR3 = posBands.find((b) => b.id === "r3")!;
    // Card height 154 vs 72 gutter -> excess 82 split 41 / 41 across r2 and r3
    expect(posR2.size).toBe(41);
    expect(posR3.size).toBe(41);
    expect(posR3.start - (posR2.start + posR2.size)).toBe(72);

    // Case 2 (Review P2): zero excess — r2 already has a single-span card so the card spanning r2..r3 fits in r2 + gutter
    const zeroExcessHints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "r1", items: [entityRef("top")] },
            { id: "r2", items: [entityRef("spanner"), entityRef("anchor")] },
            { id: "r3", items: [] },
            { id: "r4", items: [entityRef("bottom")] },
          ],
          cells: {
            [entityRef("top")]: { column: "s1" },
            [entityRef("spanner")]: { column: "s1", to_band: "r3" },
            [entityRef("anchor")]: { column: "s2" },
            [entityRef("bottom")]: { column: "s1" },
          },
        },
      },
    };
    const zeroScene = buildGenericScene({
      id: "i13-zero-excess",
      carries: ["I-13"],
      hintsV2: zeroExcessHints,
      entities: [
        { id: "top", title: "Top" },
        { id: "spanner", title: "Spanning Card" },
        { id: "anchor", title: "Band 2 Anchor" },
        { id: "bottom", title: "Bottom" },
      ],
      relations: [],
    });
    const zeroRes = lay(zeroScene);
    const zeroBands = zeroRes.composition!.grids["root"]!.bands;
    // r3 does NOT collapse: remains in bands list with height 0, and BOTH boundary gutters r2|r3 and r3|r4 exist!
    expect(zeroBands.map((b) => b.id)).toEqual(["r1", "r2", "r3", "r4"]);
    const zR2 = zeroBands.find((b) => b.id === "r2")!;
    const zR3 = zeroBands.find((b) => b.id === "r3")!;
    const zR4 = zeroBands.find((b) => b.id === "r4")!;
    expect(zR2.size).toBe(154);
    expect(zR3.size).toBe(0);
    expect(zR3.start).toBe(zR2.start + zR2.size + 72);
    expect(zR4.start).toBe(zR3.start + zR3.size + 72);
    // Distinct emitted gutters for r2|r3 (interrupted on s1 by spanner, usable on s2) and r3|r4 (usable on both s1 and s2)
    const g23 = zeroRes.channels!.find((c) => c.id === "root|across|r2")!;
    const g34 = zeroRes.channels!.find((c) => c.id === "root|across|r3")!;
    expect(g23).toBeDefined();
    expect(g34).toBeDefined();
    expect(g23.gap).toBe(72);
    expect(g34.gap).toBe(72);
    expect(g23.strips).toHaveLength(1); // s1 crossed by spanner, s2 free
    expect(g34.strips).toHaveLength(1); // neither s1 nor s2 crossed -> spans full s1..s2 width
    expect(g34.strips[0]!.width).toBeGreaterThan(g23.strips[0]!.width);
  });

  it("places omitted visible children in a trailing band with composition-unplaced info warning", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [{ id: "top", items: [entityRef("a")] }],
          cells: { [entityRef("a")]: { column: "s1" } },
        },
      },
    };
    const scene = buildGenericScene({
      id: "trailing-band",
      carries: ["H2.3"],
      hintsV2,
      entities: [
        { id: "a", title: "Placed" },
        { id: "extra-1", title: "Extra One" },
        { id: "extra-2", title: "Extra Two" },
      ],
      relations: [],
    });
    const res = lay(scene);
    const warnings = res.warnings.filter((w) => w.code === "composition-unplaced");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.severity).toBe("info");
    expect(warnings[0]?.refs).toEqual([occurrenceRef("e.extra-1"), occurrenceRef("e.extra-2")]);
    const a = res.view.entityOccurrences[occurrenceRef("e.a")]!.geometry;
    const e1 = res.view.entityOccurrences[occurrenceRef("e.extra-1")]!.geometry;
    const e2 = res.view.entityOccurrences[occurrenceRef("e.extra-2")]!.geometry;
    expect(e1.y).toBe(a.y + a.height + 72);
    expect(e2.y).toBe(e1.y);
    expect(e2.x).toBe(e1.x + e1.width + 96);
  });

  it("is deterministic under shuffled object key order", () => {
    const example = buildExampleA();
    const r1 = lay(example);
    const reversedCells = Object.fromEntries(
      Object.entries(example.hints.composition!.grids.root.cells ?? {}).reverse(),
    );
    const shuffledScene: H2ReferenceScene = {
      ...example,
      hints: {
        ...example.hints,
        composition: {
          ...example.hints.composition!,
          grids: {
            ...example.hints.composition!.grids,
            root: {
              ...example.hints.composition!.grids.root,
              cells: reversedCells,
            },
          },
        },
      },
    };
    const r2 = lay(shuffledScene);
    expect(canonicalise(r2.view, "view")).toBe(canonicalise(r1.view, "view"));
  });

  it("lays out Example A and all §2.1 payloads without inherit with 0 refusals and 0 hard warnings", () => {
    const nonInheritIds = new Set(["schema-13", "schema-1", "schema-6", "ref-2", "ref-3", "archi-metier", "retro-a"]);
    const scenes = buildAll13ReferenceScenes().filter((s) => nonInheritIds.has(s.id));
    expect(scenes).toHaveLength(7);
    for (const scene of scenes) {
      const res = lay(scene);
      const hardWarnings = res.warnings.filter((w) => w.severity !== "info" && w.code !== "label-unplaced" && w.code !== "route-obstructed");
      expect(hardWarnings, scene.id).toEqual([]);
      expect(res.composition?.grids["root"], scene.id).toBeDefined();
    }
    // Check Example A three bands & three shared stages
    const exA = lay(buildExampleA());
    const root = exA.composition!.grids["root"]!;
    expect(root.bands.map((b) => b.id)).toEqual(["top", "mid", "low"]);
    expect(root.columns.map((c) => c.id)).toEqual(["tools", "s1", "s2", "s3"]);
    const p1 = exA.view.entityOccurrences[occurrenceRef("e.p1")]!.geometry;
    const j1 = exA.view.entityOccurrences[occurrenceRef("e.j1")]!.geometry;
    const m1 = exA.view.entityOccurrences[occurrenceRef("e.m1")]!.geometry;
    expect(p1.x + p1.width / 2).toBeCloseTo(j1.x + j1.width / 2, 6);
    expect(j1.x + j1.width / 2).toBeCloseTo(m1.x + m1.width / 2, 6);
    expect(p1.y).toBeLessThan(j1.y);
    expect(j1.y).toBeLessThan(m1.y);
  });
});
