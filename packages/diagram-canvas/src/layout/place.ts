/**
 * Placement: sizes, ranks and positions of every entity, nesting level by
 * nesting level, in world coordinates.
 *
 * COMPOUND LAYOUT. A container is laid out from the inside out: its children are
 * ranked and placed as one level (L-R6), the content box gets the container's
 * padding and title band, and the container then takes part in its parent's
 * level as one member. An edge between two entities of different members of a
 * level is LIFTED to those members for ranking and ordering, which is how an
 * edge across containers still orders the containers it joins.
 *
 * AXES. The flow direction (L-R5) maps an abstract `main` axis (along the flow,
 * across ranks) and `cross` axis (within a rank) to world x/y: left-to-right is
 * main = x; top-to-bottom is main = y. A container's title band is always at its
 * top in world space.
 *
 * CROSS POSITIONS. Within a rank, members keep the L-R6 order and sit at the
 * positions closest (least squares) to the mean of their neighbours in the
 * adjacent rank, subject to the minimum separation. That is an isotonic
 * regression, solved exactly by pool-adjacent-violators: no iteration count to
 * tune and no order dependence. A chain therefore comes out straight, which is
 * what lets a lone edge dock at both centres with no bend (L-R1, L-R3).
 *
 * L-R4 — ROW CONSTITUTION, ALIGNMENT AND FILL. A row is constituted per nesting
 * level, among sibling containers only, once per placement attempt from the
 * pre-row geometry, then fixed for that attempt's rounds. Top-to-bottom: a
 * row is one rank, all its containers; they take the rank's main-axis start
 * and are stretched to the rank extent (the greatest natural main size in
 * the rank). Left-to-right: rows start as the connected components of the
 * strict cross-axis (vertical) overlap relation between sibling containers
 * (components over pairs in entity-id order), each split into
 * rank-compatible rows — a row never holds two members of one rank. Row
 * containers take a common cross start (the greatest in the row) and a
 * common cross size (the greatest natural cross size in the row); members
 * below them in each rank are pushed along the cross axis to restore the
 * minimum separation (`nodeGap`, or `slotSpacing` next to a dummy, plus any
 * L-R10 `siblingExtra` between the pair). Alignment and push-down iterate as
 * one round for at most 20 rounds; with no change-free round the engine keeps
 * the last geometry and reports `row-fill-partial` for that level. Container
 * content keeps its origin (padding and title band unchanged) inside a
 * stretched container.
 */

import type { EntityRef } from "@sentropic/diagram-core";

import type { Rect } from "../transform.js";
import { memberOf, type LayoutGraph } from "./graph.js";
import { orderLevel, type LevelEdge } from "./rank.js";
import type { FlowDirection, LayoutMetrics, LayoutWarning, TextMeasurer } from "./types.js";

export interface LevelGeometry {
  /** The container reference, or `root`. */
  readonly key: string;
  readonly depth: number;
  /** The region a point must fall in to belong to this level: the container box, or the whole drawing. */
  readonly region: Rect;
  /** Absolute main-axis interval of the gap after rank `rank`. */
  readonly gaps: readonly { readonly rank: number; readonly from: number; readonly to: number }[];
  /** Adjacent members of each rank, in cross order: what L-R10 widens sideways. */
  readonly siblings: readonly SiblingGap[];
}

/** Two adjacent members of one rank: the sibling gap L-R10 may widen. */
export interface SiblingGap {
  /** Key into `PlaceInput.extraSiblingGaps`. */
  readonly key: string;
  /** Rank index within the level. */
  readonly rank: number;
  /** The member before the gap in cross order. */
  readonly left: string;
  /** The member after the gap in cross order. */
  readonly right: string;
}

export interface Placement {
  readonly direction: FlowDirection;
  readonly rects: ReadonlyMap<EntityRef, Rect>;
  /** The title band of every container: what an edge label must never cover (L-R10). */
  readonly titleBands: ReadonlyMap<EntityRef, Rect>;
  readonly levels: readonly LevelGeometry[];
  readonly width: number;
  readonly height: number;
  /** Rank of each entity within its own level, for diagnostics and tests. */
  readonly rankOf: ReadonlyMap<EntityRef, number>;
  readonly warnings: readonly LayoutWarning[];
}

export interface PlaceInput {
  readonly graph: LayoutGraph;
  readonly direction: FlowDirection;
  readonly metrics: LayoutMetrics;
  readonly measureText: TextMeasurer;
  /** Extra gap after a rank, keyed `<level key>#<rank>`, requested by L-R10. */
  readonly extraGaps: ReadonlyMap<string, number>;
  /** Extra separation between two siblings, keyed by `SiblingGap.key`, requested by L-R10. */
  readonly extraSiblingGaps: ReadonlyMap<string, number>;
  /** Minimum node sizes requested by docking, when a side was too short for its slots (L-R2). */
  readonly minSizes: ReadonlyMap<EntityRef, { readonly width: number; readonly height: number }>;
}

interface Box {
  main: number;
  cross: number;
  mainSize: number;
  crossSize: number;
}

interface LevelLocal {
  readonly mainSize: number;
  readonly crossSize: number;
  readonly boxes: ReadonlyMap<string, Box>;
  readonly gaps: readonly { readonly rank: number; readonly from: number; readonly to: number }[];
  readonly siblings: readonly SiblingGap[];
}

/** The level key of the drawing root: `Placement.levels` holds it at depth 0. */
export const ROOT = "root";

/** Key into `PlaceInput.extraSiblingGaps` for the gap between two adjacent members. */
export function siblingGapKey(levelKey: string, rank: number, left: string, right: string): string {
  return `${levelKey}#sibling#${rank}#${left}#${right}`;
}
export const ROW_FILL_ROUNDS = 20;

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

/** Least-squares positions closest to `desired` with `x[i+1] - x[i] >= seps[i]` (pool adjacent violators). */
export function isotonicPositions(desired: readonly number[], seps: readonly number[]): number[] {
  const offsets: number[] = [];
  let running = 0;
  for (let index = 0; index < desired.length; index += 1) {
    offsets.push(running);
    running += seps[index] ?? 0;
  }
  const blocks: { sum: number; count: number }[] = [];
  for (let index = 0; index < desired.length; index += 1) {
    blocks.push({ sum: desired[index]! - offsets[index]!, count: 1 });
    while (blocks.length > 1) {
      const last = blocks[blocks.length - 1]!;
      const before = blocks[blocks.length - 2]!;
      if (before.sum / before.count <= last.sum / last.count) break;
      before.sum += last.sum;
      before.count += last.count;
      blocks.pop();
    }
  }
  const result: number[] = [];
  for (const block of blocks) for (let k = 0; k < block.count; k += 1) result.push(block.sum / block.count);
  return result.map((value, index) => value + offsets[index]!);
}

/** The label-aware slot spacing of a side carrying labels of this thickness (L-R2 with L-R10). */
export function slotSpacingFor(metrics: LayoutMetrics, labelThickness: number): number {
  return labelThickness > 0 ? Math.max(metrics.slotSpacing, labelThickness + metrics.labelMargin) : metrics.slotSpacing;
}

export function place(input: PlaceInput): Placement {
  const { graph, direction, metrics, measureText, extraGaps, extraSiblingGaps, minSizes } = input;
  const leftToRight = direction === "left-to-right";
  const warnings: LayoutWarning[] = [];
  const rankOfEntity = new Map<EntityRef, number>();

  const toWorld = (box: Box): Rect =>
    leftToRight
      ? { x: box.main, y: box.cross, width: box.mainSize, height: box.crossSize }
      : { x: box.cross, y: box.main, width: box.crossSize, height: box.mainSize };
  const fromWorldSize = (width: number, height: number) =>
    leftToRight ? { mainSize: width, crossSize: height } : { mainSize: height, crossSize: width };

  // --- slot needs per node, so a side is long enough for its docking slots ---
  const ins = new Map<EntityRef, number>();
  const outs = new Map<EntityRef, number>();
  const labelThickness = new Map<EntityRef, number>();
  for (const edge of graph.edges) {
    outs.set(edge.source.entity, (outs.get(edge.source.entity) ?? 0) + 1);
    ins.set(edge.target.entity, (ins.get(edge.target.entity) ?? 0) + 1);
    if (edge.label !== undefined) {
      const size = measureText(edge.label, "edge-label");
      const thickness = leftToRight ? size.height : size.width;
      for (const entity of [edge.source.entity, edge.target.entity]) {
        labelThickness.set(entity, Math.max(labelThickness.get(entity) ?? 0, thickness));
      }
    }
  }

  const titleHeight = new Map<EntityRef, number>();
  const contentOrigin = (id: EntityRef) => ({ x: metrics.containerPadding, y: metrics.containerPadding + titleHeight.get(id)! });

  const levelLocals = new Map<string, LevelLocal>();

  const sizeOf = (id: EntityRef): { width: number; height: number } => {
    const node = graph.nodes.get(id)!;
    if (node.kind === "container") {
      const local = layoutLevel(id, node.children);
      const title = measureText(node.label, "container-title");
      const band = title.height + 2 * metrics.titlePaddingY;
      titleHeight.set(id, band);
      const content = leftToRight
        ? { width: local.mainSize, height: local.crossSize }
        : { width: local.crossSize, height: local.mainSize };
      return {
        width: Math.max(content.width + 2 * metrics.containerPadding, title.width + 2 * metrics.containerPadding),
        height: content.height + 2 * metrics.containerPadding + band,
      };
    }
    const text = measureText(node.label, "node");
    let width = Math.max(metrics.nodeMinWidth, text.width + 2 * metrics.nodePaddingX);
    let height = Math.max(metrics.nodeMinHeight, text.height + 2 * metrics.nodePaddingY);
    const slots = Math.max(ins.get(id) ?? 0, outs.get(id) ?? 0);
    if (slots >= 2) {
      const needed = (slots + 1) * slotSpacingFor(metrics, labelThickness.get(id) ?? 0);
      if (leftToRight) height = Math.max(height, needed);
      else width = Math.max(width, needed);
    }
    const minimum = minSizes.get(id);
    if (minimum !== undefined) {
      width = Math.max(width, minimum.width);
      height = Math.max(height, minimum.height);
    }
    return { width, height };
  };

  function layoutLevel(key: string, members: readonly EntityRef[]): LevelLocal {
    const parent = key === ROOT ? undefined : (key as EntityRef);
    const sorted = [...members].sort(byString);
    const boxes = new Map<string, Box>();
    for (const member of sorted) {
      const size = sizeOf(member);
      boxes.set(member, { main: 0, cross: 0, ...fromWorldSize(size.width, size.height) });
    }

    const lifted: LevelEdge[] = [];
    for (const edge of graph.edges) {
      const from = memberOf(graph, edge.source.entity, parent);
      const to = memberOf(graph, edge.target.entity, parent);
      if (from === undefined || to === undefined || from === to) continue;
      lifted.push({ id: edge.id, from, to });
    }
    const order = orderLevel(sorted, lifted);
    // Sibling gaps of this level, in cross order, with L-R10's requested widening.
    const siblings: SiblingGap[] = [];
    const siblingExtra = new Map<string, number>();
    order.ranks.forEach((members, rank) => {
      for (let index = 1; index < members.length; index += 1) {
        const left = members[index - 1]!;
        const right = members[index]!;
        siblings.push({ key: siblingGapKey(key, rank, left, right), rank, left, right });
        const extra = extraSiblingGaps.get(siblingGapKey(key, rank, left, right)) ?? 0;
        if (extra > 0) siblingExtra.set(`${left}|${right}`, extra);
      }
    });
    for (const member of sorted) rankOfEntity.set(member, order.rankOf.get(member)!);
    for (const dummy of order.dummies) boxes.set(dummy, { main: 0, cross: 0, mainSize: 0, crossSize: metrics.slotSpacing });

    const isDummy = (id: string) => order.dummies.has(id);
    const isContainer = (id: string) => !isDummy(id) && graph.nodes.get(id as EntityRef)?.kind === "container";

    // Main axis: rank bands separated by the (possibly lengthened) gap.
    const extents = order.ranks.map((rank) =>
      rank.reduce((widest, id) => (isDummy(id) ? widest : Math.max(widest, boxes.get(id)!.mainSize)), 0),
    );
    const starts: number[] = [];
    let cursor = 0;
    for (let rank = 0; rank < order.ranks.length; rank += 1) {
      starts.push(cursor);
      cursor += extents[rank]! + metrics.rankGap + (extraGaps.get(`${key}#${rank}`) ?? 0);
    }
    order.ranks.forEach((rank, index) => {
      for (const id of rank) {
        const box = boxes.get(id)!;
        if (isDummy(id)) box.main = starts[index]! + extents[index]! / 2;
        else if (isContainer(id)) {
          box.main = starts[index]!;
          // L-R4, top-to-bottom: the rank IS the row; stretch to its height.
          if (!leftToRight) box.mainSize = extents[index]!;
        } else box.main = starts[index]! + (extents[index]! - box.mainSize) / 2;
      }
    });

    // Cross axis: barycentric isotonic placement, keeping the L-R6 order.
    // L-R10 may widen one sibling gap: the extra separation pushes exactly
    // those two neighbours apart, and the lanes docked on them with them.
    const separation = (left: string, right: string) =>
      (boxes.get(left)!.crossSize + boxes.get(right)!.crossSize) / 2 +
      (isDummy(left) || isDummy(right) ? metrics.slotSpacing : metrics.nodeGap) +
      (siblingExtra.get(`${left}|${right}`) ?? 0);
    const centre = new Map<string, number>();
    for (const rank of order.ranks) {
      let running = 0;
      rank.forEach((id, index) => {
        if (index > 0) running += separation(rank[index - 1]!, id);
        centre.set(id, running);
      });
      const shift = running / 2;
      for (const id of rank) centre.set(id, centre.get(id)! - shift);
    }
    const upNeighbours = new Map<string, string[]>();
    const downNeighbours = new Map<string, string[]>();
    for (const segment of order.segments) {
      (downNeighbours.get(segment.from) ?? downNeighbours.set(segment.from, []).get(segment.from)!).push(segment.to);
      (upNeighbours.get(segment.to) ?? upNeighbours.set(segment.to, []).get(segment.to)!).push(segment.from);
    }
    const settle = (rank: readonly string[], neighbours: (id: string) => readonly string[]) => {
      if (rank.length === 0) return;
      const desired = rank.map((id) => {
        const linked = neighbours(id);
        return linked.length === 0
          ? centre.get(id)!
          : linked.reduce((sum, other) => sum + centre.get(other)!, 0) / linked.length;
      });
      const seps = rank.slice(1).map((id, index) => separation(rank[index]!, id));
      isotonicPositions(desired, seps).forEach((value, index) => centre.set(rank[index]!, value));
    };
    for (let pass = 0; pass < 8; pass += 1) {
      for (let rank = 1; rank < order.ranks.length; rank += 1) settle(order.ranks[rank]!, (id) => upNeighbours.get(id) ?? []);
      for (let rank = order.ranks.length - 2; rank >= 0; rank -= 1) {
        settle(order.ranks[rank]!, (id) => downNeighbours.get(id) ?? []);
      }
    }
    for (const rank of order.ranks) {
      settle(rank, (id) => [...(upNeighbours.get(id) ?? []), ...(downNeighbours.get(id) ?? [])]);
    }
    for (const [id, value] of centre) {
      const box = boxes.get(id)!;
      box.cross = value - box.crossSize / 2;
    }

    // L-R4, left-to-right: rows across columns, then push-down within each column.
    // Rows are constituted once from the pre-row geometry and fixed for the
    // attempt's rounds; each component is split into rank-compatible rows so
    // aligning a row can never superpose two of its own members.
    if (leftToRight) {
      const containers = sorted.filter((id) => isContainer(id));
      const preRow = new Map<string, { start: number; end: number }>();
      for (const id of containers) {
        const box = boxes.get(id)!;
        preRow.set(id, { start: box.cross, end: box.cross + box.crossSize });
      }
      const rowOf = new Map<string, string>(containers.map((id) => [id, id]));
      const find = (id: string): string => {
        let rootId = id;
        while (rowOf.get(rootId) !== rootId) rootId = rowOf.get(rootId)!;
        return rootId;
      };
      for (let i = 0; i < containers.length; i += 1) {
        for (let j = i + 1; j < containers.length; j += 1) {
          const a = preRow.get(containers[i]!)!;
          const b = preRow.get(containers[j]!)!;
          if (a.start < b.end && b.start < a.end) {
            const ra = find(containers[i]!);
            const rb = find(containers[j]!);
            if (ra !== rb) rowOf.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
          }
        }
      }
      const components = new Map<string, string[]>();
      for (const id of containers) (components.get(find(id)) ?? components.set(find(id), []).get(find(id))!).push(id);
      const rankOfMember = (id: string): number => order.rankOf.get(id) ?? 0;
      const rows: string[][] = [];
      for (const component of components.values()) {
        const members = [...component].sort((left, right) => rankOfMember(left) - rankOfMember(right) || byString(left, right));
        const compatible: string[][] = [];
        const ranksHeld: Set<number>[] = [];
        for (const member of members) {
          const rank = rankOfMember(member);
          let placedMember = false;
          for (let index = 0; index < compatible.length; index += 1) {
            if (!ranksHeld[index]!.has(rank)) {
              compatible[index]!.push(member);
              ranksHeld[index]!.add(rank);
              placedMember = true;
              break;
            }
          }
          if (!placedMember) {
            compatible.push([member]);
            ranksHeld.push(new Set([rank]));
          }
        }
        rows.push(...compatible);
      }
      const pushGap = (left: string, right: string): number =>
        (isDummy(left) || isDummy(right) ? metrics.slotSpacing : metrics.nodeGap) +
        (siblingExtra.get(`${left}|${right}`) ?? 0);
      let settled = rows.every((row) => row.length < 2);
      for (let round = 0; round < ROW_FILL_ROUNDS && !settled; round += 1) {
        let changed = false;
        for (const row of rows) {
          if (row.length < 2) continue;
          const top = Math.max(...row.map((id) => boxes.get(id)!.cross));
          const bottom = Math.max(...row.map((id) => top + boxes.get(id)!.crossSize));
          for (const id of row) {
            const box = boxes.get(id)!;
            if (box.cross !== top || box.crossSize !== bottom - top) {
              changed = true;
              box.cross = top;
              box.crossSize = bottom - top;
            }
          }
        }
        for (const rank of order.ranks) {
          for (let index = 1; index < rank.length; index += 1) {
            const before = boxes.get(rank[index - 1]!)!;
            const box = boxes.get(rank[index]!)!;
            const minimum = before.cross + before.crossSize + pushGap(rank[index - 1]!, rank[index]!);
            if (box.cross < minimum) {
              box.cross = minimum;
              changed = true;
            }
          }
        }
        if (!changed) settled = true;
      }
      if (!settled) {
        warnings.push({
          code: "row-fill-partial",
          refs: containers,
          message: `row alignment of the containers of ${key} did not settle in ${ROW_FILL_ROUNDS} rounds`,
        });
      }
    }

    // Normalise to a content box starting at 0, 0.
    let minMain = Number.POSITIVE_INFINITY;
    let minCross = Number.POSITIVE_INFINITY;
    let maxMain = Number.NEGATIVE_INFINITY;
    let maxCross = Number.NEGATIVE_INFINITY;
    for (const box of boxes.values()) {
      minMain = Math.min(minMain, box.main);
      minCross = Math.min(minCross, box.cross);
      maxMain = Math.max(maxMain, box.main + box.mainSize);
      maxCross = Math.max(maxCross, box.cross + box.crossSize);
    }
    if (boxes.size === 0) {
      minMain = minCross = maxMain = maxCross = 0;
    }
    for (const box of boxes.values()) {
      box.main -= minMain;
      box.cross -= minCross;
    }
    const gaps = order.ranks.slice(0, -1).map((_, rank) => ({
      rank,
      from: starts[rank]! + extents[rank]! - minMain,
      to: starts[rank + 1]! - minMain,
    }));
    const local: LevelLocal = { mainSize: maxMain - minMain, crossSize: maxCross - minCross, boxes, gaps, siblings };
    levelLocals.set(key, local);
    return local;
  }

  const root = layoutLevel(ROOT, graph.roots);

  // Absolute pass.
  const rects = new Map<EntityRef, Rect>();
  const titleBands = new Map<EntityRef, Rect>();
  const levels: LevelGeometry[] = [];
  const rootWorld = leftToRight
    ? { width: root.mainSize, height: root.crossSize }
    : { width: root.crossSize, height: root.mainSize };

  const absolute = (key: string, origin: { x: number; y: number }, region: Rect, depth: number) => {
    const local = levelLocals.get(key)!;
    const originMain = leftToRight ? origin.x : origin.y;
    levels.push({
      key,
      depth,
      region,
      gaps: local.gaps.map((gap) => ({ rank: gap.rank, from: originMain + gap.from, to: originMain + gap.to })),
      siblings: local.siblings,
    });
    for (const [id, box] of local.boxes) {
      const node = graph.nodes.get(id as EntityRef);
      if (node === undefined) continue;
      const world = toWorld(box);
      const rect = { x: origin.x + world.x, y: origin.y + world.y, width: world.width, height: world.height };
      rects.set(node.id, rect);
      if (node.kind === "container") {
        titleBands.set(node.id, { x: rect.x, y: rect.y, width: rect.width, height: titleHeight.get(node.id)! });
        const inner = contentOrigin(node.id);
        absolute(node.id, { x: rect.x + inner.x, y: rect.y + inner.y }, rect, depth + 1);
      }
    }
  };
  absolute(ROOT, { x: 0, y: 0 }, { x: 0, y: 0, width: rootWorld.width, height: rootWorld.height }, 0);

  return {
    direction,
    rects,
    titleBands,
    levels,
    width: rootWorld.width,
    height: rootWorld.height,
    rankOf: rankOfEntity,
    warnings,
  };
}
