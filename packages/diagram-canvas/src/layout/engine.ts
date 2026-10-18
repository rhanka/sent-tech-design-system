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
 *        at scale 1, top-to-bottom otherwise. A function of the graph and the
 *        width only: nothing in the document or the options can force it.
 * L-R7 — target width and phone fallback: at most 390 CSS px the drawing is
 *        top-to-bottom; if it is still wider than the target it scales down to
 *        0.75 at most, then the host pans inside the canvas (`fit.pans`). Below
 *        320 the same rule is applied; the spec's range starts at 320 because
 *        that is the narrowest page the DS supports.
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
import { ancestorsOf, readGraph, type LayoutGraph } from "./graph.js";
import { edgeLabelPlacement } from "./labels.js";
import { place, type Placement } from "./place.js";
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
  const minSizes = new Map<EntityRef, { width: number; height: number }>();
  let drawing: Drawing | undefined;
  let unplaced: RelationRef[] = [];

  for (let round = 0; round < LABEL_ROUNDS; round += 1) {
    const placement = place({ graph, direction, metrics, measureText, extraGaps, minSizes });
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
    const waiting: RelationRef[] = [];
    unplaced = [];
    const accepted: Rect[] = [];
    const blockers: Rect[] = [
      ...[...placement.rects.entries()]
        .filter(([id]) => graph.nodes.get(id)!.kind === "node")
        .map(([, rect]) => rect),
      ...placement.titleBands.values(),
    ];
    for (const edge of graph.edges) {
      const size = labelSizes.get(edge.id);
      if (size === undefined) continue;
      const route = outcome.routes.get(edge.id)!;
      const label = edgeLabelPlacement(route, size)!;
      const a = route[label.segment]!;
      const b = route[label.segment + 1]!;
      const horizontal = a.y === b.y;
      const along = horizontal ? size.width : size.height;
      const segmentLength = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
      const margin = metrics.labelMargin;
      const padded = {
        x: label.box.x - margin,
        y: label.box.y - margin,
        width: label.box.width + 2 * margin,
        height: label.box.height + 2 * margin,
      };
      const short = segmentLength < along + 2 * margin;
      const hitsShape = blockers.some((rect) => rectsIntersect(rect, padded));
      const hitsLabel = accepted.some((rect) => rectsIntersect(rect, padded));
      accepted.push(label.box);
      if (!short && !hitsShape && !hitsLabel) continue;

      const mainAligned = leftToRight === horizontal;
      const mainOf = (point: Vec2) => (leftToRight ? point.x : point.y);
      const crossOf = (point: Vec2) => (leftToRight ? point.y : point.x);
      const centreMain = mainOf(label.centre);
      const labelMain = leftToRight ? size.width : size.height;
      // The gap to lengthen: for a segment along the flow, the gap it crosses
      // nearest to the label; for a segment across the flow, the gap holding it.
      const segmentFrom = Math.min(mainOf(a), mainOf(b));
      const segmentTo = Math.max(mainOf(a), mainOf(b));
      const crossAt = crossOf(label.centre);
      let chosen: { readonly key: string; readonly from: number; readonly to: number; readonly distance: number; readonly depth: number } | undefined;
      for (const level of placement.levels) {
        const regionCrossFrom = leftToRight ? level.region.y : level.region.x;
        const regionCrossTo = regionCrossFrom + (leftToRight ? level.region.height : level.region.width);
        // The root level owns everything, including a route running outside the drawing.
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
          if (better) chosen = { key: `${level.key}#${gap.rank}`, from: gap.from, to: gap.to, distance, depth: level.depth };
        }
      }
      let amount = 0;
      if (chosen !== undefined) {
        if (short && mainAligned) amount = Math.max(amount, along + 2 * margin - segmentLength);
        if (chosen.distance === 0 && chosen.to - chosen.from < labelMain + 2 * margin) {
          amount = Math.max(amount, labelMain + 2 * margin - (chosen.to - chosen.from));
        }
        // Lengthening a gap the segment crosses moves the label, relative to a
        // shape on either side of that gap, by half the amount: forward from a
        // shape before it, backward from a shape after it. A shape that spans
        // the gap (a title band along the flow) cannot be cleared that way.
        if (hitsShape) {
          const boxStart = leftToRight ? padded.x : padded.y;
          const boxEnd = boxStart + (leftToRight ? padded.width : padded.height);
          for (const rect of blockers) {
            if (!rectsIntersect(rect, padded)) continue;
            const rectStart = leftToRight ? rect.x : rect.y;
            const rectEnd = rectStart + (leftToRight ? rect.width : rect.height);
            if (mainAligned && rectEnd <= chosen.from) amount = Math.max(amount, 2 * (rectEnd - boxStart));
            else if (mainAligned && rectStart >= chosen.to) amount = Math.max(amount, 2 * (boxEnd - rectStart));
            else {
              amount = 0;
              break;
            }
          }
        }
      }
      // Lengthening makes room for a label; it is not a way to slide the
      // drawing under a label that runs alongside a shape. Past a few label
      // lengths the engine reports the label instead.
      if (amount <= 0 || chosen === undefined || amount > MAX_LENGTHEN_LABELS * (labelMain + 2 * margin)) {
        unplaced.push(edge.id);
        continue;
      }
      const key = chosen.key;
      lengthen.set(key, Math.max(lengthen.get(key) ?? 0, amount));
      waiting.push(edge.id);
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
    if (lengthen.size === 0) break;
    // Out of rounds with labels still waiting for room: they are reported, not dropped.
    if (round === LABEL_ROUNDS - 1) unplaced = [...unplaced, ...waiting];
    for (const [key, amount] of lengthen) extraGaps.set(key, (extraGaps.get(key) ?? 0) + amount);
  }

  return {
    ...drawing!,
    warnings: [
      ...drawing!.warnings,
      ...unplaced.map((id) => ({
        code: "label-unplaced" as const,
        refs: [id],
        message: `the label of ${id} overlaps a shape, a title or another label, and no segment could be lengthened to fix it`,
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
  let drawing: Drawing;
  if (phone) drawing = draw(graph, "top-to-bottom", metrics, options.measureText, labelSizes);
  else {
    const leftToRight = draw(graph, "left-to-right", metrics, options.measureText, labelSizes);
    drawing =
      leftToRight.placement.width <= target
        ? leftToRight
        : draw(graph, "top-to-bottom", metrics, options.measureText, labelSizes);
  }

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
