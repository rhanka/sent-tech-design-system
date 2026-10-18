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
 * L-R5 — flow direction: left-to-right when that drawing fits the target width
 *        at scale 1, top-to-bottom otherwise (subject to L-R7 when neither fits
 *        at scale 1). A function of the graph and the width only: nothing in
 *        the document or the options can force it.
 * L-R7 — target width and phone fallback: L-R5 chooses the direction at every
 *        width, the phone included. When neither direction fits at scale 1, the
 *        direction that needs the smaller reduction wins, top-to-bottom on a
 *        tie; the drawing scales down to 0.75 at most, then the host pans inside
 *        the canvas (`fit.pans`). The page never scrolls horizontally.
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
  type LayoutResult,
  type LayoutWarning,
  type TextMeasurer,
  type TextSize,
} from "./types.js";

/** How many times L-R10 may lengthen segments before reporting a label it could not place. */
const LABEL_ROUNDS = 12;
/** The most one round may lengthen a gap for one label, in label lengths along the flow. */
const MAX_LENGTHEN_LABELS = 4;

interface Drawing {
  readonly placement: Placement;
  readonly docks: ReadonlyMap<RelationRef, EdgeDocks>;
  readonly routes: ReadonlyMap<RelationRef, readonly Vec2[]>;
  readonly warnings: readonly LayoutWarning[];
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
      let chosen:
        | { readonly level: (typeof placement.levels)[number]; readonly rank: number; readonly from: number; readonly to: number; readonly distance: number; readonly depth: number }
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
          const better =
            chosen === undefined ||
            distance < chosen.distance ||
            (distance === chosen.distance && level.depth > chosen.depth);
          if (better) chosen = { level, rank: gap.rank, from: gap.from, to: gap.to, distance, depth: level.depth };
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
    // Room for one label no tried segment can hold: segments by decreasing
    // length, and for the first one a gap can be widened for, widen the rank
    // gap its route crosses along the flow, or the sibling gap it crosses
    // sideways, until one segment can hold it. True when a request was recorded.
    const requestLabelRoom = (edge: LayoutEdge, route: readonly Vec2[], size: TextSize): boolean => {
      const candidates = edgeLabelCandidates(route);
      if (candidates.length === 0) return false;
      const crossSize = leftToRight ? size.height : size.width;
      const labelMain = leftToRight ? size.width : size.height;
      // The lanes of two labels meet the next rank at their targets, the
      // previous one at their sources: separate whichever pair shares the level.
      const lanesBetween = (
        level: (typeof placement.levels)[number],
        parent: EntityRef | undefined,
        rank: number,
        first: LayoutEdge,
        second: LayoutEdge,
      ): readonly string[] | undefined => {
        const attempts: readonly (readonly [EntityRef, EntityRef, number])[] = [
          [first.target.entity, second.target.entity, rank + 1],
          [first.source.entity, second.source.entity, rank],
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
      for (const segment of candidates) {
        const a = route[segment]!;
        const b = route[segment + 1]!;
        const horizontal = a.y === b.y;
        const mainAligned = leftToRight === horizontal;
        const along = horizontal ? size.width : size.height;
        const short = segmentLength(route, segment) < along + 2 * margin;
        // A segment across the flow that is too short cannot grow by
        // lengthening a rank gap: the next candidate is tried.
        if (short && !mainAligned) continue;
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
        // No overlap: placeEdgeLabels holds this label here, so an unplaced
        // edge never reaches this with a fitting segment. A short but clear
        // segment still needs its lengthening below.
        if (!short && hitShapes.length === 0 && hitLabels.length === 0) continue;
        const chosen = findRankGap(a, b, centre, mainAligned);
        if (chosen === undefined) continue;
        const key = `${chosen.level.key}#${chosen.rank}`;
        const parent = chosen.level.key === ROOT ? undefined : (chosen.level.key as EntityRef);
        // Two lanes the rank gap cannot separate — the same member carries
        // both ends, so lengthening moves them together — fail this candidate.
        const siblingRequests = new Map<string, number>();
        let lanesBlocked = false;
        for (const other of hitLabels) {
          const otherBox = placedBoxes.get(other.id)!;
          const otherCross = leftToRight ? otherBox.height : otherBox.width;
          const lane = leftToRight ? centre.y : centre.x;
          const otherLane =
            leftToRight ? otherBox.y + otherBox.height / 2 : otherBox.x + otherBox.width / 2;
          const need = (crossSize + otherCross) / 2 + 2 * margin - Math.abs(lane - otherLane);
          if (need > MAX_LENGTHEN_LABELS * (crossSize + 2 * margin)) {
            lanesBlocked = true;
            break;
          }
          const keys = lanesBetween(chosen.level, parent, chosen.rank, other, edge);
          if (keys === undefined) {
            lanesBlocked = true;
            break;
          }
          if (!short) {
            for (const siblingKey of keys) {
              siblingRequests.set(siblingKey, Math.max(siblingRequests.get(siblingKey) ?? 0, need));
            }
          }
        }
        if (lanesBlocked) continue;
        let rankAmount = 0;
        if (short) rankAmount = Math.max(rankAmount, along + 2 * margin - segmentLength(route, segment));
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
        // A shape the lane runs alongside (a title band along the flow, a node
        // beside the lane) cannot be cleared by lengthening the rank gap: widen
        // the sibling gap between the lane's member and the shape's instead.
        const alongside = hitShapes.filter((rect) => {
          if (!mainAligned) return true;
          const rectStart = leftToRight ? rect.x : rect.y;
          const rectEnd = rectStart + (leftToRight ? rect.width : rect.height);
          return !(rectEnd <= chosen.from || rectStart >= chosen.to);
        });
        let shapeBlocked = false;
        for (const rect of alongside) {
          const owner = shapeOwner.get(rect);
          if (owner === undefined) {
            shapeBlocked = true;
            break;
          }
          const lane = leftToRight ? centre.y : centre.x;
          const shapeStart = leftToRight ? rect.y : rect.x;
          const shapeEnd = shapeStart + (leftToRight ? rect.height : rect.width);
          const paddedStart = leftToRight ? padded.y : padded.x;
          const paddedEnd = paddedStart + (leftToRight ? padded.height : padded.width);
          // The shape spans the lane past the label on both sides: no sibling
          // gap separates them, so the engine provably cannot clear it.
          if (shapeStart <= paddedStart && shapeEnd >= paddedEnd) {
            shapeBlocked = true;
            break;
          }
          const need = Math.min(paddedEnd - shapeStart, shapeEnd - paddedStart) + 2 * margin;
          if (need > MAX_LENGTHEN_LABELS * (crossSize + 2 * margin)) {
            shapeBlocked = true;
            break;
          }
          const shapeMember = memberOf(graph, owner, parent);
          const anchors = [edge.source.entity, edge.target.entity].map((entity) => memberOf(graph, entity, parent));
          let cleared = false;
          for (const rank of [chosen.rank, chosen.rank + 1]) {
            for (const anchor of anchors) {
              const keys = keysBetween(chosen.level, rank, anchor, shapeMember);
              if (keys === undefined) continue;
              for (const siblingKey of keys) {
                siblingRequests.set(siblingKey, Math.max(siblingRequests.get(siblingKey) ?? 0, need));
              }
              cleared = true;
            }
            if (cleared) break;
          }
          if (!cleared) {
            shapeBlocked = true;
            break;
          }
        }
        if (shapeBlocked) continue;
        if (rankAmount > MAX_LENGTHEN_LABELS * (labelMain + 2 * margin)) continue;
        if (rankAmount <= 0 && siblingRequests.size === 0) continue;
        if (rankAmount > 0) lengthen.set(key, Math.max(lengthen.get(key) ?? 0, rankAmount));
        for (const [siblingKey, need] of siblingRequests) {
          widen.set(siblingKey, Math.max(widen.get(siblingKey) ?? 0, need));
        }
        return true;
      }
      return false;
    };
    for (const edge of graph.edges) {
      const size = labelSizes.get(edge.id);
      if (size === undefined || placedBoxes.has(edge.id)) continue;
      if (requestLabelRoom(edge, outcome.routes.get(edge.id)!, size)) waiting.push(edge.id);
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
    };
    if (lengthen.size === 0 && widen.size === 0) break;
    // Out of rounds with labels still waiting for room: they are reported, not dropped.
    if (round === LABEL_ROUNDS - 1) unplaced = [...unplaced, ...waiting];
    for (const [key, amount] of lengthen) extraGaps.set(key, (extraGaps.get(key) ?? 0) + amount);
    for (const [key, amount] of widen) siblingGaps.set(key, (siblingGaps.get(key) ?? 0) + amount);
  }

  return {
    ...drawing!,
    warnings: [
      ...drawing!.warnings,
      ...unplaced.map((id) => ({
        code: "label-unplaced" as const,
        refs: [id],
        message: `the label of ${id} overlaps a shape, a title or another label, and no rank or sibling gap could be widened to fix it`,
      })),
    ],
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
  // L-R5 chooses the direction at every width, the phone included: the first
  // direction that fits at scale 1 wins. When neither fits, L-R7 takes the one
  // that needs the smaller reduction — the narrower drawing — top-to-bottom on
  // a tie. The page never scrolls horizontally: past 0.75 the host pans.
  const leftToRightDrawing = draw(graph, "left-to-right", metrics, options.measureText, labelSizes);
  const topToBottomDrawing = draw(graph, "top-to-bottom", metrics, options.measureText, labelSizes);
  const drawing =
    leftToRightDrawing.placement.width <= target
      ? leftToRightDrawing
      : topToBottomDrawing.placement.width <= target
        ? topToBottomDrawing
        : leftToRightDrawing.placement.width < topToBottomDrawing.placement.width
          ? leftToRightDrawing
          : topToBottomDrawing;

  const width = drawing.placement.width;
  const zoom = width <= target ? 1 : Math.max(MIN_ZOOM, target / width);
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
