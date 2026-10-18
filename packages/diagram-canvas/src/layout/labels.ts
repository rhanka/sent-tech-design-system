/**
 * L-R10 — edge labels. "A label sits centred on the longest segment of its
 * route that can hold it without overlap." Segments are tried by decreasing
 * length; when none can hold the label, the engine widens the gap between
 * ranks, or between siblings, that the route crosses, until one segment can.
 *
 * WHERE THE LABEL LIVES. `ViewDocument` has no field for a label position, and
 * none is needed: the rule makes the position a FUNCTION of the route, the
 * measured label size, and the shapes around it. `placeEdgeLabels` is that
 * function, and a renderer calls it with the routes `relationRoute` reads back
 * from the view, the same measurer the engine was given, the entity and title
 * shapes read back from the view, and the relation ids in sorted order — the
 * same inputs the engine's last round used, so the boxes come out identical.
 * `edgeLabelPlacement` below is the one-segment primitive it is built on: the
 * longest segment, ties decided by route order (source to target).
 */

import { type OccurrenceRef, type ViewDocument } from "@sentropic/diagram-core";

import { rectsIntersect } from "../geometry.js";
import { portAnchorPoint } from "../scene.js";
import type { Rect, Vec2 } from "../transform.js";
import type { TextSize } from "./types.js";

export interface LabelPlacement {
  /** Index `k` of the segment `route[k] -> route[k + 1]` the label sits on. */
  readonly segment: number;
  readonly centre: Vec2;
  readonly box: Rect;
}

/** Length of one route segment, Manhattan: every route here is orthogonal. */
export function segmentLength(route: readonly Vec2[], segment: number): number {
  const a = route[segment]!;
  const b = route[segment + 1]!;
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/** The label box centred on one segment of a route. */
export function labelBoxOnSegment(route: readonly Vec2[], segment: number, size: TextSize): LabelPlacement {
  const a = route[segment]!;
  const b = route[segment + 1]!;
  const centre = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return {
    segment,
    centre,
    box: { x: centre.x - size.width / 2, y: centre.y - size.height / 2, width: size.width, height: size.height },
  };
}

/** Segment indexes by decreasing length, ties in route order (source to target). */
export function edgeLabelCandidates(route: readonly Vec2[]): readonly number[] {
  const indexes = route.slice(1).map((_, index) => index);
  indexes.sort((left, right) => segmentLength(route, right) - segmentLength(route, left) || left - right);
  return indexes;
}

/** The label box of a route: centred on its longest segment. `undefined` for a route of fewer than two points. */
export function edgeLabelPlacement(route: readonly Vec2[], size: TextSize): LabelPlacement | undefined {
  const candidates = edgeLabelCandidates(route);
  const best = candidates[0];
  if (best === undefined) return undefined;
  return labelBoxOnSegment(route, best, size);
}

/** One label to place: its route and its measured size. */
export interface LabelEntry {
  readonly id: string;
  readonly route: readonly Vec2[];
  readonly size: TextSize;
}

/**
 * Every label on the longest segment of its route that can hold it without
 * overlap: segments tried by decreasing length, centred, clear of the shapes
 * (nodes, container titles) and of the labels placed before it. Entries are
 * taken in order, so the caller passes them in sorted relation-id order and a
 * renderer replays the same order. `undefined` for a label no tried segment
 * can hold: the engine widens a gap for those and tries again next round.
 */
export function placeEdgeLabels(
  entries: readonly LabelEntry[],
  shapes: readonly Rect[],
  margin: number,
): ReadonlyMap<string, LabelPlacement | undefined> {
  const placed = new Map<string, LabelPlacement | undefined>();
  const taken: Rect[] = [];
  for (const entry of entries) {
    let choice: LabelPlacement | undefined;
    for (const segment of edgeLabelCandidates(entry.route)) {
      const candidate = labelBoxOnSegment(entry.route, segment, entry.size);
      if (!segmentHolds(candidate, entry.route, segment, entry.size, shapes, taken, margin)) continue;
      choice = candidate;
      break;
    }
    placed.set(entry.id, choice);
    if (choice !== undefined) taken.push(choice.box);
  }
  return placed;
}

/** Whether a centred label fits its segment and clears every shape and taken label. */
export function segmentHolds(
  candidate: LabelPlacement,
  route: readonly Vec2[],
  segment: number,
  size: TextSize,
  shapes: readonly Rect[],
  taken: readonly Rect[],
  margin: number,
): boolean {
  const a = route[segment]!;
  const b = route[segment + 1]!;
  const horizontal = a.y === b.y;
  const along = horizontal ? size.width : size.height;
  if (segmentLength(route, segment) < along + 2 * margin) return false;
  const padded = pad(candidate.box, margin);
  return !shapes.some((shape) => rectsIntersect(shape, padded)) && !taken.some((box) => rectsIntersect(box, padded));
}

/** Grow a box by the free space L-R10 keeps around an edge label. */
export function pad(box: Rect, margin: number): Rect {
  return { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin };
}

/**
 * The drawn route of a relation occurrence, dock to dock, source to target: the
 * port anchor of an end drawn on a port occurrence, then the waypoints. An end
 * drawn on an entity occurrence has its dock as the first (or last) waypoint,
 * because a `RelationOccurrenceEndpoint` on an entity cannot hold a docking
 * point by itself.
 */
export function relationRoute(view: ViewDocument, occurrence: OccurrenceRef): readonly Vec2[] | undefined {
  const relation = view.relationOccurrences[occurrence];
  if (relation === undefined) return undefined;
  const ends = [...relation.endpoints].sort((left, right) => (left.role < right.role ? -1 : left.role > right.role ? 1 : 0));
  const anchor = (endpointOccurrence: OccurrenceRef): Vec2[] => {
    const port = view.portOccurrences[endpointOccurrence];
    if (port === undefined) return [];
    const owner = view.entityOccurrences[port.ownerOccurrence];
    return owner === undefined ? [] : [portAnchorPoint(owner.geometry, port.side, port.anchor)];
  };
  const first = ends[0];
  const last = ends[ends.length - 1];
  return [
    ...(first === undefined ? [] : anchor(first.occurrence)),
    ...(relation.waypoints ?? []).map((point) => ({ x: point.x, y: point.y })),
    ...(last === undefined || last === first ? [] : anchor(last.occurrence)),
  ];
}
