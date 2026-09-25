/**
 * Rectangle, point and polyline arithmetic, with the two conventions the module
 * fixes asserted directly: negative extents are normalised, and containment is
 * half-open.
 */
import { describe, expect, it } from "vitest";

import {
  distanceToPolyline,
  distanceToSegment,
  expandRect,
  isFiniteRect,
  normaliseRect,
  polylineIntersectsRect,
  rectCenter,
  rectContainsPoint,
  rectContainsRect,
  rectFromPoints,
  rectUnion,
  rectsIntersect,
  segmentsIntersect,
} from "../src/geometry.js";

describe("negative extents, which diagram-core permits", () => {
  // `validateView` checks only that x/y/width/height are FINITE (measured in
  // packages/diagram-core/src/validate.ts). So this rectangle is valid persisted
  // data, and the span it means is (10..40, 5..25).
  const negative = { x: 40, y: 25, width: -30, height: -20 };

  it("spans the same area once normalised", () => {
    expect(normaliseRect(negative)).toEqual({ x: 10, y: 5, width: 30, height: 20 });
  });

  it("contains the points of that span - the defect this exists to prevent", () => {
    expect(rectContainsPoint(negative, { x: 20, y: 10 })).toBe(true);
    expect(rectContainsPoint(negative, { x: 5, y: 10 })).toBe(false);
  });

  it("reports a centre inside itself, not outside", () => {
    expect(rectCenter(negative)).toEqual({ x: 25, y: 15 });
  });
});

describe("half-open containment", () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };

  it("includes the minimum edges and excludes the maximum edges", () => {
    expect(rectContainsPoint(rect, { x: 0, y: 0 })).toBe(true);
    expect(rectContainsPoint(rect, { x: 0, y: 5 })).toBe(true);
    expect(rectContainsPoint(rect, { x: 10, y: 5 })).toBe(false);
    expect(rectContainsPoint(rect, { x: 5, y: 10 })).toBe(false);
  });

  it("gives a point on the seam of two tiled rectangles to exactly one of them", () => {
    const left = { x: 0, y: 0, width: 10, height: 10 };
    const right = { x: 10, y: 0, width: 10, height: 10 };
    const seam = { x: 10, y: 5 };
    expect([rectContainsPoint(left, seam), rectContainsPoint(right, seam)]).toEqual([false, true]);
  });

  it("makes a zero-extent rectangle contain nothing, including its own corner", () => {
    expect(rectContainsPoint({ x: 3, y: 3, width: 0, height: 0 }, { x: 3, y: 3 })).toBe(false);
  });
});

describe("rectangle relations", () => {
  it("does not call two rectangles that only share an edge intersecting", () => {
    expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 9.5, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it("allows touching edges for containment, which is a different question", () => {
    expect(rectContainsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(true);
    expect(rectContainsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 0, width: 11, height: 10 })).toBe(false);
  });

  it("unions and expands", () => {
    expect(rectUnion({ x: 0, y: 0, width: 2, height: 2 }, { x: 10, y: -5, width: 1, height: 1 })).toEqual({
      x: 0,
      y: -5,
      width: 11,
      height: 7,
    });
    expect(expandRect({ x: 5, y: 5, width: 10, height: 10 }, 2)).toEqual({ x: 3, y: 3, width: 14, height: 14 });
  });

  it("answers undefined for the bounding box of no points, never a zero rect at the origin", () => {
    expect(rectFromPoints([])).toBeUndefined();
    expect(rectFromPoints([{ x: 4, y: 4 }])).toEqual({ x: 4, y: 4, width: 0, height: 0 });
  });

  it("reports a non-finite rectangle as such", () => {
    expect(isFiniteRect({ x: 0, y: 0, width: Number.NaN, height: 1 })).toBe(false);
    expect(isFiniteRect({ x: 0, y: 0, width: 1, height: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isFiniteRect({ x: -1, y: -1, width: 1, height: 1 })).toBe(true);
  });
});

describe("segments and polylines", () => {
  it("clamps to the endpoints rather than extending the line", () => {
    const from = { x: 0, y: 0 };
    const to = { x: 10, y: 0 };
    expect(distanceToSegment({ x: 5, y: 3 }, from, to)).toBe(3);
    // The perpendicular foot is at x = -5, off the segment: the answer is the
    // distance to the nearer END, 5, not the 0 an infinite line would give.
    expect(distanceToSegment({ x: -5, y: 0 }, from, to)).toBe(5);
    expect(distanceToSegment({ x: 20, y: 0 }, from, to)).toBe(10);
  });

  it("answers for a degenerate segment instead of dividing by zero", () => {
    expect(distanceToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
  });

  it("takes the nearest of a polyline's segments, and Infinity for fewer than two points", () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(distanceToPolyline({ x: 11, y: 5 }, path)).toBe(1);
    expect(distanceToPolyline({ x: 0, y: 0 }, [{ x: 0, y: 0 }])).toBe(Number.POSITIVE_INFINITY);
    expect(distanceToPolyline({ x: 0, y: 0 }, [])).toBe(Number.POSITIVE_INFINITY);
  });

  it("finds a crossing, and finds none where the segments miss", () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 })).toBe(true);
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 5, y: 5 }, { x: 6, y: 6 })).toBe(false);
  });

  it("catches a polyline that is wholly inside a rectangle and crosses no edge", () => {
    // The vertex test carries this case; an edge-crossing test alone misses it.
    expect(polylineIntersectsRect([{ x: 2, y: 2 }, { x: 3, y: 3 }], { x: 0, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it("does not catch a diagonal polyline that only passes through the bounding box", () => {
    // From (0,0) to (100,100), against a small box near (80,10): the BOUNDING
    // BOX of the polyline covers it, the polyline itself never comes near.
    const diagonal = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    expect(polylineIntersectsRect(diagonal, { x: 75, y: 5, width: 10, height: 10 })).toBe(false);
    expect(polylineIntersectsRect(diagonal, { x: 45, y: 45, width: 10, height: 10 })).toBe(true);
  });
});
