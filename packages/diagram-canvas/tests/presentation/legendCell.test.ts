import {
  canonicalise,
  entityRef,
  occurrenceRef,
  type DsLayoutHintsV2,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  createLayoutCache,
  findFirstEmptyRootCell,
  layoutMeasured,
  type LayoutOptions,
  type LayoutResult,
  type Rect,
} from "../../src/index.js";
import { resolveScene } from "../../src/presentation/diagramSceneModel.js";
import { buildExampleA, buildGenericScene, type H2ReferenceScene } from "../layout/h2/fixtures/referenceSet.js";

const TOL = 1 / 64;

function baseOptionsOf(scene: H2ReferenceScene, extra?: Partial<LayoutOptions>): LayoutOptions {
  return {
    registry: scene.registry,
    bindings: scene.bindings,
    presentation: scene.presentation,
    measureLines: scene.measureLines,
    measureText: () => ({ width: 80, height: 20 }),
    targetWidth: 1440,
    hints: scene.hints,
    ...extra,
  };
}

function mustLayOut(res: LayoutResult, label: string): Extract<LayoutResult, { status: "laid-out" }> {
  expect(res.status, label).toBe("laid-out");
  if (res.status !== "laid-out") throw new Error(`refused ${label}: ${JSON.stringify(res.refusals)}`);
  return res;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width - 1e-4 && b.x < a.x + a.width - 1e-4 && a.y < b.y + b.height - 1e-4 && b.y < a.y + a.height - 1e-4;
}

describe("H2.8 legend: 'free-cell' placement, track growth, fallback, and fold/unfold identity", () => {
  it("seats Example A's legend in the first empty root cell (top, tools) in reading order with zero collisions (T-31)", () => {
    const exA = buildExampleA();
    const res = mustLayOut(layoutMeasured(exA.document, baseOptionsOf(exA)), "exA");
    expect(res.linkLegend).toBeDefined();
    expect(res.linkLegend!.anchor).toBe("free-cell");

    const rootGrid = res.composition!.grids["root"]!;
    const toolsCol = rootGrid.columns.find((c) => c.id === "tools")!;
    const topBand = rootGrid.bands.find((b) => b.id === "top")!;
    const legendRect = res.linkLegend!.rect;

    // Legend sits strictly inside the (top, tools) cell rect
    expect(legendRect.x).toBeGreaterThanOrEqual(toolsCol.start - TOL);
    expect(legendRect.x + legendRect.width).toBeLessThanOrEqual(toolsCol.start + toolsCol.size + TOL);
    expect(legendRect.y).toBeGreaterThanOrEqual(topBand.start - TOL);
    expect(legendRect.y + legendRect.height).toBeLessThanOrEqual(topBand.start + topBand.size + TOL);

    // Zero route spacing conflicts and zero overlap with any entity or placed label
    expect(res.routeSpacing?.conflictCount ?? 0).toBe(0);
    for (const occ of Object.values(res.view.entityOccurrences)) {
      expect(rectsOverlap(legendRect, occ.geometry), String(occ.id)).toBe(false);
    }
    for (const [id, box] of Object.entries(res.labelBoxes ?? {})) {
      expect(rectsOverlap(legendRect, box), id).toBe(false);
    }

    // resolveScene reuses the exact layout-measured free-cell legend rect
    const resolved = resolveScene(res, {
      document: exA.document,
      presentation: exA.presentation,
      measureLines: exA.measureLines,
      legend: "free-cell" as unknown as "right",
    });
    expect(resolved.linkLegend?.rect).toEqual(legendRect);
    expect(resolved.linkLegend?.anchor).toBe("free-cell");
  });

  it("grows the free cell's column width and band height from the layout-measured legend", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      legend: "free-cell",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "r1", items: [entityRef("a")] },
            { id: "r2", items: [entityRef("b"), entityRef("c")] },
          ],
          cells: {
            [entityRef("a")]: { column: "s1" },
            [entityRef("b")]: { column: "s1" },
            [entityRef("c")]: { column: "s2" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "free-cell-grow",
      carries: ["H2.8"],
      hintsV2,
      entities: [
        { id: "a", title: "A" },
        { id: "b", title: "B" },
        { id: "c", title: "C" },
      ],
      relations: [
        { id: "e1", source: "a", target: "b", strokeStyle: "solid" },
        { id: "e2", source: "b", target: "c", strokeStyle: "dashed" },
      ],
    });
    // First empty cell in reading order is (r1, s2)
    expect(
      findFirstEmptyRootCell(scene.hints.composition!.grids.root, [entityRef("a"), entityRef("b"), entityRef("c")]),
    ).toEqual({ bandId: "r1", colId: "s2" });

    const shortRes = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { legendTitle: "Key" })), "short");
    const longRes = mustLayOut(
      layoutMeasured(
        scene.document,
        baseOptionsOf(scene, {
          legendTitle: "Extraordinarily Wide Custom Connector Legend Heading Exceeding Standard Card Width",
        }),
      ),
      "long",
    );
    const shortS2 = shortRes.composition!.grids["root"]!.columns.find((c) => c.id === "s2")!;
    const longS2 = longRes.composition!.grids["root"]!.columns.find((c) => c.id === "s2")!;
    expect(longRes.linkLegend!.rect.width).toBeGreaterThan(shortS2.size);
    expect(longS2.size).toBeGreaterThanOrEqual(longRes.linkLegend!.rect.width - TOL);
    expect(longS2.size).toBeGreaterThan(shortS2.size);
  });

  it("falls back to anchor 'right' when no empty root cell exists", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      legend: "free-cell",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [{ id: "r1", items: [entityRef("a"), entityRef("b")] }],
          cells: {
            [entityRef("a")]: { column: "s1" },
            [entityRef("b")]: { column: "s2" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "free-cell-full-grid",
      carries: ["H2.8"],
      hintsV2,
      entities: [
        { id: "a", title: "A" },
        { id: "b", title: "B" },
      ],
      relations: [
        { id: "e1", source: "a", target: "b", strokeStyle: "solid" },
        { id: "e2", source: "b", target: "a", strokeStyle: "dashed" },
      ],
    });
    const res = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene)), "full");
    expect(res.linkLegend).toBeDefined();
    expect(res.linkLegend!.anchor).toBe("right");
    const bGeom = res.view.entityOccurrences[occurrenceRef("e.b")]!.geometry;
    expect(res.linkLegend!.rect.x).toBeGreaterThanOrEqual(bGeom.x + bGeom.width + 48 - TOL);
  });

  it("removes the free-cell legend when folding drops visible styles below two and restores identical bytes on unfold", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      legend: "free-cell",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "r1", items: [entityRef("z")] },
            { id: "r2", items: [entityRef("a"), entityRef("b")] },
          ],
          cells: {
            [entityRef("z")]: { column: "s1" },
            [entityRef("a")]: { column: "s1" },
            [entityRef("b")]: { column: "s2" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "free-cell-fold-hide",
      carries: ["H2.8"],
      hintsV2,
      entities: [
        { id: "z", container: true, title: "Container Holding Second Style" },
        { id: "z1", parent: "z", title: "Inner 1" },
        { id: "z2", parent: "z", title: "Inner 2" },
        { id: "a", title: "Card A" },
        { id: "b", title: "Card B" },
      ],
      relations: [
        { id: "e1", source: "a", target: "b", strokeStyle: "solid" },
        // Second style sits completely inside container `z`, so folding `z` hides it!
        { id: "e2", source: "z1", target: "z2", strokeStyle: "dashed" },
      ],
    });
    const cache = createLayoutCache();
    const u1 = mustLayOut(cache.layout(scene.document, baseOptionsOf(scene, { collapsed: [] })), "u1");
    expect(u1.linkLegend).toBeDefined();
    expect(u1.linkLegend!.anchor).toBe("free-cell");

    const folded = mustLayOut(
      cache.layout(scene.document, baseOptionsOf(scene, { collapsed: [occurrenceRef("e.z")] })),
      "folded",
    );
    expect(folded.linkLegend).toBeUndefined();

    const u2 = mustLayOut(cache.layout(scene.document, baseOptionsOf(scene, { collapsed: [] })), "u2");
    expect(u2.linkLegend).toEqual(u1.linkLegend);
    expect(canonicalise(u2.view, "view")).toBe(canonicalise(u1.view, "view"));
  });
});
