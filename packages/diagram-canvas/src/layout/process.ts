import {
  createView,
  entityRef,
  notationForProfile,
  occurrenceRef,
  parseProcessFlowExtension,
  PROCESS_PROFILE_ID,
  resolveNotation,
  validateDocument,
  viewRef,
  type Entity,
  type EntityOccurrence,
  type EntityRef,
  type OccurrenceRef,
  type Relation,
  type RelationOccurrence,
  type ResolvedNotationEntity,
  type ResolvedNotationRelation,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import type { Rect, Vec2 } from "../transform.js";
import type { LineMeasurer } from "./measure.js";
import type { FlowDirection, LayoutOptions, LayoutResult, LayoutWarning } from "./types.js";

export const PROCESS_LAYOUT_SPACING = {
  rankGap: 48,
  siblingGap: 24,
  lanePadding: 16,
  laneHeaderSize: 36,
  corridorGap: 24,
  parallelOffset: 10,
} as const;

export const PROCESS_BOX_BOUNDS = {
  minWidth: 140,
  maxWidth: 220,
  minHeight: 52,
  maxHeight: 84,
  paddingX: 16,
  paddingY: 10,
  titleSize: 14,
  titleLineHeight: 18,
  subtitleSize: 12,
  subtitleLineHeight: 16,
  badgeSize: 20,
  badgeGap: 8,
  cornerRadius: 10,
} as const;

const byCodeUnit = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

function attrText(entityOrRel: { readonly attributes: Entity["attributes"] }, key: string): string | undefined {
  const attr = entityOrRel.attributes[key];
  return attr !== undefined && attr.kind === "text" && attr.value !== "" ? attr.value : undefined;
}

function attrEnum(entityOrRel: { readonly attributes: Entity["attributes"] }, key: string): string | undefined {
  const attr = entityOrRel.attributes[key];
  return attr !== undefined && attr.kind === "enum" ? attr.value : undefined;
}

function attrQuantity(entityOrRel: { readonly attributes: Entity["attributes"] }, key: string): number | undefined {
  const attr = entityOrRel.attributes[key];
  return attr !== undefined && attr.kind === "quantity" ? attr.value : undefined;
}

export interface MeasuredProcessStepBox {
  readonly width: number;
  readonly height: number;
  readonly titleLines: readonly string[];
  readonly subtitleLines: readonly string[];
}

function approxTextWidth(value: string, fontSize: number): number {
  return Array.from(value).length * fontSize * 0.56;
}

function wrapLines(
  textValue: string,
  maxWidth: number,
  maxLines: number,
  fontSize: number,
  measureLines?: LineMeasurer,
): readonly string[] {
  const measureWidth = (candidate: string): number => {
    if (measureLines === undefined) return approxTextWidth(candidate, fontSize);
    const measured = measureLines({
      text: candidate,
      role: fontSize >= 14 ? "title" : "subtitle",
      availableWidth: Number.MAX_SAFE_INTEGER,
      allocatedLines: 1,
      folded: false,
    });
    return Math.min(approxTextWidth(candidate, fontSize), measured.width * (fontSize / 24)) || approxTextWidth(candidate, fontSize);
  };
  const words = textValue.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current === "" ? word : `${current} ${word}`;
    if (current !== "" && measureWidth(candidate) > maxWidth && lines.length + 1 < maxLines) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current !== "") lines.push(current);
  return lines.slice(0, maxLines);
}

/** Measure a compact process-box footprint within `[140, 220] x [52, 84]` px. */
export function measureProcessStepBox(
  title: string,
  subtitle: string | undefined,
  numbered: boolean,
  measureLines?: LineMeasurer,
): MeasuredProcessStepBox {
  const b = PROCESS_BOX_BOUNDS;
  const badgeReserve = numbered ? b.badgeSize + b.badgeGap : 0;
  const titleW = approxTextWidth(title, b.titleSize);
  const subW = subtitle ? approxTextWidth(subtitle, b.subtitleSize) : 0;
  const idealWidth = Math.max(titleW, subW) + b.paddingX * 2 + badgeReserve;
  const width = Math.max(b.minWidth, Math.min(b.maxWidth, Math.ceil(idealWidth)));
  const innerWidth = Math.max(40, width - b.paddingX * 2 - badgeReserve);
  const titleLines = wrapLines(title, innerWidth, 2, b.titleSize, measureLines);
  const subtitleLines = subtitle ? wrapLines(subtitle, innerWidth, 1, b.subtitleSize, measureLines) : [];
  const textHeight =
    Math.max(1, titleLines.length) * b.titleLineHeight +
    (subtitleLines.length > 0 ? 2 + subtitleLines.length * b.subtitleLineHeight : 0);
  const height = Math.max(b.minHeight, Math.min(b.maxHeight, Math.ceil(textHeight + b.paddingY * 2)));
  return { width, height, titleLines, subtitleLines };
}

interface ProcessEdge {
  readonly id: string;
  readonly relation: Relation;
  readonly from: EntityRef;
  readonly to: EntityRef;
  readonly provisional: boolean;
  readonly emphasis: "default" | "emphasis";
  readonly label?: string;
}

interface CycleBreakResult {
  readonly forwardEdges: readonly ProcessEdge[];
  readonly backEdges: readonly ProcessEdge[];
  readonly selfLoops: readonly ProcessEdge[];
  readonly reversedIds: ReadonlySet<string>;
}

function reachesInDag(adj: ReadonlyMap<string, string[]>, from: string, to: string): boolean {
  if (from === to) return true;
  const seen = new Set<string>([from]);
  const stack = [from];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const next of adj.get(current) ?? []) {
      if (next === to) return true;
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return false;
}

/**
 * Break cycles using two-pass DFS from start / zero-in-degree nodes in
 * deterministic forward order:
 * 1. DFS over non-provisional edges first so forward paths are never reversed
 *    to accommodate a provisional (`retry` / `exception`) edge.
 * 2. Check provisional edges against the resulting DAG: any edge whose target
 *    already reaches its source becomes a back-edge.
 */
function breakCyclesDfs(
  steps: readonly Entity[],
  edges: readonly ProcessEdge[],
  resolvedEntities: Readonly<Record<string, ResolvedNotationEntity>>,
): CycleBreakResult {
  const stepIds = steps.map((s) => s.id).sort(byCodeUnit);
  const selfLoops: ProcessEdge[] = [];
  const nonSelf: ProcessEdge[] = [];
  for (const edge of edges) {
    if (edge.from === edge.to) selfLoops.push(edge);
    else nonSelf.push(edge);
  }

  const normalInDegree = new Map<string, number>(stepIds.map((id) => [id, 0]));
  const totalInDegree = new Map<string, number>(stepIds.map((id) => [id, 0]));
  const normalOutgoing = new Map<string, ProcessEdge[]>(stepIds.map((id) => [id, []]));
  const provisionalEdges: ProcessEdge[] = [];
  for (const edge of nonSelf) {
    totalInDegree.set(edge.to, (totalInDegree.get(edge.to) ?? 0) + 1);
    if (edge.provisional) {
      provisionalEdges.push(edge);
    } else {
      normalInDegree.set(edge.to, (normalInDegree.get(edge.to) ?? 0) + 1);
      normalOutgoing.get(edge.from)?.push(edge);
    }
  }
  for (const list of normalOutgoing.values()) {
    list.sort((a, b) => byCodeUnit(a.to, b.to) || byCodeUnit(a.id, b.id));
  }

  const startPriority = (id: string): number => {
    const variant = resolvedEntities[id]?.variant;
    if (variant === "start") return 0;
    if ((totalInDegree.get(id) ?? 0) === 0) return 1;
    if ((normalInDegree.get(id) ?? 0) === 0) return 2;
    return 3;
  };
  const roots = [...stepIds].sort(
    (a, b) => startPriority(a) - startPriority(b) || (normalInDegree.get(a) ?? 0) - (normalInDegree.get(b) ?? 0) || byCodeUnit(a, b),
  );

  const color = new Map<string, 0 | 1 | 2>(stepIds.map((id) => [id, 0]));
  const reversedIds = new Set<string>();
  const dagAdj = new Map<string, string[]>(stepIds.map((id) => [id, []]));

  const visit = (nodeId: string): void => {
    color.set(nodeId, 1);
    for (const edge of normalOutgoing.get(nodeId) ?? []) {
      const targetColor = color.get(edge.to) ?? 0;
      if (targetColor === 1) {
        reversedIds.add(edge.id);
      } else {
        dagAdj.get(edge.from)?.push(edge.to);
        if (targetColor === 0) visit(edge.to);
      }
    }
    color.set(nodeId, 2);
  };
  for (const root of roots) {
    if (color.get(root) === 0) visit(root);
  }

  for (const edge of [...provisionalEdges].sort((a, b) => byCodeUnit(a.id, b.id))) {
    if (reachesInDag(dagAdj, edge.to, edge.from)) {
      reversedIds.add(edge.id);
    } else {
      dagAdj.get(edge.from)?.push(edge.to);
    }
  }

  const forwardEdges = nonSelf.filter((edge) => !reversedIds.has(edge.id));
  const backEdges = nonSelf.filter((edge) => reversedIds.has(edge.id));
  return { forwardEdges, backEdges, selfLoops, reversedIds };
}

interface RankedGraph {
  readonly rankOf: ReadonlyMap<string, number>;
  readonly ranks: readonly (readonly string[])[];
  readonly dummies: ReadonlySet<string>;
  readonly segments: readonly { readonly edgeId: string; readonly from: string; readonly to: string }[];
}

function rankAndOrderForwardGraph(
  stepIds: readonly string[],
  forwardEdges: readonly ProcessEdge[],
): RankedGraph {
  const sortedIds = [...stepIds].sort(byCodeUnit);
  const adj = new Map<string, string[]>(sortedIds.map((id) => [id, []]));
  const indegree = new Map<string, number>(sortedIds.map((id) => [id, 0]));
  for (const edge of forwardEdges) {
    adj.get(edge.from)?.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }
  const rankOf = new Map<string, number>(sortedIds.map((id) => [id, 0]));
  const ready = sortedIds.filter((id) => (indegree.get(id) ?? 0) === 0);
  while (ready.length > 0) {
    ready.sort(byCodeUnit);
    const current = ready.shift()!;
    for (const next of adj.get(current) ?? []) {
      rankOf.set(next, Math.max(rankOf.get(next) ?? 0, (rankOf.get(current) ?? 0) + 1));
      const rem = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, rem);
      if (rem === 0) ready.push(next);
    }
  }

  const rankCount = sortedIds.length === 0 ? 0 : Math.max(...rankOf.values()) + 1;
  const ranks: string[][] = Array.from({ length: rankCount }, () => []);
  for (const id of sortedIds) ranks[rankOf.get(id) ?? 0]!.push(id);

  const dummies = new Set<string>();
  const segments: { readonly edgeId: string; readonly from: string; readonly to: string }[] = [];
  for (const edge of forwardEdges) {
    const fromRank = rankOf.get(edge.from) ?? 0;
    const toRank = rankOf.get(edge.to) ?? 0;
    let prev: string = edge.from;
    for (let r = fromRank + 1; r < toRank; r += 1) {
      const dummyId = `~${edge.id}~${r}`;
      dummies.add(dummyId);
      rankOf.set(dummyId, r);
      ranks[r]!.push(dummyId);
      segments.push({ edgeId: edge.id, from: prev, to: dummyId });
      prev = dummyId;
    }
    segments.push({ edgeId: edge.id, from: prev, to: edge.to });
  }
  for (const rank of ranks) rank.sort(byCodeUnit);

  const down = new Map<string, string[]>();
  const up = new Map<string, string[]>();
  for (const seg of segments) {
    (down.get(seg.from) ?? down.set(seg.from, []).get(seg.from)!).push(seg.to);
    (up.get(seg.to) ?? up.set(seg.to, []).get(seg.to)!).push(seg.from);
  }

  const countCrossings = (order: readonly (readonly string[])[]): number => {
    const pos = new Map<string, number>();
    for (const rank of order) rank.forEach((key, idx) => pos.set(key, idx));
    let total = 0;
    for (let r = 0; r + 1 < order.length; r += 1) {
      const pairs = segments
        .filter((seg) => rankOf.get(seg.from) === r)
        .map((seg) => [pos.get(seg.from) ?? 0, pos.get(seg.to) ?? 0] as const);
      for (let i = 0; i < pairs.length; i += 1) {
        for (let j = i + 1; j < pairs.length; j += 1) {
          if ((pairs[i]![0] - pairs[j]![0]) * (pairs[i]![1] - pairs[j]![1]) < 0) total += 1;
        }
      }
    }
    return total;
  };

  const reorderRank = (order: string[][], r: number, neighbors: ReadonlyMap<string, string[]>, adjacent: number): void => {
    const adjPos = new Map<string, number>();
    order[adjacent]!.forEach((key, idx) => adjPos.set(key, idx));
    const current = order[r]!;
    const weight = new Map<string, number>();
    current.forEach((key, idx) => {
      const linked = neighbors.get(key) ?? [];
      weight.set(
        key,
        linked.length === 0 ? idx : linked.reduce((sum, other) => sum + (adjPos.get(other) ?? 0), 0) / linked.length,
      );
    });
    current.sort((left, right) => (weight.get(left)! - weight.get(right)!) || byCodeUnit(left, right));
  };

  let order = ranks.map((rank) => [...rank]);
  let best = order.map((rank) => [...rank]);
  let bestCrossings = countCrossings(best);
  for (let sweep = 0; sweep < 24 && bestCrossings > 0; sweep += 1) {
    if (sweep % 2 === 0) {
      for (let r = 1; r < order.length; r += 1) reorderRank(order, r, up, r - 1);
    } else {
      for (let r = order.length - 2; r >= 0; r -= 1) reorderRank(order, r, down, r + 1);
    }
    const crossings = countCrossings(order);
    if (crossings < bestCrossings) {
      bestCrossings = crossings;
      best = order.map((rank) => [...rank]);
    }
  }

  return { rankOf, ranks: best, dummies, segments };
}

interface PlacedGeometry {
  readonly direction: FlowDirection;
  readonly stepRects: ReadonlyMap<EntityRef, Rect>;
  readonly laneRects: ReadonlyMap<EntityRef, Rect>;
  readonly waypointsByRelation: ReadonlyMap<string, readonly Vec2[]>;
  readonly width: number;
  readonly height: number;
}

function buildGeometryForDirection(
  direction: FlowDirection,
  steps: readonly Entity[],
  lanes: readonly Entity[],
  laneOfStep: ReadonlyMap<EntityRef, EntityRef>,
  ranked: RankedGraph,
  boxes: ReadonlyMap<EntityRef, MeasuredProcessStepBox>,
  forwardEdges: readonly ProcessEdge[],
  backEdges: readonly ProcessEdge[],
  selfLoops: readonly ProcessEdge[],
  measureLines?: LineMeasurer,
): PlacedGeometry {
  const s = PROCESS_LAYOUT_SPACING;
  const lr = direction === "left-to-right";
  const rankCount = ranked.ranks.length;

  // Per-rank along-axis size and cross-axis size.
  const rankAlongSize: number[] = Array.from({ length: rankCount }, () => 0);
  for (let r = 0; r < rankCount; r += 1) {
    for (const key of ranked.ranks[r]!) {
      if (ranked.dummies.has(key)) continue;
      const box = boxes.get(key as EntityRef)!;
      rankAlongSize[r] = Math.max(rankAlongSize[r]!, lr ? box.width : box.height);
    }
    if (rankAlongSize[r] === 0) rankAlongSize[r] = lr ? PROCESS_BOX_BOUNDS.minWidth : PROCESS_BOX_BOUNDS.minHeight;
  }

  // Per-gap rankGap: 48 px base, widened up to labelWidth + 24 only when a label on an adjacent-rank edge needs space.
  const rankGaps: number[] = Array.from({ length: Math.max(0, rankCount - 1) }, () => s.rankGap);
  for (const edge of forwardEdges) {
    if (!edge.label) continue;
    const rFrom = ranked.rankOf.get(edge.from) ?? 0;
    const rTo = ranked.rankOf.get(edge.to) ?? 0;
    if (rTo - rFrom !== 1) continue;
    const labelW = measureLines
      ? measureLines({ text: edge.label, role: "edge-label", availableWidth: 400, allocatedLines: 1, folded: false }).width
      : approxTextWidth(edge.label, 14);
    const needed = Math.min(labelW + 24, Math.max(s.rankGap, Math.ceil(labelW + 24)));
    rankGaps[rFrom] = Math.max(rankGaps[rFrom]!, needed);
  }

  const rankAlongPos: number[] = [];
  let alongCursor = 0;
  for (let r = 0; r < rankCount; r += 1) {
    rankAlongPos.push(alongCursor);
    alongCursor += rankAlongSize[r]! + (r + 1 < rankCount ? rankGaps[r]! : 0);
  }
  const totalAlong = alongCursor;

  // Determine cross-axis coordinates for each step (and dummy).
  const initialCrossIdx = new Map<string, number>();
  for (let r = 0; r < rankCount; r += 1) {
    ranked.ranks[r]!.forEach((key, idx) => initialCrossIdx.set(key, idx));
  }

  const crossCenter = new Map<string, number>();
  const stepRects = new Map<EntityRef, Rect>();
  const laneRects = new Map<EntityRef, Rect>();

  let mainCrossExtent = 0;

  if (lanes.length === 0) {
    const rankCrossHeights: number[] = [];
    for (let r = 0; r < rankCount; r += 1) {
      let totalCross = 0;
      const items = ranked.ranks[r]!;
      items.forEach((key, idx) => {
        const size = ranked.dummies.has(key)
          ? 24
          : lr
            ? boxes.get(key as EntityRef)!.height
            : boxes.get(key as EntityRef)!.width;
        totalCross += size + (idx + 1 < items.length ? s.siblingGap : 0);
      });
      rankCrossHeights.push(totalCross);
      mainCrossExtent = Math.max(mainCrossExtent, totalCross);
    }

    for (let r = 0; r < rankCount; r += 1) {
      const items = ranked.ranks[r]!;
      let cursor = (mainCrossExtent - rankCrossHeights[r]!) / 2;
      for (const key of items) {
        if (ranked.dummies.has(key)) {
          crossCenter.set(key, cursor + 12);
          cursor += 24 + s.siblingGap;
          continue;
        }
        const id = key as EntityRef;
        const box = boxes.get(id)!;
        const stepWidth = lr ? rankAlongSize[r]! : box.width;
        const stepHeight = lr ? box.height : rankAlongSize[r]!;
        const x = lr ? rankAlongPos[r]! : cursor;
        const y = lr ? cursor : rankAlongPos[r]!;
        stepRects.set(id, { x, y, width: stepWidth, height: stepHeight });
        crossCenter.set(id, lr ? y + stepHeight / 2 : x + stepWidth / 2);
        cursor += (lr ? stepHeight : stepWidth) + s.siblingGap;
      }
    }
  } else {
    // Order lanes by authored `order` (if any) or barycentre across their steps' global cross positions.
    const stepPosById = new Map<EntityRef, number>();
    for (const step of steps) stepPosById.set(step.id, initialCrossIdx.get(step.id) ?? 0);

    const laneBarycentre = (laneId: EntityRef): number => {
      const members = steps.filter((step) => laneOfStep.get(step.id) === laneId);
      if (members.length === 0) return Number.POSITIVE_INFINITY;
      return members.reduce((sum, step) => sum + (stepPosById.get(step.id) ?? 0), 0) / members.length;
    };

    const sortedLanes = [...lanes].sort((a, b) => {
      const ordA = attrQuantity(a, "order");
      const ordB = attrQuantity(b, "order");
      if (ordA !== undefined && ordB !== undefined) return ordA - ordB || byCodeUnit(a.id, b.id);
      if (ordA !== undefined) return -1;
      if (ordB !== undefined) return 1;
      return laneBarycentre(a.id) - laneBarycentre(b.id) || byCodeUnit(a.id, b.id);
    });

    const unlanedSteps = steps.filter((step) => laneOfStep.get(step.id) === undefined);
    const bandIds: (EntityRef | undefined)[] = [
      ...sortedLanes.map((l) => l.id),
      ...(unlanedSteps.length > 0 ? [undefined] : []),
    ];

    const alongStart = s.laneHeaderSize;
    let bandCursor = 0;
    for (const laneId of bandIds) {
      const bandSteps = new Set(
        steps.filter((st) => laneOfStep.get(st.id) === laneId).map((st) => st.id),
      );
      const rankSizesInBand: number[] = [];
      let maxBandCross: number = lr ? PROCESS_BOX_BOUNDS.minHeight : PROCESS_BOX_BOUNDS.minWidth;
      for (let r = 0; r < rankCount; r += 1) {
        const items = ranked.ranks[r]!.filter((k) => !ranked.dummies.has(k) && bandSteps.has(k as EntityRef));
        let sum = 0;
        items.forEach((key, idx) => {
          const box = boxes.get(key as EntityRef)!;
          sum += (lr ? box.height : box.width) + (idx + 1 < items.length ? s.siblingGap : 0);
        });
        rankSizesInBand.push(sum);
        maxBandCross = Math.max(maxBandCross, sum);
      }
      const bandSpan = maxBandCross + s.lanePadding * 2;
      if (laneId !== undefined) {
        const rect: Rect = lr
          ? { x: 0, y: bandCursor, width: alongStart + totalAlong + s.lanePadding, height: bandSpan }
          : { x: bandCursor, y: 0, width: bandSpan, height: alongStart + totalAlong + s.lanePadding };
        laneRects.set(laneId, rect);
      }

      for (let r = 0; r < rankCount; r += 1) {
        const items = ranked.ranks[r]!.filter((k) => !ranked.dummies.has(k) && bandSteps.has(k as EntityRef));
        let cursor = bandCursor + s.lanePadding + (maxBandCross - rankSizesInBand[r]!) / 2;
        for (const key of items) {
          const id = key as EntityRef;
          const box = boxes.get(id)!;
          const stepWidth = lr ? rankAlongSize[r]! : box.width;
          const stepHeight = lr ? box.height : rankAlongSize[r]!;
          const x = lr ? alongStart + rankAlongPos[r]! : cursor;
          const y = lr ? cursor : alongStart + rankAlongPos[r]!;
          stepRects.set(id, { x, y, width: stepWidth, height: stepHeight });
          crossCenter.set(id, lr ? y + stepHeight / 2 : x + stepWidth / 2);
          cursor += (lr ? stepHeight : stepWidth) + s.siblingGap;
        }
      }
      bandCursor += bandSpan;
    }

    // Place dummies in clear gaps near their neighbours' cross-centres.
    for (let r = 0; r < rankCount; r += 1) {
      for (const key of ranked.ranks[r]!) {
        if (!ranked.dummies.has(key)) continue;
        const linked = ranked.segments
          .filter((seg) => seg.from === key || seg.to === key)
          .map((seg) => (seg.from === key ? seg.to : seg.from))
          .map((other) => crossCenter.get(other))
          .filter((val): val is number => val !== undefined);
        const avg = linked.length > 0 ? linked.reduce((a, b) => a + b, 0) / linked.length : bandCursor / 2;
        crossCenter.set(key, avg);
      }
    }
    mainCrossExtent = bandCursor;
  }

  // Group parallel edges with identical (from, to) so they offset symmetrically.
  const parallelBuckets = new Map<string, ProcessEdge[]>();
  for (const edge of [...forwardEdges, ...backEdges]) {
    const key = `${edge.from}\n${edge.to}`;
    (parallelBuckets.get(key) ?? parallelBuckets.set(key, []).get(key)!).push(edge);
  }
  const parallelShift = new Map<string, number>();
  for (const list of parallelBuckets.values()) {
    list.sort((a, b) => byCodeUnit(a.id, b.id));
    list.forEach((edge, idx) => {
      parallelShift.set(edge.id, (idx - (list.length - 1) / 2) * s.parallelOffset);
    });
  }

  // Stagger bend positions for forward edges that share a rank gutter.
  const gutterEdges = new Map<number, ProcessEdge[]>();
  for (const edge of forwardEdges) {
    const rFrom = ranked.rankOf.get(edge.from) ?? 0;
    const rTo = ranked.rankOf.get(edge.to) ?? 0;
    if (rTo - rFrom === 1) {
      (gutterEdges.get(rFrom) ?? gutterEdges.set(rFrom, []).get(rFrom)!).push(edge);
    }
  }
  const gutterSlot = new Map<string, number>();
  for (const list of gutterEdges.values()) {
    const angled = list
      .filter((e) => Math.abs((crossCenter.get(e.from) ?? 0) - (crossCenter.get(e.to) ?? 0)) > 1e-3)
      .sort((a, b) =>
        ((crossCenter.get(a.from) ?? 0) - (crossCenter.get(b.from) ?? 0)) ||
        ((crossCenter.get(a.to) ?? 0) - (crossCenter.get(b.to) ?? 0)) ||
        byCodeUnit(a.id, b.id),
      );
    angled.forEach((edge, idx) => {
      const denom = angled.length + 1;
      gutterSlot.set(edge.id, (idx + 1) / denom);
    });
  }

  const waypointsByRelation = new Map<string, readonly Vec2[]>();

  for (const edge of forwardEdges) {
    const r1 = stepRects.get(edge.from)!;
    const r2 = stepRects.get(edge.to)!;
    const shift = parallelShift.get(edge.id) ?? 0;
    const rFrom = ranked.rankOf.get(edge.from) ?? 0;
    const rTo = ranked.rankOf.get(edge.to) ?? 0;

    if (lr) {
      const startDock: Vec2 = { x: r1.x + r1.width, y: r1.y + r1.height / 2 + shift };
      const endDock: Vec2 = { x: r2.x, y: r2.y + r2.height / 2 + shift };
      if (Math.abs(startDock.y - endDock.y) <= 1e-6 && rTo - rFrom === 1) {
        waypointsByRelation.set(edge.id, [startDock, endDock]);
      } else if (rTo - rFrom === 1) {
        const frac = gutterSlot.get(edge.id) ?? 0.5;
        const midX = startDock.x + (endDock.x - startDock.x) * frac;
        waypointsByRelation.set(edge.id, [startDock, { x: midX, y: startDock.y }, { x: midX, y: endDock.y }, endDock]);
      } else {
        // Multi-rank skip: route along clear dummy track above/below intermediate boxes.
        const points: Vec2[] = [startDock];
        let prevX = startDock.x;
        let prevY = startDock.y;
        for (let r = rFrom + 1; r < rTo; r += 1) {
          const dummyY = (crossCenter.get(`~${edge.id}~${r}`) ?? startDock.y) + shift;
          const rankLeft = (lanes.length > 0 ? s.laneHeaderSize : 0) + rankAlongPos[r]!;
          const rankRight = rankLeft + rankAlongSize[r]!;
          const entryX = rankLeft - rankGaps[r - 1]! / 2;
          if (Math.abs(dummyY - prevY) > 1e-6) {
            points.push({ x: entryX, y: prevY }, { x: entryX, y: dummyY });
          }
          prevX = rankRight + rankGaps[r]! / 2;
          prevY = dummyY;
        }
        if (Math.abs(endDock.y - prevY) > 1e-6) {
          points.push({ x: prevX, y: prevY }, { x: prevX, y: endDock.y });
        }
        points.push(endDock);
        waypointsByRelation.set(edge.id, points);
      }
    } else {
      const startDock: Vec2 = { x: r1.x + r1.width / 2 + shift, y: r1.y + r1.height };
      const endDock: Vec2 = { x: r2.x + r2.width / 2 + shift, y: r2.y };
      if (Math.abs(startDock.x - endDock.x) <= 1e-6 && rTo - rFrom === 1) {
        waypointsByRelation.set(edge.id, [startDock, endDock]);
      } else if (rTo - rFrom === 1) {
        const frac = gutterSlot.get(edge.id) ?? 0.5;
        const midY = startDock.y + (endDock.y - startDock.y) * frac;
        waypointsByRelation.set(edge.id, [startDock, { x: startDock.x, y: midY }, { x: endDock.x, y: midY }, endDock]);
      } else {
        const points: Vec2[] = [startDock];
        let prevX = startDock.x;
        let prevY = startDock.y;
        for (let r = rFrom + 1; r < rTo; r += 1) {
          const dummyX = (crossCenter.get(`~${edge.id}~${r}`) ?? startDock.x) + shift;
          const rankTop = (lanes.length > 0 ? s.laneHeaderSize : 0) + rankAlongPos[r]!;
          const rankBottom = rankTop + rankAlongSize[r]!;
          const entryY = rankTop - rankGaps[r - 1]! / 2;
          if (Math.abs(dummyX - prevX) > 1e-6) {
            points.push({ x: prevX, y: entryY }, { x: dummyX, y: entryY });
          }
          prevX = dummyX;
          prevY = rankBottom + rankGaps[r]! / 2;
        }
        if (Math.abs(endDock.x - prevX) > 1e-6) {
          points.push({ x: prevX, y: prevY }, { x: endDock.x, y: prevY });
        }
        points.push(endDock);
        waypointsByRelation.set(edge.id, points);
      }
    }
  }

  // Dedicated retry/back-edge corridors: upper-half back-edges use the start-side
  // corridor, lower-half back-edges use the end-side corridor so parallel branches never cross.
  const midCross = mainCrossExtent / 2;
  const lowCorridorEdges: ProcessEdge[] = [];
  const highCorridorEdges: ProcessEdge[] = [];
  for (const edge of [...backEdges].sort((a, b) => byCodeUnit(a.id, b.id))) {
    const avg = ((crossCenter.get(edge.from) ?? midCross) + (crossCenter.get(edge.to) ?? midCross)) / 2;
    if (avg < midCross - 1) lowCorridorEdges.push(edge);
    else highCorridorEdges.push(edge);
  }

  let minCross = 0;
  let maxCross = mainCrossExtent;

  const routeCorridorEdge = (edge: ProcessEdge, side: "low" | "high", trackIndex: number): void => {
    const r1 = stepRects.get(edge.from)!;
    const r2 = stepRects.get(edge.to)!;
    const shift = parallelShift.get(edge.id) ?? 0;
    const offset = (trackIndex + 1) * s.corridorGap;
    if (lr) {
      const corridorY = side === "low" ? -offset : mainCrossExtent + offset;
      minCross = Math.min(minCross, corridorY);
      maxCross = Math.max(maxCross, corridorY);
      const startDock: Vec2 = { x: r1.x + r1.width / 2 + shift, y: side === "low" ? r1.y : r1.y + r1.height };
      const endDock: Vec2 = { x: r2.x + r2.width / 2 + shift, y: side === "low" ? r2.y : r2.y + r2.height };
      waypointsByRelation.set(edge.id, [startDock, { x: startDock.x, y: corridorY }, { x: endDock.x, y: corridorY }, endDock]);
    } else {
      const corridorX = side === "low" ? -offset : mainCrossExtent + offset;
      minCross = Math.min(minCross, corridorX);
      maxCross = Math.max(maxCross, corridorX);
      const startDock: Vec2 = { x: side === "low" ? r1.x : r1.x + r1.width, y: r1.y + r1.height / 2 + shift };
      const endDock: Vec2 = { x: side === "low" ? r2.x : r2.x + r2.width, y: r2.y + r2.height / 2 + shift };
      waypointsByRelation.set(edge.id, [startDock, { x: corridorX, y: startDock.y }, { x: corridorX, y: endDock.y }, endDock]);
    }
  };

  lowCorridorEdges.forEach((edge, idx) => routeCorridorEdge(edge, "low", idx));
  highCorridorEdges.forEach((edge, idx) => routeCorridorEdge(edge, "high", idx));

  selfLoops.forEach((edge, idx) => {
    const r1 = stepRects.get(edge.from)!;
    const out = s.corridorGap + idx * 12;
    if (lr) {
      const startDock: Vec2 = { x: r1.x + r1.width * 0.75, y: r1.y };
      const endDock: Vec2 = { x: r1.x + r1.width * 0.25, y: r1.y };
      const topY = r1.y - out;
      minCross = Math.min(minCross, topY);
      waypointsByRelation.set(edge.id, [startDock, { x: startDock.x, y: topY }, { x: endDock.x, y: topY }, endDock]);
    } else {
      const startDock: Vec2 = { x: r1.x + r1.width, y: r1.y + r1.height * 0.75 };
      const endDock: Vec2 = { x: r1.x + r1.width, y: r1.y + r1.height * 0.25 };
      const rightX = r1.x + r1.width + out;
      maxCross = Math.max(maxCross, rightX);
      waypointsByRelation.set(edge.id, [startDock, { x: rightX, y: startDock.y }, { x: rightX, y: endDock.y }, endDock]);
    }
  });

  // Shift cross-axis coordinates if low-side corridor extended into negative values.
  const crossShift = minCross < 0 ? -minCross : 0;
  if (crossShift > 0) {
    for (const [id, rect] of stepRects) {
      stepRects.set(id, lr ? { ...rect, y: rect.y + crossShift } : { ...rect, x: rect.x + crossShift });
    }
    for (const [id, rect] of laneRects) {
      laneRects.set(id, lr ? { ...rect, y: rect.y + crossShift } : { ...rect, x: rect.x + crossShift });
    }
    for (const [id, pts] of waypointsByRelation) {
      waypointsByRelation.set(
        id,
        pts.map((pt) => (lr ? { x: pt.x, y: pt.y + crossShift } : { x: pt.x + crossShift, y: pt.y })),
      );
    }
  }

  const alongExtent = (lanes.length > 0 ? s.laneHeaderSize + s.lanePadding : 0) + totalAlong;
  const crossExtent = maxCross - minCross;
  return {
    direction,
    stepRects,
    laneRects,
    waypointsByRelation,
    width: lr ? alongExtent : crossExtent,
    height: lr ? crossExtent : alongExtent,
  };
}

/** Deterministic single-level process flow layout executing `diagram-notation@1` and rule `P-R1`. */
export function layoutProcess(
  document: SemanticDocument,
  options: LayoutOptions,
  source?: ViewDocument,
): LayoutResult {
  const diagnostics = validateDocument(document, {
    registry: options.registry,
    ...(options.bindings ? { bindings: options.bindings } : {}),
  });
  if (diagnostics.some((d) => d.severity === "error")) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "document", message: "Invalid process document" }],
      diagnostics,
    };
  }
  if (!Number.isFinite(options.targetWidth) || options.targetWidth <= 0) {
    return {
      status: "refused",
      refusals: [
        {
          code: "target-width-invalid",
          path: "targetWidth",
          message: `the target width is a positive number of CSS px, got ${String(options.targetWidth)}`,
        },
      ],
      diagnostics: [],
    };
  }

  const profile = options.registry.get(PROCESS_PROFILE_ID);
  const notationBlock = notationForProfile(PROCESS_PROFILE_ID);
  if (profile === undefined || notationBlock === undefined) {
    return {
      status: "refused",
      refusals: [{ code: "entity-profile-unsupported", path: "profileRefs", message: "process@1 profile not registered" }],
      diagnostics: [],
    };
  }

  const resolvedNotation = resolveNotation(notationBlock, profile, document);
  const flowExt = parseProcessFlowExtension(document);
  const numbered = flowExt?.numbered ?? true;

  const entities = Object.values(document.entities).sort((a, b) => byCodeUnit(a.id, b.id));
  const steps: Entity[] = [];
  const lanes: Entity[] = [];
  for (const entity of entities) {
    const resolved = resolvedNotation.entities[entity.id] as ResolvedNotationEntity | undefined;
    if (resolved?.role === "lane") lanes.push(entity);
    else steps.push(entity);
  }

  const laneOfStep = new Map<EntityRef, EntityRef>();
  const edges: ProcessEdge[] = [];
  for (const relation of Object.values(document.relations).sort((a, b) => byCodeUnit(a.id, b.id))) {
    const resolvedRel = resolvedNotation.relations[relation.id] as ResolvedNotationRelation | undefined;
    if (resolvedRel?.encoding === "containment") {
      const laneEnd = relation.endpoints.find((ep) => ep.role === "lane")?.target as EntityRef | undefined;
      const stepEnd = relation.endpoints.find((ep) => ep.role === "step")?.target as EntityRef | undefined;
      if (laneEnd !== undefined && stepEnd !== undefined) laneOfStep.set(stepEnd, laneEnd);
      continue;
    }
    const from = relation.endpoints.find((ep) => ep.role === "source")?.target as EntityRef | undefined;
    const to = relation.endpoints.find((ep) => ep.role === "target")?.target as EntityRef | undefined;
    if (from === undefined || to === undefined) continue;
    const kind = attrEnum(relation, "kind");
    const emphasis = attrEnum(relation, "emphasis") === "emphasis" ? "emphasis" : "default";
    const label = attrText(relation, "label");
    edges.push({
      id: relation.id,
      relation,
      from,
      to,
      provisional: resolvedRel?.provisional === true || kind === "exception",
      emphasis,
      ...(label === undefined ? {} : { label }),
    });
  }

  const boxes = new Map<EntityRef, MeasuredProcessStepBox>();
  for (const step of steps) {
    const title = attrText(step, "name") ?? step.id;
    const subtitle = attrText(step, "subtitle");
    boxes.set(step.id, measureProcessStepBox(title, subtitle, numbered, options.measureLines));
  }

  const cycleBroken = breakCyclesDfs(steps, edges, resolvedNotation.entities);
  const ranked = rankAndOrderForwardGraph(
    steps.map((s) => s.id),
    cycleBroken.forwardEdges,
  );

  // Rule P-R1: keep LR when B_lr <= targetWidth (or explicitly authored), else switch to TB.
  const lrGeometry = buildGeometryForDirection(
    "left-to-right",
    steps,
    lanes,
    laneOfStep,
    ranked,
    boxes,
    cycleBroken.forwardEdges,
    cycleBroken.backEdges,
    cycleBroken.selfLoops,
    options.measureLines,
  );
  const chosenDirection: FlowDirection =
    flowExt?.direction === "LR"
      ? "left-to-right"
      : flowExt?.direction === "TB"
        ? "top-to-bottom"
        : lrGeometry.width <= options.targetWidth
          ? "left-to-right"
          : "top-to-bottom";

  const placed =
    chosenDirection === "left-to-right"
      ? lrGeometry
      : buildGeometryForDirection(
          "top-to-bottom",
          steps,
          lanes,
          laneOfStep,
          ranked,
          boxes,
          cycleBroken.forwardEdges,
          cycleBroken.backEdges,
          cycleBroken.selfLoops,
          options.measureLines,
        );

  const entityOccurrences: Record<string, EntityOccurrence> = {};
  const stepOccIdByEntity = new Map<EntityRef, OccurrenceRef>();
  for (const lane of lanes) {
    const occId =
      Object.values(source?.entityOccurrences ?? {}).find((o) => o.entity === lane.id)?.id ??
      occurrenceRef(`e.${lane.id.slice(lane.id.indexOf(":") + 1)}`);
    const rect = placed.laneRects.get(lane.id) ?? { x: 0, y: 0, width: 140, height: 60 };
    entityOccurrences[occId] = { id: occId, entity: lane.id, geometry: rect, z: -1 };
  }
  for (const step of steps) {
    const occId =
      Object.values(source?.entityOccurrences ?? {}).find((o) => o.entity === step.id)?.id ??
      occurrenceRef(`e.${step.id.slice(step.id.indexOf(":") + 1)}`);
    stepOccIdByEntity.set(step.id, occId);
    const rect = placed.stepRects.get(step.id) ?? { x: 0, y: 0, width: PROCESS_BOX_BOUNDS.minWidth, height: PROCESS_BOX_BOUNDS.minHeight };
    entityOccurrences[occId] = { id: occId, entity: step.id, geometry: rect };
  }

  const relationOccurrences: Record<string, RelationOccurrence> = {};
  for (const edge of edges) {
    const occId =
      Object.values(source?.relationOccurrences ?? {}).find((o) => o.relation === edge.id)?.id ??
      occurrenceRef(edge.id.slice(edge.id.indexOf(":") + 1));
    const fromOcc = stepOccIdByEntity.get(edge.from)!;
    const toOcc = stepOccIdByEntity.get(edge.to)!;
    const resolvedRel = resolvedNotation.relations[edge.id];
    const waypoints = placed.waypointsByRelation.get(edge.id) ?? [];
    relationOccurrences[occId] = {
      id: occId,
      relation: edge.relation.id,
      endpoints: [
        { role: "source", occurrence: fromOcc },
        { role: "target", occurrence: toOcc },
      ],
      waypoints,
      strokeStyle: edge.provisional ? "dashed" : "solid",
      arrowhead: resolvedRel?.ends === "none" ? "none" : "arrow",
      ...(edge.emphasis === "emphasis" ? { emphasis: "emphasis" } : {}),
    };
  }

  const view = {
    ...createView({
      viewId: options.viewId ?? source?.viewId ?? viewRef("process"),
      semanticDocumentId: document.documentId,
      revision: document.revision,
    }),
    entityOccurrences,
    relationOccurrences,
  };

  const width = Math.max(1, placed.width);
  const height = Math.max(1, placed.height);
  const zoom = Math.min(1, options.targetWidth / width);
  const warnings: LayoutWarning[] = [];

  return {
    status: "laid-out",
    view,
    fit: {
      direction: chosenDirection,
      width,
      height,
      zoom,
      pans: width * zoom > options.targetWidth + 0.5,
      phone: options.targetWidth <= 390,
    },
    warnings,
    orientations: { root: chosenDirection === "left-to-right" ? "columns" : "rows" },
  };
}

/** Derive deterministic topological step numbers (`1`, `2`, `2a`, `2b`, ...) for a `process@1` document. */
export function computeProcessStepNumbers(
  document: SemanticDocument,
  steps: readonly Entity[],
): ReadonlyMap<EntityRef, string> {
  const profileNotation = notationForProfile(PROCESS_PROFILE_ID);
  const edges: ProcessEdge[] = [];
  const resolvedEntities: Record<string, ResolvedNotationEntity> = {};
  for (const step of steps) {
    const kind = attrEnum(step, "kind");
    resolvedEntities[step.id] = {
      role: "flow-node",
      nature: "activity",
      variant: (kind as ResolvedNotationEntity["variant"]) ?? "task",
    };
  }
  for (const rel of Object.values(document.relations).sort((a, b) => byCodeUnit(a.id, b.id))) {
    if (rel.type !== "transition") continue;
    const from = rel.endpoints.find((e) => e.role === "source")?.target as EntityRef | undefined;
    const to = rel.endpoints.find((e) => e.role === "target")?.target as EntityRef | undefined;
    if (!from || !to) continue;
    const kind = attrEnum(rel, "kind");
    const provisional =
      profileNotation !== undefined &&
      kind !== undefined &&
      kind === "retry";
    edges.push({
      id: rel.id,
      relation: rel,
      from,
      to,
      provisional: provisional || kind === "exception",
      emphasis: "default",
    });
  }
  const broken = breakCyclesDfs(steps, edges, resolvedEntities);
  const ranked = rankAndOrderForwardGraph(steps.map((s) => s.id), broken.forwardEdges);
  const numbers = new Map<EntityRef, string>();
  ranked.ranks.forEach((rank, rankIdx) => {
    const realIds = rank.filter((id) => !ranked.dummies.has(id)) as EntityRef[];
    realIds.forEach((id, pos) => {
      const step = document.entities[id];
      const authored = step ? attrText(step, "stepNumber") : undefined;
      if (authored !== undefined) {
        numbers.set(id, authored);
      } else if (realIds.length === 1) {
        numbers.set(id, String(rankIdx + 1));
      } else {
        const suffix = pos < 26 ? String.fromCharCode(97 + pos) : `.${pos + 1}`;
        numbers.set(id, `${rankIdx + 1}${suffix}`);
      }
    });
  });
  return numbers;
}
