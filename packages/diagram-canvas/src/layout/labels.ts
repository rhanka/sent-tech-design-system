/**
 * L-R10 — edge labels. "A label sits centred on the longest segment of its
 * route that can hold it without overlap." A segment can hold the label when
 * its Manhattan length is at least `along + 2 · labelMargin` and the label
 * box padded by `labelMargin` intersects no node rectangle, no container
 * title band and no already-placed label box. Relations go in ascending
 * relation id order; segments of one route by decreasing length, ties by
 * ascending segment index. When no segment can hold a label, the engine
 * (`engine.ts`) widens gaps by a terminating procedure: at most 12 rounds in
 * total, one request per label per round, gaps combined by maximum. A label
 * with a request outstanding after the 12th round is `label-budget-exhausted`;
 * only a label closed by the residual predicate on every segment is
 * `label-unplaced`.
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

/** One label of the row-pack path: its route, its measured size, and the box it must stay inside. */
export interface PackedLabelEntry extends LabelEntry {
  /**
   * DC-2a BF-3: the content box of the expanded container both ends share.
   * The label box stays inside it; absent for an edge between two containers.
   */
  readonly within?: Rect;
  /**
   * The room a label may take outside the drawing: the drawing grown to the
   * target aspect, so a label never costs display scale on the axis that
   * already fills the frame. The label box stays inside it.
   */
  readonly limit?: Rect;
}

/**
 * DC-2a row-pack label rule (SPEC_EVOL_DC2A §3.5, BF-6). A label sits ON its
 * route — its box always holds a point of the segment it is attached to — but
 * not necessarily centred on it: sibling gaps are capped, so the only room for
 * a label is the lane a route runs along or crosses, and the route itself
 * keeps a clearance from the cards that is smaller than half a label.
 *
 * Segments are tried by decreasing length, as in L-R10. On a horizontal
 * segment the box centre slides along the segment — up to a quarter of the
 * box past either end — and may shift across it by up to `height / 2 −
 * inset`, so the line still runs through the text. On a vertical segment the
 * centre slides along the segment likewise and may shift sideways by up to
 * `width / 2 − inset`. Among the positions clear of every
 * shape and every label already placed, the nearest to the segment centre
 * wins (Manhattan distance, then the smaller shift across the segment, then
 * the smaller coordinates). `marginY` is the free space kept above and under
 * the box: the engine passes `inset` for a final placement, and a smaller
 * value to probe which lane a label would fit once widened.
 */
export function placePackedLabel(
  entry: PackedLabelEntry,
  shapes: readonly Rect[],
  taken: readonly Rect[],
  inset: number,
  marginY: number = inset,
): LabelPlacement | undefined {
  const { width, height } = entry.size;
  for (const segment of edgeLabelCandidates(entry.route)) {
    const a = entry.route[segment]!;
    const b = entry.route[segment + 1]!;
    const horizontal = a.y === b.y;
    if (!horizontal && a.x !== b.x) continue;
    const preferred = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    // BLK-2: padding is orientation-aware — along the segment axis use `inset`
    // (8 px, or 4 px when probing) and across it use `marginY` (4 px, or 1 px
    // when probing). Across the segment the line stays inside the box by the
    // across pad; along it the box may run past an end by a quarter length.
    const alongPad = inset;
    const acrossPad = marginY;
    const padX = horizontal ? alongPad : acrossPad;
    const padY = horizontal ? acrossPad : alongPad;
    const shiftX = horizontal ? width / 4 : Math.max(0, width / 2 - inset);
    const shiftY = horizontal ? Math.max(0, height / 2 - inset) : height / 4;
    const xRange: [number, number] = [Math.min(a.x, b.x) - shiftX, Math.max(a.x, b.x) + shiftX];
    const yRange: [number, number] = [Math.min(a.y, b.y) - shiftY, Math.max(a.y, b.y) + shiftY];
    const reach: Rect = {
      x: xRange[0] - width / 2 - padX,
      y: yRange[0] - height / 2 - padY,
      width: xRange[1] - xRange[0] + width + 2 * padX,
      height: yRange[1] - yRange[0] + height + 2 * padY,
    };
    const near = [...shapes, ...taken].filter((shape) => rectsIntersect(shape, reach));
    const xs = new Set<number>([preferred.x, xRange[0], xRange[1]]);
    const ys = new Set<number>([preferred.y, yRange[0], yRange[1]]);
    for (const shape of near) {
      xs.add(shape.x + shape.width + padX + width / 2);
      xs.add(shape.x - padX - width / 2);
      ys.add(shape.y + shape.height + padY + height / 2);
      ys.add(shape.y - padY - height / 2);
    }
    const bounds = [entry.within, entry.limit].filter((rect): rect is Rect => rect !== undefined);
    for (const rect of bounds) {
      xs.add(rect.x + width / 2);
      xs.add(rect.x + rect.width - width / 2);
      ys.add(rect.y + height / 2);
      ys.add(rect.y + rect.height - height / 2);
    }
    const inRange = (values: Set<number>, range: [number, number]): number[] =>
      [...values].filter((value) => value >= range[0] && value <= range[1]);
    const candidates: { x: number; y: number; cost: number; across: number }[] = [];
    for (const x of inRange(xs, xRange)) {
      for (const y of inRange(ys, yRange)) {
        const dx = Math.abs(x - preferred.x);
        const dy = Math.abs(y - preferred.y);
        candidates.push({ x, y, cost: dx + dy, across: horizontal ? dy : dx });
      }
    }
    candidates.sort((left, right) => left.cost - right.cost || left.across - right.across || left.x - right.x || left.y - right.y);
    for (const candidate of candidates) {
      const box: Rect = { x: candidate.x - width / 2, y: candidate.y - height / 2, width, height };
      if (
        bounds.some(
          (rect) => box.x < rect.x || box.y < rect.y || box.x + box.width > rect.x + rect.width || box.y + box.height > rect.y + rect.height,
        )
      ) {
        continue;
      }
      const padded: Rect = { x: box.x - padX, y: box.y - padY, width: width + 2 * padX, height: height + 2 * padY };
      if (near.some((shape) => rectsIntersect(shape, padded))) continue;
      return { segment, centre: { x: candidate.x, y: candidate.y }, box };
    }
  }
  return undefined;
}

/**
 * Every label of a row-packed view, in the order given (sorted relation
 * occurrence ids): `placePackedLabel` against the shapes and the labels placed
 * before it. `undefined` for a label no segment of its route can hold.
 */
export function placeEdgeLabelsPacked(
  entries: readonly PackedLabelEntry[],
  shapes: readonly Rect[],
  inset: number,
): ReadonlyMap<string, LabelPlacement | undefined> {
  const placed = new Map<string, LabelPlacement | undefined>();
  const taken: Rect[] = [];
  for (const entry of entries) {
    const choice = placePackedLabel(entry, shapes, taken, inset);
    placed.set(entry.id, choice);
    if (choice !== undefined) taken.push(choice.box);
  }
  return placed;
}
