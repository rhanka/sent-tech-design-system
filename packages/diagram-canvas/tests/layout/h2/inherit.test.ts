import { entityRef, lowerLayoutHintsV2, occurrenceRef, type DsLayoutHintsV2 } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutMeasured, type Rect } from "../../../src/index.js";
import {
  buildAll13ReferenceScenes,
  buildExampleB,
  buildFigkitTwins,
  buildGenericScene,
  type H2ReferenceScene,
} from "./fixtures/referenceSet.js";

const TOL = 1 / 64;
const centerX = (r: Rect): number => r.x + r.width / 2;

function lay(scene: H2ReferenceScene) {
  const res = layoutMeasured(scene.document, {
    registry: scene.registry,
    bindings: scene.bindings,
    presentation: scene.presentation,
    measureLines: scene.measureLines,
    measureText: () => ({ width: 80, height: 20 }),
    targetWidth: 1440,
    hints: scene.hints,
  });
  expect(res.status, scene.id).toBe("laid-out");
  if (res.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(res.refusals)}`);
  return res;
}

describe("H2.4 stage_columns: 'inherit' (shared columns, insets, chains)", () => {
  it("aligns both layer zones of Example B on the same 5 column axes within 1/64 px", () => {
    const scene = buildExampleB();
    const res = lay(scene);
    const geom = (local: string) => res.view.entityOccurrences[occurrenceRef(`e.${local}`)]!.geometry;

    const layerA = geom("layer-a");
    const layerB = geom("layer-b");
    const ax = geom("ax");
    const ay = geom("ay");
    const b1 = geom("b1");
    const b2 = geom("b2");
    const b5 = geom("b5");

    // Both layers share the exact same outer horizontal span s1..s5
    expect(Math.abs(layerA.x - layerB.x)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(layerA.width - layerB.width)).toBeLessThanOrEqual(TOL);

    // All 5 columns of layer-b (b1..b5 and c1..c4) align with root stage columns s1..s5 within 1/64 px
    const rootCols = res.composition!.grids["root"]!.columns;
    for (const [k, id] of ["b1", "b2", "b3", "b4", "b5"].entries()) {
      const col = rootCols[k]!;
      expect(Math.abs(centerX(geom(id)) - (col.start + col.size / 2)), id).toBeLessThanOrEqual(TOL);
    }
    for (const [k, id] of ["c1", "c2", "c3", "c4"].entries()) {
      const col = rootCols[k]!;
      expect(Math.abs(centerX(geom(id)) - (col.start + col.size / 2)), id).toBeLessThanOrEqual(TOL);
    }

    // Column s5 centre of ay (layer-a) equals column s5 centre of b5 (layer-b)
    expect(Math.abs(centerX(ay) - centerX(b5))).toBeLessThanOrEqual(TOL);

    // Upper card ax spanning s1..s2 is centred on the shared s1..s2 span midpoint (symmetric inset per §1.4)
    const s1 = rootCols[0]!;
    const s2 = rootCols[1]!;
    const s12Mid = (s1.start + (s2.start + s2.size)) / 2;
    expect(Math.abs(centerX(ax) - s12Mid)).toBeLessThanOrEqual(TOL);
    // And ax overlaps both b1 and b2 horizontally (T-12 vertical drop zone)
    expect(ax.x).toBeLessThan(b1.x + b1.width);
    expect(ax.x + ax.width).toBeGreaterThan(b2.x);

    // All items stay strictly inside their container's content box (16 px inset)
    for (const item of [ax, ay]) {
      expect(item.x).toBeGreaterThanOrEqual(layerA.x + 16 - TOL);
      expect(item.x + item.width).toBeLessThanOrEqual(layerA.x + layerA.width - 16 + TOL);
    }
    for (const id of ["b1", "b2", "b3", "b4", "b5", "c1", "c2", "c3", "c4"]) {
      const item = geom(id);
      expect(item.x, id).toBeGreaterThanOrEqual(layerB.x + 16 - TOL);
      expect(item.x + item.width, id).toBeLessThanOrEqual(layerB.x + layerB.width - 16 + TOL);
    }
  });

  it("aligns a root card under an inheriting zone on the exact shared column centre (T-55, T-56)", () => {
    const twins = buildFigkitTwins();
    for (const [id, innerColEntity] of [
      ["archi-applicative", "a-1-s2"],
      ["archi-technologique", "a-1-s3"],
    ] as const) {
      const scene = twins.find((s) => s.id === id)!;
      const res = lay(scene);
      const card = res.view.entityOccurrences[occurrenceRef("e.card")]!.geometry;
      const inner = res.view.entityOccurrences[occurrenceRef(`e.${innerColEntity}`)]!.geometry;
      expect(Math.abs(centerX(card) - centerX(inner)), id).toBeLessThanOrEqual(TOL);
    }
  });

  it("keeps justify start/end/stretch inside K's content box, preserves shared axes for center/stretch, and reserves edge inset for spanning items (§1.4, §4.3 step 3)", () => {
    const hintsV2: DsLayoutHintsV2 = {
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          stage_columns: ["s1", "s2", "s3"],
          transverse_bands: [
            { id: "r1", items: [entityRef("wide-s1"), entityRef("wide-s3")] },
            { id: "r2", items: [entityRef("k")] },
          ],
          cells: {
            [entityRef("wide-s1")]: { column: "s1" },
            [entityRef("wide-s3")]: { column: "s3" },
            [entityRef("k")]: { column: "s1", to_column: "s3" },
          },
        },
        [entityRef("k")]: {
          stage_columns: "inherit",
          transverse_bands: [
            { id: "k1", items: [entityRef("k-start"), entityRef("k-center"), entityRef("k-end")] },
            { id: "k2", items: [entityRef("k-stretch"), entityRef("k-span")] },
          ],
          cells: {
            [entityRef("k-start")]: { column: "s1", justify: "start" },
            [entityRef("k-center")]: { column: "s2", justify: "center" },
            [entityRef("k-end")]: { column: "s3", justify: "end" },
            [entityRef("k-stretch")]: { column: "s1", justify: "stretch" },
            [entityRef("k-span")]: { column: "s2", to_column: "s3", justify: "center" },
          },
        },
      },
    };
    const scene = buildGenericScene({
      id: "inherit-slot-align",
      carries: ["H2.4"],
      hintsV2,
      entities: [
        { id: "wide-s1", container: true, title: "Wide Column One Zone" },
        { id: "ws1-a", parent: "wide-s1", title: "A" },
        { id: "ws1-b", parent: "wide-s1", title: "B" },
        { id: "wide-s3", container: true, title: "Wide Column Three Zone" },
        { id: "ws3-a", parent: "wide-s3", title: "C" },
        { id: "ws3-b", parent: "wide-s3", title: "D" },
        { id: "k", container: true, title: "Inheriting Zone" },
        { id: "k-start", parent: "k", title: "Start Leaf" },
        { id: "k-center", parent: "k", title: "Center Leaf" },
        { id: "k-end", parent: "k", title: "End Leaf" },
        { id: "k-stretch", container: true, parent: "k", title: "Stretched Inner Zone" },
        { id: "ks-1", parent: "k-stretch", title: "Inside" },
        { id: "k-span", container: true, parent: "k", title: "Wide Spanning Inner Container Over Two Columns" },
        { id: "ksp-1", parent: "k-span", title: "Span Child 1" },
        { id: "ksp-2", parent: "k-span", title: "Span Child 2" },
        { id: "ksp-3", parent: "k-span", title: "Span Child 3" },
      ],
      relations: [],
    });
    const res = lay(scene);
    const geom = (local: string) => res.view.entityOccurrences[occurrenceRef(`e.${local}`)]!.geometry;
    const k = geom("k");
    const rootCols = res.composition!.grids["root"]!.columns;
    const s1 = rootCols[0]!;
    const s2 = rootCols[1]!;
    const s3 = rootCols[2]!;

    const kStart = geom("k-start");
    const kCenter = geom("k-center");
    const kEnd = geom("k-end");
    const kStretch = geom("k-stretch");
    const kSpan = geom("k-span");

    // Start, end, stretch, and spanning items all stay strictly inside K's content box [k.x+16, k.x+k.width-16]
    expect(kStart.x).toBeGreaterThanOrEqual(k.x + 16 - TOL);
    expect(kEnd.x + kEnd.width).toBeLessThanOrEqual(k.x + k.width - 16 + TOL);
    expect(kStretch.x).toBeGreaterThanOrEqual(k.x + 16 - TOL);
    expect(kStretch.x + kStretch.width).toBeLessThanOrEqual(s1.start + s1.size - 16 + TOL);
    expect(kSpan.x + kSpan.width).toBeLessThanOrEqual(k.x + k.width - 16 + TOL);

    // Center and stretch preserve exact shared column axes within 1/64 px
    expect(Math.abs(centerX(kStretch) - (s1.start + s1.size / 2))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(kCenter) - (s2.start + s2.size / 2))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(kSpan) - (s2.start + s3.start + s3.size) / 2)).toBeLessThanOrEqual(TOL);
  });

  it("supports chained inherit (zone inside zone: retro-c) with exact column centres and inset containment", () => {
    const retroC = buildFigkitTwins().find((s) => s.id === "retro-c")!;
    const res = lay(retroC);
    const geom = (local: string) => res.view.entityOccurrences[occurrenceRef(`e.${local}`)]!.geometry;
    const rootCols = res.composition!.grids["root"]!.columns;
    const colMid = (id: string) => {
      const c = rootCols.find((col) => col.id === id)!;
      return c.start + c.size / 2;
    };

    // Depth-2 cards inside nested-a (s3, s4), nested-b (s1, s2), and zone-s (s2, s3, s4) share root column axes
    expect(Math.abs(centerX(geom("a")) - colMid("s1"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("b-1-s1")) - colMid("s1"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("b-1-s2")) - colMid("s2"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("s-1-s2")) - colMid("s2"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("a-1-s3")) - colMid("s3"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("s-1-s3")) - colMid("s3"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("a-1-s4")) - colMid("s4"))).toBeLessThanOrEqual(TOL);
    expect(Math.abs(centerX(geom("s-1-s4")) - colMid("s4"))).toBeLessThanOrEqual(TOL);

    // Every depth-2 card stays strictly inside its immediate container's content box (16px inset)
    const nestedA = geom("nested-a");
    for (const id of ["a-1-s3", "a-1-s4"]) {
      const r = geom(id);
      expect(r.x, id).toBeGreaterThanOrEqual(nestedA.x + 16 - TOL);
      expect(r.x + r.width, id).toBeLessThanOrEqual(nestedA.x + nestedA.width - 16 + TOL);
    }
    const nestedB = geom("nested-b");
    for (const id of ["b-1-s1", "b-1-s2", "b-2-s1"]) {
      const r = geom(id);
      expect(r.x, id).toBeGreaterThanOrEqual(nestedB.x + 16 - TOL);
      expect(r.x + r.width, id).toBeLessThanOrEqual(nestedB.x + nestedB.width - 16 + TOL);
    }
    const zoneK = geom("zone-k");
    for (const id of ["nested-a", "nested-b"]) {
      const r = geom(id);
      expect(r.x, id).toBeGreaterThanOrEqual(zoneK.x + 16 - TOL);
      expect(r.x + r.width, id).toBeLessThanOrEqual(zoneK.x + zoneK.width - 16 + TOL);
    }
  });

  it("refuses inherit when the container's cell is outside a staged grid", () => {
    const base = buildExampleB();
    const badHints = lowerLayoutHintsV2({
      vocabulary: "ds-layout-hints@2",
      mode: "stage-columns",
      grids: {
        root: {
          // unstaged root grid!
          transverse_bands: [{ id: "upper", items: [entityRef("layer-a")] }],
        },
        [entityRef("layer-a")]: {
          stage_columns: "inherit",
          transverse_bands: [{ id: "a1", items: [entityRef("ax")] }],
        },
      },
    });
    const res = layoutMeasured(base.document, {
      registry: base.registry,
      bindings: base.bindings,
      presentation: base.presentation,
      measureLines: base.measureLines,
      measureText: () => ({ width: 80, height: 20 }),
      targetWidth: 1440,
      hints: badHints,
    });
    expect(res.status).toBe("refused");
    if (res.status === "refused") {
      expect(res.refusals.some((r) => r.code === "layout-hint-invalid")).toBe(true);
    }
  });

  it("lays out all 6 §2.1 payloads with inherit (Example B, ref-1, archi-applicative, archi-technologique, retro-b, retro-c) with 0 refusals", () => {
    const inheritIds = new Set(["schema-3", "ref-1", "archi-applicative", "archi-technologique", "retro-b", "retro-c"]);
    const scenes = buildAll13ReferenceScenes().filter((s) => inheritIds.has(s.id));
    expect(scenes).toHaveLength(6);
    for (const scene of scenes) {
      const res = lay(scene);
      expect(res.composition?.grids["root"], scene.id).toBeDefined();
    }
  });
});
