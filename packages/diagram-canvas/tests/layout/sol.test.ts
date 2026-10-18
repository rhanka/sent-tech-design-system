/**
 * Sol review regressions (SPEC §10.5 L-R10): the two defects sol xhigh
 * reproduced with the tests' measurer, default metrics and `targetWidth=8000`
 * (lengths are repetitions of `L`). Both scenarios fail on HEAD — an
 * `label-unplaced` warning and, for the first, a blown-up width — and pass
 * after the fix. Every view is validated by `diagram-core` inside `lay()`.
 */
import { relationRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_LAYOUT_METRICS,
  bendCount,
  rectsIntersect,
  type Rect,
  type Vec2,
} from "../../src/index.js";
import {
  WIDE,
  buildDocument,
  centreOf,
  isOrthogonal,
  lay,
  measure,
  minimalBends,
  rectOf,
  replayLabelBoxes,
  replayUnheldLabels,
  routeOf,
  sharesSegment,
  sideOfPoint,
} from "./fixtures.js";

const L = (count: number): string => "L".repeat(count);
const first = (route: readonly Vec2[]): Vec2 => route[0]!;
const last = (route: readonly Vec2[]): Vec2 => route[route.length - 1]!;

/** A label box padded by `labelMargin`, as L-R10's hold test sees it. */
const padded = (box: Rect): Rect => {
  const margin = DEFAULT_LAYOUT_METRICS.labelMargin;
  return { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin };
};

describe("sol finding 1 — repeated widening of a segment that stays fixed", () => {
  // Four nodes, `k` holding `n0,n1`; `r0:n3→n1` unlabeled, `r2:n2→n3` (24),
  // `r4:n0→n2` (7), `r5:n0→n2` (15). `origin/main` places every label in
  // 745 px; HEAD reaches 1 409 px and reports `r5` unplaced: the engine asked
  // several times for 8 px on a terminal segment fixed by `clearance`, moving
  // both ends together. The fix abandons widenings that lengthen nothing and
  // tries another spacing instead.
  const document = buildDocument({
    nodes: ["n0", "n1", "n2", "n3"],
    containers: { k: ["n0", "n1"] },
    links: [["r0", "n3", "n1"], ["r2", "n2", "n3", L(24)], ["r4", "n0", "n2", L(7)], ["r5", "n0", "n2", L(15)]],
  });

  it("places every label in the lexicographic width (429c92a2)", () => {
    // `429c92a2` routes lexicographically (bends, weighted length) instead of
    // the `BEND = 10^7` scalar: the same labels now fit in 464 px, not 745.
    const { fit, warnings } = lay(document, 8000);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("left-to-right");
    expect(fit.width).toBe(464);
    expect(fit.height).toBe(174);
  });

  it("the renderer replay holds every label on the final geometry", () => {
    const { view } = lay(document, 8000);
    expect(replayUnheldLabels(document, view, measure)).toEqual([]);
    const boxes = replayLabelBoxes(document, view, measure);
    expect([...boxes.keys()].sort()).toEqual([relationRef("r2"), relationRef("r4"), relationRef("r5")].sort());
  });

  it("post-widening, labels clear every node, title band and other label", () => {
    const { view } = lay(document, 8000);
    const boxes = replayLabelBoxes(document, view, measure);
    const titleBand = (id: string): Rect => {
      const rect = rectOf(view, id);
      const height = measure(id, "container-title").height + 2 * DEFAULT_LAYOUT_METRICS.titlePaddingY;
      return { x: rect.x, y: rect.y, width: rect.width, height };
    };
    const shapes: Rect[] = ["n0", "n1", "n2", "n3"].map((id) => rectOf(view, id));
    shapes.push(titleBand("k"));
    const entries = [...boxes.entries()];
    for (const [id, box] of entries) {
      for (const shape of shapes) expect(rectsIntersect(padded(box), shape), `${id}`).toBe(false);
      for (const [other, otherBox] of entries) {
        if (other !== id) expect(rectsIntersect(padded(box), otherBox), `${id} vs ${other}`).toBe(false);
      }
    }
  });

  it("post-widening, docking, routing and separation still hold", () => {
    const { view } = lay(document, 8000);
    // L-R2: the parallel pair takes distinct symmetric slots at both ends.
    // `n0`'s west side holds the pair alone; `n2`'s east side holds the pair
    // with `r2`'s source, ordered by the other end's centre (`r2` first).
    const r4 = routeOf(view, "r4");
    const r5 = routeOf(view, "r5");
    const r2 = routeOf(view, "r2");
    expect(sideOfPoint(rectOf(view, "n0"), first(r4))).toBe("west");
    expect(sideOfPoint(rectOf(view, "n0"), first(r5))).toBe("west");
    expect(sideOfPoint(rectOf(view, "n2"), last(r4))).toBe("east");
    expect(sideOfPoint(rectOf(view, "n2"), last(r5))).toBe("east");
    expect(sideOfPoint(rectOf(view, "n2"), first(r2))).toBe("east");
    const n0 = centreOf(rectOf(view, "n0"));
    const n2 = centreOf(rectOf(view, "n2"));
    expect(first(r4).y + first(r5).y).toBe(2 * n0.y);
    expect(first(r2).y + last(r4).y + last(r5).y).toBe(3 * n2.y);
    // L-R9: the parallel routes never share a segment.
    expect(sharesSegment(r4, r5)).toBe(false);
    // L-R1/L-R8/L-R3: every end docks on a side, every route is orthogonal
    // with the oracle's minimum bend count on the final geometry.
    const ends: Readonly<Record<string, readonly [string, string]>> = {
      r0: ["n3", "n1"],
      r2: ["n2", "n3"],
      r4: ["n0", "n2"],
      r5: ["n0", "n2"],
    };
    const obstacles = ["n0", "n1", "n2", "n3"].map((id) => rectOf(view, id));
    for (const [relation, [source, target]] of Object.entries(ends)) {
      const route = routeOf(view, relation);
      expect(sideOfPoint(rectOf(view, source), first(route)), `${relation} source`).toBeDefined();
      expect(sideOfPoint(rectOf(view, target), last(route)), `${relation} target`).toBeDefined();
      expect(isOrthogonal(route), relation).toBe(true);
      expect(bendCount(route), relation).toBe(
        minimalBends(first(route), rectOf(view, source), last(route), rectOf(view, target), obstacles, DEFAULT_LAYOUT_METRICS.clearance),
      );
    }
  });

  it("stays placed with room to spare and when shuffled", () => {
    expect(lay(document, WIDE).warnings).toEqual([]);
  });
});

describe("sol finding 2 — return edges use the wrong ranks for label lanes", () => {
  // `k` holding `n0,n1`; `r0:n0→n2` (20), `r2:n1→n3` (14), `r3:n3→n0` (21),
  // `r5:n2→n1` (13). HEAD declares `r5` unplaceable because `lanesBetween`
  // looks for sources at rank `r` and targets at rank `r+1`, which fails for
  // the cycle's return edges. Widening only the `n2`–`n3` interval by 16.5 px
  // places all four labels with no larger drawing: the fix reads each end's
  // geometric member and rank instead of its source/target role.
  const document = buildDocument({
    nodes: ["n0", "n1", "n2", "n3"],
    containers: { k: ["n0", "n1"] },
    links: [["r0", "n0", "n2", L(20)], ["r2", "n1", "n3", L(14)], ["r3", "n3", "n0", L(21)], ["r5", "n2", "n1", L(13)]],
  });

  it("places every label with no larger drawing", () => {
    // `0b785150` evaluates T-sibling even without a canonical gap (no early
    // return): `r5`'s gapless segment requests the `n0`–`n1` sibling widening
    // (14.5 px) on top of the `n2`–`n3` one, so the drawing stands 216.5 px
    // tall instead of 202 — still 315 px wide, every label placed, converging
    // in fewer attempts.
    const { fit, warnings } = lay(document, 8000);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("left-to-right");
    expect(fit.width).toBe(315);
    expect(fit.height).toBe(216.5);
  });

  it("the renderer replay holds every label and the routes stay minimal", () => {
    const { view } = lay(document, 8000);
    expect(replayUnheldLabels(document, view, measure)).toEqual([]);
    const ends: Readonly<Record<string, readonly [string, string]>> = {
      r0: ["n0", "n2"],
      r2: ["n1", "n3"],
      r3: ["n3", "n0"],
      r5: ["n2", "n1"],
    };
    const obstacles = ["n0", "n1", "n2", "n3"].map((id) => rectOf(view, id));
    for (const [relation, [source, target]] of Object.entries(ends)) {
      const route = routeOf(view, relation);
      expect(isOrthogonal(route), relation).toBe(true);
      expect(bendCount(route), relation).toBe(
        minimalBends(first(route), rectOf(view, source), last(route), rectOf(view, target), obstacles, DEFAULT_LAYOUT_METRICS.clearance),
      );
    }
  });
});
