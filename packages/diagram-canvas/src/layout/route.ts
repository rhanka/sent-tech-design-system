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
 * collinear points removed. The returned route is lexicographically minimal:
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
}

export interface RouteOutcome {
  readonly routes: ReadonlyMap<RelationRef, readonly Vec2[]>;
  readonly obstructed: readonly RelationRef[];
}

const OVERLAP_PENALTY = 2;
const DX = [1, 0, -1, 0] as const;
const DY = [0, 1, 0, -1] as const;

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
 * index). Lengths are world-unit floats from placement geometry
 * (halves, thirds, …): two mathematically equal totals can differ by a few
 * ulps when summed in different orders, so equality is tested within
 * `LEN_EPS` — otherwise a floating-noise winner would break the specified
 * heap discipline (first-recorded parent kept on an exact pair tie). The
 * state index is the largest on a tie for the virtual goal, so it pops after
 * every state of equal estimated pair.
 */
const LEN_EPS = 1e-9;

class LexHeap {
  private readonly bends: number[] = [];
  private readonly lens: number[] = [];
  private readonly states: number[] = [];

  get size(): number {
    return this.states.length;
  }

  clear(): void {
    this.bends.length = 0;
    this.lens.length = 0;
    this.states.length = 0;
  }

  push(estBends: number, estLen: number, state: number): void {
    const bends = this.bends;
    const lens = this.lens;
    const states = this.states;
    bends.push(estBends);
    lens.push(estLen);
    states.push(state);
    let index = states.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      const pb = bends[parent]!;
      const pl = lens[parent]!;
      const ps = states[parent]!;
      const less =
        estBends !== pb ? estBends < pb : Math.abs(estLen - pl) > LEN_EPS ? estLen < pl : state < ps;
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
    const lastB = bends.pop()!;
    const lastL = lens.pop()!;
    const lastS = states.pop()!;
    if (states.length > 0) {
      let index = 0;
      const length = states.length;
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
          const rightLess = rb !== lb ? rb < lb : Math.abs(rl - ll) > LEN_EPS ? rl < ll : rs < ls;
          if (rightLess) child = right;
        }
        const cb = bends[child]!;
        const cl = lens[child]!;
        const cs = states[child]!;
        const childLess =
          cb !== lastB ? cb < lastB : Math.abs(cl - lastL) > LEN_EPS ? cl < lastL : cs < lastS;
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
}): RouteOutcome {
  const { rects, requests, clearance } = input;
  const entities = [...rects.keys()].sort();

  const grown = entities.map((id) => {
    const rect = rects.get(id)!;
    return {
      id,
      left: rect.x - clearance,
      right: rect.x + rect.width + clearance,
      top: rect.y - clearance,
      bottom: rect.y + rect.height + clearance,
    };
  });

  const withChannels = (values: number[]): number[] => {
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    const mids: number[] = [];
    for (let index = 1; index < sorted.length; index += 1) mids.push((sorted[index - 1]! + sorted[index]!) / 2);
    return [...sorted, ...mids];
  };
  const clearancePoint = (point: Vec2, exit: Vec2): Vec2 => ({
    x: point.x + exit.x * clearance,
    y: point.y + exit.y * clearance,
  });

  const xValues = withChannels(grown.flatMap((box) => [box.left, box.right]));
  const yValues = withChannels(grown.flatMap((box) => [box.top, box.bottom]));
  for (const request of requests) {
    for (const point of [clearancePoint(request.start, request.startExit), clearancePoint(request.end, request.endExit)]) {
      xValues.push(point.x);
      yValues.push(point.y);
    }
  }
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
  const pairIds = new Map<string, number>();
  const occupancy = new Map<number, number[]>();
  // Full simplified routes per unordered pair, dock to dock, joins included:
  // the L-R9 bans (shared segment, transversal crossing) are enforced against
  // these, and reserved through them.
  const pairFull = new Map<string, (readonly Vec2[])[]>();
  let generation = 0;
  const heap = new LexHeap();

  const routes = new Map<RelationRef, readonly Vec2[]>();
  const obstructed: RelationRef[] = [];

  const elbowFor = (startPoint: Vec2, endPoint: Vec2, startExit: Vec2): Vec2[] => {
    if (startPoint.x === endPoint.x || startPoint.y === endPoint.y) return [];
    return startExit.x !== 0 ? [{ x: endPoint.x, y: startPoint.y }] : [{ x: startPoint.x, y: endPoint.y }];
  };

  for (const request of [...requests].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    generation += 1;
    heap.clear();
    let pairId = pairIds.get(request.pairKey);
    if (pairId === undefined) {
      pairId = pairIds.size;
      pairIds.set(request.pairKey, pairId);
    }
    const pid = pairId;
    const excluded = obstacles.filter((o) => request.passable.has(o.id));
    const excludedEmpty = excluded.length === 0;
    const blockedH = (i: number, j: number) => {
      let count = coverH[j * nx + i]!;
      for (const o of excluded) if (coversH(o, i, j)) count -= 1;
      return count > 0;
    };
    const blockedV = (i: number, j: number) => {
      let count = coverV[j * nx + i]!;
      for (const o of excluded) if (coversV(o, i, j)) count -= 1;
      return count > 0;
    };
    const blockedHFast = (i: number, j: number) => coverH[j * nx + i]! > 0;
    const blockedVFast = (i: number, j: number) => coverV[j * nx + i]! > 0;
    const isBlockedH = excludedEmpty ? blockedHFast : blockedH;
    const isBlockedV = excludedEmpty ? blockedVFast : blockedV;

    const startPoint = clearancePoint(request.start, request.startExit);
    const endPoint = clearancePoint(request.end, request.endExit);
    const si = xIndex.get(startPoint.x)!;
    const sj = yIndex.get(startPoint.y)!;
    const ti = xIndex.get(endPoint.x)!;
    const tj = yIndex.get(endPoint.y)!;
    const startHeading = headingOf(request.startExit);
    const arrival = headingOf({ x: -request.endExit.x, y: -request.endExit.y });
    const goalState = nStates; // virtual

    const earlier: readonly (readonly Vec2[])[] = pairFull.get(request.pairKey) ?? [];
    const hasSamePair = earlier.length > 0;

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
      obstructed.push(request.id);
      const full = simplifyRoute([request.start, startPoint, ...elbowFor(startPoint, endPoint, request.startExit), endPoint, request.end]);
      routes.set(request.id, full);
      const list = pairFull.get(request.pairKey) ?? [];
      list.push(full);
      pairFull.set(request.pairKey, list);
      continue;
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
    let goalParent = -1;

    while (heap.size > 0) {
      const state = heap.pop();
      if (state === goalState) break;
      if (closed[state] === generation) continue;
      closed[state] = generation;
      const h = state & 3;
      const point = state >> 2;
      const i = point % nx;
      const j = (point - i) / nx;
      const gb = gBends[state]!;
      const gl = gLen[state]!;
      if (i === ti && j === tj) {
        if ((h + 2) % 4 !== arrival) {
          // When the arrival is straight (`h === arrival`), `simplifyRoute`
          // merges the last grid run with the target dock-to-clearance join
          // (endPoint to dock, same line): the closing check runs on the
          // merged run-start-to-dock segment, so a crossing at the clearance
          // point is still forbidden (L-R9, joins included).
          if (hasSamePair && h === arrival) {
            const a1: Vec2 = { x: xs[runSI[state]!]!, y: ys[runSJ[state]!]! };
            if (crossesSamePair(a1, request.end, earlier) || sharesSamePair(a1, request.end, earlier)) {
              // No closing via this straight arrival: another heading or a
              // longer run may still close admissibly.
            } else {
              const totalB = gb;
              const totalL = gl;
              // The virtual goal keeps the first parent achieving the
              // smallest closing pair (lengths within `LEN_EPS` tie).
              if (totalB < goalBends || (totalB === goalBends && totalL + LEN_EPS < goalLen)) {
                goalBends = totalB;
                goalLen = totalL;
                goalParent = state;
                heap.push(totalB, totalL, goalState);
              }
            }
          } else {
            const totalB = gb + (h === arrival ? 0 : 1);
            const totalL = gl;
            if (totalB < goalBends || (totalB === goalBends && totalL + LEN_EPS < goalLen)) {
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
        const users = occupancy.get(unit);
        if (users !== undefined && users.includes(pid)) continue;
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
        if (hasSamePair) {
          const straightStart = nrsx === si && nrsy === sj && nh === startHeading;
          const a1: Vec2 = straightStart ? request.start : { x: xs[nrsx]!, y: ys[nrsy]! };
          const a2: Vec2 = { x: xs[ni]!, y: ys[nj]! };
          if (crossesSamePair(a1, a2, earlier) || sharesSamePair(a1, a2, earlier)) continue;
        }
        const nb = gb + (nh === h ? 0 : 1);
        const nl = gl + length * (users === undefined ? 1 : 1 + OVERLAP_PENALTY);
        const next = (nj * nx + ni) * 4 + nh;
        if (stamp[next] === generation) {
          const rb = gBends[next]!;
          const rl = gLen[next]!;
          // Strictly smaller `(bends, weighted length)` only: on an exact
          // pair tie (lengths within `LEN_EPS`) the first-recorded parent is
          // kept — earliest popped predecessor, neighbours east, south, west,
          // north.
          if (nb > rb || (nb === rb && nl + LEN_EPS >= rl)) continue;
        }
        if (closed[next] === generation) continue;
        stamp[next] = generation;
        gBends[next] = nb;
        gLen[next] = nl;
        runSI[next] = nrsx;
        runSJ[next] = nrsy;
        parent[next] = state;
        heap.push(nb + heuristicB(ni, nj, nh), nl + heuristicL(ni, nj), next);
      }
    }

    if (goalParent < 0) {
      obstructed.push(request.id);
      const full = simplifyRoute([request.start, startPoint, ...elbowFor(startPoint, endPoint, request.startExit), endPoint, request.end]);
      routes.set(request.id, full);
      const list = pairFull.get(request.pairKey) ?? [];
      list.push(full);
      pairFull.set(request.pairKey, list);
      continue;
    }

    const chain: number[] = [];
    for (let state = goalParent; state >= 0; state = parent[state]!) chain.push(state);
    chain.reverse();
    const corners: Vec2[] = [];
    for (let index = 0; index < chain.length; index += 1) {
      const point = chain[index]! >> 2;
      const i = point % nx;
      const j = (point - i) / nx;
      corners.push({ x: xs[i]!, y: ys[j]! });
      if (index > 0) {
        const previous = chain[index - 1]! >> 2;
        const pi = previous % nx;
        const pj = (previous - pi) / nx;
        const unit = pj === j ? (j * nx + Math.min(i, pi)) * 2 : (Math.min(j, pj) * nx + i) * 2 + 1;
        const users = occupancy.get(unit);
        if (users === undefined) occupancy.set(unit, [pid]);
        else if (!users.includes(pid)) users.push(pid);
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
      const fallback = simplifyRoute([request.start, startPoint, ...elbowFor(startPoint, endPoint, request.startExit), endPoint, request.end]);
      routes.set(request.id, fallback);
      const list = pairFull.get(request.pairKey) ?? [];
      list.push(fallback);
      pairFull.set(request.pairKey, list);
      continue;
    }
    routes.set(request.id, full);
    const list = pairFull.get(request.pairKey) ?? [];
    list.push(full);
    pairFull.set(request.pairKey, list);
  }

  return { routes, obstructed };
}
