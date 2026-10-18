/**
 * Layout fixtures: `generic@1` documents built from a terse description, a
 * fixed-width text measurer, and geometric helpers the rule suites share.
 *
 * Every document built here is checked by `diagram-core`'s `validateDocument`
 * inside `layoutDocument` itself (an invalid one is refused), and every view the
 * engine returns is checked by `validateView` in `lay()`: a geometric assertion
 * over a view the model would refuse would prove nothing.
 */
import {
  CURRENT_SCHEMA_VERSION,
  GENERIC_PROFILE_ID,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  formatDiagnostics,
  occurrenceRef,
  relationRef,
  validateView,
  type Entity,
  type EntityOccurrence,
  type Relation,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { expect } from "vitest";

import {
  layoutDocument,
  relationRoute,
  type LayoutFit,
  type LayoutOptions,
  type LayoutWarning,
  type Rect,
  type TextMeasurer,
  type Vec2,
} from "../../src/index.js";

/** Fixed width: 8 px per character for names, 7 for edge labels; fixed line heights. */
export const measure: TextMeasurer = (text, role) => ({
  width: text.length * (role === "edge-label" ? 7 : 8),
  height: role === "container-title" ? 14 : 16,
});

export interface DocSpec {
  /** Entity local ids drawn as nodes; the name is the id unless given in `names`. */
  readonly nodes: readonly string[];
  /** Container local id -> its children local ids. */
  readonly containers?: Readonly<Record<string, readonly string[]>>;
  /** [relation local id, source local id, target local id, label?]. */
  readonly links: readonly (readonly [string, string, string, string?])[];
  readonly names?: Readonly<Record<string, string>>;
  readonly revision?: number;
}

export function buildDocument(spec: DocSpec): SemanticDocument {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const name = (id: string) => spec.names?.[id] ?? id;
  for (const id of spec.nodes) {
    const ref = entityRef(id);
    entities[ref] = { id: ref, profile: GENERIC_PROFILE_ID, type: "node", attributes: { name: { kind: "text", value: name(id) } } };
  }
  for (const [id, children] of Object.entries(spec.containers ?? {})) {
    const ref = entityRef(id);
    entities[ref] = {
      id: ref,
      profile: GENERIC_PROFILE_ID,
      type: "container",
      attributes: { name: { kind: "text", value: name(id) } },
    };
    for (const child of children) {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: ref },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
  }
  for (const [id, source, target, label] of spec.links) {
    const relation = relationRef(id);
    relations[relation] = {
      id: relation,
      profile: GENERIC_PROFILE_ID,
      type: "link",
      endpoints: [
        { role: "source", target: entityRef(source) },
        { role: "target", target: entityRef(target) },
      ],
      attributes: label === undefined ? {} : { label: { kind: "text", value: label } },
    };
  }
  return {
    documentId: documentRef("layout-fixture"),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: spec.revision ?? 1,
    profileRefs: [GENERIC_PROFILE_ID],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: [],
  };
}

export interface Laid {
  readonly view: ViewDocument;
  readonly fit: LayoutFit;
  readonly warnings: readonly LayoutWarning[];
}

export function lay(document: SemanticDocument, targetWidth: number, extra: Partial<LayoutOptions> = {}): Laid {
  const result = layoutDocument(document, { registry: defaultProfileRegistry, measureText: measure, targetWidth, ...extra });
  if (result.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(result)}`);
  const diagnostics = validateView(result.view, document, { registry: defaultProfileRegistry });
  expect(formatDiagnostics(diagnostics)).toBe("");
  return result;
}

export const WIDE = 4000;

export function rectOf(view: ViewDocument, entity: string): Rect {
  const occurrence = view.entityOccurrences[occurrenceRef(`e.${entity}`)] as EntityOccurrence | undefined;
  if (occurrence === undefined) throw new Error(`no occurrence for ${entity}`);
  return occurrence.geometry;
}

export function routeOf(view: ViewDocument, relation: string): readonly Vec2[] {
  const route = relationRoute(view, occurrenceRef(`r.${relation}`));
  if (route === undefined) throw new Error(`no occurrence for ${relation}`);
  return route;
}

export const centreOf = (rect: Rect): Vec2 => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

/** Every segment of a route is horizontal or vertical. */
export function isOrthogonal(route: readonly Vec2[]): boolean {
  for (let index = 1; index < route.length; index += 1) {
    const a = route[index - 1]!;
    const b = route[index]!;
    if (a.x !== b.x && a.y !== b.y) return false;
  }
  return true;
}

/** Strict interior: touching a border does not count. */
export function segmentCrossesInterior(a: Vec2, b: Vec2, rect: Rect): boolean {
  const left = Math.min(a.x, b.x);
  const right = Math.max(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const bottom = Math.max(a.y, b.y);
  return left < rect.x + rect.width && right > rect.x && top < rect.y + rect.height && bottom > rect.y;
}

export function routeCrossesInterior(route: readonly Vec2[], rect: Rect): boolean {
  for (let index = 1; index < route.length; index += 1) {
    if (segmentCrossesInterior(route[index - 1]!, route[index]!, rect)) return true;
  }
  return false;
}

/** Two orthogonal routes share a segment: a collinear overlap of positive length. */
export function sharesSegment(left: readonly Vec2[], right: readonly Vec2[]): boolean {
  for (let i = 1; i < left.length; i += 1) {
    for (let j = 1; j < right.length; j += 1) {
      const a1 = left[i - 1]!;
      const a2 = left[i]!;
      const b1 = right[j - 1]!;
      const b2 = right[j]!;
      if (a1.y === a2.y && b1.y === b2.y && a1.y === b1.y) {
        const overlap = Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
        if (overlap > 0) return true;
      }
      if (a1.x === a2.x && b1.x === b2.x && a1.x === b1.x) {
        const overlap = Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
        if (overlap > 0) return true;
      }
    }
  }
  return false;
}

/** Which side of `rect` a point lies on, or undefined when it is on none. */
export function sideOfPoint(rect: Rect, point: Vec2): "north" | "east" | "south" | "west" | undefined {
  if (point.x === rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) return "east";
  if (point.x === rect.x && point.y >= rect.y && point.y <= rect.y + rect.height) return "west";
  if (point.y === rect.y && point.x >= rect.x && point.x <= rect.x + rect.width) return "north";
  if (point.y === rect.y + rect.height && point.x >= rect.x && point.x <= rect.x + rect.width) return "south";
  return undefined;
}

const NORMALS = { north: { x: 0, y: -1 }, east: { x: 1, y: 0 }, south: { x: 0, y: 1 }, west: { x: -1, y: 0 } } as const;

/**
 * An ORACLE for L-R3, written independently of the engine's router: the fewest
 * bends any orthogonal route can have between two fixed docks, around the given
 * obstacles grown by `clearance`. It is a plain 0-1 breadth-first search over
 * (grid point, heading) on the Hanan grid of the obstacle boundaries and the two
 * clearance points, counting turns only; a unit is blocked when its midpoint is
 * strictly inside a grown obstacle. Any orthogonal route can be slid onto that
 * grid without adding a bend, so its answer is the minimum over the plane.
 */
export function minimalBends(
  start: Vec2,
  startRect: Rect,
  end: Vec2,
  endRect: Rect,
  obstacles: readonly Rect[],
  clearance: number,
): number {
  const startSide = sideOfPoint(startRect, start)!;
  const endSide = sideOfPoint(endRect, end)!;
  const out = NORMALS[startSide];
  const back = NORMALS[endSide];
  const s = { x: start.x + out.x * clearance, y: start.y + out.y * clearance };
  const t = { x: end.x + back.x * clearance, y: end.y + back.y * clearance };
  const grown = obstacles.map((rect) => ({
    left: rect.x - clearance,
    right: rect.x + rect.width + clearance,
    top: rect.y - clearance,
    bottom: rect.y + rect.height + clearance,
  }));
  const xs = [...new Set([s.x, t.x, ...grown.flatMap((box) => [box.left, box.right])])].sort((a, b) => a - b);
  const ys = [...new Set([s.y, t.y, ...grown.flatMap((box) => [box.top, box.bottom])])].sort((a, b) => a - b);
  const free = (x: number, y: number) =>
    !grown.some((box) => x > box.left && x < box.right && y > box.top && y < box.bottom);
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ] as const;
  const heading = (vector: { x: number; y: number }) => dirs.findIndex(([dx, dy]) => dx === vector.x && dy === vector.y);
  const arrive = heading({ x: -back.x, y: -back.y });
  const key = (i: number, j: number, d: number) => (j * xs.length + i) * 4 + d;
  const best = new Map<number, number>();
  const deque: [number, number, number, number][] = [[xs.indexOf(s.x), ys.indexOf(s.y), heading(out), 0]];
  let answer = Number.POSITIVE_INFINITY;
  while (deque.length > 0) {
    const [i, j, d, turns] = deque.shift()!;
    const k = key(i, j, d);
    if ((best.get(k) ?? Number.POSITIVE_INFINITY) <= turns && best.has(k)) continue;
    best.set(k, turns);
    if (xs[i] === t.x && ys[j] === t.y && (d + 2) % 4 !== arrive) {
      answer = Math.min(answer, turns + (d === arrive ? 0 : 1));
    }
    for (let nd = 0; nd < 4; nd += 1) {
      if (nd === (d + 2) % 4) continue;
      const ni = i + dirs[nd]![0];
      const nj = j + dirs[nd]![1];
      if (ni < 0 || nj < 0 || ni >= xs.length || nj >= ys.length) continue;
      if (!free((xs[i]! + xs[ni]!) / 2, (ys[j]! + ys[nj]!) / 2)) continue;
      const cost = turns + (nd === d ? 0 : 1);
      if ((best.get(key(ni, nj, nd)) ?? Number.POSITIVE_INFINITY) <= cost) continue;
      if (nd === d) deque.unshift([ni, nj, nd, cost]);
      else deque.push([ni, nj, nd, cost]);
    }
  }
  return answer;
}

/**
 * About 40 nodes in 3 nesting levels: 3 groups, each holding 2 sub-containers,
 * each holding 6 or 7 nodes. Chains inside every sub-container, one link from
 * each sub-container to the next, four skip links across groups, one back edge
 * closing a cycle, and four labelled links.
 */
export function largeDocumentSpec(): DocSpec {
  const sizes = [7, 7, 7, 7, 6, 6];
  const nodes: string[] = [];
  const containers: Record<string, string[]> = { g0: [], g1: [], g2: [] };
  const links: [string, string, string, string?][] = [];
  const subs: string[][] = [];
  let next = 0;
  sizes.forEach((size, index) => {
    const group = `g${Math.floor(index / 2)}`;
    const sub = `s${index}`;
    containers[group]!.push(sub);
    const members: string[] = [];
    for (let k = 0; k < size; k += 1) {
      const id = `n${String(next).padStart(2, "0")}`;
      next += 1;
      nodes.push(id);
      members.push(id);
    }
    containers[sub] = members;
    subs.push(members);
    for (let k = 1; k < members.length; k += 1) links.push([`c${members[k - 1]}`, members[k - 1]!, members[k]!]);
  });
  for (let index = 1; index < subs.length; index += 1) {
    const from = subs[index - 1]![subs[index - 1]!.length - 1]!;
    const to = subs[index]![0]!;
    links.push(index % 2 === 0 ? [`x${index}`, from, to, `hand-off ${index}`] : [`x${index}`, from, to]);
  }
  links.push(["k1", "n00", "n20"], ["k2", "n10", "n35"], ["k3", "n05", "n30", "skip"], ["k4", "n15", "n25"], ["back", "n39", "n00", "loop back"]);
  return { nodes, containers, links };
}

/** A copy of a document whose records were inserted in a different order. Content is identical. */
export function shuffled(document: SemanticDocument, seed: number): SemanticDocument {
  let state = seed;
  const random = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  const shuffle = <T>(record: Readonly<Record<string, T>>): Record<string, T> => {
    const entries = Object.entries(record);
    for (let index = entries.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [entries[index], entries[other]] = [entries[other]!, entries[index]!];
    }
    return Object.fromEntries(entries);
  };
  return { ...document, entities: shuffle(document.entities), relations: shuffle(document.relations) };
}
