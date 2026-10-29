/**
 * Measured diagram layout (M3 §4.6–§4.8, layout half of §5.6).
 *
 * One `layoutMeasured` / `layoutFolded` call performs, in order (§4.6.3):
 * resolve, widths bottom-up, header measurement, bottom-up placement, body
 * and label measurement, dock and route, emit with measurements. Folding is
 * fold→measure→place→route from the retained source through the M1-c
 * projection (`collapsedOf`); never incremental.
 *
 * Fixed footprints (§4.6.1/§4.6.5) are never enlarged, for docking or any
 * other reason: the dock-driven growth of the compatibility path does not
 * exist here. Overflow (§4.6.4) keeps every character and reports
 * `card-overflow` / `zone-overflow`; docks beyond a side's capacity keep the
 * box, fit in declared order and route the rest from the nearest free anchor
 * with one `docking-overflow` per occurrence. No slot is ever truncated,
 * clipped or ellipsised.
 */
import {
  collapsedOf,
  createTypeResolver,
  GENERIC_PROFILE_ID,
  hasErrors,
  localIdOf,
  occurrenceRef,
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

import { dockEdges, parallelRelations, type Dock, type EdgeDocks } from "./dock.js";
import { ancestorsOf, type LayoutEdge, type LayoutGraph, type LayoutNode } from "./graph.js";
import {
  effectiveStretch,
  groupLeaves,
  isLayoutGroup,
  resolveGaps,
  resolveOrder,
  validateHints,
  type LayoutGroup,
  type LayoutHints,
  type ResolvedGaps,
} from "./hints.js";
import { placeEdgeLabels } from "./labels.js";
import {
  DEFAULT_ALLOCATED_LINES,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  headerAvailableWidth,
  headerOverflows,
  innerWidthOf,
  LEGEND_KEY_HEIGHT,
  measureHeader,
  SWATCH_ALLOCATION,
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
import { routeEdges } from "./route.js";
import type { Rect, Vec2 } from "../transform.js";
import {
  DEFAULT_LAYOUT_METRICS,
  MIN_ZOOM,
  PHONE_MAX_WIDTH,
  type LayoutMetrics,
  type LayoutOptions,
  type LayoutResult,
  type LayoutWarning,
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

/** Expanded zones take zone gaps; fixed cards and keys take card gaps. */
function kindGap(kind: OccurrenceKind, gaps: ResolvedGaps, axis: "x" | "y"): number {
  const zone = kind === "container-expanded" || kind === "legend-expanded";
  if (axis === "x") return zone ? gaps.zoneGapX : gaps.cardGapX;
  return zone ? gaps.zoneGapY : gaps.cardGapY;
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

  // Step 1 — resolve: classify each occurrence from (effective type, typed
  // presentation form, fold set); refuse unsupported profiles/types by name.
  const occurrenceOf = (entity: EntityRef): OccurrenceRef => occurrenceRef(`e.${localIdOf(entity)}`);
  const entityOfOccurrence = new Map<OccurrenceRef, EntityRef>();
  for (const id of graph.nodes.keys()) entityOfOccurrence.set(occurrenceOf(id), id);
  const collapsedOccurrences =
    options.collapsed !== undefined
      ? new Set<OccurrenceRef>(options.collapsed)
      : sourceView !== undefined
        ? new Set<OccurrenceRef>([...collapsedOf(sourceView)] as OccurrenceRef[])
        : new Set<OccurrenceRef>();
  const collapsed = new Set<EntityRef>();
  for (const id of collapsedOccurrences) {
    const entity = entityOfOccurrence.get(id) ?? sourceView?.entityOccurrences[id]?.entity;
    if (entity !== undefined && graph.nodes.has(entity)) collapsed.add(entity);
  }
  let foldMetadata: {
    groups: Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }>;
    filters: ViewDocument["filters"];
    presentationState: ViewDocument["presentation"];
    summaryLabels: ViewDocument["summaryLabels"];
  } = {
    groups: {},
    filters: [],
    presentationState: { camera: { x: 0, y: 0, zoom: 1 } },
    summaryLabels: undefined,
  };
  if (sourceView !== undefined) {
    try {
      const stripped = stripProjections(sourceView);
      const projected = projectView(document, stripped, [...collapsedOccurrences]);
      foldMetadata = {
        groups: projected.groups as Record<string, { id: string; occurrence: OccurrenceRef; collapsed?: boolean }>,
        filters: [...projected.filters],
        presentationState: projected.presentation,
        summaryLabels: projected.summaryLabels,
      };
    } catch {
      foldMetadata = {
        groups: stampFoldGroups(sourceView, collapsedOccurrences) as Record<
          string,
          { id: string; occurrence: OccurrenceRef; collapsed?: boolean }
        >,
        filters: [...sourceView.filters],
        presentationState: sourceView.presentation,
        summaryLabels: sourceView.summaryLabels,
      };
    }
  }
  const hidden = new Set<EntityRef>();
  for (const id of graph.nodes.keys()) {
    for (const ancestor of ancestorsOf(graph, id)) {
      if (collapsed.has(ancestor)) {
        hidden.add(id);
        break;
      }
    }
  }
  const visible = (id: EntityRef): boolean => !hidden.has(id);
  const classify = (id: EntityRef): OccurrenceKind => {
    const node = graph.nodes.get(id)!;
    const form = formOf(presentation, occurrenceOf(id));
    if (form === "legend-key") return "legend-key";
    if (form === "legend") return collapsed.has(id) ? "legend-collapsed" : "legend-expanded";
    if (form === "container" || node.kind === "container") {
      return collapsed.has(id) ? "container-collapsed" : "container-expanded";
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
      const order = (presentation.legends as Record<string, { order: readonly EntityRef[] }>)[occurrenceOf(parent)]
        ?.order;
      return resolveOrder(live, order);
    }
    return resolveOrder(live, hints.ordering?.[parent]);
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

  /** Stretch in force for one sibling level: its innermost covering group, else inherited. */
  const levelStretchOf = (level: readonly EntityRef[], inherited: boolean): boolean => {
    if (level.length === 0) return inherited;
    let bestEffective: boolean | undefined;
    let bestDepth = -1;
    const visit = (group: LayoutGroup, depth: number, parentEffective: boolean): void => {
      const effective = groupEffectiveOf(group, parentEffective);
      const leaves = new Set(groupLeaves(group));
      if (level.every((member) => leaves.has(member)) && depth > bestDepth) {
        bestEffective = effective;
        bestDepth = depth;
      }
      for (const item of group.items) if (isLayoutGroup(item)) visit(item, depth + 1, effective);
    };
    for (const group of hints.grouping ?? []) visit(group, 0, globalStretch);
    return bestDepth >= 0 ? (bestEffective as boolean) : inherited;
  };

  // Step 2 — widths bottom-up: (a) unwrapped header width at the
  // toggle-reduced allocation, (b) widest fixed child plus insets, (c) the
  // grouping width implied by hints as an authored override (stretch).
  const outerWidths = new Map<EntityRef, number>();
  const unwrappedHeaderWidth = (id: EntityRef): number => {
    const slots = slotTexts(document, presentation, occurrenceOf(id), id);
    const width = headerAvailableWidth(UNWRAPPED_PROBE_WIDTH, true);
    let widest = 0;
    for (const role of ["kicker", "title"] as const) {
      const text = slots[role];
      if (text === undefined) continue;
      widest = Math.max(widest, measure({ text, role, availableWidth: width, allocatedLines: 1, folded: false }).width);
    }
    return widest;
  };
  const kindGapLocal = (kind: OccurrenceKind, axis: "x" | "y"): number => {
    const zone = kind === "container-expanded" || kind === "legend-expanded";
    if (axis === "x") return zone ? gaps.zoneGapX : gaps.cardGapX;
    return zone ? gaps.zoneGapY : gaps.cardGapY;
  };
  const groupGapKind = (group: LayoutGroup): OccurrenceKind | "group-zone" | "group-card" => {
    const leaves = groupLeaves(group);
    const zone = leaves.some((leaf) => {
      const kind = kinds.get(leaf);
      return kind === "container-expanded" || kind === "legend-expanded";
    });
    return zone ? "group-zone" : "group-card";
  };
  const gapForItem = (
    item: { readonly entity?: EntityRef; readonly group?: LayoutGroup },
    axis: "x" | "y",
  ): number => {
    if (item.group !== undefined) {
      const kind = groupGapKind(item.group);
      if (kind === "group-zone") return axis === "x" ? gaps.zoneGapX : gaps.zoneGapY;
      return axis === "x" ? gaps.cardGapX : gaps.cardGapY;
    }
    return kindGapLocal(kinds.get(item.entity!)!, axis);
  };
  const groupContentWidth = (group: LayoutGroup): number => {
    const axis = group.direction === "rows" ? "y" : "x";
    if (axis === "y") {
      let widest = 0;
      for (const item of group.items) {
        if (isLayoutGroup(item)) widest = Math.max(widest, groupContentWidth(item));
        else if (visible(item)) widest = Math.max(widest, outerWidths.get(item) ?? 0);
      }
      return widest;
    }
    let total = 0;
    let first = true;
    let previousGapAfter: number | undefined;
    for (const item of group.items) {
      if (!isLayoutGroup(item) && !visible(item)) continue;
      if (!first) {
        const inherited = gapForItem(isLayoutGroup(item) ? { group: item } : { entity: item as EntityRef }, "x");
        total += previousGapAfter ?? inherited;
      }
      first = false;
      if (isLayoutGroup(item)) {
        total += groupContentWidth(item);
        previousGapAfter = item.gapAfter;
      } else {
        total += outerWidths.get(item as EntityRef) ?? 0;
        previousGapAfter = undefined;
      }
    }
    return total;
  };
  const groupingOuterWidth = (ordered: readonly EntityRef[]): number | undefined => {
    const parts = groupsForLevel(ordered, hints);
    if (parts === undefined) return undefined;
    let widest = 0;
    for (const part of parts) {
      if (part.group !== undefined) widest = Math.max(widest, groupContentWidth(part.group));
      else {
        for (const member of part.members) {
          if (visible(member)) widest = Math.max(widest, outerWidths.get(member) ?? 0);
        }
      }
    }
    return widest;
  };
  const computeWidth = (id: EntityRef): number => {
    const kind = kinds.get(id)!;
    if (kind === "leaf" || kind === "container-collapsed" || kind === "legend-collapsed") {
      outerWidths.set(id, FIXED_CARD_WIDTH);
      return FIXED_CARD_WIDTH;
    }
    if (kind === "legend-key") {
      outerWidths.set(id, 0);
      return 0;
    }
    const ordered = childOrder(id, graph.nodes.get(id)!.children);
    for (const child of ordered) computeWidth(child);
    let widestChild = 0;
    for (const child of ordered) widestChild = Math.max(widestChild, outerWidths.get(child) ?? 0);
    const grouping = groupingOuterWidth(ordered);
    const headerDriven = unwrappedHeaderWidth(id) + 2 * 16 + 32;
    const content = grouping ?? widestChild;
    const outer = Math.max(FIXED_CARD_WIDTH, headerDriven, content + (ordered.length > 0 ? 2 * 16 : 0));
    outerWidths.set(id, outer);
    return outer;
  };
  const rootOrder = resolveOrder(graph.roots.filter(visible), undefined);
  for (const root of rootOrder) computeWidth(root);
  const effectiveOf = (group: LayoutGroup, parentEffective: boolean): boolean =>
    effectiveStretch(group.stretch, parentEffective);
  const equalizeRowsGroup = (group: LayoutGroup, parentEffective: boolean): void => {
    const effective = effectiveOf(group, parentEffective);
    if (group.direction === "rows" && effective) {
      let widest = 0;
      for (const item of group.items) {
        if (isLayoutGroup(item)) continue;
        if (!visible(item)) continue;
        const kind = kinds.get(item)!;
        if (kind === "container-expanded" || kind === "legend-expanded") {
          widest = Math.max(widest, outerWidths.get(item) ?? 0);
        }
      }
      for (const item of group.items) {
        if (isLayoutGroup(item)) continue;
        if (!visible(item)) continue;
        const kind = kinds.get(item)!;
        if (kind === "container-expanded" || kind === "legend-expanded") outerWidths.set(item, widest);
      }
    }
    for (const item of group.items) if (isLayoutGroup(item)) equalizeRowsGroup(item, effective);
  };
  for (const group of hints.grouping ?? []) equalizeRowsGroup(group, globalStretch);
  for (const id of graph.nodes.keys()) {
    if (kinds.get(id) !== "container-expanded" && kinds.get(id) !== "legend-expanded") continue;
    const ordered = childOrder(id, graph.nodes.get(id)!.children);
    const levelStretch = levelStretchOf(ordered, contextStretchOf(id));
    if (!levelStretch) continue;
    let widest = 0;
    for (const child of ordered) {
      const childKind = kinds.get(child)!;
      if (childKind === "container-expanded" || childKind === "legend-expanded") {
        widest = Math.max(widest, outerWidths.get(child) ?? 0);
      }
    }
    for (const child of ordered) {
      const childKind = kinds.get(child)!;
      if (childKind === "container-expanded" || childKind === "legend-expanded") outerWidths.set(child, widest);
    }
  }
  {
    const rootGroups = (hints.grouping ?? []).filter((group) =>
      groupLeaves(group).every((leaf) => graph.roots.includes(leaf) && visible(leaf)),
    );
    const grouped = new Set<EntityRef>();
    for (const group of rootGroups) for (const leaf of groupLeaves(group)) grouped.add(leaf);
    const ungrouped = rootOrder.filter((id) => !grouped.has(id));
    const stretchOfRoot = (root: EntityRef): boolean => contextStretchOf(root);
    const expandedRoots = (roots: readonly EntityRef[]): EntityRef[] =>
      roots.filter(
        (root) => kinds.get(root) === "container-expanded" || kinds.get(root) === "legend-expanded",
      );
    const equalizeList = (roots: readonly EntityRef[], stretch: boolean): void => {
      if (!stretch) return;
      const expanded = expandedRoots(roots);
      if (expanded.length === 0) return;
      let widest = 0;
      for (const root of expanded) widest = Math.max(widest, outerWidths.get(root) ?? 0);
      for (const root of expanded) outerWidths.set(root, widest);
    };
    for (const group of rootGroups) {
      if (group.direction !== "rows") continue;
      const leaves = groupLeaves(group).filter((leaf) => visible(leaf));
      let effective = globalStretch;
      const visit = (current: LayoutGroup, parentEffective: boolean): boolean | undefined => {
        const currentEffective = effectiveOf(current, parentEffective);
        if (current === group) return currentEffective;
        for (const item of current.items) {
          if (!isLayoutGroup(item)) continue;
          if (groupLeaves(item).some((leaf) => leaves.includes(leaf))) {
            const found = visit(item, currentEffective);
            if (found !== undefined) return found;
          }
        }
        return undefined;
      };
      void visit;
      const topEffective = (() => {
        let best: boolean | undefined;
        let bestDepth = -1;
        const walk = (candidate: LayoutGroup, depth: number, parentEffective: boolean): void => {
          const currentEffective = effectiveOf(candidate, parentEffective);
          const candidateLeaves = new Set(groupLeaves(candidate));
          if (leaves.every((leaf) => candidateLeaves.has(leaf)) && depth > bestDepth) {
            best = currentEffective;
            bestDepth = depth;
          }
          for (const item of candidate.items) if (isLayoutGroup(item)) walk(item, depth + 1, currentEffective);
        };
        for (const top of hints.grouping ?? []) walk(top, 0, globalStretch);
        return bestDepth >= 0 ? (best as boolean) : globalStretch;
      })();
      effective = topEffective;
      equalizeList(leaves, effective);
    }
    if (ungrouped.length > 0) {
      const stretch = globalStretch;
      equalizeList(ungrouped, stretch);
    }
    void stretchOfRoot;
  }

  // Step 3 — headers before any child placement; folded and expanded forms
  // are distinct inputs.
  const headers = new Map<EntityRef, HeaderMeasurement>();
  const lineHeightOf = (role: TextRole): number =>
    measure({ text: "Mg", role, availableWidth: 1000, allocatedLines: 1, folded: false }).height;
  for (const id of [...graph.nodes.keys()].sort(byString)) {
    if (!visible(id) || kinds.get(id) === "legend-key") continue;
    const kind = kinds.get(id)!;
    const folded = kind === "container-collapsed" || kind === "legend-collapsed";
    const toggle = kind !== "leaf";
    const inner = folded ? innerWidthOf(FIXED_CARD_WIDTH) : innerWidthOf(outerWidths.get(id) ?? FIXED_CARD_WIDTH);
    const input: EntityMeasurementInput = {
      entity: id,
      occurrence: occurrenceOf(id),
      effectiveType: `${document.entities[id]?.profile ?? ""}:${document.entities[id]?.type ?? ""}/${formOf(presentation, occurrenceOf(id)) ?? graph.nodes.get(id)!.kind}`,
      folded,
      toggle,
      slots: slotTexts(document, presentation, occurrenceOf(id), id),
      availableWidth: inner,
      allocatedLines: { ...DEFAULT_ALLOCATED_LINES },
    };
    const header = measureHeader(input, measure);
    headers.set(id, header);
    for (const overflow of headerOverflows(input, header, lineHeightOf)) {
      warnOverflow(overflow, kind !== "leaf");
    }
  }

  // Step 4 — children bottom-up; measured headers move child rows.
  const rects = new Map<EntityRef, Rect>();
  const titleBands = new Map<EntityRef, Rect>();
  const legendInner = new Map<EntityRef, number>();
  type StackItem = { readonly entity: EntityRef } | { readonly group: LayoutGroup };
  const gapKindOf = (item: StackItem): OccurrenceKind | "group-zone" | "group-card" => {
    if ("group" in item) {
      return groupLeaves(item.group).some((leaf) => {
        const kind = kinds.get(leaf);
        return kind === "container-expanded" || kind === "legend-expanded";
      })
        ? "group-zone"
        : "group-card";
    }
    return kinds.get(item.entity)!;
  };
  const stackGap = (item: StackItem, axis: "x" | "y"): number => {
    const kind = gapKindOf(item);
    if (kind === "group-zone") return axis === "x" ? gaps.zoneGapX : gaps.zoneGapY;
    if (kind === "group-card") return axis === "x" ? gaps.cardGapX : gaps.cardGapY;
    return kindGap(kind, gaps, axis);
  };
  const placeStack = (items: readonly StackItem[], x: number, y: number, axis: "x" | "y", stretch: boolean): { width: number; height: number } => {
    let cursorX = x;
    let cursorY = y;
    let width = 0;
    let height = 0;
    let previousGapAfter: number | undefined;
    items.forEach((item, index) => {
      if (index > 0) {
        const gap = previousGapAfter ?? stackGap(item, axis);
        if (axis === "x") cursorX += gap;
        else cursorY += gap;
      }
      previousGapAfter = undefined;
      if ("group" in item) {
        const size = placeGroupItems(item.group, cursorX, cursorY, stretch);
        if (axis === "x") {
          cursorX += size.width;
          height = Math.max(height, size.height);
          width = cursorX - x;
        } else {
          cursorY += size.height;
          width = Math.max(width, size.width);
          height = cursorY - y;
        }
        previousGapAfter = item.group.gapAfter;
      } else {
        const box = placeOne(item.entity, cursorX, cursorY, stretch);
        if (axis === "x") {
          cursorX += box.width;
          height = Math.max(height, box.height);
          width = cursorX - x;
        } else {
          cursorY += box.height;
          width = Math.max(width, box.width);
          height = cursorY - y;
        }
      }
    });
    return { width, height };
  };
  const placeOne = (id: EntityRef, x: number, y: number, inheritedStretch: boolean): { width: number; height: number } => {
    const kind = kinds.get(id)!;
    if (kind === "leaf" || kind === "container-collapsed" || kind === "legend-collapsed") {
      rects.set(id, { x, y, width: FIXED_CARD_WIDTH, height: FIXED_CARD_HEIGHT });
      return { width: FIXED_CARD_WIDTH, height: FIXED_CARD_HEIGHT };
    }
    if (kind === "legend-key") {
      const parent = graph.nodes.get(id)?.parent;
      const inner =
        parent !== undefined && legendInner.has(parent) ? legendInner.get(parent)! : innerWidthOf(FIXED_CARD_WIDTH);
      rects.set(id, { x, y, width: inner, height: LEGEND_KEY_HEIGHT });
      return { width: inner, height: LEGEND_KEY_HEIGHT };
    }
    const header = headers.get(id)!;
    const outer = outerWidths.get(id) ?? FIXED_CARD_WIDTH;
    const inner = innerWidthOf(outer);
    const ordered = childOrder(id, graph.nodes.get(id)!.children);
    const stretch = levelStretchOf(ordered, inheritedStretch);
    const childX = x + 16;
    let childY = y + 16 + header.height + 16;
    if (kind === "legend-expanded") {
      legendInner.set(id, inner);
      const keys = placeStack(
        ordered.map((entity) => ({ entity })),
        childX,
        childY,
        "y",
        stretch,
      );
      childY += keys.height;
    } else {
      const parts = groupsForLevel(ordered, hints);
      const items: StackItem[] =
        parts === undefined
          ? ordered.map((entity) => ({ entity }))
          : parts.flatMap((part) =>
              part.group === undefined
                ? part.members.map((entity) => ({ entity }) as StackItem)
                : [{ group: part.group } as StackItem],
            );
      const size = placeStack(items, childX, childY, "y", stretch);
      childY += size.height;
    }
    const height = 16 + header.height + 16 + (childY - (y + 16 + header.height + 16)) + 16;
    rects.set(id, { x, y, width: outer, height });
    titleBands.set(id, { x: x + 16, y: y + 16, width: inner, height: header.height });
    return { width: outer, height };
  };
  const placeGroupItems = (group: LayoutGroup, x: number, y: number, inheritedStretch: boolean): { width: number; height: number } => {
    const stretch = effectiveStretch(group.stretch, inheritedStretch);
    const axis = group.direction === "rows" ? "y" : "x";
    const items: StackItem[] = [];
    for (const item of group.items) {
      if (isLayoutGroup(item)) items.push({ group: item });
      else if (visible(item)) items.push({ entity: item });
    }
    return placeStack(items, x, y, axis, stretch);
  };

  // Roots: authored root groups first, then ungrouped roots in UTF-16 order,
  // with rankGap bands between top-level items.
  const rootGroups = (hints.grouping ?? []).filter((group) =>
    groupLeaves(group).every((leaf) => graph.roots.includes(leaf) && visible(leaf)),
  );
  const groupedRoots = new Set<EntityRef>();
  for (const group of rootGroups) for (const leaf of groupLeaves(group)) groupedRoots.add(leaf);
  const ungroupedRoots = rootOrder.filter((id) => !groupedRoots.has(id));
  let rootY = 0;
  let rootWidth = 0;
  let firstRoot = true;
  let previousRootGapAfter: number | undefined;
  const seatRoot = (height: number, width: number, gapAfter: number | undefined): void => {
    rootY += height;
    rootWidth = Math.max(rootWidth, width);
    previousRootGapAfter = gapAfter;
  };
  for (const group of rootGroups) {
    if (!firstRoot) rootY += previousRootGapAfter ?? gaps.rankGap;
    firstRoot = false;
    const size = placeGroupItems(group, 0, rootY, globalStretch);
    seatRoot(size.height, size.width, group.gapAfter);
  }
  for (const root of ungroupedRoots) {
    if (!firstRoot) rootY += previousRootGapAfter ?? gaps.rankGap;
    firstRoot = false;
    const box = placeOne(root, 0, rootY, contextStretchOf(root));
    seatRoot(box.height, box.width, undefined);
  }

  // Step 5 — bodies and labels through the same measurer.
  const slots: SlotMeasurement[] = [];
  const recordSlot = (occurrence: OccurrenceRef, role: TextRole, layout: LineLayout, zone: boolean): void => {
    slots.push({ occurrence, role, layout });
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
    const occurrence = occurrenceOf(id);
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
    for (const role of ["body", "detail", "footer"] as const) {
      if (text[role] === undefined) continue;
      recordSlot(
        occurrence,
        role,
        measure({
          text: text[role]!,
          role,
          availableWidth: inner,
          allocatedLines: DEFAULT_ALLOCATED_LINES[role],
          folded: !expanded && kind !== "leaf",
        }),
        expanded,
      );
    }
  }

  // Visible edges: internal edges under a collapse are excluded; external
  // edges are projected onto their outermost visible collapsed representatives.
  const representativeEntityOf = (entity: EntityRef): EntityRef => {
    if (visible(entity)) return entity;
    let current: EntityRef | undefined = entity;
    let representative: EntityRef | undefined;
    while (current !== undefined) {
      const node = graph.nodes.get(current);
      const parent: EntityRef | undefined = node?.parent;
      if (parent !== undefined && collapsed.has(parent) && visible(parent)) {
        representative = parent;
      }
      current = parent;
    }
    if (representative !== undefined) {
      let outer: EntityRef = representative;
      let cursor: EntityRef | undefined = graph.nodes.get(representative)?.parent;
      while (cursor !== undefined) {
        if (collapsed.has(cursor) && visible(cursor)) outer = cursor;
        cursor = graph.nodes.get(cursor)?.parent;
      }
      return outer;
    }
    return entity;
  };
  type ProjectedEdge = {
    readonly id: RelationRef;
    readonly source: EntityRef;
    readonly target: EntityRef;
    readonly sourcePort: PortRef | undefined;
    readonly targetPort: PortRef | undefined;
    readonly originalSource: EntityRef;
    readonly originalTarget: EntityRef;
  };
  const projectedEdges: ProjectedEdge[] = [];
  if (sourceView === undefined) {
    for (const edge of graph.edges) {
      if (!visible(edge.source.entity) || !visible(edge.target.entity)) continue;
      projectedEdges.push({
        id: edge.id,
        source: edge.source.entity,
        target: edge.target.entity,
        sourcePort: edge.source.port,
        targetPort: edge.target.port,
        originalSource: edge.source.entity,
        originalTarget: edge.target.entity,
      });
    }
  } else {
    for (const edge of graph.edges) {
      if (edge.source.port !== undefined || edge.target.port !== undefined) {
        if (!visible(edge.source.entity) || !visible(edge.target.entity)) continue;
        projectedEdges.push({
          id: edge.id,
          source: edge.source.entity,
          target: edge.target.entity,
          sourcePort: edge.source.port,
          targetPort: edge.target.port,
          originalSource: edge.source.entity,
          originalTarget: edge.target.entity,
        });
        continue;
      }
      const repSource = representativeEntityOf(edge.source.entity);
      const repTarget = representativeEntityOf(edge.target.entity);
      const hiddenSource = !visible(edge.source.entity);
      const hiddenTarget = !visible(edge.target.entity);
      if (repSource === repTarget && (hiddenSource || hiddenTarget)) continue;
      if (!visible(repSource) || !visible(repTarget)) continue;
      projectedEdges.push({
        id: edge.id,
        source: repSource,
        target: repTarget,
        sourcePort: undefined,
        targetPort: undefined,
        originalSource: edge.source.entity,
        originalTarget: edge.target.entity,
      });
    }
  }
  const visibleEdges = projectedEdges;
  const filteredGraph: LayoutGraph = {
    nodes: new Map([...graph.nodes].filter(([id]) => visible(id))),
    roots: graph.roots.filter(visible),
    edges: visibleEdges.map((edge) => ({
      id: edge.id,
      source: edge.sourcePort === undefined ? { entity: edge.source } : { entity: edge.source, port: edge.sourcePort },
      target: edge.targetPort === undefined ? { entity: edge.target } : { entity: edge.target, port: edge.targetPort },
    })),
  };
  const labelSizes = new Map<RelationRef, { width: number; height: number }>();
  const edgeLayouts = new Map<RelationRef, LineLayout>();
  for (const edge of [...visibleEdges].sort((left, right) => byString(left.id, right.id))) {
    const label = edgeLabelOf(document, edge.id);
    if (label === undefined) continue;
    const layout = measure({
      text: label,
      role: "edge-label",
      availableWidth: EDGE_LABEL_WIDTH,
      allocatedLines: DEFAULT_ALLOCATED_LINES["edge-label"],
      folded: false,
    });
    edgeLayouts.set(edge.id, layout);
    labelSizes.set(edge.id, { width: layout.width, height: layout.height });
    recordSlot(occurrenceRef(`r.${localIdOf(edge.id)}`), "edge-label", layout, false);
  }

  // Step 6 — dock and route against fixed boxes (§4.6.4/§4.6.5).
  const docked = dockEdges({ graph: filteredGraph, rects, direction: "top-to-bottom", metrics, labelSizes, fixed: true });
  const finalDocks = new Map<RelationRef, EdgeDocks>(docked.docks);
  const dockingWarnings: LayoutWarning[] = [];
  for (const overflow of [...docked.fixedOverflows].sort(
    (left, right) => byString(left.entity, right.entity) || byString(left.side, right.side),
  )) {
    const occurrence = occurrenceOf(overflow.entity);
    dockingWarnings.push({
      code: "docking-overflow",
      refs: [occurrence],
      message: `side ${overflow.side} of ${occurrence} needs ${overflow.required} docks, fits ${overflow.fitted}`,
      details: {
        occurrence,
        side: overflow.side,
        required: overflow.required,
        fitted: overflow.fitted,
      },
    });
  }
  warnings.push(...dockingWarnings);
  const requests = visibleEdges.map((edge) => {
    const pair = finalDocks.get(edge.id)!;
    const passable = new Set<EntityRef>([
      ...ancestorsOf(filteredGraph, edge.source),
      ...ancestorsOf(filteredGraph, edge.target),
    ]);
    return {
      id: edge.id,
      pairKey: [edge.source, edge.target].sort().join("|"),
      start: pair.source.point,
      startExit: pair.source.exit,
      end: pair.target.point,
      endExit: pair.target.exit,
      passable,
    };
  });
  const routed = routeEdges({ rects, requests, clearance: metrics.clearance });
  for (const id of [...routed.obstructed].sort(byString)) {
    warnings.push({
      code: "route-obstructed",
      refs: [id],
      message: `no orthogonal route around the obstacles was found for ${id}; an elbow is drawn instead`,
    });
  }

  // Edge labels on the final routes; unplaced labels keep their route.
  const blockers: Rect[] = [...rects.values(), ...titleBands.values()];
  const entries = [...edgeLayouts.entries()]
    .sort(([left], [right]) => byString(left, right))
    .map(([id, layout]) => ({ id, route: routed.routes.get(id)!, size: { width: layout.width, height: layout.height } }));
  const labelChoices = placeEdgeLabels(entries, blockers, metrics.labelMargin);
  const labelBoxes = new Map<RelationRef, Rect>();
  for (const [id, choice] of [...labelChoices.entries()].sort(([left], [right]) => byString(left, right))) {
    if (choice === undefined) {
      warnings.push({ code: "label-unplaced", refs: [id], message: `no segment holds the label of ${id}` });
      continue;
    }
    labelBoxes.set(id as RelationRef, choice.box);
  }

  // Step 7 — emit the view plus measurements.
  const placedView = buildMeasuredView(
    document,
    filteredGraph,
    rects,
    finalDocks,
    routed.routes,
    options,
    foldMetadata,
    visibleEdges,
    occurrenceOf,
  );
  const bounds = unionOf(rects, routed.routes, labelBoxes);
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
  return {
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
  };
}

function edgePointOnSide(rect: Rect, side: PortSide, anchor: number): Vec2 {
  const clamped = Math.min(1, Math.max(0, anchor));
  switch (side) {
    case "north":
      return { x: rect.x + clamped * rect.width, y: rect.y };
    case "south":
      return { x: rect.x + clamped * rect.width, y: rect.y + rect.height };
    case "east":
      return { x: rect.x + rect.width, y: rect.y + clamped * rect.height };
    case "west":
      return { x: rect.x, y: rect.y + clamped * rect.height };
  }
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
};

type MeasuredProjectedEdge = {
  readonly id: RelationRef;
  readonly source: EntityRef;
  readonly target: EntityRef;
  readonly originalSource: EntityRef;
  readonly originalTarget: EntityRef;
};

function buildMeasuredView(
  document: SemanticDocument,
  graph: LayoutGraph,
  rects: ReadonlyMap<EntityRef, Rect>,
  docks: ReadonlyMap<RelationRef, EdgeDocks>,
  routes: ReadonlyMap<RelationRef, readonly Vec2[]>,
  options: LayoutOptions,
  foldMetadata: MeasuredFoldMetadata,
  projectedEdges: readonly MeasuredProjectedEdge[],
  occurrenceOf: (entity: EntityRef) => OccurrenceRef,
): ViewDocument {
  const maxContainerDepth = Math.max(
    -1,
    ...[...graph.nodes.values()].filter((node) => node.kind === "container").map((node) => node.depth),
  );
  const entityOccurrences: Record<string, EntityOccurrence> = {};
  for (const id of [...graph.nodes.keys()].sort(byString)) {
    const rect = rects.get(id)!;
    const occurrence = occurrenceOf(id);
    const node = graph.nodes.get(id)!;
    entityOccurrences[occurrence] = {
      id: occurrence,
      entity: id,
      geometry: { x: clean(rect.x), y: clean(rect.y), width: clean(rect.width), height: clean(rect.height) },
      z: node.kind === "container" ? node.depth - (maxContainerDepth + 1) : 0,
    };
  }
  const portOccurrences: Record<string, PortOccurrence> = {};
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  const coded = (value: string): string => `${value.length}.${value}`;
  const parallel = parallelRelations(graph);
  const projectedById = new Map<RelationRef, MeasuredProjectedEdge>();
  for (const edge of projectedEdges) projectedById.set(edge.id, edge);
  for (const edge of [...graph.edges].sort((left, right) => byString(left.id, right.id))) {
    const pair = docks.get(edge.id)!;
    const route = routes.get(edge.id)!;
    const projected = projectedById.get(edge.id);
    const endOccurrence = (dock: Dock, role: "source" | "target"): OccurrenceRef => {
      if (dock.port === undefined) return occurrenceOf(dock.entity);
      const id = parallel.has(edge.id)
        ? occurrenceRef(`p.e.${coded(localIdOf(dock.port))}.${coded(localIdOf(edge.id))}.${role}`)
        : occurrenceRef(`p.s.${coded(localIdOf(dock.port))}`);
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
    if (projected !== undefined && (projected.source !== projected.originalSource || projected.target !== projected.originalTarget)) {
      const sourceOccurrence = occurrenceOf(projected.originalSource);
      const targetOccurrence = occurrenceOf(projected.originalTarget);
      const sourceRep = occurrenceOf(projected.source);
      const targetRep = occurrenceOf(projected.target);
      relationOccurrences[id] = {
        id,
        relation: edge.id,
        endpoints: [
          projected.source === projected.originalSource
            ? { role: "source", occurrence: endOccurrence(pair.source, "source") }
            : {
                role: "source",
                occurrence: sourceRep,
                semanticTarget: projected.originalSource,
                sourceOccurrence,
              },
          projected.target === projected.originalTarget
            ? { role: "target", occurrence: endOccurrence(pair.target, "target") }
            : {
                role: "target",
                occurrence: targetRep,
                semanticTarget: projected.originalTarget,
                sourceOccurrence: targetOccurrence,
              },
        ],
        waypoints,
      };
      continue;
    }
    relationOccurrences[id] = {
      id,
      relation: edge.id,
      endpoints: [
        { role: "source", occurrence: endOccurrence(pair.source, "source") },
        { role: "target", occurrence: endOccurrence(pair.target, "target") },
      ],
      waypoints,
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
