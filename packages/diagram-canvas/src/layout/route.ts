import { permuteFlowRuns } from "./flow-order.js";
/**
 * Orthogonal routing between docked ends, around obstacles.
 *
 * L-R3 (429c92a2) — bends minimised after docking; the route is the one this
 * exact search returns. Docks are fixed first (`dock.ts`); the router searches
 * orthogonal routes on the grid formed by obstacle boundaries grown by
 * `clearance`, the midline of every channel between two consecutive
 * boundaries, and the clearance point of every dock. Cost is the ordered pair
 * `(bends, weighted length)`, compared lexicographically: no length saving,
 * however large, compensates for one extra bend, and no finite bend
 * coefficient is used. A grid unit already used by an edge of another
 * unordered pair costs three times its length; a unit used by an edge of the
 * same pair is forbidden outright (L-R9). A move that would make the route
 * transversally cross an already routed edge of the same pair is likewise
 * forbidden: the candidate's full route, as assembled and simplified (its two
 * dock-to-clearance joins included, see L-R9), may contain no point interior
 * to both one of its segments and one segment of that earlier route, and the
 * search must not return a route — grid part or dock-to-clearance join — that
 * contains such a point. The search is A* with the pair heuristic
 * `(t, |dx| + |dy|)` to the target clearance point — an admissible lower bound
 * on each component, since `m >= 1` — where `t` is the remaining-turns lower
 * bound below. Estimated totals are the componentwise sum `g + h`, themselves
 * compared lexicographically. The frontier is a heap ordered by (estimated
 * bends, estimated weighted length, state index); a state is closed when
 * popped and never reopened; a neighbour replaces the recorded cost and
 * parent only on a strictly smaller `(bends, weighted length)` pair, so on an
 * exact pair tie the parent recorded first — by the earliest popped
 * predecessor, neighbours tried east, south, west, north — is kept; the
 * virtual goal likewise keeps the first parent achieving the smallest closing
 * pair and is popped after every state of equal estimated pair. Requests are
 * routed in ascending relation id, so an earlier relation occupies the grid
 * first; the route is the parent chain of that goal, dock to dock with
 * collinear points removed. Nothing is reserved before the final choice
 * between the searched route and the fallback: the fixed route — searched
 * or fallback elbow — then reserves every grid unit it traverses, so a
 * fallback still penalises the routes that follow. The returned route is lexicographically minimal:
 * first the bend count, then the weighted length; among routes equal on both,
 * the heap discipline above selects the route. If the grid holds no route
 * admissible under L-R8 and L-R9 (the transversal ban included), the fallback
 * elbow is fixed (see below) and reported `route-obstructed` for that
 * relation: for that relation only the elbow is an accepted exception to
 * L-R8 *and* L-R9 (it may cross an obstacle interior, share a segment with a
 * same-pair edge, or transversally cross one); no claim is made that either
 * held for it, and every other relation keeps both.
 *
 * L-R8 — edges across containers. Every entity is an obstacle except the strict
 * ancestors of either end: an edge may cross only the boundaries of its own
 * ancestors. Every other node and container is an obstacle grown by
 * `clearance`, and a route segment runs ON a grown boundary at most, never
 * through an obstacle interior. The only accepted exception is the
 * `route-obstructed` fallback above, reported per relation.
 *
 * L-R9 (429c92a2) — parallel edges take distinct docking slots under L-R2 and
 * their slot order is the same at both ends. That order alone does not settle
 * crossings, and two further bans hold on the full simplified routes, dock to
 * dock, the dock-to-clearance joins (dock to its clearance point, dock + exit
 * · `clearance`, at both ends) included: they never share a segment — the
 * router forbids a grid unit already used by an edge of the same unordered
 * entity pair to the next such edge — and they never cross transversally: no
 * segment of one route meets a segment of another route of the pair at a
 * point interior to both segments. L-R3's search enforces both bans against
 * the routes already fixed (ascending relation id); when no route satisfying
 * them (and L-R8) remains, the relation takes the `route-obstructed`
 * fallback instead of a crossing route. The sole exception is that
 * `route-obstructed` elbow (L-R3), for that relation only.
 *
 * A route is [dock, dock + exit * clearance, ...grid corners..., clearance point,
 * dock], with collinear points removed.
 */

import type { EntityRef, RelationRef } from "@sentropic/diagram-core";

import type { Rect, Vec2 } from "../transform.js";

export interface RouteRequest {
  readonly flowRank?: number;
  readonly flowRun?: string;
  readonly id: RelationRef;
  /** The two entities, sorted and joined: equal for parallel edges (L-R9). */
  readonly pairKey: string;
  readonly start: Vec2;
  readonly startExit: Vec2;
  readonly end: Vec2;
  /** Unit vector the route would LEAVE the end along; it arrives along the opposite. */
  readonly endExit: Vec2;
  /** Entities that are not obstacles for this edge (L-R8). */
  readonly passable: ReadonlySet<EntityRef>;
  /**
   * The route stays inside this rectangle (DC-2a BF-3: the content box of the
   * expanded container both ends share). When no admissible route exists
   * inside it, the search runs once more without it and the relation is
   * reported in `RouteOutcome.escaped`.
   */
  readonly within?: Rect;
}

export interface RouteOutcome {
  readonly routes: ReadonlyMap<RelationRef, readonly Vec2[]>;
  readonly obstructed: readonly RelationRef[];
  /** Relations routed outside their `within` rectangle because no route exists inside it. */
  readonly escaped: readonly RelationRef[];
}

/** L-R9 applies to full dock-to-dock routes, including clearance joins. */
export function routesConflict(left: readonly Vec2[], right: readonly Vec2[]): boolean {
  return fullSharesSegment(left, right) || left.slice(1).some((point, i) =>
    right.slice(1).some((other, j) => segmentsCrossTransversal(left[i]!, point, right[j]!, other)),
  );
}

const SPACING_EPS = 1e-4;

/**
 * Subdivide a clear corridor `[low, high]` (between two consecutive grown
 * boundaries) into parallel routing tracks spaced by at least `routeSpacing`.
 * Always deterministic and symmetric around the corridor midpoint.
 */
export function subdivideChannelTracks(low: number, high: number, routeSpacing: number): number[] {
  const span = high - low;
  if (!(span >= 0) || !Number.isFinite(span)) return [];
  const mid = (low + high) / 2;
  if (!(routeSpacing > 0) || !Number.isFinite(routeSpacing) || span < routeSpacing - SPACING_EPS) {
    return [mid];
  }
  const count = Math.min(16, Math.floor((span + SPACING_EPS) / routeSpacing) + 1);
  if (count <= 1) return [mid];
  const tracks: number[] = [];
  for (let k = 0; k < count; k += 1) {
    tracks.push(mid + (k - (count - 1) / 2) * routeSpacing);
  }
  return tracks;
}

/**
 * BF-6: try horizontal label channels without changing any box or gutter.
 * Dock joins keep their outward normals. Every full candidate is checked
 * against raw obstacles, containment, same-pair bans and optional minimum
 * route spacing / border clearance.
 */
export function labelDetour(input: {
  readonly request: RouteRequest;
  readonly shapes: readonly Rect[];
  readonly earlier: readonly (readonly Vec2[])[];
  readonly xs: readonly number[];
  readonly ys: readonly number[];
  readonly accepts: (points: readonly Vec2[]) => boolean;
  /** Dock exit stub length (defaults to 2 for legacy callers; measured layout passes `borderClearance`). */
  readonly step?: number;
  /** All other fixed routes to preserve cross-pair spacing against when `routeSpacing > 0`. */
  readonly allFixed?: readonly (readonly Vec2[])[];
  readonly routeSpacing?: number;
  readonly borderClearance?: number;
  /** Expanded ancestor zone rects whose parallel borders must keep `borderClearance` (crossings allowed). */
  readonly passableZones?: readonly Rect[];
}): readonly Vec2[] | undefined {
  const { request, shapes, earlier } = input;
  const step = input.step ?? 2;
  const routeSpacing = input.routeSpacing ?? 0;
  const borderClearance = input.borderClearance ?? 0;
  const allFixed = input.allFixed ?? [];
  const passableZones = input.passableZones ?? [];
  const s = { x: request.start.x + step * request.startExit.x, y: request.start.y + step * request.startExit.y };
  const t = { x: request.end.x + step * request.endExit.x, y: request.end.y + step * request.endExit.y };
  const clear = (points: readonly Vec2[]): boolean => {
    const within = request.within;
    if (within !== undefined && points.some((p) => p.x < within.x || p.x > within.x + within.width || p.y < within.y || p.y > within.y + within.height)) return false;
    const lastIdx = points.length - 1;
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1]!;
      const b = points[i]!;
      if (shapes.some((r) => a.y === b.y
        ? a.y > r.y && a.y < r.y + r.height && Math.max(Math.min(a.x, b.x), r.x) < Math.min(Math.max(a.x, b.x), r.x + r.width)
        : a.x > r.x && a.x < r.x + r.width && Math.max(Math.min(a.y, b.y), r.y) < Math.min(Math.max(a.y, b.y), r.y + r.height))) return false;
      if (borderClearance > 0) {
        const minX = Math.min(a.x, b.x);
        const maxX = Math.max(a.x, b.x);
        const minY = Math.min(a.y, b.y);
        const maxY = Math.max(a.y, b.y);
        const isFirst = i === 1;
        const isLast = i === lastIdx;
        for (const r of shapes) {
          // Endpoint boxes legitimately touch the start/end dock of the first/last leg.
          if (isFirst && pointOnRectBorder(request.start, r)) continue;
          if (isLast && pointOnRectBorder(request.end, r)) continue;
          const dx = maxX < r.x ? r.x - maxX : minX > r.x + r.width ? minX - (r.x + r.width) : 0;
          const dy = maxY < r.y ? r.y - maxY : minY > r.y + r.height ? minY - (r.y + r.height) : 0;
          if (Math.hypot(dx, dy) < borderClearance - SPACING_EPS) return false;
        }
        for (const z of passableZones) {
          if (isFirst && pointOnRectBorder(request.start, z)) continue;
          if (isLast && pointOnRectBorder(request.end, z)) continue;
          if (Math.abs(a.y - b.y) <= SPACING_EPS && Math.abs(a.x - b.x) > SPACING_EPS) {
            const y = (a.y + b.y) / 2;
            const dx = maxX < z.x ? z.x - maxX : minX > z.x + z.width ? minX - (z.x + z.width) : 0;
            if (Math.hypot(dx, Math.abs(y - z.y)) < borderClearance - SPACING_EPS
              || Math.hypot(dx, Math.abs(y - (z.y + z.height))) < borderClearance - SPACING_EPS) return false;
          } else if (Math.abs(a.x - b.x) <= SPACING_EPS && Math.abs(a.y - b.y) > SPACING_EPS) {
            const x = (a.x + b.x) / 2;
            const dy = maxY < z.y ? z.y - maxY : minY > z.y + z.height ? minY - (z.y + z.height) : 0;
            if (Math.hypot(Math.abs(x - z.x), dy) < borderClearance - SPACING_EPS
              || Math.hypot(Math.abs(x - (z.x + z.width)), dy) < borderClearance - SPACING_EPS) return false;
          }
        }
      }
      if (sharesSamePair(a, b, earlier) || crossesSamePair(a, b, earlier)) return false;
      if (routeSpacing > 0 && violatesParallelSpacing(a, b, allFixed, routeSpacing)) return false;
      // Reject a folded-back leg or a self intersection after simplification.
      for (let j = 1; j < i - 1; j += 1) {
        const c = points[j - 1]!;
        const d = points[j]!;
        if (fullSharesSegment([a, b], [c, d]) || segmentsCrossTransversal(a, b, c, d)) return false;
        if (routeSpacing > 0 && segmentsCloserThan(a, b, c, d, routeSpacing)) return false;
      }
    }
    if (routeSpacing > 0 && points.length > 2) {
      for (let i = 1; i < points.length - 1; i += 1) {
        const elbow = points[i]!;
        for (const other of allFixed) {
          for (let k = 1; k < other.length - 1; k += 1) {
            if (Math.hypot(elbow.x - other[k]!.x, elbow.y - other[k]!.y) < routeSpacing - SPACING_EPS) return false;
          }
        }
      }
    }
    const first = points[1]!;
    const last = points[points.length - 2]!;
    return (first.x - request.start.x) * request.startExit.x + (first.y - request.start.y) * request.startExit.y > 0
      && (last.x - request.end.x) * request.endExit.x + (last.y - request.end.y) * request.endExit.y > 0;
  };
  let best: readonly Vec2[] | undefined;
  let bestLength = Infinity;
  const tryRoute = (middle: readonly Vec2[]): void => {
    const points = simplifyRoute([request.start, s, ...middle, t, request.end]);
    if (best !== undefined && points.length > best.length) return;
    const length = points.slice(1).reduce((sum, p, i) => sum + Math.abs(p.x - points[i]!.x) + Math.abs(p.y - points[i]!.y), 0);
    if (best !== undefined && points.length === best.length && length >= bestLength) return;
    if (!clear(points) || !input.accepts(points)) return;
    best = points;
    bestLength = length;
  };
  for (const y of input.ys) {
    tryRoute([{ x: s.x, y }, { x: t.x, y }]);
    for (const x of input.xs) {
      tryRoute([{ x, y: s.y }, { x, y }, { x: t.x, y }]);
      tryRoute([{ x: s.x, y }, { x, y }, { x, y: t.y }]);
    }
  }
  return best;
}

const OVERLAP_PENALTY = 2;
const DX = [1, 0, -1, 0] as const;
const DY = [0, 1, 0, -1] as const;

function pointOnRectBorder(point: Vec2, rect: Rect): boolean {
  const onX = (Math.abs(point.x - rect.x) <= SPACING_EPS || Math.abs(point.x - (rect.x + rect.width)) <= SPACING_EPS)
    && point.y >= rect.y - SPACING_EPS && point.y <= rect.y + rect.height + SPACING_EPS;
  const onY = (Math.abs(point.y - rect.y) <= SPACING_EPS || Math.abs(point.y - (rect.y + rect.height)) <= SPACING_EPS)
    && point.x >= rect.x - SPACING_EPS && point.x <= rect.x + rect.width + SPACING_EPS;
  return onX || onY;
}

function segmentsCloserThan(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2, minSpacing: number): boolean {
  if (Math.abs(a1.y - a2.y) <= SPACING_EPS && Math.abs(b1.y - b2.y) <= SPACING_EPS) {
    if (Math.abs(a1.y - b1.y) >= minSpacing - SPACING_EPS) return false;
    const overlap = Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
    return overlap > SPACING_EPS;
  }
  if (Math.abs(a1.x - a2.x) <= SPACING_EPS && Math.abs(b1.x - b2.x) <= SPACING_EPS) {
    if (Math.abs(a1.x - b1.x) >= minSpacing - SPACING_EPS) return false;
    const overlap = Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
    return overlap > SPACING_EPS;
  }
  return false;
}

function violatesParallelSpacing(a1: Vec2, a2: Vec2, routes: readonly (readonly Vec2[])[], minSpacing: number): boolean {
  if (Math.abs(a1.x - a2.x) <= SPACING_EPS && Math.abs(a1.y - a2.y) <= SPACING_EPS) return false;
  for (const route of routes) {
    for (let j = 1; j < route.length; j += 1) {
      if (segmentsCloserThan(a1, a2, route[j - 1]!, route[j]!, minSpacing)) return true;
    }
  }
  return false;
}

/** Two orthogonal full routes share a segment: a collinear overlap of positive length. */
function fullSharesSegment(left: readonly Vec2[], right: readonly Vec2[]): boolean {
  for (let i = 1; i < left.length; i += 1) {
    for (let j = 1; j < right.length; j += 1) {
      const a1 = left[i - 1]!;
      const a2 = left[i]!;
      const b1 = right[j - 1]!;
      const b2 = right[j]!;
      if (a1.y === a2.y && b1.y === b2.y && a1.y === b1.y) {
        const overlap =
          Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
        if (overlap > 0) return true;
      }
      if (a1.x === a2.x && b1.x === b2.x && a1.x === b1.x) {
        const overlap =
          Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
        if (overlap > 0) return true;
      }
    }
  }
  return false;
}

/** One horizontal and one vertical segment meet at a point interior to both. */
function segmentsCrossTransversal(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  const aHoriz = a1.y === a2.y && a1.x !== a2.x;
  const aVert = a1.x === a2.x && a1.y !== a2.y;
  const bHoriz = b1.y === b2.y && b1.x !== b2.x;
  const bVert = b1.x === b2.x && b1.y !== b2.y;
  if (aHoriz && bVert) {
    const x = b1.x;
    const y = a1.y;
    return (
      x > Math.min(a1.x, a2.x) && x < Math.max(a1.x, a2.x) && y > Math.min(b1.y, b2.y) && y < Math.max(b1.y, b2.y)
    );
  }
  if (aVert && bHoriz) {
    const x = a1.x;
    const y = b1.y;
    return (
      x > Math.min(b1.x, b2.x) && x < Math.max(b1.x, b2.x) && y > Math.min(a1.y, a2.y) && y < Math.max(a1.y, a2.y)
    );
  }
  return false;
}

/** A candidate segment meets any earlier same-pair segment transversally. */
function crossesSamePair(
  a1: Vec2,
  a2: Vec2,
  earlier: readonly (readonly Vec2[])[],
): boolean {
  if (a1.x === a2.x && a1.y === a2.y) return false;
  for (const route of earlier) {
    for (let j = 1; j < route.length; j += 1) {
      if (segmentsCrossTransversal(a1, a2, route[j - 1]!, route[j]!)) return true;
    }
  }
  return false;
}

/** A candidate segment shares positive length with any earlier same-pair segment. */
function sharesSamePair(
  a1: Vec2,
  a2: Vec2,
  earlier: readonly (readonly Vec2[])[],
): boolean {
  if (a1.x === a2.x && a1.y === a2.y) return false;
  for (const route of earlier) {
    for (let j = 1; j < route.length; j += 1) {
      const b1 = route[j - 1]!;
      const b2 = route[j]!;
      if (a1.y === a2.y && b1.y === b2.y && a1.y === b1.y) {
        const overlap =
          Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
        if (overlap > 0) return true;
      } else if (a1.x === a2.x && b1.x === b2.x && a1.x === b1.x) {
        const overlap =
          Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
        if (overlap > 0) return true;
      }
    }
  }
  return false;
}

const headingOf = (vector: Vec2): number =>
  vector.x > 0 ? 0 : vector.y > 0 ? 1 : vector.x < 0 ? 2 : 3;

/** Fewest turns from `p` heading `h` to `t` arriving heading `ht`, ignoring obstacles, capped at 2. */
function turnsLowerBound(px: number, py: number, h: number, tx: number, ty: number, ht: number): number {
  const vx = tx - px;
  const vy = ty - py;
  if (vx === 0 && vy === 0) return h === ht ? 0 : (h + 2) % 4 === ht ? 2 : 1;
  const along = vx * DX[h]! + vy * DY[h]!;
  const across = vx * DY[h]! - vy * DX[h]!;
  if (h === ht && across === 0 && along > 0) return 0;
  if (h % 2 !== ht % 2 && along >= 0 && vx * DX[ht]! + vy * DY[ht]! >= 0) return 1;
  return 2;
}

/** Remove repeated and collinear points. */
export function simplifyRoute(points: readonly Vec2[]): Vec2[] {
  const unique: Vec2[] = [];
  for (const point of points) {
    const last = unique[unique.length - 1];
    if (last === undefined || last.x !== point.x || last.y !== point.y) unique.push(point);
  }
  const result: Vec2[] = [];
  for (const point of unique) {
    while (result.length >= 2) {
      const a = result[result.length - 2]!;
      const b = result[result.length - 1]!;
      const collinear = (a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y);
      if (!collinear) break;
      result.pop();
    }
    result.push(point);
  }
  return result;
}

/** Bends of an orthogonal route: its interior points once collinear ones are removed. */
export function bendCount(points: readonly Vec2[]): number {
  return Math.max(0, simplifyRoute(points).length - 2);
}

/**
 * Frontier heap ordered by (estimated bends, estimated weighted length, state
 * index), with strict componentwise comparisons exactly as specified: an
 * exact pair tie keeps the first-recorded parent, and the heap discipline
 * above selects the route among routes equal on both. The state index is
 * the largest on a tie for the virtual goal, so it pops after every state
 * of equal estimated pair. The backing arrays are kept across requests with
 * a logical count (never cleared, no `pop()`): only `count` resets.
 */
class LexHeap {
  private readonly bends: number[] = [];
  private readonly lens: number[] = [];
  private readonly states: number[] = [];
  private count = 0;

  get size(): number {
    return this.count;
  }

  clear(): void {
    this.count = 0;
  }

  push(estBends: number, estLen: number, state: number): void {
    const bends = this.bends;
    const lens = this.lens;
    const states = this.states;
    let index = this.count++;
    if (index < bends.length) {
      bends[index] = estBends;
      lens[index] = estLen;
      states[index] = state;
    } else {
      bends.push(estBends);
      lens.push(estLen);
      states.push(state);
    }
    while (index > 0) {
      const parent = (index - 1) >> 1;
      const pb = bends[parent]!;
      const pl = lens[parent]!;
      const ps = states[parent]!;
      const less = estBends !== pb ? estBends < pb : estLen !== pl ? estLen < pl : state < ps;
      if (!less) break;
      bends[index] = pb;
      lens[index] = pl;
      states[index] = ps;
      index = parent;
    }
    bends[index] = estBends;
    lens[index] = estLen;
    states[index] = state;
  }

  pop(): number {
    const bends = this.bends;
    const lens = this.lens;
    const states = this.states;
    const top = states[0]!;
    const length = --this.count;
    const lastB = bends[length]!;
    const lastL = lens[length]!;
    const lastS = states[length]!;
    if (length > 0) {
      let index = 0;
      for (;;) {
        const left = 2 * index + 1;
        if (left >= length) break;
        const right = left + 1;
        let child = left;
        if (right < length) {
          const lb = bends[left]!;
          const ll = lens[left]!;
          const ls = states[left]!;
          const rb = bends[right]!;
          const rl = lens[right]!;
          const rs = states[right]!;
          const rightLess = rb !== lb ? rb < lb : rl !== ll ? rl < ll : rs < ls;
          if (rightLess) child = right;
        }
        const cb = bends[child]!;
        const cl = lens[child]!;
        const cs = states[child]!;
        const childLess = cb !== lastB ? cb < lastB : cl !== lastL ? cl < lastL : cs < lastS;
        if (!childLess) break;
        bends[index] = cb;
        lens[index] = cl;
        states[index] = cs;
        index = child;
      }
      bends[index] = lastB;
      lens[index] = lastL;
      states[index] = lastS;
    }
    return top;
  }
}

interface Obstacle {
  readonly id: EntityRef;
  readonly iL: number;
  readonly iR: number;
  readonly jT: number;
  readonly jB: number;
}

export function routeEdges(input: {
  readonly rects: ReadonlyMap<EntityRef, Rect>;
  readonly requests: readonly RouteRequest[];
  readonly clearance: number;
  /**
   * Minimum world-unit spacing between parallel segments and neighbouring elbows
   * across all routes (DE-2 ask 2). When positive, channels are subdivided into
   * parallel tracks at this pitch and A* runs a strict-spacing tier before
   * falling back to cross-pair relaxation if capacity is exhausted.
   */
  readonly routeSpacing?: number;
  /** Inflation applied to `barriers` (title bands); defaults to `clearance`. */
  readonly barrierClearance?: number;
  /**
   * Rectangles no route may cross, whatever its ends: they belong to no
   * entity, so no request can list them as passable. The row-pack path passes
   * the title band of every expanded container (a route may cross the wall of
   * its own ancestor, never the title drawn inside it).
   */
  readonly barriers?: readonly Rect[];
  /**
   * Extra grid lines, beside the ones the obstacles give. The row-pack path
   * passes horizontal lanes outside the drawing, one label pitch apart, so
   * routes that would otherwise share the single clearance line round the
   * drawing each take their own lane — and each lane holds its own label.
   */
  readonly lanes?: { readonly xs: readonly number[]; readonly ys: readonly number[] };
  /** Measured layouts avoid raw interiors even when routing is obstructed. */
  readonly avoidFallbackInteriors?: boolean;
  /** Optional priority subset routed before other requests (deterministic conflict repair). */
  readonly priority?: ReadonlySet<RelationRef>;
}): RouteOutcome {
  const { rects, requests, clearance } = input;
  const routeSpacing = input.routeSpacing !== undefined && input.routeSpacing > 0 ? input.routeSpacing : 0;
  const useSpacing = routeSpacing > 0;
  const barrierPad = input.barrierClearance ?? clearance;
  const entities = [...rects.keys()].sort();

  const grow = (id: EntityRef, rect: Rect, pad: number = clearance) => ({
    id,
    left: rect.x - pad,
    right: rect.x + rect.width + pad,
    top: rect.y - pad,
    bottom: rect.y + rect.height + pad,
  });
  const grown = [
    ...entities.map((id) => grow(id, rects.get(id)!, clearance)),
    // Synthetic ids: never an entity reference, hence never in `passable`.
    ...(input.barriers ?? []).map((rect, index) => grow(`barrier:${String(index)}` as EntityRef, rect, barrierPad)),
  ];

  const withChannels = (pairs: readonly (readonly [number, number])[]): number[] => {
    const starts = new Set<number>();
    const ends = new Set<number>();
    const values: number[] = [];
    for (const [lo, hi] of pairs) {
      starts.add(lo);
      ends.add(hi);
      values.push(lo, hi);
    }
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    const tracks: number[] = [];
    for (let index = 1; index < sorted.length; index += 1) {
      const low = sorted[index - 1]!;
      const high = sorted[index]!;
      const span = high - low;
      if (useSpacing) {
        const isCorridor = ends.has(low) && starts.has(high);
        if (isCorridor && span <= 300) {
          tracks.push(...subdivideChannelTracks(low, high, routeSpacing));
        } else {
          tracks.push((low + high) / 2);
          if (isCorridor) {
            if (low + routeSpacing < high - routeSpacing) {
              tracks.push(low + routeSpacing, high - routeSpacing);
            }
          }
        }
      } else {
        tracks.push((low + high) / 2);
      }
    }
    return [...sorted, ...tracks];
  };
  const clearancePoint = (point: Vec2, exit: Vec2): Vec2 => ({
    x: point.x + exit.x * clearance,
    y: point.y + exit.y * clearance,
  });

  const xValues = withChannels(grown.map((box) => [box.left, box.right] as const));
  const yValues = withChannels(grown.map((box) => [box.top, box.bottom] as const));
  // When spacing is active, add outer perimeter tracks spaced by `routeSpacing`
  // around the drawing so routes overflowing an interior channel can detour cleanly,
  // plus inner clearance lines for passable ancestor zones.
  if (useSpacing && rects.size > 0) {
    const passableIds = new Set<EntityRef>();
    for (const req of requests) for (const id of req.passable) passableIds.add(id);
    for (const id of passableIds) {
      const r = rects.get(id);
      if (r === undefined) continue;
      if (r.width > 2 * clearance) xValues.push(r.x + clearance, r.x + r.width - clearance);
      if (r.height > 2 * clearance) yValues.push(r.y + clearance, r.y + r.height - clearance);
    }
    if (requests.length > 1) {
      const rawList = [...rects.values()];
      const minX = Math.min(...rawList.map((r) => r.x)) - clearance;
      const maxX = Math.max(...rawList.map((r) => r.x + r.width)) + clearance;
      const minY = Math.min(...rawList.map((r) => r.y)) - clearance;
      const maxY = Math.max(...rawList.map((r) => r.y + r.height)) + clearance;
      const perimeterTracks = Math.min(Math.max(4, Math.ceil(requests.length / 3)), 6);
      for (let k = 1; k <= perimeterTracks; k += 1) {
        xValues.push(minX - k * routeSpacing, maxX + k * routeSpacing);
        yValues.push(minY - k * routeSpacing, maxY + k * routeSpacing);
      }
    }
  }
  for (const request of requests) {
    for (const point of [clearancePoint(request.start, request.startExit), clearancePoint(request.end, request.endExit)]) {
      xValues.push(point.x);
      yValues.push(point.y);
    }
  }
  for (const x of input.lanes?.xs ?? []) xValues.push(x);
  for (const y of input.lanes?.ys ?? []) yValues.push(y);
  const xs = [...new Set(xValues)].sort((a, b) => a - b);
  const ys = [...new Set(yValues)].sort((a, b) => a - b);
  const xIndex = new Map(xs.map((value, index) => [value, index]));
  const yIndex = new Map(ys.map((value, index) => [value, index]));
  const nx = xs.length;
  const ny = ys.length;

  // Coverage of every grid unit by obstacle interiors, by 2D difference arrays.
  const obstacles: Obstacle[] = grown.map((box) => ({
    id: box.id,
    iL: xIndex.get(box.left)!,
    iR: xIndex.get(box.right)!,
    jT: yIndex.get(box.top)!,
    jB: yIndex.get(box.bottom)!,
  }));
  const stride = nx + 1;
  const diffH = new Int32Array((nx + 1) * (ny + 1));
  const diffV = new Int32Array((nx + 1) * (ny + 1));
  const addRange = (diff: Int32Array, i0: number, i1: number, j0: number, j1: number) => {
    if (i0 > i1 || j0 > j1) return;
    diff[j0 * stride + i0]! += 1;
    diff[j0 * stride + i1 + 1]! -= 1;
    diff[(j1 + 1) * stride + i0]! -= 1;
    diff[(j1 + 1) * stride + i1 + 1]! += 1;
  };
  for (const o of obstacles) {
    addRange(diffH, o.iL, o.iR - 1, o.jT + 1, o.jB - 1);
    addRange(diffV, o.iL + 1, o.iR - 1, o.jT, o.jB - 1);
  }
  const coverH = new Int32Array(nx * ny);
  const coverV = new Int32Array(nx * ny);
  for (let j = 0; j < ny; j += 1) {
    let rowH = 0;
    let rowV = 0;
    for (let i = 0; i < nx; i += 1) {
      rowH += diffH[j * stride + i]!;
      rowV += diffV[j * stride + i]!;
      const above = j > 0 ? 1 : 0;
      coverH[j * nx + i] = rowH + (above ? coverH[(j - 1) * nx + i]! : 0);
      coverV[j * nx + i] = rowV + (above ? coverV[(j - 1) * nx + i]! : 0);
    }
  }
  // The running sums above accumulate row prefix sums over a column prefix:
  // standard 2D prefix of a difference array.

  const coversH = (o: Obstacle, i: number, j: number) => i >= o.iL && i <= o.iR - 1 && j > o.jT && j < o.jB;
  const coversV = (o: Obstacle, i: number, j: number) => i > o.iL && i < o.iR && j >= o.jT && j <= o.jB - 1;

  const nPoints = nx * ny;
  const nStates = nPoints * 4;
  // Lexicographic `g`: bend count first, weighted length next. No finite bend
  // coefficient is used (429c92a2).
  const gBends = new Int32Array(nStates);
  const gLen = new Float64Array(nStates);
  // Start of the current straight run, as grid indices: the last bend point,
  // or the start clearance point while the run has not bent yet. Used to check
  // the whole simplified segment — not just the new unit — against earlier
  // same-pair routes, so a crossing at a collinear joint (interior to the
  // simplified segment, endpoint of its units) is still forbidden.
  const runSI = new Int32Array(nStates);
  const runSJ = new Int32Array(nStates);
  const stamp = new Int32Array(nStates);
  const closed = new Int32Array(nStates);
  const parent = new Int32Array(nStates);
  // Integer pair ids intern `pairKey` strings once per direction: occupancy
  // equality is by id, never by string compare on the hot path. The mapping
  // is a bijection, so the exact sharing/penalty semantics are unchanged.
  // The primary store is an `Int32Array(2·nx·ny)` holding `firstPairId + 1`
  // (0 when empty); a `Map` keeps only the extra pair ids of units used by
  // more than one pair. Grid, costs and comparator are unchanged.
  const pairIds = new Map<string, number>();
  const firstUser = new Int32Array(2 * nx * ny);
  const extraUsers = new Map<number, number[]>();
  const isOccupied = (unit: number): boolean => firstUser[unit]! !== 0;
  const isUsedBy = (unit: number, pid: number): boolean => {
    const first = firstUser[unit]!;
    if (first === 0) return false;
    if (first === pid + 1) return true;
    const extra = extraUsers.get(unit);
    return extra !== undefined && extra.includes(pid);
  };
  const addUser = (unit: number, pid: number): void => {
    const first = firstUser[unit]!;
    if (first === 0) {
      firstUser[unit] = pid + 1;
      return;
    }
    if (first === pid + 1) return;
    const extra = extraUsers.get(unit);
    if (extra === undefined) extraUsers.set(unit, [pid]);
    else if (!extra.includes(pid)) extra.push(pid);
  };
  // Reserve every grid unit of an orthogonal grid path (consecutive points
  // share an `x` or a `y`): the fallback elbow's units, like a searched
  // route's, penalise later pairs.
  const reserveGridPath = (points: readonly Vec2[], pid: number): void => {
    for (let k = 1; k < points.length; k += 1) {
      const a = points[k - 1]!;
      const b = points[k]!;
      const ai = xIndex.get(a.x);
      const aj = yIndex.get(a.y);
      const bi = xIndex.get(b.x);
      const bj = yIndex.get(b.y);
      if (ai === undefined || aj === undefined || bi === undefined || bj === undefined) continue;
      if (aj === bj) {
        const lo = Math.min(ai, bi);
        const hi = Math.max(ai, bi);
        for (let u = lo; u < hi; u += 1) addUser((aj * nx + u) * 2, pid);
      } else if (ai === bi) {
        const lo = Math.min(aj, bj);
        const hi = Math.max(aj, bj);
        for (let u = lo; u < hi; u += 1) addUser((u * nx + ai) * 2 + 1, pid);
      }
    }
  };
  // Full simplified routes per unordered pair, dock to dock, joins included:
  // the L-R9 bans (shared segment, transversal crossing) are enforced against
  // these, and reserved through them.
  const pairFull = new Map<string, (readonly Vec2[])[]>();
  // Cross-pair spacing state (active only when `useSpacing` is true).
  const fixedH: { readonly y: number; readonly lo: number; readonly hi: number }[] = [];
  const fixedV: { readonly x: number; readonly lo: number; readonly hi: number }[] = [];
  const fixedElbows: Vec2[] = [];
  const recordFixedRoute = (full: readonly Vec2[]): void => {
    if (!useSpacing) return;
    for (let k = 1; k < full.length; k += 1) {
      const a = full[k - 1]!;
      const b = full[k]!;
      if (Math.abs(a.y - b.y) <= SPACING_EPS && Math.abs(a.x - b.x) > SPACING_EPS) {
        fixedH.push({ y: (a.y + b.y) / 2, lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x) });
      } else if (Math.abs(a.x - b.x) <= SPACING_EPS && Math.abs(a.y - b.y) > SPACING_EPS) {
        fixedV.push({ x: (a.x + b.x) / 2, lo: Math.min(a.y, b.y), hi: Math.max(a.y, b.y) });
      }
    }
    for (let k = 1; k + 1 < full.length; k += 1) {
      fixedElbows.push(full[k]!);
    }
  };
  let generation = 0;
  const heap = new LexHeap();

  const routes = new Map<RelationRef, readonly Vec2[]>();
  const obstructed: RelationRef[] = [];
  const escaped: RelationRef[] = [];

  const elbowFor = (startPoint: Vec2, endPoint: Vec2, startExit: Vec2): Vec2[] => {
    if (startPoint.x === endPoint.x || startPoint.y === endPoint.y) return [];
    return startExit.x !== 0 ? [{ x: endPoint.x, y: startPoint.y }] : [{ x: startPoint.x, y: endPoint.y }];
  };
  // MAJ-2: blind single-elbow fallback sliced through cards. Test both elbow
  // orientations and outer-perimeter 2-bend detours against the raw
  // (uninflated) obstacle rectangles before falling back.
  const rawRects: Rect[] = [...rects.values(), ...(input.barriers ?? [])];
  const throughRaw = (a: Vec2, b: Vec2): number => {
    let hits = 0;
    for (const rect of rawRects) {
      const left = rect.x;
      const right = rect.x + rect.width;
      const top = rect.y;
      const bottom = rect.y + rect.height;
      if (a.y === b.y) {
        if (a.y > top && a.y < bottom && Math.max(Math.min(a.x, b.x), left) < Math.min(Math.max(a.x, b.x), right)) hits += 1;
      } else if (a.x === b.x) {
        if (a.x > left && a.x < right && Math.max(Math.min(a.y, b.y), top) < Math.min(Math.max(a.y, b.y), bottom)) hits += 1;
      }
    }
    return hits;
  };
  const crossingsOf = (points: readonly Vec2[]): number => {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) total += throughRaw(points[i - 1]!, points[i]!);
    return total;
  };
  const bestFallback = (start: Vec2, startPoint: Vec2, endPoint: Vec2, end: Vec2, startExit: Vec2): Vec2[] => {
    const candidates: Vec2[][] = [];
    if (startPoint.x !== endPoint.x && startPoint.y !== endPoint.y) {
      candidates.push([{ x: endPoint.x, y: startPoint.y }]);
      candidates.push([{ x: startPoint.x, y: endPoint.y }]);
    }
    // Outer-perimeter 2-bend detours round the whole obstacle field.
    if (rawRects.length > 0) {
      const minX = Math.min(...rawRects.map((r) => r.x)) - clearance - 4;
      const maxX = Math.max(...rawRects.map((r) => r.x + r.width)) + clearance + 4;
      const minY = Math.min(...rawRects.map((r) => r.y)) - clearance - 4;
      const maxY = Math.max(...rawRects.map((r) => r.y + r.height)) + clearance + 4;
      candidates.push([
        { x: startPoint.x, y: minY },
        { x: endPoint.x, y: minY },
      ]);
      candidates.push([
        { x: startPoint.x, y: maxY },
        { x: endPoint.x, y: maxY },
      ]);
      candidates.push([
        { x: minX, y: startPoint.y },
        { x: minX, y: endPoint.y },
      ]);
      candidates.push([
        { x: maxX, y: startPoint.y },
        { x: maxX, y: endPoint.y },
      ]);
    }
    let best: Vec2[] = elbowFor(startPoint, endPoint, startExit);
    let bestScore = Number.POSITIVE_INFINITY;
    for (const elbow of candidates) {
      const full = simplifyRoute([start, startPoint, ...elbow, endPoint, end]);
      const score = crossingsOf(full);
      if (score < bestScore) {
        bestScore = score;
        best = elbow;
        if (score === 0) break;
      }
    }
    return best;
  };

  const priority = input.priority;
  const orderedRequests = permuteFlowRuns(
    [...requests].sort((a, b) => {
      if (useSpacing) {
        if (priority !== undefined) {
          const aPri = priority.has(a.id) ? 0 : 1;
          const bPri = priority.has(b.id) ? 0 : 1;
          if (aPri !== bPri) return aPri - bPri;
        }
        const aInternal = a.within !== undefined ? 0 : 1;
        const bInternal = b.within !== undefined ? 0 : 1;
        if (aInternal !== bInternal) return aInternal - bInternal;
        const aDist = Math.abs(a.start.x - a.end.x) + Math.abs(a.start.y - a.end.y);
        const bDist = Math.abs(b.start.x - b.end.x) + Math.abs(b.start.y - b.end.y);
        if (Math.abs(aDist - bDist) > SPACING_EPS) return aDist - bDist;
      }
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }),
    (request) => request.flowRun,
    (request) => request.flowRank!,
  );
  // Precompute fixed dock stubs for every request so earlier routes never walk
  // across or drop elbows onto a later request's already-fixed dock exit.
  const samePoint = (a: Vec2, b: Vec2): boolean =>
    Math.abs(a.x - b.x) <= SPACING_EPS && Math.abs(a.y - b.y) <= SPACING_EPS;
  const dockStubs = orderedRequests.map((req) => {
    const sp = clearancePoint(req.start, req.startExit);
    const ep = clearancePoint(req.end, req.endExit);
    return { start: req.start, startPoint: sp, end: req.end, endPoint: ep };
  });
  const sharedBlockedElbow = useSpacing ? new Uint8Array(nx * ny) : undefined;
  const sharedStrictH = useSpacing ? new Uint8Array(nx * ny) : undefined;
  const sharedStrictV = useSpacing ? new Uint8Array(nx * ny) : undefined;
  const lowerBound = (arr: readonly number[], target: number): number => {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  for (let reqIndex = 0; reqIndex < orderedRequests.length; reqIndex += 1) {
    const request = orderedRequests[reqIndex]!;
    let goalParent = -1;
    let pairId = pairIds.get(request.pairKey);
    if (pairId === undefined) {
      pairId = pairIds.size;
      pairIds.set(request.pairKey, pairId);
    }
    const pid = pairId;
    const earlier: readonly (readonly Vec2[])[] = pairFull.get(request.pairKey) ?? [];
    const hasSamePair = earlier.length > 0;
    const startPoint = dockStubs[reqIndex]!.startPoint;
    const endPoint = dockStubs[reqIndex]!.endPoint;
    // Precompute O(1) grid-unit strict-spacing masks once per request,
    // combining already-routed segments/elbows with remaining requests' fixed dock stubs.
    let nearH: ({ readonly y: number; readonly lo: number; readonly hi: number }[])[] | undefined;
    let nearV: ({ readonly x: number; readonly lo: number; readonly hi: number }[])[] | undefined;
    let blockedElbow: Uint8Array | undefined;
    let strictUnitH: Uint8Array | undefined;
    let strictUnitV: Uint8Array | undefined;
    const futurePointH: { readonly y: number; readonly x: number }[] = [];
    const futurePointV: { readonly x: number; readonly y: number }[] = [];
    if (useSpacing) {
      const futureH: { readonly y: number; readonly lo: number; readonly hi: number }[] = [];
      const futureV: { readonly x: number; readonly lo: number; readonly hi: number }[] = [];
      const futureClearancePts: Vec2[] = [];
      const pushStub = (dock: Vec2, cp: Vec2) => {
        // Skip stubs sharing the exact same port point as the current request.
        if (samePoint(dock, request.start) || samePoint(dock, request.end)) return;
        if (Math.abs(dock.y - cp.y) <= SPACING_EPS && Math.abs(dock.x - cp.x) > SPACING_EPS) {
          futureH.push({ y: (dock.y + cp.y) / 2, lo: Math.min(dock.x, cp.x), hi: Math.max(dock.x, cp.x) });
          futurePointV.push({ x: cp.x, y: cp.y });
        } else if (Math.abs(dock.x - cp.x) <= SPACING_EPS && Math.abs(dock.y - cp.y) > SPACING_EPS) {
          futureV.push({ x: (dock.x + cp.x) / 2, lo: Math.min(dock.y, cp.y), hi: Math.max(dock.y, cp.y) });
          futurePointH.push({ y: cp.y, x: cp.x });
        }
        futureClearancePts.push(cp);
      };
      for (let otherIdx = reqIndex + 1; otherIdx < dockStubs.length; otherIdx += 1) {
        const stub = dockStubs[otherIdx]!;
        pushStub(stub.start, stub.startPoint);
        pushStub(stub.end, stub.endPoint);
      }
      const allH = futureH.length > 0 ? [...fixedH, ...futureH] : fixedH;
      const allV = futureV.length > 0 ? [...fixedV, ...futureV] : fixedV;
      const allElbows = futureClearancePts.length > 0 ? [...fixedElbows, ...futureClearancePts] : fixedElbows;
      if (allH.length > 0 || allV.length > 0 || allElbows.length > 0) {
        const r = routeSpacing - SPACING_EPS;
        nearH = Array.from({ length: ny }, () => []);
        strictUnitH = sharedStrictH!;
        strictUnitH.fill(0);
        for (const seg of allH) {
          const iLo = Math.max(0, lowerBound(xs, seg.lo + SPACING_EPS) - 1);
          for (let j = lowerBound(ys, seg.y - r); j < ny && ys[j]! < seg.y + r; j += 1) {
            nearH[j]!.push(seg);
            const rowOff = j * nx;
            for (let ui = iLo; ui < nx - 1 && xs[ui]! < seg.hi - SPACING_EPS; ui += 1) {
              if (xs[ui + 1]! > seg.lo + SPACING_EPS) strictUnitH[rowOff + ui] = 1;
            }
          }
        }
        for (const pt of futurePointH) {
          const j = yIndex.get(pt.y);
          if (j === undefined) continue;
          const rowOff = j * nx;
          const iStart = Math.max(0, lowerBound(xs, pt.x - SPACING_EPS) - 1);
          for (let ui = iStart; ui < nx - 1 && xs[ui]! <= pt.x + SPACING_EPS; ui += 1) {
            if (xs[ui + 1]! >= pt.x - SPACING_EPS) strictUnitH[rowOff + ui] = 1;
          }
        }
        nearV = Array.from({ length: nx }, () => []);
        strictUnitV = sharedStrictV!;
        strictUnitV.fill(0);
        for (const seg of allV) {
          const jLo = Math.max(0, lowerBound(ys, seg.lo + SPACING_EPS) - 1);
          for (let i = lowerBound(xs, seg.x - r); i < nx && xs[i]! < seg.x + r; i += 1) {
            nearV[i]!.push(seg);
            for (let uj = jLo; uj < ny - 1 && ys[uj]! < seg.hi - SPACING_EPS; uj += 1) {
              if (ys[uj + 1]! > seg.lo + SPACING_EPS) strictUnitV[uj * nx + i] = 1;
            }
          }
        }
        for (const pt of futurePointV) {
          const i = xIndex.get(pt.x);
          if (i === undefined) continue;
          const jStart = Math.max(0, lowerBound(ys, pt.y - SPACING_EPS) - 1);
          for (let uj = jStart; uj < ny - 1 && ys[uj]! <= pt.y + SPACING_EPS; uj += 1) {
            if (ys[uj + 1]! >= pt.y - SPACING_EPS) strictUnitV[uj * nx + i] = 1;
          }
        }
        blockedElbow = sharedBlockedElbow!;
        blockedElbow.fill(0);
        if (allElbows.length > 0) {
          const r2 = r * r;
          for (const e of allElbows) {
            const jStart = lowerBound(ys, e.y - r);
            const iStart = lowerBound(xs, e.x - r);
            for (let j = jStart; j < ny && ys[j]! < e.y + r; j += 1) {
              const dy = ys[j]! - e.y;
              const dy2 = dy * dy;
              const rowOff = j * nx;
              for (let i = iStart; i < nx && xs[i]! < e.x + r; i += 1) {
                const dx = xs[i]! - e.x;
                if (dx * dx + dy2 < r2) blockedElbow[rowOff + i] = 1;
              }
            }
          }
        }
      }
    }
    const violatesFixedH = (j: number, xA: number, xB: number): boolean => {
      const list = nearH?.[j];
      const lo = Math.min(xA, xB);
      const hi = Math.max(xA, xB);
      if (hi - lo <= SPACING_EPS) return false;
      if (list !== undefined) {
        for (const seg of list) {
          if (Math.min(hi, seg.hi) - Math.max(lo, seg.lo) > SPACING_EPS) return true;
        }
      }
      const y = ys[j]!;
      for (const pt of futurePointH) {
        if (Math.abs(y - pt.y) <= SPACING_EPS && pt.x >= lo - SPACING_EPS && pt.x <= hi + SPACING_EPS) {
          return true;
        }
      }
      return false;
    };
    const violatesFixedV = (i: number, yA: number, yB: number): boolean => {
      const list = nearV?.[i];
      const lo = Math.min(yA, yB);
      const hi = Math.max(yA, yB);
      if (hi - lo <= SPACING_EPS) return false;
      if (list !== undefined) {
        for (const seg of list) {
          if (Math.min(hi, seg.hi) - Math.max(lo, seg.lo) > SPACING_EPS) return true;
        }
      }
      const x = xs[i]!;
      for (const pt of futurePointV) {
        if (Math.abs(x - pt.x) <= SPACING_EPS && pt.y >= lo - SPACING_EPS && pt.y <= hi + SPACING_EPS) {
          return true;
        }
      }
      return false;
    };
    const violatesFixedSegment = (a: Vec2, b: Vec2): boolean => {
      if (Math.abs(a.y - b.y) <= SPACING_EPS) {
        const j = yIndex.get(a.y);
        if (j !== undefined) return violatesFixedH(j, a.x, b.x);
        const lo = Math.min(a.x, b.x);
        const hi = Math.max(a.x, b.x);
        return hi - lo > SPACING_EPS && fixedH.some((seg) => Math.abs(seg.y - a.y) < routeSpacing - SPACING_EPS && Math.min(hi, seg.hi) - Math.max(lo, seg.lo) > SPACING_EPS);
      }
      if (Math.abs(a.x - b.x) <= SPACING_EPS) {
        const i = xIndex.get(a.x);
        if (i !== undefined) return violatesFixedV(i, a.y, b.y);
        const lo = Math.min(a.y, b.y);
        const hi = Math.max(a.y, b.y);
        return hi - lo > SPACING_EPS && fixedV.some((seg) => Math.abs(seg.x - a.x) < routeSpacing - SPACING_EPS && Math.min(hi, seg.hi) - Math.max(lo, seg.lo) > SPACING_EPS);
      }
      return false;
    };
    const overlapsAnyFixedSegment = (a: Vec2, b: Vec2): boolean => {
      if (Math.abs(a.y - b.y) <= SPACING_EPS) {
        const lo = Math.min(a.x, b.x);
        const hi = Math.max(a.x, b.x);
        if (hi - lo <= SPACING_EPS) return false;
        const j = yIndex.get(a.y);
        const list = j !== undefined ? nearH?.[j] : fixedH;
        return list !== undefined && list.some((seg) => Math.abs(seg.y - a.y) <= SPACING_EPS && Math.min(hi, seg.hi) - Math.max(lo, seg.lo) > SPACING_EPS);
      }
      if (Math.abs(a.x - b.x) <= SPACING_EPS) {
        const lo = Math.min(a.y, b.y);
        const hi = Math.max(a.y, b.y);
        if (hi - lo <= SPACING_EPS) return false;
        const i = xIndex.get(a.x);
        const list = i !== undefined ? nearV?.[i] : fixedV;
        return list !== undefined && list.some((seg) => Math.abs(seg.x - a.x) <= SPACING_EPS && Math.min(hi, seg.hi) - Math.max(lo, seg.lo) > SPACING_EPS);
      }
      return false;
    };
    // Search tiers (DE-2 + BF-3):
    // 1. Strict route spacing inside `within` (no cross-pair overlap, 15px border clearance).
    // 2. Relaxed spacing inside `within` while still forbidding cross-pair collinear overlap
    //    (keeping containment intact; deterministic repair reorders/re-docks if any conflict remains).
    // 3. Inside `within` allowing cross-pair overlap (still forbidding same-pair overlap/crossing).
    // 4. Only when `within` admits no obstacle-free route at all, fall back to unclamped tiers.
    interface SearchTier {
      readonly clamp: Rect | undefined;
      readonly strictSpacing: boolean;
      readonly allowCrossPairOverlap: boolean;
    }
    const tiers: SearchTier[] = [];
    if (useSpacing) {
      const hasOtherGeometry = nearH !== undefined;
      if (request.within !== undefined) {
        if (hasOtherGeometry) {
          tiers.push({ clamp: request.within, strictSpacing: true, allowCrossPairOverlap: false });
        }
        tiers.push({ clamp: request.within, strictSpacing: false, allowCrossPairOverlap: false });
        tiers.push({ clamp: request.within, strictSpacing: false, allowCrossPairOverlap: true });
        if (hasOtherGeometry) {
          tiers.push({ clamp: undefined, strictSpacing: true, allowCrossPairOverlap: false });
        }
        tiers.push({ clamp: undefined, strictSpacing: false, allowCrossPairOverlap: false });
        tiers.push({ clamp: undefined, strictSpacing: false, allowCrossPairOverlap: true });
      } else {
        if (hasOtherGeometry) {
          tiers.push({ clamp: undefined, strictSpacing: true, allowCrossPairOverlap: false });
        }
        tiers.push({ clamp: undefined, strictSpacing: false, allowCrossPairOverlap: false });
        tiers.push({ clamp: undefined, strictSpacing: false, allowCrossPairOverlap: true });
      }
    } else if (request.within !== undefined) {
      tiers.push({ clamp: request.within, strictSpacing: false, allowCrossPairOverlap: true });
      tiers.push({ clamp: undefined, strictSpacing: false, allowCrossPairOverlap: true });
    } else {
      tiers.push({ clamp: undefined, strictSpacing: false, allowCrossPairOverlap: true });
    }
    let terminalObstructed = false;
    let winningClamp: Rect | undefined = request.within;
    const excluded = obstacles.filter((o) => request.passable.has(o.id));
    const excludedEmpty = excluded.length === 0;
    const passableRects: Rect[] = useSpacing
      ? excluded.map((o) => rects.get(o.id)).filter((r): r is Rect => r !== undefined)
      : [];
    const passWallRow = passableRects.length > 0 ? new Uint8Array(ny) : undefined;
    const passWallCol = passableRects.length > 0 ? new Uint8Array(nx) : undefined;
    if (passWallRow !== undefined && passWallCol !== undefined) {
      const c = clearance - SPACING_EPS;
      for (const r of passableRects) {
        for (const wy of [r.y, r.y + r.height]) {
          for (let j = lowerBound(ys, wy - c); j < ny && ys[j]! < wy + c; j += 1) passWallRow[j] = 1;
        }
        for (const wx of [r.x, r.x + r.width]) {
          for (let i = lowerBound(xs, wx - c); i < nx && xs[i]! < wx + c; i += 1) passWallCol[i] = 1;
        }
      }
    }
    const passableWallBlockedH = (ui: number, j: number): boolean => {
      if (passWallRow![j] === 0) return false;
      const y = ys[j]!;
      const xLo = xs[ui]!;
      const xHi = xs[ui + 1]!;
      for (const r of passableRects) {
        if (xHi <= r.x - clearance + SPACING_EPS || xLo >= r.x + r.width + clearance - SPACING_EPS) continue;
        if (Math.abs(y - r.y) < clearance - SPACING_EPS || Math.abs(y - (r.y + r.height)) < clearance - SPACING_EPS) {
          return true;
        }
      }
      return false;
    };
    const passableWallBlockedV = (i: number, uj: number): boolean => {
      if (passWallCol![i] === 0) return false;
      const x = xs[i]!;
      const yLo = ys[uj]!;
      const yHi = ys[uj + 1]!;
      for (const r of passableRects) {
        if (yHi <= r.y - clearance + SPACING_EPS || yLo >= r.y + r.height + clearance - SPACING_EPS) continue;
        if (Math.abs(x - r.x) < clearance - SPACING_EPS || Math.abs(x - (r.x + r.width)) < clearance - SPACING_EPS) {
          return true;
        }
      }
      return false;
    };
    const startViolatesStrict = useSpacing && violatesFixedSegment(request.start, startPoint);
    const endViolatesStrict = useSpacing && violatesFixedSegment(endPoint, request.end);
    for (const tier of tiers) {
    if (goalParent >= 0 || terminalObstructed) break;
    const { clamp, strictSpacing, allowCrossPairOverlap } = tier;
    // O(1) feasibility pre-check for strictSpacing: if either fixed dock stub
    // already violates strict spacing with an existing route, no strict path can
    // close; skip straight to the next tier instead of exhausting A*.
    if (strictSpacing && (startViolatesStrict || endViolatesStrict)) continue;
    const insideClamp = (x: number, y: number): boolean =>
      clamp === undefined ||
      (x >= clamp.x && x <= clamp.x + clamp.width && y >= clamp.y && y <= clamp.y + clamp.height);
    if (!insideClamp(startPoint.x, startPoint.y) || !insideClamp(endPoint.x, endPoint.y)) continue;
    generation += 1;
    heap.clear();
    const blockedH = (i: number, j: number) => {
      let count = coverH[j * nx + i]!;
      for (const o of excluded) if (coversH(o, i, j)) count -= 1;
      if (count > 0) return true;
      return passableRects.length > 0 && passableWallBlockedH(i, j);
    };
    const blockedV = (i: number, j: number) => {
      let count = coverV[j * nx + i]!;
      for (const o of excluded) if (coversV(o, i, j)) count -= 1;
      if (count > 0) return true;
      return passableRects.length > 0 && passableWallBlockedV(i, j);
    };
    const blockedHFast = (i: number, j: number) => coverH[j * nx + i]! > 0;
    const blockedVFast = (i: number, j: number) => coverV[j * nx + i]! > 0;
    const isBlockedH = excludedEmpty ? blockedHFast : blockedH;
    const isBlockedV = excludedEmpty ? blockedVFast : blockedV;

    const si = xIndex.get(startPoint.x)!;
    const sj = yIndex.get(startPoint.y)!;
    const ti = xIndex.get(endPoint.x)!;
    const tj = yIndex.get(endPoint.y)!;
    const startHeading = headingOf(request.startExit);
    const arrival = headingOf({ x: -request.endExit.x, y: -request.endExit.y });
    if (strictSpacing && blockedElbow !== undefined && blockedElbow[tj * nx + ti] === 1 && !(si === ti && sj === tj && startHeading === arrival)) {
      // Turning at the target clearance point is forbidden; only a straight arrival
      // along `arrival` can close. Check if that single incoming unit is passable.
      const pi = ti - DX[arrival]!;
      const pj = tj - DY[arrival]!;
      let straightIncomingOk = pi >= 0 && pj >= 0 && pi < nx && pj < ny && insideClamp(xs[pi]!, ys[pj]!);
      if (straightIncomingOk) {
        if (arrival % 2 === 0) {
          const ui = Math.min(pi, ti);
          const u = (tj * nx + ui) * 2;
          if (isBlockedH(ui, tj) || isOccupied(u) || (strictUnitH !== undefined && strictUnitH[tj * nx + ui] === 1)) {
            straightIncomingOk = false;
          }
        } else {
          const uj = Math.min(pj, tj);
          const u = (uj * nx + ti) * 2 + 1;
          if (isBlockedV(ti, uj) || isOccupied(u) || (strictUnitV !== undefined && strictUnitV[uj * nx + ti] === 1)) {
            straightIncomingOk = false;
          }
        }
      }
      if (!straightIncomingOk) continue;
    }
    const goalState = nStates; // virtual

    // The two dock-to-clearance joins are fixed by docking: when either
    // already shares a segment with — or transversally crosses — an earlier
    // same-pair route, no admissible route remains for this relation.
    const terminalBlocked =
      hasSamePair &&
      (sharesSamePair(request.start, startPoint, earlier) ||
        crossesSamePair(request.start, startPoint, earlier) ||
        sharesSamePair(endPoint, request.end, earlier) ||
        crossesSamePair(endPoint, request.end, earlier));
    if (terminalBlocked) {
      terminalObstructed = true;
      break;
    }

    // Pair heuristic `(t, |dx| + |dy|)`: an admissible lower bound on each
    // component, since `m >= 1`.
    const heuristicB = (i: number, j: number, h: number): number =>
      turnsLowerBound(xs[i]!, ys[j]!, h, endPoint.x, endPoint.y, arrival);
    const heuristicL = (i: number, j: number): number =>
      Math.abs(endPoint.x - xs[i]!) + Math.abs(endPoint.y - ys[j]!);

    const startState = (sj * nx + si) * 4 + startHeading;
    gBends[startState] = 0;
    gLen[startState] = 0;
    runSI[startState] = si;
    runSJ[startState] = sj;
    stamp[startState] = generation;
    parent[startState] = -1;
    heap.push(heuristicB(si, sj, startHeading), heuristicL(si, sj), startState);
    let goalBends = Number.POSITIVE_INFINITY;
    let goalLen = Number.POSITIVE_INFINITY;

    let pops = 0;
    while (heap.size > 0) {
      const state = heap.pop();
      if (state === goalState) break;
      if (closed[state] === generation) continue;
      closed[state] = generation;
      if (strictSpacing && ++pops > 24000) break;
      const h = state & 3;
      const point = state >> 2;
      const i = point % nx;
      const j = (point - i) / nx;
      const gb = gBends[state]!;
      const gl = gLen[state]!;
      if (i === ti && j === tj) {
        if ((h + 2) % 4 !== arrival) {
          let closeAllowed = true;
          if (strictSpacing) {
            if (h === arrival) {
              const straightStart = runSI[state]! === si && runSJ[state]! === sj && h === startHeading;
              const a1: Vec2 = straightStart ? request.start : { x: xs[runSI[state]!]!, y: ys[runSJ[state]!]! };
              if (violatesFixedSegment(a1, request.end)) closeAllowed = false;
            } else {
              if (blockedElbow !== undefined && blockedElbow[tj * nx + ti] === 1) closeAllowed = false;
              else if (violatesFixedSegment(endPoint, request.end)) closeAllowed = false;
              else if (si === ti && sj === tj && violatesFixedSegment(request.start, startPoint)) closeAllowed = false;
            }
          } else if (!allowCrossPairOverlap) {
            if (h === arrival) {
              const straightStart = runSI[state]! === si && runSJ[state]! === sj && h === startHeading;
              const a1: Vec2 = straightStart ? request.start : { x: xs[runSI[state]!]!, y: ys[runSJ[state]!]! };
              if (overlapsAnyFixedSegment(a1, request.end)) closeAllowed = false;
            } else if (overlapsAnyFixedSegment(endPoint, request.end)) {
              closeAllowed = false;
            }
          }
          // When the arrival is straight (`h === arrival`), `simplifyRoute`
          // merges the last grid run with the target dock-to-clearance join
          // (endPoint to dock, same line): the closing check runs on the
          // merged run-start-to-dock segment, so a crossing at the clearance
          // point is still forbidden (L-R9, joins included).
          if (!closeAllowed) {
            // Try another arrival heading or track.
          } else if (hasSamePair && h === arrival) {
            const a1: Vec2 = { x: xs[runSI[state]!]!, y: ys[runSJ[state]!]! };
            if (crossesSamePair(a1, request.end, earlier) || sharesSamePair(a1, request.end, earlier)) {
              // No closing via this straight arrival: another heading or a
              // longer run may still close admissibly.
            } else {
              const totalB = gb;
              const totalL = gl;
              // The virtual goal keeps the first parent achieving the
              // smallest closing pair on strict comparison.
              if (totalB < goalBends || (totalB === goalBends && totalL < goalLen)) {
                goalBends = totalB;
                goalLen = totalL;
                goalParent = state;
                heap.push(totalB, totalL, goalState);
              }
            }
          } else {
            const totalB = gb + (h === arrival ? 0 : 1);
            const totalL = gl;
            if (totalB < goalBends || (totalB === goalBends && totalL < goalLen)) {
              goalBends = totalB;
              goalLen = totalL;
              goalParent = state;
              heap.push(totalB, totalL, goalState);
            }
          }
        }
      }
      const rsx = runSI[state]!;
      const rsy = runSJ[state]!;
      for (let nh = 0; nh < 4; nh += 1) {
        if (nh === (h + 2) % 4) continue;
        const ni = i + DX[nh]!;
        const nj = j + DY[nh]!;
        if (ni < 0 || nj < 0 || ni >= nx || nj >= ny) continue;
        if (clamp !== undefined && !insideClamp(xs[ni]!, ys[nj]!)) continue;
        let unit: number;
        let length: number;
        if (nh % 2 === 0) {
          const ui = Math.min(i, ni);
          if (isBlockedH(ui, j)) continue;
          unit = (j * nx + ui) * 2;
          length = xs[ui + 1]! - xs[ui]!;
        } else {
          const uj = Math.min(j, nj);
          if (isBlockedV(i, uj)) continue;
          unit = (uj * nx + i) * 2 + 1;
          length = ys[uj + 1]! - ys[uj]!;
        }
        const occupied = isOccupied(unit);
        if (occupied && (!allowCrossPairOverlap || isUsedBy(unit, pid))) continue;
        // The candidate's current straight run, from its last bend (or the
        // start clearance point) to the new point: the transversal and
        // terminal-sharing bans are checked on this whole simplified segment,
        // joins included via `earlier`, so a crossing at a collinear joint is
        // still caught. When the run starts at the start clearance point and
        // continues straight along the start exit, `simplifyRoute` merges the
        // dock-to-clearance join (dock to clearance, same line) into it: the
        // check then runs on the merged dock-to-new segment, so a crossing at
        // the clearance point — endpoint of the grid run, interior of the
        // merged full segment — is still forbidden (L-R9, joins included).
        let nrsx: number;
        let nrsy: number;
        if (nh === h) {
          nrsx = rsx;
          nrsy = rsy;
        } else {
          nrsx = i;
          nrsy = j;
        }
        if (strictSpacing) {
          if (nh !== h) {
            if (blockedElbow !== undefined && blockedElbow[j * nx + i] === 1) continue;
            if (i === si && j === sj && violatesFixedSegment(request.start, startPoint)) continue;
          }
          if (nh % 2 === 0) {
            if (strictUnitH !== undefined && strictUnitH[j * nx + Math.min(i, ni)] === 1) continue;
            if (i === si && j === sj && nh === startHeading && violatesFixedH(j, request.start.x, startPoint.x)) continue;
          } else {
            if (strictUnitV !== undefined && strictUnitV[Math.min(j, nj) * nx + i] === 1) continue;
            if (i === si && j === sj && nh === startHeading && violatesFixedV(i, request.start.y, startPoint.y)) continue;
          }
        } else if (!allowCrossPairOverlap) {
          if (i === si && j === sj && nh === startHeading && overlapsAnyFixedSegment(request.start, startPoint)) continue;
        }
        if (hasSamePair) {
          const straightStart = nrsx === si && nrsy === sj && nh === startHeading;
          const a1: Vec2 = straightStart ? request.start : { x: xs[nrsx]!, y: ys[nrsy]! };
          const a2: Vec2 = { x: xs[ni]!, y: ys[nj]! };
          if (crossesSamePair(a1, a2, earlier) || sharesSamePair(a1, a2, earlier)) continue;
        }
        const nb = gb + (nh === h ? 0 : 1);
        const hb = heuristicB(ni, nj, nh);
        if (strictSpacing && nb + hb > 12) continue;
        const nl = gl + length * (occupied ? 1 + OVERLAP_PENALTY : 1);
        const next = (nj * nx + ni) * 4 + nh;
        if (stamp[next] === generation) {
          const rb = gBends[next]!;
          const rl = gLen[next]!;
          // Strictly smaller `(bends, weighted length)` only: on an exact
          // pair tie the first-recorded parent is kept — earliest popped
          // predecessor, neighbours east, south, west, north.
          if (nb > rb || (nb === rb && nl >= rl)) continue;
        }
        if (closed[next] === generation) continue;
        stamp[next] = generation;
        gBends[next] = nb;
        gLen[next] = nl;
        runSI[next] = nrsx;
        runSJ[next] = nrsy;
        parent[next] = state;
        heap.push(nb + hb, nl + heuristicL(ni, nj), next);
      }
    }

    if (goalParent >= 0) winningClamp = clamp;
    }

    if (goalParent >= 0 && winningClamp === undefined && request.within !== undefined) {
      escaped.push(request.id);
    }

    if (goalParent < 0) {
      // MAJ-2: retry with reduced 2 px inflation is covered by the outer-lane
      // grid (clearance-point lanes); here at least avoid raw interiors.
      obstructed.push(request.id);
      const elbow = input.avoidFallbackInteriors === true
        ? bestFallback(request.start, startPoint, endPoint, request.end, request.startExit)
        : elbowFor(startPoint, endPoint, request.startExit);
      const full = simplifyRoute([request.start, startPoint, ...elbow, endPoint, request.end]);
      routes.set(request.id, full);
      const list = pairFull.get(request.pairKey) ?? [];
      list.push(full);
      pairFull.set(request.pairKey, list);
      recordFixedRoute(full);
      reserveGridPath([startPoint, ...elbow, endPoint], pid);
      continue;
    }

    const chain: number[] = [];
    for (let state = goalParent; state >= 0; state = parent[state]!) chain.push(state);
    chain.reverse();
    const corners: Vec2[] = [];
    // No reservation happens above: units are collected below and reserved
    // only at the final choice between this searched route and the fallback.
    const pending: number[] = [];
    for (let index = 0; index < chain.length; index += 1) {
      const point = chain[index]! >> 2;
      const i = point % nx;
      const j = (point - i) / nx;
      corners.push({ x: xs[i]!, y: ys[j]! });
      if (index > 0) {
        const previous = chain[index - 1]! >> 2;
        const pi = previous % nx;
        const pj = (previous - pi) / nx;
        pending.push(pj === j ? (j * nx + Math.min(i, pi)) * 2 : (Math.min(j, pj) * nx + i) * 2 + 1);
      }
    }
    const full = simplifyRoute([request.start, ...corners, request.end]);
    // Full-route safety net (dock-to-clearance joins included): the search
    // above already forbids every violating run, so this holds; when it does
    // not, the only admissible exit is `route-obstructed`.
    let violates = false;
    if (hasSamePair) {
      for (const other of earlier) {
        if (fullSharesSegment(full, other)) {
          violates = true;
          break;
        }
        let crossed = false;
        for (let a = 1; a < full.length && !crossed; a += 1) {
          for (let b = 1; b < other.length; b += 1) {
            if (segmentsCrossTransversal(full[a - 1]!, full[a]!, other[b - 1]!, other[b]!)) {
              crossed = true;
              break;
            }
          }
        }
        if (crossed) {
          violates = true;
          break;
        }
      }
    }
    if (violates) {
      obstructed.push(request.id);
      const elbow = input.avoidFallbackInteriors === true
        ? bestFallback(request.start, startPoint, endPoint, request.end, request.startExit)
        : elbowFor(startPoint, endPoint, request.startExit);
      const fallback = simplifyRoute([request.start, startPoint, ...elbow, endPoint, request.end]);
      routes.set(request.id, fallback);
      const list = pairFull.get(request.pairKey) ?? [];
      list.push(fallback);
      pairFull.set(request.pairKey, list);
      recordFixedRoute(fallback);
      reserveGridPath([startPoint, ...elbow, endPoint], pid);
      continue;
    }
    for (const unit of pending) addUser(unit, pid);
    routes.set(request.id, full);
    const list = pairFull.get(request.pairKey) ?? [];
    list.push(full);
    pairFull.set(request.pairKey, list);
    recordFixedRoute(full);
  }

  return { routes, obstructed, escaped };
}
