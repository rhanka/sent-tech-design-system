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

    // Too wide: Rule V-1 (DE3-L6a1 / REQ-R7-34) bans empty vertical σ_bands slack -> always {}
    const wide = computeAspectSlack({
      width: 2600,
      height: 1000,
      xTrackIds: ["s1", "s2"],
      yTrackIds: ["b1", "b2", "b3"],
      capX: 240,
      capY: 240,
    });
    expect(wide.sigmaCols).toEqual({});
    expect(wide.sigmaBands).toEqual({});
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
    // shortRes reaches 16:9 ± 2% via sigmaCols (zero sigmaBands); longRes is already wider than 16:9 due to the
    // oversized legend and keeps sigmaBands === {} (Rule V-1: zero empty vertical air, emits aspect-unreached).
    const shortPainted = paintedRatioOf(shortRes);
    const longPainted = paintedRatioOf(longRes);
    expect(longPainted.width).toBeGreaterThan(shortPainted.width);
    expect(shortRes.composition?.sigmaBands).toEqual({});
    expect(longRes.composition?.sigmaBands).toEqual({});
    expect(Math.abs(shortPainted.ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect(longPainted.ratio).toBeGreaterThan(ASPECT_16_9_TARGET * (1 + ASPECT_16_9_TOLERANCE));
    expect(longRes.warnings.some((w) => w.code === "aspect-unreached")).toBe(true);
    expect((longRes.composition?.postRouteCorrectionRounds ?? 0) <= 1).toBe(true);
  });

  it("empirically measures appctx-architecture at capX=96 vs 240, enforces sigmaBands={} (Rule V-1), and preserves F-1/F-2 on fold", () => {
    const scene = buildAppctxArchitecture16x9();
    for (const capX of [96, 240] as const) {
      const measured = mustLayOut(
        layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [], metrics: { gapInlineMax: capX } }), scene.sourceView),
        `appctx:capX=${String(capX)}`,
      );
      const painted = paintedRatioOf(measured);
      // Without V-S1 sigmaBands ({main: 48} before), appctx-architecture sits at natural 3654.7 x 2008 (ratio ~1.8201, +2.38%).
      expect(measured.composition?.sigmaBands).toEqual({});
      expect(measured.composition?.sigmaCols).toEqual({});
      expect(painted.height).toBe(2008);
      expect(painted.ratio).toBeCloseTo(3654.703125 / 2008, 3);
      expect(measured.warnings.some((w) => w.code === "aspect-unreached")).toBe(true);
    }

    const cache = createLayoutCache({ maxEntries: 64 });
    const nominal = mustLayOut(
      cache.layout(scene.document, baseOptionsOf(scene, { collapsed: [] }), scene.sourceView),
      "appctx:nom",
    );
    expect(nominal.composition?.sigmaBands).toEqual({});
    expect(nominal.composition?.nominalAspect).toBeDefined();
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

  it("never injects vertical sigmaBands on wide multi-band 16:9 composed scenes and restricts sigmaCols to expandable-container tracks (DE3-L6a1 Rule V-1)", () => {
    const wideHints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3", "s4"],
          transverse_bands: [
            { id: "b1", items: [entityRef("a1"), entityRef("a2"), entityRef("a3"), entityRef("a4")] },
            { id: "b2", items: [entityRef("b1"), entityRef("b2"), entityRef("b3"), entityRef("b4")] },
          ],
          cells: {
            [entityRef("a1")]: { column: "s1" },
            [entityRef("a2")]: { column: "s2" },
            [entityRef("a3")]: { column: "s3" },
            [entityRef("a4")]: { column: "s4" },
            [entityRef("b1")]: { column: "s1" },
            [entityRef("b2")]: { column: "s2" },
            [entityRef("b3")]: { column: "s3" },
            [entityRef("b4")]: { column: "s4" },
          },
        },
      },
    };
    const wideScene = buildGenericScene({
      id: "wide-no-sigmabands",
      carries: ["REQ-R7-34"],
      hintsV2: wideHints,
      entities: [
        { id: "a1", title: "A1" }, { id: "a2", title: "A2" }, { id: "a3", title: "A3" }, { id: "a4", title: "A4" },
        { id: "b1", title: "B1" }, { id: "b2", title: "B2" }, { id: "b3", title: "B3" }, { id: "b4", title: "B4" },
      ],
      relations: [],
    });
    const wideRes = mustLayOut(layoutMeasured(wideScene.document, baseOptionsOf(wideScene, { collapsed: [] })), "wide-no-sigma");
    expect(wideRes.composition?.sigmaBands).toEqual({});
    expect(wideRes.composition!.grids["root"]!.bands.map((b) => b.size)).toEqual([154, 154]);
    expect(wideRes.warnings.some((w) => w.code === "aspect-unreached")).toBe(true);

    // Tall scene with one leaf-only stage column (s-leaf) and one expandable-container stage column (s-zone):
    // sigmaCols must widen s-zone only, leaving s-leaf at natural card width.
    const mixedHints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      grids: {
        root: {
          stage_columns: ["s-leaf", "s-zone"],
          transverse_bands: [
            { id: "r1", items: [entityRef("leaf1"), entityRef("zone1")] },
            { id: "r2", items: [entityRef("leaf2"), entityRef("zone2")] },
          ],
          cells: {
            [entityRef("leaf1")]: { column: "s-leaf" },
            [entityRef("zone1")]: { column: "s-zone" },
            [entityRef("leaf2")]: { column: "s-leaf" },
            [entityRef("zone2")]: { column: "s-zone" },
          },
        },
      },
    };
    const mixedScene = buildGenericScene({
      id: "tall-expandable-tracks-only",
      carries: ["REQ-R7-34"],
      hintsV2: mixedHints,
      entities: [
        { id: "leaf1", title: "Leaf 1" },
        { id: "leaf2", title: "Leaf 2" },
        { id: "zone1", container: true, title: "Zone 1" },
        { id: "z1a", parent: "zone1", title: "Z1A" },
        { id: "zone2", container: true, title: "Zone 2" },
        { id: "z2a", parent: "zone2", title: "Z2A" },
      ],
      relations: [],
    });
    const mixedRes = mustLayOut(layoutMeasured(mixedScene.document, baseOptionsOf(mixedScene, { collapsed: [] })), "tall-mixed");
    expect(mixedRes.composition?.sigmaCols?.["s-leaf"]).toBeUndefined();
    expect(mixedRes.composition?.sigmaCols?.["s-zone"]).toBeGreaterThan(0);
    const rootCols = mixedRes.composition!.grids["root"]!.columns;
    expect(rootCols.find((c) => c.id === "s-leaf")!.size).toBe(352);
  });

  it("drops folded-column σ contribution when no expanded occupant remains in that track (F-6 / L-σ / PR #327 P2 #2)", () => {
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

    // Fold ALL 4 zones -> neither column has any expanded occupant remaining, so σ_cols drops to 0 on fold:
    // paintedGap(z1, z2) === zoneGutter (96) and paintedGapsAboveToken is empty!
    const allFolded = mustLayOut(
      layoutMeasured(
        scene.document,
        baseOptionsOf(scene, {
          collapsed: [occurrenceRef("e.z1"), occurrenceRef("e.z2"), occurrenceRef("e.z3"), occurrenceRef("e.z4")],
        }),
      ),
      "sigma:all-folded",
    );
    for (const ch of allFolded.channels ?? []) {
      if (ch.zone === true) expect(ch.gap).toBe(96);
    }
    expect(allFolded.composition?.paintedGapsAboveToken).toEqual([]);
    const geomZ1 = allFolded.view.entityOccurrences[occurrenceRef("e.z1")]!.geometry;
    const geomZ2 = allFolded.view.entityOccurrences[occurrenceRef("e.z2")]!.geometry;
    const paintedZ1Z2 = geomZ2.x - (geomZ1.x + geomZ1.width);
    expect(Math.abs(paintedZ1Z2 - 96)).toBeLessThanOrEqual(TOL);

    // Partial fold: fold z1 and z3 (emptying s1 of expanded containers) while z2 and z4 stay expanded in s2 ->
    // s1 drops its σ share while s2 keeps sigmaS2.
    const leftFolded = mustLayOut(
      layoutMeasured(
        scene.document,
        baseOptionsOf(scene, { collapsed: [occurrenceRef("e.z1"), occurrenceRef("e.z3")] }),
      ),
      "sigma:left-folded",
    );
    expect(leftFolded.composition?.sigmaCols).toEqual({ s2: sigmaS2 });
    const leftCols = leftFolded.composition!.grids["root"]!.columns;
    expect(leftCols.find((c) => c.id === "s1")!.size).toBe(352);
    expect(leftCols.find((c) => c.id === "s2")!.size).toBeGreaterThan(352);
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

    // Non-vacuity: aspect: "16:9" on the exact same scene adds σ_cols (zero σ_bands) and diverges from DE-2 bytes.
    const res16x9 = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { hints: aspect16x9Hints })), "16:9");
    expect(canonicalise(res16x9.view, "view")).not.toBe(canonicalise(de2Res.view, "view"));
    expect(res16x9.composition?.nominalAspect).toBeDefined();
    expect(res16x9.composition?.sigmaBands).toEqual({});
    expect(Math.abs(paintedRatioOf(res16x9).ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
  });

  it("picks a non-default τ from the ladder on an auto-packed container to reach 16:9 without needing excessive σ", () => {
    // Tall side stack + auto-packed container: ladder picks compact τ + σ_cols to hit 16:9 ± 2% with zero σ_bands.
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      aspect: "16:9",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [{ id: "r1", items: [entityRef("pack-host"), entityRef("side")] }],
          cells: {
            [entityRef("pack-host")]: { column: "s1" },
            [entityRef("side")]: { column: "s2" },
          },
        },
      },
      stacks: {
        [entityRef("side")]: { axis: "column" },
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
        { id: "c7", parent: "pack-host", title: "Card 7" },
        { id: "c8", parent: "pack-host", title: "Card 8" },
        { id: "side", container: true, title: "Side Stack" },
        { id: "p1", parent: "side", title: "Side 1" },
        { id: "p2", parent: "side", title: "Side 2" },
        { id: "p3", parent: "side", title: "Side 3" },
        { id: "p4", parent: "side", title: "Side 4" },
        { id: "p5", parent: "side", title: "Side 5" },
        { id: "p6", parent: "side", title: "Side 6" },
        { id: "p7", parent: "side", title: "Side 7" },
      ],
      relations: [],
    });
    const res = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene, { collapsed: [] })), "autopack-16x9");
    const painted = paintedRatioOf(res);
    expect(res.composition?.sigmaBands).toEqual({});
    expect(Math.abs(painted.ratio / ASPECT_16_9_TARGET - 1)).toBeLessThanOrEqual(ASPECT_16_9_TOLERANCE);
    expect(ASPECT_TAU_LADDER).toContain(res.composition?.tau);
    expect(res.composition?.tau).not.toBe(1.78);
  });
});
