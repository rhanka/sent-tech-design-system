/**
 * Pure rectangle, point and polyline arithmetic. No state, no DOM, no allocation
 * a caller cannot see.
 *
 * WHY `normaliseRect` EXISTS, measured rather than supposed. `diagram-core`
 * persists `Geometry` as four numbers and `validateView` checks ONLY that they
 * are finite: `packages/diagram-core/src/validate.ts` runs `finiteNumbers` over
 * `["x", "y", "width", "height"]` and has no non-negativity branch for the last
 * two (the only comparison branches in that function concern `anchor` in 0..1
 * and `camera.zoom > 0`). So `{ x: 40, y: 10, width: -30, height: -20 }` is a
 * VALID persisted occurrence, and a scene that read `x .. x + width` as the
 * horizontal span would give that shape an empty span - no point could ever be
 * inside it, and the shape would be silently unselectable while rendering
 * perfectly well in any renderer that normalises. Every function here takes the
 * normalised span, and a test builds a negative-extent occurrence and hits it.
 *
 * THE EDGE CONVENTION IS HALF-OPEN: `x <= p.x < x + width`. The alternative,
 * inclusive on both edges, makes two rectangles that merely touch both claim the
 * shared edge, so a point on the seam of a tiled layout hits two shapes and the
 * "topmost" answer becomes an artefact of iteration order. Half-open partitions
 * the plane. It is asserted on all four edges, including the consequence that a
 * zero-extent rectangle contains nothing.
 */

import type { Rect, Vec2 } from "./transform.js";

/** A rectangle with non-negative extents spanning the same area. */
export function normaliseRect(rect: Rect): Rect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  return { x, y, width: Math.abs(rect.width), height: Math.abs(rect.height) };
}

export function isFinitePoint(point: Vec2): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

export function isFiniteRect(rect: Rect): boolean {
  return (
    Number.isFinite(rect.x) && Number.isFinite(rect.y) && Number.isFinite(rect.width) && Number.isFinite(rect.height)
  );
}

/** Half-open containment, on the normalised span. */
export function rectContainsPoint(rect: Rect, point: Vec2): boolean {
  const box = normaliseRect(rect);
  return point.x >= box.x && point.x < box.x + box.width && point.y >= box.y && point.y < box.y + box.height;
}

/** Overlap of a positive area. Two rectangles that merely share an edge do NOT intersect. */
export function rectsIntersect(left: Rect, right: Rect): boolean {
  const a = normaliseRect(left);
  const b = normaliseRect(right);
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** `inner` is wholly within `outer`, touching edges allowed. */
export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  const o = normaliseRect(outer);
  const i = normaliseRect(inner);
  return i.x >= o.x && i.y >= o.y && i.x + i.width <= o.x + o.width && i.y + i.height <= o.y + o.height;
}

export function rectUnion(left: Rect, right: Rect): Rect {
  const a = normaliseRect(left);
  const b = normaliseRect(right);
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

/** The bounding box of a point set, or `undefined` for an empty set - never a zero rect at the origin. */
export function rectFromPoints(points: readonly Vec2[]): Rect | undefined {
  if (points.length === 0) return undefined;
  let minX = points[0]!.x;
  let minY = points[0]!.y;
  let maxX = minX;
  let maxY = minY;
  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Grown by `padding` on every side. A negative padding shrinks, possibly past zero extent. */
export function expandRect(rect: Rect, padding: number): Rect {
  const box = normaliseRect(rect);
  return {
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + 2 * padding,
    height: box.height + 2 * padding,
  };
}

export function rectCenter(rect: Rect): Vec2 {
  const box = normaliseRect(rect);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Distance from a point to a segment, including the degenerate segment (both
 * ends equal), which is the distance to that single point. A polyline of one
 * repeated waypoint is a shape a persisted view can hold, so it must have an
 * answer rather than a `0/0`.
 */
export function distanceToSegment(point: Vec2, from: Vec2, to: Vec2): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - from.x, point.y - from.y);
  let t = ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(point.x - (from.x + t * dx), point.y - (from.y + t * dy));
}

/** The smallest distance from a point to any segment of a polyline. `Infinity` for fewer than two points. */
export function distanceToPolyline(point: Vec2, points: readonly Vec2[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let index = 1; index < points.length; index += 1) {
    const distance = distanceToSegment(point, points[index - 1]!, points[index]!);
    if (distance < best) best = distance;
  }
  return best;
}

/**
 * A polyline crosses a rectangle when any of its segments does. Endpoints inside
 * the rectangle count, which is why the vertex test comes first: a segment whose
 * both ends are inside crosses no edge and would otherwise be missed.
 */
export function polylineIntersectsRect(points: readonly Vec2[], rect: Rect): boolean {
  const box = normaliseRect(rect);
  for (const point of points) if (rectContainsPoint(box, point)) return true;
  for (let index = 1; index < points.length; index += 1) {
    if (segmentIntersectsRect(points[index - 1]!, points[index]!, box)) return true;
  }
  return false;
}

function segmentIntersectsRect(from: Vec2, to: Vec2, box: Rect): boolean {
  const corners: readonly [Vec2, Vec2][] = [
    [{ x: box.x, y: box.y }, { x: box.x + box.width, y: box.y }],
    [{ x: box.x + box.width, y: box.y }, { x: box.x + box.width, y: box.y + box.height }],
    [{ x: box.x + box.width, y: box.y + box.height }, { x: box.x, y: box.y + box.height }],
    [{ x: box.x, y: box.y + box.height }, { x: box.x, y: box.y }],
  ];
  for (const [edgeFrom, edgeTo] of corners) if (segmentsIntersect(from, to, edgeFrom, edgeTo)) return true;
  return false;
}

function cross(origin: Vec2, left: Vec2, right: Vec2): number {
  return (left.x - origin.x) * (right.y - origin.y) - (left.y - origin.y) * (right.x - origin.x);
}

function onSegment(origin: Vec2, point: Vec2, target: Vec2): boolean {
  return (
    Math.min(origin.x, target.x) <= point.x &&
    point.x <= Math.max(origin.x, target.x) &&
    Math.min(origin.y, target.y) <= point.y &&
    point.y <= Math.max(origin.y, target.y)
  );
}

export function segmentsIntersect(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  const d1 = cross(b1, b2, a1);
  const d2 = cross(b1, b2, a2);
  const d3 = cross(a1, a2, b1);
  const d4 = cross(a1, a2, b2);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  if (d1 === 0 && onSegment(b1, a1, b2)) return true;
  if (d2 === 0 && onSegment(b1, a2, b2)) return true;
  if (d3 === 0 && onSegment(a1, b1, a2)) return true;
  if (d4 === 0 && onSegment(a1, b2, a2)) return true;
  return false;
}
