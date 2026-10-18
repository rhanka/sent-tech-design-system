/**
 * L-R10 — edge labels. "A label sits on the longest segment of its route,
 * centred, and never overlaps a node, a container title or another label; when
 * it cannot fit, the router lengthens that segment."
 *
 * WHERE THE LABEL LIVES. `ViewDocument` has no field for a label position, and
 * none is needed: the rule makes the position a FUNCTION of the route and the
 * measured label size. `edgeLabelPlacement` is that function, and a renderer
 * calls it with the route `relationRoute` reads back from the view and the same
 * measurer the engine was given. The longest segment is the first one of
 * greatest length in route order (source to target), so ties are decided by the
 * route, not by iteration order.
 */

import { type OccurrenceRef, type ViewDocument } from "@sentropic/diagram-core";

import { portAnchorPoint } from "../scene.js";
import type { Rect, Vec2 } from "../transform.js";
import type { TextSize } from "./types.js";

export interface LabelPlacement {
  /** Index `k` of the segment `route[k] -> route[k + 1]` the label sits on. */
  readonly segment: number;
  readonly centre: Vec2;
  readonly box: Rect;
}

/** The label box of a route: centred on its longest segment. `undefined` for a route of fewer than two points. */
export function edgeLabelPlacement(route: readonly Vec2[], size: TextSize): LabelPlacement | undefined {
  let best = -1;
  let bestLength = -1;
  for (let index = 0; index + 1 < route.length; index += 1) {
    const a = route[index]!;
    const b = route[index + 1]!;
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (length > bestLength) {
      best = index;
      bestLength = length;
    }
  }
  if (best < 0) return undefined;
  const a = route[best]!;
  const b = route[best + 1]!;
  const centre = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return {
    segment: best,
    centre,
    box: { x: centre.x - size.width / 2, y: centre.y - size.height / 2, width: size.width, height: size.height },
  };
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
