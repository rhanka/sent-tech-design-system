/**
 * `DiagramSceneFigure` — the pure half of the scene host (DC-2a lot L4,
 * SPEC_EVOL_DC2A §4.3, §5, §6.7, Appendix D).
 *
 * Everything here is a function of its arguments: no `window`, no
 * `document`, no timer. The Svelte and Vue hosts own the DOM reads (figure
 * width, viewport height, token values, reduced-motion query) and feed
 * them in.
 *
 * The host consumes the public API of `@sentropic/diagram-canvas` only
 * (layout, scene, camera). The semantic-document and view types are read
 * off the layout signature, so this package names no other diagram layer.
 */
import {
  buildScene,
  cameraFit,
  clampZoom,
  CONTENT_INSET,
  DEFAULT_ALLOCATED_LINES,
  DEFAULT_LAYOUT_METRICS,
  layoutFolded,
  layoutMeasured,
  placeEdgeLabels,
  rectUnion,
  relationRoute,
  sceneNodes,
  type CameraFit,
  type LayoutCache,
  type LayoutHints,
  type LayoutMetrics,
  type LayoutOptions,
  type LayoutResult,
  type LevelOrientation,
  type LineMeasurer,
  type Rect,
  type RowPackOptions,
  type Vec2,
} from "../index.js";

import type { EntityPresentation } from "@sentropic/diagram-core";

/** The semantic document the layout engine reads. */
export type SceneDocument = Parameters<typeof layoutMeasured>[0];
/** A view document: the optional retained source view, and the emitted view. */
export type SceneView = NonNullable<Parameters<typeof layoutMeasured>[2]>;
/** An occurrence id of a view (`occurrence:…`). */
export type SceneOccurrenceRef = NonNullable<LayoutOptions["collapsed"]>[number];
export type ScenePresentation = NonNullable<LayoutOptions["presentation"]>;
export type SceneLaidOut = Extract<LayoutResult, { readonly status: "laid-out" }>;
export type SceneOrientations = Readonly<Record<string, LevelOrientation>>;

/**
 * `targetWidth` handed to the engine when the host supplies none. The
 * measured path never re-packs on it (D-3) and the host never reads the
 * layout fit report (Z-8), so a resize re-runs no layout.
 */
export const DEFAULT_SCENE_TARGET_WIDTH = 1440;
/**
 * Edge-label wrapping width of the measured path (`measured.ts`, §4.6.3
 * step 5). The engine does not export it; the label replay must measure
 * with the same allocation or the replayed boxes drift from the engine's.
 */
export const EDGE_LABEL_ALLOCATION = 400;
/** Zoom ratio of one button or key step. */
export const ZOOM_STEP_RATIO = 1.2;
/** Zoom ratio per wheel delta unit (Ctrl + wheel, trackpad pinch). */
export const WHEEL_ZOOM_RATE = 0.0015;

export interface DiagramSceneSize {
  readonly width: number;
  readonly height: number;
}

/** Drawing union size at zoom 1, available without measuring rendered elements. */
export function sceneContentSize(result: LayoutResult | undefined): DiagramSceneSize {
  return result?.status === "laid-out" ? { width: result.fit.width, height: result.fit.height } : { width: 0, height: 0 };
}

export interface SceneLayoutInput {
  readonly cache?: LayoutCache;
  readonly document: SceneDocument;
  /** Retained source view (authored occurrences, fold groups). Optional: the engine synthesises one. */
  readonly view?: SceneView;
  readonly registry: LayoutOptions["registry"];
  readonly bindings?: LayoutOptions["bindings"];
  readonly presentation: ScenePresentation;
  readonly measureLines: LineMeasurer;
  readonly collapsed: readonly SceneOccurrenceRef[];
  readonly hints?: LayoutHints;
  readonly metrics?: Partial<LayoutMetrics>;
  readonly rowPack?: RowPackOptions;
  readonly targetWidth?: number;
  readonly previousOrientation?: SceneOrientations;
}

/**
 * One full layout pass (§6.5: fold → measure → place → route, never patched).
 * Row-pack is always selected: an absent `rowPack` resolves to the DS
 * defaults. `measureText` is the compatibility measurer the measured path
 * never calls; it is derived from the shared line measurer so the type's
 * required field carries no second metric source.
 */
export function layoutScene(input: SceneLayoutInput): LayoutResult {
  const options: LayoutOptions = {
    registry: input.registry,
    ...(input.bindings === undefined ? {} : { bindings: input.bindings }),
    measureText: (text) => {
      const layout = input.measureLines({
        text,
        role: "body",
        availableWidth: Number.MAX_SAFE_INTEGER,
        allocatedLines: 1,
        folded: false,
      });
      return { width: layout.width, height: layout.height };
    },
    presentation: input.presentation,
    measureLines: input.measureLines,
    collapsed: input.collapsed,
    ...(input.hints === undefined ? {} : { hints: input.hints }),
    ...(input.metrics === undefined ? {} : { metrics: input.metrics }),
    rowPack: input.rowPack ?? {},
    targetWidth: input.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
    ...(input.previousOrientation === undefined ? {} : { previousOrientation: input.previousOrientation }),
  };
  if (input.cache !== undefined) {
    return input.view === undefined
      ? input.cache.layout(input.document, options)
      : input.cache.layoutFolded(input.document, input.view, options);
  }
  return input.view === undefined
    ? layoutMeasured(input.document, options)
    : layoutFolded(input.document, input.view, options);
}

/** Collapsed occurrence ids recorded by a view's fold groups. */
export function collapsedOccurrencesOf(view: SceneView | undefined): SceneOccurrenceRef[] {
  if (view === undefined) return [];
  const found: SceneOccurrenceRef[] = [];
  for (const key of Object.keys(view.groups).sort()) {
    const group = view.groups[key] as { readonly occurrence?: SceneOccurrenceRef; readonly collapsed?: boolean };
    if (group.collapsed === true && group.occurrence !== undefined) found.push(group.occurrence);
  }
  return found;
}

export type SceneNodeKind = "card" | "zone" | "legend-key" | "label";

export interface SceneNodeModel {
  readonly occurrence: SceneOccurrenceRef;
  readonly entity: string;
  readonly kind: SceneNodeKind;
  /** Zones only: drawn as the atomic card (collapsed) or as the frame. */
  readonly collapsed: boolean;
  readonly rect: Rect;
  readonly presentation?: EntityPresentation;
  /** Text of a node with no card form (L-R12 label) or of a legend key. */
  readonly text: string;
}

export interface SceneEdgeModel {
  readonly occurrence: SceneOccurrenceRef;
  readonly points: readonly Vec2[];
}

export interface SceneLabelModel {
  readonly occurrence: SceneOccurrenceRef;
  readonly lines: readonly string[];
  readonly box: Rect;
}

export interface SceneModel {
  readonly contentSize: DiagramSceneSize;
  /** Bottom to top, in the scene's paint order. */
  readonly nodes: readonly SceneNodeModel[];
  readonly edges: readonly SceneEdgeModel[];
  readonly labels: readonly SceneLabelModel[];
  /**
   * Fit bbox (BF-7): `rectUnion(scene.bounds, placed label boxes)`.
   * `undefined` for an empty scene.
   */
  readonly bounds?: Rect;
  readonly orientations: SceneOrientations;
}

const byCodeUnit = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

function edgeLabelOf(document: SceneDocument, relation: string): string | undefined {
  const attributes = document.relations[relation]?.attributes as
    | Readonly<Record<string, { readonly kind?: unknown; readonly value?: unknown }>>
    | undefined;
  const label = attributes?.["label"];
  return label !== undefined && label.kind === "text" && typeof label.value === "string" && label.value !== ""
    ? label.value
    : undefined;
}

/**
 * The drawable scene of one laid-out result: nodes at emitted geometry,
 * routes, and the emitted edge-label boxes and measured lines. Older results
 * without label boxes fall back to replay with the
 * engine's own placement function, measurer, margin and blockers (cards,
 * collapsed boxes and the title band of each expanded zone — an expanded
 * zone's interior is not a blocker on the row-pack path).
 */
export function resolveScene(
  result: SceneLaidOut,
  input: Pick<SceneLayoutInput, "document" | "presentation" | "measureLines" | "metrics">,
): SceneModel {
  const view = result.view;
  const frame = buildScene({ document: input.document, views: { [view.viewId]: view } }, view.viewId);
  const collapsed = new Set<string>(collapsedOccurrencesOf(view));
  const nodes: SceneNodeModel[] = sceneNodes(frame).map((node) => {
    const presentation = input.presentation.entities[node.occurrence] as EntityPresentation | undefined;
    const form = presentation?.form;
    const titled = presentation?.text.title !== undefined && presentation.text.title !== "";
    const kind: SceneNodeKind =
      form === "legend-key"
        ? "legend-key"
        : !titled
          ? "label"
          : form === "card"
            ? "card"
            : form === "container" || form === "legend"
              ? "zone"
              : "label";
    return {
      occurrence: node.occurrence,
      entity: node.entity,
      kind,
      collapsed: kind === "zone" && collapsed.has(node.occurrence),
      rect: node.rect,
      ...(presentation === undefined ? {} : { presentation }),
      text: presentation?.text.title ?? presentation?.text.body ?? "",
    };
  });

  const measuredLabels = new Map(
    (result.measurements?.slots ?? []).filter((slot) => slot.role === "edge-label").map((slot) => [slot.occurrence as string, slot.layout]),
  );
  const headerHeights = new Map<string, number>(
    (result.measurements?.headers ?? []).map((header) => [header.occurrence as string, header.height] as const),
  );
  const blockers: Rect[] = [];
  for (const node of nodes) {
    if (node.kind !== "zone" || node.collapsed) {
      blockers.push(node.rect);
      continue;
    }
    const height = headerHeights.get(node.occurrence);
    if (height === undefined) continue;
    blockers.push({
      x: node.rect.x + CONTENT_INSET,
      y: node.rect.y + CONTENT_INSET,
      width: node.rect.width - 2 * CONTENT_INSET,
      height,
    });
  }

  const edges: SceneEdgeModel[] = [];
  const entries: { id: string; route: readonly Vec2[]; size: { width: number; height: number } }[] = [];
  const labelLines = new Map<string, readonly string[]>();
  for (const id of Object.keys(view.relationOccurrences).sort(byCodeUnit)) {
    const occurrence = view.relationOccurrences[id]!;
    if (occurrence.waypoints === undefined) continue;
    const points = relationRoute(view, occurrence.id) ?? [];
    if (points.length < 2) continue;
    edges.push({ occurrence: occurrence.id, points });
    if (result.labelBoxes !== undefined && result.labelBoxes[id] === undefined) continue;
    const label = edgeLabelOf(input.document, occurrence.relation);
    if (label === undefined) continue;
    const layout = measuredLabels.get(id) ?? input.measureLines({
      text: label,
      role: "edge-label",
      availableWidth: EDGE_LABEL_ALLOCATION,
      allocatedLines: DEFAULT_ALLOCATED_LINES["edge-label"],
      folded: false,
    });
    labelLines.set(id, layout.lines);
    entries.push({ id, route: points, size: { width: layout.width, height: layout.height } });
  }
  const margin = input.metrics?.labelMargin ?? DEFAULT_LAYOUT_METRICS.labelMargin;
  const labels: SceneLabelModel[] = [];
  let bounds = frame.bounds;
  const placements = result.labelBoxes === undefined
    ? placeEdgeLabels(entries, blockers, margin)
    : new Map(Object.entries(result.labelBoxes).map(([id, box]) => [id, { box }]));
  for (const [id, placement] of placements) {
    if (placement === undefined) continue;
    labels.push({ occurrence: id as SceneOccurrenceRef, lines: labelLines.get(id) ?? [], box: placement.box });
    bounds = bounds === undefined ? placement.box : rectUnion(bounds, placement.box);
  }

  return {
    contentSize: sceneContentSize(result),
    nodes,
    edges,
    labels,
    ...(bounds === undefined ? {} : { bounds }),
    orientations: result.orientations ?? {},
  };
}

/* ───────────────────────────── camera ───────────────────────────── */

export interface SceneCameraInput {
  readonly bounds?: Rect;
  readonly viewWidth: number;
  readonly windowHeight: number;
  readonly maxDisplayScale?: number;
  readonly minReadableScale?: number;
}

/** §5.1 / BF-2 fit of the scene bounds, as `cameraFit` computes it. */
export function sceneFit(input: SceneCameraInput): CameraFit {
  return cameraFit({
    ...(input.bounds === undefined ? {} : { bounds: input.bounds }),
    viewWidth: input.viewWidth,
    windowHeight: input.windowHeight,
    ...(input.maxDisplayScale === undefined ? {} : { maxDisplayScale: input.maxDisplayScale }),
    ...(input.minReadableScale === undefined ? {} : { minReadableScale: input.minReadableScale }),
  });
}

/**
 * The camera zoom for a request (Z-1, Z-7, Z-8). `undefined` means « no
 * request yet »: the camera sits at the fit. Any number lands inside the
 * current `[minZoom, maxZoom]`, whatever input produced it.
 */
export function resolveZoom(requested: number | undefined, fit: CameraFit): number {
  return requested === undefined || !Number.isFinite(requested) ? fit.zoom : clampZoom(requested, fit);
}

export interface ScenePlacement {
  /** Scroll extent of the drawing at this zoom, CSS px. */
  readonly contentWidth: number;
  readonly contentHeight: number;
  /** Translation of the world origin inside the scroll extent, CSS px. */
  readonly translateX: number;
  readonly translateY: number;
  /** An axis overflows the fit box: the viewport scrolls it from its start (BF-2). */
  readonly overflowX: boolean;
  readonly overflowY: boolean;
}

/**
 * Where the drawing sits in the fit box at a zoom: centred on every axis it
 * fits, flush with the start on an axis it overflows (the viewport scrolls
 * that axis). Transform only — geometry is never touched (Z-6).
 */
export function scenePlacement(bounds: Rect | undefined, zoom: number, fit: Pick<CameraFit, "fitWidth" | "fitHeight">): ScenePlacement {
  if (bounds === undefined) {
    return { contentWidth: 0, contentHeight: 0, translateX: 0, translateY: 0, overflowX: false, overflowY: false };
  }
  const contentWidth = bounds.width * zoom;
  const contentHeight = bounds.height * zoom;
  // Half a CSS px of tolerance: a fit computed by division must not scroll.
  const overflowX = contentWidth > fit.fitWidth + 0.5;
  const overflowY = contentHeight > fit.fitHeight + 0.5;
  const startX = overflowX ? 0 : (fit.fitWidth - contentWidth) / 2;
  const startY = overflowY ? 0 : (fit.fitHeight - contentHeight) / 2;
  return {
    contentWidth,
    contentHeight,
    translateX: startX - bounds.x * zoom,
    translateY: startY - bounds.y * zoom,
    overflowX,
    overflowY,
  };
}

/* ─────────────────────────── transition ─────────────────────────── */

/** A CSS `<time>` token value (`240ms`, `0.24s`) in milliseconds; 0 when absent or unreadable. */
export function parseDurationMs(value: string | undefined): number {
  if (value === undefined) return 0;
  const match = /^\s*([+-]?(?:\d+\.?\d*|\.\d+))(ms|s)\s*$/.exec(value);
  if (match === null) return 0;
  const amount = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/** A unitless number token value; `undefined` when absent or unreadable. */
export function parseScale(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export type Easing = (progress: number) => number;

const linear: Easing = (progress) => progress;

/**
 * The easing of a CSS `cubic-bezier(x1, y1, x2, y2)` token value. Any other
 * value (absent token, keyword) is linear: the host holds no easing literal.
 */
export function parseEasing(value: string | undefined): Easing {
  if (value === undefined) return linear;
  const match = /^\s*cubic-bezier\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)\s*$/.exec(value);
  if (match === null) return linear;
  const [x1, y1, x2, y2] = match.slice(1, 5).map(Number) as [number, number, number, number];
  if (![x1, y1, x2, y2].every(Number.isFinite) || x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return linear;
  const bezier = (a: number, b: number, t: number): number => {
    const inverse = 1 - t;
    return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t;
  };
  return (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    // x(t) is monotonic for control abscissae in [0, 1]: bisect for t.
    let low = 0;
    let high = 1;
    for (let step = 0; step < 32; step += 1) {
      const middle = (low + high) / 2;
      if (bezier(x1, x2, middle) < progress) low = middle;
      else high = middle;
    }
    return bezier(y1, y2, (low + high) / 2);
  };
}

export function interpolateRect(from: Rect, to: Rect, eased: number): Rect {
  const mix = (a: number, b: number): number => a + (b - a) * eased;
  return { x: mix(from.x, to.x), y: mix(from.y, to.y), width: mix(from.width, to.width), height: mix(from.height, to.height) };
}

/**
 * Displayed rectangles of a transition (T-1): every occurrence present in
 * both states moves from its previous to its new rectangle; an occurrence
 * with no previous rectangle sits at its final one (the host fades it in).
 * `eased >= 1` returns the final rectangles themselves, so a finished or
 * instant transition is exactly the layout output.
 */
export function displayedRects(
  from: ReadonlyMap<string, Rect>,
  to: ReadonlyMap<string, Rect>,
  eased: number,
): ReadonlyMap<string, Rect> {
  if (eased >= 1) return to;
  const displayed = new Map<string, Rect>();
  for (const [id, target] of to) {
    const origin = from.get(id);
    displayed.set(id, origin === undefined ? target : interpolateRect(origin, target, eased));
  }
  return displayed;
}

export function rectsOf(scene: SceneModel): ReadonlyMap<string, Rect> {
  return new Map(scene.nodes.map((node) => [node.occurrence as string, node.rect] as const));
}

/** Whether two rectangle sets are the same drawing: same ids, same numbers. */
export function sameRects(left: ReadonlyMap<string, Rect>, right: ReadonlyMap<string, Rect>): boolean {
  if (left.size !== right.size) return false;
  for (const [id, a] of left) {
    const b = right.get(id);
    if (b === undefined || a.x !== b.x || a.y !== b.y || a.width !== b.width || a.height !== b.height) return false;
  }
  return true;
}
