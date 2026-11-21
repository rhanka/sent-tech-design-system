import { relationBaseType } from "@sentropic/diagram-core";
import { validateFlows } from "@sentropic/diagram-core";
import { relationVerdict } from "../visibility.js";
import { DEFAULT_FLOW_TOKENS, planFlows, placeFlowMarks } from "./flows.js";
import { layoutErd } from "./erd.js";
import { DEFAULT_EDGE_LABEL_SIZE, DEFAULT_MIN_READABLE_SCALE } from "../camera.js";
import { isR7ConnectorPresentation } from "../r7Mode.js";
/**
 * Measured diagram layout (M3 §4.6–§4.8, layout half of §5.6; placement by
 * SPEC_EVOL_DC2A §3–§4).
 *
 * One `layoutMeasured` / `layoutFolded` call performs, in order: resolve,
 * size bottom-up (shelf packing toward the target aspect at every level, the
 * root included), header measurement, seating, body and label measurement,
 * dock and route, label placement, emit with measurements. Folding is
 * fold→measure→place→route from the retained source through the M1-c
 * projection (`collapsedOf`); never incremental.
 *
 * Placement is row-pack for every measured view (AC-1): each level is packed
 * by `pack.ts` toward `rowPack.targetAspect` (16:9 by default), its
 * orientation derived from the fold state, its sibling gaps the DS token gaps
 * capped on both axes. A gutter is wider than its base gap only where a
 * placed label sits in it (§3.5, BF-6): pass 1 packs at the base gaps and
 * freezes the shelves, later passes widen or release gutters without ever
 * re-wrapping a shelf.
 *
 * Fixed footprints (§4.6.1/§4.6.5) are never enlarged, for docking or any
 * other reason. Overflow (§4.6.4) keeps every character and reports
 * `card-overflow` / `zone-overflow`; docks beyond a side's capacity keep the
 * box, fit in declared order and route the rest from the nearest free anchor
 * with one `docking-overflow` per occurrence. No slot is ever truncated,
 * clipped or ellipsised.
 */
import {
  collapsedOf,
  createTypeResolver,
  foldGroupId,
  GENERIC_PROFILE_ID,
  hasErrors,
  isArrowheadKind,
  isLinkEmphasis,
  isPresentationContractV2Pin,
  isStrokeStyle,
  localIdOf,
  occurrenceRef,
  parentOccurrenceOf,
  projectView,
  resolveArrowhead,
  resolveDashPattern,
  resolveLinkEmphasis,
  validateDocument,
  validateView,
  viewRef,
  type DiagramForm,
  type DiagramPresentation,
  type EntityOccurrence,
  type EntityRef,
  type OccurrenceRef,
  type PortOccurrence,
  type PortRef,
  type PortSide,
  type ProfileRegistry,
  type RelationOccurrence,
  type RelationPresentation,
  type RelationRef,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import { dockEdges, sideToward, type Dock, type EdgeDocks } from "./dock.js";
import { isAncestor, type LayoutEdge, type LayoutGraph, type LayoutNode } from "./graph.js";
import {
  effectiveStretch,
  groupLeaves,
  isLayoutGroup,
  resolveGaps,
  resolveOrder,
  resolveRowGaps,
  validateHints,
  type LayoutGroup,
  type LayoutHints,
} from "./hints.js";
import { measureSceneBox } from "./sceneMeasure.js";
import { anatomyCardGeometry, anatomyZoneGeometry, ZONE_GEOMETRY, zoneDepthSurface, type DiagramAnatomy } from "../presentation/diagramCardModel.js";
import { placePackedLabel } from "./labels.js";
import {
  CONTENT_INSET,
  DEFAULT_ALLOCATED_LINES,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  headerAvailableWidth,
  headerOverflows,
  innerWidthOf,
  LEGEND_KEY_HEIGHT,
  measureHeader,
  scaleEdgeLabelMeasurer,
  SWATCH_ALLOCATION,
  TOGGLE_ALLOCATION,
  UNWRAPPED_PROBE_WIDTH,
  type EntityMeasurementInput,
  type HeaderMeasurement,
  type LayoutMeasurements,
  type LineLayout,
  type LineMeasurer,
  type MeasurementOverflow,
  type MeasureRequest,
  type SlotMeasurement,
} from "./measure.js";
import { measureBundleLabel } from "./bundleLabel.js";
import { channelCapacity, channelGap, channelMetrics, type LayoutChannel } from "./channels.js";
import { chooseOrientation, packColumns, packRows, seatShelves, type PackBox } from "./pack.js";
import { labelDetour, routeEdges, routesConflict } from "./route.js";
import {
  checkRouteSpacing,
  DEFAULT_ROUTE_BORDER_CLEARANCE,
  DEFAULT_ROUTE_SPACING,
  segmentToPassableBorderDistance,
  segmentToRectDistance,
  type CheckedRoute,
} from "./routeSpacing.js";
import { lintDiagramConventions, type ArrowDirectionEdgeInput, type ZoneTagLintEntry } from "./conventions.js";
import { rectsIntersect } from "../geometry.js";
import type { Rect, Vec2 } from "../transform.js";
import { evaluateVisibility } from "../visibility.js";
import {
  DEFAULT_LAYOUT_METRICS,
  MIN_ZOOM,
  PHONE_MAX_WIDTH,
  resolveRowPack,
  ROOT_LEVEL_KEY,
  validateRowPack,
  type LayoutMetrics,
  type LayoutOptions,
  type LayoutRefusal,
  type LayoutResult,
  type LayoutWarning,
  type LevelOrientation,
  type TextRole,
} from "./types.js";

/** Classification of one occurrence (M3 §4.6.3 step 1). */
type OccurrenceKind =
  | "leaf"
  | "container-collapsed"
  | "container-expanded"
  | "legend-collapsed"
  | "legend-expanded"
  | "legend-key";

/** Edge-label wrapping width: the label allocation of §4.6.3 step 5. */
const EDGE_LABEL_WIDTH = 400;

/** One end of a drawn relation, resolved from its projected endpoint occurrence. */
type DrawnEnd = { readonly entity: EntityRef; readonly port?: PortRef };

/**
 * A relation occurrence the projected view draws, with both ends resolved to
 * visible entity or port occurrences. Docking, routing and emission key every
 * record by the relation OCCURRENCE id (cast once where the shared dock and
 * route modules type it as a relation id; both treat it opaquely), never by
 * the semantic relation id, so authored occurrence identities survive.
 */
type DrawnEdge = {
  readonly occurrence: OccurrenceRef;
  readonly relation: RelationRef;
  readonly source: DrawnEnd;
  readonly target: DrawnEnd;
};

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

function semanticName(document: SemanticDocument, entity: EntityRef): string {
  const attributes = document.entities[entity]?.attributes as
    | Record<string, { readonly kind?: unknown; readonly value?: unknown }>
    | undefined;
  const name = attributes?.["name"];
  return name !== undefined && name.kind === "text" && typeof name.value === "string" ? name.value : "";
}

function formOf(presentation: DiagramPresentation, occurrence: OccurrenceRef): DiagramForm | undefined {
  return (presentation.entities as Record<string, { form: DiagramForm }>)[occurrence]?.form;
}

/**
 * Strip transient canvas-only stamps (`anatomy`, `depth`, `depthParityStart`,
 * and `align` under `@1`) before persisting `presentation.diagram` on the
 * emitted `ViewDocument`, so every laid-out view passes `validateView`.
 */
function persistableDiagramPresentation(
  presentation: DiagramPresentation & { readonly relations?: Readonly<Record<string, RelationPresentation>> },
): DiagramPresentation {
  const allowsAlign =
    presentation.contractPin !== undefined &&
    isPresentationContractV2Pin(presentation.contractPin);
  const entities: Record<string, DiagramPresentation["entities"][string]> = {};
  for (const [key, entry] of Object.entries(presentation.entities)) {
    const record = entry as unknown as Record<string, unknown>;
    const cleanEntry: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(record)) {
      if (field === "anatomy" || field === "depth" || field === "depthParityStart") continue;
      if (field === "align" && !allowsAlign) continue;
      cleanEntry[field] = value;
    }
    entities[key] = cleanEntry as unknown as DiagramPresentation["entities"][string];
  }
  const { relations: _transientRelations, ...base } = presentation;
  void _transientRelations;
  return { ...base, entities };
}

function relationPresentationFor(
  relations: Readonly<Record<string, RelationPresentation>> | undefined,
  occurrence: OccurrenceRef,
  relation: RelationRef,
): RelationPresentation | undefined {
  if (relations === undefined) return undefined;
  return relations[occurrence] ?? relations[relation];
}

const ALLOWED_RELATION_OCCURRENCE_FIELDS = new Set([
  "id",
  "relation",
  "endpoints",
  "waypoints",
  "strokeStyle",
  "arrowhead",
  "emphasis",
]);

function validateRelationPresentations(
  relations: Readonly<Record<string, RelationPresentation>> | undefined,
  contractPin: DiagramPresentation["contractPin"] | undefined,
  sourceView: ViewDocument | undefined,
): LayoutRefusal[] {
  const refusals: LayoutRefusal[] = [];
  const isV2 = contractPin !== undefined && isPresentationContractV2Pin(contractPin);
  const isFrozenV1 = contractPin !== undefined && !isV2;

  if (relations !== undefined) {
    const keys = Object.keys(relations).sort(byString);
    if (isFrozenV1 && keys.length > 0) {
      for (const key of keys) {
        refusals.push({
          code: "document-invalid",
          path: `presentation.relations.${key}`,
          message: "presentation.relations requires diagram-presentation@2; frozen diagram-presentation@1 cannot persist DE-2 connector styles",
        });
      }
    }
    for (const key of keys) {
      const entry = relations[key] as unknown as Record<string, unknown> | undefined;
      if (entry === undefined) continue;
      for (const field of Object.keys(entry).sort(byString)) {
        if (field !== "strokeStyle" && field !== "arrowhead" && field !== "emphasis") {
          refusals.push({
            code: "document-invalid",
            path: `presentation.relations.${key}.${field}`,
            message: `unknown connector presentation field ${field}; select connectors by closed registry words only`,
          });
        }
      }
      if (entry["strokeStyle"] !== undefined && !isStrokeStyle(entry["strokeStyle"])) {
        refusals.push({
          code: "document-invalid",
          path: `presentation.relations.${key}.strokeStyle`,
          message: `strokeStyle ${String(entry["strokeStyle"])} is not a closed dash-pattern registry word`,
        });
      }
      if (entry["arrowhead"] !== undefined && !isArrowheadKind(entry["arrowhead"])) {
        refusals.push({
          code: "document-invalid",
          path: `presentation.relations.${key}.arrowhead`,
          message: `arrowhead ${String(entry["arrowhead"])} is not a closed arrowhead registry word`,
        });
      }
      if (entry["emphasis"] !== undefined && !isLinkEmphasis(entry["emphasis"])) {
        refusals.push({
          code: "document-invalid",
          path: `presentation.relations.${key}.emphasis`,
          message: `emphasis ${String(entry["emphasis"])} is not a closed link-emphasis registry word`,
        });
      }
    }
  }

  if (sourceView !== undefined) {
    for (const key of Object.keys(sourceView.relationOccurrences).sort(byString)) {
      const occurrence = sourceView.relationOccurrences[key] as unknown as Record<string, unknown> | undefined;
      if (occurrence === undefined) continue;
      for (const field of Object.keys(occurrence).sort(byString)) {
        if (!ALLOWED_RELATION_OCCURRENCE_FIELDS.has(field)) {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.${field}`,
            message: `unknown connector occurrence field ${field}; select connectors by closed registry words only`,
          });
        }
      }
      const strokeStyle = occurrence["strokeStyle"];
      if (strokeStyle !== undefined) {
        if (!isStrokeStyle(strokeStyle)) {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.strokeStyle`,
            message: `strokeStyle ${String(strokeStyle)} is not a closed dash-pattern registry word`,
          });
        } else if (isFrozenV1 && strokeStyle === "dotted") {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.strokeStyle`,
            message: "strokeStyle dotted requires diagram-presentation@2 under view validation",
          });
        }
      }
      const arrowhead = occurrence["arrowhead"];
      if (arrowhead !== undefined) {
        if (!isArrowheadKind(arrowhead)) {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.arrowhead`,
            message: `arrowhead ${String(arrowhead)} is not a closed arrowhead registry word`,
          });
        } else if (isFrozenV1) {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.arrowhead`,
            message: "arrowhead requires diagram-presentation@2 under view validation",
          });
        }
      }
      const emphasis = occurrence["emphasis"];
      if (emphasis !== undefined) {
        if (!isLinkEmphasis(emphasis)) {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.emphasis`,
            message: `emphasis ${String(emphasis)} is not a closed link-emphasis registry word`,
          });
        } else if (isFrozenV1) {
          refusals.push({
            code: "document-invalid",
            path: `sourceView.relationOccurrences.${key}.emphasis`,
            message: "emphasis requires diagram-presentation@2 under view validation",
          });
        }
      }
    }
  }
  return refusals;
}

/** Slot text for one occurrence: typed presentation slots, else the semantic name as title. */
function slotTexts(
  document: SemanticDocument,
  presentation: DiagramPresentation,
  occurrence: OccurrenceRef,
  entity: EntityRef,
): Partial<Record<TextRole, string>> {
  const text = (presentation.entities as Record<string, { text: Partial<Record<TextRole, string>> }>)[occurrence]
    ?.text;
  const slots: Partial<Record<TextRole, string>> = {};
  if (text?.kicker !== undefined) slots.kicker = text.kicker;
  const title = text?.title ?? semanticName(document, entity);
  if (title !== "") slots.title = title;
  if (text?.body !== undefined) slots.body = text.body;
  if (text?.detail !== undefined) slots.detail = text.detail;
  if (text?.subtitle !== undefined) slots.subtitle = text.subtitle;
  if (text?.footer !== undefined) slots.footer = text.footer;
  return slots;
}

function edgeLabelOf(document: SemanticDocument, id: RelationRef): string | undefined {
  const attributes = document.relations[id]?.attributes as
    | Record<string, { readonly kind?: unknown; readonly value?: unknown }>
    | undefined;
  const label = attributes?.["label"];
  if (label !== undefined && label.kind === "text" && typeof label.value === "string" && label.value !== "") {
    return label.value;
  }
  return undefined;
}

/** Compatibility adapter: one shared line per legacy measurement. */
function stripProjections(sourceView: ViewDocument): ViewDocument {
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  for (const [key, occurrence] of Object.entries(sourceView.relationOccurrences)) {
    relationOccurrences[key] = {
      ...occurrence,
      endpoints: occurrence.endpoints.map((endpoint) =>
        endpoint.sourceOccurrence === undefined
          ? { role: endpoint.role, occurrence: endpoint.occurrence }
          : { role: endpoint.role, occurrence: endpoint.sourceOccurrence },
      ),
    };
  }
  return { ...sourceView, relationOccurrences };
}

function stampFoldGroups(
  sourceView: ViewDocument | undefined,
  collapsed: ReadonlySet<OccurrenceRef>,
): Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }> {
  const groups: Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }> = {};
  if (sourceView !== undefined) {
    for (const [key, group] of Object.entries(sourceView.groups)) {
      const typed = group as { id: string; occurrence?: OccurrenceRef; collapsed?: boolean };
      if (typed.occurrence === undefined) {
        groups[key] = { id: typed.id, occurrence: undefined as never };
        continue;
      }
      if (collapsed.has(typed.occurrence)) {
        groups[key] = { id: typed.id, occurrence: typed.occurrence, collapsed: true };
        continue;
      }
      if (typed.collapsed === undefined) {
        const { collapsed: _absent, ...rest } = typed as { collapsed?: boolean; id: string; occurrence: OccurrenceRef };
        void _absent;
        groups[key] = rest as { id: string; occurrence: OccurrenceRef };
        continue;
      }
      groups[key] = { id: typed.id, occurrence: typed.occurrence, collapsed: false };
    }
  }
  for (const id of collapsed) {
    const bound = Object.keys(groups).find((key) => groups[key]?.occurrence === id);
    if (bound !== undefined) continue;
    const raw = id as string;
    const local = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1) : raw;
    const generated = `grp.${local.length}.${local}`;
    if (groups[generated] !== undefined) continue;
    groups[generated] = { id: generated, occurrence: id, collapsed: true };
  }
  return groups as Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }>;
}

const clean = (value: number): number => (value === 0 ? 0 : value);

/** Rounds of the header/width fixed point: widths settle in one or two. */
const HEADER_ROUNDS = 6;
/** Two gutters of one slot index form one lane when their starts differ by less than this, px. */
const LANE_TOLERANCE = 0.5;
/** Lanes offered to routes on each side outside the drawing, at most. */
const OUTER_LANES = 6;
/** MAJ-1: at most one widening round after pass 1 (BF-6); afterwards the set only shrinks. */
const WIDEN_ROUNDS = 1;

export function layoutMeasured(
  document: SemanticDocument,
  options: LayoutOptions,
  sourceView?: ViewDocument,
): LayoutResult {
  if (document.profileRefs.length === 1 && document.profileRefs[0] === "erd@1") return layoutErd(document, options, sourceView);
  const first = layoutMeasuredPass(document, options, sourceView, new Set());
  if (first.status !== "laid-out" || first.flowTargets === undefined) return first;
  const forced = new Set<string>();
  const failed = new Set(first.warnings.filter((w) => w.code === "route-obstructed" || w.code === "badge-unplaced").flatMap((w) => w.refs));
  const plan = planFlows(document, first.view, options.registry, options, new Set());
  for (const [key, members] of plan.groups) {
    if (members.length >= 2 && !first.flowBundles?.some((b) => b.id === key) && members.some((m) => failed.has(m.occurrence))) forced.add(key);
  }
  if (forced.size === 0) return first;
  const repaired = layoutMeasuredPass(document, options, sourceView, forced);
  return repaired.status === "laid-out" ? { ...repaired, flowRepairPasses: 1 } : repaired;
}

function layoutMeasuredPass(document: SemanticDocument, options: LayoutOptions, sourceView: ViewDocument | undefined, forced: ReadonlySet<string>): LayoutResult {
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
  if (sourceView !== undefined && Object.values(sourceView.entityOccurrences).some((occurrence) => document.entities[occurrence.entity]?.type === "flow-scenario")) return { status: "refused", refusals: [{ code: "document-invalid", path: "sourceView.entityOccurrences", message: "flow scenarios have no view occurrence" }], diagnostics: [] };
  const presentation = options.presentation;
  if (presentation === undefined) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "presentation", message: "measured layout needs presentation.diagram" }],
      diagnostics: [],
    };
  }
  const relationStyleRefusals = validateRelationPresentations(
    presentation.relations,
    presentation.contractPin,
    sourceView,
  );
  if (relationStyleRefusals.length > 0) {
    return { status: "refused", refusals: relationStyleRefusals, diagnostics: [] };
  }
  /**
   * Per-occurrence pinned anatomy (DE-1): the presentation entry selects
   * `diagram-anatomy/v1 | v2`, falling back to `sourceView.presentation.anatomy`;
   * absent everywhere means `"v1"` so existing views keep the frozen `460 × 200`
   * footprint by construction.
   */
  const viewAnatomy = (sourceView?.presentation as { readonly anatomy?: DiagramAnatomy } | undefined)?.anatomy;
  const occurrenceAnatomy = (occurrence: OccurrenceRef): DiagramAnatomy =>
    (presentation.entities as Record<string, { readonly anatomy?: DiagramAnatomy }>)[occurrence]?.anatomy ?? viewAnatomy ?? "v1";
  const cardWidthOf = (occurrence: OccurrenceRef): number => anatomyCardGeometry(occurrenceAnatomy(occurrence)).width;
  if (options.measureLines === undefined) {
    return {
      status: "refused",
      refusals: [
        {
          code: "measure-lines-missing",
          path: "measureLines",
          message: "measured layout needs an injected LineMeasurer through options.measureLines",
        },
      ],
      diagnostics: [],
    };
  }
  const measure = options.measureLines;
  const sceneBoxCache = new Map<string, ReturnType<typeof measureSceneBox>>();
  const sceneBoxAt = (id: OccurrenceRef, width: number, collapsed: boolean) => {
    const key = `${id}|${width}|${collapsed}`;
    let box = sceneBoxCache.get(key);
    if (box === undefined) {
      const rawEntry = presentation.entities[id];
      const entry = rawEntry === undefined ? undefined
        : rawEntry.anatomy === undefined && viewAnatomy !== undefined ? { ...rawEntry, anatomy: viewAnatomy } : rawEntry;
      const kind = kinds.get(projected.entityOccurrences[id]?.entity!);
      const expanded = kind === "container-expanded" || kind === "legend-expanded";
      box = measureSceneBox(expanded && entry?.form === "card" ? { ...entry, form: "container" } : entry,
        id, width, collapsed, measure, metrics.containerPadding);
      sceneBoxCache.set(key, box);
    }
    return box;
  };
  const validationOptions =
    options.bindings === undefined ? { registry: options.registry } : { registry: options.registry, bindings: options.bindings };
  const diagnostics = [...validateDocument(document, validationOptions), ...validateFlows(document)];
  if (hasErrors(diagnostics)) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "document", message: "diagram-core refuses this document" }],
      diagnostics,
    };
  }
  const read = readMeasuredGraph(document, options.registry);
  if ("refusals" in read) return { status: "refused", refusals: read.refusals, diagnostics: [] };
  const graph = read.graph;
  const r7Routing = isR7ConnectorPresentation(presentation, sourceView, document);
  const routeSpacing = r7Routing ? (options.metrics?.routeSpacing ?? DEFAULT_ROUTE_SPACING) : 0;
  const borderClearance = r7Routing
    ? (options.metrics?.routeBorderClearance ?? DEFAULT_ROUTE_BORDER_CLEARANCE)
    : (options.metrics?.clearance ?? DEFAULT_LAYOUT_METRICS.clearance);
  const dockCornerInset = routeSpacing > 0 ? Math.ceil(routeSpacing / Math.SQRT2) : 0;
  const baseSlotSpacing = options.metrics?.trackSpacing ?? channelMetrics({}, true).trackSpacing;
  const metrics: LayoutMetrics = {
    ...DEFAULT_LAYOUT_METRICS,
    ...options.metrics,
    routeSpacing,
    routeBorderClearance: borderClearance,
    slotSpacing:
      options.metrics?.slotSpacing ??
      (r7Routing ? Math.max(routeSpacing, baseSlotSpacing) : baseSlotSpacing),
  };
  const hints: LayoutHints = options.hints ?? {};
  const gaps = resolveGaps(options.hints, metrics);
  const globalStretch = hints.stretch ?? false;
  // DC-2a row-pack (SPEC_EVOL_DC2A §3–§4, AC-1): every measured view is
  // packed; `options.rowPack` only tunes the objective.
  const rowPack = resolveRowPack(options.rowPack);
  const contentInset = metrics.containerPadding;
  const rowGaps = resolveRowGaps(hints, metrics, r7Routing);
  {
    const refusals: LayoutRefusal[] = [...validateRowPack(rowPack)];
    // §3.7: a sibling-gap override above the axis cap refuses; it is never silently capped.
    const refuseGap = (path: string, name: string, value: number, cap: number): void => {
      if (Number.isFinite(value) && value >= 0 && value <= cap) return;
      refusals.push({
        code: "layout-hint-invalid",
        path,
        message: `the sibling gap ${name} is within [0, ${String(cap)}] (axis cap), got ${String(value)}`,
      });
    };
    refuseGap("hints.cardGapX", "cardGapX", rowGaps.cardX, rowGaps.maxX);
    refuseGap("hints.zoneGapX", "zoneGapX", hints.zoneGapX ?? rowGaps.zoneX, rowGaps.maxX);
    refuseGap("hints.cardGapY", "cardGapY", rowGaps.cardY, rowGaps.maxY);
    refuseGap("hints.zoneGapY", "zoneGapY", hints.zoneGapY ?? rowGaps.zoneY, rowGaps.maxY);
    // A group's `gapAfter` lands on whichever axis its level packs along: it is held to both caps.
    const visitGap = (group: LayoutGroup, path: string): void => {
      if (group.gapAfter !== undefined) {
        refuseGap(`${path}.gapAfter`, `gapAfter of group ${group.id}`, group.gapAfter, Math.min(rowGaps.maxX, rowGaps.maxY));
      }
      for (const item of group.items) if (isLayoutGroup(item)) visitGap(item, `${path}.items.${item.id}`);
    };
    for (const group of hints.grouping ?? []) visitGap(group, `hints.grouping.${group.id}`);
    if (refusals.length > 0) return { status: "refused", refusals, diagnostics: [] };
  }

  // Step 1 — resolve: the measured path never rebuilds occurrences or
  // endpoints. It takes the M1-c projectView output as the authority for
  // occurrence records, identities, group membership, styles, titles,
  // filters, exclusions and endpoint provenance, and only assigns geometry
  // to the visible projected occurrences. Every transition recomputes from
  // the retained source.
  const occurrenceOf = (entity: EntityRef): OccurrenceRef => occurrenceRef(`e.${localIdOf(entity)}`);
  const collapsedOccurrences =
    options.collapsed !== undefined
      ? new Set<OccurrenceRef>(options.collapsed)
      : sourceView !== undefined
        ? new Set<OccurrenceRef>([...collapsedOf(sourceView)] as OccurrenceRef[])
        : new Set<OccurrenceRef>();
  const synthesizeRetained = (): ViewDocument => {
    // Memberships mirror the semantic containment tree, with the M1-c fold
    // group ids, so the projection can fold the synthesized view: without
    // them every member would stay visible under any collapse. A fold
    // binding is only declared over a container-family parent, which is
    // what diagram-core validates; any other parent keeps the baseline
    // drawing with no membership, and the projection leaves it unfolded.
    const foldResolver = createTypeResolver(document);
    const bindsFoldGroup = (parent: EntityRef): boolean => {
      const entity = document.entities[parent];
      const profile = entity === undefined ? undefined : options.registry.get(entity.profile as never);
      if (entity === undefined || profile === undefined) return false;
      const resolution = foldResolver.resolve(profile, entity.type);
      return resolution.ok && resolution.resolved.container;
    };
    const entityOccurrences: Record<string, EntityOccurrence> = {};
    const synthesizedGroups: Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }> = {};
    for (const id of graph.nodes.keys()) {
      const occurrence = occurrenceOf(id);
      const parent = graph.nodes.get(id)?.parent;
      const group = parent === undefined || !bindsFoldGroup(parent) ? undefined : foldGroupId(occurrenceOf(parent));
      entityOccurrences[occurrence] = {
        id: occurrence,
        entity: id,
        ...(group === undefined ? {} : { group }),
        geometry: { x: 0, y: 0, width: FIXED_CARD_WIDTH, height: 200 },
      };
      if (group !== undefined) {
        const parentOccurrence = occurrenceOf(parent as EntityRef);
        synthesizedGroups[group] ??= { id: group, occurrence: parentOccurrence };
      }
    }
    const portOccurrences: Record<string, PortOccurrence> = {};
    const coded = (value: string): string => `${value.length}.${value}`;
    for (const portId of Object.keys(document.ports ?? {}).sort(byString)) {
      const port = (document.ports as Record<string, { owner?: EntityRef }>)[portId];
      const owner = (port as { owner?: EntityRef })?.owner;
      if (owner === undefined || !graph.nodes.has(owner)) continue;
      const occurrence = occurrenceRef(`p.s.${coded(localIdOf(portId as PortRef))}`);
      portOccurrences[occurrence] = {
        id: occurrence,
        port: portId as PortRef,
        ownerOccurrence: occurrenceOf(owner),
        side: "south",
        order: 0,
        anchor: 0,
      };
    }
    const relationOccurrences: Record<string, RelationOccurrence> = {};
    for (const edge of graph.edges) {
      const occurrence = occurrenceRef(`r.${localIdOf(edge.id)}`);
      const sourceOccurrence =
        edge.source.port === undefined
          ? occurrenceOf(edge.source.entity)
          : occurrenceRef(`p.s.${coded(localIdOf(edge.source.port))}`);
      const targetOccurrence =
        edge.target.port === undefined
          ? occurrenceOf(edge.target.entity)
          : occurrenceRef(`p.s.${coded(localIdOf(edge.target.port))}`);
      const style = relationPresentationFor(presentation.relations, occurrence, edge.id);
      relationOccurrences[occurrence] = {
        id: occurrence,
        relation: edge.id,
        endpoints: [
          { role: "source", occurrence: sourceOccurrence },
          { role: "target", occurrence: targetOccurrence },
        ],
        ...(style?.strokeStyle === undefined ? {} : { strokeStyle: style.strokeStyle }),
        ...(style?.arrowhead === undefined ? {} : { arrowhead: style.arrowhead }),
        ...(style?.emphasis === undefined ? {} : { emphasis: style.emphasis }),
      };
    }
    return {
      viewId: options.viewId ?? viewRef("layout"),
      semanticDocumentId: document.documentId,
      revision: document.revision,
      entityOccurrences,
      relationOccurrences,
      portOccurrences,
      groups: synthesizedGroups,
      filters: [],
      presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram: persistableDiagramPresentation(presentation) },
    };
  };
  let projected: ViewDocument;
  if (sourceView !== undefined) {
    try {
      const stripped = stripProjections(sourceView);
      projected = projectView(document, stripped, [...collapsedOccurrences]);
    } catch {
      const stampedGroups = stampFoldGroups(sourceView, collapsedOccurrences) as ViewDocument["groups"];
      projected = { ...sourceView, groups: stampedGroups };
    }
  } else {
    const retained = synthesizeRetained();
    try {
      projected = projectView(document, retained, [...collapsedOccurrences]);
    } catch {
      projected = retained;
    }
  }
  const flowOccurrences = new Set<string>();
  for (const occurrence of Object.values(projected.relationOccurrences)) {
    if (document.relations[occurrence.relation]?.type !== "flow-step") continue;
    if (flowOccurrences.has(occurrence.relation)) return { status: "refused", refusals: [{ code: "document-invalid", path: "sourceView.relationOccurrences", message: "one flow step must have at most one occurrence per view" }], diagnostics: [] };
    flowOccurrences.add(occurrence.relation);
  }
  const flowPlan = planFlows(document, projected, options.registry, options, forced);
  const hasFlows = flowOccurrences.size > 0;
  const flowTokens = { ...DEFAULT_FLOW_TOKENS, ...options.flowTokens };
  const entityToOccurrences = new Map<EntityRef, OccurrenceRef[]>();
  for (const occurrence of Object.values(projected.entityOccurrences)) {
    const list = entityToOccurrences.get(occurrence.entity) ?? [];
    list.push(occurrence.id);
    entityToOccurrences.set(occurrence.entity, list);
  }
  for (const list of entityToOccurrences.values()) list.sort(byString);
  // The projected occurrence visibility is the authority for geometry: an
  // entity is drawn when the projected view shows at least one of its
  // occurrences, never because its semantic ancestors stay visible. The
  // representative prefers a visible occurrence so headers, slots and
  // warnings name a drawing the scene actually contains.
  const visibleOccurrences = evaluateVisibility({ document, view: projected }).visible;
  const visibleEntities = new Set<EntityRef>();
  for (const id of [...visibleOccurrences].sort(byString)) {
    const entity = projected.entityOccurrences[id]?.entity;
    if (entity !== undefined && graph.nodes.has(entity)) visibleEntities.add(entity);
  }
  const visible = (id: EntityRef): boolean => visibleEntities.has(id);
  const representativeOf = (entity: EntityRef): OccurrenceRef => {
    const list = entityToOccurrences.get(entity) ?? [];
    return (
      list.find((occurrence) => visibleOccurrences.has(occurrence)) ?? list[0] ?? occurrenceOf(entity)
    );
  };
  const foldMetadata: {
    groups: Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }>;
    filters: ViewDocument["filters"];
    presentationState: ViewDocument["presentation"];
    summaryLabels: ViewDocument["summaryLabels"];
    projected: ViewDocument;
    representativeOf: (entity: EntityRef) => OccurrenceRef;
  } = {
    groups: projected.groups as Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }>,
    filters: [...projected.filters],
    presentationState: { ...projected.presentation, diagram: persistableDiagramPresentation(presentation) },
    summaryLabels: projected.summaryLabels,
    projected,
    representativeOf,
  };
  // An entity draws collapsed when its projected representative occurrence is
  // folded; hidden members keep their leaf kind but never reach geometry.
  const isCollapsed = (id: EntityRef): boolean => collapsedOccurrences.has(representativeOf(id));
  const classify = (id: EntityRef): OccurrenceKind => {
    const node = graph.nodes.get(id)!;
    const form = formOf(presentation, representativeOf(id));
    if (form === "legend-key") return "legend-key";
    if (form === "legend") return isCollapsed(id) ? "legend-collapsed" : "legend-expanded";
    if (form === "container" || node.kind === "container") {
      return isCollapsed(id) ? "container-collapsed" : "container-expanded";
    }
    return "leaf";
  };
  const kinds = new Map<EntityRef, OccurrenceKind>();
  for (const id of graph.nodes.keys()) kinds.set(id, classify(id));

  const hintRefusals = validateHints(hints, {
    roots: new Set(graph.roots),
    parentOf: new Map([...graph.nodes.values()].map((node) => [node.id, node.parent] as const)),
  });
  if (hintRefusals.length > 0) return { status: "refused", refusals: hintRefusals, diagnostics: [] };

  const childOrder = (parent: EntityRef, children: readonly EntityRef[]): EntityRef[] => {
    const live = children.filter(visible);
    if (kinds.get(parent) === "legend-expanded") {
      const order = (presentation.legends as Record<string, { order: readonly EntityRef[] }>)[representativeOf(parent)]
        ?.order;
      return resolveOrder(live, order);
    }
    return resolveOrder(live, hints.ordering?.[parent]);
  };

  // Placement follows the projected visibility: a visible entity is laid out
  // inside its nearest visible expanded ancestor, while a visible entity
  // under a collapsed or hidden ancestor is lifted to the enclosing level.
  // For groupings that mirror the containment tree this is exactly the
  // semantic nesting; it only differs when an authored grouping does.
  const placementParentOf = (id: EntityRef): EntityRef | undefined => {
    let current = graph.nodes.get(id)?.parent;
    while (current !== undefined) {
      if (visible(current)) {
        const kind = kinds.get(current);
        if (kind === "container-expanded" || kind === "legend-expanded") return current;
      }
      current = graph.nodes.get(current)?.parent;
    }
    return undefined;
  };
  const placedChildrenOf = (id: EntityRef): EntityRef[] => {
    const kind = kinds.get(id);
    if (kind !== "container-expanded" && kind !== "legend-expanded") return [];
    return [...graph.nodes.keys()].filter((child) => visible(child) && placementParentOf(child) === id);
  };

  const groupEffectiveOf = (group: LayoutGroup, parentEffective: boolean): boolean =>
    effectiveStretch(group.stretch, parentEffective);

  /** Stretch context of one member: its innermost group, else the global flag. */
  const contextStretchOf = (member: EntityRef): boolean => {
    let bestEffective = globalStretch;
    let bestDepth = -1;
    const visit = (group: LayoutGroup, depth: number, parentEffective: boolean): void => {
      const effective = groupEffectiveOf(group, parentEffective);
      if (groupLeaves(group).includes(member) && depth > bestDepth) {
        bestEffective = effective;
        bestDepth = depth;
      }
      for (const item of group.items) if (isLayoutGroup(item)) visit(item, depth + 1, effective);
    };
    for (const group of hints.grouping ?? []) visit(group, 0, globalStretch);
    return bestDepth >= 0 ? bestEffective : globalStretch;
  };

  // Widths: (a) unwrapped header width at the toggle-reduced allocation,
  // (b) packed children plus insets, (c) stretch as an authored override.
  const unwrappedHeaderWidth = (id: EntityRef): number => {
    const slots = slotTexts(document, presentation, representativeOf(id), id);
    const width = headerAvailableWidth(UNWRAPPED_PROBE_WIDTH, true);
    let widest = 0;
    for (const role of ["kicker", "title"] as const) {
      const text = slots[role];
      if (text === undefined) continue;
      widest = Math.max(widest, measure({ text, role, availableWidth: width, allocatedLines: 1, folded: false }).width);
    }
    return widest;
  };
  const isStretchedBox = (id: EntityRef): boolean => {
    const kind = kinds.get(id);
    return kind === "container-expanded" || kind === "legend-expanded";
  };
  // §6.4: declaration order of the root level; unlisted roots follow in UTF-16 order.
  const rootOrder = resolveOrder(
    [...graph.nodes.keys()].filter((id) => visible(id) && placementParentOf(id) === undefined).sort(byString),
    hints.rootOrder,
  );
  const orderedChildren = new Map<EntityRef, EntityRef[]>();
  const orderedChildrenOf = (id: EntityRef): EntityRef[] => {
    let ordered = orderedChildren.get(id);
    if (ordered === undefined) {
      ordered = childOrder(id, placedChildrenOf(id));
      orderedChildren.set(id, ordered);
    }
    return ordered;
  };
  /** §4.1 level key: `root`, or the representative occurrence of the placement parent. */
  const levelKeyOf = (parent: EntityRef | undefined): string =>
    parent === undefined ? ROOT_LEVEL_KEY : representativeOf(parent);

  // DC-2a placement (§3.3): one packing function for the root and every
  // expanded zone. A level is a `Run` of boxes in reading order; authored
  // groups partition it into sub-runs, each packed on its own in its authored
  // direction (§3.7: `rows` = horizontal shelves, `columns` = vertical
  // shelves), the ungrouped siblings forming one more run.
  type RunItem =
    | { readonly entity: EntityRef }
    | { readonly run: Run; readonly gapAfter: number | undefined };
  interface Run {
    /** Orientation, shelf and gutter key: the level key, suffixed for a sub-run. */
    readonly key: string;
    readonly mode: "auto" | LevelOrientation;
    readonly items: readonly RunItem[];
    readonly stretch: boolean;
  }
  const buildGroupRun = (group: LayoutGroup, key: string, parentEffective: boolean): Run => {
    const stretch = effectiveStretch(group.stretch, parentEffective);
    const items: RunItem[] = [];
    for (const item of group.items) {
      if (isLayoutGroup(item)) {
        const run = buildGroupRun(item, `${key}/${item.id}`, stretch);
        if (run.items.length > 0) items.push({ run, gapAfter: item.gapAfter });
      } else if (visible(item)) {
        items.push({ entity: item });
      }
    }
    return { key, mode: group.direction, items, stretch };
  };
  const buildLevelRun = (parent: EntityRef | undefined, ordered: readonly EntityRef[]): Run => {
    const key = levelKeyOf(parent);
    const inherited = parent === undefined ? globalStretch : contextStretchOf(parent);
    const parts = groupsForLevel(ordered, hints);
    if (parts === undefined) return { key, mode: "auto", items: ordered.map((entity) => ({ entity })), stretch: inherited };
    const items: RunItem[] = parts.map((part) =>
      part.group === undefined
        ? {
            run: { key: `${key}#rest`, mode: "auto", items: part.members.map((entity) => ({ entity })), stretch: inherited },
            gapAfter: undefined,
          }
        : { run: buildGroupRun(part.group, `${key}#${part.group.id}`, globalStretch), gapAfter: part.group.gapAfter },
    );
    return { key, mode: "auto", items, stretch: false };
  };
  const itemHasZone = (item: RunItem): boolean =>
    "entity" in item ? kinds.get(item.entity) !== "leaf" : runHasZone(item.run);
  const runHasZone = (run: Run): boolean => run.items.some(itemHasZone);
  const shelfHasZone = (run: Run, shelf: readonly number[]): boolean =>
    shelf.some((slot) => itemHasZone(run.items[slot]!));

  // Drawn edges: the link occurrences the projected view draws. Internal
  // edges under a collapse are excluded by the same visibility; every
  // surviving edge carries its projected representative endpoints, and
  // geometry follows those endpoints, never the semantic ancestry.
  const resolveDrawnEnd = (occurrence: OccurrenceRef): DrawnEnd | undefined => {
    const entityOccurrence = projected.entityOccurrences[occurrence];
    if (entityOccurrence !== undefined && visibleOccurrences.has(occurrence)) {
      return { entity: entityOccurrence.entity };
    }
    const portOccurrence = projected.portOccurrences[occurrence];
    if (portOccurrence !== undefined && visibleOccurrences.has(occurrence)) {
      const owner = projected.entityOccurrences[portOccurrence.ownerOccurrence];
      if (owner === undefined || !visibleOccurrences.has(portOccurrence.ownerOccurrence)) return undefined;
      return { entity: owner.entity, port: portOccurrence.port };
    }
    return undefined;
  };
  const drawnEdges: DrawnEdge[] = [];
  for (const occurrence of Object.values(projected.relationOccurrences).sort((left, right) =>
    byString(left.id, right.id),
  )) {
    const semantic = document.relations[occurrence.relation];
    const owner = semantic === undefined ? undefined : options.registry.get(semantic.profile);
    if (semantic === undefined || owner === undefined || relationBaseType(document, owner, semantic) !== "link" || !relationVerdict(projected, semantic, document).visible) continue;
    const sourceEnd = occurrence.endpoints.find((endpoint) => endpoint.role === "source");
    const targetEnd = occurrence.endpoints.find((endpoint) => endpoint.role === "target");
    if (sourceEnd === undefined || targetEnd === undefined) continue;
    const source = resolveDrawnEnd(sourceEnd.occurrence);
    const target = resolveDrawnEnd(targetEnd.occurrence);
    if (source === undefined || target === undefined) continue;
    if (flowPlan.suppressed.has(occurrence.id)) continue;
    drawnEdges.push({ occurrence: occurrence.id, relation: occurrence.relation, source, target });
  }
  const edgeBundles: Record<string, { members: string[]; label: string; title: string; relations?: readonly string[]; chip?: ReturnType<typeof import("./bundleLabel.js").measureBundleLabel> }> = {};
  const liftedPairs = new Map<string, DrawnEdge[]>();
  for (const edge of drawnEdges) {
    // Numbered steps retain the flow planner's bundle carriers and targets.
    if (flowOccurrences.has(edge.relation)) continue;
    const projectedEdge = projected.relationOccurrences[edge.occurrence]!;
    if (!projectedEdge.endpoints.some(end => end.sourceOccurrence !== undefined)) continue;
    let key: string;
    if (r7Routing) {
      // Keep lifted cross-zone edges with distinct connector styles apart so
      // bundling never silently drops a strokeStyle, arrowhead, or emphasis from
      // the scene or its automatic link legend (REQ-R7-05 / REQ-R7-11 / REQ-R7-12).
      const relStyle = relationPresentationFor(presentation.relations, projectedEdge.id, projectedEdge.relation);
      const strokeStyle = resolveDashPattern(projectedEdge.strokeStyle ?? relStyle?.strokeStyle)?.style ?? "solid";
      const arrowhead = resolveArrowhead(projectedEdge.arrowhead ?? relStyle?.arrowhead)?.canonicalKind ?? "arrow";
      const emphasis = resolveLinkEmphasis(projectedEdge.emphasis ?? relStyle?.emphasis)?.emphasis ?? "default";
      key = JSON.stringify([edge.source.entity, edge.target.entity, strokeStyle, arrowhead, emphasis]);
    } else {
      // Legacy @1 path preserves main endpoint-pair bundling regardless of strokeStyle (REQ-R7-28).
      key = JSON.stringify([edge.source.entity, edge.target.entity]);
    }
    const pair = liftedPairs.get(key) ?? [];
    pair.push(edge);
    liftedPairs.set(key, pair);
  }
  const bundled = new Set<string>();
  for (const pair of liftedPairs.values()) {
    if (pair.length < 2) continue;
    const first = pair[0]!;
    edgeBundles[first.occurrence] = { members: pair.map(edge => edge.occurrence),
      label: `${pair.length} liaisons`,
      relations: pair.map(edge => edgeLabelOf(document, edge.relation)).filter((label): label is string => label !== undefined),
      title: pair.map(edge => edgeLabelOf(document, edge.relation)).filter((label): label is string => label !== undefined).join("\n") };
    pair.slice(1).forEach(edge => bundled.add(edge.occurrence));
  }
  for (let index = drawnEdges.length - 1; index >= 0; index -= 1) {
    if (bundled.has(drawnEdges[index]!.occurrence)) drawnEdges.splice(index, 1);
  }
  const portClaims = new Map<string, number>();
  if (hasFlows) for (const edge of drawnEdges) for (const end of projected.relationOccurrences[edge.occurrence]!.endpoints) {
    if (projected.portOccurrences[end.occurrence] !== undefined) portClaims.set(end.occurrence, (portClaims.get(end.occurrence) ?? 0) + 1);
  }
  const slotOf = (edge: DrawnEdge, role: string): string | undefined => {
    const occurrence = projected.relationOccurrences[edge.occurrence]!.endpoints.find((end) => end.role === role)?.occurrence;
    return occurrence !== undefined && (portClaims.get(occurrence) ?? 0) > 1 ? occurrence : undefined;
  };
  const flowRunRanks = new Map([...flowPlan.ranks].filter(([id]) => {
    const edge = drawnEdges.find((candidate) => candidate.occurrence === id);
    return edge !== undefined && slotOf(edge,"source") === undefined && slotOf(edge,"target") === undefined;
  }));
  const filteredGraph: LayoutGraph = {
    nodes: new Map([...graph.nodes].filter(([id]) => visible(id))),
    roots: graph.roots.filter(visible),
    edges: drawnEdges.map((edge) => ({
      ...(flowRunRanks.has(edge.occurrence) ? { flowRank: flowRunRanks.get(edge.occurrence)! } : {}),
      id: edge.occurrence as unknown as RelationRef,
      source:
        edge.source.port === undefined
          ? { entity: edge.source.entity }
          : { entity: edge.source.entity, port: edge.source.port, ...(slotOf(edge,"source") === undefined ? {} : { slot: slotOf(edge,"source")! }) },
      target:
        edge.target.port === undefined
          ? { entity: edge.target.entity }
          : { entity: edge.target.entity, port: edge.target.port, ...(slotOf(edge,"target") === undefined ? {} : { slot: slotOf(edge,"target")! }) },
    })),
  };
  // Edge labels, measured once: keyed by the projected relation occurrence id.
  // Scale measured boxes when `metrics.edgeLabelSize` overrides the default 18 px token.
  const edgeLabelMeasure = scaleEdgeLabelMeasurer(measure, metrics.edgeLabelSize, DEFAULT_EDGE_LABEL_SIZE);
  const labelSizes = new Map<RelationRef, { width: number; height: number }>();
  const edgeLayouts = new Map<RelationRef, LineLayout>();
  for (const edge of drawnEdges) {
    if (flowPlan.bundles.some((bundle) => bundle.carrier === edge.occurrence)) continue;
    const label = edgeBundles[edge.occurrence]?.label ?? edgeLabelOf(document, edge.relation);
    if (label === undefined) continue;
    const bundle = edgeBundles[edge.occurrence];
    const chip = bundle?.relations === undefined ? undefined : measureBundleLabel(bundle.relations, edgeLabelMeasure, metrics.bundleLabelMaxWidth, bundle.members.length);
    const layout = chip === undefined ? edgeLabelMeasure({
      text: label,
      role: "edge-label",
      availableWidth: EDGE_LABEL_WIDTH,
      allocatedLines: DEFAULT_ALLOCATED_LINES["edge-label"],
      folded: false,
    }) : chip.layout;
    if (bundle !== undefined && chip !== undefined) bundle.chip = chip;
    const occurrenceId = edge.occurrence as unknown as RelationRef;
    edgeLayouts.set(occurrenceId, layout);
    labelSizes.set(occurrenceId, { width: layout.width, height: layout.height });
  }
  const routeSizes = new Map(labelSizes);
  for (const member of flowPlan.members) {
    if (flowPlan.suppressed.has(member.occurrence)) continue;
    const bundle = flowPlan.bundles.find((b) => b.carrier === member.occurrence);
    const text = bundle === undefined ? member.step.badge : (options.flows?.countTemplate ?? "{n}").replaceAll("{n}",String(bundle.members.length));
    const badge = measure({ text, role: "flow-badge", availableWidth: Number.MAX_SAFE_INTEGER, allocatedLines: 1, folded: false });
    const old = routeSizes.get(member.occurrence as unknown as RelationRef);
    routeSizes.set(member.occurrence as unknown as RelationRef, { width: Math.max(old?.width ?? 0, flowTokens.flowBadgeSize, badge.width + 2 * flowTokens.flowBadgePaddingX), height: Math.max(old?.height ?? 0, flowTokens.flowBadgeSize) });
  }
  // A route may cross the boundaries of its own occurrence-group ancestors
  // (L-R8): the chain is read from the projected view, never from the
  // semantic containment tree.
  const projectedAncestorsOf = (occurrence: OccurrenceRef): EntityRef[] => {
    const start = projected.portOccurrences[occurrence]?.ownerOccurrence ?? occurrence;
    const found: EntityRef[] = [];
    const seen = new Set<string>();
    let current: OccurrenceRef | undefined = parentOccurrenceOf(projected, start);
    while (current !== undefined && !seen.has(current)) {
      seen.add(current);
      const entity = projected.entityOccurrences[current]?.entity;
      if (entity !== undefined && visible(entity)) found.push(entity);
      current = parentOccurrenceOf(projected, current);
    }
    return found;
  };
  /** BF-3: the lowest expanded container both entities are placed in, if any. */
  const sharedContainerOf = (left: EntityRef, right: EntityRef): EntityRef | undefined => {
    const chain = new Set<EntityRef>();
    for (let current = placementParentOf(right); current !== undefined; current = placementParentOf(current)) chain.add(current);
    for (let current = placementParentOf(left); current !== undefined; current = placementParentOf(current)) {
      if (chain.has(current)) return current;
    }
    return undefined;
  };
  const lineHeightOf = (role: TextRole): number =>
    measure({ text: "Mg", role, availableWidth: 1000, allocatedLines: 1, folded: false }).height;

  /** Shelves and orientation of one run, decided at the base gaps (BF-6: frozen afterwards). */
  interface FrozenRun {
    readonly orientation: LevelOrientation;
    readonly shelves: readonly (readonly number[])[];
  }
  interface PassPlan {
    readonly frozen: ReadonlyMap<string, FrozenRun>;
    /** Gutter id → gap asked for it (label thickness plus its two margins), within the axis cap. */
    readonly widen: ReadonlyMap<string, number>;
    readonly external: ReadonlySet<string>;
  }
  interface PassOutcome {
    readonly result: LayoutResult;
    readonly chosen: ReadonlyMap<string, FrozenRun>;
    /** Gutters in which a label that found no room would fit once widened. */
    readonly requested: ReadonlyMap<string, number>;
    /** Widened gutters in which no placed label sits: empty lanes (§3.5). */
    readonly unused: readonly string[];
    readonly unplaced: number;
  }

  /**
   * One placement pass: size, measure headers, seat, dock, route, place
   * labels. `plan` absent is pass 1 — every gutter at its base gap, shelves
   * and orientations chosen. With a plan, shelves and orientations are the
   * frozen ones of pass 1 and the listed gutters take their asked gap.
   */
  const runPass = (
    plan: PassPlan | undefined,
    orientationOverrides?: ReadonlyMap<string, LevelOrientation>,
  ): PassOutcome => {
    const warnings: LayoutWarning[] = [];
    const overflows: MeasurementOverflow[] = [];
    const warnOverflow = (overflow: MeasurementOverflow, zone: boolean): void => {
      overflows.push(overflow);
      warnings.push({
        code: zone ? "zone-overflow" : "card-overflow",
        refs: [overflow.occurrence, overflow.slot],
        message: `overflow in ${overflow.slot}: needs ${overflow.neededHeight} over ${overflow.allocatedHeight}; every character is kept`,
        details: {
          occurrence: overflow.occurrence,
          slot: overflow.slot,
          neededHeight: overflow.neededHeight,
          allocatedHeight: overflow.allocatedHeight,
          lines: overflow.lines,
          allocatedLines: overflow.allocatedLines,
        },
      });
    };

    // Sizing, bottom-up. Header heights are an input of the chrome each level
    // is scored with, and widths an input of the header wrap: the sweep below
    // repeats until the widths it measured the headers at are the widths it
    // produces (a fixed point, reached in one or two rounds).
    interface PackedRun {
      readonly run: Run;
      readonly rows: boolean;
      readonly shelves: readonly (readonly number[])[];
      readonly boxes: readonly PackBox[];
      readonly positions: readonly { readonly x: number; readonly y: number }[];
      readonly alongBase: number;
      readonly acrossBase: number;
    }
    const outerWidths = new Map<EntityRef, number>();
    const packedSizes = new Map<EntityRef, { width: number; height: number }>();
    const packedRuns = new Map<string, PackedRun>();
    const levelRuns = new Map<EntityRef, Run>();
    const orientationRecord = new Map<string, LevelOrientation>();
    const chosen = new Map<string, FrozenRun>();
    const headers = new Map<EntityRef, HeaderMeasurement>();
    const headerInputs = new Map<EntityRef, EntityMeasurementInput>();
    const headerWidths = new Map<EntityRef, number>();
    /** The header of one occurrence at an inner width: measured once per width, never twice at the same. */
    const headerAt = (id: EntityRef, inner: number): HeaderMeasurement => {
      const known = headers.get(id);
      if (known !== undefined && headerWidths.get(id) === inner) return known;
      const kind = kinds.get(id)!;
      const input: EntityMeasurementInput = {
        entity: id,
        occurrence: representativeOf(id),
        effectiveType: `${document.entities[id]?.profile ?? ""}:${document.entities[id]?.type ?? ""}/${formOf(presentation, representativeOf(id)) ?? graph.nodes.get(id)!.kind}`,
        folded: kind === "container-collapsed" || kind === "legend-collapsed",
        toggle: kind !== "leaf",
        slots: slotTexts(document, presentation, representativeOf(id), id),
        availableWidth: inner,
        allocatedLines: { ...DEFAULT_ALLOCATED_LINES },
      };
      const entry = presentation.entities[representativeOf(id)];
      const header = entry === undefined ? measureHeader(input, measure)
        : sceneBoxAt(representativeOf(id), inner + 2 * CONTENT_INSET, input.folded).header;
      headers.set(id, header);
      headerInputs.set(id, input);
      headerWidths.set(id, inner);
      return header;
    };
    // First sweep: no header is known yet, so an expanded box is measured at
    // its header-driven floor width — its final width unless its children are wider.
    const headerHeightOf = (id: EntityRef, outer: number): number => (headers.get(id) ?? headerAt(id, innerWidthOf(outer))).height;

    const sizeRun = (run: Run, chromeWidth: number, chromeHeight: number): { width: number; height: number } => {
      const boxes: PackBox[] = run.items.map((item) => ("entity" in item ? sizeBox(item.entity) : sizeRun(item.run, 0, 0)));
      if (run.stretch) {
        // §3.7: stretch runs before packing, on the measured widths.
        let widest = 0;
        run.items.forEach((item, slot) => {
          if ("entity" in item && isStretchedBox(item.entity)) widest = Math.max(widest, boxes[slot]!.width);
        });
        run.items.forEach((item, slot) => {
          if (!("entity" in item) || !isStretchedBox(item.entity)) return;
          boxes[slot] = { width: widest, height: boxes[slot]!.height };
          outerWidths.set(item.entity, widest);
          packedSizes.set(item.entity, boxes[slot]!);
        });
      }
      const zone = runHasZone(run);
      const baseX = zone ? rowGaps.zoneX : rowGaps.cardX;
      const baseY = zone ? rowGaps.zoneY : rowGaps.cardY;
      const packOptions = {
        targetAspect: rowPack.targetAspect,
        gapX: baseX,
        gapY: baseY,
        chromeWidth,
        chromeHeight,
        tallBias: rowPack.tallBias,
        emptyPenaltyWeight: rowPack.emptyPenaltyWeight,
      };
      const frozen = plan?.frozen.get(run.key);
      let orientation: LevelOrientation;
      let shelves: readonly (readonly number[])[];
      const forcedOrientation = run.mode === "auto" ? orientationOverrides?.get(run.key) : undefined;
      if (forcedOrientation !== undefined) {
        orientation = forcedOrientation;
        shelves = (forcedOrientation === "rows" ? packRows : packColumns)(boxes, packOptions).rows;
      } else if (frozen !== undefined && frozen.shelves.reduce((count, shelf) => count + shelf.length, 0) === boxes.length) {
        orientation = frozen.orientation;
        shelves = frozen.shelves;
      } else if (run.mode === "auto") {
        const choice = chooseOrientation(boxes, packOptions, rowPack.orientationHysteresis, options.previousOrientation?.[run.key]);
        orientation = choice.orientation;
        shelves = choice.result.rows;
      } else {
        orientation = run.mode;
        shelves = (run.mode === "rows" ? packRows : packColumns)(boxes, packOptions).rows;
      }
      // A column shelf containing one box per column paints the same single
      // row. Canonicalize that equivalent arrangement before feeding fold
      // hysteresis back; otherwise the metadata can alternate without a move.
      if (run.mode === "auto" && orientation === "columns" && shelves.every(shelf => shelf.length === 1)) {
        orientation = "rows";
        shelves = [shelves.flat()];
      }
      chosen.set(run.key, { orientation, shelves });
      if (run.mode === "auto" && boxes.length > 0) orientationRecord.set(run.key, orientation);
      const rows = orientation === "rows";
      const alongBase = rows ? baseX : baseY;
      const acrossBase = rows ? baseY : baseX;
      const cardAlongBase = rows ? rowGaps.cardX : rowGaps.cardY;
      const cardAcrossBase = rows ? rowGaps.cardY : rowGaps.cardX;
      const zoneAlongBase = rows ? rowGaps.zoneX : rowGaps.zoneY;
      const zoneAcrossBase = rows ? rowGaps.zoneY : rowGaps.zoneX;
      // §3.5: a gutter keeps its base gap (or the authored `gapAfter` of the
      // group before it) unless the plan widens it for a label. One along gap
      // per slot index on every shelf: the grid keeps its column starts.
      // REQ-R7-14: on r7 mixed runs, only gutters bordering a zone stay fixed
      // at `zoneGutter` (>= 96); leaf-to-leaf gaps keep card base & widening.
      const gapAfterOf = (slot: number): number | undefined => {
        const item = run.items[slot]!;
        return "run" in item ? item.gapAfter : undefined;
      };
      const seated = seatShelves(
        boxes,
        shelves,
        orientation,
        (shelf, slot) => {
          const leftSlot = shelves[shelf]![slot]!;
          const rightSlot = shelves[shelf]![slot + 1]!;
          if (r7Routing) {
            const isZoneGutter = itemHasZone(run.items[leftSlot]!) || itemHasZone(run.items[rightSlot]!);
            if (isZoneGutter) return zoneAlongBase;
            return Math.max(
              gapAfterOf(leftSlot) ?? cardAlongBase,
              plan?.widen.get(`${run.key}|along|${String(slot)}`) ?? 0,
              plan?.widen.get(`${run.key}|along|${String(slot)}|${String(shelf)}`) ?? 0,
            );
          }
          return Math.max(
            gapAfterOf(leftSlot) ?? alongBase,
            plan?.widen.get(`${run.key}|along|${String(slot)}`) ?? 0,
            plan?.widen.get(`${run.key}|along|${String(slot)}|${String(shelf)}`) ?? 0,
          );
        },
        (shelf) => {
          const last = shelves[shelf]![shelves[shelf]!.length - 1]!;
          if (r7Routing) {
            const nextShelf = shelves[shelf + 1]!;
            const isZoneGutter = shelfHasZone(run, shelves[shelf]!) || shelfHasZone(run, nextShelf);
            if (isZoneGutter) return zoneAcrossBase;
            return Math.max(gapAfterOf(last) ?? cardAcrossBase, plan?.widen.get(`${run.key}|across|${String(shelf)}`) ?? 0);
          }
          return Math.max(gapAfterOf(last) ?? acrossBase, plan?.widen.get(`${run.key}|across|${String(shelf)}`) ?? 0);
        },
      );
      packedRuns.set(run.key, { run, rows, shelves, boxes, positions: seated.positions, alongBase, acrossBase });
      return { width: seated.width, height: seated.height };
    };
    const legendKeyCardWidth = (id: EntityRef): number => {
      const parent = graph.nodes.get(id)?.parent;
      return parent !== undefined ? cardWidthOf(representativeOf(parent)) : cardWidthOf(representativeOf(id));
    };
    const sizeBox = (id: EntityRef): { width: number; height: number } => {
      const kind = kinds.get(id)!;
      if (kind === "leaf" || kind === "container-collapsed" || kind === "legend-collapsed") {
        const entry = presentation.entities[representativeOf(id)];
        const measured = entry === undefined ? { width: FIXED_CARD_WIDTH, height: FIXED_CARD_HEIGHT }
          : sceneBoxAt(representativeOf(id), cardWidthOf(representativeOf(id)), kind !== "leaf");
        outerWidths.set(id, measured.width);
        const size = { width: measured.width, height: measured.height };
        packedSizes.set(id, size);
        return size;
      }
      if (kind === "legend-key") return { width: innerWidthOf(legendKeyCardWidth(id)), height: LEGEND_KEY_HEIGHT };
      const zoneGeo = anatomyZoneGeometry(occurrenceAnatomy(representativeOf(id)));
      const hasIcon = presentation.entities[representativeOf(id)]?.icon !== "none";
      const headerReserve = zoneGeo.headerTextInset - (hasIcon ? 0 : zoneGeo.iconSize + zoneGeo.iconTextGap);
      const headerDriven = unwrappedHeaderWidth(id) + headerReserve;
      const floor = Math.max(zoneGeo.collapsedWidth, headerDriven);
      const ordered = orderedChildrenOf(id);
      const headerHeight = headerHeightOf(id, floor);
      if (kind === "legend-expanded") {
        // A legend stays a single-column list of keys (DLR-341): exempt from packing.
        outerWidths.set(id, floor);
        const keys = ordered.length * LEGEND_KEY_HEIGHT + Math.max(0, ordered.length - 1) * gaps.cardGapY;
        const size = { width: floor, height: zoneGeo.headerInset + headerHeight + contentInset + keys + contentInset };
        packedSizes.set(id, size);
        return size;
      }
      const run = buildLevelRun(id, ordered);
      levelRuns.set(id, run);
      const level = sizeRun(
        run,
        2 * contentInset,
        zoneGeo.headerInset + headerHeight + contentInset + contentInset,
      );
      // BF-6: reserve measured U-channel headroom for labelled edges on one
      // shelf, including wrapped labels and parallel channels. This is
      // container content below its children; sibling gutters keep their cap.
      const packed = packedRuns.get(run.key);
      let uExtra = 0;
      if (packed !== undefined) {
        const zone = runHasZone(run);
        const baseGap = packed.rows ? (zone ? rowGaps.zoneX : rowGaps.cardX) : (zone ? rowGaps.zoneY : rowGaps.cardY);
        for (const edge of drawnEdges) {
          if (placementParentOf(edge.source.entity) !== id || placementParentOf(edge.target.entity) !== id) continue;
          const labelSize = labelSizes.get(edge.occurrence as unknown as RelationRef);
          if (labelSize === undefined) continue;
          const si = ordered.indexOf(edge.source.entity);
          const ti = ordered.indexOf(edge.target.entity);
          if (si < 0 || ti < 0) continue;
          const sameShelf = packed.shelves.some((shelf) => shelf.includes(si) && shelf.includes(ti));
          if (!sameShelf) continue;
          const need =
            (packed.rows ? labelSize.width : labelSize.height) + 2 * metrics.labelMargin;
          if (need > baseGap) uExtra += labelSize.height + 2 * metrics.labelMargin;
        }
      }
      const levelHeight = level.height + uExtra;
      const outer = Math.max(floor, level.width + (ordered.length > 0 ? 2 * contentInset : 0));
      outerWidths.set(id, outer);
      const size = {
        width: outer,
        height: zoneGeo.headerInset + headerHeight + contentInset + levelHeight + contentInset
          + sceneBoxAt(representativeOf(id), outer, false).footerReserve,
      };
      packedSizes.set(id, size);
      return size;
    };
    let rootRun: Run = { key: ROOT_LEVEL_KEY, mode: "auto", items: [], stretch: false };
    const sizeAll = (): void => {
      outerWidths.clear();
      packedSizes.clear();
      packedRuns.clear();
      levelRuns.clear();
      orientationRecord.clear();
      chosen.clear();
      rootRun = buildLevelRun(undefined, rootOrder);
      sizeRun(rootRun, 0, 0);
    };
    const headerIds = [...graph.nodes.keys()].filter((id) => visible(id) && kinds.get(id) !== "legend-key").sort(byString);
    const measureHeaders = (): void => {
      for (const id of headerIds) {
        const kind = kinds.get(id)!;
        const folded = kind === "container-collapsed" || kind === "legend-collapsed";
        headerAt(id, folded ? innerWidthOf(packedSizes.get(id)?.width ?? cardWidthOf(representativeOf(id))) : innerWidthOf(outerWidths.get(id) ?? cardWidthOf(representativeOf(id))));
      }
    };
    sizeAll();
    for (let round = 0; round < HEADER_ROUNDS; round += 1) {
      measureHeaders();
      const before = new Map(outerWidths);
      sizeAll();
      if (before.size === outerWidths.size && [...outerWidths].every(([id, width]) => before.get(id) === width)) break;
    }
    for (const id of headerIds) {
      const size = packedSizes.get(id);
      const occurrence = representativeOf(id);
      if (presentation.entities[occurrence] !== undefined && size !== undefined) {
        for (const diagnostic of sceneBoxAt(occurrence, size.width, isCollapsed(id)).diagnostics) {
          if (diagnostic.reason !== "truncated" && diagnostic.reason !== "fallback-v1") continue;
          const isFallback = diagnostic.reason === "fallback-v1";
          warnings.push({ code: kinds.get(id) === "leaf" ? "card-overflow" : "zone-overflow", severity: "info",
            refs: [occurrence, diagnostic.slot],
            message: isFallback
              ? "compact anatomy overflow on " + diagnostic.slot + ": fell back to v1 frozen box"
              : "truncated " + diagnostic.slot + ": " + diagnostic.hiddenLength + " hidden characters; full text in title/aria",
            details: {
              slot: diagnostic.slot,
              reason: diagnostic.reason,
              ...(diagnostic.hiddenLength === undefined ? {} : { hiddenLength: diagnostic.hiddenLength }),
              neededHeight: diagnostic.neededPx,
              allocatedHeight: diagnostic.allocatedPx,
            } });
        }
      } else for (const overflow of headerOverflows(headerInputs.get(id)!, headers.get(id)!, lineHeightOf)) {
        warnOverflow(overflow, kinds.get(id) !== "leaf");
      }
    }
    if (options.reportSurfaceSame === true) {
      for (const id of headerIds) {
        const kind = kinds.get(id);
        if (kind !== "container-expanded" && kind !== "legend-expanded") continue;
        const zoneOcc = representativeOf(id);
        const zoneEntry = presentation.entities[zoneOcc] as { readonly depth?: number; readonly depthParityStart?: 0 | 1 } | undefined;
        const zoneDepth = zoneEntry?.depth ?? graph.nodes.get(id)?.depth ?? 0;
        const surface = zoneDepthSurface(zoneDepth, zoneEntry?.depthParityStart);
        if (surface !== "surface1") continue;
        for (const childId of orderedChildrenOf(id)) {
          if (kinds.get(childId) !== "leaf") continue;
          const childOcc = representativeOf(childId);
          const childEntry = presentation.entities[childOcc] as { readonly categoryRef?: string } | undefined;
          if (childEntry?.categoryRef !== undefined) continue;
          warnings.push({
            code: "zone-surface-same",
            severity: "info",
            refs: [zoneOcc, childOcc],
            message: `white leaf card ${childOcc} sits on same-colour surface1 zone ${zoneOcc}`,
            details: { zone: zoneOcc, card: childOcc, surface },
          });
        }
      }
    }

    // Seating: every run at its packed positions. The root is one more run
    // with zero chrome and the same token gaps — never `rankGap` (§3.5).
    const rects = new Map<EntityRef, Rect>();
    const titleBands = new Map<EntityRef, Rect>();
    const footerBands = new Map<EntityRef, Rect>();
    const legendInner = new Map<EntityRef, number>();
    const seatedBoxes = new Map<string, Rect[]>();
    const seatRun = (run: Run, originX: number, originY: number): void => {
      const packed = packedRuns.get(run.key)!;
      const absolute: Rect[] = [];
      run.items.forEach((item, slot) => {
        const position = packed.positions[slot]!;
        const box = packed.boxes[slot]!;
        const x = originX + position.x;
        const y = originY + position.y;
        absolute.push({ x, y, width: box.width, height: box.height });
        if ("entity" in item) seatBox(item.entity, x, y);
        else seatRun(item.run, x, y);
      });
      seatedBoxes.set(run.key, absolute);
    };
    const seatBox = (id: EntityRef, x: number, y: number): void => {
      const kind = kinds.get(id)!;
      if (kind === "leaf" || kind === "container-collapsed" || kind === "legend-collapsed") {
        rects.set(id, { x, y, ...packedSizes.get(id)! });
        return;
      }
      if (kind === "legend-key") {
        rects.set(id, { x, y, width: innerWidthOf(legendKeyCardWidth(id)), height: LEGEND_KEY_HEIGHT });
        return;
      }
      const size = packedSizes.get(id)!;
      const header = headers.get(id)!;
      const zoneGeo = anatomyZoneGeometry(occurrenceAnatomy(representativeOf(id)));
      const inner = innerWidthOf(size.width);
      rects.set(id, { x, y, width: size.width, height: size.height });
      const ruleClearance = (zoneGeo.ruleHeight / 2 + 1) / DEFAULT_MIN_READABLE_SCALE;
      titleBands.set(id, { x, y, width: size.width, height: zoneGeo.headerInset + header.height });
      const footerReserve = sceneBoxAt(representativeOf(id), size.width, false).footerReserve;
      if (footerReserve > 0) footerBands.set(id, {
        x, y: y + size.height - footerReserve - zoneGeo.borderWidth - ruleClearance,
        width: size.width, height: footerReserve + zoneGeo.borderWidth + ruleClearance,
      });
      const contentX = x + contentInset;
      const contentY = y + zoneGeo.headerInset + header.height + contentInset;
      if (kind === "legend-expanded") {
        legendInner.set(id, inner);
        orderedChildrenOf(id).forEach((key, index) => {
          rects.set(key, {
            x: contentX,
            y: contentY + index * (LEGEND_KEY_HEIGHT + gaps.cardGapY),
            width: inner,
            height: LEGEND_KEY_HEIGHT,
          });
        });
        return;
      }
      const run = levelRuns.get(id);
      if (run !== undefined) seatRun(run, contentX, contentY);
    };
    seatRun(rootRun, 0, 0);

    // Bodies and labels through the same measurer.
    const slots: SlotMeasurement[] = [];
    const recordSlot = (occurrence: OccurrenceRef, role: TextRole, layout: LineLayout, zone: boolean): void => {
      slots.push({ occurrence, role, layout });
      if (role === "legend-label" && layout.height > LEGEND_KEY_HEIGHT) {
        const allocatedLines = DEFAULT_ALLOCATED_LINES[role];
        warnOverflow(
          {
            occurrence,
            slot: role,
            neededHeight: layout.height,
            allocatedHeight: LEGEND_KEY_HEIGHT,
            lines: layout.lines.length,
            allocatedLines,
          },
          zone,
        );
        return;
      }
      if (layout.overflow && (role === "edge-label" || presentation.entities[occurrence] === undefined)) {
        const allocatedLines = DEFAULT_ALLOCATED_LINES[role];
        warnOverflow(
          {
            occurrence,
            slot: role,
            neededHeight: layout.height,
            allocatedHeight: allocatedLines * lineHeightOf(role),
            lines: layout.lines.length,
            allocatedLines,
          },
          zone,
        );
      }
    };
    for (const id of [...graph.nodes.keys()].sort(byString)) {
      if (!visible(id)) continue;
      const kind = kinds.get(id)!;
      const occurrence = representativeOf(id);
      const text = slotTexts(document, presentation, occurrence, id);
      if (kind === "legend-key") {
        const parent = graph.nodes.get(id)?.parent;
        const inner =
          parent !== undefined && legendInner.has(parent) ? legendInner.get(parent)! : innerWidthOf(legendKeyCardWidth(id));
        recordSlot(
          occurrence,
          "legend-label",
          measure({
            text: text.title ?? "",
            role: "legend-label",
            availableWidth: inner - SWATCH_ALLOCATION,
            allocatedLines: DEFAULT_ALLOCATED_LINES["legend-label"],
            folded: false,
          }),
          false,
        );
        continue;
      }
      const expanded = kind === "container-expanded" || kind === "legend-expanded";
      const inner = expanded ? innerWidthOf(outerWidths.get(id) ?? cardWidthOf(occurrence)) : innerWidthOf(cardWidthOf(occurrence));
      const rendered = sceneBoxAt(occurrence, rects.get(id)!.width, !expanded && kind !== "leaf");
      for (const role of ["body", "detail", "footer"] as const) {
        if (text[role] === undefined) continue;
        recordSlot(
          occurrence,
          role,
          measure({
            text: text[role]!,
            role,
            availableWidth: role === "footer" ? rendered.footerWidth : rendered.bodyWidth,
            allocatedLines: DEFAULT_ALLOCATED_LINES[role],
            folded: !expanded && kind !== "leaf",
          }),
          expanded,
        );
      }
    }
    for (const edge of [...drawnEdges].sort((left, right) => byString(left.occurrence, right.occurrence))) {
      const layout = edgeLayouts.get(edge.occurrence as unknown as RelationRef);
      if (layout !== undefined) recordSlot(edge.occurrence, "edge-label", layout, false);
    }

    // Shapes no label may cover and no U-channel may run through: cards,
    // collapsed boxes, legend keys and the title bands, plus every expanded
    // zone the edge has no end in. The interior of the zones an edge starts
    // or ends in is free (BF-6): a label may sit inside its own zone.
    const routeShapes: Rect[] = [
      ...[...rects].filter(([id]) => !isStretchedBox(id)).map(([, rect]) => rect),
      ...titleBands.values(),
    ];
    // Footer bands constrain text placement. Routes may cross a zone's
    // footer while leaving it; a label on that route still has to clear it.
    // Header measurement ends at the rule's top. Reserve its non-scaling
    // paint plus one CSS px at the display floor for label placement.
    // Routes may cross a rule while leaving their own zone.
    const ruleClearance = (ZONE_GEOMETRY.ruleHeight / 2 + 1) / DEFAULT_MIN_READABLE_SCALE;
    const fixedShapes: Rect[] = [...routeShapes, ...[...titleBands.values()].map(band => ({
      x: band.x, y: band.y + band.height, width: band.width,
      height: ZONE_GEOMETRY.ruleHeight / 2 + ruleClearance,
    })), ...footerBands.values()];
    const zoneShapes = [...rects].filter(([id]) => isStretchedBox(id));
    const shapesByEdge = new Map<RelationRef, Rect[]>();
    const passableZonesByEdge = new Map<RelationRef, Rect[]>();
    for (const edge of drawnEdges) {
      const own = new Set<EntityRef>();
      for (const end of [edge.source.entity, edge.target.entity]) {
        for (let current = placementParentOf(end); current !== undefined; current = placementParentOf(current)) own.add(current);
      }
      const edgeId = edge.occurrence as unknown as RelationRef;
      shapesByEdge.set(edgeId, [
        ...routeShapes,
        ...zoneShapes.filter(([id]) => !own.has(id)).map(([, rect]) => rect),
      ]);
      passableZonesByEdge.set(edgeId, zoneShapes.filter(([id]) => own.has(id)).map(([, rect]) => rect));
    }
    const shapesOf = (id: RelationRef): readonly Rect[] => shapesByEdge.get(id) ?? routeShapes;
    const passableZonesOf = (id: RelationRef): readonly Rect[] => passableZonesByEdge.get(id) ?? [];
    /** BF-3 `inner(C)`: the routable interior of an expanded container (BLK-3, DE-2 15px border clearance). */
    const innerOf = (container: EntityRef): Rect | undefined => {
      const rect = rects.get(container);
      const band = titleBands.get(container);
      if (rect === undefined || band === undefined) return undefined;
      const inset = routeSpacing > 0 ? Math.max(4, borderClearance) : 4;
      const top = band.y + band.height + inset;
      return {
        x: rect.x + inset,
        y: top,
        width: Math.max(0, rect.width - 2 * inset),
        height: Math.max(0, rect.y + rect.height - top - inset),
      };
    };
    const withinOf = new Map<RelationRef, Rect>();
    for (const edge of drawnEdges) {
      const shared = sharedContainerOf(edge.source.entity, edge.target.entity);
      const inner = shared === undefined ? undefined : innerOf(shared);
      if (inner !== undefined) withinOf.set(edge.occurrence as unknown as RelationRef, inner);
    }
    // Free space a label needs above and under it to be probed in a lane at
    // its base gap: the lane is then widened to the label thickness plus its
    // two margins, within the cap.
    const probeMarginOf = (height: number): number =>
      Math.min(metrics.labelMargin, (Math.min(rowGaps.cardY, rowGaps.zoneY) - height) / 2);

    // BF-6 U-channel (BLK-2): a labelled edge between two side-by-side boxes has
    // only a short bridge across a capped gutter, where no label fits — and a
    // stacked pair has only a short vertical bridge. Both ends then dock on
    // one same side so the route runs along that lane and the label sits on
    // it. Multiple labelled edges on one row step to parallel lanes
    // (usedUTracks), staggered by one label pitch. Without a free lane the
    // edge keeps its bridge and its label is reported unplaced.
    const drawingTop = Math.min(0, ...[...rects.values()].map((rect) => rect.y));
    const drawingBottom = Math.max(0, ...[...rects.values()].map((rect) => rect.y + rect.height));
    const sideOverrides = new Map<RelationRef, { readonly source: PortSide; readonly target: PortSide; readonly turn: boolean }>();
    const labelledPairs = new Map<string, number>();
    const usedUTracks = new Map<string, number>();
    for (const edge of [...drawnEdges].sort((left, right) => byString(left.occurrence, right.occurrence))) {
      const id = edge.occurrence as unknown as RelationRef;
      const size = routeSizes.get(id);
      const source = edge.source.entity;
      const target = edge.target.entity;
      if (size === undefined || source === target) continue;
      if (isAncestor(filteredGraph, source, target) || isAncestor(filteredGraph, target, source)) continue;
      const a = rects.get(source)!;
      const b = rects.get(target)!;
      const bridge = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width));
      const sideBySide = a.y < b.y + b.height && b.y < a.y + a.height && bridge >= 0;
      const vBridge = Math.max(b.y - (a.y + a.height), a.y - (b.y + b.height));
      const stacked = !sideBySide && a.x < b.x + b.width && b.x < a.x + a.width && vBridge >= 0;
      if (!sideBySide && !stacked) continue;
      if (sideBySide) {
        // A straight bridge long enough for the label, across a band nothing stands in, keeps its docks.
        const band: Rect = {
          x: Math.min(a.x + a.width, b.x + b.width),
          y: Math.max(a.y, b.y),
          width: bridge,
          height: Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y),
        };
        if (bridge >= size.width + 2 * metrics.labelMargin && !shapesOf(id).some((shape) => rectsIntersect(shape, band))) continue;
      } else {
        const band: Rect = {
          x: Math.max(a.x, b.x),
          y: Math.min(a.y + a.height, b.y + b.height),
          width: Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x),
          height: vBridge,
        };
        if (vBridge >= size.height + 2 * metrics.labelMargin && !shapesOf(id).some((shape) => rectsIntersect(shape, band))) continue;
      }
      const probe = metrics.labelMargin;
      const pairKey = [source, target].sort().join("|");
      const nth = labelledPairs.get(pairKey) ?? 0;
      labelledPairs.set(pairKey, nth + 1);
      const within = withinOf.get(id);
      // BLK-2: parallel U-channels on one row step to staggered lanes.
      const containerKey =
        placementParentOf(source) !== undefined && placementParentOf(source) === placementParentOf(target)
          ? placementParentOf(source)!
          : "root";
      const trackKey = `${containerKey}|${sideBySide ? Math.max(a.y + a.height, b.y + b.height) : Math.max(a.x + a.width, b.x + b.width)}`;
      const used = usedUTracks.get(trackKey) ?? 0;
      const depth = (sideBySide ? size.height : size.width) + 2 * probe;
      const pitch = Math.max(depth + 2 * metrics.labelMargin, routeSpacing > 0 ? routeSpacing : 0);
      const uEdgeClearance = routeSpacing > 0 ? borderClearance : 0;
      const laneFreeRow = (side: "south" | "north", attempt: number): boolean => {
        const base = side === "south"
          ? Math.max(a.y + a.height, b.y + b.height) + uEdgeClearance
          : Math.min(a.y, b.y) - depth - uEdgeClearance;
        const top = side === "south" ? base + attempt * pitch : base - attempt * pitch;
        const centres = [a.x + a.width / 2, b.x + b.width / 2];
        const lane: Rect = { x: Math.min(...centres), y: top, width: Math.abs(centres[0]! - centres[1]!), height: depth };
        if (
          within !== undefined &&
          (lane.x < within.x ||
            lane.y < within.y ||
            lane.x + lane.width > within.x + within.width ||
            lane.y + lane.height > within.y + within.height)
        ) {
          return false;
        }
        const laneCheck: Rect = uEdgeClearance > 0
          ? { x: lane.x, y: lane.y - uEdgeClearance, width: lane.width, height: lane.height + 2 * uEdgeClearance }
          : lane;
        const legs: Rect[] = [a, b].map((rect) =>
          side === "south"
            ? { x: rect.x + rect.width / 2 - 1, y: rect.y + rect.height, width: 2, height: top - (rect.y + rect.height) }
            : { x: rect.x + rect.width / 2 - 1, y: top + depth, width: 2, height: rect.y - (top + depth) },
        );
        return ![laneCheck, ...legs.filter((leg) => leg.height > 0)].some((zone) => shapesOf(id).some((shape) => rectsIntersect(shape, zone)));
      };
      const laneFreeCol = (side: "east" | "west", attempt: number): boolean => {
        const base = side === "east"
          ? Math.max(a.x + a.width, b.x + b.width) + uEdgeClearance
          : Math.min(a.x, b.x) - depth - uEdgeClearance;
        const left = side === "east" ? base + attempt * pitch : base - attempt * pitch;
        const centres = [a.y + a.height / 2, b.y + b.height / 2];
        const lane: Rect = { x: left, y: Math.min(...centres), width: depth, height: Math.abs(centres[0]! - centres[1]!) };
        if (
          within !== undefined &&
          (lane.x < within.x ||
            lane.y < within.y ||
            lane.x + lane.width > within.x + within.width ||
            lane.y + lane.height > within.y + within.height)
        ) {
          return false;
        }
        const laneCheck: Rect = uEdgeClearance > 0
          ? { x: lane.x - uEdgeClearance, y: lane.y, width: lane.width + 2 * uEdgeClearance, height: lane.height }
          : lane;
        const legs: Rect[] = [a, b].map((rect) =>
          side === "east"
            ? { x: rect.x + rect.width, y: rect.y + rect.height / 2 - 1, width: left - (rect.x + rect.width), height: 2 }
            : { x: left + depth, y: rect.y + rect.height / 2 - 1, width: rect.x - (left + depth), height: 2 },
        );
        return ![laneCheck, ...legs.filter((leg) => leg.width > 0)].some((zone) => shapesOf(id).some((shape) => rectsIntersect(shape, zone)));
      };
      const outside: "south" | "north" | undefined =
        within !== undefined || !sideBySide
          ? undefined
          : Math.min(a.y, b.y) <= drawingTop
            ? "north"
            : Math.max(a.y + a.height, b.y + b.height) >= drawingBottom
              ? "south"
              : undefined;
      let placed = false;
      if (sideBySide) {
        const preference: readonly ("south" | "north")[] =
          outside === undefined
            ? nth % 2 === 0
              ? ["south", "north"]
              : ["north", "south"]
            : nth % 2 === 0
              ? [outside, outside === "south" ? "north" : "south"]
              : [outside === "south" ? "north" : "south", outside];
        for (const side of preference) {
          for (let attempt = used; attempt < used + 3 && !placed; attempt += 1) {
            if (laneFreeRow(side, attempt)) {
              sideOverrides.set(id, { source: side, target: side, turn: true });
              usedUTracks.set(trackKey, attempt + 1);
              placed = true;
            }
          }
          if (placed) break;
        }
      } else {
        for (const side of ["east", "west"] as const) {
          for (let attempt = used; attempt < used + 3 && !placed; attempt += 1) {
            if (laneFreeCol(side, attempt)) {
              sideOverrides.set(id, { source: side, target: side, turn: true });
              usedUTracks.set(trackKey, attempt + 1);
              placed = true;
            }
          }
          if (placed) break;
        }
      }
    }

    // When route spacing is active:
    // 1. Avoid docking on the north face of an entity directly beneath its parent
    //    zone's title band (gap < 2 * borderClearance cannot clear the title barrier).
    // 2. For cross-zone edges leaving an expanded zone `Z`, prefer an outer wall of
    //    `Z` touched by the entity that faces toward the other end (and stays inside
    //    any shared ancestor container `within`) over diving inward through `Z`'s
    //    internal sibling gutters.
    const isNorthBlockedByTitle = (entity: EntityRef): boolean => {
      const parent = placementParentOf(entity);
      if (parent === undefined) return false;
      const band = titleBands.get(parent);
      const rect = rects.get(entity);
      if (band === undefined || rect === undefined) return false;
      return rect.y - (band.y + band.height) < 2 * borderClearance - 1e-4;
    };
    const sideStaysInWithin = (entity: EntityRef, side: PortSide, within: Rect | undefined): boolean => {
      if (within === undefined) return true;
      const r = rects.get(entity)!;
      // Check that exiting on `side` by `borderClearance` (and clearing any immediate
      // parent wall between `entity` and `within`) stays inside `within`.
      const need = borderClearance;
      if (side === "west") return r.x - need >= within.x - 1e-4;
      if (side === "east") return r.x + r.width + need <= within.x + within.width + 1e-4;
      if (side === "north") return r.y - need >= within.y - 1e-4;
      return r.y + r.height + need <= within.y + within.height + 1e-4;
    };
    if (routeSpacing > 0) {
      const isDescendantOrSame = (node: EntityRef, ancestor: EntityRef): boolean => {
        for (let cur: EntityRef | undefined = node; cur !== undefined; cur = placementParentOf(cur)) {
          if (cur === ancestor) return true;
        }
        return false;
      };
      const outerWallsOf = (entity: EntityRef, parent: EntityRef, within: Rect | undefined): PortSide[] => {
        const r = rects.get(entity)!;
        const p = rects.get(parent)!;
        const footerH = footerBands.get(parent)?.height ?? 0;
        const walls: PortSide[] = [];
        // When `within` is defined (nested zones inside a shared ancestor), an outer wall
        // of `parent` is only usable if exiting `parent` by `borderClearance` still stays in `within`.
        const inWithin = (side: PortSide): boolean => {
          if (within === undefined) return true;
          if (side === "west") return p.x - borderClearance >= within.x - 1e-4;
          if (side === "east") return p.x + p.width + borderClearance <= within.x + within.width + 1e-4;
          return p.y + p.height + borderClearance <= within.y + within.height + 1e-4;
        };
        if (r.x - p.x <= contentInset + 1 && inWithin("west")) walls.push("west");
        if (p.x + p.width - (r.x + r.width) <= contentInset + 1 && inWithin("east")) walls.push("east");
        if (p.y + p.height - footerH - (r.y + r.height) <= contentInset + 1 && inWithin("south")) walls.push("south");
        return walls;
      };
      const redirectSide = (selfId: EntityRef, otherId: EntityRef, chosen: PortSide, within: Rect | undefined): PortSide => {
        const self = rects.get(selfId)!;
        const other = rects.get(otherId)!;
        const selfCx = self.x + self.width / 2;
        const selfCy = self.y + self.height / 2;
        const otherCx = other.x + other.width / 2;
        const otherCy = other.y + other.height / 2;
        const parent = placementParentOf(selfId);
        // Cross-zone endpoint: prefer an outer wall of its immediate zone facing `other`
        // (never forcing a route away from `other` into an opposite saturated gutter).
        if (parent !== undefined && !isDescendantOrSame(otherId, parent)) {
          const outer = outerWallsOf(selfId, parent, within);
          if (outer.includes(chosen)) return chosen;
          const facingOuter = outer.filter((side) => {
            if (side === "west") return otherCx < selfCx;
            if (side === "east") return otherCx > selfCx;
            return otherCy > selfCy;
          });
          if (facingOuter.length > 0) {
            const score = (side: PortSide): number => {
              if (side === "west") return -(selfCx - otherCx);
              if (side === "east") return -(otherCx - selfCx);
              return -(otherCy - selfCy);
            };
            return [...facingOuter].sort((a, b) => score(a) - score(b))[0]!;
          }
        }
        if (chosen !== "north" || !isNorthBlockedByTitle(selfId)) return chosen;
        const candidates: PortSide[] = (["east", "west", "south"] as const).filter((s) => sideStaysInWithin(selfId, s, within));
        if (candidates.length === 0) return chosen;
        if (other.x >= self.x + self.width && candidates.includes("east")) return "east";
        if (self.x >= other.x + other.width && candidates.includes("west")) return "west";
        if (Math.abs(otherCx - selfCx) > 1e-4) {
          const pref: PortSide = otherCx > selfCx ? "east" : "west";
          if (candidates.includes(pref)) return pref;
        }
        if (parent !== undefined) {
          const parentRect = rects.get(parent)!;
          const distLeft = self.x - parentRect.x;
          const distRight = parentRect.x + parentRect.width - (self.x + self.width);
          const pref: PortSide = distLeft <= distRight ? "west" : "east";
          if (candidates.includes(pref)) return pref;
        }
        return candidates[0]!;
      };
      for (const edge of drawnEdges) {
        const id = edge.occurrence as unknown as RelationRef;
        if (sideOverrides.has(id)) continue;
        const source = edge.source.entity;
        const target = edge.target.entity;
        if (source === target) continue;
        if (isAncestor(filteredGraph, source, target) || isAncestor(filteredGraph, target, source)) continue;
        const within = withinOf.get(id);
        const sDefault = sideToward(rects.get(source)!, rects.get(target)!, "top-to-bottom");
        const tDefault = sideToward(rects.get(target)!, rects.get(source)!, "top-to-bottom");
        const sSide = redirectSide(source, target, sDefault, within);
        const tSide = redirectSide(target, source, tDefault, within);
        if (sSide !== sDefault || tSide !== tDefault) {
          sideOverrides.set(id, { source: sSide, target: tSide, turn: false });
        }
      }
    }

    // Dock and route against fixed boxes (§4.6.4/§4.6.5). Slots keep the
    // declared spacing: a label sits in a lane, not at its dock, so a side
    // does not spread its slots by the label width.
    const docked = dockEdges({
      ...(hasFlows ? { flowBadgeSize: flowTokens.flowBadgeSize } : {}),
      graph: filteredGraph,
      rects,
      direction: "top-to-bottom",
      metrics,
      labelSizes: new Map(),
      fixed: true,
      cornerInset: dockCornerInset,
      sideOverrides,
    });
    const finalDocks = new Map<RelationRef, EdgeDocks>(docked.docks);
    {
      const byEntity = new Map<EntityRef, { sides: PortSide[]; required: number; fitted: number }>();
      for (const overflow of docked.fixedOverflows) {
        const entry = byEntity.get(overflow.entity) ?? { sides: [], required: 0, fitted: 0 };
        entry.sides.push(overflow.side);
        entry.required += overflow.required;
        entry.fitted += overflow.fitted;
        byEntity.set(overflow.entity, entry);
      }
      for (const entity of [...byEntity.keys()].sort(byString)) {
        const entry = byEntity.get(entity)!;
        const sides = [...entry.sides].sort(byString);
        const occurrence = representativeOf(entity);
        warnings.push({
          code: "docking-overflow",
          refs: [occurrence],
          message: `sides ${sides.join(",")} of ${occurrence} need ${entry.required} docks, fit ${entry.fitted}`,
          details: {
            occurrence,
            sides: sides.join(","),
            required: entry.required,
            fitted: entry.fitted,
          },
        });
      }
    }
    const buildRequests = (docksMap: ReadonlyMap<RelationRef, EdgeDocks>) =>
      drawnEdges.map((edge) => {
        const occurrence = projected.relationOccurrences[edge.occurrence]!;
        const sourceRole = occurrence.endpoints.find((endpoint) => endpoint.role === "source")!;
        const targetRole = occurrence.endpoints.find((endpoint) => endpoint.role === "target")!;
        const occurrenceId = edge.occurrence as unknown as RelationRef;
        const pair = docksMap.get(occurrenceId)!;
        const passable = new Set<EntityRef>([
          ...projectedAncestorsOf(sourceRole.occurrence),
          ...projectedAncestorsOf(targetRole.occurrence),
        ]);
        const within = withinOf.get(occurrenceId);
        return {
          ...(flowRunRanks.has(edge.occurrence) ? { flowRank: flowRunRanks.get(edge.occurrence)!, flowRun: [edge.source.entity, edge.target.entity].sort().join("|") + "|" + String(sideOverrides.get(occurrenceId)?.turn === true) } : {}),
          id: occurrenceId,
          pairKey: [edge.source.entity, edge.target.entity].sort().join("|"),
          start: pair.source.point,
          startExit: pair.source.exit,
          end: pair.target.point,
          endExit: pair.target.exit,
          passable,
          // BF-3: an edge whose two ends share an expanded container stays in its content box.
          ...(within === undefined ? {} : { within }),
        };
      });
    let requests = buildRequests(finalDocks);
    // Lanes outside the drawing, over and under it, one label pitch apart:
    // labelled routes going round the drawing spread over them instead of
    // sharing the one clearance line, so each keeps room for its label.
    //
    // Room outside the drawing is taken only where the target aspect leaves
    // some: the drawing grown to `targetAspect` (16:9) is what a fit frames
    // anyway, so lanes and labels inside it cost no display scale. Past it,
    // one lane and its label row are allowed on each side, no more.
    const outerLanes: number[] = [];
    const outerLanesX: number[] = [];
    let labelLimit: Rect | undefined;
    const markSizes = [...routeSizes.values()];
    const edgeClearance = Math.max(metrics.clearance, borderClearance);
    if (markSizes.length > 0 && rects.size > 0) {
      const pitch = Math.max(
        routeSpacing,
        ...markSizes.map((size) => size.height + 2 * metrics.labelMargin),
      );
      const pitchX = Math.max(
        routeSpacing,
        ...markSizes.map((size) => size.width + 2 * metrics.labelMargin),
      );
      const left = Math.min(...[...rects.values()].map((rect) => rect.x));
      const right = Math.max(...[...rects.values()].map((rect) => rect.x + rect.width));
      const width = right - left;
      const height = drawingBottom - drawingTop;
      const spareX = Math.max(0, height * rowPack.targetAspect - width) / 2;
      const spareY = Math.max(0, width / rowPack.targetAspect - height) / 2;
      const allowance = edgeClearance + pitch;
      labelLimit = {
        x: left - spareX - edgeClearance - pitchX,
        y: drawingTop - spareY - allowance,
        width: width + 2 * (spareX + edgeClearance + pitchX),
        height: height + 2 * (spareY + allowance),
      };
      const lanes = Math.min(markSizes.length, OUTER_LANES, 1 + Math.floor(spareY / pitch));
      for (let lane = 1; lane <= lanes; lane += 1) {
        outerLanes.push(drawingTop - edgeClearance - lane * pitch, drawingBottom + edgeClearance + lane * pitch);
      }
      // AC-25: dense folded roots need left/right outside corridors as well —
      // the A* grid had no X lane outside the drawing, so a route that must go
      // round via the side fell back to an obstructed elbow. One X lane per
      // side mirrors the Y lanes above.
      const lanesX = Math.min(markSizes.length, OUTER_LANES, 1 + Math.floor(spareX / pitchX));
      for (let lane = 1; lane <= lanesX; lane += 1) {
        outerLanesX.push(left - edgeClearance - lane * pitchX, right + edgeClearance + lane * pitchX);
      }
    }
    // The title band of an expanded container is an obstacle for every route,
    // the ones that may cross the container wall included: a route leaving a
    // zone goes round its title, never through it.
    const sortedBarrierEntries = [...titleBands].sort(([left], [right]) => byString(left, right));
    const sortedBarriers = sortedBarrierEntries.map(([, band]) => band);
    const auditBarriers = sortedBarrierEntries.map(([entity, rect]) => ({ entity: String(entity), rect }));
    const runRouter = (reqs: typeof requests, priority?: ReadonlySet<RelationRef>) =>
      routeEdges({
        rects,
        requests: reqs,
        avoidFallbackInteriors: true,
        clearance: borderClearance,
        routeSpacing,
        barriers: sortedBarriers,
        lanes: { xs: outerLanesX, ys: outerLanes },
        ...(priority === undefined ? {} : { priority }),
      });
    let routed = runRouter(requests);

    // Deterministic conflict repair (DE-2 ask 2): when strict route spacing has
    // conflicts (e.g. a fixed 96 px gutter saturated on one face or an earlier
    // route claiming a choke-point track), first try promoting conflicted routes
    // in routing order, then greedily re-dock the most-conflicted ordinary edge
    // onto a less-congested unblocked face (updating all docks together so port
    // spacing stays exact). Zero overhead when pass 1 already yields 0 conflicts.
    if (routeSpacing > 0 && drawnEdges.length > 1) {
      const quickAudit = (outcome: typeof routed) => {
        const checked: CheckedRoute[] = [];
        for (const edge of drawnEdges) {
          const id = edge.occurrence as unknown as RelationRef;
          const pts = outcome.routes.get(id);
          if (pts === undefined) continue;
          const occ = projected.relationOccurrences[edge.occurrence]!;
          const sRole = occ.endpoints.find((ep) => ep.role === "source")!;
          const tRole = occ.endpoints.find((ep) => ep.role === "target")!;
          const style = relationPresentationFor(presentation.relations, occ.id, occ.relation);
          const arrowhead = resolveArrowhead(occ.arrowhead ?? style?.arrowhead).canonicalKind;
          const passable = new Set<string>([
            ...projectedAncestorsOf(sRole.occurrence),
            ...projectedAncestorsOf(tRole.occurrence),
          ]);
          checked.push({
            id: String(edge.occurrence),
            source: String(edge.source.entity),
            target: String(edge.target.entity),
            points: pts,
            ...(edge.source.port === undefined ? {} : { sourcePort: String(edge.source.port) }),
            ...(edge.target.port === undefined ? {} : { targetPort: String(edge.target.port) }),
            arrowhead,
            passable,
          });
        }
        return checkRouteSpacing({
          rects,
          routes: checked,
          routeSpacing,
          borderClearance,
          barriers: auditBarriers,
        });
      };
      const scoreOf = (outcome: typeof routed, report: ReturnType<typeof checkRouteSpacing>) =>
        outcome.obstructed.length * 10000 + outcome.escaped.length * 1000 + report.conflictCount;

      let bestReport = quickAudit(routed);
      let bestScore = scoreOf(routed, bestReport);
      let bestPriority: Set<RelationRef> | undefined;

      // Stage 1: promote conflicted / escaped / obstructed routes in routing order.
      // On large scenes (> 25 boxes) with > 5 initial conflicts, cap promotion to
      // one pass to keep cold layout latency well under budget.
      if (bestScore > 0) {
        const maxStage1Rounds = rects.size > 25 && bestReport.conflictCount > 5 && routed.obstructed.length === 0 ? 1 : 3;
        const promoted = new Set<RelationRef>();
        for (let round = 0; round < maxStage1Rounds && bestScore > 0; round += 1) {
          const beforeSize = promoted.size;
          for (const r of routed.obstructed) promoted.add(r);
          for (const r of routed.escaped) promoted.add(r);
          for (const conflict of bestReport.conflicts) {
            for (const r of conflict.routes) promoted.add(r as unknown as RelationRef);
          }
          if (promoted.size === beforeSize) break;
          const candidate = runRouter(requests, promoted);
          const candReport = quickAudit(candidate);
          const candScore = scoreOf(candidate, candReport);
          if (candScore < bestScore) {
            routed = candidate;
            bestReport = candReport;
            bestScore = candScore;
            bestPriority = new Set(promoted);
          } else {
            break;
          }
        }
      }

      // Stage 2: re-dock congested / escaped ordinary edges onto an unblocked face.
      // Skip Stage 2 on large scenes (> 25 boxes) that remain structurally saturated
      // (> 5 conflicts after Stage 1) so heavy legacy scenes stay well within budget.
      if (bestScore > 0 && (bestReport.conflictCount <= 5 || rects.size <= 25)) {
        const workingOverrides = new Map(sideOverrides);
        const allSides = ["west", "east", "south", "north"] as const;
        const sideScoreToward = (fromId: EntityRef, toId: EntityRef, side: PortSide): number => {
          const a = rects.get(fromId)!;
          const b = rects.get(toId)!;
          const dx = (b.x + b.width / 2) - (a.x + a.width / 2);
          const dy = (b.y + b.height / 2) - (a.y + a.height / 2);
          if (side === "east") return -dx;
          if (side === "west") return dx;
          if (side === "south") return -dy;
          return dy;
        };
        const maxStage2Calls = rects.size > 25 ? 6 : 18;
        let stage2Calls = 0;
        for (let round = 0; round < 4 && bestScore > 0 && stage2Calls < maxStage2Calls; round += 1) {
          const counts = new Map<string, number>();
          for (const r of routed.obstructed) counts.set(String(r), (counts.get(String(r)) ?? 0) + 10);
          for (const r of routed.escaped) counts.set(String(r), (counts.get(String(r)) ?? 0) + 5);
          for (const conflict of bestReport.conflicts) {
            for (const r of conflict.routes) counts.set(r, (counts.get(r) ?? 0) + 1);
          }
          const rankedEdges = [...counts.entries()]
            .sort((a, b) => b[1] - a[1] || byString(a[0], b[0]))
            .map(([id]) => drawnEdges.find((e) => String(e.occurrence) === id))
            .filter((e): e is DrawnEdge => {
              if (e === undefined) return false;
              if (e.source.entity === e.target.entity) return false;
              if (e.source.port !== undefined || e.target.port !== undefined) return false;
              if (isAncestor(filteredGraph, e.source.entity, e.target.entity) || isAncestor(filteredGraph, e.target.entity, e.source.entity)) return false;
              return true;
            });

          let improved = false;
          for (const edge of rankedEdges.slice(0, 2)) {
            if (stage2Calls >= maxStage2Calls) break;
            const id = edge.occurrence as unknown as RelationRef;
            const within = withinOf.get(id);
            const currentDock = finalDocks.get(id)!;
            const validSourceSides = allSides
              .filter((s) => (s !== "north" || !isNorthBlockedByTitle(edge.source.entity)) && sideStaysInWithin(edge.source.entity, s, within))
              .sort((a, b) => sideScoreToward(edge.source.entity, edge.target.entity, a) - sideScoreToward(edge.source.entity, edge.target.entity, b));
            const validTargetSides = allSides
              .filter((s) => (s !== "north" || !isNorthBlockedByTitle(edge.target.entity)) && sideStaysInWithin(edge.target.entity, s, within))
              .sort((a, b) => sideScoreToward(edge.target.entity, edge.source.entity, a) - sideScoreToward(edge.target.entity, edge.source.entity, b));
            const faceCandidates: (readonly [PortSide, PortSide])[] = [];
            for (const s of validSourceSides) {
              if (s !== currentDock.source.side) faceCandidates.push([s, currentDock.target.side]);
            }
            for (const t of validTargetSides) {
              if (t !== currentDock.target.side) faceCandidates.push([currentDock.source.side, t]);
            }

            let bestCandOverrides: Map<RelationRef, { readonly source: PortSide; readonly target: PortSide; readonly turn: boolean }> | undefined;
            let bestCandDocks: ReadonlyMap<RelationRef, EdgeDocks> | undefined;
            let bestCandRequests: typeof requests | undefined;
            let bestCandOutcome: typeof routed | undefined;
            let bestCandReport: typeof bestReport | undefined;
            let bestCandScore = bestScore;

            for (const [s, t] of faceCandidates) {
              if (stage2Calls >= maxStage2Calls) break;
              stage2Calls += 1;
              const candOverrides = new Map(workingOverrides);
              candOverrides.set(id, { source: s, target: t, turn: false });
              const candDocked = dockEdges({
                ...(hasFlows ? { flowBadgeSize: flowTokens.flowBadgeSize } : {}),
                graph: filteredGraph,
                rects,
                direction: "top-to-bottom",
                metrics,
                labelSizes: new Map(),
                fixed: true,
                cornerInset: dockCornerInset,
                sideOverrides: candOverrides,
              });
              if (candDocked.fixedOverflows.length > docked.fixedOverflows.length) continue;
              const candRequests = buildRequests(candDocked.docks);
              const candOutcome = runRouter(candRequests, bestPriority);
              const candReport = quickAudit(candOutcome);
              const candScore = scoreOf(candOutcome, candReport);
              if (candScore < bestCandScore) {
                bestCandScore = candScore;
                bestCandOverrides = candOverrides;
                bestCandDocks = candDocked.docks;
                bestCandRequests = candRequests;
                bestCandOutcome = candOutcome;
                bestCandReport = candReport;
                break;
              }
            }
            if (bestCandOutcome !== undefined && bestCandDocks !== undefined && bestCandRequests !== undefined && bestCandReport !== undefined && bestCandOverrides !== undefined) {
              workingOverrides.clear();
              for (const [k, v] of bestCandOverrides) workingOverrides.set(k, v);
              sideOverrides.clear();
              for (const [k, v] of bestCandOverrides) sideOverrides.set(k, v);
              finalDocks.clear();
              for (const [k, v] of bestCandDocks) finalDocks.set(k, v);
              requests = bestCandRequests;
              routed = bestCandOutcome;
              bestReport = bestCandReport;
              bestScore = bestCandScore;
              improved = true;
              break;
            }
          }
          if (!improved) break;
        }
      }
      // Stage 3: if pair conflicts still remain on a modest scene after Stage 1+2,
      // try promoting only the later-routed route of each remaining conflict (on
      // the current docks) so constrained routes claim tracks before their blockers.
      if (bestScore > 0 && rects.size <= 25) {
        const orderRank = new Map<string, number>();
        [...requests]
          .sort((a, b) => {
            const aIn = a.within !== undefined ? 0 : 1;
            const bIn = b.within !== undefined ? 0 : 1;
            if (aIn !== bIn) return aIn - bIn;
            const aDist = Math.abs(a.start.x - a.end.x) + Math.abs(a.start.y - a.end.y);
            const bDist = Math.abs(b.start.x - b.end.x) + Math.abs(b.start.y - b.end.y);
            if (Math.abs(aDist - bDist) > 1e-4) return aDist - bDist;
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
          })
          .forEach((req, idx) => orderRank.set(String(req.id), idx));
        const victims = new Set<RelationRef>();
        for (const r of routed.obstructed) victims.add(r);
        for (const r of routed.escaped) victims.add(r);
        for (const conflict of bestReport.conflicts) {
          const sorted = [...conflict.routes].sort((a, b) => (orderRank.get(b) ?? 0) - (orderRank.get(a) ?? 0));
          if (sorted.length > 0) victims.add(sorted[0] as unknown as RelationRef);
        }
        if (victims.size > 0) {
          const candidate = runRouter(requests, victims);
          const candReport = quickAudit(candidate);
          const candScore = scoreOf(candidate, candReport);
          if (candScore < bestScore) {
            routed = candidate;
            bestReport = candReport;
            bestScore = candScore;
          }
        }
      }
    }
    // AC-25: an 8 px dock exit can be blocked where a 2 px exit still threads
    // through — the retry is local (only the obstructed requests, same rects,
    // barriers and outer lanes, smaller inflation) and still avoids every raw
    // card and title-band interior (2 px grown boxes contain the raw boxes).
    // A retry that finds a clean A* route replaces the obstructed elbow.
    const retryRoutes = new Map(routed.routes);
    const retryObstructed = new Set(routed.obstructed);
    const otherRoutesOf = (id: RelationRef): (readonly Vec2[])[] =>
      requests
        .filter((candidate) => candidate.id !== id && !retryObstructed.has(candidate.id))
        .map((candidate) => retryRoutes.get(candidate.id)!)
        .filter((route): route is readonly Vec2[] => route !== undefined);
    // Parallel unlabelled bridges use a centred comb. Docks and the middle
    // legs share the same pitch. Preserve every constraint of the router.
    const parallel = new Map<string, typeof requests>();
    for (const request of requests) {
      if (edgeLayouts.has(request.id)) continue;
      const pair = parallel.get(request.pairKey) ?? [];
      pair.push(request);
      parallel.set(request.pairKey, pair);
    }
    for (const pair of parallel.values()) {
      if (pair.length < 2) continue;
      pair.sort((a, b) => byString(a.id, b.id));
      const first = pair[0]!;
      const horizontal = Math.abs(first.start.x - first.end.x) >= Math.abs(first.start.y - first.end.y);
      const center = horizontal ? (first.start.x + first.end.x) / 2 : (first.start.y + first.end.y) / 2;
      const combPitch = Math.max(
        routeSpacing,
        (horizontal ? metrics.trackSpacing : metrics.trackSpacingBlock) ?? (horizontal ? 14 : 7),
      );
      pair.forEach((request, index) => {
        const lane = center + (index - (pair.length - 1) / 2) * combPitch;
        const points = horizontal
          ? [request.start, { x: lane, y: request.start.y }, { x: lane, y: request.end.y }, request.end]
          : [request.start, { x: request.start.x, y: lane }, { x: request.end.x, y: lane }, request.end];
        const firstLeg = points.find(point => point.x !== request.start.x || point.y !== request.start.y);
        const lastLeg = [...points].reverse().find(point => point.x !== request.end.x || point.y !== request.end.y);
        if (firstLeg === undefined || lastLeg === undefined
          || (firstLeg.x - request.start.x) * request.startExit.x + (firstLeg.y - request.start.y) * request.startExit.y <= 0
          || (lastLeg.x - request.end.x) * request.endExit.x + (lastLeg.y - request.end.y) * request.endExit.y <= 0) return;
        const firstLen = Math.hypot(firstLeg.x - request.start.x, firstLeg.y - request.start.y);
        const lastLen = Math.hypot(lastLeg.x - request.end.x, lastLeg.y - request.end.y);
        if (routeSpacing > 0 && (firstLen < borderClearance - 1e-4 || lastLen < borderClearance - 1e-4)) return;
        const within = request.within;
        if (within !== undefined && points.some(point => point.x < within.x || point.y < within.y
          || point.x > within.x + within.width || point.y > within.y + within.height)) return;
        if (requests.some(other => other.id !== request.id && other.pairKey === request.pairKey
          && routesConflict(points, retryRoutes.get(other.id)!))) return;
        if (points.slice(1).some((point, i) => {
          const prev = points[i]!;
          if (shapesOf(request.id).some(shape => {
            if (rectsIntersect(shape, {
              x: Math.min(point.x, prev.x), y: Math.min(point.y, prev.y),
              width: Math.abs(point.x - prev.x), height: Math.abs(point.y - prev.y),
            })) return true;
            if (!(routeSpacing > 0)) return false;
            if (i === 0 && (Math.abs(prev.x - shape.x) < 1e-4 || Math.abs(prev.x - (shape.x + shape.width)) < 1e-4 || Math.abs(prev.y - shape.y) < 1e-4 || Math.abs(prev.y - (shape.y + shape.height)) < 1e-4)) return false;
            if (i === points.length - 2 && (Math.abs(point.x - shape.x) < 1e-4 || Math.abs(point.x - (shape.x + shape.width)) < 1e-4 || Math.abs(point.y - shape.y) < 1e-4 || Math.abs(point.y - (shape.y + shape.height)) < 1e-4)) return false;
            return segmentToRectDistance(prev, point, shape) < borderClearance - 1e-4;
          })) return true;
          if (routeSpacing > 0 && passableZonesOf(request.id).some(zone => segmentToPassableBorderDistance(prev, point, zone) < borderClearance - 1e-4)) {
            return true;
          }
          return false;
        })) return;
        if (routeSpacing > 0) {
          const candidateElbows = points.slice(1, -1);
          const violatesSpacing = otherRoutesOf(request.id).some((other) => {
            for (let i = 1; i < points.length; i += 1) {
              const a1 = points[i - 1]!;
              const a2 = points[i]!;
              for (let j = 1; j < other.length; j += 1) {
                const b1 = other[j - 1]!;
                const b2 = other[j]!;
                if (Math.abs(a1.y - a2.y) < 1e-4 && Math.abs(b1.y - b2.y) < 1e-4 && Math.abs(a1.y - b1.y) < routeSpacing - 1e-4) {
                  if (Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x)) > 1e-4) return true;
                }
                if (Math.abs(a1.x - a2.x) < 1e-4 && Math.abs(b1.x - b2.x) < 1e-4 && Math.abs(a1.x - b1.x) < routeSpacing - 1e-4) {
                  if (Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y)) > 1e-4) return true;
                }
              }
            }
            for (const e1 of candidateElbows) {
              for (let k = 1; k < other.length - 1; k += 1) {
                if (Math.hypot(e1.x - other[k]!.x, e1.y - other[k]!.y) < routeSpacing - 1e-4) return true;
              }
            }
            return false;
          });
          if (violatesSpacing) return;
        }
        retryRoutes.set(request.id, points);
        retryObstructed.delete(request.id);
      });
    }
    if (retryObstructed.size > 0 && !(routeSpacing > 0)) {
      const failed = new Set(retryObstructed);
      const retryRequests = requests.filter((request) => failed.has(request.id));
      const retried = routeEdges({
        rects,
        requests: retryRequests,
        avoidFallbackInteriors: true,
        clearance: 2,
        barriers: [...titleBands].sort(([left], [right]) => byString(left, right)).map(([, band]) => band),
        lanes: { xs: outerLanesX, ys: outerLanes },
      });
      for (const [id, points] of retried.routes) {
        if (!failed.has(id) || retried.obstructed.includes(id) || retried.escaped.includes(id)) continue;
        const request = requests.find((candidate) => candidate.id === id)!;
        if (requests.some((other) => other.id !== id && other.pairKey === request.pairKey
          && routesConflict(points, retryRoutes.get(other.id)!))) continue;
        // Preserve the routes that already succeeded, including their pair
        // reservations: the local retry did not search against those routes.
        retryRoutes.set(id, points);
        retryObstructed.delete(id);
      }
    }
    // BLK-3: an escape means the clamped route failed and the router fell back
    // to unclamped global routing — a containment failure, never silent.
    for (const id of [...routed.escaped].sort(byString)) {
      warnings.push({
        code: "route-obstructed",
        refs: [id],
        message: `route of ${id} leaves the content box of its shared container; no route inside it was found`,
      });
    }

    // Edge labels on the final routes, in ascending occurrence id; an
    // unplaced label keeps its route (AC-25 2 px retry routes replace the
    // obstructed elbows before labels are placed).
    const entries = [...edgeLayouts.entries()]
      .sort(([left], [right]) => byString(left, right))
      .map(([id, layout]) => {
        const within = withinOf.get(id);
        return {
          id,
          route: retryRoutes.get(id)!,
          size: { width: layout.width, height: layout.height },
          ...(within === undefined ? {} : { within }),
          ...(labelLimit === undefined ? {} : { limit: labelLimit }),
        };
      });
    const frameWalls = zoneShapes.flatMap(([,rect]) => [
      { x: rect.x, y: rect.y, width: rect.width, height: metrics.labelMargin },
      { x: rect.x, y: rect.y + rect.height - metrics.labelMargin, width: rect.width, height: metrics.labelMargin },
      { x: rect.x, y: rect.y, width: metrics.labelMargin, height: rect.height },
      { x: rect.x + rect.width - metrics.labelMargin, y: rect.y, width: metrics.labelMargin, height: rect.height },
    ]);
    const marks = placeFlowMarks({ plan: flowPlan, routes: retryRoutes, shapes: [...fixedShapes,...frameWalls], within: withinOf, ...(labelLimit === undefined ? {} : { limit: labelLimit }), measure, options, margin: metrics.labelMargin });
    warnings.push(...marks.warnings);
    const labelBoxes = new Map<RelationRef, Rect>();
    const taken: Rect[] = [...marks.taken];
    const unplaced: typeof entries = [];
    const detourStep = routeSpacing > 0 ? borderClearance : 2;
    const detourClearance = routeSpacing > 0 ? borderClearance : 0;
    for (const entry of entries) {
      const edge = drawnEdges.find((candidate) => (candidate.occurrence as string) === entry.id)!;
      let choice = placePackedLabel(entry, fixedShapes, taken, metrics.labelMargin);
      if (flowPlan.ranks.has(entry.id)) {
        if (choice === undefined) unplaced.push(entry);
        else { labelBoxes.set(entry.id, choice.box); taken.push(choice.box); }
        continue;
      }
      if (plan?.external.has(entry.id) && sharedContainerOf(edge.source.entity, edge.target.entity) === undefined) {
        const request = requests.find(candidate => candidate.id === entry.id)!;
        const { limit: _limit, ...unbounded } = entry;
        const route = labelDetour({ request, shapes: shapesOf(entry.id),
          earlier: requests.filter(other => other.id !== request.id && other.pairKey === request.pairKey && !retryObstructed.has(other.id)).map(other => retryRoutes.get(other.id)!),
          allFixed: otherRoutesOf(entry.id),
          passableZones: passableZonesOf(entry.id),
          step: detourStep,
          routeSpacing,
          borderClearance: detourClearance,
          xs: [...new Set([request.start.x, request.end.x, ...outerLanesX])].sort((a, b) => a - b),
          ys: [...new Set([request.start.y, request.end.y, ...outerLanes])].sort((a, b) => a - b),
          accepts: points => {
            const label = placePackedLabel({ ...unbounded, route: points }, fixedShapes, taken, metrics.labelMargin);
            return label !== undefined && (label.box.y >= drawingBottom || label.box.y + label.box.height <= drawingTop);
          },
        });
        if (route !== undefined) {
          retryRoutes.set(entry.id, route);
          retryObstructed.delete(entry.id);
          choice = placePackedLabel({ ...unbounded, route }, fixedShapes, taken, metrics.labelMargin);
        }
      }
      const probeMargin = probeMarginOf(entry.size.height);
      // Prefer the existing bridge in a capped, label-bearing gutter to an
      // exterior detour. Pass 2 will supply its measured transverse margin.
      if (plan === undefined && choice === undefined && !retryObstructed.has(entry.id) && probeMargin >= 0
        && placementParentOf(edge.source.entity) === placementParentOf(edge.target.entity)
        && placePackedLabel(entry, fixedShapes, taken, metrics.labelMargin, probeMargin) !== undefined) {
        unplaced.push(entry);
        continue;
      }
      if (choice === undefined || retryObstructed.has(entry.id)) {
        choice = undefined;
        const request = requests.find((candidate) => candidate.id === entry.id)!;
        const samePair = requests.filter((candidate) => candidate.id !== entry.id && candidate.pairKey === request.pairKey && !retryObstructed.has(candidate.id))
          .map((candidate) => retryRoutes.get(candidate.id)!);
        const allFixed = otherRoutesOf(entry.id);
        const shapes = shapesOf(entry.id);
        const margin = probeMargin;
        const xs = new Set<number>([request.start.x, request.end.x]);
        const ys = new Set<number>(outerLanes);
        for (const rect of shapes) {
          xs.add(rect.x - edgeClearance);
          xs.add(rect.x + rect.width + edgeClearance);
          for (const pad of [metrics.labelMargin, Math.max(0, margin)]) {
            const dy = Math.max(edgeClearance, entry.size.height / 2 + pad);
            ys.add(rect.y - dy);
            ys.add(rect.y + rect.height + dy);
          }
        }
        for (const end of [request.start, request.end]) {
          xs.add(end.x - entry.size.width - 2 * metrics.labelMargin);
          xs.add(end.x + entry.size.width + 2 * metrics.labelMargin);
        }
        const sortedXs = [...xs].sort((a, b) => a - b);
        const sortedYs = [...ys].sort((a, b) => a - b);
        const edgePassableZones = passableZonesOf(entry.id);
        let detour = labelDetour({ request, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
          xs: sortedXs, ys: sortedYs,
          accepts: (points) => {
            return placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined;
          },
        });
        if (detour === undefined && routeSpacing > 0) {
          const wideXs = new Set<number>([...xs, ...outerLanesX]);
          const wideYs = new Set<number>(ys);
          for (const x of [request.start.x, request.end.x, ...outerLanesX]) wideXs.add(x - routeSpacing), wideXs.add(x + routeSpacing);
          for (const y of [request.start.y, request.end.y, ...outerLanes]) wideYs.add(y - routeSpacing), wideYs.add(y + routeSpacing);
          detour = labelDetour({ request, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
            xs: [...wideXs].sort((a, b) => a - b), ys: [...wideYs].sort((a, b) => a - b),
            accepts: (points) => {
              return placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined;
            },
          });
        }
        if (detour !== undefined) {
          retryRoutes.set(entry.id, detour);
          retryObstructed.delete(entry.id);
          choice = placePackedLabel({ ...entry, route: detour }, fixedShapes, taken, metrics.labelMargin);
        } else if (margin >= 0) {
          const probeRoute = labelDetour({ request, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
            xs: sortedXs, ys: sortedYs,
            accepts: (points) => placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin, margin) !== undefined,
          });
          if (probeRoute !== undefined) retryRoutes.set(entry.id, probeRoute);
        }
        // A saturated dock exit cannot be repaired by moving the remote
        // segment. Try an ordinary pair's other faces, keeping every other
        // edge's docks and route fixed. The full-route checks still bind.
        const sharesPort = drawnEdges.some((other) => other !== edge && [other.source.port, other.target.port]
          .some((port) => port !== undefined && (port === edge.source.port || port === edge.target.port)));
        if (choice === undefined && edge.source.entity !== edge.target.entity && !sharesPort
          && !isAncestor(filteredGraph, edge.source.entity, edge.target.entity)
          && !isAncestor(filteredGraph, edge.target.entity, edge.source.entity)) {
          const sides = ["north", "south", "east", "west"] as const;
          const facePairs = [
            ...sides.map((side) => [side, side] as const),
            ...sides.flatMap((source) => sides.filter((target) => target !== source).map((target) => [source, target] as const)),
          ];
          const docksClear = (candidate: EdgeDocks): boolean => {
            if (!(routeSpacing > 0)) return true;
            for (const [otherId, otherDocks] of finalDocks) {
              if (otherId === entry.id) continue;
              for (const cDock of [candidate.source, candidate.target]) {
                for (const oDock of [otherDocks.source, otherDocks.target]) {
                  if (cDock.entity === oDock.entity && cDock.port !== undefined && cDock.port === oDock.port) continue;
                  if (cDock.entity === oDock.entity && Math.hypot(cDock.point.x - oDock.point.x, cDock.point.y - oDock.point.y) < routeSpacing - 1e-4) {
                    return false;
                  }
                }
              }
              if (Math.hypot(candidate.target.point.x - otherDocks.target.point.x, candidate.target.point.y - otherDocks.target.point.y) < routeSpacing - 1e-4) {
                return false;
              }
            }
            return true;
          };
          for (const [source, target] of facePairs) {
            const overrides = new Map(sideOverrides);
            overrides.set(entry.id, { source, target, turn: source === target });
            const pair = dockEdges({ graph: filteredGraph, rects, direction: "top-to-bottom", metrics,
              labelSizes: new Map(), fixed: true, cornerInset: dockCornerInset, sideOverrides: overrides }).docks.get(entry.id)!;
            if (!docksClear(pair)) continue;
            const alternative = { ...request, start: pair.source.point, startExit: pair.source.exit,
              end: pair.target.point, endExit: pair.target.exit };
            const route = labelDetour({ request: alternative, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
              xs: sortedXs, ys: sortedYs,
              accepts: (points) => placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined,
            });
            if (route === undefined) continue;
            retryRoutes.set(entry.id, route);
            retryObstructed.delete(entry.id);
            finalDocks.set(entry.id, pair);
            choice = placePackedLabel({ ...entry, route }, fixedShapes, taken, metrics.labelMargin);
            break;
          }
        }
      }
      if (choice === undefined) {
        // Dense inter-zone channels may exceed the aspect-based allowance.
        // Comb their labels outside the drawing rather than dropping them or
        // painting through a card. The full union below includes this column.
        const request = requests.find(candidate => candidate.id === entry.id)!;
        if (entry.within === undefined) {
          const right = Math.max(...[...rects.values()].map(rect => rect.x + rect.width));
          const pitch = Math.max(routeSpacing, ...[...labelSizes.values()].map(size => size.height + 2 * metrics.labelMargin));
          const column = right + Math.max(...[...labelSizes.values()].map(size => size.width)) / 2 + edgeClearance;
          const row = drawingBottom + edgeClearance + (entries.indexOf(entry) + 1) * pitch;
          const upperRow = drawingTop - edgeClearance - (entries.indexOf(entry) + 1) * pitch;
          const { limit: _limit, ...unbounded } = entry;
          const samePair = requests.filter(candidate => candidate.id !== entry.id && candidate.pairKey === request.pairKey && !retryObstructed.has(candidate.id))
            .map(candidate => retryRoutes.get(candidate.id)!);
          const allFixed = otherRoutesOf(entry.id);
          const comb = (earlier: readonly (readonly Vec2[])[]) => labelDetour({ request, shapes: shapesOf(entry.id), earlier, allFixed, passableZones: passableZonesOf(entry.id),
            step: detourStep, routeSpacing, borderClearance: detourClearance,
            xs: [...new Set([request.start.x, request.end.x, column, ...outerLanesX])].sort((a, b) => a - b),
            ys: [...new Set([request.start.y, request.end.y, upperRow, row, ...outerLanes])].sort((a, b) => a - b),
            accepts: points => placePackedLabel({ ...unbounded, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined,
          });
          // A saturated channel still reserves every parallel route. If no
          // exterior lane is safe, retain the explicit placement diagnostic.
          const route = comb(samePair);
          if (route !== undefined) {
            retryRoutes.set(entry.id, route);
            retryObstructed.delete(entry.id);
            choice = placePackedLabel({ ...unbounded, route }, fixedShapes, taken, metrics.labelMargin);
          }
        }
      }
      if (choice === undefined) {
        unplaced.push({ ...entry, route: retryRoutes.get(entry.id)! });
        continue;
      }
      labelBoxes.set(entry.id, choice.box);
      taken.push(choice.box);
    }
    for (const entry of unplaced) {
      warnings.push({ code: "label-unplaced", refs: [entry.id], message: `no segment holds the label of ${entry.id}` });
    }
    for (const id of [...retryObstructed].sort(byString)) {
      warnings.push({ code: "route-obstructed", refs: [id], message: `no orthogonal route around the obstacles was found for ${id}; an elbow is drawn instead` });
    }

    // §3.5 edge-aware gaps (BF-6). Every gutter of every run, read back from
    // the seated boxes: an across gutter is the lane between two shelves, an
    // along gutter the lane between slot `g` and slot `g + 1` of every shelf.
    interface Gutter {
      readonly id: string;
      /** True for a lane running horizontally: its thickness is a height. */
      readonly horizontal: boolean;
      readonly strips: readonly Rect[];
      readonly gap: number;
      readonly base: number;
      readonly authoredBase: boolean;
      readonly max: number;
      readonly zone: boolean;
    }
    const gutters: Gutter[] = [];
    for (const [key, packed] of [...packedRuns].sort(([left], [right]) => byString(left, right))) {
      const boxes = seatedBoxes.get(key);
      if (boxes === undefined || boxes.length < 2) continue;
      const rows = packed.rows;
      const zone = runHasZone(packed.run);
      const axisAuthored = (horizontal: boolean, isZone: boolean) =>
        (horizontal ? (isZone ? hints?.zoneGapX : hints?.cardGapX) : (isZone ? hints?.zoneGapY : hints?.cardGapY)) !== undefined;
      const cardAlongBase = rows ? rowGaps.cardX : rowGaps.cardY;
      const cardAcrossBase = rows ? rowGaps.cardY : rowGaps.cardX;
      const zoneAlongBase = rows ? rowGaps.zoneX : rowGaps.zoneY;
      const zoneAcrossBase = rows ? rowGaps.zoneY : rowGaps.zoneX;
      const gapAfter = (slot: number) => { const item=packed.run.items[slot]!; return "run" in item ? item.gapAfter : undefined; };
      const alongOf = (rect: Rect): [number, number] => (rows ? [rect.x, rect.x + rect.width] : [rect.y, rect.y + rect.height]);
      const acrossOf = (rect: Rect): [number, number] => (rows ? [rect.y, rect.y + rect.height] : [rect.x, rect.x + rect.width]);
      const stripOf = (along: [number, number], across: [number, number]): Rect =>
        rows
          ? { x: along[0], y: across[0], width: along[1] - along[0], height: across[1] - across[0] }
          : { x: across[0], y: along[0], width: across[1] - across[0], height: along[1] - along[0] };
      const extent: [number, number] = [
        Math.min(...boxes.map((rect) => alongOf(rect)[0])),
        Math.max(...boxes.map((rect) => alongOf(rect)[1])),
      ];
      const alongStrips = new Map<number, { readonly shelf: number; readonly slot: number; readonly strip: Rect; readonly zone: boolean }[]>();
      packed.shelves.forEach((shelf, shelfIndex) => {
        const start = acrossOf(boxes[shelf[0]!]!)[0];
        const end = Math.max(...shelf.map((slot) => acrossOf(boxes[slot]!)[1]));
        const next = packed.shelves[shelfIndex + 1];
        if (next !== undefined) {
          const nextStart = acrossOf(boxes[next[0]!]!)[0];
          const acrossZone = r7Routing ? shelfHasZone(packed.run, shelf) || shelfHasZone(packed.run, next) : zone;
          const base = r7Routing
            ? (acrossZone ? zoneAcrossBase : (gapAfter(shelf.at(-1)!) ?? cardAcrossBase))
            : (gapAfter(shelf.at(-1)!) ?? packed.acrossBase);
          gutters.push({
            id: `${key}|across|${String(shelfIndex)}`,
            horizontal: rows,
            strips: [stripOf(extent, [end, nextStart])],
            gap: nextStart - end,
            base,
            authoredBase: r7Routing && acrossZone ? false : gapAfter(shelf.at(-1)!) !== undefined || axisAuthored(!rows, acrossZone),
            max: rows ? rowGaps.maxY : rowGaps.maxX,
            zone: acrossZone,
          });
        }
        shelf.forEach((slot, index) => {
          const following = shelf[index + 1];
          if (following === undefined) return;
          const strip = stripOf([alongOf(boxes[slot]!)[1], alongOf(boxes[following]!)[0]], [start, end]);
          const pairZone = r7Routing ? itemHasZone(packed.run.items[slot]!) || itemHasZone(packed.run.items[following]!) : zone;
          (alongStrips.get(index) ?? alongStrips.set(index, []).get(index)!).push({ shelf: shelfIndex, slot, strip, zone: pairZone });
        });
      });
      for (const [index, strips] of [...alongStrips].sort(([left], [right]) => left - right)) {
        const thickness = (strip: Rect): number => (rows ? strip.width : strip.height);
        const startOf = (strip: Rect): number => (rows ? strip.x : strip.y);
        // Boxes of equal size line up: the gutters after slot `index` are one
        // lane of the level and widen together, so the grid keeps its column
        // starts. Where they do not line up — or where one shelf borders a zone
        // while another separates leaf cards on r7 — each shelf keeps its own gutter.
        const lane = strips.every(({ strip, zone: stripZone }) =>
          Math.abs(startOf(strip) - startOf(strips[0]!.strip)) <= LANE_TOLERANCE &&
          stripZone === strips[0]!.zone,
        );
        const max = rows ? rowGaps.maxX : rowGaps.maxY;
        const baseFor = (slot: number, stripZone: boolean): number =>
          r7Routing
            ? (stripZone ? zoneAlongBase : (gapAfter(slot) ?? cardAlongBase))
            : (gapAfter(slot) ?? packed.alongBase);
        if (lane) {
          const laneZone = strips[0]!.zone;
          gutters.push({
            id: `${key}|along|${String(index)}`,
            horizontal: !rows,
            strips: strips.map(({ strip }) => strip),
            gap: Math.max(...strips.map(({ strip }) => thickness(strip))),
            base: Math.max(...strips.map(({ slot, zone: stripZone }) => baseFor(slot, stripZone))),
            authoredBase: r7Routing && laneZone ? false : strips.some(({ slot }) => gapAfter(slot) !== undefined) || axisAuthored(rows, laneZone),
            max,
            zone: laneZone,
          });
        } else {
          for (const { shelf, slot, strip, zone: stripZone } of strips) {
            gutters.push({
              id: `${key}|along|${String(index)}|${String(shelf)}`,
              horizontal: !rows,
              strips: [strip],
              gap: thickness(strip),
              base: baseFor(slot, stripZone),
              authoredBase: r7Routing && stripZone ? false : gapAfter(slot) !== undefined || axisAuthored(rows, stripZone),
              max,
              zone: stripZone,
            });
          }
        }
      }
    }
    // Count each routed occurrence once in the physical channel, including lifted bundle traffic.
    // REQ-R7-14 (DE-2 ask 3): sibling-zone gutters (`gutter.zone === true`) stay fixed at `zoneGutter`
    // and never widen for traffic or labels; leaf-card channels (`!gutter.zone`) keep dynamic widening.
    const channels: LayoutChannel[] = gutters.map(gutter => {
      const edges = [...retryRoutes].filter(([, route]) => gutter.strips.some(strip => route.some((point, i) => {
        const next = route[i + 1];
        if (next === undefined) return false;
        return rectsIntersect(strip, { x: Math.min(point.x, next.x), y: Math.min(point.y, next.y),
          width: Math.abs(point.x - next.x), height: Math.abs(point.y - next.y) });
      }))).map(([id]) => String(id)).sort(byString);
      const n = edges.reduce((sum, id) => sum + (edgeBundles[id]?.members.length ?? 1), 0);
      const intersecting = [...labelBoxes.values()].filter(box => gutter.strips.some(strip => rectsIntersect(strip, box)));
      const labelled = intersecting.length > 0;
      const axis = gutter.horizontal ? 'vertical' as const : 'horizontal' as const;
      const parameters = channelMetrics(metrics, axis === 'horizontal');
      const expected = r7Routing && gutter.zone
        ? gutter.base
        : (() => {
            const placedFloor = Math.max(0, ...intersecting.map(box => (gutter.horizontal ? box.height : box.width) + 2 * metrics.labelMargin).filter(needed => needed <= gutter.max));
            return Math.min(gutter.max, Math.max(placedFloor, channelGap(n, labelled, { ...parameters, gapMin: gutter.authoredBase ? gutter.base : Math.max(parameters.gapMin, gutter.base) })));
          })();
      return {
        id: gutter.id,
        axis,
        edges,
        strips: gutter.strips,
        n,
        labelled,
        gap: gutter.gap,
        expected,
        ...(r7Routing ? { capacity: channelCapacity(gutter.gap, routeSpacing, borderClearance), zone: gutter.zone } : {}),
      };
    });
    // A widened leaf gutter that disappeared is dropped; r7 sibling-zone gutters stay fixed (REQ-R7-14).
    const unused: string[] = [];
    const gutterIds = new Set(gutters.map((gutter) => gutter.id));
    for (const id of [...(plan?.widen.keys() ?? [])].sort(byString)) if (!gutterIds.has(id)) unused.push(id);

    // A label with no room is probed with the free space of a base gap above
    // and under it: where it then fits, leaf-card lanes (and v1 lanes) it sits in
    // are asked to widen to its thickness plus its two margins — never past the
    // axis cap, and never on r7 fixed sibling-zone gutters (`r7Routing && gutter.zone`).
    const requested = new Map<string, number>();
    const probed: Rect[] = [...taken];
    for (const entry of unplaced) {
      const probe = probeMarginOf(entry.size.height);
      if (probe < 0) continue;
      const choice = placePackedLabel(entry, fixedShapes, probed, metrics.labelMargin, probe);
      if (choice === undefined) continue;
      probed.push(choice.box);
      const edge = drawnEdges.find((candidate) => (candidate.occurrence as string) === entry.id)!;
      const shared = sharedContainerOf(edge.source.entity, edge.target.entity);
      const level = shared === undefined ? ROOT_LEVEL_KEY : representativeOf(shared);
      for (const gutter of gutters) {
        if (r7Routing && gutter.zone) continue;
        // S-1: an outgoing edge may use a level's base gutter, but cannot
        // change its geometry when a different level is folded.
        if (!gutter.id.startsWith(`${level}|`)) continue;
        if (!gutter.strips.some((strip) => rectsIntersect(strip, choice.box))) continue;
        const needed = (gutter.horizontal ? entry.size.height : entry.size.width) + 2 * metrics.labelMargin;
        if (needed > gutter.max || needed <= gutter.gap) continue;
        requested.set(gutter.id, Math.max(requested.get(gutter.id) ?? 0, needed));
      }
    }

    for (const channel of channels) {
      if (r7Routing && channel.zone) {
        requested.delete(channel.id);
        continue;
      }
      const target = Math.max(requested.get(channel.id) ?? 0, channel.expected);
      if (Math.abs(target - channel.gap) > 0.5) requested.set(channel.id, target);
      else requested.delete(channel.id);
    }

    // Built-in geometric check for minimum route spacing (DE-2 ask 2).
    const checkedRoutes: CheckedRoute[] = [];
    const conventionEdges: ArrowDirectionEdgeInput[] = [];
    for (const edge of drawnEdges) {
      const id = edge.occurrence as unknown as RelationRef;
      const points = retryRoutes.get(id);
      if (points === undefined) continue;
      const occurrence = projected.relationOccurrences[edge.occurrence]!;
      const sourceRole = occurrence.endpoints.find((endpoint) => endpoint.role === "source")!;
      const targetRole = occurrence.endpoints.find((endpoint) => endpoint.role === "target")!;
      const style = relationPresentationFor(presentation.relations, occurrence.id, occurrence.relation);
      const arrowhead = resolveArrowhead(occurrence.arrowhead ?? style?.arrowhead)?.canonicalKind ?? "arrow";
      const passable = new Set<string>([
        ...projectedAncestorsOf(sourceRole.occurrence),
        ...projectedAncestorsOf(targetRole.occurrence),
      ]);
      const flowArrows = marks.arrows[edge.occurrence];
      const startPt = points[0];
      const startArrowhead =
        flowArrows !== undefined &&
        startPt !== undefined &&
        flowArrows.some((a) => Math.hypot(a.tip.x - startPt.x, a.tip.y - startPt.y) <= 1e-4);
      checkedRoutes.push({
        id: String(edge.occurrence),
        source: String(edge.source.entity),
        target: String(edge.target.entity),
        points,
        ...(edge.source.port === undefined ? {} : { sourcePort: String(edge.source.port) }),
        ...(edge.target.port === undefined ? {} : { targetPort: String(edge.target.port) }),
        arrowhead,
        ...(startArrowhead ? { startArrowhead: true } : {}),
        passable,
      });
      if (options.conventions?.arrowDirection === true) {
        const semanticRelation = document.relations[occurrence.relation];
        const semSource = semanticRelation?.endpoints.find((ep) => ep.role === "source")?.target;
        const semTarget = semanticRelation?.endpoints.find((ep) => ep.role === "target")?.target;
        conventionEdges.push({
          id: String(edge.occurrence),
          relationId: String(occurrence.relation),
          sourceEntity: String(edge.source.entity),
          targetEntity: String(edge.target.entity),
          sourceOccurrence: String(sourceRole.occurrence),
          targetOccurrence: String(targetRole.occurrence),
          ...(semSource === undefined ? {} : { semanticSourceEntity: String(semSource) }),
          ...(semTarget === undefined ? {} : { semanticTargetEntity: String(semTarget) }),
          arrowhead,
        });
      }
    }
    if (options.conventions !== undefined) {
      const conventionZones: ZoneTagLintEntry[] = [];
      if (options.conventions.zoneTagAcronyms === true) {
        for (const id of [...rects.keys()].sort(byString)) {
          const kind = kinds.get(id);
          if (kind !== "container-expanded" && kind !== "container-collapsed") continue;
          const occ = representativeOf(id);
          const entry = presentation.entities[occ];
          conventionZones.push({ id: String(occ), tag: entry?.text?.kicker });
        }
      }
      warnings.push(
        ...lintDiagramConventions({
          options: options.conventions,
          document,
          edges: conventionEdges,
          zones: conventionZones,
        }),
      );
    }
    const routeSpacingReport = routeSpacing > 0
      ? checkRouteSpacing({
          rects,
          routes: checkedRoutes,
          routeSpacing,
          borderClearance,
          channels,
          barriers: auditBarriers,
        })
      : undefined;
    if (routeSpacingReport !== undefined) {
      for (const conflict of routeSpacingReport.conflicts) {
        warnings.push({
          severity: "info",
          code: conflict.kind === "channel-capacity-exceeded" ? "channel-capacity-exceeded" : "route-spacing-conflict",
          refs: conflict.routes,
          message: conflict.message,
          details: {
            kind: conflict.kind,
            actual: conflict.actual,
            required: conflict.required,
            ...(conflict.entity === undefined ? {} : { entity: conflict.entity }),
            ...(conflict.channelId === undefined ? {} : { channelId: conflict.channelId }),
          },
        });
      }
    }

    // Emit the view plus measurements.
    const placedView = buildMeasuredView(
      document,
      filteredGraph,
      rects,
      finalDocks,
      retryRoutes,
      options,
      foldMetadata,
      drawnEdges,
    );
    const bounds = unionOf(rects, retryRoutes, new Map([...labelBoxes, ...Object.entries(marks.badges).map(([id,box]) => [id as RelationRef,box] as const), ...Object.entries(marks.arrows).flatMap(([id,arrows]) => arrows.map((arrow,i) => [(id + String(i)) as RelationRef,arrow.box] as const))]));
    const width = bounds.width;
    const zoom = bounds.empty ? 1 : Math.min(1, Math.max(MIN_ZOOM, options.targetWidth / width));
    const camera = bounds.empty ? { x: 0, y: 0 } : { x: bounds.xmin, y: bounds.ymin };
    const view: ViewDocument = {
      ...placedView,
      presentation: {
        ...placedView.presentation,
        camera: { x: clean(camera.x), y: clean(camera.y), zoom },
      },
    };
    const measurements: LayoutMeasurements = {
      headers: [...headers.values()].sort((left, right) => byString(left.occurrence, right.occurrence)),
      slots: [...slots].sort(
        (left, right) => byString(left.occurrence, right.occurrence) || byString(left.role, right.role),
      ),
      overflows: [...overflows].sort(
        (left, right) => byString(left.occurrence, right.occurrence) || byString(left.slot, right.slot),
      ),
    };
    const result: LayoutResult = {
      status: "laid-out",
      ...(hasFlows ? { badgeBoxes: marks.badges, arrowBoxes: marks.arrows, flowBundles: flowPlan.bundles, flowTargets: marks.targets, flowRepairPasses: 0 as const } : {}),
      view,
      fit: {
        direction: "top-to-bottom",
        width,
        height: bounds.height,
        zoom,
        pans: width * zoom > options.targetWidth,
        phone: options.targetWidth <= PHONE_MAX_WIDTH,
      },
      warnings,
      measurements,
      orientations: Object.fromEntries(
        [...orientationRecord].sort(([left], [right]) => byString(left, right)),
      ) as Readonly<Record<string, LevelOrientation>>,
      channels,
      ...(routeSpacingReport === undefined ? {} : { routeSpacing: routeSpacingReport }),
      labelBoxes: Object.fromEntries(
        [...labelBoxes]
          .sort(([left], [right]) => byString(left, right))
          .map(([id, box]) => [id, { x: clean(box.x), y: clean(box.y), width: box.width, height: box.height }] as const),
      ),
      ...(Object.keys(edgeBundles).length === 0 ? {} : { edgeBundles }),
    };
    return { result, chosen, requested, unused, unplaced: unplaced.length };
  };

  // Freeze the figure arrangement, then solve channel demand from actual routes and labels.
  const first = runPass(undefined);
  const frozen = first.chosen;
  const widen = new Map<string, number>();
  const external = new Set<string>();
  const seen = new Map<string, PassOutcome>();
  let outcome = first;
  let previous: PassOutcome | undefined;
  for (let round = 0; round < 24 && (outcome.requested.size > 0 || outcome.unused.length > 0); round += 1) {
    const signature = JSON.stringify(outcome.result.status === "laid-out" ? outcome.result.channels?.map(channel => [channel.id, channel.gap, channel.n, channel.labelled]) : []);
    const repeated = seen.get(signature);
    if (repeated !== undefined && outcome.result.status === "laid-out") {
      // A label switching between two available U channels can otherwise
      // oscillate with their demands. Give that root-level relation an
      // exterior comb slot; cards and headers remain routing obstacles.
      const current = outcome.result.channels ?? [];
      for (const edge of drawnEdges) {
        if (sharedContainerOf(edge.source.entity, edge.target.entity) !== undefined) continue;
        const id = edge.occurrence;
        if (!edgeLayouts.has(id as unknown as RelationRef)) continue;
        const memberships = previous?.result.status === "laid-out"
          ? (previous.result.channels ?? []).filter(channel => channel.edges.includes(id)).map(channel => channel.id) : [];
        const now = current.filter(channel => channel.edges.includes(id)).map(channel => channel.id);
        const oldBox = previous?.result.status === "laid-out" ? previous.result.labelBoxes?.[id] : undefined;
        const newBox = outcome.result.labelBoxes?.[id];
        const oldLabels = previous?.result.status === "laid-out" && oldBox !== undefined
          ? (previous.result.channels ?? []).filter(channel => channel.strips.some(strip => rectsIntersect(strip, oldBox))).map(channel => channel.id) : [];
        const newLabels = newBox === undefined ? []
          : current.filter(channel => channel.strips.some(strip => rectsIntersect(strip, newBox))).map(channel => channel.id);
        if (JSON.stringify(memberships) !== JSON.stringify(now) || JSON.stringify(oldLabels) !== JSON.stringify(newLabels)) external.add(id);
      }
      seen.clear();
    }
    seen.set(signature, outcome);
    for (const id of outcome.unused) widen.delete(id);
    for (const [id, gap] of outcome.requested) widen.set(id, gap);
    previous = outcome;
    outcome = runPass({ frozen, widen, external });
  }
  // When strict route spacing reports channel capacity overflow inside an
  // auto-packed level (e.g. a folded child causes a column/row stack whose
  // single fixed gutter has lower capacity than the edges crossing it), try
  // flipping that level's orientation (`rows` <-> `columns`) and adopt it ONLY
  // when it completely resolves all route-spacing conflicts without introducing
  // obstructions.
  if (
    routeSpacing > 0 &&
    filteredGraph.nodes.size <= 25 &&
    outcome.result.status === "laid-out" &&
    (outcome.result.routeSpacing?.conflictCount ?? 0) > 0
  ) {
    const candidateKeys = new Set<string>();
    for (const conflict of outcome.result.routeSpacing!.conflicts) {
      if (conflict.kind !== "channel-capacity-exceeded" || conflict.channelId === undefined) continue;
      const key = conflict.channelId.split("|")[0];
      if (key !== undefined && outcome.result.orientations?.[key] !== undefined) {
        candidateKeys.add(key);
      }
    }
    const metricOf = (pass: PassOutcome): readonly [number, number, number] => {
      if (pass.result.status !== "laid-out") return [Infinity, Infinity, Infinity];
      const obs = pass.result.warnings.filter((w) => w.code === "route-obstructed").length;
      const cc = pass.result.routeSpacing?.conflictCount ?? 0;
      return [obs, cc, pass.unplaced];
    };

    let bestMetric = metricOf(outcome);
    const maxFlipCandidates = 2;
    for (const key of [...candidateKeys].sort(byString).slice(0, maxFlipCandidates)) {
      if (bestMetric[0] === 0 && bestMetric[1] === 0) break;
      const currentOrient = outcome.result.status === "laid-out" ? outcome.result.orientations?.[key] : undefined;
      if (currentOrient === undefined) continue;
      const flipped: LevelOrientation = currentOrient === "rows" ? "columns" : "rows";
      const overrides = new Map<string, LevelOrientation>([[key, flipped]]);
      const candidate = runPass(undefined, overrides);
      const candMetric = metricOf(candidate);
      if (candMetric[0] === 0 && candMetric[1] === 0) {
        outcome = candidate;
        bestMetric = candMetric;
      }
    }
  }

  if (outcome.result.status === "laid-out" && outcome.requested.size > 0) return { ...outcome.result,
    warnings: [...outcome.result.warnings, { code: "channel-unresolved", refs: [...outcome.requested.keys()],
      message: "Channel demands did not settle within the bounded routing pass" }] };
  return outcome.result;
}

function unionOf(
  rects: ReadonlyMap<EntityRef, Rect>,
  routes: ReadonlyMap<RelationRef, readonly Vec2[]>,
  labels: ReadonlyMap<RelationRef, Rect>,
): { empty: boolean; xmin: number; ymin: number; width: number; height: number } {
  let empty = true;
  let xmin = Number.POSITIVE_INFINITY;
  let xmax = Number.NEGATIVE_INFINITY;
  let ymin = Number.POSITIVE_INFINITY;
  let ymax = Number.NEGATIVE_INFINITY;
  const extend = (x: number, y: number): void => {
    empty = false;
    if (x < xmin) xmin = x;
    if (x > xmax) xmax = x;
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
  };
  for (const rect of rects.values()) {
    extend(rect.x, rect.y);
    extend(rect.x + rect.width, rect.y + rect.height);
  }
  for (const route of routes.values()) for (const point of route) extend(point.x, point.y);
  for (const box of labels.values()) {
    extend(box.x, box.y);
    extend(box.x + box.width, box.y + box.height);
  }
  if (empty) return { empty: true, xmin: 0, ymin: 0, width: 0, height: 0 };
  return { empty: false, xmin, ymin, width: xmax - xmin, height: ymax - ymin };
}

type MeasuredFoldMetadata = {
  groups: Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }>;
  filters: ViewDocument["filters"];
  presentationState: ViewDocument["presentation"];
  summaryLabels: ViewDocument["summaryLabels"];
  projected: ViewDocument;
  representativeOf: (entity: EntityRef) => OccurrenceRef;
};

function buildMeasuredView(
  document: SemanticDocument,
  graph: LayoutGraph,
  rects: ReadonlyMap<EntityRef, Rect>,
  docks: ReadonlyMap<RelationRef, EdgeDocks>,
  routes: ReadonlyMap<RelationRef, readonly Vec2[]>,
  options: LayoutOptions,
  foldMetadata: MeasuredFoldMetadata,
  drawnEdges: readonly DrawnEdge[],
): ViewDocument {
  const projected = foldMetadata.projected;
  const maxContainerDepth = Math.max(
    -1,
    ...[...graph.nodes.values()].filter((node) => node.kind === "container").map((node) => node.depth),
  );
  const entityOccurrences: Record<string, EntityOccurrence> = {};
  for (const occurrence of Object.values(projected.entityOccurrences).sort((left, right) =>
    byString(left.id, right.id),
  )) {
    const rect = rects.get(occurrence.entity);
    const node = graph.nodes.get(occurrence.entity);
    if (rect !== undefined && node !== undefined) {
      entityOccurrences[occurrence.id] = {
        ...occurrence,
        geometry: { x: clean(rect.x), y: clean(rect.y), width: clean(rect.width), height: clean(rect.height) },
        z: node.kind === "container" ? node.depth - (maxContainerDepth + 1) : 0,
      };
    } else {
      entityOccurrences[occurrence.id] = { ...occurrence };
    }
  }
  const portOccurrences: Record<string, PortOccurrence> = {};
  for (const occurrence of Object.values(projected.portOccurrences)) {
    portOccurrences[occurrence.id] = { ...occurrence };
  }
  // Relation occurrences keep their projected identities; only drawn
  // occurrences take waypoints, looked up by occurrence id.
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  for (const occurrence of Object.values(projected.relationOccurrences).sort((left, right) =>
    byString(left.id, right.id),
  )) {
    const style = relationPresentationFor(options.presentation?.relations, occurrence.id, occurrence.relation);
    const styledOccurrence: RelationOccurrence = {
      ...occurrence,
      ...(occurrence.strokeStyle === undefined && style?.strokeStyle !== undefined ? { strokeStyle: style.strokeStyle } : {}),
      ...(occurrence.arrowhead === undefined && style?.arrowhead !== undefined ? { arrowhead: style.arrowhead } : {}),
      ...(occurrence.emphasis === undefined && style?.emphasis !== undefined ? { emphasis: style.emphasis } : {}),
    };
    const occurrenceId = occurrence.id as unknown as RelationRef;
    const pair = docks.get(occurrenceId);
    const route = routes.get(occurrenceId);
    if (pair !== undefined && route !== undefined) {
      const waypoints = route
        .slice(
          pair.source.port === undefined ? 0 : 1,
          pair.target.port === undefined ? route.length : route.length - 1,
        )
        .map((point) => ({ x: clean(point.x), y: clean(point.y) }));
      relationOccurrences[occurrence.id] = { ...styledOccurrence, waypoints };
    } else {
      const { waypoints: _oldRoute, ...retained } = styledOccurrence;
      relationOccurrences[occurrence.id] = document.relations[occurrence.relation]?.type === "flow-step" ? retained : { ...styledOccurrence };
    }
  }
  // Ports keep their projected identities: every drawn end landing on a
  // port occurrence updates that occurrence in place through its actual
  // projected endpoint id. Nothing is generated here, so an authored port
  // occurrence stays one drawing. When several drawn ends share one port
  // occurrence, the smallest (edge, role) wins, deterministically.
  const portClaims = new Map<OccurrenceRef, { readonly edge: OccurrenceRef; readonly role: string; readonly dock: Dock }[]>();
  for (const edge of [...drawnEdges].sort((left, right) => byString(left.occurrence, right.occurrence))) {
    const pair = docks.get(edge.occurrence as unknown as RelationRef);
    if (pair === undefined) continue;
    const occurrence = projected.relationOccurrences[edge.occurrence];
    if (occurrence === undefined) continue;
    for (const [dock, role] of [
      [pair.source, "source"],
      [pair.target, "target"],
    ] as const) {
      if (dock.port === undefined) continue;
      const endpoint = occurrence.endpoints.find((candidate) => candidate.role === role);
      if (endpoint === undefined || projected.portOccurrences[endpoint.occurrence] === undefined) continue;
      const claims = portClaims.get(endpoint.occurrence) ?? [];
      claims.push({ edge: edge.occurrence, role, dock });
      portClaims.set(endpoint.occurrence, claims);
    }
  }
  for (const [id, claims] of [...portClaims].sort(([left], [right]) => byString(left, right))) {
    const winner = [...claims].sort(
      (left, right) => byString(left.edge, right.edge) || byString(left.role, right.role),
    )[0]!;
    const existing = portOccurrences[id]!;
    portOccurrences[id] = {
      ...existing,
      side: winner.dock.side,
      order: winner.dock.order,
      anchor: clean(winner.dock.anchor),
    };
  }
  const summaryLabels =
    foldMetadata.summaryLabels === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(foldMetadata.summaryLabels).filter(
            ([, definition]) =>
              entityOccurrences[definition.sourceOccurrence] !== undefined &&
              entityOccurrences[definition.targetOccurrence] !== undefined,
          ),
        );
  return {
    viewId: options.viewId ?? viewRef("layout"),
    semanticDocumentId: document.documentId,
    revision: document.revision,
    entityOccurrences,
    relationOccurrences,
    portOccurrences,
    groups: foldMetadata.groups as ViewDocument["groups"],
    filters: [...foldMetadata.filters],
    presentation: foldMetadata.presentationState,
    ...(summaryLabels === undefined || Object.keys(summaryLabels).length === 0 ? {} : { summaryLabels }),
  };
}

export function layoutFolded(
  document: SemanticDocument,
  sourceView: ViewDocument,
  options: LayoutOptions,
): LayoutResult {
  if (sourceView.semanticDocumentId !== document.documentId) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "sourceView", message: "the source view draws another document" }],
      diagnostics: [],
    };
  }
  return layoutMeasured(document, options, sourceView);
}

function readMeasuredGraph(
  document: SemanticDocument,
  registry: ProfileRegistry,
): { readonly graph: LayoutGraph } | { readonly refusals: readonly { code: "entity-profile-unsupported" | "entity-type-unsupported" | "relation-type-unsupported"; path: string; message: string; refs: readonly string[] }[] } {
  const refusals: { code: "entity-profile-unsupported" | "entity-type-unsupported" | "relation-type-unsupported"; path: string; message: string; refs: readonly string[] }[] = [];
  const resolver = createTypeResolver(document);
  const kinds = new Map<EntityRef, LayoutNode["kind"]>();
  for (const key of Object.keys(document.entities).sort(byString)) {
    const entity = document.entities[key]!;
    if (entity.type === "flow-scenario") continue;
    const profile = registry.get(entity.profile as never);
    if (profile === undefined) {
      refusals.push({
        code: "entity-profile-unsupported",
        path: `entities.${key}.profile`,
        message: `the layout engine lays out generic@1 and generic@2 entities; ${entity.id} is ${entity.profile}`,
        refs: [entity.id],
      });
      continue;
    }
    if (entity.profile !== "generic@1" && entity.profile !== "generic@2") {
      refusals.push({
        code: "entity-profile-unsupported",
        path: `entities.${key}.profile`,
        message: `the layout engine lays out generic@1 and generic@2 entities; ${entity.id} is ${entity.profile}`,
        refs: [entity.id],
      });
      continue;
    }
    const resolution = resolver.resolve(profile, entity.type);
    if (!resolution.ok) {
      refusals.push({
        code: "entity-type-unsupported",
        path: `entities.${key}.type`,
        message: `the layout engine lays out node, container, legend and legend-key entities; ${entity.id} is ${entity.type}`,
        refs: [entity.id],
      });
      continue;
    }
    const family = resolution.resolved.familyType;
    const allowed = entity.profile === "generic@1" ? ["node", "container"] : ["node", "container", "legend", "legend-key"];
    if (!allowed.includes(family)) {
      refusals.push({
        code: "entity-type-unsupported",
        path: `entities.${key}.type`,
        message: `the layout engine lays out node, container, legend and legend-key entities; ${entity.id} is ${entity.type}`,
        refs: [entity.id],
      });
      continue;
    }
    const isContainer =
      entity.profile === "generic@1" ? family === "container" : resolution.resolved.container === true;
    kinds.set(entity.id, isContainer ? "container" : "node");
  }
  const parentOf = new Map<EntityRef, EntityRef>();
  const edges: LayoutEdge[] = [];
  for (const key of Object.keys(document.relations).sort(byString)) {
    const relation = document.relations[key]!;
    const owner = registry.get(relation.profile);
    const baseType = owner === undefined ? relation.type : relationBaseType(document, owner, relation);
    if (
      (relation.profile !== "generic@1" && relation.profile !== "generic@2") ||
      (baseType !== "contains" && baseType !== "link")
    ) {
      if (baseType === "contains" || baseType === "link") {
        refusals.push({
          code: "entity-profile-unsupported",
          path: `relations.${key}.profile`,
          message: `the layout engine lays out generic@1 and generic@2 relations; ${relation.id} is ${relation.profile} ${relation.type}`,
          refs: [relation.id],
        });
      } else {
        refusals.push({
          code: "relation-type-unsupported",
          path: `relations.${key}.type`,
          message: `the layout engine lays out link and contains relations; ${relation.id} is ${relation.profile} ${relation.type}`,
          refs: [relation.id],
        });
      }
      continue;
    }
    const role = (name: string) => relation.endpoints.find((endpoint) => endpoint.role === name)?.target;
    if (baseType === "contains") {
      const parent = role("parent") as EntityRef | undefined;
      const child = role("child") as EntityRef | undefined;
      if (parent !== undefined && child !== undefined) parentOf.set(child, parent);
      continue;
    }
    const end = (name: string): { entity: EntityRef; port?: import("@sentropic/diagram-core").PortRef } | undefined => {
      const target = role(name);
      if (target === undefined) return undefined;
      if (target.startsWith("port:")) {
        const port = document.ports[target];
        return port === undefined ? undefined : { entity: port.owner, port: port.id };
      }
      return { entity: target as EntityRef };
    };
    const source = end("source");
    const target = end("target");
    if (source === undefined || target === undefined) continue;
    const labelAttr = (relation.attributes as Record<string, { kind?: unknown; value?: unknown }> | undefined)?.["label"];
    const label =
      labelAttr !== undefined && labelAttr.kind === "text" && typeof labelAttr.value === "string" && labelAttr.value !== ""
        ? labelAttr.value
        : undefined;
    edges.push({ id: relation.id, source, target, ...(label === undefined ? {} : { label }) });
  }
  if (refusals.length > 0) return { refusals };
  const children = new Map<EntityRef, EntityRef[]>();
  for (const id of kinds.keys()) children.set(id, []);
  for (const [child, parent] of parentOf) children.get(parent)?.push(child);
  const depthOf = (id: EntityRef): number => {
    let depth = 0;
    for (let cursor = parentOf.get(id); cursor !== undefined; cursor = parentOf.get(cursor)) depth += 1;
    return depth;
  };
  const nodes = new Map<EntityRef, LayoutNode>();
  for (const id of [...kinds.keys()].sort(byString)) {
    const labelAttr = (document.entities[id]?.attributes as Record<string, { kind?: unknown; value?: unknown }> | undefined)?.[
      "name"
    ];
    const label =
      labelAttr !== undefined && labelAttr.kind === "text" && typeof labelAttr.value === "string" ? labelAttr.value : "";
    nodes.set(id, {
      id,
      kind: kinds.get(id)!,
      label,
      parent: parentOf.get(id),
      children: [...(children.get(id) ?? [])].sort(byString),
      depth: depthOf(id),
    });
  }
  const roots = [...nodes.values()].filter((node) => node.parent === undefined).map((node) => node.id);
  return { graph: { nodes, roots, edges } };
}

interface LevelPart {
  readonly group?: LayoutGroup;
  readonly members: readonly EntityRef[];
}

/** Partition one sibling level into authored groups (declared order) plus the rest. */
function groupsForLevel(members: readonly EntityRef[], hints: LayoutHints): LevelPart[] | undefined {
  const set = new Set(members);
  if (set.size === 0) return undefined;
  const groups = (hints.grouping ?? []).filter((group) => {
    const leaves = groupLeaves(group);
    return leaves.length > 0 && leaves.every((leaf) => set.has(leaf));
  });
  if (groups.length === 0) return undefined;
  const grouped = new Set<EntityRef>();
  for (const group of groups) for (const leaf of groupLeaves(group)) grouped.add(leaf);
  const rest = members.filter((member) => !grouped.has(member));
  return [...groups.map((group) => ({ group, members: groupLeaves(group) })), ...(rest.length > 0 ? [{ members: rest }] : [])];
}
