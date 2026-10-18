/**
 * Docking: which side of its entity each edge end uses, and where on that side.
 *
 * L-R1 — side choice and lone edge at the centre. An end's side is a function
 * of the two entity rectangles and the direction only. Ordinary pair: the flow
 * side first when the other entity is separated on that axis; the cross side
 * when the entities overlap along the flow and are separated across it; when
 * they overlap on both axes, the axis of the greater centre offset, horizontal
 * on an exact tie, then east/south for a non-negative offset and west/north
 * otherwise. Ancestor pair: both ends take the inner entity's nearest
 * container wall (ties east, south, west, north); the container end exits
 * inward, the inner end outward. Self-loop: the source end exits east
 * (left-to-right) or south (top-to-bottom) and the target end enters north
 * (left-to-right) or west (top-to-bottom). An end alone in its (entity, side)
 * group docks at the exact centre of that side (anchor 0.5).
 * L-R2 — shared side spread symmetrically; L-R9 takes priority over port
 * sharing. Side is fixed first: ends carrying the same semantic port are
 * forced to one side — the side of the port's representative end, smallest by
 * (relation id, role). A relation is parallel when another relation has the
 * same unordered entity pair (direction ignored; two self-loops on one
 * entity are parallel). Slot keys: a parallel end takes
 * `<relation-id>#<role>` (never the port key); a non-parallel end on a port
 * takes `~<port-id>`; otherwise `<relation-id>#<role>`. A slot's ordering
 * position is the other-end centre of its representative end (smallest by
 * relation id, role). Offsets `(i − (n−1)/2) · s` from the side's start,
 * summing to zero. Spacing `s` from `slotSpacing`, raised for labelled sides
 * to the widest label thickness plus `labelMargin`; with `n ≥ 2` and
 * `s · (n+1)` past the side length, the node grows to `s · (n+1)` effective
 * from the next placement attempt, the docked spacing then
 * `min(s, length / (n+1))`.
 * L-R9 — parallel edges (same unordered entity pair) never share a slot, at
 * either end, including on a shared port; their slot order is the same at
 * both ends, so they do not cross each other.
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

/**
 * Relations sharing their unordered entity pair with another relation
 * (direction ignored; two self-loops on one entity are parallel). L-R2/L-R9
 * test support: the engine's view builder uses the same set for its
 * per-end `PortOccurrence` ids.
 */
export function parallelRelations(graph: LayoutGraph): ReadonlySet<RelationRef> {
  const pairCount = new Map<string, number>();
  for (const edge of graph.edges) {
    const key = [edge.source.entity, edge.target.entity].sort().join("|");
    pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
  }
  const found = new Set<RelationRef>();
  for (const edge of graph.edges) {
    const key = [edge.source.entity, edge.target.entity].sort().join("|");
    if ((pairCount.get(key) ?? 0) > 1) found.add(edge.id);
  }
  return found;
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

  const parallel = parallelRelations(graph);

  // Ends on one semantic port share the side of the port's representative
  // end: smallest by (relation id, role, source before target as spelled).
  const portSide = new Map<PortRef, PortSide>();
  for (const end of [...ends].sort(
    (left, right) => byString(left.edge, right.edge) || byString(left.role, right.role),
  )) {
    if (end.port === undefined) continue;
    if (!portSide.has(end.port)) portSide.set(end.port, end.side);
  }
  for (const end of ends) {
    if (end.port === undefined) continue;
    end.side = portSide.get(end.port)!;
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
    // L-R9 takes priority over port sharing: a parallel end never takes the
    // port key, even when it carries a port.
    const slotKey = (end: PendingEnd) =>
      end.port !== undefined && !parallel.has(end.edge) ? `~${end.port}` : `${end.edge}#${end.role}`;
    const representative = (members: readonly PendingEnd[]): PendingEnd =>
      [...members].sort(
        (left, right) => byString(left.edge, right.edge) || byString(left.role, right.role),
      )[0]!;
    const position = (end: PendingEnd) => {
      const other = centreOf(rects.get(end.other)!);
      return vertical ? other.y : other.x;
    };
    const slots = new Map<string, PendingEnd[]>();
    for (const end of group) (slots.get(slotKey(end)) ?? slots.set(slotKey(end), []).get(slotKey(end))!).push(end);
    const orderedKeys = [...slots.keys()].sort((left, right) => {
      const a = position(representative(slots.get(left)!));
      const b = position(representative(slots.get(right)!));
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
