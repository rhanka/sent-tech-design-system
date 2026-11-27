import {
  canonicalise,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DS_LAYOUT_V2_VOCABULARY,
  DS_LAYOUT_VOCABULARY,
  entityRef,
  lowerLayoutHints,
  lowerLayoutHintsV2,
  occurrenceRef,
  type DsLayoutHintsV2,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  createLayoutCache,
  isR7ConnectorPresentation,
  layoutMeasured,
} from "../../../src/index.js";
import { buildExampleA, buildGenericScene, type H2Presentation } from "./fixtures/referenceSet.js";

function toV1Presentation(presentation: H2Presentation): H2Presentation {
  const entities = Object.fromEntries(
    Object.entries(presentation.entities).map(([id, entry]) => {
      const { anatomy: _a, ...rest } = entry;
      return [id, rest];
    }),
  );
  return {
    contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
    entities,
    legends: {},
    categoryTokens: [],
  };
}

describe("H2.3 emitted gutters, strips and zoneRule on both routing paths", () => {
  it("emits usable strips interrupted by spanning cells and clipped strictly to the gutter next to holes", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "b1", items: [entityRef("span-top"), entityRef("r1c3")] },
            { id: "b2", items: [entityRef("r2c1"), entityRef("r2c3")] }, // hole at (b2, s2)
          ],
          cells: {
            [entityRef("span-top")]: { column: "s1", to_column: "s2" },
            [entityRef("r1c3")]: { column: "s3" },
            [entityRef("r2c1")]: { column: "s1" },
            [entityRef("r2c3")]: { column: "s3" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "gutter-strips",
      carries: ["H2.3"],
      hintsV2,
      entities: [
        { id: "span-top", title: "Top Span" },
        { id: "r1c3", title: "Top Right" },
        { id: "r2c1", title: "Bottom Left" },
        { id: "r2c3", title: "Bottom Right" },
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
    const root = res.composition!.grids["root"]!;
    const s1 = root.columns[0]!;
    const s2 = root.columns[1]!;
    const b2 = root.bands[1]!;

    // Boundary s1|s2 is crossed by span-top in b1 -> only 1 strip (in b2), clipped strictly to [s1.end, s2.start]
    const gS1 = res.channels!.find((c) => c.id === "root|along|s1")!;
    expect(gS1).toBeDefined();
    expect(gS1.gap).toBe(96);
    expect(gS1.zone).toBe(false);
    expect(gS1.strips).toHaveLength(1);
    expect(gS1.strips[0]).toEqual({
      x: s1.start + s1.size,
      y: b2.start,
      width: 96,
      height: b2.size,
    });

    // Boundary s2|s3 has hole on left in b2 -> strip stays clipped strictly to gutter width 96, not expanding into hole
    const gS2 = res.channels!.find((c) => c.id === "root|along|s2")!;
    expect(gS2.strips).toHaveLength(1);
    expect(gS2.strips[0]!.x).toBe(s2.start + s2.size);
    expect(gS2.strips[0]!.width).toBe(96);
    expect(gS2.strips[0]!.height).toBe(b2.start + b2.size - root.bands[0]!.start);
  });

  it("Review P2: tests sibling-zone, mixed zone/leaf, and leaf/leaf grid boundaries on BOTH r7 and v1 routing paths", () => {
    // 4 stage columns: [z1 (zone), z2 (zone), leaf1 (leaf), leaf2 (leaf)]
    // Long labels crossing z1->z2 (sibling-zone), z2->leaf1 (mixed zone/leaf), leaf1->leaf2 (leaf/leaf).
    // Grid rule (§4.3 step 5): boundary is a zone gutter when EITHER track holds a container ->
    //   s1|s2 (zone|zone): fixed at zoneGutter (96), never widens.
    //   s2|s3 (zone|leaf): fixed at zoneGutter (96), never widens.
    //   s3|s4 (leaf|leaf): card gap (96 base), widens when a long label sits in it.
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3", "s4"],
          transverse_bands: [
            { id: "row1", items: [entityRef("z1"), entityRef("z2"), entityRef("leaf1"), entityRef("leaf2")] },
            { id: "row2", items: [entityRef("leaf3"), entityRef("leaf4")] },
          ],
          cells: {
            [entityRef("z1")]: { column: "s1" },
            [entityRef("z2")]: { column: "s2" },
            [entityRef("leaf1")]: { column: "s3" },
            [entityRef("leaf2")]: { column: "s4" },
            [entityRef("leaf3")]: { column: "s3" },
            [entityRef("leaf4")]: { column: "s4" },
          },
        },
      },
    };
    const r7Scene = buildGenericScene({
      id: "mixed-zone-gutters",
      carries: ["H2.3", "REQ-R7-14"],
      hintsV2,
      entities: [
        { id: "z1", container: true, title: "Zone One" },
        { id: "z1-a", parent: "z1", title: "Alpha" },
        { id: "z2", container: true, title: "Zone Two" },
        { id: "z2-a", parent: "z2", title: "Beta" },
        { id: "leaf1", title: "Leaf One" },
        { id: "leaf2", title: "Leaf Two" },
        { id: "leaf3", title: "Leaf Three" },
        { id: "leaf4", title: "Leaf Four" },
      ],
      relations: [
        { id: "r-zz", source: "z1-a", target: "z2-a", label: "very long sibling zone label text" },
        { id: "r-zl", source: "z2-a", target: "leaf1", label: "very long mixed zone leaf label" },
        { id: "r-ll", source: "leaf1", target: "leaf2", label: "wide leaf to leaf bridge label" },
        { id: "r-ll2", source: "leaf3", target: "leaf4", label: "second wide leaf bridge label" },
      ],
    });
    const v1Presentation = toV1Presentation(r7Scene.presentation);
    expect(isR7ConnectorPresentation(r7Scene.presentation, undefined, r7Scene.document)).toBe(true);
    expect(isR7ConnectorPresentation(v1Presentation, undefined, r7Scene.document)).toBe(false);

    for (const [label, presentation] of [["r7", r7Scene.presentation], ["v1", v1Presentation]] as const) {
      const res = layoutMeasured(r7Scene.document, {
        registry: r7Scene.registry,
        bindings: r7Scene.bindings,
        presentation,
        measureLines: r7Scene.measureLines,
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 1440,
        hints: r7Scene.hints,
      });
      expect(res.status, label).toBe("laid-out");
      if (res.status !== "laid-out") continue;

      const chZZ = res.channels!.find((c) => c.id === "root|along|s1")!;
      const chZL = res.channels!.find((c) => c.id === "root|along|s2")!;
      const chLL = res.channels!.find((c) => c.id === "root|along|s3")!;
      const chAcross = res.channels!.find((c) => c.id === "root|across|row1")!;

      // Sibling-zone boundary: zone=true, fixed at 96, never widened
      expect(chZZ.zone, `${label} s1|s2 zone`).toBe(true);
      expect(chZZ.gap, `${label} s1|s2 gap`).toBe(96);
      expect(chZZ.expected, `${label} s1|s2 expected`).toBe(96);

      // Mixed zone|leaf boundary: zone=true under grid rule, fixed at 96, never widened
      expect(chZL.zone, `${label} s2|s3 zone`).toBe(true);
      expect(chZL.gap, `${label} s2|s3 gap`).toBe(96);
      expect(chZL.expected, `${label} s2|s3 expected`).toBe(96);

      // Leaf|leaf boundary: zone=false, widens for traffic/labels above 96
      expect(chLL.zone, `${label} s3|s4 zone`).toBe(false);
      expect(chLL.gap, `${label} s3|s4 widens`).toBeGreaterThan(96);

      // Band boundary row1|row2: row1 holds z1 and z2 -> zone=true, fixed at 96 (not 72)
      expect(chAcross.zone, `${label} row1|row2 zone`).toBe(true);
      expect(chAcross.gap, `${label} row1|row2 gap`).toBe(96);
    }
  });

  it("keeps zone gutters fixed on a v1-path twin of Example A, changes cache key on zoneGutter metric, and keeps auto-pack @1 untouched", () => {
    const example = buildExampleA();
    const v1Presentation = toV1Presentation(example.presentation);
    expect(isR7ConnectorPresentation(v1Presentation, undefined, example.document)).toBe(false);

    const baseOpts = {
      registry: example.registry,
      bindings: example.bindings,
      presentation: v1Presentation,
      measureLines: example.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: example.hints,
    };
    const res = layoutMeasured(example.document, baseOpts);
    expect(res.status).toBe("laid-out");
    if (res.status !== "laid-out") return;

    // Peripheral column `tools` holds container `entity:tools` -> tools|s1 boundary is a zone gutter = 96
    const toolsBoundary = res.channels!.find((c) => c.id === "root|along|tools")!;
    expect(toolsBoundary.zone).toBe(true);
    expect(toolsBoundary.gap).toBe(96);
    expect(toolsBoundary.expected).toBe(96);

    // Changing zoneGutter metric changes the cache key and moves the boundary width on v1 path
    const cache = createLayoutCache();
    cache.layout(example.document, baseOpts);
    const widerOpts = { ...baseOpts, metrics: { zoneGutter: 128 } };
    expect(cache.has(example.document, widerOpts)).toBe(false);
    const widerRes = cache.layout(example.document, widerOpts);
    expect(widerRes.status).toBe("laid-out");
    if (widerRes.status === "laid-out") {
      expect(widerRes.channels!.find((c) => c.id === "root|along|tools")!.gap).toBe(128);
    }

    // Same v1 scene under @2 auto-pack (no composition) stays byte-identical to @1
    const v1AutoPack = layoutMeasured(example.document, {
      ...baseOpts,
      hints: lowerLayoutHints({ vocabulary: DS_LAYOUT_VOCABULARY, mode: "auto-pack" }),
    });
    const v2AutoPack = layoutMeasured(example.document, {
      ...baseOpts,
      hints: lowerLayoutHintsV2({ vocabulary: DS_LAYOUT_V2_VOCABULARY, mode: "auto-pack" }),
    });
    expect(v1AutoPack.status).toBe("laid-out");
    expect(v2AutoPack.status).toBe("laid-out");
    if (v1AutoPack.status === "laid-out" && v2AutoPack.status === "laid-out") {
      expect(canonicalise(v2AutoPack.view, "view")).toBe(canonicalise(v1AutoPack.view, "view"));
    }
  });

  it("V-S8 (REQ-R7-34 / DE3-L6a1): caps pass-2 vertical non-zone widening at 144 under zoneRule while keeping gapMinBlock = 72 and v1 (!zoneRule) at 240", () => {
    // 6 labelled vertical edges (3 per pair, non-crossing) with trackSpacingBlock=28 ask channelGap for
    // 8 + 6*28 + 30 = 206 px (> 144, <= 240) across the band boundary.
    const relations = Array.from({ length: 6 }, (_, idx) => ({
      id: `e${String(idx + 1)}`,
      source: idx % 2 === 0 ? "t1" : "t2",
      target: idx % 2 === 0 ? "d1" : "d2",
      label: `l${String(idx + 1)}`,
    }));

    const r7Hints: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2"],
          transverse_bands: [
            { id: "b1", items: [entityRef("t1"), entityRef("t2")] },
            { id: "b2", items: [entityRef("d1"), entityRef("d2")] },
          ],
          cells: {
            [entityRef("t1")]: { column: "s1" },
            [entityRef("t2")]: { column: "s2" },
            [entityRef("d1")]: { column: "s1" },
            [entityRef("d2")]: { column: "s2" },
          },
        },
      },
    };
    const r7Scene = buildGenericScene({
      id: "vs8-vertical-cap-r7",
      carries: ["V-S8", "REQ-R7-34"],
      hintsV2: r7Hints,
      entities: [
        { id: "t1", title: "Top Left" },
        { id: "t2", title: "Top Right" },
        { id: "d1", title: "Bottom Left" },
        { id: "d2", title: "Bottom Right" },
      ],
      relations,
    });
    // 1. r7 (@2 composed, zoneRule = true): vertical non-zone gutter widens past 72 but caps at 144
    const r7Res = layoutMeasured(r7Scene.document, {
      registry: r7Scene.registry,
      bindings: r7Scene.bindings,
      presentation: r7Scene.presentation,
      measureLines: r7Scene.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: r7Scene.hints,
      metrics: { trackSpacingBlock: 28 },
    });
    expect(r7Res.status).toBe("laid-out");
    if (r7Res.status !== "laid-out") return;
    const r7Across = r7Res.channels!.find((c) => c.id === "root|across|b1")!;
    expect(r7Across).toBeDefined();
    expect(r7Across.zone).toBe(false);
    expect(r7Across.gap).toBeGreaterThan(72);
    expect(r7Across.gap).toBeLessThanOrEqual(144);
    expect(r7Across.expected).toBeLessThanOrEqual(144);

    // 2. Unlabelled r7 pair keeps gapMinBlock = 72 unchanged (A9: never add base vertical space)
    const unlabelledScene = buildGenericScene({
      id: "vs8-unlabelled-r7",
      carries: ["V-S9", "REQ-R7-34"],
      hintsV2: r7Hints,
      entities: [
        { id: "t1", title: "Top Left" },
        { id: "t2", title: "Top Right" },
        { id: "d1", title: "Bottom Left" },
        { id: "d2", title: "Bottom Right" },
      ],
      relations: [],
    });
    const unlabelledRes = layoutMeasured(unlabelledScene.document, {
      registry: unlabelledScene.registry,
      bindings: unlabelledScene.bindings,
      presentation: unlabelledScene.presentation,
      measureLines: unlabelledScene.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: unlabelledScene.hints,
    });
    expect(unlabelledRes.status).toBe("laid-out");
    if (unlabelledRes.status === "laid-out") {
      expect(unlabelledRes.channels!.find((c) => c.id === "root|across|b1")!.gap).toBe(72);
    }

    // 3. v1 (!zoneRule, @1 auto-pack): identical corridor demand widens past 144 up to 240
    const v1Scene = buildGenericScene({
      id: "vs8-vertical-cap-v1",
      carries: ["V-S8", "REQ-R7-28"],
      anatomy: "v1",
      hintsV2: r7Hints,
      entities: [
        { id: "t1", title: "Top Left" },
        { id: "t2", title: "Top Right" },
        { id: "d1", title: "Bottom Left" },
        { id: "d2", title: "Bottom Right" },
      ],
      relations,
    });
    const v1Presentation = toV1Presentation(v1Scene.presentation);
    expect(isR7ConnectorPresentation(v1Presentation, undefined, v1Scene.document)).toBe(false);
    const v1Res = layoutMeasured(v1Scene.document, {
      registry: v1Scene.registry,
      bindings: v1Scene.bindings,
      presentation: v1Presentation,
      measureLines: v1Scene.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 800,
      hints: lowerLayoutHints({
        vocabulary: DS_LAYOUT_VOCABULARY,
        mode: "order",
        order: [entityRef("t1"), entityRef("t2"), entityRef("d1"), entityRef("d2")],
      }),
      metrics: { trackSpacingBlock: 28 },
    });
    expect(v1Res.status).toBe("laid-out");
    if (v1Res.status === "laid-out") {
      const topRect = v1Res.view.entityOccurrences[occurrenceRef("e.t1")]!.geometry;
      const bottomRect = v1Res.view.entityOccurrences[occurrenceRef("e.d1")]!.geometry;
      const [upper, lower] = topRect.y <= bottomRect.y ? [topRect, bottomRect] : [bottomRect, topRect];
      const v1Gap = lower.y - (upper.y + upper.height);
      expect(v1Gap).toBeGreaterThan(144);
      expect(v1Gap).toBeLessThanOrEqual(240);
    }
  });
});
