/**
 * `layoutDocument`: a `generic@1` `SemanticDocument` in, a `ViewDocument` out.
 *
 * INPUT (SPEC §10.5, "Input"): a document with `node` and `container`
 * entities, `link` relations and nesting through the `contains` tree, with no
 * view and no geometry. It goes through `diagram-core`'s `validateDocument`
 * first; an invalid document is refused with those diagnostics, verbatim.
 *
 * OUTPUT: a `diagram-core` `ViewDocument`, the model's own place for drawings,
 * and nothing beside it that a renderer would have to persist:
 *   - one entity occurrence per entity, with its bounds; containers are painted
 *     under nodes through `z` (outermost lowest), nodes at plane 0;
 *   - one relation occurrence per `link`, whose `waypoints` are the whole route,
 *     dock to dock, source to target. `contains` relations are drawn by nesting
 *     and get no relation occurrence;
 *   - one port occurrence per semantic port a link targets, with the side, slot
 *     order and anchor the docking chose; the relation occurrence then attaches
 *     to it and its route starts at the port anchor;
 *   - `presentation.camera.zoom` is the L-R7 scale.
 *
 * L-R5 — flow direction, measured after labels: both finalized drawings
 *        (left-to-right and top-to-bottom, each with its L-R10 widening rounds
 *        complete) are compared at their finalized widths `B_lr`, `B_tb`.
 *        Left-to-right when `B_lr ≤ W`, else top-to-bottom when `B_tb ≤ W`,
 *        else the narrower, top-to-bottom on an exact tie. A function of the
 *        graph and the width only: nothing in the document or the options can
 *        force it.
 * L-R7 — target width and phone fallback: `W` finite and greater than 0, else
 *        `target-width-invalid` with no view and no scale. An empty drawing
 *        (`B = 0`) takes left-to-right, zoom 1, no pan. Otherwise the zoom is
 *        `s = min(1, max(0.75, W / B))`, and the drawing pans exactly when
 *        `B · s > W` (that is `B > W / 0.75`). L-R5 chooses at every width,
 *        the phone range included; no width forces a direction. Renderer
 *        containment (viewport box at most `W`, clipped, pan inside the box)
 *        is a renderer rule, not a geometry outcome.
 * L-R10 — edge labels: centred on the longest holdable segment; otherwise at
 *        most 12 widening rounds (side growth shares them), one request per
 *        label per round, gaps combined by maximum. A widening round that
 *        moved nothing (same gaps, same length, same overlaps, same demand)
 *        is not repeated for that label: the next segment is tried instead.
 *        On the final geometry a label with a request outstanding is
 *        `label-budget-exhausted`, and only a label closed by the residual
 *        predicate on every segment is `label-unplaced`; never merged.
 * L-R11 — legend: none. `generic@1` gives the engine no typed kind to explain,
 *        so the view holds no occurrence, group or field for one.
 *
 * DETERMINISM. Every collection is walked in reference order, and no step reads
 * a document record's insertion order. The same document laid out twice, or
 * with its records shuffled, gives the same canonical bytes (`serialiseView`).
 */

import {
  hasErrors,
  localIdOf,
  occurrenceRef,
  validateDocument,
  viewRef,
  type Diagnostic,
  type EntityOccurrence,
  type EntityRef,
  type OccurrenceRef,
  type PortOccurrence,
  type RelationOccurrence,
  type RelationRef,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import { rectsIntersect } from "../geometry.js";
import type { Rect, Vec2 } from "../transform.js";
import { dockEdges, type EdgeDocks } from "./dock.js";
import { ancestorsOf, memberOf, readGraph, type LayoutEdge, type LayoutGraph } from "./graph.js";
import { edgeLabelCandidates, labelBoxOnSegment, pad, placeEdgeLabels, segmentLength } from "./labels.js";
import { place, ROOT, type Placement } from "./place.js";
import { routeEdges, type RouteRequest } from "./route.js";
import {
  DEFAULT_LAYOUT_METRICS,
  MIN_ZOOM,
  PHONE_MAX_WIDTH,
  type FlowDirection,
  type LayoutMetrics,
  type LayoutOptions,
  type LayoutRefusal,
  type LayoutResult,
  type LayoutWarning,
  type TextMeasurer,
  type TextSize,
} from "./types.js";

/** How many times L-R10 may lengthen segments before reporting a label it could not place. */
const LABEL_ROUNDS = 12;
/** The most one round may lengthen a gap for one label, in label lengths along the flow. */
const MAX_LENGTHEN_LABELS = 4;

/**
 * L-R10 residual reasons: the closed list of why no widening exists for one
 * route segment — (a) the segment runs across the flow and is too short;
 * (b) no rank gap at any containing level crosses or holds it usefully;
 * (c) a blocking shape spans the padded label on both cross-axis sides;
 * (d) the lane and the blocker, or the two lanes, share one member at the
 * relevant ranks, so the sibling-gap set is empty;
 * (e) the required lengthening or separation exceeds the `4 ·` cap.
 * A gap whose lengthening provably makes no progress (the segment keeps its
 * length and no overlap shrinks) counts as (b): no useful gap.
 */
export type ResidualReason = "a" | "b" | "c" | "d" | "e";

/** One route segment with the closed reasons its widening search returned. */
export interface SegmentResidual {
  readonly segment: number;
  readonly reasons: readonly ResidualReason[];
}

/**
 * L-R10 residual predicate: a label is provably unplaceable exactly when it
 * has at least one segment and every segment carries a closed reason.
 * A label with a widening request outstanding is never unplaceable: after the
 * 12th round it is `label-budget-exhausted`, never `label-unplaced`.
 */
export function residualUnplaceable(segments: readonly SegmentResidual[]): boolean {
  return segments.length > 0 && segments.every((entry) => entry.reasons.length > 0);
}

/** Area of the intersection of two boxes, 0 when disjoint or touching. */
function overlapArea(left: Rect, right: Rect): number {
  const width = Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x);
  const height = Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y);
  return width > 0 && height > 0 ? width * height : 0;
}

interface Drawing {
  readonly placement: Placement;
  readonly docks: ReadonlyMap<RelationRef, EdgeDocks>;
  readonly routes: ReadonlyMap<RelationRef, readonly Vec2[]>;
  readonly warnings: readonly LayoutWarning[];
  /** Per-label L-R10 outcome on the final geometry, for AC-L8 fixtures. */
  readonly labelOutcomes: ReadonlyMap<RelationRef, LabelOutcome>;
}

/**
 * One label's L-R10 outcome on the finalized drawing: `placed`, or the
 * residual classification with every segment's closed reasons. Test support
 * for the AC-L8 fixtures (see `diagnoseLabels`); never persisted.
 */
export interface LabelOutcome {
  readonly outcome: "placed" | "label-unplaced" | "label-budget-exhausted";
  readonly segments: readonly SegmentResidual[];
}

/**
 * One rank-gap candidate: its rank, the label's distance to it, and the depth
 * of the level that owns it.
 */
export interface RankGapChoice {
  readonly rank: number;
  readonly distance: number;
  readonly depth: number;
}

/**
 * L-R10's canonical gap rule, shared with the widening loop: the gap nearest
 * the label wins; a nearest-distance tie goes to the deepest level; a further
 * tie goes to the lowest rank. Strict comparisons keep the incumbent on an
 * exact tie, so the choice is deterministic. Test support; never persisted.
 */
export function chooseRankGap(
  current: RankGapChoice | undefined,
  next: RankGapChoice,
): RankGapChoice {
  if (current === undefined) return next;
  if (next.distance !== current.distance) return next.distance < current.distance ? next : current;
  if (next.depth !== current.depth) return next.depth > current.depth ? next : current;
  return next.rank < current.rank ? next : current;
}

const clean = (value: number): number => (value === 0 ? 0 : value);

function draw(
  graph: LayoutGraph,
  direction: FlowDirection,
  metrics: LayoutMetrics,
  measureText: TextMeasurer,
  labelSizes: ReadonlyMap<RelationRef, TextSize>,
): Drawing {
  const leftToRight = direction === "left-to-right";
  const extraGaps = new Map<string, number>();
  const siblingGaps = new Map<string, number>();
  const minSizes = new Map<EntityRef, { width: number; height: number }>();
  let drawing: Drawing | undefined;
  let unplaced: RelationRef[] = [];
  // L-R10 progress guard, per drawing: gaps whose widening moved nothing for
  // one label are never requested again for it (`label|gap`).
  const deadGaps = new Set<string>();
  interface LabelRequest {
    readonly gaps: readonly string[];
    readonly extras: readonly number[];
    /** Total amount requested last round: rank lengthening plus sibling needs. */
    readonly needSum: number;
    readonly segment: number;
    readonly points: number;
    readonly segLen: number;
    readonly overlap: number;
  }
  const lastRequest = new Map<RelationRef, LabelRequest>();
  const extraOf = (gap: string): number => extraGaps.get(gap) ?? siblingGaps.get(gap) ?? 0;
  let classifyLabels: (ids: readonly RelationRef[]) => LayoutWarning[] = () => [];
  let labelOutcome: LayoutWarning[] = [];

  for (let round = 0; round < LABEL_ROUNDS; round += 1) {
    const placement = place({ graph, direction, metrics, measureText, extraGaps, extraSiblingGaps: siblingGaps, minSizes });
    const docked = dockEdges({ graph, rects: placement.rects, direction, metrics, labelSizes });
    const docks = docked.docks;
    // L-R2 needs room: a node side too short for its slots grows, and the
    // drawing is placed again before anything is routed on it.
    let grew = false;
    for (const demand of docked.demands) {
      if (graph.nodes.get(demand.entity)!.kind !== "node") continue;
      const rect = placement.rects.get(demand.entity)!;
      const vertical = demand.side === "east" || demand.side === "west";
      const current = minSizes.get(demand.entity) ?? { width: rect.width, height: rect.height };
      const next = vertical
        ? { width: current.width, height: Math.max(current.height, demand.needed) }
        : { width: Math.max(current.width, demand.needed), height: current.height };
      if (next.width > rect.width || next.height > rect.height) {
        minSizes.set(demand.entity, next);
        grew = true;
      }
    }
    if (grew && round < LABEL_ROUNDS - 1) continue;
    const requests: RouteRequest[] = graph.edges.map((edge) => {
      const pair = docks.get(edge.id)!;
      const passable = new Set<EntityRef>([
        ...ancestorsOf(graph, edge.source.entity),
        ...ancestorsOf(graph, edge.target.entity),
      ]);
      return {
        id: edge.id,
        pairKey: [edge.source.entity, edge.target.entity].sort().join("|"),
        start: pair.source.point,
        startExit: pair.source.exit,
        end: pair.target.point,
        endExit: pair.target.exit,
        passable,
      };
    });
    const outcome = routeEdges({ rects: placement.rects, requests, clearance: metrics.clearance });

    const lengthen = new Map<string, number>();
    const widen = new Map<string, number>();
    const waiting: RelationRef[] = [];
    unplaced = [];
    const margin = metrics.labelMargin;
    const blockers: Rect[] = [
      ...[...placement.rects.entries()]
        .filter(([id]) => graph.nodes.get(id)!.kind === "node")
        .map(([, rect]) => rect),
      ...placement.titleBands.values(),
    ];
    const shapeOwner = new Map<Rect, EntityRef>();
    for (const [id, rect] of placement.rects) {
      if (graph.nodes.get(id)!.kind === "node") shapeOwner.set(rect, id);
    }
    for (const [id, band] of placement.titleBands) shapeOwner.set(band, id);
    const mainOf = (point: Vec2) => (leftToRight ? point.x : point.y);
    const crossOf = (point: Vec2) => (leftToRight ? point.y : point.x);
    // The rank gap to lengthen: for a segment along the flow, the gap it
    // crosses nearest to the label; for a segment across the flow, the gap
    // holding it. The root level owns everything, including a route running
    // outside the drawing.
    const findRankGap = (a: Vec2, b: Vec2, centre: Vec2, mainAligned: boolean) => {
      const segmentFrom = Math.min(mainOf(a), mainOf(b));
      const segmentTo = Math.max(mainOf(a), mainOf(b));
      const centreMain = mainOf(centre);
      const crossAt = crossOf(centre);
      let pick: RankGapChoice | undefined;
      let chosen:
        | {
            readonly level: (typeof placement.levels)[number];
            readonly rank: number;
            readonly from: number;
            readonly to: number;
            readonly distance: number;
          }
        | undefined;
      for (const level of placement.levels) {
        const regionCrossFrom = leftToRight ? level.region.y : level.region.x;
        const regionCrossTo = regionCrossFrom + (leftToRight ? level.region.height : level.region.width);
        if (level.depth > 0 && (crossAt < regionCrossFrom || crossAt > regionCrossTo)) continue;
        for (const gap of level.gaps) {
          const crosses = mainAligned
            ? gap.from < segmentTo && gap.to > segmentFrom
            : centreMain >= gap.from && centreMain <= gap.to;
          if (!crosses) continue;
          const distance = centreMain < gap.from ? gap.from - centreMain : centreMain > gap.to ? centreMain - gap.to : 0;
          const next = chooseRankGap(pick, { rank: gap.rank, distance, depth: level.depth });
          if (next !== pick) {
            pick = next;
            chosen = { level, rank: gap.rank, from: gap.from, to: gap.to, distance };
          }
        }
      }
      return chosen;
    };
    // Sibling-gap keys on the path between two members of one rank: widening
    // every gap between them pushes the lanes docked on them apart.
    const keysBetween = (
      level: (typeof placement.levels)[number],
      rank: number,
      first: string | undefined,
      second: string | undefined,
    ): readonly string[] | undefined => {
      if (first === undefined || second === undefined || first === second) return undefined;
      const siblings = level.siblings.filter((sibling) => sibling.rank === rank);
      const order: string[] = [];
      for (const sibling of siblings) {
        if (order.length === 0) order.push(sibling.left);
        order.push(sibling.right);
      }
      const from = order.indexOf(first);
      const to = order.indexOf(second);
      if (from < 0 || to < 0) return undefined;
      const [low, high] = from < to ? [from, to] : [to, from];
      const keys = siblings.slice(low, high).map((sibling) => sibling.key);
      return keys.length > 0 ? keys : undefined;
    };
    // L-R10: every label sits centred on the longest segment of its route that
    // can hold it without overlap; segments tried by decreasing length. Edges
    // go in reference order, so the outcome never depends on record order.
    const entries = graph.edges.flatMap((edge) => {
      const size = labelSizes.get(edge.id);
      return size === undefined ? [] : [{ id: edge.id, route: outcome.routes.get(edge.id)!, size }];
    });
    const choices = placeEdgeLabels(entries, blockers, margin);
    const placedBoxes = new Map<RelationRef, Rect>();
    for (const edge of graph.edges) {
      const choice = choices.get(edge.id);
      if (choice !== undefined) placedBoxes.set(edge.id, choice.box);
    }
    const crossSizeOf = (size: TextSize): number => (leftToRight ? size.height : size.width);
    const labelMainOf = (size: TextSize): number => (leftToRight ? size.width : size.height);
    // One segment's widening search: the rank lengthening and the sibling
    // widenings it supports, or the closed reasons it returns none for.
    // The two transformations are independent: a sibling separation the
    // engine cannot make never vetoes a rank lengthening that clears a
    // length, gap-width or shape deficit, and conversely.
    interface SegmentSearch {
      readonly segment: number;
      readonly segLen: number;
      readonly overlap: number;
      readonly holds: boolean;
      readonly rankKey: string | undefined;
      readonly rankAmount: number;
      readonly sibling: ReadonlyMap<string, number>;
      readonly reasons: readonly ResidualReason[];
    }
    const searchSegment = (edge: LayoutEdge, route: readonly Vec2[], size: TextSize, segment: number): SegmentSearch => {
      const crossSize = crossSizeOf(size);
      const labelMain = labelMainOf(size);
      const a = route[segment]!;
      const b = route[segment + 1]!;
      const horizontal = a.y === b.y;
      const mainAligned = leftToRight === horizontal;
      const along = horizontal ? size.width : size.height;
      const segLen = segmentLength(route, segment);
      const short = segLen < along + 2 * margin;
      const box = labelBoxOnSegment(route, segment, size).box;
      const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const padded = pad(box, margin);
      const hitShapes = blockers.filter((rect) => rectsIntersect(rect, padded));
      const hitLabels = graph.edges.filter(
        (other) =>
          other.id !== edge.id &&
          placedBoxes.get(other.id) !== undefined &&
          rectsIntersect(placedBoxes.get(other.id)!, padded),
      );
      const overlap =
        hitShapes.reduce((total, rect) => total + overlapArea(rect, padded), 0) +
        hitLabels.reduce((total, other) => total + overlapArea(placedBoxes.get(other.id)!, padded), 0);
      const none: SegmentSearch = {
        segment,
        segLen,
        overlap,
        holds: false,
        rankKey: undefined,
        rankAmount: 0,
        sibling: new Map(),
        reasons: [],
      };
      // No deficit: placeEdgeLabels holds this label here; an unplaced label
      // never reaches this with a fitting segment.
      if (!short && hitShapes.length === 0 && hitLabels.length === 0) return { ...none, holds: true };
      // (a) A segment across the flow that is too short is never lengthened
      // by a rank gap, and a sibling widening cannot extend it either.
      if (short && !mainAligned) return { ...none, reasons: ["a"] };
      const chosen = findRankGap(a, b, centre, mainAligned);
      // (b) No rank gap at any containing level crosses or holds the segment.
      if (chosen === undefined) return { ...none, reasons: ["b"] };
      const key = `${chosen.level.key}#${chosen.rank}`;
      const parent = chosen.level.key === ROOT ? undefined : (chosen.level.key as EntityRef);
      const reasons: ResidualReason[] = [];
      let rankAmount = 0;
      if (short) rankAmount = Math.max(rankAmount, along + 2 * margin - segLen);
      // Lengthening a gap the segment crosses moves the label, relative to a
      // shape on either side of that gap, by half the amount: forward from a
      // shape before it, backward from a shape after it.
      if (hitShapes.length > 0) {
        if (mainAligned && chosen.distance === 0 && chosen.to - chosen.from < labelMain + 2 * margin) {
          rankAmount = Math.max(rankAmount, labelMain + 2 * margin - (chosen.to - chosen.from));
        }
        const boxStart = leftToRight ? padded.x : padded.y;
        const boxEnd = boxStart + (leftToRight ? padded.width : padded.height);
        for (const rect of hitShapes) {
          const rectStart = leftToRight ? rect.x : rect.y;
          const rectEnd = rectStart + (leftToRight ? rect.width : rect.height);
          if (mainAligned && rectEnd <= chosen.from) rankAmount = Math.max(rankAmount, 2 * (rectEnd - boxStart));
          else if (mainAligned && rectStart >= chosen.to) rankAmount = Math.max(rankAmount, 2 * (boxEnd - rectStart));
        }
      }
      // (e) An amount above the cap is not clamped: the rank lengthening is
      // rejected, but a sibling widening for the same segment may still stand.
      let rankOk = rankAmount > 0;
      if (rankAmount > MAX_LENGTHEN_LABELS * (labelMain + 2 * margin)) {
        rankOk = false;
        reasons.push("e");
      }
      // A gap proven to make no progress for this label lengthens nothing:
      // no useful gap (b) for the rank part.
      if (rankOk && deadGaps.has(`${edge.id}|${key}`)) {
        rankOk = false;
        reasons.push("b");
      }
      // Two lanes the rank gap cannot separate — the same member carries
      // both ends, so lengthening moves them together — fail this candidate.
      // Sibling keys already proven useless for this label are skipped; when
      // every key died that way the sibling path reports (b): no useful gap.
      const sibling = new Map<string, number>();
      let siblingDead = false;
      for (const other of hitLabels) {
        const otherBox = placedBoxes.get(other.id)!;
        const otherCross = leftToRight ? otherBox.height : otherBox.width;
        const lane = leftToRight ? centre.y : centre.x;
        const otherLane =
          leftToRight ? otherBox.y + otherBox.height / 2 : otherBox.x + otherBox.width / 2;
        const need = (crossSize + otherCross) / 2 + 2 * margin - Math.abs(lane - otherLane);
        if (need > MAX_LENGTHEN_LABELS * (crossSize + 2 * margin)) {
          reasons.push("e");
          return { ...none, rankKey: rankOk ? key : undefined, rankAmount: rankOk ? rankAmount : 0, reasons };
        }
        const keys = lanesBetween(chosen.level, parent, chosen.rank, other, edge);
        if (keys === undefined) {
          reasons.push("d");
          return { ...none, rankKey: rankOk ? key : undefined, rankAmount: rankOk ? rankAmount : 0, reasons };
        }
        if (!short) {
          let live = false;
          for (const siblingKey of keys) {
            if (deadGaps.has(`${edge.id}|${siblingKey}`)) continue;
            sibling.set(siblingKey, Math.max(sibling.get(siblingKey) ?? 0, need));
            live = true;
          }
          if (!live) siblingDead = true;
        }
      }
      // A shape the lane runs alongside (a title band along the flow, a node
      // beside the lane) cannot be cleared by lengthening the rank gap: widen
      // the sibling gap between the lane's member and the shape's instead.
      // Failing here never vetoes the rank lengthening computed above.
      const alongside = hitShapes.filter((rect) => {
        if (!mainAligned) return true;
        const rectStart = leftToRight ? rect.x : rect.y;
        const rectEnd = rectStart + (leftToRight ? rect.width : rect.height);
        return !(rectEnd <= chosen.from || rectStart >= chosen.to);
      });
      for (const rect of alongside) {
        const owner = shapeOwner.get(rect);
        if (owner === undefined) {
          reasons.push("d");
          return { ...none, rankKey: rankOk ? key : undefined, rankAmount: rankOk ? rankAmount : 0, reasons };
        }
        const lane = leftToRight ? centre.y : centre.x;
        const shapeStart = leftToRight ? rect.y : rect.x;
        const shapeEnd = shapeStart + (leftToRight ? rect.height : rect.width);
        const paddedStart = leftToRight ? padded.y : padded.x;
        const paddedEnd = paddedStart + (leftToRight ? padded.height : padded.width);
        // (c) The shape spans the lane past the label on both sides: no
        // sibling gap separates them.
        if (shapeStart <= paddedStart && shapeEnd >= paddedEnd) {
          reasons.push("c");
          return { ...none, rankKey: rankOk ? key : undefined, rankAmount: rankOk ? rankAmount : 0, reasons };
        }
        const need = Math.min(paddedEnd - shapeStart, shapeEnd - paddedStart) + 2 * margin;
        if (need > MAX_LENGTHEN_LABELS * (crossSize + 2 * margin)) {
          reasons.push("e");
          return { ...none, rankKey: rankOk ? key : undefined, rankAmount: rankOk ? rankAmount : 0, reasons };
        }
        const shapeMember = memberOf(graph, owner, parent);
        const anchors = [edge.source.entity, edge.target.entity].map((entity) => memberOf(graph, entity, parent));
        let cleared = false;
        let shapeDead = false;
        for (const rank of [chosen.rank, chosen.rank + 1]) {
          for (const anchor of anchors) {
            const keys = keysBetween(chosen.level, rank, anchor, shapeMember);
            if (keys === undefined) continue;
            let usable = false;
            for (const siblingKey of keys) {
              if (deadGaps.has(`${edge.id}|${siblingKey}`)) continue;
              sibling.set(siblingKey, Math.max(sibling.get(siblingKey) ?? 0, need));
              usable = true;
            }
            if (usable) cleared = true;
            else shapeDead = true;
          }
          if (cleared) break;
        }
        // (d) The lane and the blocker share one member at the relevant
        // ranks, so the sibling-gap set is empty; (b) when gaps existed but
        // every one already proved useless for this label.
        if (!cleared) {
          reasons.push(shapeDead ? "b" : "d");
          return { ...none, rankKey: rankOk ? key : undefined, rankAmount: rankOk ? rankAmount : 0, reasons };
        }
      }
      // Sibling gaps existed but all already proved useless for this label:
      // no useful gap (b). Reasons stay empty only with requests outstanding.
      const finalReasons: ResidualReason[] = reasons.length === 0 && siblingDead ? [...reasons, "b"] : reasons;
      return {
        ...none,
        rankKey: rankOk ? key : undefined,
        rankAmount: rankOk ? rankAmount : 0,
        sibling,
        reasons: finalReasons,
      };
    };
    // Room for one label no tried segment can hold: segments by decreasing
    // length, and for the first one a gap can be widened for, widen the rank
    // gap its route crosses along the flow, or the sibling gap it crosses
    // sideways, until one segment can hold it.
    // In one round each unplaced label makes at most one request: the first
    // segment (same order) with a rank lengthening or a sibling widening.
    // Requests on one gap combine by maximum, never by sum.
    const requestLabelRoom = (edge: LayoutEdge, route: readonly Vec2[], size: TextSize): boolean => {
      const candidates = edgeLabelCandidates(route);
      for (const segment of candidates) {
        const search = searchSegment(edge, route, size, segment);
        if (search.holds) continue;
        if (search.rankKey !== undefined || search.sibling.size > 0) {
          const gaps = [...(search.rankKey !== undefined ? [search.rankKey] : []), ...search.sibling.keys()];
          if (search.rankKey !== undefined) {
            lengthen.set(search.rankKey, Math.max(lengthen.get(search.rankKey) ?? 0, search.rankAmount));
          }
          for (const [siblingKey, need] of search.sibling) {
            widen.set(siblingKey, Math.max(widen.get(siblingKey) ?? 0, need));
          }
          lastRequest.set(edge.id, {
            gaps,
            extras: gaps.map((gap) => extraOf(gap)),
            needSum:
              (search.rankKey !== undefined ? search.rankAmount : 0) +
              [...search.sibling.values()].reduce((total, need) => total + need, 0),
            segment,
            points: route.length,
            segLen: search.segLen,
            overlap: search.overlap,
          });
          return true;
        }
      }
      return false;
    };
      // The lanes of two labels meet the next rank at their targets, the
      // previous one at their sources: separate whichever pair shares the level.
      // A return edge of a cycle runs against the ranks (its source sits at the
      // higher rank), so role order alone misses its lane: every end pairing is
      // tried at both ranks, by the members' geometric position, not their role.
      // The two spec pairings stay first, so forward edges behave as before.
      const lanesBetween = (
        level: (typeof placement.levels)[number],
        parent: EntityRef | undefined,
        rank: number,
        first: LayoutEdge,
        second: LayoutEdge,
      ): readonly string[] | undefined => {
        const endsOf = (edge: LayoutEdge): readonly [EntityRef, EntityRef] => [edge.target.entity, edge.source.entity];
        const [firstTarget, firstSource] = endsOf(first);
        const [secondTarget, secondSource] = endsOf(second);
        const attempts: readonly (readonly [EntityRef, EntityRef, number])[] = [
          [firstTarget, secondTarget, rank + 1],
          [firstSource, secondSource, rank],
          [firstSource, secondSource, rank + 1],
          [firstTarget, secondTarget, rank],
          [firstTarget, secondSource, rank + 1],
          [firstSource, secondTarget, rank + 1],
          [firstTarget, secondSource, rank],
          [firstSource, secondTarget, rank],
        ];
        for (const [firstEntity, secondEntity, attemptRank] of attempts) {
          const keys = keysBetween(
            level,
            attemptRank,
            memberOf(graph, firstEntity, parent),
            memberOf(graph, secondEntity, parent),
          );
          if (keys !== undefined) return keys;
        }
        return undefined;
      };
    // L-R10 progress guard: a widening round that moved nothing at all — the
    // segment kept its length, none of its overlaps shrank, and the recomputed
    // demand did not shrink either — is not asked again for that label. A
    // demand that shrinks round after round is converging room, not stagnation,
    // and stays requested. The label then tries another spacing (its next
    // segment) instead of enlarging a fixed stub round after round. Gaps are
    // keyed per label, so one label's dead gap stays available to the others.
    for (const edge of graph.edges) {
      const size = labelSizes.get(edge.id);
      if (size === undefined || placedBoxes.has(edge.id)) {
        lastRequest.delete(edge.id);
        continue;
      }
      const route = outcome.routes.get(edge.id)!;
      const prev = lastRequest.get(edge.id);
      if (prev !== undefined) {
        if (route.length === prev.points && prev.segment < route.length - 1) {
          const again = searchSegment(edge, route, size, prev.segment);
          // The demand must aim at the same gaps: a reshaped route moves the
          // label to another channel, and the old gaps must not pay for it.
          const againGaps = [...(again.rankKey !== undefined ? [again.rankKey] : []), ...again.sibling.keys()].sort();
          const sameGaps =
            againGaps.length === prev.gaps.length && againGaps.every((gap, index) => gap === [...prev.gaps].sort()[index]);
          const grown = prev.gaps.every((gap, index) => extraOf(gap) > prev.extras[index]!);
          const needSum =
            (again.rankKey !== undefined ? again.rankAmount : 0) +
            [...again.sibling.values()].reduce((total, need) => total + need, 0);
          if (
            sameGaps &&
            grown &&
            again.segLen <= prev.segLen &&
            again.overlap >= prev.overlap &&
            needSum >= prev.needSum
          ) {
            for (const gap of prev.gaps) deadGaps.add(`${edge.id}|${gap}`);
          }
        }
        lastRequest.delete(edge.id);
      }
      if (requestLabelRoom(edge, route, size)) waiting.push(edge.id);
      else unplaced.push(edge.id);
    }

    drawing = {
      placement,
      docks,
      routes: outcome.routes,
      warnings: [
        ...placement.warnings,
        ...outcome.obstructed.map((id) => ({
          code: "route-obstructed" as const,
          refs: [id],
          message: `no orthogonal route around the obstacles was found for ${id}; an elbow is drawn instead`,
        })),
      ],
      labelOutcomes: new Map(),
    };
    // L-R10 residual, evaluated on the final round's geometry: a label with a
    // widening request outstanding is a search budget exhausted
    // (`label-budget-exhausted`), never `label-unplaced`; only a label whose
    // every segment is closed by the residual predicate is `label-unplaced`.
    // The two outcomes are never merged; every warning names its sole ref.
    // Outcomes are recorded per label for `diagnoseLabels` either way.
    classifyLabels = (ids: readonly RelationRef[]): LayoutWarning[] => {
      const found: LayoutWarning[] = [];
      const outcomes = new Map<RelationRef, LabelOutcome>();
      for (const edge of graph.edges) {
        const size = labelSizes.get(edge.id);
        if (size === undefined) continue;
        if (placedBoxes.has(edge.id)) {
          outcomes.set(edge.id, { outcome: "placed", segments: [] });
          continue;
        }
        if (!ids.includes(edge.id)) continue;
        const route = outcome.routes.get(edge.id)!;
        const analyses = edgeLabelCandidates(route).map((segment) => searchSegment(edge, route, size, segment));
        const open = analyses.filter(
          (analysis) => !analysis.holds && (analysis.rankKey !== undefined || analysis.sibling.size > 0),
        );
        const closed: SegmentResidual[] = analyses
          .filter((analysis) => !analysis.holds)
          .map((analysis) => ({ segment: analysis.segment, reasons: analysis.reasons }));
        if (open.length > 0 || !residualUnplaceable(closed)) {
          outcomes.set(edge.id, { outcome: "label-budget-exhausted", segments: closed });
          found.push({
            code: "label-budget-exhausted",
            refs: [edge.id],
            message: `the label of ${edge.id} still needs room after ${LABEL_ROUNDS} widening rounds`,
          });
          continue;
        }
        outcomes.set(edge.id, { outcome: "label-unplaced", segments: closed });
        found.push({
          code: "label-unplaced",
          refs: [edge.id],
          message: `the label of ${edge.id} overlaps a shape, a title or another label, and no rank or sibling gap could be widened to fix it`,
        });
      }
      drawing = { ...drawing!, labelOutcomes: outcomes };
      return found;
    };
    if (lengthen.size === 0 && widen.size === 0) {
      labelOutcome = classifyLabels(unplaced);
      break;
    }
    if (round === LABEL_ROUNDS - 1) {
      // Out of rounds with labels still waiting for room: they are reported, not dropped.
      labelOutcome = classifyLabels([...unplaced, ...waiting]);
      for (const [key, amount] of lengthen) extraGaps.set(key, (extraGaps.get(key) ?? 0) + amount);
      for (const [key, amount] of widen) siblingGaps.set(key, (siblingGaps.get(key) ?? 0) + amount);
      break;
    }
    for (const [key, amount] of lengthen) extraGaps.set(key, (extraGaps.get(key) ?? 0) + amount);
    for (const [key, amount] of widen) siblingGaps.set(key, (siblingGaps.get(key) ?? 0) + amount);
  }

  return {
    ...drawing!,
    warnings: [...drawing!.warnings, ...labelOutcome],
  };
}

function buildView(
  document: SemanticDocument,
  graph: LayoutGraph,
  drawing: Drawing,
  viewId: ViewDocument["viewId"],
  zoom: number,
): ViewDocument {
  const occurrenceOf = (entity: EntityRef): OccurrenceRef => occurrenceRef(`e.${localIdOf(entity)}`);
  const maxContainerDepth = Math.max(
    -1,
    ...[...graph.nodes.values()].filter((node) => node.kind === "container").map((node) => node.depth),
  );

  const entityOccurrences: Record<string, EntityOccurrence> = {};
  for (const node of graph.nodes.values()) {
    const rect = drawing.placement.rects.get(node.id)!;
    const id = occurrenceOf(node.id);
    entityOccurrences[id] = {
      id,
      entity: node.id,
      geometry: { x: clean(rect.x), y: clean(rect.y), width: clean(rect.width), height: clean(rect.height) },
      z: node.kind === "container" ? node.depth - (maxContainerDepth + 1) : 0,
    };
  }

  const portOccurrences: Record<string, PortOccurrence> = {};
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  for (const edge of graph.edges) {
    const pair = drawing.docks.get(edge.id)!;
    const route = drawing.routes.get(edge.id)!;
    const endOccurrence = (dock: EdgeDocks["source"]): OccurrenceRef => {
      if (dock.port === undefined) return occurrenceOf(dock.entity);
      const id = occurrenceRef(`p.${localIdOf(dock.port)}`);
      portOccurrences[id] ??= {
        id,
        port: dock.port,
        ownerOccurrence: occurrenceOf(dock.entity),
        side: dock.side,
        order: dock.order,
        anchor: clean(dock.anchor),
      };
      return id;
    };
    const waypoints = route
      .slice(pair.source.port === undefined ? 0 : 1, pair.target.port === undefined ? route.length : route.length - 1)
      .map((point) => ({ x: clean(point.x), y: clean(point.y) }));
    const id = occurrenceRef(`r.${localIdOf(edge.id)}`);
    relationOccurrences[id] = {
      id,
      relation: edge.id,
      endpoints: [
        { role: "source", occurrence: endOccurrence(pair.source) },
        { role: "target", occurrence: endOccurrence(pair.target) },
      ],
      waypoints,
    };
  }

  return {
    viewId,
    semanticDocumentId: document.documentId,
    revision: document.revision,
    entityOccurrences,
    relationOccurrences,
    portOccurrences,
    groups: {},
    filters: [],
    presentation: { camera: { x: 0, y: 0, zoom } },
  };
}

export function layoutDocument(document: SemanticDocument, options: LayoutOptions): LayoutResult {
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
  const diagnostics = validateDocument(document, { registry: options.registry });
  if (hasErrors(diagnostics)) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "document", message: "diagram-core refuses this document" }],
      diagnostics,
    };
  }
  const read = readGraph(document);
  if ("refusals" in read) return { status: "refused", refusals: read.refusals, diagnostics: [] };
  const graph = read.graph;

  const metrics: LayoutMetrics = { ...DEFAULT_LAYOUT_METRICS, ...options.metrics };
  const labelSizes = new Map<RelationRef, TextSize>();
  for (const edge of graph.edges) {
    if (edge.label !== undefined) labelSizes.set(edge.id, options.measureText(edge.label, "edge-label"));
  }

  const target = options.targetWidth;
  const phone = target <= PHONE_MAX_WIDTH;
  // L-R5, measured after labels: both drawings are finalized (placement,
  // docking with side growth, routing, L-R10 rounds) before the comparison.
  // Left-to-right when `B_lr ≤ W`, else top-to-bottom when `B_tb ≤ W`, else
  // the narrower drawing, top-to-bottom on an exact tie — at every width,
  // the phone range included. An empty drawing (no entities, `B = 0`) takes
  // the first branch: left-to-right.
  const leftToRightDrawing = draw(graph, "left-to-right", metrics, options.measureText, labelSizes);
  const topToBottomDrawing = draw(graph, "top-to-bottom", metrics, options.measureText, labelSizes);
  const drawing = pickDrawing(leftToRightDrawing, topToBottomDrawing, target);

  // L-R7: `s = min(1, max(0.75, W / B))`. The empty drawing takes zoom 1;
  // `B = W / 0.75` gives exactly 0.75, and the drawing pans exactly when
  // `B · s > W`, that is `B > W / 0.75`.
  const width = drawing.placement.width;
  const zoom = width === 0 ? 1 : Math.min(1, Math.max(MIN_ZOOM, target / width));
  const view = buildView(document, graph, drawing, options.viewId ?? viewRef("layout"), zoom);
  return {
    status: "laid-out",
    view,
    fit: {
      direction: drawing.placement.direction,
      width,
      height: drawing.placement.height,
      zoom,
      pans: width * zoom > target,
      phone,
    },
    warnings: drawing.warnings,
  };
}

function pickDrawing(leftToRight: Drawing, topToBottom: Drawing, target: number): Drawing {
  return leftToRight.placement.width <= target
    ? leftToRight
    : topToBottom.placement.width <= target
      ? topToBottom
      : leftToRight.placement.width < topToBottom.placement.width
        ? leftToRight
        : topToBottom;
}

/**
 * L-R10 residual diagnosis for the AC-L8 fixtures: lays out with the same
 * geometry `layoutDocument` produces and reports every label's outcome on the
 * chosen finalized drawing — `placed`, `label-unplaced` with every segment's
 * closed residual reasons, or `label-budget-exhausted` when a widening request
 * is still outstanding. Test support; never persisted.
 */
export function diagnoseLabels(
  document: SemanticDocument,
  options: LayoutOptions,
):
  | {
      readonly status: "diagnosed";
      readonly direction: FlowDirection;
      readonly width: number;
      readonly outcomes: ReadonlyMap<RelationRef, LabelOutcome>;
    }
  | { readonly status: "refused"; readonly refusals: readonly LayoutRefusal[]; readonly diagnostics: readonly Diagnostic[] } {
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
  const diagnostics = validateDocument(document, { registry: options.registry });
  if (hasErrors(diagnostics)) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "document", message: "diagram-core refuses this document" }],
      diagnostics,
    };
  }
  const read = readGraph(document);
  if ("refusals" in read) return { status: "refused", refusals: read.refusals, diagnostics: [] };
  const graph = read.graph;
  const metrics: LayoutMetrics = { ...DEFAULT_LAYOUT_METRICS, ...options.metrics };
  const labelSizes = new Map<RelationRef, TextSize>();
  for (const edge of graph.edges) {
    if (edge.label !== undefined) labelSizes.set(edge.id, options.measureText(edge.label, "edge-label"));
  }
  const drawing = pickDrawing(
    draw(graph, "left-to-right", metrics, options.measureText, labelSizes),
    draw(graph, "top-to-bottom", metrics, options.measureText, labelSizes),
    options.targetWidth,
  );
  return {
    status: "diagnosed",
    direction: drawing.placement.direction,
    width: drawing.placement.width,
    outcomes: drawing.labelOutcomes,
  };
}
