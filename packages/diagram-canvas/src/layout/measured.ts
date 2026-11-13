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
  localIdOf,
  occurrenceRef,
  parentOccurrenceOf,
  projectView,
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
  type RelationRef,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import { dockEdges, type Dock, type EdgeDocks } from "./dock.js";
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
import { ZONE_GEOMETRY } from "../presentation/diagramCardModel.js";
import { placePackedLabel } from "./labels.js";
import {
  CONTENT_INSET,
  DEFAULT_ALLOCATED_LINES,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  headerAvailableWidth,
  headerOverflows,
  innerWidthOf,
  LAST_CHILD_TO_BOTTOM_GAP,
  LEGEND_KEY_HEIGHT,
  measureHeader,
  RULE_TO_FIRST_CHILD_GAP,
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
import { chooseOrientation, packColumns, packRows, seatShelves, type PackBox } from "./pack.js";
import { labelDetour, routeEdges, routesConflict } from "./route.js";
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
  const presentation = options.presentation;
  if (presentation === undefined) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "presentation", message: "measured layout needs presentation.diagram" }],
      diagnostics: [],
    };
  }
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
      const entry = presentation.entities[id];
      const kind = kinds.get(projected.entityOccurrences[id]?.entity!);
      const expanded = kind === "container-expanded" || kind === "legend-expanded";
      box = measureSceneBox(expanded && entry?.form === "card" ? { ...entry, form: "container" } : entry,
        id, width, collapsed, measure);
      sceneBoxCache.set(key, box);
    }
    return box;
  };
  const validationOptions =
    options.bindings === undefined ? { registry: options.registry } : { registry: options.registry, bindings: options.bindings };
  const diagnostics = validateDocument(document, validationOptions);
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
  const metrics: LayoutMetrics = { ...DEFAULT_LAYOUT_METRICS, ...options.metrics };
  const hints: LayoutHints = options.hints ?? {};
  const gaps = resolveGaps(options.hints, metrics);
  const globalStretch = hints.stretch ?? false;
  // DC-2a row-pack (SPEC_EVOL_DC2A §3–§4, AC-1): every measured view is
  // packed; `options.rowPack` only tunes the objective.
  const rowPack = resolveRowPack(options.rowPack);
  const rowGaps = resolveRowGaps(hints, metrics);
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
    refuseGap("hints.zoneGapX", "zoneGapX", rowGaps.zoneX, rowGaps.maxX);
    refuseGap("hints.cardGapY", "cardGapY", rowGaps.cardY, rowGaps.maxY);
    refuseGap("hints.zoneGapY", "zoneGapY", rowGaps.zoneY, rowGaps.maxY);
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
      relationOccurrences[occurrence] = {
        id: occurrence,
        relation: edge.id,
        endpoints: [
          { role: "source", occurrence: sourceOccurrence },
          { role: "target", occurrence: targetOccurrence },
        ],
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
      presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram: presentation },
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
    presentationState: { ...projected.presentation, diagram: presentation },
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
  const runHasZone = (run: Run): boolean =>
    run.items.some((item) => ("entity" in item ? kinds.get(item.entity) !== "leaf" : runHasZone(item.run)));

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
    if (document.relations[occurrence.relation]?.type !== "link") continue;
    const sourceEnd = occurrence.endpoints.find((endpoint) => endpoint.role === "source");
    const targetEnd = occurrence.endpoints.find((endpoint) => endpoint.role === "target");
    if (sourceEnd === undefined || targetEnd === undefined) continue;
    const source = resolveDrawnEnd(sourceEnd.occurrence);
    const target = resolveDrawnEnd(targetEnd.occurrence);
    if (source === undefined || target === undefined) continue;
    drawnEdges.push({ occurrence: occurrence.id, relation: occurrence.relation, source, target });
  }
  const edgeBundles: Record<string, { members: string[]; label: string; title: string }> = {};
  const liftedPairs = new Map<string, DrawnEdge[]>();
  for (const edge of drawnEdges) {
    const projectedEdge = projected.relationOccurrences[edge.occurrence]!;
    if (!projectedEdge.endpoints.some(end => end.sourceOccurrence !== undefined)) continue;
    const key = JSON.stringify([edge.source.entity, edge.target.entity]);
    const pair = liftedPairs.get(key) ?? [];
    pair.push(edge);
    liftedPairs.set(key, pair);
  }
  const bundled = new Set<string>();
  for (const pair of liftedPairs.values()) {
    if (pair.length < 2) continue;
    const first = pair[0]!;
    edgeBundles[first.occurrence] = { members: pair.map(edge => edge.occurrence),
      label: `${pair.length} relations`,
      title: pair.map(edge => edgeLabelOf(document, edge.relation) ?? edge.relation).join("\n") };
    pair.slice(1).forEach(edge => bundled.add(edge.occurrence));
  }
  for (let index = drawnEdges.length - 1; index >= 0; index -= 1) {
    if (bundled.has(drawnEdges[index]!.occurrence)) drawnEdges.splice(index, 1);
  }
  const filteredGraph: LayoutGraph = {
    nodes: new Map([...graph.nodes].filter(([id]) => visible(id))),
    roots: graph.roots.filter(visible),
    edges: drawnEdges.map((edge) => ({
      id: edge.occurrence as unknown as RelationRef,
      source:
        edge.source.port === undefined
          ? { entity: edge.source.entity }
          : { entity: edge.source.entity, port: edge.source.port },
      target:
        edge.target.port === undefined
          ? { entity: edge.target.entity }
          : { entity: edge.target.entity, port: edge.target.port },
    })),
  };
  // Edge labels, measured once: keyed by the projected relation occurrence id.
  const labelSizes = new Map<RelationRef, { width: number; height: number }>();
  const edgeLayouts = new Map<RelationRef, LineLayout>();
  for (const edge of drawnEdges) {
    const label = edgeBundles[edge.occurrence]?.label ?? edgeLabelOf(document, edge.relation);
    if (label === undefined) continue;
    const layout = measure({
      text: label,
      role: "edge-label",
      availableWidth: EDGE_LABEL_WIDTH,
      allocatedLines: DEFAULT_ALLOCATED_LINES["edge-label"],
      folded: false,
    });
    const occurrenceId = edge.occurrence as unknown as RelationRef;
    edgeLayouts.set(occurrenceId, layout);
    labelSizes.set(occurrenceId, { width: layout.width, height: layout.height });
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
  const runPass = (plan: PassPlan | undefined): PassOutcome => {
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
      if (frozen !== undefined && frozen.shelves.reduce((count, shelf) => count + shelf.length, 0) === boxes.length) {
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
      chosen.set(run.key, { orientation, shelves });
      if (run.mode === "auto" && boxes.length > 0) orientationRecord.set(run.key, orientation);
      const rows = orientation === "rows";
      const alongBase = rows ? baseX : baseY;
      const acrossBase = rows ? baseY : baseX;
      // §3.5: a gutter keeps its base gap (or the authored `gapAfter` of the
      // group before it) unless the plan widens it for a label. One along gap
      // per slot index on every shelf: the grid keeps its column starts.
      const gapAfterOf = (slot: number): number | undefined => {
        const item = run.items[slot]!;
        return "run" in item ? item.gapAfter : undefined;
      };
      const seated = seatShelves(
        boxes,
        shelves,
        orientation,
        (shelf, slot) =>
          Math.max(
            gapAfterOf(shelves[shelf]![slot]!) ?? alongBase,
            plan?.widen.get(`${run.key}|along|${String(slot)}`) ?? 0,
            plan?.widen.get(`${run.key}|along|${String(slot)}|${String(shelf)}`) ?? 0,
          ),
        (shelf) => {
          const last = shelves[shelf]![shelves[shelf]!.length - 1]!;
          return Math.max(gapAfterOf(last) ?? acrossBase, plan?.widen.get(`${run.key}|across|${String(shelf)}`) ?? 0);
        },
      );
      packedRuns.set(run.key, { run, rows, shelves, boxes, positions: seated.positions, alongBase, acrossBase });
      return { width: seated.width, height: seated.height };
    };
    const sizeBox = (id: EntityRef): { width: number; height: number } => {
      const kind = kinds.get(id)!;
      if (kind === "leaf" || kind === "container-collapsed" || kind === "legend-collapsed") {
        outerWidths.set(id, FIXED_CARD_WIDTH);
        const entry = presentation.entities[representativeOf(id)];
        const measured = entry === undefined ? { width: FIXED_CARD_WIDTH, height: FIXED_CARD_HEIGHT }
          : sceneBoxAt(representativeOf(id), FIXED_CARD_WIDTH, kind !== "leaf");
        const size = { width: measured.width, height: measured.height };
        packedSizes.set(id, size);
        return size;
      }
      if (kind === "legend-key") return { width: innerWidthOf(FIXED_CARD_WIDTH), height: LEGEND_KEY_HEIGHT };
      const hasIcon = presentation.entities[representativeOf(id)]?.icon !== undefined;
      const headerReserve = ZONE_GEOMETRY.headerTextInset - (hasIcon ? 0 : ZONE_GEOMETRY.iconSize + ZONE_GEOMETRY.iconTextGap);
      const headerDriven = unwrappedHeaderWidth(id) + headerReserve;
      const floor = Math.max(FIXED_CARD_WIDTH, headerDriven);
      const ordered = orderedChildrenOf(id);
      const headerHeight = headerHeightOf(id, floor);
      if (kind === "legend-expanded") {
        // A legend stays a single-column list of keys (DLR-341): exempt from packing.
        outerWidths.set(id, floor);
        const keys = ordered.length * LEGEND_KEY_HEIGHT + Math.max(0, ordered.length - 1) * gaps.cardGapY;
        const size = { width: floor, height: CONTENT_INSET + headerHeight + RULE_TO_FIRST_CHILD_GAP + keys + LAST_CHILD_TO_BOTTOM_GAP };
        packedSizes.set(id, size);
        return size;
      }
      const run = buildLevelRun(id, ordered);
      levelRuns.set(id, run);
      const level = sizeRun(
        run,
        2 * CONTENT_INSET,
        CONTENT_INSET + headerHeight + RULE_TO_FIRST_CHILD_GAP + LAST_CHILD_TO_BOTTOM_GAP,
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
      const outer = Math.max(floor, level.width + (ordered.length > 0 ? 2 * CONTENT_INSET : 0));
      outerWidths.set(id, outer);
      const size = {
        width: outer,
        height: CONTENT_INSET + headerHeight + RULE_TO_FIRST_CHILD_GAP + levelHeight + LAST_CHILD_TO_BOTTOM_GAP
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
        headerAt(id, folded ? innerWidthOf(FIXED_CARD_WIDTH) : innerWidthOf(outerWidths.get(id) ?? FIXED_CARD_WIDTH));
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
      if (!isStretchedBox(id) && size !== undefined && size.height > FIXED_CARD_HEIGHT) {
        warnings.push({ code: "card-grown", refs: [representativeOf(id)],
          message: `card grew from ${FIXED_CARD_HEIGHT} to ${size.height} px to contain its measured content` });
      }
      for (const overflow of headerOverflows(headerInputs.get(id)!, headers.get(id)!, lineHeightOf)) {
        warnOverflow(overflow, kinds.get(id) !== "leaf");
      }
    }

    // Seating: every run at its packed positions. The root is one more run
    // with zero chrome and the same token gaps — never `rankGap` (§3.5).
    const rects = new Map<EntityRef, Rect>();
    const titleBands = new Map<EntityRef, Rect>();
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
        rects.set(id, { x, y, width: innerWidthOf(FIXED_CARD_WIDTH), height: LEGEND_KEY_HEIGHT });
        return;
      }
      const size = packedSizes.get(id)!;
      const header = headers.get(id)!;
      const inner = innerWidthOf(size.width);
      rects.set(id, { x, y, width: size.width, height: size.height });
      titleBands.set(id, { x, y, width: size.width, height: CONTENT_INSET + header.height });
      const contentX = x + CONTENT_INSET;
      const contentY = y + CONTENT_INSET + header.height + RULE_TO_FIRST_CHILD_GAP;
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
      if (layout.overflow) {
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
          parent !== undefined && legendInner.has(parent) ? legendInner.get(parent)! : innerWidthOf(FIXED_CARD_WIDTH);
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
      const inner = expanded ? innerWidthOf(outerWidths.get(id) ?? FIXED_CARD_WIDTH) : innerWidthOf(FIXED_CARD_WIDTH);
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
    const fixedShapes: Rect[] = [
      ...[...rects].filter(([id]) => !isStretchedBox(id)).map(([, rect]) => rect),
      ...titleBands.values(),
    ];
    const zoneShapes = [...rects].filter(([id]) => isStretchedBox(id));
    const shapesByEdge = new Map<RelationRef, Rect[]>();
    for (const edge of drawnEdges) {
      const own = new Set<EntityRef>();
      for (const end of [edge.source.entity, edge.target.entity]) {
        for (let current = placementParentOf(end); current !== undefined; current = placementParentOf(current)) own.add(current);
      }
      shapesByEdge.set(edge.occurrence as unknown as RelationRef, [
        ...fixedShapes,
        ...zoneShapes.filter(([id]) => !own.has(id)).map(([, rect]) => rect),
      ]);
    }
    const shapesOf = (id: RelationRef): readonly Rect[] => shapesByEdge.get(id) ?? fixedShapes;
    /** BF-3 `inner(C)`: the routable interior of an expanded container (BLK-3). */
    const innerOf = (container: EntityRef): Rect | undefined => {
      const rect = rects.get(container);
      const band = titleBands.get(container);
      if (rect === undefined || band === undefined) return undefined;
      const top = band.y + band.height + 4;
      return {
        x: rect.x + 4,
        y: top,
        width: Math.max(0, rect.width - 8),
        height: Math.max(0, rect.y + rect.height - top - 4),
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
      const size = labelSizes.get(id);
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
      const pitch = depth + 2 * metrics.labelMargin;
      const laneFreeRow = (side: "south" | "north", attempt: number): boolean => {
        const base = side === "south" ? Math.max(a.y + a.height, b.y + b.height) : Math.min(a.y, b.y) - depth;
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
        const legs: Rect[] = [a, b].map((rect) =>
          side === "south"
            ? { x: rect.x + rect.width / 2 - 1, y: rect.y + rect.height, width: 2, height: top - (rect.y + rect.height) }
            : { x: rect.x + rect.width / 2 - 1, y: top + depth, width: 2, height: rect.y - (top + depth) },
        );
        return ![lane, ...legs.filter((leg) => leg.height > 0)].some((zone) => shapesOf(id).some((shape) => rectsIntersect(shape, zone)));
      };
      const laneFreeCol = (side: "east" | "west", attempt: number): boolean => {
        const base = side === "east" ? Math.max(a.x + a.width, b.x + b.width) : Math.min(a.x, b.x) - depth;
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
        const legs: Rect[] = [a, b].map((rect) =>
          side === "east"
            ? { x: rect.x + rect.width, y: rect.y + rect.height / 2 - 1, width: left - (rect.x + rect.width), height: 2 }
            : { x: left + depth, y: rect.y + rect.height / 2 - 1, width: rect.x - (left + depth), height: 2 },
        );
        return ![lane, ...legs.filter((leg) => leg.width > 0)].some((zone) => shapesOf(id).some((shape) => rectsIntersect(shape, zone)));
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

    // Dock and route against fixed boxes (§4.6.4/§4.6.5). Slots keep the
    // declared spacing: a label sits in a lane, not at its dock, so a side
    // does not spread its slots by the label width.
    const docked = dockEdges({
      graph: filteredGraph,
      rects,
      direction: "top-to-bottom",
      metrics,
      labelSizes: new Map(),
      fixed: true,
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
    const requests = drawnEdges.map((edge) => {
      const occurrence = projected.relationOccurrences[edge.occurrence]!;
      const sourceRole = occurrence.endpoints.find((endpoint) => endpoint.role === "source")!;
      const targetRole = occurrence.endpoints.find((endpoint) => endpoint.role === "target")!;
      const occurrenceId = edge.occurrence as unknown as RelationRef;
      const pair = finalDocks.get(occurrenceId)!;
      // BLK-3: containment is enforced by the `within` clamp (4 px insets) +
      // escaped warnings below. Ancestors stay passable so the interior of the
      // shared container remains routable; the clamp prevents exiting it.
      // (Excluding the shared container itself from `passable` blocks its
      // whole grown box, leaving no route inside `within` — evidenced by
      // 0→93 escapes — so it is not done here.)
      const passable = new Set<EntityRef>([
        ...projectedAncestorsOf(sourceRole.occurrence),
        ...projectedAncestorsOf(targetRole.occurrence),
      ]);
      const within = withinOf.get(occurrenceId);
      return {
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
    if (labelSizes.size > 0 && rects.size > 0) {
      const pitch = Math.max(...[...labelSizes.values()].map((size) => size.height)) + 2 * metrics.labelMargin;
      const pitchX = Math.max(...[...labelSizes.values()].map((size) => size.width)) + 2 * metrics.labelMargin;
      const left = Math.min(...[...rects.values()].map((rect) => rect.x));
      const right = Math.max(...[...rects.values()].map((rect) => rect.x + rect.width));
      const width = right - left;
      const height = drawingBottom - drawingTop;
      const spareX = Math.max(0, height * rowPack.targetAspect - width) / 2;
      const spareY = Math.max(0, width / rowPack.targetAspect - height) / 2;
      const allowance = metrics.clearance + pitch;
      labelLimit = {
        x: left - spareX - metrics.clearance - pitchX,
        y: drawingTop - spareY - allowance,
        width: width + 2 * (spareX + metrics.clearance + pitchX),
        height: height + 2 * (spareY + allowance),
      };
      const lanes = Math.min(labelSizes.size, OUTER_LANES, 1 + Math.floor(spareY / pitch));
      for (let lane = 1; lane <= lanes; lane += 1) {
        outerLanes.push(drawingTop - metrics.clearance - lane * pitch, drawingBottom + metrics.clearance + lane * pitch);
      }
      // AC-25: dense folded roots need left/right outside corridors as well —
      // the A* grid had no X lane outside the drawing, so a route that must go
      // round via the side fell back to an obstructed elbow. One X lane per
      // side mirrors the Y lanes above.
      const lanesX = Math.min(labelSizes.size, OUTER_LANES, 1 + Math.floor(spareX / pitchX));
      for (let lane = 1; lane <= lanesX; lane += 1) {
        outerLanesX.push(left - metrics.clearance - lane * pitchX, right + metrics.clearance + lane * pitchX);
      }
    }
    // The title band of an expanded container is an obstacle for every route,
    // the ones that may cross the container wall included: a route leaving a
    // zone goes round its title, never through it.
    const routed = routeEdges({
      rects,
      requests,
      avoidFallbackInteriors: true,
      clearance: metrics.clearance,
      barriers: [...titleBands].sort(([left], [right]) => byString(left, right)).map(([, band]) => band),
      lanes: { xs: outerLanesX, ys: outerLanes },
    });
    // AC-25: an 8 px dock exit can be blocked where a 2 px exit still threads
    // through — the retry is local (only the obstructed requests, same rects,
    // barriers and outer lanes, smaller inflation) and still avoids every raw
    // card and title-band interior (2 px grown boxes contain the raw boxes).
    // A retry that finds a clean A* route replaces the obstructed elbow.
    const retryRoutes = new Map(routed.routes);
    const retryObstructed = new Set(routed.obstructed);
    if (retryObstructed.size > 0) {
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
    const labelBoxes = new Map<RelationRef, Rect>();
    const taken: Rect[] = [];
    const unplaced: typeof entries = [];
    for (const entry of entries) {
      const edge = drawnEdges.find((candidate) => (candidate.occurrence as string) === entry.id)!;
      let choice = placePackedLabel(entry, fixedShapes, taken, metrics.labelMargin);
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
        const samePair = requests.filter((candidate) => candidate.id !== entry.id && candidate.pairKey === request.pairKey)
          .map((candidate) => retryRoutes.get(candidate.id)!);
        const shapes = shapesOf(entry.id);
        const margin = probeMargin;
        const xs = new Set<number>([request.start.x, request.end.x]);
        const ys = new Set<number>(outerLanes);
        for (const rect of shapes) {
          xs.add(rect.x - metrics.clearance);
          xs.add(rect.x + rect.width + metrics.clearance);
          for (const pad of [metrics.labelMargin, Math.max(0, margin)]) {
            ys.add(rect.y - entry.size.height / 2 - pad);
            ys.add(rect.y + rect.height + entry.size.height / 2 + pad);
          }
        }
        for (const end of [request.start, request.end]) {
          xs.add(end.x - entry.size.width - 2 * metrics.labelMargin);
          xs.add(end.x + entry.size.width + 2 * metrics.labelMargin);
        }
        const detour = labelDetour({ request, shapes, earlier: samePair, xs: [...xs].sort((a, b) => a - b), ys: [...ys].sort((a, b) => a - b),
          accepts: (points) => {
            return placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined;
          },
        });
        if (detour !== undefined) {
          retryRoutes.set(entry.id, detour);
          retryObstructed.delete(entry.id);
          choice = placePackedLabel({ ...entry, route: detour }, fixedShapes, taken, metrics.labelMargin);
        } else if (margin >= 0) {
          const probeRoute = labelDetour({ request, shapes, earlier: samePair, xs: [...xs].sort((a, b) => a - b), ys: [...ys].sort((a, b) => a - b),
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
          for (const [source, target] of facePairs) {
            const overrides = new Map(sideOverrides);
            overrides.set(entry.id, { source, target, turn: source === target });
            const pair = dockEdges({ graph: filteredGraph, rects, direction: "top-to-bottom", metrics,
              labelSizes: new Map(), fixed: true, sideOverrides: overrides }).docks.get(entry.id)!;
            const alternative = { ...request, start: pair.source.point, startExit: pair.source.exit,
              end: pair.target.point, endExit: pair.target.exit };
            const route = labelDetour({ request: alternative, shapes, earlier: samePair,
              xs: [...xs].sort((a, b) => a - b), ys: [...ys].sort((a, b) => a - b),
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
          const pitch = Math.max(...[...labelSizes.values()].map(size => size.height)) + 2 * metrics.labelMargin;
          const column = right + Math.max(...[...labelSizes.values()].map(size => size.width)) / 2 + metrics.clearance;
          const row = drawingBottom + metrics.clearance + (entries.indexOf(entry) + 1) * pitch;
          const { limit: _limit, ...unbounded } = entry;
          const samePair = requests.filter(candidate => candidate.id !== entry.id && candidate.pairKey === request.pairKey)
            .map(candidate => retryRoutes.get(candidate.id)!);
          const comb = (earlier: readonly (readonly Vec2[])[]) => labelDetour({ request, shapes: shapesOf(entry.id), earlier,
            xs: [...new Set([request.start.x, request.end.x, column, ...outerLanesX])].sort((a, b) => a - b),
            ys: [...new Set([request.start.y, request.end.y, row, ...outerLanes])].sort((a, b) => a - b),
            accepts: points => placePackedLabel({ ...unbounded, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined,
          });
          // Once a channel is saturated, its comb may share a trunk. Card
          // and header obstacles remain mandatory; label rows stay distinct.
          const route = comb(samePair) ?? comb([]);
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
      readonly max: number;
    }
    const gutters: Gutter[] = [];
    for (const [key, packed] of [...packedRuns].sort(([left], [right]) => byString(left, right))) {
      const boxes = seatedBoxes.get(key);
      if (boxes === undefined || boxes.length < 2) continue;
      const rows = packed.rows;
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
      const alongStrips = new Map<number, { readonly shelf: number; readonly strip: Rect }[]>();
      packed.shelves.forEach((shelf, shelfIndex) => {
        const start = acrossOf(boxes[shelf[0]!]!)[0];
        const end = Math.max(...shelf.map((slot) => acrossOf(boxes[slot]!)[1]));
        const next = packed.shelves[shelfIndex + 1];
        if (next !== undefined) {
          const nextStart = acrossOf(boxes[next[0]!]!)[0];
          gutters.push({
            id: `${key}|across|${String(shelfIndex)}`,
            horizontal: rows,
            strips: [stripOf(extent, [end, nextStart])],
            gap: nextStart - end,
            max: rows ? rowGaps.maxY : rowGaps.maxX,
          });
        }
        shelf.forEach((slot, index) => {
          const following = shelf[index + 1];
          if (following === undefined) return;
          const strip = stripOf([alongOf(boxes[slot]!)[1], alongOf(boxes[following]!)[0]], [start, end]);
          (alongStrips.get(index) ?? alongStrips.set(index, []).get(index)!).push({ shelf: shelfIndex, strip });
        });
      });
      for (const [index, strips] of [...alongStrips].sort(([left], [right]) => left - right)) {
        const thickness = (strip: Rect): number => (rows ? strip.width : strip.height);
        const startOf = (strip: Rect): number => (rows ? strip.x : strip.y);
        // Boxes of equal size line up: the gutters after slot `index` are one
        // lane of the level and widen together, so the grid keeps its column
        // starts. Where they do not line up there is no lane to keep, and
        // each shelf widens its own gutter.
        const lane = strips.every(({ strip }) => Math.abs(startOf(strip) - startOf(strips[0]!.strip)) <= LANE_TOLERANCE);
        const max = rows ? rowGaps.maxX : rowGaps.maxY;
        if (lane) {
          gutters.push({
            id: `${key}|along|${String(index)}`,
            horizontal: !rows,
            strips: strips.map(({ strip }) => strip),
            gap: Math.max(...strips.map(({ strip }) => thickness(strip))),
            max,
          });
        } else {
          for (const { shelf, strip } of strips) {
            gutters.push({ id: `${key}|along|${String(index)}|${String(shelf)}`, horizontal: !rows, strips: [strip], gap: thickness(strip), max });
          }
        }
      }
    }
    // A widened gutter in which no placed label sits is an empty lane: a bare
    // route needs no more than the base gap (two clearances).
    const unused: string[] = [];
    const gutterIds = new Set(gutters.map((gutter) => gutter.id));
    for (const id of [...(plan?.widen.keys() ?? [])].sort(byString)) if (!gutterIds.has(id)) unused.push(id);
    for (const gutter of gutters) {
      if (plan?.widen.get(gutter.id) === undefined) continue;
      if (![...labelBoxes.values()].some((box) => gutter.strips.some((strip) => rectsIntersect(strip, box)))) unused.push(gutter.id);
    }
    // A label with no room is probed with the free space of a base gap above
    // and under it: where it then fits, the lanes it sits in are asked to
    // widen to its thickness plus its two margins — never past the axis cap.
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
        // S-1: an outgoing edge may use a level's base gutter, but cannot
        // change its geometry when a different level is folded.
        if (!gutter.id.startsWith(`${level}|`)) continue;
        if (!gutter.strips.some((strip) => rectsIntersect(strip, choice.box))) continue;
        const needed = (gutter.horizontal ? entry.size.height : entry.size.width) + 2 * metrics.labelMargin;
        if (needed > gutter.max || needed <= gutter.gap) continue;
        requested.set(gutter.id, Math.max(requested.get(gutter.id) ?? 0, needed));
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
    const bounds = unionOf(rects, retryRoutes, labelBoxes);
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
      labelBoxes: Object.fromEntries(
        [...labelBoxes]
          .sort(([left], [right]) => byString(left, right))
          .map(([id, box]) => [id, { x: clean(box.x), y: clean(box.y), width: box.width, height: box.height }] as const),
      ),
      ...(Object.keys(edgeBundles).length === 0 ? {} : { edgeBundles }),
    };
    return { result, chosen, requested, unused, unplaced: unplaced.length };
  };

  // BF-6 two-pass placement. Pass 1 packs every level at its base gaps,
  // routes, and places the labels; its shelves and orientations are frozen.
  // Later passes only widen the gutters in which a label of pass 1 had no
  // room, then drop every widened gutter that ends up holding no label: the
  // asked set grows at most `WIDEN_ROUNDS` times and then only shrinks, so
  // the sequence ends. A drawing never keeps a lane no label sits in.
  const first = runPass(undefined);
  if (first.requested.size === 0) return first.result;
  const frozen = first.chosen;
  const widen = new Map(first.requested);
  let outcome = runPass({ frozen, widen });
  for (let round = 1; round < WIDEN_ROUNDS; round += 1) {
    const more = [...outcome.requested].filter(([id, gap]) => (widen.get(id) ?? 0) < gap);
    if (more.length === 0) break;
    for (const [id, gap] of more) widen.set(id, gap);
    outcome = runPass({ frozen, widen });
  }
  while (outcome.unused.length > 0) {
    for (const id of outcome.unused) widen.delete(id);
    if (widen.size === 0) return first.result;
    outcome = runPass({ frozen, widen });
  }
  // Widening never costs a label: the wider drawing is kept only when it
  // places at least as many labels as the base one.
  return outcome.unplaced <= first.unplaced ? outcome.result : first.result;
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
      relationOccurrences[occurrence.id] = { ...occurrence, waypoints };
    } else {
      relationOccurrences[occurrence.id] = { ...occurrence };
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
    if (
      (relation.profile !== "generic@1" && relation.profile !== "generic@2") ||
      (relation.type !== "contains" && relation.type !== "link")
    ) {
      if (relation.type === "contains" || relation.type === "link") {
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
    if (relation.type === "contains") {
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
