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
  hasErrors,
  localIdOf,
  occurrenceRef,
  validateDocument,
  viewRef,
  type DiagramForm,
  type DiagramPresentation,
  type EntityOccurrence,
  type EntityRef,
  type OccurrenceRef,
  type PortOccurrence,
  type PortSide,
  type RelationOccurrence,
  type RelationRef,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import { dockEdges, parallelRelations, type Dock, type EdgeDocks } from "./dock.js";
import { ancestorsOf, readGraph, type LayoutGraph } from "./graph.js";
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

function formOf(presentation: DiagramPresentation, entity: EntityRef): DiagramForm | undefined {
  return presentation.entities[entity]?.form;
}

/** Slot text for one occurrence: typed presentation slots, else the semantic name as title. */
function slotTexts(
  document: SemanticDocument,
  presentation: DiagramPresentation,
  entity: EntityRef,
): Partial<Record<TextRole, string>> {
  const text = presentation.entities[entity]?.text;
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
function singleLineMeasurer(measureText: LayoutOptions["measureText"]): LineMeasurer {
  return (request: MeasureRequest): LineLayout => {
    const size = measureText(request.text, request.role);
    return { lines: [request.text], width: size.width, height: size.height, overflow: false };
  };
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
  const hints: LayoutHints = options.hints ?? {};
  const gaps = resolveGaps(options.hints, metrics);
  const globalStretch = hints.stretch ?? false;
  const measure = options.measureLines ?? singleLineMeasurer(options.measureText);
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
  const collapsed = new Set<EntityRef>();
  if (sourceView !== undefined) {
    for (const id of collapsedOf(sourceView)) {
      const entity = sourceView.entityOccurrences[id as OccurrenceRef]?.entity;
      if (entity !== undefined) collapsed.add(entity);
    }
  }
  for (const id of options.collapsed ?? []) {
    const entity = entityOfOccurrence.get(id);
    if (entity !== undefined) collapsed.add(entity);
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
    const form = formOf(presentation, id);
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
      return resolveOrder(live, presentation.legends[parent]?.order);
    }
    return resolveOrder(live, hints.ordering?.[parent]);
  };

  /** Stretch context of one member: its innermost group, else the global flag. */
  const contextStretchOf = (member: EntityRef): boolean => {
    let best: LayoutGroup | undefined;
    let bestDepth = -1;
    const visit = (group: LayoutGroup, depth: number): void => {
      if (!groupLeaves(group).includes(member)) return;
      if (depth > bestDepth) {
        best = group;
        bestDepth = depth;
      }
      for (const item of group.items) if (isLayoutGroup(item)) visit(item, depth + 1);
    };
    for (const group of hints.grouping ?? []) visit(group, 0);
    return effectiveStretch(best?.stretch, globalStretch);
  };

  /** Stretch in force for one sibling level: its covering group, else inherited. */
  const levelStretchOf = (level: readonly EntityRef[], inherited: boolean): boolean => {
    for (const group of hints.grouping ?? []) {
      const leaves = new Set(groupLeaves(group));
      if (level.length > 0 && level.every((member) => leaves.has(member))) {
        return effectiveStretch(group.stretch, globalStretch);
      }
    }
    return inherited;
  };

  // Step 2 — widths bottom-up: (a) unwrapped header width at the
  // toggle-reduced allocation, (b) widest fixed child plus insets, (c) the
  // grouping width implied by hints as an authored override (stretch).
  const outerWidths = new Map<EntityRef, number>();
  const unwrappedHeaderWidth = (id: EntityRef): number => {
    const slots = slotTexts(document, presentation, id);
    const width = headerAvailableWidth(UNWRAPPED_PROBE_WIDTH, true);
    let widest = 0;
    for (const role of ["kicker", "title"] as const) {
      const text = slots[role];
      if (text === undefined) continue;
      widest = Math.max(widest, measure({ text, role, availableWidth: width, allocatedLines: 1, folded: false }).width);
    }
    return widest;
  };
  const computeWidth = (id: EntityRef, inheritedStretch: boolean): number => {
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
    const levelStretch = levelStretchOf(ordered, inheritedStretch);
    for (const child of ordered) computeWidth(child, levelStretchOf([child], levelStretch));
    if (levelStretch) {
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
    let widestChild = 0;
    for (const child of ordered) widestChild = Math.max(widestChild, outerWidths.get(child) ?? 0);
    const outer = Math.max(
      FIXED_CARD_WIDTH,
      unwrappedHeaderWidth(id) + 2 * 16,
      widestChild + (ordered.length > 0 ? 2 * 16 : 0),
    );
    outerWidths.set(id, outer);
    return outer;
  };
  const rootOrder = resolveOrder(graph.roots.filter(visible), undefined);
  for (const root of rootOrder) computeWidth(root, contextStretchOf(root));

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
      effectiveType: `${document.entities[id]?.profile ?? ""}:${document.entities[id]?.type ?? ""}/${formOf(presentation, id) ?? graph.nodes.get(id)!.kind}`,
      folded,
      toggle,
      slots: slotTexts(document, presentation, id),
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
    items.forEach((item, index) => {
      if (index > 0) {
        const gap = stackGap(item, axis);
        if (axis === "x") cursorX += gap;
        else cursorY += gap;
      }
      if ("group" in item) {
        const size = placeGroupItems(item.group, cursorX, cursorY, stretch);
        if (axis === "x") {
          cursorX += size.width + (item.group.gapAfter ?? 0);
          height = Math.max(height, size.height);
          width = cursorX - x;
        } else {
          cursorY += size.height + (item.group.gapAfter ?? 0);
          width = Math.max(width, size.width);
          height = cursorY - y;
        }
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
  const seatRoot = (height: number, width: number, gapAfter: number): void => {
    rootY += height + gapAfter;
    rootWidth = Math.max(rootWidth, width);
  };
  for (const group of rootGroups) {
    if (!firstRoot) rootY += gaps.rankGap;
    firstRoot = false;
    const size = placeGroupItems(group, 0, rootY, globalStretch);
    seatRoot(size.height, size.width, group.gapAfter ?? 0);
  }
  for (const root of ungroupedRoots) {
    if (!firstRoot) rootY += gaps.rankGap;
    firstRoot = false;
    const box = placeOne(root, 0, rootY, contextStretchOf(root));
    seatRoot(box.height, box.width, 0);
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
    const text = slotTexts(document, presentation, id);
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

  // Visible edges: internal edges under a collapse are explicitly excluded.
  const visibleEdges = graph.edges.filter((edge) => visible(edge.source.entity) && visible(edge.target.entity));
  const filteredGraph: LayoutGraph = {
    nodes: new Map([...graph.nodes].filter(([id]) => visible(id))),
    roots: graph.roots.filter(visible),
    edges: visibleEdges,
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
  const docked = dockEdges({ graph: filteredGraph, rects, direction: "top-to-bottom", metrics, labelSizes });
  const finalDocks = new Map<RelationRef, EdgeDocks>(docked.docks);
  const sideLength = (rect: Rect, side: PortSide): number =>
    side === "east" || side === "west" ? rect.height : rect.width;
  const byEntitySide = new Map<string, { entity: EntityRef; side: PortSide; edge: RelationRef; end: "source" | "target" }[]>();
  for (const edge of visibleEdges) {
    const pair = finalDocks.get(edge.id);
    if (pair === undefined) continue;
    for (const end of ["source", "target"] as const) {
      const dock = pair[end];
      const key = `${dock.entity}|${dock.side}`;
      const list = byEntitySide.get(key) ?? [];
      list.push({ entity: dock.entity, side: dock.side, edge: edge.id, end });
      byEntitySide.set(key, list);
    }
  }
  const dockingWarnings: LayoutWarning[] = [];
  for (const list of byEntitySide.values()) {
    list.sort((left, right) => byString(left.edge, right.edge));
    const rect = rects.get(list[0]!.entity)!;
    const capacity = Math.max(1, Math.floor(sideLength(rect, list[0]!.side) / metrics.slotSpacing) + 1);
    if (list.length <= capacity) continue;
    const fitted = list.slice(0, capacity);
    const overflowed = list.slice(capacity);
    const anchorDock = finalDocks.get(fitted[fitted.length - 1]!.edge)![fitted[fitted.length - 1]!.end];
    for (const entry of overflowed) {
      const pair = finalDocks.get(entry.edge)!;
      const current = pair[entry.end];
      const point = edgePointOnSide(rect, entry.side, anchorDock.anchor);
      finalDocks.set(entry.edge, { ...pair, [entry.end]: { ...current, point, anchor: anchorDock.anchor } });
    }
    dockingWarnings.push({
      code: "docking-overflow",
      refs: [occurrenceOf(list[0]!.entity), ...overflowed.map((entry) => entry.edge)],
      message: `docking overflow on ${list[0]!.side}: ${list.length} slots needed, ${fitted.length} fitted; the box is kept`,
      details: {
        occurrence: occurrenceOf(list[0]!.entity),
        side: list[0]!.side,
        required: list.length,
        fitted: fitted.length,
      },
    });
  }
  dockingWarnings.sort((left, right) => byString(left.refs[0]!, right.refs[0]!));
  warnings.push(...dockingWarnings);
  const requests = visibleEdges.map((edge) => {
    const pair = finalDocks.get(edge.id)!;
    const passable = new Set<EntityRef>([
      ...ancestorsOf(filteredGraph, edge.source.entity),
      ...ancestorsOf(filteredGraph, edge.target.entity),
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
  const placedView = buildMeasuredView(document, filteredGraph, rects, finalDocks, routed.routes, options, sourceView);
  const bounds = unionOf(rects, routed.routes, labelBoxes);
  const width = bounds.width;
  const zoom = bounds.empty ? 1 : Math.min(1, Math.max(MIN_ZOOM, options.targetWidth / width));
  const camera = bounds.empty ? { x: 0, y: 0 } : { x: bounds.xmin, y: bounds.ymin };
  const view: ViewDocument = {
    ...placedView,
    presentation: { camera: { x: clean(camera.x), y: clean(camera.y), zoom } },
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

function buildMeasuredView(
  document: SemanticDocument,
  graph: LayoutGraph,
  rects: ReadonlyMap<EntityRef, Rect>,
  docks: ReadonlyMap<RelationRef, EdgeDocks>,
  routes: ReadonlyMap<RelationRef, readonly Vec2[]>,
  options: LayoutOptions,
  sourceView: ViewDocument | undefined,
): ViewDocument {
  const occurrenceOf = (entity: EntityRef): OccurrenceRef => occurrenceRef(`e.${localIdOf(entity)}`);
  const entityOccurrences: Record<string, EntityOccurrence> = {};
  for (const id of [...graph.nodes.keys()].sort(byString)) {
    const rect = rects.get(id)!;
    const occurrence = occurrenceOf(id);
    entityOccurrences[occurrence] = {
      id: occurrence,
      entity: id,
      geometry: { x: clean(rect.x), y: clean(rect.y), width: clean(rect.width), height: clean(rect.height) },
      z: graph.nodes.get(id)!.kind === "container" ? -1 : 0,
    };
  }
  const portOccurrences: Record<string, PortOccurrence> = {};
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  const coded = (value: string): string => `${value.length}.${value}`;
  const parallel = parallelRelations(graph);
  for (const edge of [...graph.edges].sort((left, right) => byString(left.id, right.id))) {
    const pair = docks.get(edge.id)!;
    const route = routes.get(edge.id)!;
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
    sourceView?.summaryLabels === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(sourceView.summaryLabels).filter(
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
    groups: {},
    filters: [],
    presentation: { camera: { x: 0, y: 0, zoom: 1 } },
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
