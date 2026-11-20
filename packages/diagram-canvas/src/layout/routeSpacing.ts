/**
 * Built-in geometric check for minimum route spacing (DE-2, OWNER-ADDENDA ask 2).
 *
 * Audits orthogonal routes against token-governed spacing invariants:
 * - No overlapping segments between distinct routes (`segment-overlap`)
 * - Parallel segments separated by at least `routeSpacing` (`parallel-segment-spacing`)
 * - Neighbouring elbows separated by at least `routeSpacing` (`elbow-spacing`)
 * - Distinct dock ports on an entity separated by at least `routeSpacing` (`port-spacing`)
 * - Arrowheads separated by at least `routeSpacing` (`arrowhead-spacing`)
 * - Link segments kept at least `borderClearance` from non-endpoint box borders (`link-to-border`)
 * - Longitudinal channel track demand checked against finite channel capacity (`channel-capacity-exceeded`)
 *
 * Pure geometry: zero DOM, zero external dependencies.
 */
import type { CanonicalArrowheadKind } from "@sentropic/diagram-core";

import type { Rect, Vec2 } from "../transform.js";
import { channelCapacity, type LayoutChannel } from "./channels.js";
import { DIAGRAM_SCENE_SPACING as spacing } from "./spacing.generated.js";

/** Default minimum spacing between parallel route segments, elbows, ports and arrowheads (world units). */
export const DEFAULT_ROUTE_SPACING = spacing.routeSpacing;
/** Default minimum clearance from routed link segments to non-endpoint borders (world units). */
export const DEFAULT_ROUTE_BORDER_CLEARANCE = spacing.routeBorderClearance;

const EPS = 1e-4;

export type RouteSpacingConflictKind =
  | "segment-overlap"
  | "parallel-segment-spacing"
  | "elbow-spacing"
  | "port-spacing"
  | "arrowhead-spacing"
  | "link-to-border"
  | "channel-capacity-exceeded";

export interface RouteSpacingConflict {
  readonly kind: RouteSpacingConflictKind;
  readonly routes: readonly string[];
  readonly entity?: string;
  readonly channelId?: string;
  readonly actual: number;
  readonly required: number;
  readonly message: string;
}

export interface ChannelCapacitySummary {
  readonly capacity: number;
  readonly demand: number;
  readonly gap: number;
}

export interface RouteSpacingReport {
  readonly conflictCount: number;
  readonly conflicts: readonly RouteSpacingConflict[];
  readonly routeSpacing: number;
  readonly borderClearance: number;
  readonly channelCapacity: Readonly<Record<string, ChannelCapacitySummary>>;
}

export interface CheckedRoute {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly points: readonly Vec2[];
  readonly sourcePort?: string;
  readonly targetPort?: string;
  readonly arrowhead?: CanonicalArrowheadKind;
  readonly passable?: ReadonlySet<string>;
}

export interface CheckRouteSpacingInput {
  readonly rects: ReadonlyMap<string, Rect>;
  readonly routes: readonly CheckedRoute[];
  readonly routeSpacing?: number;
  readonly borderClearance?: number;
  readonly channels?: readonly LayoutChannel[];
}

interface OrthSegment {
  readonly horizontal: boolean;
  readonly coord: number;
  readonly lo: number;
  readonly hi: number;
  readonly index: number;
  readonly a: Vec2;
  readonly b: Vec2;
}

function segmentsOf(points: readonly Vec2[]): OrthSegment[] {
  const out: OrthSegment[] = [];
  for (let i = 0; i + 1 < points.length; i += 1) {
    const a = points[i]!;
    const b = points[i + 1]!;
    if (Math.abs(a.x - b.x) <= EPS && Math.abs(a.y - b.y) <= EPS) continue;
    if (Math.abs(a.y - b.y) <= EPS) {
      out.push({
        horizontal: true,
        coord: (a.y + b.y) / 2,
        lo: Math.min(a.x, b.x),
        hi: Math.max(a.x, b.x),
        index: i,
        a,
        b,
      });
    } else if (Math.abs(a.x - b.x) <= EPS) {
      out.push({
        horizontal: false,
        coord: (a.x + b.x) / 2,
        lo: Math.min(a.y, b.y),
        hi: Math.max(a.y, b.y),
        index: i,
        a,
        b,
      });
    }
  }
  return out;
}

/** Exact Euclidean distance between an axis-aligned segment and a closed rectangle (0 if intersecting). */
export function segmentToRectDistance(a: Vec2, b: Vec2, rect: Rect): number {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  const rRight = rect.x + rect.width;
  const rBottom = rect.y + rect.height;
  const dx = maxX < rect.x ? rect.x - maxX : minX > rRight ? minX - rRight : 0;
  const dy = maxY < rect.y ? rect.y - maxY : minY > rBottom ? minY - rBottom : 0;
  return Math.hypot(dx, dy);
}

function sharedPortStub(
  left: CheckedRoute,
  leftSegIndex: number,
  leftLastIndex: number,
  right: CheckedRoute,
  rightSegIndex: number,
  rightLastIndex: number,
): boolean {
  if (
    leftSegIndex === 0 &&
    rightSegIndex === 0 &&
    left.source === right.source &&
    left.sourcePort !== undefined &&
    left.sourcePort === right.sourcePort
  ) {
    return true;
  }
  if (
    leftSegIndex === leftLastIndex &&
    rightSegIndex === rightLastIndex &&
    left.target === right.target &&
    left.targetPort !== undefined &&
    left.targetPort === right.targetPort
  ) {
    return true;
  }
  if (
    leftSegIndex === 0 &&
    rightSegIndex === rightLastIndex &&
    left.source === right.target &&
    left.sourcePort !== undefined &&
    left.sourcePort === right.targetPort
  ) {
    return true;
  }
  if (
    leftSegIndex === leftLastIndex &&
    rightSegIndex === 0 &&
    left.target === right.source &&
    left.targetPort !== undefined &&
    left.targetPort === right.sourcePort
  ) {
    return true;
  }
  return false;
}

/**
 * Audit every route against the minimum route spacing and link-to-border
 * tokens, plus longitudinal channel capacity. Returns every conflict and the
 * exact `conflictCount`.
 */
export function checkRouteSpacing(input: CheckRouteSpacingInput): RouteSpacingReport {
  const routeSpacing = input.routeSpacing ?? DEFAULT_ROUTE_SPACING;
  const borderClearance = input.borderClearance ?? DEFAULT_ROUTE_BORDER_CLEARANCE;
  const conflicts: RouteSpacingConflict[] = [];

  const parsed = input.routes.map((route) => ({
    route,
    segments: segmentsOf(route.points),
    elbows: route.points.length > 2 ? route.points.slice(1, -1) : [],
  }));

  // 1 & 2. Segment overlaps and parallel segment spacing (cross-route and self-hairpins).
  for (let i = 0; i < parsed.length; i += 1) {
    const left = parsed[i]!;
    const leftLast = Math.max(0, left.route.points.length - 2);
    // Self-parallel hairpin check (non-adjacent segments on the same route).
    for (let s1 = 0; s1 < left.segments.length; s1 += 1) {
      const segA = left.segments[s1]!;
      for (let s2 = s1 + 2; s2 < left.segments.length; s2 += 1) {
        const segB = left.segments[s2]!;
        if (segA.horizontal !== segB.horizontal) continue;
        const overlap = Math.min(segA.hi, segB.hi) - Math.max(segA.lo, segB.lo);
        if (overlap <= EPS) continue;
        const sep = Math.abs(segA.coord - segB.coord);
        if (sep <= EPS) {
          conflicts.push({
            kind: "segment-overlap",
            routes: [left.route.id],
            actual: 0,
            required: routeSpacing,
            message: `route ${left.route.id} folds back onto itself with overlapping segments`,
          });
        } else if (sep < routeSpacing - EPS) {
          conflicts.push({
            kind: "parallel-segment-spacing",
            routes: [left.route.id],
            actual: Math.round(sep * 1000) / 1000,
            required: routeSpacing,
            message: `parallel segments of ${left.route.id} are ${sep.toFixed(1)} apart (< ${routeSpacing})`,
          });
        }
      }
    }

    for (let j = i + 1; j < parsed.length; j += 1) {
      const right = parsed[j]!;
      const rightLast = Math.max(0, right.route.points.length - 2);
      let reportedOverlap = false;
      let minParallelGap = Number.POSITIVE_INFINITY;
      for (const segA of left.segments) {
        for (const segB of right.segments) {
          if (segA.horizontal !== segB.horizontal) continue;
          if (sharedPortStub(left.route, segA.index, leftLast, right.route, segB.index, rightLast)) continue;
          const overlap = Math.min(segA.hi, segB.hi) - Math.max(segA.lo, segB.lo);
          if (overlap <= EPS) continue;
          const sep = Math.abs(segA.coord - segB.coord);
          if (sep <= EPS) {
            reportedOverlap = true;
          } else if (sep < routeSpacing - EPS && sep < minParallelGap) {
            minParallelGap = sep;
          }
        }
      }
      if (reportedOverlap) {
        conflicts.push({
          kind: "segment-overlap",
          routes: [left.route.id, right.route.id],
          actual: 0,
          required: routeSpacing,
          message: `routes ${left.route.id} and ${right.route.id} share an overlapping segment`,
        });
      } else if (minParallelGap < routeSpacing - EPS) {
        conflicts.push({
          kind: "parallel-segment-spacing",
          routes: [left.route.id, right.route.id],
          actual: Math.round(minParallelGap * 1000) / 1000,
          required: routeSpacing,
          message: `parallel segments of ${left.route.id} and ${right.route.id} are ${minParallelGap.toFixed(1)} apart (< ${routeSpacing})`,
        });
      }

      // 3. Neighbouring elbows between distinct routes.
      let minElbowDist = Number.POSITIVE_INFINITY;
      for (const e1 of left.elbows) {
        for (const e2 of right.elbows) {
          const dist = Math.hypot(e1.x - e2.x, e1.y - e2.y);
          if (dist < minElbowDist) minElbowDist = dist;
        }
      }
      if (minElbowDist < routeSpacing - EPS) {
        conflicts.push({
          kind: "elbow-spacing",
          routes: [left.route.id, right.route.id],
          actual: Math.round(minElbowDist * 1000) / 1000,
          required: routeSpacing,
          message: `neighbouring elbows of ${left.route.id} and ${right.route.id} are ${minElbowDist.toFixed(1)} apart (< ${routeSpacing})`,
        });
      }
    }
  }

  // 4. Port / dock spacing per entity.
  interface DockPoint {
    readonly routeId: string;
    readonly entity: string;
    readonly point: Vec2;
    readonly port: string | undefined;
  }
  const docksByEntity = new Map<string, DockPoint[]>();
  const arrowheads: DockPoint[] = [];
  for (const { route } of parsed) {
    if (route.points.length < 2) continue;
    const start = route.points[0]!;
    const end = route.points[route.points.length - 1]!;
    const pushDock = (entry: DockPoint) => {
      const list = docksByEntity.get(entry.entity) ?? [];
      list.push(entry);
      docksByEntity.set(entry.entity, list);
    };
    pushDock({ routeId: route.id, entity: route.source, point: start, port: route.sourcePort });
    pushDock({ routeId: route.id, entity: route.target, point: end, port: route.targetPort });
    if (route.arrowhead !== "none") {
      arrowheads.push({ routeId: route.id, entity: route.target, point: end, port: route.targetPort });
    }
  }
  for (const [entity, docks] of docksByEntity) {
    for (let i = 0; i < docks.length; i += 1) {
      const a = docks[i]!;
      for (let j = i + 1; j < docks.length; j += 1) {
        const b = docks[j]!;
        if (a.port !== undefined && a.port === b.port) continue;
        const dist = Math.hypot(a.point.x - b.point.x, a.point.y - b.point.y);
        if (dist < routeSpacing - EPS) {
          conflicts.push({
            kind: "port-spacing",
            routes: a.routeId === b.routeId ? [a.routeId] : [a.routeId, b.routeId],
            entity,
            actual: Math.round(dist * 1000) / 1000,
            required: routeSpacing,
            message: `ports on ${entity} for ${a.routeId} and ${b.routeId} are ${dist.toFixed(1)} apart (< ${routeSpacing})`,
          });
        }
      }
    }
  }

  // 5. Arrowhead spacing across all directed target tips.
  for (let i = 0; i < arrowheads.length; i += 1) {
    const a = arrowheads[i]!;
    for (let j = i + 1; j < arrowheads.length; j += 1) {
      const b = arrowheads[j]!;
      if (a.entity === b.entity && a.port !== undefined && a.port === b.port) continue;
      const dist = Math.hypot(a.point.x - b.point.x, a.point.y - b.point.y);
      if (dist < routeSpacing - EPS) {
        conflicts.push({
          kind: "arrowhead-spacing",
          routes: [a.routeId, b.routeId],
          ...(a.entity === b.entity ? { entity: a.entity } : {}),
          actual: Math.round(dist * 1000) / 1000,
          required: routeSpacing,
          message: `arrowheads of ${a.routeId} and ${b.routeId} are ${dist.toFixed(1)} apart (< ${routeSpacing})`,
        });
      }
    }
  }

  // 6. Link-to-border clearance against all non-passable entity boxes.
  for (const { route, segments } of parsed) {
    const lastIdx = Math.max(0, route.points.length - 2);
    for (const [entity, rect] of input.rects) {
      if (route.passable?.has(entity)) continue;
      let minDist = Number.POSITIVE_INFINITY;
      for (const seg of segments) {
        if (entity === route.source && seg.index === 0) continue;
        if (entity === route.target && seg.index === lastIdx) continue;
        const dist = segmentToRectDistance(seg.a, seg.b, rect);
        if (dist < minDist) minDist = dist;
      }
      if (minDist < borderClearance - EPS) {
        conflicts.push({
          kind: "link-to-border",
          routes: [route.id],
          entity,
          actual: Math.round(minDist * 1000) / 1000,
          required: borderClearance,
          message: `route ${route.id} clears ${entity} by ${minDist.toFixed(1)} (< ${borderClearance})`,
        });
      }
    }
  }

  // 7. Finite longitudinal channel capacity report.
  const channelSummary: Record<string, ChannelCapacitySummary> = {};
  for (const channel of input.channels ?? []) {
    const cap = channelCapacity(channel.gap, routeSpacing, borderClearance);
    // Longitudinal routes run along the channel strip (vertical segments in a horizontal-gap channel,
    // horizontal segments in a vertical-gap channel). Compute max concurrent demand along the strip.
    const wantHorizontal = channel.axis === "vertical";
    const events: { readonly pos: number; readonly delta: number; readonly routeId: string }[] = [];
    const longitudinalRoutes = new Set<string>();
    for (const { route, segments } of parsed) {
      for (const seg of segments) {
        if (seg.horizontal !== wantHorizontal) continue;
        for (const strip of channel.strips) {
          const insideCross = wantHorizontal
            ? seg.coord >= strip.y - EPS && seg.coord <= strip.y + strip.height + EPS
            : seg.coord >= strip.x - EPS && seg.coord <= strip.x + strip.width + EPS;
          if (!insideCross) continue;
          const stripLo = wantHorizontal ? strip.x : strip.y;
          const stripHi = wantHorizontal ? strip.x + strip.width : strip.y + strip.height;
          const lo = Math.max(seg.lo, stripLo);
          const hi = Math.min(seg.hi, stripHi);
          if (hi - lo <= EPS) continue;
          longitudinalRoutes.add(route.id);
          events.push({ pos: lo, delta: 1, routeId: route.id });
          events.push({ pos: hi, delta: -1, routeId: route.id });
        }
      }
    }
    events.sort((a, b) => a.pos - b.pos || a.delta - b.delta);
    let active = 0;
    let peak = 0;
    for (const event of events) {
      active += event.delta;
      if (active > peak) peak = active;
    }
    channelSummary[channel.id] = { capacity: cap, demand: peak, gap: channel.gap };
    if (peak > cap) {
      conflicts.push({
        kind: "channel-capacity-exceeded",
        routes: [...longitudinalRoutes].sort(),
        channelId: channel.id,
        actual: peak,
        required: cap,
        message: `channel ${channel.id} (gap ${channel.gap}) carries ${peak} parallel tracks, exceeding capacity ${cap}`,
      });
    }
  }

  return {
    conflictCount: conflicts.length,
    conflicts,
    routeSpacing,
    borderClearance,
    channelCapacity: channelSummary,
  };
}
