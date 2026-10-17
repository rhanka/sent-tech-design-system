/**
 * Docking: which side of its entity each edge end uses, and where on that side.
 *
 * L-R1 — an edge alone on its side docks at the centre of that side.
 * L-R2 — several edges on one side spread symmetrically about its centre: n
 *        slots at offsets (i - (n - 1) / 2) * s, so the offsets sum to zero and
 *        the middle slot, when n is odd, is the centre itself.
 * L-R9 — parallel edges (same two entities) are distinct ends, so they get
 *        distinct slots; their slot order is the relation id at BOTH ends, which
 *        keeps them from crossing each other.
 *
 * SIDE. An end docks on the side of its entity that faces the other end: along
 * the flow first (east/west left-to-right, south/north top-to-bottom), across it
 * when the two shapes overlap along the flow. A self-loop leaves by the flow's
 * exit side and comes back on the side before it. An edge between an entity and
 * its own container docks on the wall of the inner entity nearest the
 * container, and on the same wall of the container, from the inside.
 *
 * SLOT ORDER on a side is by the position of the other end along that side, then
 * by end key (relation id and role), which is what keeps the edges of one side
 * from crossing next to it. Ends that target the same semantic PORT share one
 * slot, because a port occurrence is one point.
 *
 * SPACING is `slotSpacing`, widened to a label's thickness when labelled edges
 * share the side (so their labels cannot overlap, L-R10), and narrowed to
 * `length / (n + 1)` when the side is too short, so every slot stays on the side.
 */

import type { EntityRef, PortRef, PortSide, RelationRef } from "@sentropic/diagram-core";

import type { Rect, Vec2 } from "../transform.js";
import { isAncestor, type LayoutGraph } from "./graph.js";
import { slotSpacingFor } from "./place.js";
import type { FlowDirection, LayoutMetrics, TextSize } from "./types.js";

export interface Dock {
  readonly entity: EntityRef;
  readonly point: Vec2;
  readonly side: PortSide;
  /** Unit vector the route leaves this end along: the outward normal, or the inward one from inside a container. */
  readonly exit: Vec2;
  /** Slot index on the side, 0 at the side's start (west end of north/south, north end of east/west). */
  readonly order: number;
  /** Position along the side, 0..1 from the side's start: `PortOccurrence.anchor`'s reading. */
  readonly anchor: number;
  readonly port?: PortRef;
}

export interface EdgeDocks {
  readonly source: Dock;
  readonly target: Dock;
}

/** A side too short for its slots at full spacing: the length it would need. */
export interface SideDemand {
  readonly entity: EntityRef;
  readonly side: PortSide;
  readonly needed: number;
  readonly available: number;
}

export interface DockOutcome {
  readonly docks: ReadonlyMap<RelationRef, EdgeDocks>;
  readonly demands: readonly SideDemand[];
}

export const SIDE_NORMAL: Readonly<Record<PortSide, Vec2>> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

const centreOf = (rect: Rect): Vec2 => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

/** The side of `self` facing `other`, along the flow first. */
export function sideToward(self: Rect, other: Rect, direction: FlowDirection): PortSide {
  const right = other.x - (self.x + self.width);
  const left = self.x - (other.x + other.width);
  const below = other.y - (self.y + self.height);
  const above = self.y - (other.y + other.height);
  const horizontal: PortSide | undefined = right >= 0 ? "east" : left >= 0 ? "west" : undefined;
  const vertical: PortSide | undefined = below >= 0 ? "south" : above >= 0 ? "north" : undefined;
  const first = direction === "left-to-right" ? horizontal ?? vertical : vertical ?? horizontal;
  if (first !== undefined) return first;
  const a = centreOf(self);
  const b = centreOf(other);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "east" : "west";
  return dy >= 0 ? "south" : "north";
}

const WALL_ORDER: readonly PortSide[] = ["east", "south", "west", "north"];

function nearestWall(inner: Rect, outer: Rect): PortSide {
  const distance: Record<PortSide, number> = {
    east: outer.x + outer.width - (inner.x + inner.width),
    south: outer.y + outer.height - (inner.y + inner.height),
    west: inner.x - outer.x,
    north: inner.y - outer.y,
  };
  let best: PortSide = "east";
  for (const side of WALL_ORDER) if (distance[side] < distance[best]) best = side;
  return best;
}

interface PendingEnd {
  readonly edge: RelationRef;
  readonly role: "source" | "target";
  readonly entity: EntityRef;
  readonly other: EntityRef;
  readonly port: PortRef | undefined;
  side: PortSide;
  readonly inner: boolean;
  readonly label: TextSize | undefined;
}

export function dockEdges(input: {
  readonly graph: LayoutGraph;
  readonly rects: ReadonlyMap<EntityRef, Rect>;
  readonly direction: FlowDirection;
  readonly metrics: LayoutMetrics;
  readonly labelSizes: ReadonlyMap<RelationRef, TextSize>;
}): DockOutcome {
  const { graph, rects, direction, metrics, labelSizes } = input;
  const leftToRight = direction === "left-to-right";
  const ends: PendingEnd[] = [];

  for (const edge of graph.edges) {
    const source = edge.source.entity;
    const target = edge.target.entity;
    const label = labelSizes.get(edge.id);
    const push = (role: "source" | "target", entity: EntityRef, other: EntityRef, side: PortSide, inner: boolean) =>
      ends.push({
        edge: edge.id,
        role,
        entity,
        other,
        port: role === "source" ? edge.source.port : edge.target.port,
        side,
        inner,
        label,
      });
    if (source === target) {
      push("source", source, target, leftToRight ? "east" : "south", false);
      push("target", target, source, leftToRight ? "north" : "west", false);
    } else if (isAncestor(graph, source, target) || isAncestor(graph, target, source)) {
      const outerIsSource = isAncestor(graph, source, target);
      const outer = outerIsSource ? source : target;
      const innerEntity = outerIsSource ? target : source;
      const wall = nearestWall(rects.get(innerEntity)!, rects.get(outer)!);
      push("source", source, target, wall, outerIsSource);
      push("target", target, source, wall, !outerIsSource);
    } else {
      push("source", source, target, sideToward(rects.get(source)!, rects.get(target)!, direction), false);
      push("target", target, source, sideToward(rects.get(target)!, rects.get(source)!, direction), false);
    }
  }

  // Ends on one semantic port share the side of the port's first end.
  const portSide = new Map<PortRef, PortSide>();
  for (const end of ends) {
    if (end.port === undefined) continue;
    const fixed = portSide.get(end.port);
    if (fixed === undefined) portSide.set(end.port, end.side);
    else end.side = fixed;
  }

  const groups = new Map<string, PendingEnd[]>();
  for (const end of ends) {
    const key = `${end.entity}|${end.side}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(end);
  }

  const placed = new Map<string, Dock>();
  const demands: SideDemand[] = [];
  for (const key of [...groups.keys()].sort(byString)) {
    const group = groups.get(key)!;
    const entity = group[0]!.entity;
    const side = group[0]!.side;
    const rect = rects.get(entity)!;
    const vertical = side === "east" || side === "west";
    const slotKey = (end: PendingEnd) => (end.port !== undefined ? `~${end.port}` : `${end.edge}#${end.role}`);
    const position = (end: PendingEnd) => {
      const other = centreOf(rects.get(end.other)!);
      return vertical ? other.y : other.x;
    };
    const slots = new Map<string, PendingEnd[]>();
    for (const end of group) (slots.get(slotKey(end)) ?? slots.set(slotKey(end), []).get(slotKey(end))!).push(end);
    const orderedKeys = [...slots.keys()].sort((left, right) => {
      const a = position(slots.get(left)![0]!);
      const b = position(slots.get(right)![0]!);
      return a - b || byString(left, right);
    });
    const thickness = group.reduce(
      (widest, end) => (end.label === undefined ? widest : Math.max(widest, vertical ? end.label.height : end.label.width)),
      0,
    );
    const length = vertical ? rect.height : rect.width;
    const count = orderedKeys.length;
    const wanted = slotSpacingFor(metrics, count >= 2 ? thickness : 0);
    if (count >= 2 && wanted * (count + 1) > length) {
      demands.push({ entity, side, needed: wanted * (count + 1), available: length });
    }
    const spacing = Math.min(wanted, length / (count + 1));
    const centre = centreOf(rect);
    orderedKeys.forEach((slot, index) => {
      const offset = (index - (count - 1) / 2) * spacing;
      const point: Vec2 =
        side === "east"
          ? { x: rect.x + rect.width, y: centre.y + offset }
          : side === "west"
            ? { x: rect.x, y: centre.y + offset }
            : side === "north"
              ? { x: centre.x + offset, y: rect.y }
              : { x: centre.x + offset, y: rect.y + rect.height };
      const anchor = vertical ? (point.y - rect.y) / rect.height : (point.x - rect.x) / rect.width;
      for (const end of slots.get(slot)!) {
        const normal = SIDE_NORMAL[side];
        placed.set(`${end.edge}#${end.role}`, {
          entity,
          point,
          side,
          exit: end.inner ? { x: -normal.x, y: -normal.y } : normal,
          order: index,
          anchor,
          ...(end.port === undefined ? {} : { port: end.port }),
        });
      }
    });
  }

  const docks = new Map<RelationRef, EdgeDocks>();
  for (const edge of graph.edges) {
    docks.set(edge.id, { source: placed.get(`${edge.id}#source`)!, target: placed.get(`${edge.id}#target`)! });
  }
  return { docks, demands };
}
