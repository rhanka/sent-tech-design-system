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
    const fallbackW = approxTextWidth(candidate, fontSize);
    if (measureLines === undefined) return fallbackW;
    const baseSize = fontSize >= 14 ? 32 : 24;
    const measured = measureLines({
      text: candidate,
      role: fontSize >= 14 ? "title" : "subtitle",
      availableWidth: Number.MAX_SAFE_INTEGER,
      allocatedLines: 1,
      folded: false,
    });
    return Math.max(fallbackW, measured.width * (fontSize / baseSize));
  };
  const ellipsizeToFit = (value: string, forceEllipsis = false): string => {
    if (!forceEllipsis && measureWidth(value) <= maxWidth) return value;
    const chars = Array.from(value);
    while (chars.length > 1 && measureWidth(`${chars.join("")}…`) > maxWidth) {
      chars.pop();
    }
    return `${chars.join("").trimEnd()}…`;
  };
  const words = textValue.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  let truncated = false;
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i]!;
    const candidate = current === "" ? word : `${current} ${word}`;
    if (current !== "" && measureWidth(candidate) > maxWidth) {
      if (lines.length + 1 < maxLines) {
        lines.push(current);
        current = word;
      } else {
        lines.push(ellipsizeToFit(current, true));
        current = "";
        truncated = true;
        break;
      }
    } else {
      current = candidate;
    }
  }
  if (!truncated && current !== "") {
    lines.push(measureWidth(current) > maxWidth ? ellipsizeToFit(current, true) : current);
  }
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

  // Per-gap rankGap: 48 px base, widened as integer up to 160 px when a label on an adjacent-rank LR edge needs space.
  const rankGaps: number[] = Array.from({ length: Math.max(0, rankCount - 1) }, () => s.rankGap);
  if (lr) {
    for (const edge of forwardEdges) {
      if (!edge.label) continue;
      const rFrom = ranked.rankOf.get(edge.from) ?? 0;
      const rTo = ranked.rankOf.get(edge.to) ?? 0;
      if (rTo - rFrom !== 1) continue;
      const labelW = measureLines
        ? measureLines({ text: edge.label, role: "edge-label", availableWidth: 400, allocatedLines: 1, folded: false }).width
        : approxTextWidth(edge.label, 12);
      const needed = Math.min(160, Math.max(s.rankGap, Math.ceil(labelW + 24)));
      rankGaps[rFrom] = Math.max(rankGaps[rFrom]!, needed);
    }
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

  interface CorridorAssignment {
    readonly edge: ProcessEdge;
    readonly scope: EntityRef | "unlaned" | "global";
    readonly side: "low" | "high";
    readonly trackIndex: number;
    readonly corridorPos: number;
  }

  const rankSpanOf = (edge: ProcessEdge): { readonly min: number; readonly max: number } => {
    const r1 = ranked.rankOf.get(edge.from) ?? 0;
    const r2 = ranked.rankOf.get(edge.to) ?? 0;
    return { min: Math.min(r1, r2), max: Math.max(r1, r2) };
  };

  const intervalsInterleave = (a: { min: number; max: number }, b: { min: number; max: number }): boolean =>
    (a.min < b.min && b.min < a.max && a.max < b.max) || (b.min < a.min && a.min < b.max && b.max < a.max);

  const assignCorridorTracks = (
    edges: readonly ProcessEdge[],
  ): { readonly tracks: readonly (readonly ProcessEdge[])[]; readonly trackOf: ReadonlyMap<string, number> } => {
    const sorted = [...edges].sort((a, b) => {
      const sa = rankSpanOf(a);
      const sb = rankSpanOf(b);
      return (sa.max - sa.min) - (sb.max - sb.min) || sa.min - sb.min || byCodeUnit(a.id, b.id);
    });
    const tracks: ProcessEdge[][] = [];
    const spansByTrack: { min: number; max: number }[][] = [];
    const trackOf = new Map<string, number>();
    for (const edge of sorted) {
      const span = rankSpanOf(edge);
      let chosen = -1;
      for (let t = 0; t < tracks.length; t += 1) {
        const conflict = spansByTrack[t]!.some((other) => Math.max(span.min, other.min) < Math.min(span.max, other.max));
        if (!conflict) {
          chosen = t;
          break;
        }
      }
      if (chosen === -1) {
        chosen = tracks.length;
        tracks.push([]);
        spansByTrack.push([]);
      }
      tracks[chosen]!.push(edge);
      spansByTrack[chosen]!.push(span);
      trackOf.set(edge.id, chosen);
    }
    return { tracks, trackOf };
  };

  const splitSidesNonInterleaving = (
    edges: readonly ProcessEdge[],
    preferSide: (edge: ProcessEdge) => "low" | "high",
  ): { readonly low: ProcessEdge[]; readonly high: ProcessEdge[] } => {
    const low: ProcessEdge[] = [];
    const high: ProcessEdge[] = [];
    const sorted = [...edges].sort((a, b) => {
      const sa = rankSpanOf(a);
      const sb = rankSpanOf(b);
      return (sa.max - sa.min) - (sb.max - sb.min) || sa.min - sb.min || byCodeUnit(a.id, b.id);
    });
    for (const edge of sorted) {
      const span = rankSpanOf(edge);
      const pref = preferSide(edge);
      const alt = pref === "low" ? "high" : "low";
      const prefList = pref === "low" ? low : high;
      const altList = alt === "low" ? low : high;
      const prefInterleaves = prefList.some((other) => intervalsInterleave(span, rankSpanOf(other)));
      const altInterleaves = altList.some((other) => intervalsInterleave(span, rankSpanOf(other)));
      if (prefInterleaves && !altInterleaves) altList.push(edge);
      else prefList.push(edge);
    }
    return { low, high };
  };

  let mainCrossExtent = 0;
  const intraCorridors: CorridorAssignment[] = [];
  let globalBackEdges: readonly ProcessEdge[] = [];

  if (lanes.length === 0) {
    globalBackEdges = backEdges;
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
    const bandIndexOfLane = new Map<EntityRef | undefined, number>(bandIds.map((id, idx) => [id, idx]));

    // Assign every forward dummy to a lane band so skip edges never pierce intermediate boxes.
    const dummiesByBandRank = new Map<string, { readonly id: string; readonly edge: ProcessEdge; readonly otherBand: EntityRef | undefined }[]>();
    const hasStepInBandRank = new Set<string>();
    for (const step of steps) {
      const b = laneOfStep.get(step.id);
      const r = ranked.rankOf.get(step.id) ?? 0;
      hasStepInBandRank.add(`${b ?? ""}\n${r}`);
    }
    for (const edge of forwardEdges) {
      const rFrom = ranked.rankOf.get(edge.from) ?? 0;
      const rTo = ranked.rankOf.get(edge.to) ?? 0;
      if (rTo - rFrom < 2) continue;
      const laneFrom = laneOfStep.get(edge.from);
      const laneTo = laneOfStep.get(edge.to);
      for (let r = rFrom + 1; r < rTo; r += 1) {
        const dummyId = `~${edge.id}~${r}`;
        let assigned: EntityRef | undefined;
        let otherBand: EntityRef | undefined;
        if (laneFrom === laneTo) {
          assigned = laneFrom;
          otherBand = laneFrom;
        } else {
          const fromBusy = hasStepInBandRank.has(`${laneFrom ?? ""}\n${r}`);
          const toBusy = hasStepInBandRank.has(`${laneTo ?? ""}\n${r}`);
          if (!fromBusy && toBusy) {
            assigned = laneFrom;
            otherBand = laneTo;
          } else if (fromBusy && !toBusy) {
            assigned = laneTo;
            otherBand = laneFrom;
          } else {
            assigned = r - rFrom <= rTo - r ? laneFrom : laneTo;
            otherBand = assigned === laneFrom ? laneTo : laneFrom;
          }
        }
        const key = `${assigned ?? ""}\n${r}`;
        (dummiesByBandRank.get(key) ?? dummiesByBandRank.set(key, []).get(key)!).push({ id: dummyId, edge, otherBand });
      }
    }

    // Partition back-edges: same-lane back-edges get intra-lane corridors inside their lane;
    // cross-lane back-edges use global corridors / gutters.
    const intraEdgesByBand = new Map<EntityRef | undefined, ProcessEdge[]>();
    const crossLaneBacks: ProcessEdge[] = [];
    for (const edge of backEdges) {
      const lFrom = laneOfStep.get(edge.from);
      const lTo = laneOfStep.get(edge.to);
      if (lFrom === lTo) {
        (intraEdgesByBand.get(lFrom) ?? intraEdgesByBand.set(lFrom, []).get(lFrom)!).push(edge);
      } else {
        crossLaneBacks.push(edge);
      }
    }
    globalBackEdges = crossLaneBacks;

    const alongStart = s.laneHeaderSize;
    let bandCursor = 0;
    for (const laneId of bandIds) {
      const bandSteps = new Set(
        steps.filter((st) => laneOfStep.get(st.id) === laneId).map((st) => st.id),
      );

      // Compute ordered items per rank (real steps + assigned dummies).
      const bandItemsByRank: { readonly keys: string[]; readonly hasRealOrMultiple: boolean; readonly totalSize: number }[] = [];
      let maxBandCross: number = lr ? PROCESS_BOX_BOUNDS.minHeight : PROCESS_BOX_BOUNDS.minWidth;
      for (let r = 0; r < rankCount; r += 1) {
        const rankOrder = new Map(ranked.ranks[r]!.map((k, idx) => [k, idx]));
        const realInRank = ranked.ranks[r]!.filter((k) => !ranked.dummies.has(k) && bandSteps.has(k as EntityRef));
        const dummiesInRank = dummiesByBandRank.get(`${laneId ?? ""}\n${r}`) ?? [];
        const myIdx = bandIndexOfLane.get(laneId) ?? 0;
        const beforeDummies = dummiesInRank
          .filter((d) => d.otherBand !== laneId && (bandIndexOfLane.get(d.otherBand) ?? 0) < myIdx)
          .sort((a, b) => (rankOrder.get(a.id) ?? 0) - (rankOrder.get(b.id) ?? 0));
        const sameLaneDummies = dummiesInRank.filter((d) => d.otherBand === laneId);
        const afterDummies = dummiesInRank
          .filter((d) => d.otherBand !== laneId && (bandIndexOfLane.get(d.otherBand) ?? 0) > myIdx)
          .sort((a, b) => (rankOrder.get(a.id) ?? 0) - (rankOrder.get(b.id) ?? 0));
        const middleMerged = [...realInRank, ...sameLaneDummies.map((d) => d.id)].sort(
          (a, b) => (rankOrder.get(a) ?? 0) - (rankOrder.get(b) ?? 0),
        );
        const keys = [...beforeDummies.map((d) => d.id), ...middleMerged, ...afterDummies.map((d) => d.id)];
        const hasRealOrMultiple = realInRank.length > 0 || keys.length > 1;
        let sum = 0;
        if (hasRealOrMultiple) {
          keys.forEach((key, idx) => {
            const size = ranked.dummies.has(key)
              ? 16
              : lr
                ? boxes.get(key as EntityRef)!.height
                : boxes.get(key as EntityRef)!.width;
            sum += size + (idx + 1 < keys.length ? s.siblingGap : 0);
          });
        }
        bandItemsByRank.push({ keys, hasRealOrMultiple, totalSize: sum });
        maxBandCross = Math.max(maxBandCross, sum);
      }

      // Reserve intra-lane corridor tracks for same-lane back-edges so they stay inside their lane.
      // Prefer the band boundary (low vs high) with fewer crossing cross-lane forward edges.
      const bandIntra = intraEdgesByBand.get(laneId) ?? [];
      const myBandIdx = bandIndexOfLane.get(laneId) ?? 0;
      const preferIntraSide = (edge: ProcessEdge): "low" | "high" => {
        const span = rankSpanOf(edge);
        let lowCross = 0;
        let highCross = 0;
        for (const fEdge of forwardEdges) {
          const rf = ranked.rankOf.get(fEdge.from) ?? 0;
          const rt = ranked.rankOf.get(fEdge.to) ?? 0;
          if (Math.max(span.min, rf) >= Math.min(span.max, rt)) continue;
          const bf = bandIndexOfLane.get(laneOfStep.get(fEdge.from)) ?? myBandIdx;
          const bt = bandIndexOfLane.get(laneOfStep.get(fEdge.to)) ?? myBandIdx;
          if ((bf === myBandIdx && bt < myBandIdx) || (bt === myBandIdx && bf < myBandIdx) || (bf < myBandIdx && bt > myBandIdx) || (bt < myBandIdx && bf > myBandIdx)) {
            lowCross += 1;
          }
          if ((bf === myBandIdx && bt > myBandIdx) || (bt === myBandIdx && bf > myBandIdx) || (bf < myBandIdx && bt > myBandIdx) || (bt < myBandIdx && bf > myBandIdx)) {
            highCross += 1;
          }
        }
        return lowCross < highCross ? "low" : "high";
      };
      const intraSides = splitSidesNonInterleaving(bandIntra, preferIntraSide);
      const lowIntra = assignCorridorTracks(intraSides.low);
      const highIntra = assignCorridorTracks(intraSides.high);
      const lowIntraSpace = lowIntra.tracks.length * s.corridorGap;
      const highIntraSpace = highIntra.tracks.length * s.corridorGap;

      const bandSpan = maxBandCross + s.lanePadding * 2 + lowIntraSpace + highIntraSpace;
      if (laneId !== undefined) {
        const rect: Rect = lr
          ? { x: 0, y: bandCursor, width: alongStart + totalAlong + s.lanePadding, height: bandSpan }
          : { x: bandCursor, y: 0, width: bandSpan, height: alongStart + totalAlong + s.lanePadding };
        laneRects.set(laneId, rect);
      }

      for (let r = 0; r < rankCount; r += 1) {
        const { keys, hasRealOrMultiple, totalSize } = bandItemsByRank[r]!;
        let cursor = bandCursor + s.lanePadding + lowIntraSpace + (maxBandCross - totalSize) / 2;
        for (const key of keys) {
          if (ranked.dummies.has(key)) {
            const dummySize = hasRealOrMultiple ? 16 : 0;
            crossCenter.set(key, cursor + dummySize / 2);
            cursor += dummySize + s.siblingGap;
            continue;
          }
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

      const scope = laneId ?? "unlaned";
      for (const edge of intraSides.low) {
        const t = lowIntra.trackOf.get(edge.id) ?? 0;
        const pos = bandCursor + s.lanePadding + (lowIntra.tracks.length - 1 - t) * s.corridorGap;
        intraCorridors.push({ edge, scope, side: "low", trackIndex: t, corridorPos: pos });
      }
      for (const edge of intraSides.high) {
        const t = highIntra.trackOf.get(edge.id) ?? 0;
        const pos = bandCursor + s.lanePadding + lowIntraSpace + maxBandCross + (t + 1) * s.corridorGap;
        intraCorridors.push({ edge, scope, side: "high", trackIndex: t, corridorPos: pos });
      }

      bandCursor += bandSpan;
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

  // Dedicated retry/back-edge corridors: upper-half back-edges prefer the low
  // corridor, lower-half prefer the high corridor; same-lane edges stay inside
  // their lane, tracks pack non-interleavingly by increasing span, and docks
  // sharing a step side are ordered to avoid crossings and collisions.
  const midCross = mainCrossExtent / 2;
  const globalSides = splitSidesNonInterleaving(globalBackEdges, (edge) => {
    const avg = ((crossCenter.get(edge.from) ?? midCross) + (crossCenter.get(edge.to) ?? midCross)) / 2;
    return avg < midCross - 1 ? "low" : "high";
  });
  const globalLowTracks = assignCorridorTracks(globalSides.low);
  const globalHighTracks = assignCorridorTracks(globalSides.high);

  let minCross = 0;
  let maxCross = mainCrossExtent;

  const allCorridorAssignments: CorridorAssignment[] = [
    ...intraCorridors,
    ...globalSides.low.map((edge): CorridorAssignment => {
      const t = globalLowTracks.trackOf.get(edge.id) ?? 0;
      const pos = -(t + 1) * s.corridorGap;
      minCross = Math.min(minCross, pos);
      return { edge, scope: "global", side: "low", trackIndex: t, corridorPos: pos };
    }),
    ...globalSides.high.map((edge): CorridorAssignment => {
      const t = globalHighTracks.trackOf.get(edge.id) ?? 0;
      const pos = mainCrossExtent + (t + 1) * s.corridorGap;
      maxCross = Math.max(maxCross, pos);
      return { edge, scope: "global", side: "high", trackIndex: t, corridorPos: pos };
    }),
  ];

  // Check if a perpendicular leg from `stepId`'s `side` edge to `corridorPos` is blocked by another step box.
  const isCrossLegBlocked = (alongCenter: number, fromCross: number, toCross: number, ignoreId: EntityRef): boolean => {
    const lo = Math.min(fromCross, toCross);
    const hi = Math.max(fromCross, toCross);
    for (const [id, rect] of stepRects) {
      if (id === ignoreId) continue;
      const rAlongStart = lr ? rect.x : rect.y;
      const rAlongEnd = lr ? rect.x + rect.width : rect.y + rect.height;
      const rCrossStart = lr ? rect.y : rect.x;
      const rCrossEnd = lr ? rect.y + rect.height : rect.x + rect.width;
      if (alongCenter > rAlongStart - 1 && alongCenter < rAlongEnd + 1 && lo < rCrossEnd - 1 && hi > rCrossStart + 1) {
        return true;
      }
    }
    return false;
  };

  interface CorridorEndPlan {
    readonly item: CorridorAssignment;
    readonly isIncoming: boolean;
    readonly stepId: EntityRef;
    readonly gutterBypass: boolean;
  }

  const alongOrigin = lanes.length > 0 ? s.laneHeaderSize : 0;
  const dockAlongByEdgeEnd = new Map<string, number>();
  const gutterEscapeCount = new Map<string, number>();

  const directDockBuckets = new Map<string, CorridorEndPlan[]>();
  const endPlans = new Map<string, { readonly startBypass: boolean; readonly endBypass: boolean }>();
  for (const item of allCorridorAssignments) {
    const r1 = stepRects.get(item.edge.from)!;
    const r2 = stepRects.get(item.edge.to)!;
    const c1Along = lr ? r1.x + r1.width / 2 : r1.y + r1.height / 2;
    const c1Cross = item.side === "low" ? (lr ? r1.y : r1.x) : (lr ? r1.y + r1.height : r1.x + r1.width);
    const c2Along = lr ? r2.x + r2.width / 2 : r2.y + r2.height / 2;
    const c2Cross = item.side === "low" ? (lr ? r2.y : r2.x) : (lr ? r2.y + r2.height : r2.x + r2.width);
    const startBypass = isCrossLegBlocked(c1Along, c1Cross, item.corridorPos, item.edge.from);
    const endBypass = isCrossLegBlocked(c2Along, c2Cross, item.corridorPos, item.edge.to);
    endPlans.set(item.edge.id, { startBypass, endBypass });
    if (!startBypass) {
      const k = `${item.edge.from}\n${item.side}`;
      (directDockBuckets.get(k) ?? directDockBuckets.set(k, []).get(k)!).push({
        item,
        isIncoming: false,
        stepId: item.edge.from,
        gutterBypass: false,
      });
    }
    if (!endBypass) {
      const k = `${item.edge.to}\n${item.side}`;
      (directDockBuckets.get(k) ?? directDockBuckets.set(k, []).get(k)!).push({
        item,
        isIncoming: true,
        stepId: item.edge.to,
        gutterBypass: false,
      });
    }
  }

  // Allocate distinct, crossing-free dock along-coordinates for every (step, side) bucket.
  for (const list of directDockBuckets.values()) {
    list.sort((a, b) => {
      if (a.isIncoming !== b.isIncoming) return a.isIncoming ? 1 : -1;
      const tDiff = a.isIncoming
        ? b.item.trackIndex - a.item.trackIndex
        : a.item.trackIndex - b.item.trackIndex;
      return tDiff || byCodeUnit(a.item.edge.id, b.item.edge.id);
    });
    const rect = stepRects.get(list[0]!.stepId)!;
    const alongStart = lr ? rect.x : rect.y;
    const alongSpan = lr ? rect.width : rect.height;
    const center = alongStart + alongSpan / 2;
    const spacing = list.length <= 1 ? 0 : Math.min(s.parallelOffset, Math.max(4, (alongSpan - 24) / (list.length - 1)));
    list.forEach((plan, idx) => {
      const pos = center + (idx - (list.length - 1) / 2) * spacing;
      dockAlongByEdgeEnd.set(`${plan.item.edge.id}\n${plan.isIncoming ? "to" : "from"}`, pos);
    });
  }

  for (const item of allCorridorAssignments) {
    const { edge, side, corridorPos } = item;
    const r1 = stepRects.get(edge.from)!;
    const r2 = stepRects.get(edge.to)!;
    const { startBypass, endBypass } = endPlans.get(edge.id)!;
    const rFrom = ranked.rankOf.get(edge.from) ?? 0;
    const rTo = ranked.rankOf.get(edge.to) ?? 0;

    const makePoint = (along: number, cross: number): Vec2 => (lr ? { x: along, y: cross } : { x: cross, y: along });
    const stepCrossBounds = (rect: Rect) =>
      lr ? { start: rect.y, size: rect.height } : { start: rect.x, size: rect.width };
    const stepAlongBounds = (rect: Rect) =>
      lr ? { start: rect.x, size: rect.width } : { start: rect.y, size: rect.height };

    const b1Cross = stepCrossBounds(r1);
    const b2Cross = stepCrossBounds(r2);
    const b1Along = stepAlongBounds(r1);
    const b2Along = stepAlongBounds(r2);

    const nextEscapeIdx = (key: string): number => {
      const cur = gutterEscapeCount.get(key) ?? 0;
      gutterEscapeCount.set(key, cur + 1);
      return cur;
    };

    const pts: Vec2[] = [];
    if (startBypass && rFrom > 0) {
      const esc = nextEscapeIdx(`${edge.from}\nfrom`);
      const crossDir = side === "low" ? -1 : 1;
      const dockCross = b1Cross.start + b1Cross.size / 2 + crossDir * Math.min(b1Cross.size * 0.3, 8 + esc * 6);
      const gutterAlong = alongOrigin + rankAlongPos[rFrom]! - rankGaps[rFrom - 1]! * Math.max(0.15, 0.25 - esc * 0.05);
      pts.push(makePoint(b1Along.start, dockCross), makePoint(gutterAlong, dockCross), makePoint(gutterAlong, corridorPos));
    } else {
      const startAlong = dockAlongByEdgeEnd.get(`${edge.id}\nfrom`) ?? b1Along.start + b1Along.size / 2;
      const startCross = side === "low" ? b1Cross.start : b1Cross.start + b1Cross.size;
      pts.push(makePoint(startAlong, startCross), makePoint(startAlong, corridorPos));
    }

    if (endBypass && rTo + 1 < rankCount) {
      const esc = nextEscapeIdx(`${edge.to}\nto`);
      const crossDir = side === "low" ? -1 : 1;
      const dockCross = b2Cross.start + b2Cross.size / 2 + crossDir * Math.min(b2Cross.size * 0.3, 8 + esc * 6);
      const gutterAlong = alongOrigin + rankAlongPos[rTo]! + rankAlongSize[rTo]! + rankGaps[rTo]! * Math.max(0.15, 0.25 - esc * 0.05);
      pts.push(makePoint(gutterAlong, corridorPos), makePoint(gutterAlong, dockCross), makePoint(b2Along.start + b2Along.size, dockCross));
    } else {
      const endAlong = dockAlongByEdgeEnd.get(`${edge.id}\nto`) ?? b2Along.start + b2Along.size / 2;
      const endCross = side === "low" ? b2Cross.start : b2Cross.start + b2Cross.size;
      pts.push(makePoint(endAlong, corridorPos), makePoint(endAlong, endCross));
    }

    waypointsByRelation.set(edge.id, pts);
  }

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
      occurrenceRef(`r.${edge.id.slice(edge.id.indexOf(":") + 1)}`);
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
