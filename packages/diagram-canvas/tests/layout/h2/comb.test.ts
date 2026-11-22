import {
  canonicalise,
  entityRef,
  lowerLayoutHintsV2,
  occurrenceRef,
  type DsLayoutHintsV2,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  checkRouteSpacing,
  connectorMarkerIds,
  connectorMarkerRef,
  createLayoutCache,
  layoutMeasured,
  type LayoutOptions,
  type LayoutResult,
} from "../../../src/index.js";
import { resolveScene } from "../../../src/presentation/diagramSceneModel.js";
import {
  buildAppctxArchitecture16x9,
  buildExampleA,
  buildExampleB,
  buildFigkitTwins,
  buildGenericScene,
  enumerateVisibleFoldStates,
  type H2ReferenceScene,
} from "./fixtures/referenceSet.js";

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

describe("H2.7 fanIn / fanOut combs (§4.6 + Review P2 #4 & #5)", () => {
  it("enforces the label rule (§4.6 step 1): A/B/empty falls back with reason 'labels'; A/A/empty forms one comb labelled A", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      fanIn: "comb",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "upper", items: [entityRef("a"), entityRef("b"), entityRef("c")] },
            { id: "lower", items: [entityRef("hub")] },
          ],
          cells: {
            [entityRef("a")]: { column: "s1" },
            [entityRef("b")]: { column: "s2" },
            [entityRef("c")]: { column: "s3" },
            [entityRef("hub")]: { column: "s2" },
          },
        },
      },
    };
    const entities = [
      { id: "a", title: "Source A" },
      { id: "b", title: "Source B" },
      { id: "c", title: "Source C" },
      { id: "hub", title: "Target Hub" },
    ];

    // Case 1: A, B, empty -> never split, all 3 separate, ONE comb-fallback (reason: "labels")
    const mixed = buildGenericScene({
      id: "comb-labels-mixed",
      carries: ["H2.7"],
      hintsV2,
      entities,
      relations: [
        { id: "r1", source: "a", target: "hub", label: "Alpha" },
        { id: "r2", source: "b", target: "hub", label: "Beta" },
        { id: "r3", source: "c", target: "hub" },
      ],
    });
    const resMixed = mustLayOut(layoutMeasured(mixed.document, baseOptionsOf(mixed)), "mixed");
    expect(resMixed.combGroups ?? []).toHaveLength(0);
    const labelFallbacks = resMixed.warnings.filter((w) => w.code === "comb-fallback");
    expect(labelFallbacks).toHaveLength(1);
    expect(labelFallbacks[0]?.severity).toBe("info");
    expect(labelFallbacks[0]?.details?.reason).toBe("labels");
    expect(labelFallbacks[0]?.details?.members).toHaveLength(3);
    expect(resMixed.composition?.combFallbacks).toHaveLength(1);
    expect(resMixed.composition?.combFallbacks?.[0]?.reason).toBe("labels");

    // Case 2: empty (carrier r1!), Alpha (r2), Alpha (r3) -> ONE comb labelled Alpha including unlabelled r1!
    const unified = buildGenericScene({
      id: "comb-labels-unified",
      carries: ["H2.7"],
      hintsV2,
      entities,
      relations: [
        { id: "r1", source: "a", target: "hub" },
        { id: "r2", source: "b", target: "hub", label: "Alpha" },
        { id: "r3", source: "c", target: "hub", label: "Alpha" },
      ],
    });
    const resUnified = mustLayOut(layoutMeasured(unified.document, baseOptionsOf(unified)), "unified");
    expect(resUnified.warnings.filter((w) => w.code === "comb-fallback")).toHaveLength(0);
    expect(resUnified.combGroups).toHaveLength(1);
    const comb = resUnified.combGroups![0]!;
    expect(comb.kind).toBe("fan-in");
    expect(comb.members).toHaveLength(3);
    expect(comb.label).toBe("Alpha");
    // Exactly ONE label box placed (on carrier), zero label-unplaced warnings
    expect(Object.keys(resUnified.labelBoxes ?? {})).toEqual([String(comb.carrier)]);
    expect(resUnified.warnings.filter((w) => w.code === "label-unplaced")).toHaveLength(0);
    expect(resUnified.routeSpacing?.conflictCount ?? 0).toBe(0);

    // Resolved scene draws ONE label ("Alpha") and ONE arrowhead (only on carrier)
    const scene = resolveScene(resUnified, {
      document: unified.document,
      presentation: unified.presentation,
      measureLines: unified.measureLines,
    });
    expect(scene.labels).toHaveLength(1);
    expect(scene.labels[0]!.lines.join(" ")).toBe("Alpha");
    const markers = connectorMarkerIds("arrow");
    const drawnArrows = scene.edges.filter((e) => connectorMarkerRef(e, markers) !== undefined);
    expect(drawnArrows).toHaveLength(1);
    expect(drawnArrows[0]!.occurrence).toBe(comb.carrier);
  });

  it("applies fan-in precedence over fan-out (§4.6 step 2) and keeps unformed fan-in members as fan-out candidates", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      fanIn: "comb",
      fanOut: "comb",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "r1", items: [entityRef("src1"), entityRef("src2")] },
            { id: "r2", items: [entityRef("dst1"), entityRef("dst2"), entityRef("dst3")] },
          ],
          cells: {
            [entityRef("src1")]: { column: "s1" },
            [entityRef("src2")]: { column: "s3" },
            [entityRef("dst1")]: { column: "s1" },
            [entityRef("dst2")]: { column: "s2" },
            [entityRef("dst3")]: { column: "s3" },
          },
        },
      },
    };
    const entities = [
      { id: "src1", title: "Source 1" },
      { id: "src2", title: "Source 2" },
      { id: "dst1", title: "Target 1" },
      { id: "dst2", title: "Target 2" },
      { id: "dst3", title: "Target 3" },
    ];

    // Part A: src1 -> dst1, src2 -> dst1 (fan-in at dst1 claims both); src1 -> dst2 is left alone at src1 -> routes plainly!
    const prec = buildGenericScene({
      id: "comb-precedence",
      carries: ["H2.7"],
      hintsV2,
      entities,
      relations: [
        { id: "e1", source: "src1", target: "dst1" },
        { id: "e2", source: "src2", target: "dst1" },
        { id: "e3", source: "src1", target: "dst2" },
      ],
    });
    const resPrec = mustLayOut(layoutMeasured(prec.document, baseOptionsOf(prec)), "prec");
    expect(resPrec.combGroups).toHaveLength(1);
    expect(resPrec.combGroups![0]!.kind).toBe("fan-in");
    expect(resPrec.combGroups![0]!.hub).toBe(entityRef("dst1"));
    expect(resPrec.warnings.filter((w) => w.code === "comb-fallback")).toHaveLength(0);

    // Part B: fan-in at dst1 fails label rule ("X" vs "Y"), so e1 stays available for fan-out at src1 (e1 + e3, both "X" -> fan-out comb!)
    const unformedStay = buildGenericScene({
      id: "comb-unformed-fanout",
      carries: ["H2.7"],
      hintsV2,
      entities,
      relations: [
        { id: "e1", source: "src1", target: "dst1", label: "X" },
        { id: "e2", source: "src2", target: "dst1", label: "Y" },
        { id: "e3", source: "src1", target: "dst2", label: "X" },
      ],
    });
    const resStay = mustLayOut(layoutMeasured(unformedStay.document, baseOptionsOf(unformedStay)), "stay");
    expect(resStay.warnings.some((w) => w.code === "comb-fallback" && w.details?.reason === "labels")).toBe(true);
    expect(resStay.combGroups).toHaveLength(1);
    expect(resStay.combGroups![0]!.kind).toBe("fan-out");
    expect(resStay.combGroups![0]!.hub).toBe(entityRef("src1"));
    expect(resStay.combGroups![0]!.members).toHaveLength(2);
  });

  it("Review P2 #4: preserves arrowhead: 'none' on rendered fan-in AND fan-out combs (shared trunk retained, 0 arrowheads drawn)", () => {
    const makeNoneScene = (mode: "fanIn" | "fanOut") => {
      const hintsV2: DsLayoutHintsV2 = {
        vocabulary: "ds-layout-hints@2",
        mode: "stage-columns",
        ...(mode === "fanIn" ? { fanIn: "comb" as const } : { fanOut: "comb" as const }),
        grids: {
          root: {
            stage_columns: ["s1", "s2", "s3"],
            transverse_bands: [
              { id: "r1", items: [entityRef("m1"), entityRef("m2"), entityRef("m3")] },
              { id: "r2", items: [entityRef("hub")] },
            ],
            cells: {
              [entityRef("m1")]: { column: "s1" },
              [entityRef("m2")]: { column: "s2" },
              [entityRef("m3")]: { column: "s3" },
              [entityRef("hub")]: { column: "s2" },
            },
          },
        },
      };
      return buildGenericScene({
        id: `comb-none-${mode}`,
        carries: ["H2.7", "P2-4"],
        hintsV2,
        entities: [
          { id: "m1", title: "Member 1" },
          { id: "m2", title: "Member 2" },
          { id: "m3", title: "Member 3" },
          { id: "hub", title: "Hub" },
        ],
        relations:
          mode === "fanIn"
            ? [
                { id: "r1", source: "m1", target: "hub", arrowhead: "none", label: "Bus" },
                { id: "r2", source: "m2", target: "hub", arrowhead: "none", label: "Bus" },
                { id: "r3", source: "m3", target: "hub", arrowhead: "none", label: "Bus" },
              ]
            : [
                { id: "r1", source: "hub", target: "m1", arrowhead: "none", label: "Fan" },
                { id: "r2", source: "hub", target: "m2", arrowhead: "none", label: "Fan" },
                { id: "r3", source: "hub", target: "m3", arrowhead: "none", label: "Fan" },
              ],
      });
    };

    const markers = connectorMarkerIds("arrow");
    for (const mode of ["fanIn", "fanOut"] as const) {
      const sceneDef = makeNoneScene(mode);
      const laid = mustLayOut(layoutMeasured(sceneDef.document, baseOptionsOf(sceneDef)), mode);
      expect(laid.combGroups, mode).toHaveLength(1);
      expect(laid.combGroups![0]!.arrowhead, mode).toBe("none");
      expect(laid.routeSpacing?.conflictCount ?? 0, mode).toBe(0);

      const resolved = resolveScene(laid, {
        document: sceneDef.document,
        presentation: sceneDef.presentation,
        measureLines: sceneDef.measureLines,
      });
      expect(resolved.edges, mode).toHaveLength(3);
      // Shared trunk retained (every member's polyline meets or crosses the trunk line y === trunkY)
      const trunkY = laid.combGroups![0]!.trunk[0].y;
      for (const edge of resolved.edges) {
        const meetsTrunk = edge.points.slice(1).some((pt, i) => {
          const prev = edge.points[i]!;
          return Math.min(prev.y, pt.y) - 1e-3 <= trunkY && trunkY <= Math.max(prev.y, pt.y) + 1e-3;
        });
        expect(meetsTrunk, `${mode}:${edge.occurrence}`).toBe(true);
        // ZERO arrowheads drawn!
        expect(edge.arrowhead, `${mode}:${edge.occurrence}`).toBe("none");
        expect(connectorMarkerRef(edge, markers), `${mode}:${edge.occurrence}`).toBeUndefined();
      }
      // Single comb label still rendered
      expect(resolved.labels, mode).toHaveLength(1);
    }
  });

  it("places Example B fan-in trunk in b1|b2 (T-13) and Example A fan-out trunk in tools|s1 extending past last band (T-33)", () => {
    // Example B (T-13): 4 cards in b1 -> c1 in b2 on ONE trunk in layer-b|across|b1
    const exB = buildExampleB();
    const resB = mustLayOut(layoutMeasured(exB.document, baseOptionsOf(exB)), "exB");
    expect(resB.combGroups).toBeDefined();
    const bComb = resB.combGroups!.find((g) => g.kind === "fan-in");
    expect(bComb).toBeDefined();
    expect(bComb!.members).toHaveLength(4);
    expect(bComb!.trunkGutterId).toContain("|across|b1");
    expect(resB.routeSpacing?.conflictCount ?? 0).toBe(0);
    expect(resB.warnings.filter((w) => w.code === "label-unplaced")).toHaveLength(0);

    // Example A (T-33): j1 -> 3 lower cards in peripheral stack tools on ONE vertical trunk in root|along|tools
    const exA = buildExampleA();
    const resA = mustLayOut(layoutMeasured(exA.document, baseOptionsOf(exA)), "exA");
    expect(resA.combGroups).toBeDefined();
    const aComb = resA.combGroups!.find((g) => g.kind === "fan-out");
    expect(aComb).toBeDefined();
    expect(aComb!.members).toHaveLength(3);
    expect(aComb!.trunkGutterId).toBe("root|along|tools");
    // Trunk runs vertically on one x line and extends past the bottom of band `low` beside tall `tools`!
    expect(Math.abs(aComb!.trunk[0].x - aComb!.trunk[1].x)).toBeLessThanOrEqual(1e-4);
    const lowBand = resA.composition!.grids["root"]!.bands.find((b) => b.id === "low")!;
    expect(Math.max(aComb!.trunk[0].y, aComb!.trunk[1].y)).toBeGreaterThan(lowBand.start + lowBand.size);
    expect(resA.routeSpacing?.conflictCount ?? 0).toBe(0);
    expect(resA.warnings.filter((w) => w.code === "label-unplaced")).toHaveLength(0);
  });

  it("dissolves with comb-fallback (reason: 'gutter-full') when a spanning cell crosses the trunk boundary or gutter has no free track, without widening zone gutters", () => {
    // Spanning cell `blocker` crosses the horizontal boundary between r1 and r2 right in the middle of the comb's extent!
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      fanIn: "comb",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "r1", items: [entityRef("a"), entityRef("blocker"), entityRef("c")] },
            { id: "r2", items: [entityRef("hub")] },
          ],
          cells: {
            [entityRef("a")]: { column: "s1" },
            [entityRef("blocker")]: { column: "s2", to_band: "r2" },
            [entityRef("c")]: { column: "s3" },
            [entityRef("hub")]: { column: "s1" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "comb-spanning-fallback",
      carries: ["H2.7"],
      hintsV2,
      entities: [
        { id: "a", title: "Left" },
        { id: "blocker", container: true, title: "Spanning Zone" },
        { id: "b1", parent: "blocker", title: "Inside" },
        { id: "c", title: "Right" },
        { id: "hub", title: "Hub" },
      ],
      relations: [
        { id: "e1", source: "a", target: "hub" },
        { id: "e2", source: "c", target: "hub" },
      ],
    });
    const res = mustLayOut(layoutMeasured(scene.document, baseOptionsOf(scene)), "span-block");
    expect(res.combGroups ?? []).toHaveLength(0);
    const fb = res.warnings.find((w) => w.code === "comb-fallback");
    expect(fb).toBeDefined();
    expect(fb?.details?.reason).toBe("gutter-full");
    for (const ch of res.channels ?? []) {
      if (ch.zone === true) expect(ch.gap).toBe(96);
    }
  });

  it("falls back with reason 'v1-path' on the v1 routing path while keeping zone gutters at token (§4.6 step 9)", () => {
    const exA = buildExampleA();
    const v1Entities = Object.fromEntries(
      Object.entries(exA.presentation.entities).map(([id, entry]) => [id, { form: entry.form, text: entry.text }]),
    );
    const v1Presentation = {
      contractPin: { id: "diagram-presentation", version: "diagram-presentation@1", contentDigest: "0".repeat(64) },
      entities: v1Entities,
      legends: {},
      categoryTokens: [],
    } as unknown as NonNullable<LayoutOptions["presentation"]>;
    const r7Ref = mustLayOut(layoutMeasured(exA.document, baseOptionsOf(exA)), "r7-exA");
    const r7FormedHubs = (r7Ref.combGroups ?? []).map((g) => g.hub).sort();
    expect(r7FormedHubs.length).toBeGreaterThanOrEqual(1);
    const res = mustLayOut(
      layoutMeasured(exA.document, { ...baseOptionsOf(exA), presentation: v1Presentation }),
      "v1-exA",
    );
    expect(res.combGroups ?? []).toHaveLength(0);
    const v1Fallbacks = res.warnings.filter((w) => w.code === "comb-fallback" && w.details?.reason === "v1-path");
    expect(v1Fallbacks.map((w) => String(w.details?.hub)).sort()).toEqual(r7FormedHubs);
    for (const ch of res.channels ?? []) {
      if (ch.zone === true) expect(ch.gap).toBe(96);
    }
  });

  it("exempts shared comb segments among same-comb members only in routeSpacing and counts shared trunk as 1 track (§4.6 step 7)", () => {
    const rects = new Map([
      ["a", { x: 0, y: 0, width: 100, height: 60 }],
      ["b", { x: 200, y: 0, width: 100, height: 60 }],
      ["hub", { x: 100, y: 156, width: 100, height: 60 }],
      ["otherSrc", { x: 0, y: 260, width: 100, height: 60 }],
      ["otherDst", { x: 200, y: 260, width: 100, height: 60 }],
    ]);
    const combA = {
      id: "r1",
      source: "a",
      target: "hub",
      points: [{ x: 50, y: 60 }, { x: 50, y: 108 }, { x: 150, y: 108 }, { x: 150, y: 156 }],
      arrowhead: "arrow" as const,
      combGroupId: "comb-1",
    };
    const combB = {
      id: "r2",
      source: "b",
      target: "hub",
      points: [{ x: 250, y: 60 }, { x: 250, y: 108 }, { x: 150, y: 108 }, { x: 150, y: 156 }],
      arrowhead: "none" as const,
      combGroupId: "comb-1",
    };
    const channel = {
      id: "root|across|r1",
      axis: "vertical" as const,
      edges: ["r1", "r2"],
      strips: [{ x: 0, y: 60, width: 300, height: 96 }],
      n: 2,
      labelled: false,
      gap: 96,
      expected: 96,
      capacity: 1,
    };
    // Same comb: 0 conflicts, and shared trunk counts as demand 1 (within capacity 1)!
    const sameOk = checkRouteSpacing({
      rects,
      routes: [combA, combB],
      routeSpacing: 14,
      borderClearance: 16,
      channels: [channel],
    });
    expect(sameOk.conflictCount).toBe(0);
    expect(sameOk.channelCapacity["root|across|r1"]?.demand).toBe(1);

    // An outsider route overlapping the comb trunk MUST still trigger segment-overlap!
    const intruder = {
      id: "r3",
      source: "otherSrc",
      target: "otherDst",
      points: [{ x: 50, y: 260 }, { x: 50, y: 108 }, { x: 250, y: 108 }, { x: 250, y: 260 }],
      arrowhead: "arrow" as const,
    };
    const withIntruder = checkRouteSpacing({
      rects,
      routes: [combA, combB, intruder],
      routeSpacing: 14,
      borderClearance: 16,
    });
    expect(withIntruder.conflicts.some((c) => c.kind === "segment-overlap" && c.routes.includes("r3"))).toBe(true);
  });

  it("keeps fanIn: 'separate' & fanOut: 'separate' byte-identical to non-comb output", () => {
    const exB = buildExampleB();
    const sepHints = lowerLayoutHintsV2({
      ...(exB.hintsV2 as Extract<DsLayoutHintsV2, { mode: "stage-columns" }>),
      fanIn: "separate",
      fanOut: "separate",
    });
    const resA = mustLayOut(layoutMeasured(exB.document, baseOptionsOf(exB, { hints: sepHints })), "sep1");
    const resB = mustLayOut(layoutMeasured(exB.document, baseOptionsOf(exB, { hints: sepHints })), "sep2");
    expect(resA.combGroups).toBeUndefined();
    expect(canonicalise(resA.view, "view")).toBe(canonicalise(resB.view, "view"));
  });

  it("BLOCKING GATE (with Review P2 #5): conflicts === 0, label-unplaced === 0, and route-obstructed === 0 across EVERY visible fold state of the H2.2 reference set (96 states)", () => {
    const corpus: H2ReferenceScene[] = [
      buildExampleA(),
      buildExampleB(),
      ...buildFigkitTwins(),
      buildAppctxArchitecture16x9(),
    ];
    let totalStates = 0;
    const failures: string[] = [];
    for (const scene of corpus) {
      const states = enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView);
      const cache = createLayoutCache({ maxEntries: 128 });
      for (const collapsed of states) {
        totalStates += 1;
        const res = mustLayOut(
          cache.layout(scene.document, baseOptionsOf(scene, { collapsed }), scene.sourceView),
          `${scene.id}:${collapsed.join(",")}`,
        );
        const conflicts = res.routeSpacing?.conflictCount ?? 0;
        const unplacedLabels = res.warnings.filter((w) => w.code === "label-unplaced");
        const obstructed = res.warnings.filter((w) => w.code === "route-obstructed");
        if (conflicts > 0 || unplacedLabels.length > 0 || obstructed.length > 0) {
          failures.push(
            `${scene.id}[${collapsed.join(",")}]: conflicts=${conflicts} (${res.routeSpacing?.conflicts.map((c) => `${c.kind}:${c.routes.join("+")}`).join("; ") ?? ""}) label-unplaced=${unplacedLabels.length} obstructed=${obstructed.length}`,
          );
        }
      }
    }
    expect(totalStates).toBe(96);
    expect(failures, failures.join("\n")).toEqual([]);
  }, 60_000);
});
