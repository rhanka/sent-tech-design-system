import {
  canonicalise,
  entityRef,
  lowerLayoutHintsV2,
  occurrenceRef,
  type DsLayoutHintsV2,
  type EntityRef,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  ASPECT_16_9_TARGET,
  ASPECT_16_9_TOLERANCE,
  ASPECT_TAU_LADDER,
  chooseAspectTau,
  computeAspectSlack,
  computeCompositionPlanKey,
  createLayoutCache,
  layoutMeasured,
  type LayoutOptions,
  type LayoutResult,
  type LineMeasurer,
  type Rect,
} from "../../../src/index.js";
import {
  buildAppctxArchitecture16x9,
  buildExampleA,
  buildGenericScene,
  enumerateVisibleFoldStates,
  type H2ReferenceScene,
} from "./fixtures/referenceSet.js";

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

function paintedRatioOf(res: Extract<LayoutResult, { status: "laid-out" }>): { width: number; height: number; ratio: number } {
  let xmin = Number.POSITIVE_INFINITY;
  let xmax = Number.NEGATIVE_INFINITY;
  let ymin = Number.POSITIVE_INFINITY;
  let ymax = Number.NEGATIVE_INFINITY;
  const addRect = (r: Rect) => {
    xmin = Math.min(xmin, r.x);
    xmax = Math.max(xmax, r.x + r.width);
    ymin = Math.min(ymin, r.y);
    ymax = Math.max(ymax, r.y + r.height);
  };
  for (const occ of Object.values(res.view.entityOccurrences)) {
    if (occ.geometry.width > 0 || occ.geometry.height > 0) addRect(occ.geometry);
  }
  for (const rel of Object.values(res.view.relationOccurrences)) {
    for (const pt of rel.waypoints ?? []) {
      xmin = Math.min(xmin, pt.x);
      xmax = Math.max(xmax, pt.x);
      ymin = Math.min(ymin, pt.y);
      ymax = Math.max(ymax, pt.y);
    }
  }
  for (const box of Object.values(res.labelBoxes ?? {})) addRect(box);
  if (res.linkLegend !== undefined) addRect(res.linkLegend.rect);
  const width = xmax - xmin;
  const height = ymax - ymin;
  return { width, height, ratio: width / height };
}

describe("H2.6 aspect: '16:9' (τ ladder, σ slack, legend bounds, post-route correction, painted gaps)", () => {
  it("applies exact τ ladder choice and tie-break order (|ln(A/A*)|, smaller area, nearest 1.78, smaller τ)", () => {
    expect(ASPECT_TAU_LADDER).toEqual([0.56, 0.75, 1.0, 1.33, 1.78, 2.37, 3.16, 4.21]);

    // 1. Distance wins over area
    const byDist = chooseAspectTau([
      { tau: 1.0, width: 1000, height: 1000 }, // ratio 1.0
      { tau: 2.37, width: 1780, height: 1000 }, // ratio 1.78
    ]);
    expect(byDist.tau).toBe(2.37);

    // 2. Equal distance -> smaller area wins
    const byArea = chooseAspectTau([
      { tau: 1.78, width: 3200, height: 1800 }, // ratio 16/9, area 5.76M
      { tau: 1.33, width: 1600, height: 900 }, // ratio 16/9, area 1.44M
    ]);
    expect(byArea.tau).toBe(1.33);

    // 3. Equal distance and area -> nearest 1.78 wins
    const byNearestDefault = chooseAspectTau([
      { tau: 0.56, width: 1600, height: 900 },
      { tau: 1.33, width: 1600, height: 900 },
      { tau: 2.37, width: 1600, height: 900 },
    ]);
    expect(byNearestDefault.tau).toBe(1.33); // |1.33 - 1.78| = 0.45 < |2.37 - 1.78| = 0.59

    // 4. Equal distance, area, and distance from 1.78 -> smaller τ wins
    const bySmallerTau = chooseAspectTau([
      { tau: 2.28, width: 1600, height: 900 },
      { tau: 1.28, width: 1600, height: 900 },
    ]);
    expect(bySmallerTau.tau).toBe(1.28);
  });

  it("splits σ in whole world units with remainder to last track and caps each track at gapMax (240)", () => {
    // Within ±2% -> zero slack
    const within = computeAspectSlack({
      width: 1800,
      height: 1000,
      xTrackIds: ["s1", "s2", "s3"],
      yTrackIds: ["b1", "b2"],
      capX: 240,
      capY: 240,
    });
    expect(within.sigmaCols).toEqual({});
    expect(within.sigmaBands).toEqual({});
    expect(within.capReached).toBe(false);

    // Too tall: deltaW = round(16/9 * 1000 - 1500) = 278 across 3 tracks -> 92, 92, 94 (remainder to last)
    const tall = computeAspectSlack({
      width: 1500,
      height: 1000,
      xTrackIds: ["s1", "s2", "s3"],
      yTrackIds: ["b1", "b2"],
      capX: 240,
      capY: 240,
    });
    expect(tall.sigmaCols).toEqual({ s1: 92, s2: 92, s3: 94 });
    expect(tall.sigmaBands).toEqual({});
    expect(tall.capReached).toBe(false);

    // Too wide: deltaH = round(2600 / (16/9) - 1000) = 463 across 3 bands -> 154, 154, 155
    const wide = computeAspectSlack({
      width: 2600,
      height: 1000,
      xTrackIds: ["s1", "s2"],
      yTrackIds: ["b1", "b2", "b3"],
      capX: 240,
      capY: 240,
    });
    expect(wide.sigmaCols).toEqual({});
    expect(wide.sigmaBands).toEqual({ b1: 154, b2: 154, b3: 155 });
    expect(wide.capReached).toBe(false);

    // Cap reached on extreme tall ratio
    const capped = computeAspectSlack({
      width: 500,
      height: 2000,
      xTrackIds: ["s1", "s2"],
      yTrackIds: ["b1"],
      capX: 240,
      capY: 240,
    });
    expect(capped.sigmaCols).toEqual({ s1: 240, s2: 240 });
    expect(capped.capReached).toBe(true);
  });

  it("emits aspect-unreached info warning with achieved ratio when σ cap is exceeded", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [
            { id: "b1", items: [entityRef("n1")] },
            { id: "b2", items: [entityRef("n2")] },
            { id: "b3", items: [entityRef("n3")] },
            { id: "b4", items: [entityRef("n4")] },
            { id: "b5", items: [entityRef("n5")] },
          ],
          cells: {
            [entityRef("n1")]: { column: "s1" },
            [entityRef("n2")]: { column: "s1" },
            [entityRef("n3")]: { column: "s1" },
            [entityRef("n4")]: { column: "s1" },
            [entityRef("n5")]: { column: "s1" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "aspect-cap-unreached",
      carries: ["H2.6"],
      hintsV2,
      entities: [
        { id: "n1", title: "One" },
        { id: "n2", title: "Two" },
        { id: "n3", title: "Three" },
        { id: "n4", title: "Four" },
        { id: "n5", title: "Five" },
      ],
      relations: [],
    });
    const res = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [] })), "cap");
    const warn = res.warnings.find((w) => w.code === "aspect-unreached");
    expect(warn).toBeDefined();
    expect(warn?.severity).toBe("info");
    expect(typeof warn?.details?.achieved).toBe("number");
    expect((warn?.details?.achieved as number) < ASPECT_16_9_TARGET * (1 - ASPECT_16_9_TOLERANCE)).toBe(true);
    expect((res.composition?.postRouteCorrectionRounds ?? 0) <= 1).toBe(true);
  });

  it("counts the layout-measured legend in 16:9 bounds: longer host title/label changes plan key and nominal bounds", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      legend: "right",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "b1", items: [entityRef("z1"), entityRef("z2"), entityRef("z3")] },
            { id: "b2", items: [entityRef("z4"), entityRef("z5"), entityRef("z6")] },
            { id: "b3", items: [entityRef("z7"), entityRef("z8"), entityRef("z9")] },
          ],
          cells: {
            [entityRef("z1")]: { column: "s1" },
            [entityRef("z2")]: { column: "s2" },
            [entityRef("z3")]: { column: "s3" },
            [entityRef("z4")]: { column: "s1" },
            [entityRef("z5")]: { column: "s2" },
            [entityRef("z6")]: { column: "s3" },
            [entityRef("z7")]: { column: "s1" },
            [entityRef("z8")]: { column: "s2" },
            [entityRef("z9")]: { column: "s3" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "aspect-legend-bounds",
      carries: ["H2.6"],
      hintsV2,
      entities: [
        { id: "z1", container: true, title: "Zone 1" },
        { id: "z1a", parent: "z1", title: "A" },
        { id: "z2", container: true, title: "Zone 2" },
        { id: "z2a", parent: "z2", title: "B" },
        { id: "z3", container: true, title: "Zone 3" },
        { id: "z3a", parent: "z3", title: "C" },
        { id: "z4", container: true, title: "Zone 4" },
        { id: "z4a", parent: "z4", title: "D" },
        { id: "z5", container: true, title: "Zone 5" },
        { id: "z5a", parent: "z5", title: "E" },
        { id: "z6", container: true, title: "Zone 6" },
        { id: "z6a", parent: "z6", title: "F" },
        { id: "z7", container: true, title: "Zone 7" },
        { id: "z7a", parent: "z7", title: "G" },
        { id: "z8", container: true, title: "Zone 8" },
        { id: "z8a", parent: "z8", title: "H" },
        { id: "z9", container: true, title: "Zone 9" },
        { id: "z9a", parent: "z9", title: "I" },
      ],
      relations: [
        { id: "r1", source: "z1a", target: "z2a", strokeStyle: "solid" },
        { id: "r2", source: "z2a", target: "z3a", strokeStyle: "dashed" },
      ],
    });
    const shortOpts = baseOptionsOf(scene, { legendTitle: "Key" });
    const longOpts = baseOptionsOf(scene, {
      legendTitle: "Extended Architectural Connector Legend Reference",
      legendLabels: {
        "solid:arrow:default": "Synchronous Primary Service Invocation Channel",
        "dashed:arrow:default": "Asynchronous Proposed Event Notification Flow",
      },
    });
    expect(computeCompositionPlanKey(scene.document, shortOpts)).not.toBe(
      computeCompositionPlanKey(scene.document, longOpts),
    );
    const shortRes = mustLayOut(layoutMeasured(scene.document, shortOpts), "short");
    const longRes = mustLayOut(layoutMeasured(scene.document, longOpts), "long");
    expect(longRes.linkLegend!.rect.width).toBeGreaterThan(shortRes.linkLegend!.rect.width);
    expect(longRes.composition?.planDigest).not.toBe(shortRes.composition?.planDigest);
    // Both reach 16:9 ± 2%; longer legend shifts nominal bounds & σ distribution
    const shortPainted = paintedRatioOf(shortRes);
    const longPainted = paintedRatioOf(longRes);
    expect(longPainted.width).toBeGreaterThan(shortPainted.width);
    expect(Math.abs(shortPainted.ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect(Math.abs(longPainted.ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect((longRes.composition?.postRouteCorrectionRounds ?? 0) <= 1).toBe(true);
  });

  it("lands the H2.2 16:9 candidate (appctx-architecture) within 16/9 ± 2% at nominal and preserves F-1/F-2 on fold", () => {
    const scene = buildAppctxArchitecture16x9();
    const cache = createLayoutCache({ maxEntries: 64 });
    const nominal = mustLayOut(
      cache.layout(scene.document, baseOptionsOf(scene, { collapsed: [] }), scene.sourceView),
      "appctx:nom",
    );
    const painted = paintedRatioOf(nominal);
    expect(Math.abs(painted.ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect(nominal.composition?.nominalAspect).toBeDefined();
    expect(Math.abs(nominal.composition!.nominalAspect! / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(
      ASPECT_16_9_TOLERANCE,
    );
    expect(nominal.warnings.some((w) => w.code === "aspect-unreached")).toBe(false);
    expect((nominal.composition?.postRouteCorrectionRounds ?? 0) <= 1).toBe(true);

    // Folded states keep structure (F-1/F-2) and the same plan digest; ratio is not constrained
    const states = enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView);
    const sampleFolded = states.filter((s) => s.length > 0).slice(0, 8);
    for (const collapsed of sampleFolded) {
      const folded = mustLayOut(
        cache.layout(scene.document, baseOptionsOf(scene, { collapsed }), scene.sourceView),
        `appctx:fold:${collapsed.join(",")}`,
      );
      expect(folded.composition?.planDigest).toBe(nominal.composition?.planDigest);
      for (const [k, orient] of Object.entries(folded.orientations ?? {})) {
        if (nominal.orientations?.[k] !== undefined) {
          expect(orient).toBe(nominal.orientations[k]);
        }
      }
    }
  });

  it("reports painted gaps between folded sibling zones in σ-widened tracks as token + σ shares (F-6)", () => {
    // Two columns, two bands of zones -> natural ratio is taller than 16:9, so 16:9 adds positive σ to s1 & s2.
    // When z1 and z2 are folded, each is a centered fixed-footprint card inside its σ-widened column:
    // paintedGap(z1, z2) === zoneGutter (96) + fromSlack + toSlack, listed in paintedGapsAboveToken!
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "r1", items: [entityRef("z1"), entityRef("z2")] },
            { id: "r2", items: [entityRef("z3"), entityRef("z4")] },
          ],
          cells: {
            [entityRef("z1")]: { column: "s1" },
            [entityRef("z2")]: { column: "s2" },
            [entityRef("z3")]: { column: "s1" },
            [entityRef("z4")]: { column: "s2" },
          },
        },
      },
      stacks: {
        [entityRef("z1")]: { axis: "column" },
        [entityRef("z2")]: { axis: "column" },
        [entityRef("z3")]: { axis: "column" },
        [entityRef("z4")]: { axis: "column" },
      },
    };
    const scene = buildGenericScene({
      id: "aspect-sigma-painted-gaps",
      carries: ["H2.6", "F-6"],
      hintsV2,
      entities: [
        { id: "z1", container: true, title: "Zone 1" },
        { id: "z1a", parent: "z1", title: "1A" },
        { id: "z1b", parent: "z1", title: "1B" },
        { id: "z2", container: true, title: "Zone 2" },
        { id: "z2a", parent: "z2", title: "2A" },
        { id: "z2b", parent: "z2", title: "2B" },
        { id: "z3", container: true, title: "Zone 3" },
        { id: "z3a", parent: "z3", title: "3A" },
        { id: "z4", container: true, title: "Zone 4" },
        { id: "z4a", parent: "z4", title: "4A" },
      ],
      relations: [],
    });

    const nominal = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [] })), "sigma:nom");
    const sigmaS1 = nominal.composition?.sigmaCols?.["s1"] ?? 0;
    const sigmaS2 = nominal.composition?.sigmaCols?.["s2"] ?? 0;
    expect(sigmaS1).toBeGreaterThan(0);
    expect(sigmaS2).toBeGreaterThan(0);

    // Fold ALL 4 zones -> each sits centered in its column of width (cardW + sigma_k) -> slack = sigma_k / 2 per side!
    const allFolded = mustLayOut(
      layoutMeasured(
        scene.document,
        baseOptionsOf(scene, {
          collapsed: [occurrenceRef("e.z1"), occurrenceRef("e.z2"), occurrenceRef("e.z3"), occurrenceRef("e.z4")],
        }),
      ),
      "sigma:all-folded",
    );
    // Underlying gutter stays at zoneGutter token (96)
    for (const ch of allFolded.channels ?? []) {
      if (ch.zone === true) expect(ch.gap).toBe(96);
    }
    const pairZ1Z2 = allFolded.composition?.paintedGapsAboveToken?.find(
      (g) => g.scope === "root" && g.axis === "horizontal" && g.left === entityRef("z1") && g.right === entityRef("z2"),
    );
    expect(pairZ1Z2).toBeDefined();
    expect(pairZ1Z2!.token).toBe(96);
    const geomZ1 = allFolded.view.entityOccurrences[occurrenceRef("e.z1")]!.geometry;
    const geomZ2 = allFolded.view.entityOccurrences[occurrenceRef("e.z2")]!.geometry;
    const paintedZ1Z2 = geomZ2.x - (geomZ1.x + geomZ1.width);
    expect(Math.abs(paintedZ1Z2 - (96 + sigmaS1 / 2 + sigmaS2 / 2))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(pairZ1Z2!.paintedGap - paintedZ1Z2)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(pairZ1Z2!.fromSlack - sigmaS1 / 2)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(pairZ1Z2!.toSlack - sigmaS2 / 2)).toBeLessThanOrEqual(TOL);
  });

  it("keeps aspect: 'free' byte-identical to DE-2 output (no ladder search, no σ) while aspect: '16:9' reshapes it", () => {
    const baseGrid: Extract<DsLayoutHintsV2, { mode: "stage-columns" }> = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [{ id: "r1", items: [entityRef("pack-host")] }],
          cells: { [entityRef("pack-host")]: { column: "s1" } },
        },
      },
    };
    const freeHints = lowerLayoutHintsV2({ ...baseGrid, aspect: "free" });
    const aspect16x9Hints = lowerLayoutHintsV2({ ...baseGrid, aspect: "16:9" });
    const scene = buildGenericScene({
      id: "aspect-free-vs-de2",
      carries: ["H2.6"],
      hintsV2: { ...baseGrid, aspect: "free" },
      entities: [
        { id: "pack-host", container: true, title: "Auto-Packed Host" },
        { id: "c1", parent: "pack-host", title: "Card 1" },
        { id: "c2", parent: "pack-host", title: "Card 2" },
        { id: "c3", parent: "pack-host", title: "Card 3" },
        { id: "c4", parent: "pack-host", title: "Card 4" },
        { id: "c5", parent: "pack-host", title: "Card 5" },
        { id: "c6", parent: "pack-host", title: "Card 6" },
      ],
      relations: [],
    });

    // True DE-2 baseline: hints omitted (composition === undefined, default τ = 1.78, no σ).
    const { hints: _noHints, ...de2Opts } = baseOptionsOf(scene);
    void _noHints;
    const de2Res = mustLayOut(layoutMeasured(scene.document, de2Opts), "de2");
    expect(de2Res.composition).toBeUndefined();

    // @2 stage-columns with aspect: "free" MUST produce DE-2's exact view bytes (no ladder search, no σ).
    const freeRes = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { hints: freeHints })), "free");
    expect(freeRes.composition).toBeDefined();
    expect(canonicalise(freeRes.view, "view")).toBe(canonicalise(de2Res.view, "view"));
    expect(freeRes.composition?.nominalAspect).toBeUndefined();
    expect(freeRes.composition?.sigmaCols).toBeUndefined();
    expect(freeRes.composition?.sigmaBands).toBeUndefined();

    // Non-vacuity: aspect: "16:9" on the exact same scene searches τ / adds σ and diverges from DE-2 bytes.
    const res16x9 = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { hints: aspect16x9Hints })), "16:9");
    expect(canonicalise(res16x9.view, "view")).not.toBe(canonicalise(de2Res.view, "view"));
    expect(res16x9.composition?.nominalAspect).toBeDefined();
    expect(Math.abs(paintedRatioOf(res16x9).ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
  });

  it("picks a non-default τ from the ladder on an auto-packed container to reach 16:9 without needing excessive σ", () => {
    // Single root stage column holding one auto-packed container with 6 cards; ladder picks wide τ
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      grids: {
        root: {
          stage_columns: ["s1"],
          transverse_bands: [{ id: "r1", items: [entityRef("pack-host")] }],
          cells: { [entityRef("pack-host")]: { column: "s1" } },
        },
      },
    };
    const scene = buildGenericScene({
      id: "aspect-tau-autopack",
      carries: ["H2.6"],
      hintsV2,
      entities: [
        { id: "pack-host", container: true, title: "Auto-Packed Host" },
        { id: "c1", parent: "pack-host", title: "Card 1" },
        { id: "c2", parent: "pack-host", title: "Card 2" },
        { id: "c3", parent: "pack-host", title: "Card 3" },
        { id: "c4", parent: "pack-host", title: "Card 4" },
        { id: "c5", parent: "pack-host", title: "Card 5" },
        { id: "c6", parent: "pack-host", title: "Card 6" },
      ],
      relations: [],
    });
    const res = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [] })), "autopack-16x9");
    const painted = paintedRatioOf(res);
    expect(Math.abs(painted.ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect(ASPECT_TAU_LADDER).toContain(res.composition?.tau);
  });
});
