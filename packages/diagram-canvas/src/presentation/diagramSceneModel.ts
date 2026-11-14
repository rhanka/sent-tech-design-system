import { flowIndex, parentOccurrenceOf, representativeOf, type FlowIndex, type FlowStep } from "@sentropic/diagram-core";
import type { FlowArrow, FlowBundle, FlowVisibleTarget } from "../layout/flows.js";
import type { Visible } from "./flowModel.js";
import { measureErdCard, renderErdMarkerSvg, erdText, wrapErdText, placeErdRoleLabels, ERD_GEOMETRY, type ErdCard } from "./erd.js";
import type { EntityRef, ErdCardinality } from "@sentropic/diagram-core";
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
  DEFAULT_MIN_READABLE_SCALE,
  FIT_PAINT_INSET,
  layoutFolded,
  layoutMeasured,
  placeEdgeLabels,
  rectUnion,
  relationRoute,
  sceneNodes,
  sceneEdges,
  type CameraFit,
  type LayoutCacheStats,
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

import { measureBundleLabel, type BundleLabelGroup } from "../layout/bundleLabel.js";
import { getDiagramGlyph } from "./registry.js";
import { lineBoxHeight, ZONE_GEOMETRY } from "./diagramCardModel.js";
import { clearSceneLabels } from "./sceneLabelClearance.js";
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

/** Named public boundary keeps host declaration emission in the canvas layer. */
export interface SceneLayoutCache {
  layout(document: SceneDocument, options: LayoutOptions, sourceView?: SceneView): LayoutResult;
  layoutFolded(document: SceneDocument, sourceView: SceneView, options: LayoutOptions): LayoutResult;
  has(document: SceneDocument, options: LayoutOptions, sourceView?: SceneView): boolean;
  clear(): void;
  dispose(): void;
  stats(): LayoutCacheStats;
}

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

/** Presentation data keyed by profile:type (or type), kept outside semantic profiles. */
export type SceneIconBindings = Readonly<Record<string, { readonly icon?: string; readonly role?: string; readonly shape?: "component" | "flow" | "erd" | "note" }>>;
export const ROLE_ICONS: Readonly<Record<string, string>> = { card: "base", zone: "cluster", store: "db", actor: "user", api: "api", runtime: "server" };

export function resolveScenePresentation(document: SceneDocument, presentation: ScenePresentation,
  bindings: SceneIconBindings = {}, strict = true, view?: SceneView, resolveGlyph: (name: string) => import("./diagramCardModel.js").DiagramGlyphPaths | undefined = getDiagramGlyph) {
  const missing: string[] = [];
  const entities = Object.fromEntries(Object.entries(presentation.entities).map(([id, entry]) => {
    if (entry.form !== "card" && entry.form !== "container" && entry.form !== "legend") return [id, entry];
    const entityId = view?.entityOccurrences[id]?.entity ?? id.replace(/^occurrence:e\./, "entity:");
    const entity = document.entities[entityId];
    if (entity?.profile === "erd@1") return [id, entry];
    const binding = bindings[entity === undefined ? "" : entity.profile + ":" + entity.type] ?? bindings[entity?.type ?? ""];
    if (binding?.shape !== undefined && binding.shape !== "component") return [id, { ...entry, icon: entry.icon ?? "none" }];
    const role = binding?.role ?? (entry.form === "card" ? "card" : "zone");
    const icon = entry.icon ?? binding?.icon ?? ROLE_ICONS[role];
    if (icon === undefined || resolveGlyph(icon) === undefined) {
      missing.push(id);
      return [id, { ...entry, icon: strict ? "unknown" : "none" }];
    }
    return [id, { ...entry, icon }];
  }));
  return { presentation: { ...presentation, entities }, missing };
}

export interface SceneLayoutInput {
  readonly iconBindings?: SceneIconBindings;
  readonly strictIcons?: boolean;
  readonly resolveGlyph?: (name: string) => import("./diagramCardModel.js").DiagramGlyphPaths | undefined;
  readonly cache?: SceneLayoutCache;
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
  readonly flows?: LayoutOptions["flows"];
  readonly flowTokens?: LayoutOptions["flowTokens"];
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
  const resolved = resolveScenePresentation(input.document, input.presentation, input.iconBindings, input.strictIcons, input.view, input.resolveGlyph);
  const options: LayoutOptions = {
    registry: input.registry,
    ...(input.flows === undefined ? {} : { flows: input.flows }),
    ...(input.flowTokens === undefined ? {} : { flowTokens: input.flowTokens }),
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
    presentation: resolved.presentation,
    measureLines: input.measureLines,
    collapsed: input.collapsed,
    ...(input.hints === undefined ? {} : { hints: input.hints }),
    ...(input.metrics === undefined ? {} : { metrics: input.metrics }),
    rowPack: input.rowPack ?? {},
    targetWidth: input.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
    ...(input.previousOrientation === undefined ? {} : { previousOrientation: input.previousOrientation }),
  };
  const result = input.cache !== undefined
    ? (input.view === undefined
      ? input.cache.layout(input.document, options)
      : input.cache.layoutFolded(input.document, input.view, options))
    : input.view === undefined
    ? layoutMeasured(input.document, options)
    : layoutFolded(input.document, input.view, options);
  return result.status !== "laid-out" || resolved.missing.length === 0 ? result : { ...result, warnings: [...result.warnings, ...resolved.missing.map(id => ({ code: "card-icon-missing" as const, refs: [id], message: "No icon resolves for this component; strict mode displays unknown" }))] };
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

export type SceneNodeKind = "card" | "zone" | "legend-key" | "label" | "erd";

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
  readonly erd?: ErdCard;
}

export interface SceneEdgeModel {
  readonly directed: boolean;
  readonly arrows: readonly FlowArrow[];
  readonly flow?: FlowStep;
  readonly bundle?: FlowBundle;
  readonly occurrence: SceneOccurrenceRef;
  readonly points: readonly Vec2[];
  readonly markers?: string;
}

export interface SceneLabelModel {
  readonly occurrence: SceneOccurrenceRef;
  readonly lines: readonly string[];
  readonly box: Rect;
  readonly title?: string;
  readonly bundle?: { readonly header: string; readonly groups: readonly BundleLabelGroup[] };
  readonly leader?: readonly Vec2[];
  readonly erd?: boolean;
}

export interface SceneBadgeModel { readonly id: string; readonly occurrence: SceneOccurrenceRef; readonly kind: "step" | "count"; readonly text: string; readonly box: Rect; readonly target: Visible }
export interface SceneModel {
  readonly badges: readonly SceneBadgeModel[];
  readonly flows: FlowIndex;
  readonly flowTargets: Readonly<Record<string, FlowVisibleTarget>>;
  readonly nodeTargets: readonly { readonly occurrence: SceneOccurrenceRef; readonly entity: string; readonly anchor: { readonly x: number; readonly y: number } }[];
  readonly flowRepresentatives: Readonly<Record<string, string>>;
  readonly flowEnds: Readonly<Record<string, readonly string[]>>;
  readonly flowAncestors: Readonly<Record<string, readonly string[]>>;
  readonly flowSummaryLabels: Readonly<Record<string, string>>;
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
  input: Pick<SceneLayoutInput, "document" | "presentation" | "measureLines" | "metrics" | "iconBindings" | "strictIcons" | "view" | "resolveGlyph" | "flows">,
): SceneModel {
  const view = result.view;
  const resolved = resolveScenePresentation(input.document, input.presentation, input.iconBindings, input.strictIcons, input.view, input.resolveGlyph);
  const frame = buildScene({ document: input.document, views: { [view.viewId]: view } }, view.viewId);
  const bundledMembers = new Set(Object.values(result.edgeBundles ?? {}).flatMap(bundle => bundle.members.slice(1)));
  const items = frame.items.filter(item => item.kind !== "edge" || !bundledMembers.has(item.occurrence));
  const visibleEdges = new Set(items.filter(item => item.kind === "edge").map(item => item.occurrence as string));
  const collapsed = new Set<string>(collapsedOccurrencesOf(view));
  const nodes: SceneNodeModel[] = sceneNodes(frame).map((node) => {
    const presentation = resolved.presentation.entities[node.occurrence] as EntityPresentation | undefined;
    const form = presentation?.form;
    const titled = presentation?.text.title !== undefined && presentation.text.title !== "";
    const erd = input.document.entities[node.entity]?.profile === "erd@1";
    const kind: SceneNodeKind =
      erd ? "erd" : form === "legend-key"
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
      collapsed: (kind === "zone" || kind === "erd") && collapsed.has(node.occurrence),
      ...(erd ? { erd: measureErdCard(input.document, node.entity as EntityRef, collapsed.has(node.occurrence), input.measureLines) } : {}),
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
    const ruleClearance = (ZONE_GEOMETRY.ruleHeight / 2 + 1) / DEFAULT_MIN_READABLE_SCALE;
    blockers.push({
      x: node.rect.x,
      y: node.rect.y,
      width: node.rect.width,
      height: CONTENT_INSET + height + ZONE_GEOMETRY.ruleHeight / 2 + ruleClearance,
    });
    // A zone footer has one allocated line. Reserve its fixed chrome from
    // the presentation instead of measuring the scene again during replay.
    const reserve = node.presentation?.text.footer?.trim()
      ? lineBoxHeight(ZONE_GEOMETRY.footer.size) + ZONE_GEOMETRY.ruleHeight + 2 * ZONE_GEOMETRY.ruleMargin + ZONE_GEOMETRY.footerBottomInset : 0;
    if (reserve > 0) blockers.push({ x: node.rect.x, y: node.rect.y + node.rect.height - reserve - ZONE_GEOMETRY.borderWidth - ruleClearance,
      width: node.rect.width, height: reserve + ZONE_GEOMETRY.borderWidth + ruleClearance });
  }

  const allFlows = flowIndex(input.document);
  const flowTargets = result.flowTargets ?? {};
  const flows: FlowIndex = {
    scenarios: allFlows.scenarios.map((scenario) => ({ ...scenario, steps: scenario.steps.filter((step) => flowTargets[step.relation] !== undefined) })),
    byRelation: Object.fromEntries(Object.entries(allFlows.byRelation).filter(([id]) => flowTargets[id] !== undefined)),
    byEntity: Object.fromEntries(Object.entries(allFlows.byEntity).map(([id,steps]) => [id,steps.filter((step) => flowTargets[step] !== undefined)])),
  };
  const flowAncestors: Record<string,string[]> = {};
  for (const node of nodes) {
    const parents: string[] = [];
    for (let parent = parentOccurrenceOf(view,node.occurrence); parent !== undefined; parent = parentOccurrenceOf(view,parent)) parents.push(parent);
    flowAncestors[node.occurrence] = parents;
  }
  const flowRepresentatives: Record<string,string> = Object.fromEntries(nodes.map((node) => [node.entity,node.occurrence]));
  for (const occurrence of Object.values(view.entityOccurrences).sort((a,b) => byCodeUnit(a.id,b.id))) {
    const box = representativeOf(view,collapsed,occurrence.id);
    if (flowRepresentatives[occurrence.entity] === undefined && nodes.some((node) => node.occurrence === box)) flowRepresentatives[occurrence.entity] = box;
  }
  const flowEnds: Record<string,string[]> = {};
  for (const [id,target] of Object.entries(flowTargets)) {
    if (target.kind === "internal") { flowEnds[id] = [target.box]; continue; }
    const occurrence = view.relationOccurrences[target.occurrence];
    flowEnds[id] = occurrence?.endpoints.map((end) => view.portOccurrences[end.occurrence]?.ownerOccurrence ?? end.occurrence) ?? [];
  }
  const edges: SceneEdgeModel[] = [];
  const entries: { id: string; route: readonly Vec2[]; size: { width: number; height: number } }[] = [];
  const labelLines = new Map<string, readonly string[]>();
  for (const id of Object.keys(view.relationOccurrences).sort(byCodeUnit)) {
    if (!visibleEdges.has(id)) continue;
    const occurrence = view.relationOccurrences[id]!;
    if (occurrence.waypoints === undefined || !visibleEdges.has(id)) continue;
    const points = relationRoute(view, occurrence.id) ?? [];
    if (points.length < 2) continue;
    const flow = flows.byRelation[occurrence.relation];
    const bundle = result.flowBundles?.find((entry) => entry.carrier === occurrence.id);
    // Preserve both flow presentation and ERD endpoint markers.
    const semantic = input.document.relations[occurrence.relation];
    let markers: string | undefined;
    if (semantic?.profile === 'erd@1') {
      const first = points[0]!, second = points[1]!, last = points[points.length-1]!, before = points[points.length-2]!;
      markers = renderErdMarkerSvg(erdText(semantic.attributes,'fromCardinality') as ErdCardinality, first, {x:second.x-first.x,y:second.y-first.y}) + renderErdMarkerSvg(erdText(semantic.attributes,'toCardinality') as ErdCardinality,last,{x:before.x-last.x,y:before.y-last.y});
    }
    edges.push({ ...(markers === undefined ? {} : { markers }), occurrence: occurrence.id, points, directed: flow !== undefined, arrows: result.arrowBoxes?.[occurrence.id] ?? [], ...(flow === undefined ? {} : { flow }), ...(bundle === undefined ? {} : { bundle }) });
    if (result.labelBoxes !== undefined && result.labelBoxes[id] === undefined) continue;
    const label = result.edgeBundles?.[id]?.label ?? (semantic?.profile === 'erd@1'
      ? ['fromRole','toRole'].map(role => erdText(semantic.attributes,role)).filter(Boolean).join(' / ') || edgeLabelOf(input.document, occurrence.relation)
      : edgeLabelOf(input.document, occurrence.relation));
    if (label === undefined) continue;
    const layout = measuredLabels.get(id) ?? input.measureLines({
      text: label,
      role: "edge-label",
      availableWidth: EDGE_LABEL_ALLOCATION,
      allocatedLines: DEFAULT_ALLOCATED_LINES["edge-label"],
      folded: false,
    });
    const lines = semantic?.profile === 'erd@1' ? wrapErdText(label, ERD_GEOMETRY.labelWidth, input.measureLines) : layout.lines;
    labelLines.set(id, lines);
    entries.push({ id, route: points, size: semantic?.profile === 'erd@1' ? { width: ERD_GEOMETRY.labelWidth, height: lines.length * ERD_GEOMETRY.lineHeight } : { width: layout.width, height: layout.height } });
  }
  const margin = input.metrics?.labelMargin ?? DEFAULT_LAYOUT_METRICS.labelMargin;
  const labels: SceneLabelModel[] = [];
  let bounds: Rect | undefined;
  for (const item of items) {
    const box = item.kind === "edge" ? item.bounds : item.rect;
    bounds = bounds === undefined ? box : rectUnion(bounds, box);
  }
  const erd = input.document.profileRefs.length === 1 && input.document.profileRefs[0] === 'erd@1';
  const placements = erd ? placeErdRoleLabels(entries, blockers, margin) : result.labelBoxes === undefined
    ? placeEdgeLabels(entries, blockers, margin)
    : new Map(Object.entries(result.labelBoxes).map(([id, box]) => [id, { box }]));
  for (const [id, placement] of placements) {
    if (placement === undefined) continue;
    labels.push({ occurrence: id as SceneOccurrenceRef, lines: labelLines.get(id) ?? [], box: placement.box, ...(erd ? { erd: true } : {}), ...("leader" in placement ? { leader: placement.leader as readonly Vec2[] } : {}),
      ...(result.edgeBundles?.[id] === undefined ? {} : { title: result.edgeBundles[id]!.title }),
      ...(result.edgeBundles?.[id]?.relations === undefined ? {} : { bundle: result.edgeBundles[id]!.chip ?? measureBundleLabel(result.edgeBundles[id]!.relations!, input.measureLines, input.metrics?.bundleLabelMaxWidth) }) });
  }

  const badges: SceneBadgeModel[] = [];
  for (const step of flows.scenarios.flatMap((scenario) => scenario.steps)) {
    const target = flowTargets[step.relation];
    if (target === undefined || target.kind === "internal" || !target.badge || badges.some((badge) => badge.occurrence === target.occurrence)) continue;
    const box = result.badgeBoxes?.[target.occurrence];
    if (box === undefined) continue;
    const bundle = result.flowBundles?.find((entry) => entry.id === (target.kind === "bundle" ? target.id : ""));
    const text = bundle === undefined ? step.badge : (input.flows?.countTemplate ?? "{n}").replaceAll("{n}",String(bundle.members.length));
    badges.push({ id: target.occurrence, occurrence: target.occurrence, kind: bundle === undefined ? "step" : "count", text, box, target: target.kind === "bundle" ? { kind: "bundle", id: target.id } : { kind: "edge", occurrence: target.occurrence } });
    bounds = bounds === undefined ? box : rectUnion(bounds,box);
  }
  for (const arrows of Object.values(result.arrowBoxes ?? {})) for (const arrow of arrows) bounds = bounds === undefined ? arrow.box : rectUnion(bounds,arrow.box);
  // Non-scaling connector paint is widest in world units at the readability
  // floor. Reserve it as well as the label-padding token supplied by hosts.
  const clearedLabels = clearSceneLabels(labels, edges.map(edge => edge.points),
    [...blockers, ...badges.map(badge => badge.box), ...edges.flatMap(edge => edge.arrows.map(arrow => arrow.box))],
    margin + ZONE_GEOMETRY.borderWidth / (2 * DEFAULT_MIN_READABLE_SCALE));
  for (const { box } of clearedLabels) {
    const padded = { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin };
    bounds = bounds === undefined ? padded : rectUnion(bounds, padded);
  }
  if (bounds !== undefined) {
    const x = Math.floor(bounds.x * 64) / 64, y = Math.floor(bounds.y * 64) / 64;
    bounds = { x, y, width: Math.ceil((bounds.x + bounds.width) * 64) / 64 - x, height: Math.ceil((bounds.y + bounds.height) * 64) / 64 - y };
  }
  const nodeTargets = nodes.filter((node) => Object.values(flowEnds).some((ends) => ends.some((id) => id === node.occurrence || (flowAncestors[id] ?? []).includes(node.occurrence)))).map((node) => ({ occurrence: node.occurrence, entity: node.entity, anchor: { x: node.rect.x, y: node.rect.y } }));
  return {
    badges, flows, flowTargets, nodeTargets, flowEnds, flowRepresentatives, flowAncestors,
    flowSummaryLabels: Object.fromEntries(Object.entries(view.summaryLabels ?? {}).map(([id,definition]) => [id,definition.label])),
    contentSize: sceneContentSize(result),
    nodes,
    edges,
    labels: clearedLabels,
    ...(bounds === undefined ? {} : { bounds }),
    orientations: result.orientations ?? {},
  };
}

/** Full presentation text retained alongside the textual relations (A14). */
export function sceneTextRows(scene: SceneModel, document: SceneDocument): readonly string[] {
  const rows = scene.nodes.map(node => Object.values(node.presentation?.text ?? {}).filter(Boolean).join(" · "));
  for (const relation of Object.values(document.relations)) {
    const names = relation.endpoints.map(end => { const value = document.entities[end.target]?.attributes["name"]; return value?.kind === "text" ? String(value.value) : end.target; });
    rows.push(names.join(" → ") + " · " + (edgeLabelOf(document, relation.id) ?? relation.type));
  }
  return rows;
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
  const contentWidth = bounds.width * zoom + 2 * FIT_PAINT_INSET;
  const contentHeight = bounds.height * zoom + 2 * FIT_PAINT_INSET;
  // Half a CSS px of tolerance: a fit computed by division must not scroll.
  const overflowX = contentWidth > fit.fitWidth + 0.5;
  const overflowY = contentHeight > fit.fitHeight + 0.5;
  const startX = overflowX ? FIT_PAINT_INSET : (fit.fitWidth - bounds.width * zoom) / 2;
  const startY = overflowY ? FIT_PAINT_INSET : (fit.fitHeight - bounds.height * zoom) / 2;
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

export type { DiagramSceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera } from "./diagramSceneTypes.js";
