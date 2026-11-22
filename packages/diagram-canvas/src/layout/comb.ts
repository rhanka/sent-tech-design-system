/**
 * Fan-in / fan-out comb grouping, trunk gutter selection, track reservation,
 * and orthogonal comb routing (H2-STEP0 §1.4, §4.6, §5.2 H2.7 + Review P2 #4).
 *
 * Pure geometry: no DOM, no randomness, no gap widening of zone gutters.
 */
import type {
  CanonicalArrowheadKind,
  EntityRef,
  OccurrenceRef,
  PortRef,
  PortSide,
  RelationRef,
} from "@sentropic/diagram-core";

import type { Rect, Vec2 } from "../transform.js";
import { channelCapacity } from "./channels.js";
import type { ComposedGridReport, ComposedGutter } from "./compose.js";
import { SIDE_NORMAL, type Dock, type EdgeDocks } from "./dock.js";
import { routeEdges, simplifyRoute, subdivideChannelTracks } from "./route.js";
import { checkRouteSpacing, segmentToRectDistance, type CheckedRoute, type SpacingBarrier } from "./routeSpacing.js";

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
const clean = (value: number): number => (value === 0 ? 0 : value);
const EPS = 1e-4;

export interface CombEdgeCandidate {
  readonly occurrence: OccurrenceRef;
  readonly relation: RelationRef;
  readonly source: { readonly entity: EntityRef; readonly port?: PortRef };
  readonly target: { readonly entity: EntityRef; readonly port?: PortRef };
  readonly styleKey: string;
  readonly arrowhead: CanonicalArrowheadKind;
  readonly label?: string;
  readonly passable: ReadonlySet<EntityRef>;
  readonly within?: Rect;
}

export interface CombFallbackRecord {
  readonly hub: string;
  readonly members: readonly string[];
  readonly reason: "labels" | "gutter-full" | "v1-path";
}

export interface LayoutCombGroup {
  readonly id: string;
  readonly kind: "fan-in" | "fan-out";
  readonly hub: string;
  readonly carrier: OccurrenceRef;
  readonly members: readonly OccurrenceRef[];
  readonly styleKey: string;
  readonly arrowhead: CanonicalArrowheadKind;
  readonly label?: string;
  readonly trunkGutterId: string;
  readonly trunk: readonly [Vec2, Vec2];
  /** Trunk sub-segments between consecutive join points, sorted longest-first for label placement. */
  readonly trunkSegments: readonly (readonly [Vec2, Vec2])[];
}

export interface CombCandidateGroup {
  readonly id: string;
  readonly kind: "fan-in" | "fan-out";
  readonly hub: string;
  readonly hubEntity: EntityRef;
  readonly hubPort?: PortRef;
  readonly styleKey: string;
  readonly arrowhead: CanonicalArrowheadKind;
  readonly label?: string;
  readonly members: readonly CombEdgeCandidate[];
}

export interface CombGroupingResult {
  readonly formed: readonly CombCandidateGroup[];
  readonly fallbacks: readonly CombFallbackRecord[];
}

/**
 * Group candidate edges into fan-in and fan-out combs (§4.6 steps 1, 2, 9).
 *
 * - Groups per hub + style key are NEVER split.
 * - `>= 2` members with `<= 1` distinct non-empty label form a comb.
 * - `>= 2` distinct non-empty labels emit one `comb-fallback` (`reason: "labels"`).
 * - Fan-in claims first (hubs in UTF-16 order); unformed fan-in members stay
 *   available for fan-out.
 * - On the v1 routing path (`!r7Routing`), every group that steps 1–2 would form
 *   falls back with `reason: "v1-path"`.
 */
export function groupCombCandidates(
  candidates: readonly CombEdgeCandidate[],
  options: {
    readonly fanIn: "comb" | "separate";
    readonly fanOut: "comb" | "separate";
    readonly r7Routing: boolean;
  },
): CombGroupingResult {
  const formed: CombCandidateGroup[] = [];
  const fallbacks: CombFallbackRecord[] = [];
  const claimed = new Set<OccurrenceRef>();

  const processMode = (kind: "fan-in" | "fan-out", pool: readonly CombEdgeCandidate[]): void => {
    const byKey = new Map<string, { hub: string; hubEntity: EntityRef; hubPort?: PortRef; styleKey: string; members: CombEdgeCandidate[] }>();
    for (const edge of pool) {
      const hubEnd = kind === "fan-in" ? edge.target : edge.source;
      const hub = String(hubEnd.port ?? hubEnd.entity);
      const key = `${hub}\u0000${edge.styleKey}`;
      let bucket = byKey.get(key);
      if (bucket === undefined) {
        bucket = {
          hub,
          hubEntity: hubEnd.entity,
          ...(hubEnd.port === undefined ? {} : { hubPort: hubEnd.port }),
          styleKey: edge.styleKey,
          members: [],
        };
        byKey.set(key, bucket);
      }
      bucket.members.push(edge);
    }
    const orderedKeys = [...byKey.keys()].sort((left, right) => {
      const a = byKey.get(left)!;
      const b = byKey.get(right)!;
      return byString(a.hub, b.hub) || byString(String(a.styleKey), String(b.styleKey));
    });
    for (const key of orderedKeys) {
      const bucket = byKey.get(key)!;
      if (bucket.members.length < 2) continue;
      bucket.members.sort((a, b) => byString(a.occurrence, b.occurrence));
      const distinctLabels = new Set<string>();
      for (const m of bucket.members) {
        const trimmed = m.label?.trim();
        if (trimmed !== undefined && trimmed.length > 0) distinctLabels.add(trimmed);
      }
      if (distinctLabels.size >= 2) {
        fallbacks.push({
          hub: bucket.hub,
          members: bucket.members.map((m) => String(m.occurrence)),
          reason: "labels",
        });
        continue;
      }
      for (const m of bucket.members) claimed.add(m.occurrence);
      if (!options.r7Routing) {
        fallbacks.push({
          hub: bucket.hub,
          members: bucket.members.map((m) => String(m.occurrence)),
          reason: "v1-path",
        });
        continue;
      }
      const singleLabel = [...distinctLabels][0];
      formed.push({
        id: `${kind}|${bucket.hub}|${bucket.styleKey}`,
        kind,
        hub: bucket.hub,
        hubEntity: bucket.hubEntity,
        ...(bucket.hubPort === undefined ? {} : { hubPort: bucket.hubPort }),
        styleKey: bucket.styleKey,
        arrowhead: bucket.members[0]!.arrowhead,
        ...(singleLabel === undefined ? {} : { label: singleLabel }),
        members: bucket.members,
      });
    }
  };

  if (options.fanIn === "comb") {
    processMode("fan-in", candidates);
  }
  if (options.fanOut === "comb") {
    processMode(
      "fan-out",
      candidates.filter((c) => !claimed.has(c.occurrence)),
    );
  }
  return { formed, fallbacks };
}

export interface SolveCombsInput {
  readonly candidates: readonly CombEdgeCandidate[];
  readonly fanIn: "comb" | "separate";
  readonly fanOut: "comb" | "separate";
  readonly r7Routing: boolean;
  readonly rects: ReadonlyMap<EntityRef, Rect>;
  readonly placementParentOf: (entity: EntityRef) => EntityRef | undefined;
  readonly gridReports: Readonly<Record<string, ComposedGridReport>>;
  readonly gutters: readonly ComposedGutter[];
  readonly barriers: readonly SpacingBarrier[];
  readonly isNorthBlockedByTitle: (entity: EntityRef) => boolean;
  readonly routeSpacing: number;
  readonly borderClearance: number;
  readonly cornerInset: number;
}

export interface SolvedCombPlan {
  readonly groups: readonly LayoutCombGroup[];
  readonly fallbacks: readonly CombFallbackRecord[];
  readonly memberRoutes: ReadonlyMap<RelationRef, readonly Vec2[]>;
  readonly memberDocks: ReadonlyMap<RelationRef, EdgeDocks>;
  readonly memberCombId: ReadonlyMap<string, string>;
  readonly suppressedLabels: ReadonlySet<string>;
  readonly suppressedArrowheads: ReadonlySet<string>;
  readonly carrierLabels: ReadonlyMap<string, string>;
  readonly reservedSlots: ReadonlyMap<string, readonly number[]>;
  readonly reservedPolylines: readonly (readonly Vec2[])[];
}

interface BoundaryChoice {
  readonly gutter: ComposedGutter;
  readonly horizontal: boolean;
  readonly gutterLo: number;
  readonly gutterHi: number;
  /** Grid longitudinal span covered by the boundary tracks (free space past this is allowed beside tall peripherals). */
  readonly gridSpanLo: number;
  readonly gridSpanHi: number;
  /** True when track ordering counts from `gutterLo -> gutterHi`, false from `gutterHi -> gutterLo`. */
  readonly ascending: boolean;
}

function centerOf(rect: Rect): Vec2 {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function ancestorChainOf(entity: EntityRef, parentOf: (e: EntityRef) => EntityRef | undefined): EntityRef[] {
  const chain: EntityRef[] = [];
  const seen = new Set<EntityRef>();
  let cur: EntityRef | undefined = entity;
  while (cur !== undefined && !seen.has(cur)) {
    seen.add(cur);
    chain.push(cur);
    cur = parentOf(cur);
  }
  return chain;
}

function lowestCommonScope(
  entities: readonly EntityRef[],
  parentOf: (e: EntityRef) => EntityRef | undefined,
): string {
  if (entities.length === 0) return "root";
  const chains = entities.map((e) => ancestorChainOf(e, parentOf).slice(1).reverse());
  const first = chains[0]!;
  let common: EntityRef | undefined;
  for (let depth = 0; depth < first.length; depth += 1) {
    const candidate = first[depth]!;
    if (chains.every((chain) => chain[depth] === candidate)) {
      common = candidate;
    } else {
      break;
    }
  }
  return common ?? "root";
}

function directChildInScope(
  entity: EntityRef,
  scope: string,
  parentOf: (e: EntityRef) => EntityRef | undefined,
): EntityRef {
  let cur: EntityRef = entity;
  while (true) {
    const p = parentOf(cur);
    if (scope === "root") {
      if (p === undefined) return cur;
    } else if (p === scope) {
      return cur;
    } else if (p === undefined) {
      return cur;
    }
    cur = p;
  }
}

function gutterCrossBounds(gutter: ComposedGutter): { readonly lo: number; readonly hi: number } | undefined {
  if (gutter.strips.length === 0) return undefined;
  const first = gutter.strips[0]!;
  return gutter.horizontal
    ? { lo: first.y, hi: first.y + first.height }
    : { lo: first.x, hi: first.x + first.width };
}

function selectBoundaryChoice(args: {
  readonly group: CombCandidateGroup;
  readonly rects: ReadonlyMap<EntityRef, Rect>;
  readonly placementParentOf: (entity: EntityRef) => EntityRef | undefined;
  readonly gridReports: Readonly<Record<string, ComposedGridReport>>;
  readonly gutters: readonly ComposedGutter[];
}): BoundaryChoice | undefined {
  const { group, rects, placementParentOf, gridReports, gutters } = args;
  const memberEntities = group.members.map((m) => (group.kind === "fan-in" ? m.source.entity : m.target.entity));
  const hubEntity = group.hubEntity;
  const hubRect = rects.get(hubEntity);
  if (hubRect === undefined) return undefined;
  const memberRects = memberEntities.map((e) => rects.get(e)).filter((r): r is Rect => r !== undefined);
  if (memberRects.length !== memberEntities.length) return undefined;

  const lca = lowestCommonScope([hubEntity, ...memberEntities], placementParentOf);
  const grid = gridReports[lca];

  const matchGridGutter = (
    horizontal: boolean,
    lo: number,
    hi: number,
    gridSpanLo: number,
    gridSpanHi: number,
    ascending: boolean,
    runKeyPrefix?: string,
  ): BoundaryChoice | undefined => {
    const match = gutters.find((g) => {
      if (g.horizontal !== horizontal) return false;
      if (runKeyPrefix !== undefined && !g.id.startsWith(`${runKeyPrefix}|`)) return false;
      const b = gutterCrossBounds(g);
      return b !== undefined && Math.abs(b.lo - lo) <= 1.5 && Math.abs(b.hi - hi) <= 1.5;
    });
    if (match === undefined) return undefined;
    const b = gutterCrossBounds(match)!;
    return { gutter: match, horizontal, gutterLo: b.lo, gutterHi: b.hi, gridSpanLo, gridSpanHi, ascending };
  };

  if (grid !== undefined && grid.columns.length > 0 && grid.bands.length > 0) {
    const cellByEntity = new Map(grid.cells.map((c) => [c.entity, c]));
    const hubDirect = directChildInScope(hubEntity, lca, placementParentOf);
    const hubCell = cellByEntity.get(hubDirect);
    const memberCells = memberEntities.map((e) => cellByEntity.get(directChildInScope(e, lca, placementParentOf)));
    if (hubCell !== undefined && memberCells.every((c) => c !== undefined)) {
      const mCells = memberCells as NonNullable<typeof hubCell>[];
      const gridMinX = Math.min(...grid.columns.map((c) => c.start));
      const gridMaxX = Math.max(...grid.columns.map((c) => c.start + c.size));
      const gridMinY = Math.min(...grid.bands.map((b) => b.start));
      const gridMaxY = Math.max(...grid.bands.map((b) => b.start + b.size));

      const isPeripheralCell = (c: NonNullable<typeof hubCell>): boolean => {
        if (c.colStart < 0) return false;
        const kind = grid.columns[c.colStart]?.kind;
        return kind === "peripheral-start" || kind === "peripheral-end";
      };

      const hubCenter = centerOf(hubRect);

      // Rule 1 (§4.6 step 3): all members within one band of G (non-peripheral) and hub does not lie in that band
      const allInOneBand =
        mCells.every((c) => !isPeripheralCell(c) && c.bandStart >= 0 && c.bandStart === c.bandEnd) &&
        mCells.every((c) => c.bandStart === mCells[0]!.bandStart);
      if (allInOneBand) {
        const b = mCells[0]!.bandStart;
        const hubInBand = !isPeripheralCell(hubCell) && hubCell.bandStart <= b && hubCell.bandEnd >= b;
        if (!hubInBand) {
          const band = grid.bands[b]!;
          const hubBelow = hubCenter.y > band.start + band.size / 2;
          if (hubBelow && b + 1 < grid.bands.length) {
            const nextBand = grid.bands[b + 1]!;
            return matchGridGutter(true, band.start + band.size, nextBand.start, gridMinX, gridMaxX, true, grid.runKey);
          }
          if (!hubBelow && b - 1 >= 0) {
            const prevBand = grid.bands[b - 1]!;
            return matchGridGutter(true, prevBand.start + prevBand.size, band.start, gridMinX, gridMaxX, false, grid.runKey);
          }
        }
      }

      // Rule 2 (§4.6 step 3): all members within one column of G (stage or peripheral) and hub does not lie in that column
      const allInOneCol =
        mCells.every((c) => c.colStart >= 0 && c.colStart === c.colEnd) &&
        mCells.every((c) => c.colStart === mCells[0]!.colStart);
      if (allInOneCol) {
        const colIdx = mCells[0]!.colStart;
        const hubInCol = hubCell.colStart >= 0 && hubCell.colStart <= colIdx && hubCell.colEnd >= colIdx;
        if (!hubInCol) {
          const col = grid.columns[colIdx]!;
          const hubRight = hubCenter.x > col.start + col.size / 2;
          if (hubRight && colIdx + 1 < grid.columns.length) {
            const nextCol = grid.columns[colIdx + 1]!;
            return matchGridGutter(false, col.start + col.size, nextCol.start, gridMinY, gridMaxY, true, grid.runKey);
          }
          if (!hubRight && colIdx - 1 >= 0) {
            const prevCol = grid.columns[colIdx - 1]!;
            return matchGridGutter(false, prevCol.start + prevCol.size, col.start, gridMinY, gridMaxY, false, grid.runKey);
          }
        }
      }

      // Rule 3 (§4.6 step 3): hub's own band/column boundary facing members' bbox centre on dominant axis
      // (tie -> horizontal, zero vector -> west; count tracks from hub's side).
      const mMinX = Math.min(...memberRects.map((r) => r.x));
      const mMaxX = Math.max(...memberRects.map((r) => r.x + r.width));
      const mMinY = Math.min(...memberRects.map((r) => r.y));
      const mMaxY = Math.max(...memberRects.map((r) => r.y + r.height));
      const mCx = (mMinX + mMaxX) / 2;
      const mCy = (mMinY + mMaxY) / 2;
      const vx = mCx - hubCenter.x;
      const vy = mCy - hubCenter.y;
      const horizontalAxis = Math.abs(vx) >= Math.abs(vy);
      if (horizontalAxis) {
        const side: "east" | "west" = vx > EPS ? "east" : "west";
        if (side === "east" && hubCell.colEnd >= 0 && hubCell.colEnd + 1 < grid.columns.length) {
          const colA = grid.columns[hubCell.colEnd]!;
          const colB = grid.columns[hubCell.colEnd + 1]!;
          return matchGridGutter(false, colA.start + colA.size, colB.start, gridMinY, gridMaxY, true, grid.runKey);
        }
        if (side === "west" && hubCell.colStart > 0) {
          const colA = grid.columns[hubCell.colStart - 1]!;
          const colB = grid.columns[hubCell.colStart]!;
          return matchGridGutter(false, colA.start + colA.size, colB.start, gridMinY, gridMaxY, false, grid.runKey);
        }
      } else {
        const side: "south" | "north" = vy > 0 ? "south" : "north";
        if (side === "south" && hubCell.bandEnd >= 0 && hubCell.bandEnd + 1 < grid.bands.length) {
          const bandA = grid.bands[hubCell.bandEnd]!;
          const bandB = grid.bands[hubCell.bandEnd + 1]!;
          return matchGridGutter(true, bandA.start + bandA.size, bandB.start, gridMinX, gridMaxX, true, grid.runKey);
        }
        if (side === "north" && hubCell.bandStart > 0) {
          const bandA = grid.bands[hubCell.bandStart - 1]!;
          const bandB = grid.bands[hubCell.bandStart]!;
          return matchGridGutter(true, bandA.start + bandA.size, bandB.start, gridMinX, gridMaxX, false, grid.runKey);
        }
      }
      return undefined;
    }
  }

  // Fallback for auto-packed container or stack LCA (§4.6 step 3 last sentence):
  // hub's adjacent DE-2 gutter on the side chosen by the same vector rule.
  const hubCenter = centerOf(hubRect);
  const mMinX = Math.min(...memberRects.map((r) => r.x));
  const mMaxX = Math.max(...memberRects.map((r) => r.x + r.width));
  const mMinY = Math.min(...memberRects.map((r) => r.y));
  const mMaxY = Math.max(...memberRects.map((r) => r.y + r.height));
  const vx = (mMinX + mMaxX) / 2 - hubCenter.x;
  const vy = (mMinY + mMaxY) / 2 - hubCenter.y;
  const horizontalAxis = Math.abs(vx) >= Math.abs(vy);
  const side: PortSide = horizontalAxis ? (vx > EPS ? "east" : "west") : vy > 0 ? "south" : "north";
  const wantHorizontalGutter = side === "north" || side === "south";
  const hubEdge =
    side === "east"
      ? hubRect.x + hubRect.width
      : side === "west"
        ? hubRect.x
        : side === "south"
          ? hubRect.y + hubRect.height
          : hubRect.y;
  const matching = gutters.filter((g) => {
    if (g.horizontal !== wantHorizontalGutter) return false;
    const b = gutterCrossBounds(g);
    if (b === undefined) return false;
    if (side === "east" || side === "south") return Math.abs(b.lo - hubEdge) <= 2;
    return Math.abs(b.hi - hubEdge) <= 2;
  });
  const chosen = matching[0];
  if (chosen === undefined) return undefined;
  const b = gutterCrossBounds(chosen)!;
  const spanLo = Math.min(...chosen.strips.map((s) => (wantHorizontalGutter ? s.x : s.y)));
  const spanHi = Math.max(...chosen.strips.map((s) => (wantHorizontalGutter ? s.x + s.width : s.y + s.height)));
  return {
    gutter: chosen,
    horizontal: wantHorizontalGutter,
    gutterLo: b.lo,
    gutterHi: b.hi,
    gridSpanLo: spanLo,
    gridSpanHi: spanHi,
    ascending: side === "east" || side === "south",
  };
}

function isCoveredByStrips(
  gutter: ComposedGutter,
  extentLo: number,
  extentHi: number,
  gridSpanLo: number,
  gridSpanHi: number,
): boolean {
  const checkLo = Math.max(extentLo, gridSpanLo);
  const checkHi = Math.min(extentHi, gridSpanHi);
  if (checkHi - checkLo <= EPS) return true;
  const intervals = gutter.strips
    .map((s) => (gutter.horizontal ? ([s.x, s.x + s.width] as const) : ([s.y, s.y + s.height] as const)))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (intervals.length === 0) return false;
  const merged: [number, number][] = [[intervals[0]![0], intervals[0]![1]]];
  for (let i = 1; i < intervals.length; i += 1) {
    const prev = merged[merged.length - 1]!;
    const curr = intervals[i]!;
    if (curr[0] <= prev[1] + 1.5) prev[1] = Math.max(prev[1], curr[1]);
    else merged.push([curr[0], curr[1]]);
  }
  return merged.some(([lo, hi]) => checkLo >= lo - 1.5 && checkHi <= hi + 1.5);
}

function segmentClearsObstacles(
  a: Vec2,
  b: Vec2,
  rects: ReadonlyMap<EntityRef, Rect>,
  barriers: readonly SpacingBarrier[],
  passable: ReadonlySet<EntityRef>,
  endpointEntities: ReadonlySet<EntityRef>,
  borderClearance: number,
  isEndpointSegment: boolean,
): boolean {
  for (const [entity, rect] of rects) {
    if (endpointEntities.has(entity) && isEndpointSegment) continue;
    if (passable.has(entity)) {
      // Passable ancestor: crossings allowed, parallel proximity to borders must still respect clearance
      // except at perpendicular crossings. Check raw parallel walls.
      const horiz = Math.abs(a.y - b.y) <= EPS;
      if (horiz) {
        const y = a.y;
        const lo = Math.min(a.x, b.x);
        const hi = Math.max(a.x, b.x);
        if (hi > rect.x + EPS && lo < rect.x + rect.width - EPS) {
          if (Math.abs(y - rect.y) < borderClearance - EPS || Math.abs(y - (rect.y + rect.height)) < borderClearance - EPS) {
            return false;
          }
        }
      } else {
        const x = a.x;
        const lo = Math.min(a.y, b.y);
        const hi = Math.max(a.y, b.y);
        if (hi > rect.y + EPS && lo < rect.y + rect.height - EPS) {
          if (Math.abs(x - rect.x) < borderClearance - EPS || Math.abs(x - (rect.x + rect.width)) < borderClearance - EPS) {
            return false;
          }
        }
      }
      continue;
    }
    if (segmentToRectDistance(a, b, rect) < borderClearance - EPS) return false;
  }
  for (const barrier of barriers) {
    if (isEndpointSegment && barrier.entity !== undefined && endpointEntities.has(barrier.entity as EntityRef)) {
      continue;
    }
    if (segmentToRectDistance(a, b, barrier.rect) < borderClearance - EPS) return false;
  }
  return true;
}

function dockForPoint(entity: EntityRef, rect: Rect, side: PortSide, point: Vec2, port?: PortRef): Dock {
  const vertical = side === "east" || side === "west";
  const anchor = vertical
    ? (rect.height > 0 ? (point.y - rect.y) / rect.height : 0.5)
    : (rect.width > 0 ? (point.x - rect.x) / rect.width : 0.5);
  return {
    entity,
    point: { x: clean(point.x), y: clean(point.y) },
    side,
    exit: SIDE_NORMAL[side],
    order: 0,
    anchor: clean(anchor),
    ...(port === undefined ? {} : { port }),
  };
}

function pickFreeDockCoordinate(
  rect: Rect,
  side: PortSide,
  ideal: number,
  reserved: readonly number[],
  spacing: number,
  cornerInset: number,
): number | undefined {
  const vertical = side === "east" || side === "west";
  const lo = (vertical ? rect.y : rect.x) + cornerInset;
  const hi = (vertical ? rect.y + rect.height : rect.x + rect.width) - cornerInset;
  if (hi < lo - EPS) return undefined;
  const clamped = Math.max(lo, Math.min(hi, ideal));
  const isFree = (coord: number): boolean =>
    coord >= lo - EPS && coord <= hi + EPS && reserved.every((r) => Math.abs(r - coord) >= spacing - EPS);
  if (isFree(clamped)) return clamped;
  for (let step = 1; step <= 12; step += 1) {
    const plus = clamped + step * spacing;
    if (isFree(plus)) return plus;
    const minus = clamped - step * spacing;
    if (isFree(minus)) return minus;
  }
  return undefined;
}

function splitTrunkSegments(horizontal: boolean, trunkCoord: number, joinPositions: readonly number[]): [Vec2, Vec2][] {
  const unique = [...new Set(joinPositions.map((p) => Math.round(p * 1000) / 1000))].sort((a, b) => a - b);
  if (unique.length < 2) return [];
  const pt = (pos: number): Vec2 => (horizontal ? { x: clean(pos), y: clean(trunkCoord) } : { x: clean(trunkCoord), y: clean(pos) });
  const sub: [Vec2, Vec2][] = [];
  for (let i = 0; i + 1 < unique.length; i += 1) {
    if (unique[i + 1]! - unique[i]! > EPS) {
      sub.push([pt(unique[i]!), pt(unique[i + 1]!)]);
    }
  }
  // Sort longest sub-segment first (tie: earliest coordinate), then append full trunk as fallback
  sub.sort((a, b) => {
    const la = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y);
    const lb = Math.hypot(b[1].x - b[0].x, b[1].y - b[0].y);
    if (Math.abs(la - lb) > EPS) return lb - la;
    return (horizontal ? a[0].x - b[0].x : a[0].y - b[0].y);
  });
  const full: [Vec2, Vec2] = [pt(unique[0]!), pt(unique[unique.length - 1]!)];
  if (sub.length !== 1) sub.push(full);
  return sub;
}

/**
 * Solve all fan-in and fan-out combs (§4.6) before plain routing.
 * Reserves trunk tracks, builds orthogonal branches and hub segments, and emits
 * fallbacks for any group that cannot obtain a valid track.
 */
export function solveCombs(input: SolveCombsInput): SolvedCombPlan {
  const {
    candidates,
    fanIn,
    fanOut,
    r7Routing,
    rects,
    placementParentOf,
    gridReports,
    gutters,
    barriers,
    isNorthBlockedByTitle,
    routeSpacing,
    borderClearance,
    cornerInset,
  } = input;

  const grouped = groupCombCandidates(candidates, { fanIn, fanOut, r7Routing });
  const groups: LayoutCombGroup[] = [];
  const fallbacks: CombFallbackRecord[] = [...grouped.fallbacks];
  const memberRoutes = new Map<RelationRef, readonly Vec2[]>();
  const memberDocks = new Map<RelationRef, EdgeDocks>();
  const memberCombId = new Map<string, string>();
  const suppressedLabels = new Set<string>();
  const suppressedArrowheads = new Set<string>();
  const carrierLabels = new Map<string, string>();
  const reservedSlots = new Map<string, number[]>();
  const reservedPolylines: (readonly Vec2[])[] = [];
  const committedChecked: CheckedRoute[] = [];
  // Map `${gutterId}|${trackIdx}` -> list of reserved [lo, hi] intervals along the trunk axis.
  const reservedTracks = new Map<string, [number, number][]>();

  const reserveSlot = (entity: EntityRef, side: PortSide, coord: number): void => {
    const key = `${entity}#${side}`;
    const list = reservedSlots.get(key) ?? [];
    list.push(coord);
    reservedSlots.set(key, list);
  };

  for (const group of grouped.formed) {
    const boundary = selectBoundaryChoice({ group, rects, placementParentOf, gridReports, gutters });
    if (boundary === undefined) {
      fallbacks.push({
        hub: group.hub,
        members: group.members.map((m) => String(m.occurrence)),
        reason: "gutter-full",
      });
      continue;
    }

    const { gutter, horizontal, gutterLo, gutterHi, gridSpanLo, gridSpanHi, ascending } = boundary;
    const cap = channelCapacity(gutter.gap, routeSpacing, borderClearance);
    if (cap <= 0) {
      fallbacks.push({
        hub: group.hub,
        members: group.members.map((m) => String(m.occurrence)),
        reason: "gutter-full",
      });
      continue;
    }
    const rawTracks = subdivideChannelTracks(gutterLo + borderClearance, gutterHi - borderClearance, routeSpacing).slice(0, cap);
    const orderedTracks = ascending ? rawTracks : [...rawTracks].reverse();

    const hubRect = rects.get(group.hubEntity)!;
    const hubCenter = centerOf(hubRect);
    const hubPassable = new Set<EntityRef>(ancestorChainOf(group.hubEntity, placementParentOf).slice(1));

    // Helper: route a single segment from a box dock to a point on the trunk using DE-2 router when straight is blocked.
    const routeEndToTrunk = (
      entity: EntityRef,
      rect: Rect,
      port: PortRef | undefined,
      preferredSide: PortSide,
      trunkCoord: number,
      targetAlong: number,
      passable: ReadonlySet<EntityRef>,
      within: Rect | undefined,
      localReservedSlots: ReadonlyMap<string, readonly number[]>,
      extraReservedPolylines: readonly (readonly Vec2[])[],
    ): { readonly dock: Dock; readonly points: readonly Vec2[]; readonly joinAlong: number } | undefined => {
      const targetPt: Vec2 = horizontal ? { x: clean(targetAlong), y: clean(trunkCoord) } : { x: clean(trunkCoord), y: clean(targetAlong) };
      const faceReserved = (side: PortSide): number[] => [
        ...(reservedSlots.get(`${entity}#${side}`) ?? []),
        ...(localReservedSlots.get(`${entity}#${side}`) ?? []),
      ];

      // 1. Try direct perpendicular segment from preferredSide first (zero bends!).
      if (!(preferredSide === "north" && isNorthBlockedByTitle(entity))) {
        const dockCoord = pickFreeDockCoordinate(rect, preferredSide, targetAlong, faceReserved(preferredSide), routeSpacing, cornerInset);
        if (dockCoord !== undefined) {
          const dockPt: Vec2 =
            preferredSide === "east"
              ? { x: rect.x + rect.width, y: dockCoord }
              : preferredSide === "west"
                ? { x: rect.x, y: dockCoord }
                : preferredSide === "north"
                  ? { x: dockCoord, y: rect.y }
                  : { x: dockCoord, y: rect.y + rect.height };
          const straightJoin: Vec2 = horizontal ? { x: dockCoord, y: trunkCoord } : { x: trunkCoord, y: dockCoord };
          const clear = segmentClearsObstacles(
            dockPt,
            straightJoin,
            rects,
            barriers,
            passable,
            new Set([entity]),
            borderClearance,
            true,
          );
          if (clear) {
            return {
              dock: dockForPoint(entity, rect, preferredSide, dockPt, port),
              points: [dockPt, straightJoin],
              joinAlong: dockCoord,
            };
          }
        }
      }

      // 2. Fallback to orthogonal DE-2 router from candidate faces of `entity` to `targetPt` on the trunk.
      const arrivalDir: Vec2 = horizontal
        ? { x: 0, y: centerOf(rect).y < trunkCoord ? -1 : 1 }
        : { x: centerOf(rect).x < trunkCoord ? -1 : 1, y: 0 };
      const candidateSides: readonly PortSide[] = [preferredSide, "south", "north", "west", "east"];
      const allSides: PortSide[] = candidateSides.filter(
        (s, idx, arr) => arr.indexOf(s) === idx && !(s === "north" && isNorthBlockedByTitle(entity)),
      );
      const barrierRects = barriers.map((b) => b.rect);
      for (const side of allSides) {
        const idealCoord = side === "east" || side === "west" ? centerOf(rect).y : centerOf(rect).x;
        const dockCoord = pickFreeDockCoordinate(rect, side, idealCoord, faceReserved(side), routeSpacing, cornerInset);
        if (dockCoord === undefined) continue;
        const dockPt: Vec2 =
          side === "east"
            ? { x: rect.x + rect.width, y: dockCoord }
            : side === "west"
              ? { x: rect.x, y: dockCoord }
              : side === "north"
                ? { x: dockCoord, y: rect.y }
                : { x: dockCoord, y: rect.y + rect.height };
        const dock = dockForPoint(entity, rect, side, dockPt, port);
        // Synthetic point at trunk: endExit points toward `entity` so arrival is perpendicular into trunk.
        const endPt: Vec2 = targetPt;
        const outcome = routeEdges({
          rects,
          requests: [
            {
              id: "__comb_seg__" as RelationRef,
              pairKey: `${entity}|__trunk__`,
              start: dock.point,
              startExit: dock.exit,
              end: endPt,
              endExit: arrivalDir,
              passable: new Set([...passable, entity]),
              ...(within === undefined ? {} : { within }),
            },
          ],
          clearance: borderClearance,
          routeSpacing,
          barriers: barrierRects,
          avoidFallbackInteriors: true,
          reservedRoutes: [...reservedPolylines, ...extraReservedPolylines],
          lanes: horizontal ? { xs: [], ys: [trunkCoord] } : { xs: [trunkCoord], ys: [] },
        });
        if (outcome.obstructed.length > 0) continue;
        const routedPts = outcome.routes.get("__comb_seg__" as RelationRef);
        if (routedPts === undefined || routedPts.length < 2) continue;
        return { dock, points: routedPts, joinAlong: targetAlong };
      }
      return undefined;
    };

    // Perpendicular gutter midpoints along the trunk axis (useful hub join candidates when hub is separated by an obstacle, e.g. Example A)
    const crossGutterMids = gutters
      .filter((g) => g.horizontal !== horizontal)
      .map((g) => {
        const b = gutterCrossBounds(g);
        return b === undefined ? undefined : (b.lo + b.hi) / 2;
      })
      .filter((v): v is number => v !== undefined);

    let committed = false;
    for (let tIdx = 0; tIdx < orderedTracks.length; tIdx += 1) {
      const trackCoord = orderedTracks[tIdx]!;
      const trackKey = `${gutter.id}|${String(tIdx)}`;
      const localSlots = new Map<string, number[]>();
      const addLocalSlot = (entity: EntityRef, side: PortSide, coord: number) => {
        const k = `${entity}#${side}`;
        const list = localSlots.get(k) ?? [];
        list.push(coord);
        localSlots.set(k, list);
      };

      // 1. Route every member branch from its side facing the trunk.
      const branchResults: {
        readonly edge: CombEdgeCandidate;
        readonly entity: EntityRef;
        readonly dock: Dock;
        readonly points: readonly Vec2[];
        readonly joinAlong: number;
      }[] = [];
      let branchesOk = true;
      const localBranchPolys: (readonly Vec2[])[] = [];
      for (const edge of group.members) {
        const memberEnd = group.kind === "fan-in" ? edge.source : edge.target;
        const mRect = rects.get(memberEnd.entity)!;
        const mCenter = centerOf(mRect);
        const facingSide: PortSide = horizontal
          ? mCenter.y < trackCoord
            ? "south"
            : "north"
          : mCenter.x < trackCoord
            ? "east"
            : "west";
        const idealAlong = horizontal ? mCenter.x : mCenter.y;
        const mPassable = new Set<EntityRef>(ancestorChainOf(memberEnd.entity, placementParentOf).slice(1));
        const res = routeEndToTrunk(
          memberEnd.entity,
          mRect,
          memberEnd.port,
          facingSide,
          trackCoord,
          idealAlong,
          mPassable,
          edge.within,
          localSlots,
          localBranchPolys,
        );
        if (res === undefined) {
          branchesOk = false;
          break;
        }
        addLocalSlot(memberEnd.entity, res.dock.side, horizontal ? res.dock.point.x : res.dock.point.y);
        localBranchPolys.push(res.points);
        branchResults.push({ edge, entity: memberEnd.entity, ...res });
      }
      if (!branchesOk || branchResults.length < 2) continue;

      const minMemberPos = Math.min(...branchResults.map((b) => b.joinAlong));
      const maxMemberPos = Math.max(...branchResults.map((b) => b.joinAlong));

      // 2. Route hub segment (direct facing side first, else DE-2 routed via hubCenter / cross-gutter joins).
      const hubFacingSide: PortSide = horizontal
        ? hubCenter.y < trackCoord
          ? "south"
          : "north"
        : hubCenter.x < trackCoord
          ? "east"
          : "west";
      const hubAlongIdeal = horizontal ? hubCenter.x : hubCenter.y;
      const hubJoinCandidates = [
        hubAlongIdeal,
        ...[...crossGutterMids].sort((a, b) => Math.abs(a - hubAlongIdeal) - Math.abs(b - hubAlongIdeal)),
        Math.max(minMemberPos, Math.min(maxMemberPos, hubAlongIdeal)),
        (minMemberPos + maxMemberPos) / 2,
        minMemberPos,
        maxMemberPos,
      ];
      let hubSeg: { readonly dock: Dock; readonly points: readonly Vec2[]; readonly joinAlong: number } | undefined;
      for (const candidateAlong of hubJoinCandidates) {
        const candidate = routeEndToTrunk(
          group.hubEntity,
          hubRect,
          group.hubPort,
          hubFacingSide,
          trackCoord,
          candidateAlong,
          hubPassable,
          group.members[0]!.within,
          localSlots,
          localBranchPolys,
        );
        if (candidate !== undefined) {
          hubSeg = candidate;
          break;
        }
      }
      if (hubSeg === undefined) continue;

      const extentLo = Math.min(minMemberPos, hubSeg.joinAlong);
      const extentHi = Math.max(maxMemberPos, hubSeg.joinAlong);

      // 3. Spanning-cell check (§4.6 step 6): boundary must be uncrossed along extent inside the grid.
      if (!isCoveredByStrips(gutter, extentLo, extentHi, gridSpanLo, gridSpanHi)) continue;

      // 4. Track reservation overlap check on this gutter track.
      const existingIntervals = reservedTracks.get(trackKey) ?? [];
      if (existingIntervals.some(([lo, hi]) => extentLo < hi + routeSpacing - EPS && extentHi > lo - routeSpacing + EPS)) {
        continue;
      }

      // 5. Trunk clearance check against all non-passable obstacles and title barriers (including free-space extension past grid).
      const trunkStart: Vec2 = horizontal ? { x: clean(extentLo), y: clean(trackCoord) } : { x: clean(trackCoord), y: clean(extentLo) };
      const trunkEnd: Vec2 = horizontal ? { x: clean(extentHi), y: clean(trackCoord) } : { x: clean(trackCoord), y: clean(extentHi) };
      const allPassable = new Set<EntityRef>([...hubPassable]);
      for (const edge of group.members) for (const p of edge.passable) allPassable.add(p);
      if (!segmentClearsObstacles(trunkStart, trunkEnd, rects, barriers, allPassable, new Set(), borderClearance, false)) {
        continue;
      }

      // 6. Assemble member polylines & validate spacing against committed combs and borders!
      const candidateMemberPolys = new Map<RelationRef, readonly Vec2[]>();
      const candidateDocks = new Map<RelationRef, EdgeDocks>();
      const candidateChecked: CheckedRoute[] = [];
      const carrier = group.members[0]!.occurrence;
      const hubToTrunkPts = hubSeg.points; // dock -> join
      const trunkToHubPts = [...hubToTrunkPts].reverse(); // join -> dock
      const hubJoinPt: Vec2 = horizontal ? { x: clean(hubSeg.joinAlong), y: clean(trackCoord) } : { x: clean(trackCoord), y: clean(hubSeg.joinAlong) };

      for (const br of branchResults) {
        const occId = br.edge.occurrence as unknown as RelationRef;
        const memberJoinPt: Vec2 = horizontal ? { x: clean(br.joinAlong), y: clean(trackCoord) } : { x: clean(trackCoord), y: clean(br.joinAlong) };
        const rawPoints: Vec2[] =
          group.kind === "fan-in"
            ? [...br.points, memberJoinPt, hubJoinPt, ...trunkToHubPts]
            : [...hubToTrunkPts, hubJoinPt, memberJoinPt, ...[...br.points].reverse()];
        const simplified = simplifyRoute(rawPoints).map((p) => ({ x: clean(p.x), y: clean(p.y) }));
        candidateMemberPolys.set(occId, simplified);
        candidateDocks.set(
          occId,
          group.kind === "fan-in"
            ? { source: br.dock, target: hubSeg.dock }
            : { source: hubSeg.dock, target: br.dock },
        );
        const suppressArrow = group.kind === "fan-in" && br.edge.occurrence !== carrier;
        candidateChecked.push({
          id: String(br.edge.occurrence),
          source: String(br.edge.source.entity),
          target: String(br.edge.target.entity),
          points: simplified,
          ...(br.edge.source.port === undefined ? {} : { sourcePort: String(br.edge.source.port) }),
          ...(br.edge.target.port === undefined ? {} : { targetPort: String(br.edge.target.port) }),
          arrowhead: suppressArrow ? "none" : br.edge.arrowhead,
          passable: new Set([...br.edge.passable].map(String)),
          combGroupId: group.id,
        });
      }

      const audit = checkRouteSpacing({
        rects,
        routes: [...committedChecked, ...candidateChecked],
        routeSpacing,
        borderClearance,
        barriers,
      });
      if (audit.conflictCount > 0) continue;

      // Commit track, docks, polylines, and comb group!
      existingIntervals.push([extentLo, extentHi]);
      reservedTracks.set(trackKey, existingIntervals);
      reserveSlot(group.hubEntity, hubSeg.dock.side, horizontal ? hubSeg.dock.point.x : hubSeg.dock.point.y);
      for (const br of branchResults) {
        reserveSlot(br.entity, br.dock.side, horizontal ? br.dock.point.x : br.dock.point.y);
      }
      for (const [occId, poly] of candidateMemberPolys) {
        memberRoutes.set(occId, poly);
        reservedPolylines.push(poly);
      }
      for (const [occId, docks] of candidateDocks) {
        memberDocks.set(occId, docks);
      }
      for (const checked of candidateChecked) committedChecked.push(checked);
      for (const m of group.members) {
        memberCombId.set(String(m.occurrence), group.id);
        if (m.occurrence !== carrier) {
          suppressedLabels.add(String(m.occurrence));
          if (group.kind === "fan-in") suppressedArrowheads.add(String(m.occurrence));
        }
      }
      if (group.label !== undefined) carrierLabels.set(String(carrier), group.label);

      const joinPositions = [...branchResults.map((b) => b.joinAlong), hubSeg.joinAlong];
      groups.push({
        id: group.id,
        kind: group.kind,
        hub: group.hub,
        carrier,
        members: group.members.map((m) => m.occurrence),
        styleKey: group.styleKey,
        arrowhead: group.arrowhead,
        ...(group.label === undefined ? {} : { label: group.label }),
        trunkGutterId: gutter.id,
        trunk: [trunkStart, trunkEnd],
        trunkSegments: splitTrunkSegments(horizontal, trackCoord, joinPositions),
      });
      committed = true;
      break;
    }

    if (!committed) {
      fallbacks.push({
        hub: group.hub,
        members: group.members.map((m) => String(m.occurrence)),
        reason: "gutter-full",
      });
    }
  }

  return {
    groups,
    fallbacks,
    memberRoutes,
    memberDocks,
    memberCombId,
    suppressedLabels,
    suppressedArrowheads,
    carrierLabels,
    reservedSlots,
    reservedPolylines,
  };
}
