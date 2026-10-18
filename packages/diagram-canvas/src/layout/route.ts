/**
 * Orthogonal routing between docked ends, around obstacles.
 *
 * L-R3 — bends minimised after docking, route tie-break. Docks are fixed first
 * (`dock.ts`); the router searches orthogonal routes on the grid formed by
 * obstacle boundaries grown by `clearance`, the midline of every channel
 * between two consecutive boundaries, and the clearance point of every dock.
 * Cost is lexicographic: bend count first (one bend costs more than any length
 * the drawing can hold), then weighted length, where a grid unit already used
 * by an edge of another pair costs three times its length and a unit used by
 * an edge of the same pair is forbidden (L-R9). The search is A* with an
 * obstacle-free lower bound on remaining turns plus Manhattan distance, so the
 * route returned has the fewest bends of any orthogonal route around the
 * obstacles. Remaining ties resolve by the A* frontier order: increasing
 * estimated total cost, then increasing state index ordered by (grid row, grid
 * column, heading east, south, west, north). Requests are routed in ascending
 * relation id, so an earlier relation occupies the grid first. If the grid
 * holds no route, the engine draws the two-clearance-point elbow and reports
 * `route-obstructed` for that relation: an accepted exception, not a claim
 * that L-R8 held.
 *
 * L-R8 — edges across containers. Every entity is an obstacle except the strict
 * ancestors of either end: an edge may cross only the boundaries of its own
 * ancestors. Every other node and container is an obstacle grown by
 * `clearance`, and a route segment runs ON a grown boundary at most, never
 * through an obstacle interior. The only accepted exception is the
 * `route-obstructed` fallback above, reported per relation.
 *
 * L-R9 — parallel edges never share a segment. A grid unit used by an edge
 * between the same two entities is forbidden to the next such edge.
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

const BEND = 1e7;
const OVERLAP_PENALTY = 2;
const DX = [1, 0, -1, 0] as const;
const DY = [0, 1, 0, -1] as const;

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

class MinHeap {
  private readonly keys: number[] = [];
  private readonly values: number[] = [];

  get size(): number {
    return this.values.length;
  }

  push(key: number, value: number): void {
    const keys = this.keys;
    const values = this.values;
    keys.push(key);
    values.push(value);
    let index = values.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (keys[parent]! < key || (keys[parent] === key && values[parent]! <= value)) break;
      keys[index] = keys[parent]!;
      values[index] = values[parent]!;
      index = parent;
    }
    keys[index] = key;
    values[index] = value;
  }

  pop(): number {
    const keys = this.keys;
    const values = this.values;
    const top = values[0]!;
    const lastKey = keys.pop()!;
    const lastValue = values.pop()!;
    if (values.length > 0) {
      let index = 0;
      const length = values.length;
      for (;;) {
        const left = 2 * index + 1;
        if (left >= length) break;
        const right = left + 1;
        let child = left;
        if (right < length && (keys[right]! < keys[left]! || (keys[right] === keys[left] && values[right]! < values[left]!))) {
          child = right;
        }
        if (lastKey < keys[child]! || (lastKey === keys[child] && lastValue <= values[child]!)) break;
        keys[index] = keys[child]!;
        values[index] = values[child]!;
        index = child;
      }
      keys[index] = lastKey;
      values[index] = lastValue;
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
  const gScore = new Float64Array(nStates);
  const stamp = new Int32Array(nStates);
  const closed = new Int32Array(nStates);
  const parent = new Int32Array(nStates);
  const occupancy = new Map<number, string[]>();
  let generation = 0;

  const routes = new Map<RelationRef, readonly Vec2[]>();
  const obstructed: RelationRef[] = [];

  for (const request of [...requests].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    generation += 1;
    const excluded = obstacles.filter((o) => request.passable.has(o.id));
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

    const startPoint = clearancePoint(request.start, request.startExit);
    const endPoint = clearancePoint(request.end, request.endExit);
    const si = xIndex.get(startPoint.x)!;
    const sj = yIndex.get(startPoint.y)!;
    const ti = xIndex.get(endPoint.x)!;
    const tj = yIndex.get(endPoint.y)!;
    const startHeading = headingOf(request.startExit);
    const arrival = headingOf({ x: -request.endExit.x, y: -request.endExit.y });
    const goalState = nStates; // virtual

    const heuristic = (i: number, j: number, h: number) =>
      turnsLowerBound(xs[i]!, ys[j]!, h, endPoint.x, endPoint.y, arrival) * BEND +
      Math.abs(endPoint.x - xs[i]!) +
      Math.abs(endPoint.y - ys[j]!);

    const heap = new MinHeap();
    const startState = (sj * nx + si) * 4 + startHeading;
    gScore[startState] = 0;
    stamp[startState] = generation;
    parent[startState] = -1;
    heap.push(heuristic(si, sj, startHeading), startState);
    let goalScore = Number.POSITIVE_INFINITY;
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
      const g = gScore[state]!;
      if (i === ti && j === tj) {
        if ((h + 2) % 4 !== arrival) {
          const total = g + (h === arrival ? 0 : BEND);
          if (total < goalScore) {
            goalScore = total;
            goalParent = state;
            heap.push(total, goalState);
          }
        }
      }
      for (let nh = 0; nh < 4; nh += 1) {
        if (nh === (h + 2) % 4) continue;
        const ni = i + DX[nh]!;
        const nj = j + DY[nh]!;
        if (ni < 0 || nj < 0 || ni >= nx || nj >= ny) continue;
        let unit: number;
        let length: number;
        if (nh % 2 === 0) {
          const ui = Math.min(i, ni);
          if (blockedH(ui, j)) continue;
          unit = (j * nx + ui) * 2;
          length = xs[ui + 1]! - xs[ui]!;
        } else {
          const uj = Math.min(j, nj);
          if (blockedV(i, uj)) continue;
          unit = (uj * nx + i) * 2 + 1;
          length = ys[uj + 1]! - ys[uj]!;
        }
        const users = occupancy.get(unit);
        if (users !== undefined && users.includes(request.pairKey)) continue;
        const cost = length * (users === undefined ? 1 : 1 + OVERLAP_PENALTY) + (nh === h ? 0 : BEND);
        const next = (nj * nx + ni) * 4 + nh;
        const candidate = g + cost;
        if (stamp[next] === generation && candidate >= gScore[next]!) continue;
        if (closed[next] === generation) continue;
        stamp[next] = generation;
        gScore[next] = candidate;
        parent[next] = state;
        heap.push(candidate + heuristic(ni, nj, nh), next);
      }
    }

    if (goalParent < 0) {
      obstructed.push(request.id);
      const elbow =
        startPoint.x === endPoint.x || startPoint.y === endPoint.y
          ? []
          : request.startExit.x !== 0
            ? [{ x: endPoint.x, y: startPoint.y }]
            : [{ x: startPoint.x, y: endPoint.y }];
      routes.set(request.id, simplifyRoute([request.start, startPoint, ...elbow, endPoint, request.end]));
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
        if (users === undefined) occupancy.set(unit, [request.pairKey]);
        else if (!users.includes(request.pairKey)) users.push(request.pairKey);
      }
    }
    routes.set(request.id, simplifyRoute([request.start, ...corners, request.end]));
  }

  return { routes, obstructed };
}
