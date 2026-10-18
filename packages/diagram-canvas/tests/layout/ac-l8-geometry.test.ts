/**
 * AC-L8 geometry fixtures (SPEC §10.5 L-R4/L-R5/L-R7 as amended in
 * `0b785150`): the impossible row, the bounds union, and the viewport width.
 * Each fails on `0b51215b` — except the viewport-width contract, which pins
 * unchanged engine behavior at the renderer boundary — and passes after the
 * fix. Every view is validated by `diagram-core` inside `lay()`.
 */
import { relationRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { DEFAULT_LAYOUT_METRICS, type Rect, type Vec2 } from "../../src/index.js";
import {
  buildDocument,
  lay,
  measure,
  rectOf,
  replayLabelBoxes,
  routeOf,
} from "./fixtures.js";

const L = (count: number): string => "L".repeat(count);

/** `xmax − xmin` over entity rectangles, route points and placed label boxes. */
const unionWidth = (rects: readonly Rect[], routes: readonly (readonly Vec2[])[], boxes: readonly Rect[]): number => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  const extend = (from: number, to: number): void => {
    if (from < min) min = from;
    if (to > max) max = to;
  };
  for (const rect of rects) extend(rect.x, rect.x + rect.width);
  for (const route of routes) for (const point of route) extend(point.x, point.x);
  for (const box of boxes) extend(box.x, box.x + box.width);
  return max - min;
};

describe("AC-L8 L-R4 — an impossible row splits into compatible rows", () => {
  // Two same-rank containers `[0,40]`/`[64,104]` joined through a third
  // `[0,104]` of another rank: aligning the triple would superpose the pair,
  // so the component splits — first plus third in one row, second singleton.
  // Here `kA,kB` share rank 0 under the root and `kC` takes rank 1 through the
  // `kA→kC`/`kB→kC` lifts; `kC` spans both in the pre-row geometry (its own
  // old behavior proves the triple overlap: without the split `kB` is
  // stretched into the row). After the fix the first and third align, the
  // second keeps its natural size with the minimum separation restored, no
  // two containers superpose, and no `row-fill-partial` is reported.
  const document = buildDocument({
    nodes: ["a1", "a2", "a3", "b", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
    containers: { kA: ["a1", "a2", "a3"], kB: ["b"], kC: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] },
    links: [
      ["e1", "a1", "a2"],
      ["e2", "a2", "a3"],
      ["e3", "a3", "c1"],
      ["e4", "b", "c2"],
      ["f1", "c1", "c2"],
      ["f2", "c2", "c3"],
      ["f3", "c3", "c4"],
      ["f4", "c4", "c5"],
      ["f5", "c5", "c6"],
      ["f6", "c6", "c7"],
      ["f7", "c7", "c8"],
    ],
  });

  it("aligns the compatible row and leaves the singleton natural", () => {
    const { fit, warnings, view } = lay(document, 8000);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("left-to-right");
    const kA = rectOf(view, "kA");
    const kB = rectOf(view, "kB");
    const kC = rectOf(view, "kC");
    // First plus third: one row, common start and size.
    expect(kA.y).toBe(kC.y);
    expect(kA.height).toBe(kC.height);
    // Second: a singleton row keeps its natural size below, separated by the
    // minimum — without the split it is stretched into the row (94 px).
    expect(kB.height).toBeLessThan(kA.height);
    expect(kB.y).toBeGreaterThanOrEqual(kA.y + kA.height + DEFAULT_LAYOUT_METRICS.nodeGap);
    // No two containers superpose.
    expect(kB.y).toBeGreaterThanOrEqual(kA.y + kA.height);
  });
});

describe("AC-L8 L-R5 — the reported width is the bounds union", () => {
  it("a self-loop route overflowing every rectangle drives the width", () => {
    // One node, one 4-character self-loop, no label to place: the route
    // leaves the 64 px node east to 72 px, so `B` is 72, not 64.
    const document = buildDocument({ nodes: ["n1"], links: [["r1", "n1", "n1", "LLLL"]] });
    const { fit, warnings, view } = lay(document, 8000);
    expect(fit.direction).toBe("left-to-right");
    expect(fit.width).toBe(72);
    expect(fit.width).toBeGreaterThan(rectOf(view, "n1").width);
    expect(fit.zoom).toBe(1);
    expect(fit.pans).toBe(false);
    expect(
      unionWidth([rectOf(view, "n1")], [routeOf(view, "r1")], [...replayLabelBoxes(document, view, measure).values()]),
    ).toBe(fit.width);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([["label-unplaced", relationRef("r1")]]);
  });

  it("a placed label overflowing every rectangle drives the width", () => {
    // A 40-character label on the `a→b` middle segment: the drawing is laid
    // top-to-bottom at 400 px, the 280 px label box stretches past the 64 px
    // entity column on both sides, so `B` is 280, not 64 — and direction,
    // zoom and pan all read from it.
    const document = buildDocument({ nodes: ["a", "b", "c"], links: [["r1", "a", "b", L(40)], ["r2", "b", "c"]] });
    const { fit, warnings, view } = lay(document, 400);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("top-to-bottom");
    expect(fit.width).toBe(280);
    expect(fit.width).toBeGreaterThan(rectOf(view, "a").width);
    expect(fit.zoom).toBe(1);
    expect(fit.pans).toBe(false);
    const boxes = replayLabelBoxes(document, view, measure);
    expect(boxes.has(relationRef("r1"))).toBe(true);
    expect(
      unionWidth(
        ["a", "b", "c"].map((id) => rectOf(view, id)),
        ["r1", "r2"].map((id) => routeOf(view, id)),
        [...boxes.values()],
      ),
    ).toBe(fit.width);
  });
});

describe("AC-L8 L-R7 — the engine lays out at the viewport width", () => {
  // A three-node chain: 304 px left-to-right, 64 px top-to-bottom. A 320 px
  // host whose viewport box measures 300 px lays out at 300 — top-to-bottom —
  // while the same host at a 320 px viewport stays left-to-right. Borders and
  // padding sit outside the measurement; setting the box to exactly the
  // measured width and re-laying out on change is the renderer's part.
  const document = buildDocument({ nodes: ["a", "b", "c"], links: [["c1", "a", "b"], ["c2", "b", "c"]] });

  it("chooses at 300 px, not at the 320 px host width", () => {
    const host = lay(document, 320);
    expect(host.fit.direction).toBe("left-to-right");
    expect(host.fit.width).toBe(304);
    const viewport = lay(document, 300);
    expect(viewport.fit.direction).toBe("top-to-bottom");
    expect(viewport.fit.width).toBe(64);
    expect(viewport.fit.zoom).toBe(1);
    expect(viewport.fit.pans).toBe(false);
    expect(viewport.fit.phone).toBe(true);
    expect(viewport.fit.width).toBeLessThan(host.fit.width);
  });

  it("computes zoom and pan at the viewport width", () => {
    // A 408 px node at a 300 px viewport: zoom floors at 0.75 and the drawing
    // pans inside the unchanged box.
    const wide = buildDocument({ nodes: ["w".repeat(48)], links: [] });
    const { fit, warnings } = lay(wide, 300);
    expect(warnings).toEqual([]);
    expect(fit.width).toBe(408);
    expect(fit.zoom).toBe(0.75);
    expect(fit.pans).toBe(true);
    expect(fit.phone).toBe(true);
  });
});
