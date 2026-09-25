/**
 * The scene: `Scene` / `GeometryFrame` of the study's five objects (§4.1), built
 * from a `DiagramState` and one view reference, in WORLD coordinates, with no
 * DOM and no renderer.
 *
 * THE FRAME HOLDS NO CAMERA, and that is a decision rather than an omission. A
 * pan or a zoom changes no geometry and no paint order, so folding the camera
 * into the frame would make `sceneRevision` move on every pointer wheel event
 * and destroy its only use - telling a renderer whether anything it draws has
 * actually changed. The camera enters at the transform (`transform.ts`) and at
 * the device-space hit test, per call. A test pans and zooms and asserts the
 * revision does not move.
 *
 * WHAT THE STUDY ASKS OF THIS OBJECT (§4.1): "sceneRevision ; rects, contours,
 * ports, paths, labels, z-order, transforms, hit regions ; references
 * occurrence->entite", and it excludes "stocker uniquement x/y en resultat
 * riche". Delivered here: sceneRevision, rects, port anchors, relation paths,
 * z-order, hit regions and the occurrence -> semantic reference on every item.
 * NOT here, and named in the README: labels (they need text measurement, which
 * needs either a font metric source or a DOM), contours beyond the rectangle,
 * and the group box of a collapsed group.
 *
 * CONSERVATION, which is the assertion that makes this module reviewable: every
 * occurrence of the view is either an item of the frame or an entry of
 * `exclusions`, exactly once. `sceneOccurrenceCount(frame)` is that sum, and a
 * test compares it with the view's own count. An occurrence silently dropped -
 * the failure study invariant 1 forbids - breaks it, and an empty scene cannot
 * satisfy it unless the view was empty too.
 */

import {
  canonicalise,
  diagnostic,
  hashContent,
  type Diagnostic,
  type DiagramState,
  type DocumentRef,
  type EntityRef,
  type OccurrenceRef,
  type PortRef,
  type PortSide,
  type RelationRef,
  type ViewRef,
} from "@sentropic/diagram-core";

import { isFiniteRect, normaliseRect, rectCenter, rectFromPoints, rectUnion } from "./geometry.js";
import type { Rect, Vec2 } from "./transform.js";
import { evaluateVisibility, type SceneExclusion } from "./visibility.js";

export type SceneItemKind = "node" | "edge" | "port";

export interface SceneNode {
  readonly kind: "node";
  readonly occurrence: OccurrenceRef;
  /** The occurrence -> entity correspondence study invariant 7 requires on every item. */
  readonly entity: EntityRef;
  /** World rectangle, NORMALISED: a persisted negative extent is legal, see geometry.ts. */
  readonly rect: Rect;
  /** Resolved paint plane. `EntityOccurrence.z` when present, 0 otherwise. */
  readonly z: number;
  readonly group?: string;
}

export interface ScenePort {
  readonly kind: "port";
  readonly occurrence: OccurrenceRef;
  readonly port: PortRef;
  readonly ownerOccurrence: OccurrenceRef;
  readonly side: PortSide;
  /** `PortOccurrence.order`, carried through: it is the tiebreaker for two ports at one anchor. */
  readonly order: number;
  /** The world point the port sits at, resolved from the owner rect, the side and the anchor. */
  readonly anchorPoint: Vec2;
  /** The port's own hit region: a square of `portSize` centred on `anchorPoint`. */
  readonly rect: Rect;
  /** Inherited from the owner occurrence, so a port never paints under the shape it belongs to. */
  readonly z: number;
}

export interface SceneEdge {
  readonly kind: "edge";
  readonly occurrence: OccurrenceRef;
  readonly relation: RelationRef;
  /**
   * The route, at least two points: the endpoint anchors with the persisted
   * waypoints between them. The endpoints are visited in ASCENDING ROLE order,
   * never in array order, because `diagram-core` states array position is not
   * content ("Not a position: `endpoints[0]` means nothing"). A renderer that
   * needs the semantic direction reads the roles, not this order.
   */
  readonly path: readonly Vec2[];
  readonly bounds: Rect;
  /**
   * The LOWEST plane among the occurrences this edge attaches to. An edge
   * belongs beneath the shapes it joins, and lifting one endpoint should not
   * lift the edge above unrelated shapes that lie between them.
   */
  readonly z: number;
}

export type SceneItem = SceneNode | ScenePort | SceneEdge;

export interface SceneFrame {
  /**
   * `fnv1a64` of the canonical form of everything below. NON-CRYPTOGRAPHIC, like
   * `diagram-core`'s own `hashContent`: it detects change, it proves nothing.
   */
  readonly sceneRevision: string;
  readonly view: ViewRef;
  readonly semanticDocument: DocumentRef;
  readonly documentRevision: number;
  readonly viewRevision: number;
  /** Bottom to top. `hitTest` walks it backwards; index in this array is `paintIndex`. */
  readonly items: readonly SceneItem[];
  /** The world bounding box of every item, or `undefined` for an empty scene. */
  readonly bounds?: Rect;
  readonly exclusions: readonly SceneExclusion[];
  readonly diagnostics: readonly Diagnostic[];
}

export interface BuildSceneOptions {
  /** Side of a port's square hit region, in world units. */
  readonly portSize?: number;
}

export const DEFAULT_PORT_SIZE = 8;

/** Painted order within one plane: edges under shapes, shapes under their ports. */
const KIND_RANK: Readonly<Record<SceneItemKind, number>> = { edge: 0, node: 1, port: 2 };

/**
 * Where a port sits on its owner's rectangle. "Position along the side, 0..1
 * from the side's start" is all `diagram-core` says, so the START is fixed here:
 * the WEST end for `north` and `south`, the NORTH end for `east` and `west` -
 * that is, increasing x then increasing y, the same direction the rectangle's own
 * coordinates increase in. Any other reading would make 0 and 1 swap between two
 * opposite sides for no stated reason.
 */
export function portAnchorPoint(ownerRect: Rect, side: PortSide, anchor: number): Vec2 {
  const box = normaliseRect(ownerRect);
  const clamped = anchor < 0 ? 0 : anchor > 1 ? 1 : anchor;
  switch (side) {
    case "north":
      return { x: box.x + clamped * box.width, y: box.y };
    case "south":
      return { x: box.x + clamped * box.width, y: box.y + box.height };
    case "east":
      return { x: box.x + box.width, y: box.y + clamped * box.height };
    case "west":
      return { x: box.x, y: box.y + clamped * box.height };
  }
}

function squareAround(center: Vec2, size: number): Rect {
  return { x: center.x - size / 2, y: center.y - size / 2, width: size, height: size };
}

export class UnknownViewError extends Error {
  readonly view: ViewRef;

  constructor(view: ViewRef) {
    super(`view ${view} is not in this state`);
    this.name = "UnknownViewError";
    this.view = view;
  }
}

export function buildScene(state: DiagramState, viewRef: ViewRef, options: BuildSceneOptions = {}): SceneFrame {
  const view = state.views[viewRef];
  // A missing view is a programmer error, not data to diagnose: every other
  // refusal here concerns the CONTENT of a view that exists.
  if (view === undefined) throw new UnknownViewError(viewRef);
  const portSize = options.portSize ?? DEFAULT_PORT_SIZE;

  const { visible, exclusions: visibilityExclusions } = evaluateVisibility({ document: state.document, view });
  const exclusions: SceneExclusion[] = [...visibilityExclusions];
  const diagnostics: Diagnostic[] = [];

  const nodes = new Map<OccurrenceRef, SceneNode>();
  for (const key of Object.keys(view.entityOccurrences).sort()) {
    const occurrence = view.entityOccurrences[key]!;
    if (!visible.has(occurrence.id)) continue;
    if (!isFiniteRect(occurrence.geometry)) {
      exclusions.push({ occurrence: occurrence.id, kind: "entity", reason: "geometry-not-finite" });
      diagnostics.push(
        diagnostic({
          code: "value-not-finite",
          path: `entityOccurrences.${key}.geometry`,
          message: "a scene cannot place a non-finite rectangle (study invariant 8)",
          refs: [occurrence.id],
        }),
      );
      continue;
    }
    nodes.set(occurrence.id, {
      kind: "node",
      occurrence: occurrence.id,
      entity: occurrence.entity,
      rect: normaliseRect(occurrence.geometry),
      z: occurrence.z ?? 0,
      ...(occurrence.group === undefined ? {} : { group: occurrence.group }),
    });
  }

  const ports = new Map<OccurrenceRef, ScenePort>();
  for (const key of Object.keys(view.portOccurrences).sort()) {
    const occurrence = view.portOccurrences[key]!;
    if (!visible.has(occurrence.id)) continue;
    const owner = nodes.get(occurrence.ownerOccurrence);
    if (owner === undefined) {
      // The owner passed visibility but its geometry did not: the port follows,
      // and is reported rather than placed at a guessed position.
      exclusions.push({
        occurrence: occurrence.id,
        kind: "port",
        reason: "owner-hidden",
        cause: occurrence.ownerOccurrence,
      });
      continue;
    }
    if (!Number.isFinite(occurrence.anchor) || !Number.isFinite(occurrence.order)) {
      exclusions.push({ occurrence: occurrence.id, kind: "port", reason: "geometry-not-finite" });
      diagnostics.push(
        diagnostic({
          code: "value-not-finite",
          path: `portOccurrences.${key}`,
          message: "a port needs a finite anchor and order to be placed",
          refs: [occurrence.id],
        }),
      );
      continue;
    }
    const anchorPoint = portAnchorPoint(owner.rect, occurrence.side, occurrence.anchor);
    ports.set(occurrence.id, {
      kind: "port",
      occurrence: occurrence.id,
      port: occurrence.port,
      ownerOccurrence: occurrence.ownerOccurrence,
      side: occurrence.side,
      order: occurrence.order,
      anchorPoint,
      rect: squareAround(anchorPoint, portSize),
      z: owner.z,
    });
  }

  const edges: SceneEdge[] = [];
  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key]!;
    if (!visible.has(occurrence.id)) continue;
    const ends = [...occurrence.endpoints].sort((left, right) =>
      left.role < right.role ? -1 : left.role > right.role ? 1 : left.occurrence < right.occurrence ? -1 : 1,
    );
    const anchors: Vec2[] = [];
    let planes: number[] = [];
    let missing: OccurrenceRef | undefined;
    for (const end of ends) {
      const port = ports.get(end.occurrence);
      if (port !== undefined) {
        anchors.push(port.anchorPoint);
        planes.push(port.z);
        continue;
      }
      const node = nodes.get(end.occurrence);
      if (node !== undefined) {
        anchors.push(rectCenter(node.rect));
        planes.push(node.z);
        continue;
      }
      missing = end.occurrence;
      break;
    }
    if (missing !== undefined) {
      exclusions.push({ occurrence: occurrence.id, kind: "relation", reason: "endpoint-hidden", cause: missing });
      continue;
    }
    const waypoints = (occurrence.waypoints ?? []).filter((point) =>
      Number.isFinite(point.x) && Number.isFinite(point.y),
    );
    if ((occurrence.waypoints ?? []).length !== waypoints.length) {
      diagnostics.push(
        diagnostic({
          code: "value-not-finite",
          path: `relationOccurrences.${key}.waypoints`,
          message: "a non-finite waypoint is dropped from the route and reported",
          refs: [occurrence.id],
        }),
      );
    }
    // Route hints sit BETWEEN the first and the last anchor. A hyperrelation's
    // real routing is later work; the polyline through its anchors is a hit
    // region, and this comment is the whole claim made for it.
    const path: Vec2[] =
      anchors.length <= 1
        ? anchors
        : [anchors[0]!, ...waypoints.map((point) => ({ x: point.x, y: point.y })), ...anchors.slice(1)];
    const bounds = rectFromPoints(path);
    if (bounds === undefined) {
      exclusions.push({ occurrence: occurrence.id, kind: "relation", reason: "geometry-not-finite" });
      continue;
    }
    if (planes.length === 0) planes = [0];
    edges.push({
      kind: "edge",
      occurrence: occurrence.id,
      relation: occurrence.relation,
      path,
      bounds,
      z: Math.min(...planes),
    });
  }

  const items: SceneItem[] = [...edges, ...nodes.values(), ...ports.values()].sort(comparePaintOrder);

  let bounds: Rect | undefined;
  for (const item of items) {
    const box = item.kind === "edge" ? item.bounds : item.rect;
    bounds = bounds === undefined ? box : rectUnion(bounds, box);
  }

  exclusions.sort((left, right) =>
    left.occurrence < right.occurrence ? -1 : left.occurrence > right.occurrence ? 1 : left.reason < right.reason ? -1 : 1,
  );

  const payload = {
    view: view.viewId,
    semanticDocument: view.semanticDocumentId,
    documentRevision: state.document.revision,
    viewRevision: view.revision,
    items,
    ...(bounds === undefined ? {} : { bounds }),
    exclusions,
    diagnostics,
  };
  return { sceneRevision: hashContent(canonicalise(payload, "scene")), ...payload };
}

/** The total paint order: plane, then kind, then occurrence reference. No ties remain. */
export function comparePaintOrder(left: SceneItem, right: SceneItem): number {
  if (left.z !== right.z) return left.z - right.z;
  const rank = KIND_RANK[left.kind] - KIND_RANK[right.kind];
  if (rank !== 0) return rank;
  if (left.kind === "port" && right.kind === "port" && left.order !== right.order) return left.order - right.order;
  return left.occurrence < right.occurrence ? -1 : left.occurrence > right.occurrence ? 1 : 0;
}

export const sceneNodes = (frame: SceneFrame): readonly SceneNode[] =>
  frame.items.filter((item): item is SceneNode => item.kind === "node");

export const scenePorts = (frame: SceneFrame): readonly ScenePort[] =>
  frame.items.filter((item): item is ScenePort => item.kind === "port");

export const sceneEdges = (frame: SceneFrame): readonly SceneEdge[] =>
  frame.items.filter((item): item is SceneEdge => item.kind === "edge");

/** The occurrence -> scene item direction of the correspondence, for a caller holding a reference. */
export const sceneItemOf = (frame: SceneFrame, occurrence: OccurrenceRef): SceneItem | undefined =>
  frame.items.find((item) => item.occurrence === occurrence);

/** Items plus exclusions: the conservation quantity the module header describes. */
export const sceneOccurrenceCount = (frame: SceneFrame): number => frame.items.length + frame.exclusions.length;
