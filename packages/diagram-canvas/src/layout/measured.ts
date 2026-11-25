import { relationBaseType } from "@sentropic/diagram-core";
import { validateFlows } from "@sentropic/diagram-core";
import { relationVerdict } from "../visibility.js";
import { DEFAULT_FLOW_TOKENS, planFlows, placeFlowMarks } from "./flows.js";
import { layoutErd } from "./erd.js";
import { DEFAULT_EDGE_LABEL_SIZE } from "../camera.js";
import { diagramAnatomyOf, isR7ConnectorPresentation } from "../r7Mode.js";
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
import { solveCombs, type CombEdgeCandidate, type SolvedCombPlan } from "./comb.js";
import {
  findFirstEmptyRootCell,
  layoutGridScope,
  layoutInheritedGridScope,
  layoutStackScope,
  type ComposedGridReport,
  type ComposedGutter,
  type FreeCellItemSpec,
  type GridLayoutResult,
  type InheritedWidthContribution,
  type LayoutCompositionReport,
  type StackLayoutResult,
} from "./compose.js";
import {
  ASPECT_16_9_TARGET,
  ASPECT_16_9_TOLERANCE,
  ASPECT_TAU_LADDER,
  auditSiblingZonePaintedGaps,
  chooseAspectTau,
  combineRootWithLegendBounds,
  computeAspectSlack,
  computePlanDigest,
  foldNeutralView,
  type FrozenAutoPackLevel,
  type NominalCompositionPlan,
  type SubtreeMemo,
  type SubtreeMemoEntry,
  type SubtreeNodeSnapshot,
} from "./plan.js";
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
import {
  linkStyleKey,
  measureSceneLinkLegend,
  placeSceneLinkLegend,
  type LinkLegendEdgeInput,
  type SceneLinkLegend,
} from "../presentation/linkLegend.js";
import { LABEL_CLEARANCE_REFERENCE_SCALE, placePackedLabel } from "./labels.js";
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

  if (relations !== undefined && (relations === null || typeof relations !== "object" || Array.isArray(relations))) {
    refusals.push({ code: "document-invalid", path: "presentation.relations", message: "connector styles must be keyed by relation" });
  } else if (relations !== undefined) {
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
      if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
        refusals.push({ code: "document-invalid", path: `presentation.relations.${key}`, message: "connector style must be a record" });
        continue;
      }
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
      if (occurrence === null || typeof occurrence !== "object" || Array.isArray(occurrence)) {
        refusals.push({ code: "document-invalid", path: `sourceView.relationOccurrences.${key}`, message: "relation occurrence must be a record" });
        continue;
      }
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

export interface LayoutExecutionContext {
  readonly plan?: NominalCompositionPlan;
  readonly memo?: SubtreeMemo;
  /** Optional pre-validated graph from an immediately preceding `computeNominalCompositionPlan` on the same inputs. */
  readonly graph?: LayoutGraph;
}

interface PlanSizingReport {
  readonly rootWidth: number;
  readonly rootHeight: number;
  readonly xTrackIds: readonly string[];
  readonly yTrackIds: readonly string[];
  readonly capX: number;
  readonly capY: number;
  readonly legendSize?: { readonly width: number; readonly height: number };
  readonly effectiveLegendAnchor: "right" | "bottom" | "free-cell" | "none";
  readonly legendInsideCell: boolean;
}

interface PlanPassCapture {
  autoPackLevels: Record<string, FrozenAutoPackLevel>;
  innerWiden: Record<string, number>;
  sizingReport?: PlanSizingReport;
  paintedBounds?: { readonly width: number; readonly height: number };
  legendCell?: { readonly bandId: string; readonly colId: string };
}

interface PlanExecutionShared {
  graph?: LayoutGraph;
  readonly sceneBoxCache?: Map<string, ReturnType<typeof measureSceneBox>>;
}

interface PlanExecutionContext {
  readonly mode: "nominal-plan" | "state";
  readonly plan?: NominalCompositionPlan;
  readonly memo?: SubtreeMemo;
  readonly tauOverride?: number;
  readonly sigmaColsOverride?: Readonly<Record<string, number>>;
  readonly sigmaBandsOverride?: Readonly<Record<string, number>>;
  readonly legendCellOverride?: { readonly bandId: string; readonly colId: string };
  readonly sizingOnly?: boolean;
  readonly capture?: PlanPassCapture;
  readonly shared?: PlanExecutionShared;
}

const sameRecord = (left: Readonly<Record<string, number>>, right: Readonly<Record<string, number>>): boolean => {
  const lk = Object.keys(left);
  const rk = Object.keys(right);
  if (lk.length !== rk.length) return false;
  return lk.every((k) => left[k] === right[k]);
};

/**
 * Compute the fold-independent nominal composition plan (H2-STEP0 §4.2 S-1).
 * Runs with `collapsed = ∅` on the fold-neutral view, freezing auto-packed
 * shelf partitions (by child entity ref), inner-container label widenings, and
 * — when `aspect === "16:9"` — the chosen τ, whole-unit slack σ, and at most
 * one post-route painted-bounds correction pass.
 */
export function computeNominalCompositionPlan(
  document: SemanticDocument,
  options: LayoutOptions,
  sourceView?: ViewDocument,
): { readonly status: "ok"; readonly plan: NominalCompositionPlan; readonly graph?: LayoutGraph } | { readonly status: "refused"; readonly result: LayoutResult } {
  const neutralView = sourceView === undefined ? undefined : foldNeutralView(sourceView);
  const { previousOrientation: _ignoredPrev, ...restOptions } = options;
  void _ignoredPrev;
  const nominalOptions: LayoutOptions = {
    ...restOptions,
    collapsed: [],
  };
  const shared: PlanExecutionShared = { sceneBoxCache: new Map() };
  const want16x9 = options.hints?.composition?.aspect === "16:9";

  if (!want16x9) {
    const tau = 1.78;
    const capture: PlanPassCapture = { autoPackLevels: {}, innerWiden: {} };
    const pass = layoutMeasuredPass(document, nominalOptions, neutralView, new Set(), {
      mode: "nominal-plan",
      tauOverride: tau,
      capture,
      shared,
    });
    if (pass.status === "refused") {
      return { status: "refused", result: pass };
    }
    const autoPackLevels = Object.fromEntries(
      Object.entries(capture.autoPackLevels).sort(([left], [right]) => byString(left, right)),
    );
    const innerWiden = Object.fromEntries(
      Object.entries(capture.innerWiden).sort(([left], [right]) => byString(left, right)),
    );
    const sigmaCols: Record<string, number> = {};
    const sigmaBands: Record<string, number> = {};
    const legendCell = capture.legendCell;
    const planDigest = computePlanDigest({
      tau,
      autoPackLevels,
      innerWiden,
      sigmaCols,
      sigmaBands,
      ...(legendCell === undefined ? {} : { legendCell }),
    });
    return {
      status: "ok",
      plan: {
        planDigest,
        tau,
        autoPackLevels,
        innerWiden,
        sigmaCols,
        sigmaBands,
        ...(legendCell === undefined ? {} : { legendCell }),
      },
      ...(shared.graph === undefined ? {} : { graph: shared.graph }),
    };
  }

  // S-1 Step 4: search the fixed τ ladder at nominal (sizing-only, no hysteresis).
  const ladderCandidates: { readonly tau: number; readonly width: number; readonly height: number }[] = [];
  let chosenSizingReport: PlanSizingReport | undefined;
  let capturedLegendCell: { readonly bandId: string; readonly colId: string } | undefined;
  const sizingByTau = new Map<number, PlanSizingReport>();
  for (const tau of ASPECT_TAU_LADDER) {
    const cap: PlanPassCapture = { autoPackLevels: {}, innerWiden: {} };
    const sizingPass = layoutMeasuredPass(document, nominalOptions, neutralView, new Set(), {
      mode: "nominal-plan",
      tauOverride: tau,
      sizingOnly: true,
      capture: cap,
      shared,
    });
    if (sizingPass.status === "refused") {
      return { status: "refused", result: sizingPass };
    }
    const report = cap.sizingReport;
    if (report === undefined) {
      return { status: "refused", result: sizingPass };
    }
    if (capturedLegendCell === undefined && cap.legendCell !== undefined) {
      capturedLegendCell = cap.legendCell;
    }
    sizingByTau.set(tau, report);
    const combined = combineRootWithLegendBounds(
      report.rootWidth,
      report.rootHeight,
      report.legendSize,
      report.effectiveLegendAnchor,
      report.legendInsideCell,
    );
    ladderCandidates.push({ tau, width: combined.width, height: combined.height });
  }
  const chosenTau = chooseAspectTau(ladderCandidates, ASPECT_16_9_TARGET);
  chosenSizingReport = sizingByTau.get(chosenTau.tau)!;

  // S-1 Step 5: initial slack σ from nominal bounds.
  const slack1 = computeAspectSlack({
    width: chosenTau.width,
    height: chosenTau.height,
    xTrackIds: chosenSizingReport.xTrackIds,
    yTrackIds: chosenSizingReport.yTrackIds,
    capX: chosenSizingReport.capX,
    capY: chosenSizingReport.capY,
  });

  // S-1 Step 6a: nominal routed pass #1.
  const capture1: PlanPassCapture = { autoPackLevels: {}, innerWiden: {} };
  const pass1 = layoutMeasuredPass(document, nominalOptions, neutralView, new Set(), {
    mode: "nominal-plan",
    tauOverride: chosenTau.tau,
    sigmaColsOverride: slack1.sigmaCols,
    sigmaBandsOverride: slack1.sigmaBands,
    ...(capturedLegendCell === undefined ? {} : { legendCellOverride: capturedLegendCell }),
    capture: capture1,
    shared,
  });
  if (pass1.status === "refused") {
    return { status: "refused", result: pass1 };
  }
  const painted1 = capture1.paintedBounds ?? { width: chosenTau.width, height: chosenTau.height };
  const ratio1 = painted1.height > 0 && painted1.width > 0 ? painted1.width / painted1.height : ASPECT_16_9_TARGET;
  const dist1 = Math.abs(Math.log(ratio1 / ASPECT_16_9_TARGET));

  let bestCapture = capture1;
  let bestSigmaCols = slack1.sigmaCols;
  let bestSigmaBands = slack1.sigmaBands;
  let bestRatio = ratio1;
  let postRouteCorrectionRounds = 0;

  // S-1 Step 6b: at most ONE post-route correction from painted bounds when outside ±2%.
  if (Math.abs(ratio1 / ASPECT_16_9_TARGET - 1) > ASPECT_16_9_TOLERANCE) {
    const sumX1 = Object.values(slack1.sigmaCols).reduce((sum, v) => sum + v, 0);
    const sumY1 = Object.values(slack1.sigmaBands).reduce((sum, v) => sum + v, 0);
    const baseW = Math.max(1, painted1.width - sumX1);
    const baseH = Math.max(1, painted1.height - sumY1);
    const slack2 = computeAspectSlack({
      width: baseW,
      height: baseH,
      xTrackIds: chosenSizingReport.xTrackIds,
      yTrackIds: chosenSizingReport.yTrackIds,
      capX: chosenSizingReport.capX,
      capY: chosenSizingReport.capY,
    });
    if (!sameRecord(slack2.sigmaCols, slack1.sigmaCols) || !sameRecord(slack2.sigmaBands, slack1.sigmaBands)) {
      postRouteCorrectionRounds = 1;
      const capture2: PlanPassCapture = { autoPackLevels: {}, innerWiden: {} };
      const pass2 = layoutMeasuredPass(document, nominalOptions, neutralView, new Set(), {
        mode: "nominal-plan",
        tauOverride: chosenTau.tau,
        sigmaColsOverride: slack2.sigmaCols,
        sigmaBandsOverride: slack2.sigmaBands,
        ...(capturedLegendCell === undefined ? {} : { legendCellOverride: capturedLegendCell }),
        capture: capture2,
        shared,
      });
      if (pass2.status === "laid-out") {
        const painted2 = capture2.paintedBounds ?? painted1;
        const ratio2 = painted2.height > 0 && painted2.width > 0 ? painted2.width / painted2.height : ASPECT_16_9_TARGET;
        const dist2 = Math.abs(Math.log(ratio2 / ASPECT_16_9_TARGET));
        // Keep the better of the two (smaller |ln(A/A*)|; ties keep the first).
        if (dist2 < dist1 - 1e-9) {
          bestCapture = capture2;
          bestSigmaCols = slack2.sigmaCols;
          bestSigmaBands = slack2.sigmaBands;
          bestRatio = ratio2;
        }
      }
    }
  }

  const autoPackLevels = Object.fromEntries(
    Object.entries(bestCapture.autoPackLevels).sort(([left], [right]) => byString(left, right)),
  );
  const innerWiden = Object.fromEntries(
    Object.entries(bestCapture.innerWiden).sort(([left], [right]) => byString(left, right)),
  );
  const nominalAspect = clean(Math.round(bestRatio * 1_000_000) / 1_000_000);
  const unreached = Math.abs(bestRatio / ASPECT_16_9_TARGET - 1) > ASPECT_16_9_TOLERANCE;
  const finalLegendCell = capturedLegendCell ?? bestCapture.legendCell;
  const planDigest = computePlanDigest({
    tau: chosenTau.tau,
    autoPackLevels,
    innerWiden,
    sigmaCols: bestSigmaCols,
    sigmaBands: bestSigmaBands,
    ...(finalLegendCell === undefined ? {} : { legendCell: finalLegendCell }),
  });
  return {
    status: "ok",
    plan: {
      planDigest,
      tau: chosenTau.tau,
      autoPackLevels,
      innerWiden,
      sigmaCols: bestSigmaCols,
      sigmaBands: bestSigmaBands,
      ...(finalLegendCell === undefined ? {} : { legendCell: finalLegendCell }),
      nominalAspect,
      postRouteCorrectionRounds,
      ...(unreached ? { aspectUnreached: { achieved: nominalAspect, target: ASPECT_16_9_TARGET } } : {}),
    },
    ...(shared.graph === undefined ? {} : { graph: shared.graph }),
  };
}

export function layoutMeasured(
  document: SemanticDocument,
  options: LayoutOptions,
  sourceView?: ViewDocument,
  execution?: LayoutExecutionContext,
): LayoutResult {
  const relationStyleRefusals = validateRelationPresentations(
    options.presentation?.relations,
    options.presentation?.contractPin ?? sourceView?.presentation.diagram?.contractPin,
    sourceView,
  );
  if (relationStyleRefusals.length > 0) {
    return { status: "refused", refusals: relationStyleRefusals, diagnostics: [] };
  }
  if (document.profileRefs.length === 1 && document.profileRefs[0] === "erd@1") return layoutErd(document, options, sourceView);
  let stateCtx: PlanExecutionContext | undefined;
  if (options.hints?.composition !== undefined) {
    let nominalPlan = execution?.plan;
    let prevalidatedGraph = execution?.graph;
    if (nominalPlan === undefined) {
      const built = computeNominalCompositionPlan(document, options, sourceView);
      if (built.status === "refused") return built.result;
      nominalPlan = built.plan;
      prevalidatedGraph = built.graph;
    }
    stateCtx = {
      mode: "state",
      plan: nominalPlan,
      ...(execution?.memo === undefined ? {} : { memo: execution.memo }),
      ...(prevalidatedGraph === undefined ? {} : { shared: { graph: prevalidatedGraph } }),
    };
  }
  const first = layoutMeasuredPass(document, options, sourceView, new Set(), stateCtx);
  if (first.status !== "laid-out" || first.flowTargets === undefined) return first;
  const forced = new Set<string>();
  const failed = new Set(first.warnings.filter((w) => w.code === "route-obstructed" || w.code === "badge-unplaced").flatMap((w) => w.refs));
  const plan = planFlows(document, first.view, options.registry, options, new Set());
  for (const [key, members] of plan.groups) {
    if (members.length >= 2 && !first.flowBundles?.some((b) => b.id === key) && members.some((m) => failed.has(m.occurrence))) forced.add(key);
  }
  if (forced.size === 0) return first;
  const repaired = layoutMeasuredPass(document, options, sourceView, forced, stateCtx);
  return repaired.status === "laid-out" ? { ...repaired, flowRepairPasses: 1 } : repaired;
}

function layoutMeasuredPass(
  document: SemanticDocument,
  options: LayoutOptions,
  sourceView: ViewDocument | undefined,
  forced: ReadonlySet<string>,
  planCtx?: PlanExecutionContext,
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
  if (sourceView !== undefined && Object.values(sourceView.entityOccurrences).some((occurrence) => document.entities[occurrence.entity]?.type === "flow-scenario")) return { status: "refused", refusals: [{ code: "document-invalid", path: "sourceView.entityOccurrences", message: "flow scenarios have no view occurrence" }], diagnostics: [] };
  const presentation = options.presentation;
  if (presentation === undefined) {
    return {
      status: "refused",
      refusals: [{ code: "document-invalid", path: "presentation", message: "measured layout needs presentation.diagram" }],
      diagnostics: [],
    };
  }
  /**
   * Per-occurrence pinned anatomy (DE-1): the presentation entry selects
   * `diagram-anatomy/v1 | v2`, falling back to `sourceView.presentation.anatomy`;
   * absent everywhere means `"v1"` so existing views keep the frozen `460 × 200`
   * footprint by construction.
   */
  const occurrenceAnatomy = (occurrence: OccurrenceRef): DiagramAnatomy =>
    diagramAnatomyOf(presentation, sourceView, occurrence);
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
  const sceneBoxCache = planCtx?.shared?.sceneBoxCache ?? new Map<string, ReturnType<typeof measureSceneBox>>();
  const sceneBoxAt = (id: OccurrenceRef, width: number, collapsed: boolean) => {
    const key = `${id}|${width}|${collapsed}`;
    let box = sceneBoxCache.get(key);
    if (box === undefined) {
      const rawEntry = presentation.entities[id];
      const entry = rawEntry === undefined ? undefined : { ...rawEntry, anatomy: occurrenceAnatomy(id) };
      const kind = kinds.get(projected.entityOccurrences[id]?.entity!);
      const expanded = kind === "container-expanded" || kind === "legend-expanded";
      box = measureSceneBox(expanded && entry?.form === "card" ? { ...entry, form: "container" } : entry,
        id, width, collapsed, measure, metrics.containerPadding);
      sceneBoxCache.set(key, box);
    }
    return box;
  };
  let graph = planCtx?.shared?.graph;
  if (graph === undefined) {
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
    graph = read.graph;
    if (planCtx?.shared !== undefined) planCtx.shared.graph = graph;
  }
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
  const composition = hints.composition;
  const zoneRule = r7Routing || composition !== undefined;
  const gaps = resolveGaps(options.hints, metrics);
  const globalStretch = hints.stretch ?? false;
  // DC-2a row-pack (SPEC_EVOL_DC2A §3–§4, AC-1): every measured view is
  // packed; `options.rowPack` only tunes the objective.
  const rowPack = resolveRowPack(options.rowPack);
  const contentInset = metrics.containerPadding;
  const rowGaps = resolveRowGaps(hints, metrics);
  const zoneGutter = resolveRowGaps(hints, metrics, zoneRule).zoneX;
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
  const anatomyOverrides = Object.fromEntries(Object.keys(projected.entityOccurrences).flatMap((id) => {
    const anatomy = presentation.entities[id]?.anatomy ?? sourceView?.presentation.entityAnatomy?.[id];
    return anatomy === undefined || anatomy === (projected.presentation.anatomy ?? "v1") ? [] : [[id, anatomy]];
  }));
  const { entityAnatomy: _previousAnatomy, ...projectedPresentation } = projected.presentation;
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
    presentationState: {
      ...projectedPresentation,
      ...(Object.keys(anatomyOverrides).length === 0 ? {} : { entityAnatomy: anatomyOverrides }),
      diagram: persistableDiagramPresentation(presentation),
    },
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

  const containerEntities = new Set<EntityRef>();
  for (const node of graph.nodes.values()) {
    const kind = kinds.get(node.id);
    if (
      node.kind === "container" ||
      kind === "container-expanded" ||
      kind === "container-collapsed" ||
      kind === "legend-expanded" ||
      kind === "legend-collapsed"
    ) {
      containerEntities.add(node.id);
    }
  }
  const hintRefusals = validateHints(hints, {
    roots: new Set(graph.roots),
    parentOf: new Map([...graph.nodes.values()].map((node) => [node.id, node.parent] as const)),
    containers: containerEntities,
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
  const edgeLabelMeasure = scaleEdgeLabelMeasurer(measure, r7Routing ? metrics.edgeLabelSize : undefined, DEFAULT_EDGE_LABEL_SIZE);
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

  // H2.8 + Review P2 #3: resolve the current fold state's visible legend size
  // IMMEDIATELY after fold projection (BEFORE sizing/seating tracks), so a
  // `free-cell` legend contributes its measured box to its cell's tracks on
  // the very first sizing sweep — and a fold removing the second connector
  // style narrows that column on the same call, with memo on or off.
  const effectiveLegendAnchor: "right" | "bottom" | "free-cell" | "none" =
    composition === undefined
      ? "none"
      : composition.legend === "host"
        ? (options.legend ?? "right")
        : composition.legend;
  const hasVisibleAuthoredLegend = [...graph.nodes.keys()].some((id) => {
    if (!visible(id)) return false;
    const kind = kinds.get(id);
    return kind === "legend-expanded" || kind === "legend-collapsed";
  });
  const stateMeasuredLegend = (() => {
    if (composition === undefined || effectiveLegendAnchor === "none" || hasVisibleAuthoredLegend) return undefined;
    const legendEdges: LinkLegendEdgeInput[] = [];
    for (const edge of drawnEdges) {
      const occurrence = projected.relationOccurrences[edge.occurrence];
      if (occurrence === undefined) continue;
      const semantic = document.relations[occurrence.relation];
      if (semantic?.profile === "erd@1" || semantic?.type === "flow-step") continue;
      const relStyle = presentation.relations?.[occurrence.id] ?? presentation.relations?.[occurrence.relation];
      const rawStroke = occurrence.strokeStyle ?? relStyle?.strokeStyle;
      const resolvedStroke = rawStroke === undefined ? undefined : resolveDashPattern(rawStroke)?.style;
      const rawArrow = occurrence.arrowhead ?? relStyle?.arrowhead;
      const resolvedArrow = rawArrow === undefined ? undefined : resolveArrowhead(rawArrow)?.canonicalKind;
      const rawEmphasis = occurrence.emphasis ?? relStyle?.emphasis;
      const resolvedEmphasis = rawEmphasis === undefined ? undefined : resolveLinkEmphasis(rawEmphasis)?.emphasis;
      legendEdges.push({
        ...(r7Routing && resolvedStroke !== undefined && resolvedStroke !== "solid" ? { strokeStyle: resolvedStroke } : {}),
        ...(r7Routing && resolvedArrow !== undefined && resolvedArrow !== "arrow" ? { arrowhead: resolvedArrow } : {}),
        ...(r7Routing && resolvedEmphasis === "emphasis" ? { emphasis: resolvedEmphasis } : {}),
      });
    }
    return measureSceneLinkLegend({
      edges: legendEdges,
      measureLines: measure,
      ...(options.legendTitle === undefined ? {} : { title: options.legendTitle }),
      ...(options.legendLabels === undefined ? {} : { labels: options.legendLabels }),
      ...(metrics.edgeLabelSize === undefined ? {} : { fontSize: metrics.edgeLabelSize }),
    });
  })();
  const resolvedLegendCell: { readonly bandId: string; readonly colId: string } | undefined =
    composition !== undefined && effectiveLegendAnchor === "free-cell"
      ? (planCtx?.mode === "state"
          ? planCtx.plan?.legendCell
          : planCtx?.legendCellOverride ?? findFirstEmptyRootCell(composition.grids.root, rootOrder))
      : undefined;
  if (planCtx?.mode === "nominal-plan" && planCtx.capture !== undefined && resolvedLegendCell !== undefined) {
    planCtx.capture.legendCell = resolvedLegendCell;
  }
  const rootFreeCellItem: FreeCellItemSpec | undefined =
    effectiveLegendAnchor === "free-cell" && resolvedLegendCell !== undefined && stateMeasuredLegend !== undefined
      ? {
          bandId: resolvedLegendCell.bandId,
          colId: resolvedLegendCell.colId,
          width: stateMeasuredLegend.width,
          height: stateMeasuredLegend.height,
        }
      : undefined;

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

  const nominalPlan = planCtx?.mode === "state" ? planCtx.plan : undefined;
  const subtreeMemo = planCtx?.mode === "state" ? planCtx.memo : undefined;
  const innerWidenMap: ReadonlyMap<string, number> | undefined =
    nominalPlan === undefined ? undefined : new Map(Object.entries(nominalPlan.innerWiden));
  const sigmaColsMap: ReadonlyMap<string, number> | undefined =
    planCtx?.sigmaColsOverride !== undefined
      ? new Map(Object.entries(planCtx.sigmaColsOverride))
      : nominalPlan !== undefined && Object.keys(nominalPlan.sigmaCols).length > 0
        ? new Map(Object.entries(nominalPlan.sigmaCols))
        : undefined;
  const sigmaBandsMap: ReadonlyMap<string, number> | undefined =
    planCtx?.sigmaBandsOverride !== undefined
      ? new Map(Object.entries(planCtx.sigmaBandsOverride))
      : nominalPlan !== undefined && Object.keys(nominalPlan.sigmaBands).length > 0
        ? new Map(Object.entries(nominalPlan.sigmaBands))
        : undefined;

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
    const composedGrids = new Map<string, GridLayoutResult>();
    const composedStacks = new Map<string, StackLayoutResult>();
    const composedUnplaced = new Map<string, readonly EntityRef[]>();
    const orientationRecord = new Map<string, LevelOrientation>();
    const chosen = new Map<string, FrozenRun>();
    const capturedAutoPack = new Map<string, FrozenAutoPackLevel>();
    const memoStoreQueue = new Map<EntityRef, string>();
    const headers = new Map<EntityRef, HeaderMeasurement>();
    const headerInputs = new Map<EntityRef, EntityMeasurementInput>();
    const headerWidths = new Map<EntityRef, number>();
    const widenForScope = (scopeKey: string): ReadonlyMap<string, number> | undefined => {
      if (nominalPlan !== undefined) {
        return scopeKey === ROOT_LEVEL_KEY ? plan?.widen : innerWidenMap;
      }
      return plan?.widen;
    };
    const visibleDescendantsOf = (rootEntity: EntityRef): EntityRef[] => {
      const result: EntityRef[] = [];
      const visit = (parent: EntityRef): void => {
        for (const child of orderedChildrenOf(parent)) {
          result.push(child);
          if (kinds.get(child) === "container-expanded" || kinds.get(child) === "legend-expanded") {
            visit(child);
          }
        }
      };
      visit(rootEntity);
      return result;
    };
    const descendantFoldKey = (rootEntity: EntityRef): string => {
      const folded: string[] = [];
      for (const desc of visibleDescendantsOf(rootEntity)) {
        if (isCollapsed(desc)) folded.push(desc);
      }
      folded.sort(byString);
      return folded.join(",");
    };
    const memoKeyFor = (entity: EntityRef, inheritedKey?: string): string =>
      `${nominalPlan!.planDigest}|${entity}|${descendantFoldKey(entity)}|${inheritedKey ?? ""}`;
    const restoreMemoEntry = (entry: SubtreeMemoEntry): void => {
      for (const snap of entry.descendants) {
        outerWidths.set(snap.entity, snap.outerWidth);
        packedSizes.set(snap.entity, { width: snap.packedSize.width, height: snap.packedSize.height });
        if (snap.header !== undefined) headers.set(snap.entity, snap.header);
        if (snap.headerInput !== undefined) headerInputs.set(snap.entity, snap.headerInput);
        if (snap.headerWidth !== undefined) headerWidths.set(snap.entity, snap.headerWidth);
        if (snap.composedGrid !== undefined) composedGrids.set(snap.runKey, snap.composedGrid);
        if (snap.composedStack !== undefined) composedStacks.set(snap.runKey, snap.composedStack);
        if (snap.composedUnplaced !== undefined) composedUnplaced.set(snap.runKey, snap.composedUnplaced);
        if (snap.packedRun !== undefined) packedRuns.set(snap.runKey, snap.packedRun as PackedRun);
        if (snap.levelRun !== undefined) levelRuns.set(snap.entity, snap.levelRun as Run);
        if (snap.chosen !== undefined) chosen.set(snap.runKey, snap.chosen);
        if (snap.orientation !== undefined) orientationRecord.set(snap.runKey, snap.orientation);
      }
    };
    const snapshotSubtree = (rootEntity: EntityRef): SubtreeMemoEntry => {
      const nodes = [rootEntity, ...visibleDescendantsOf(rootEntity)];
      const descendants: SubtreeNodeSnapshot[] = nodes.map((entity) => {
        const runKey = levelKeyOf(entity);
        const header = headers.get(entity);
        const headerInput = headerInputs.get(entity);
        const headerWidth = headerWidths.get(entity);
        const composedGrid = composedGrids.get(runKey);
        const composedStack = composedStacks.get(runKey);
        const unplacedList = composedUnplaced.get(runKey);
        const packedRun = packedRuns.get(runKey);
        const levelRun = levelRuns.get(entity);
        const chosenRun = chosen.get(runKey);
        const orient = orientationRecord.get(runKey);
        const packedSize = packedSizes.get(entity) ?? { width: 0, height: 0 };
        return {
          entity,
          runKey,
          outerWidth: outerWidths.get(entity) ?? packedSize.width,
          packedSize: { width: packedSize.width, height: packedSize.height },
          ...(header === undefined ? {} : { header }),
          ...(headerInput === undefined ? {} : { headerInput }),
          ...(headerWidth === undefined ? {} : { headerWidth }),
          ...(composedGrid === undefined ? {} : { composedGrid }),
          ...(composedStack === undefined ? {} : { composedStack }),
          ...(unplacedList === undefined ? {} : { composedUnplaced: unplacedList }),
          ...(packedRun === undefined ? {} : { packedRun }),
          ...(levelRun === undefined ? {} : { levelRun }),
          ...(chosenRun === undefined ? {} : { chosen: chosenRun }),
          ...(orient === undefined ? {} : { orientation: orient }),
        };
      });
      const rootSize = packedSizes.get(rootEntity)!;
      return {
        naturalSize: { width: rootSize.width, height: rootSize.height },
        descendants,
      };
    };
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
      const hasSiblingZones = zoneRule && run.items.filter(itemHasZone).length > 1;
      const baseX = hasSiblingZones ? zoneGutter : zone ? rowGaps.zoneX : rowGaps.cardX;
      const baseY = hasSiblingZones ? zoneGutter : zone ? rowGaps.zoneY : rowGaps.cardY;
      const packOptions = {
        targetAspect: planCtx?.mode === "nominal-plan" && planCtx.tauOverride !== undefined ? planCtx.tauOverride : rowPack.targetAspect,
        gapX: baseX,
        gapY: baseY,
        chromeWidth,
        chromeHeight,
        tallBias: rowPack.tallBias,
        emptyPenaltyWeight: rowPack.emptyPenaltyWeight,
      };
      const plannedLevel = nominalPlan?.autoPackLevels[run.key];
      const frozen = plan?.frozen.get(run.key);
      let orientation: LevelOrientation;
      let shelves: readonly (readonly number[])[];
      const forcedOrientation = run.mode === "auto" ? orientationOverrides?.get(run.key) : undefined;
      if (plannedLevel !== undefined) {
        // H2 F-1 / F-2: seat visible children on the nominal plan's frozen shelves
        // (membership by child EntityRef, never re-wrapped, never flipped).
        const indexByEntity = new Map<EntityRef, number>();
        run.items.forEach((item, idx) => {
          if ("entity" in item) indexByEntity.set(item.entity, idx);
        });
        const placedSlots = new Set<number>();
        const mapped: number[][] = [];
        for (const plannedShelf of plannedLevel.shelves) {
          const indices: number[] = [];
          for (const entity of plannedShelf) {
            const idx = indexByEntity.get(entity);
            if (idx !== undefined) {
              indices.push(idx);
              placedSlots.add(idx);
            }
          }
          if (indices.length > 0) mapped.push(indices);
        }
        const remaining: number[] = [];
        run.items.forEach((_, idx) => {
          if (!placedSlots.has(idx)) remaining.push(idx);
        });
        if (remaining.length > 0) mapped.push(remaining);
        orientation = plannedLevel.orientation;
        shelves = mapped;
      } else if (forcedOrientation !== undefined) {
        orientation = forcedOrientation;
        shelves = (forcedOrientation === "rows" ? packRows : packColumns)(boxes, packOptions).rows;
      } else if (frozen !== undefined && frozen.shelves.reduce((count, shelf) => count + shelf.length, 0) === boxes.length) {
        orientation = frozen.orientation;
        shelves = frozen.shelves;
      } else if (run.mode === "auto") {
        const previousForChoice = planCtx?.mode === "nominal-plan" ? undefined : options.previousOrientation?.[run.key];
        const choice = chooseOrientation(boxes, packOptions, rowPack.orientationHysteresis, previousForChoice);
        orientation = choice.orientation;
        shelves = choice.result.rows;
      } else {
        orientation = run.mode;
        shelves = (run.mode === "rows" ? packRows : packColumns)(boxes, packOptions).rows;
      }
      // A column shelf containing one box per column paints the same single
      // row. Canonicalize that equivalent arrangement before feeding fold
      // hysteresis back; otherwise the metadata can alternate without a move.
      if (plannedLevel === undefined && run.mode === "auto" && orientation === "columns" && shelves.every(shelf => shelf.length === 1)) {
        orientation = "rows";
        shelves = [shelves.flat()];
      }
      chosen.set(run.key, { orientation, shelves });
      if (planCtx?.mode === "nominal-plan" && plan === undefined && run.key !== ROOT_LEVEL_KEY) {
        const entityShelves = shelves
          .map((shelf) =>
            shelf
              .map((slot) => {
                const item = run.items[slot];
                return item !== undefined && "entity" in item ? item.entity : undefined;
              })
              .filter((e): e is EntityRef => e !== undefined),
          )
          .filter((shelf) => shelf.length > 0);
        capturedAutoPack.set(run.key, { orientation, shelves: entityShelves });
      }
      if (run.mode === "auto" && boxes.length > 0) orientationRecord.set(run.key, orientation);
      const rows = orientation === "rows";
      const alongBase = rows ? baseX : baseY;
      const acrossBase = rows ? baseY : baseX;
      const cardAlongBase = rows ? rowGaps.cardX : rowGaps.cardY;
      const cardAcrossBase = rows ? rowGaps.cardY : rowGaps.cardX;
      const zoneAlongBase = rows ? rowGaps.zoneX : rowGaps.zoneY;
      const zoneAcrossBase = rows ? rowGaps.zoneY : rowGaps.zoneX;
      const activeWiden = widenForScope(run.key);
      // §3.5: a gutter keeps its base gap (or the authored `gapAfter` of the
      // group before it) unless the plan widens it for a label. One along gap
      // per slot index on every shelf: the grid keeps its column starts.
      // REQ-R7-14: only gutters between two zones use the fixed zone token.
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
          if (zoneRule) {
            const leftZone = itemHasZone(run.items[leftSlot]!);
            const rightZone = itemHasZone(run.items[rightSlot]!);
            if (leftZone && rightZone) return zoneGutter;
            return Math.max(
              gapAfterOf(leftSlot) ?? (leftZone || rightZone ? zoneAlongBase : cardAlongBase),
              activeWiden?.get(`${run.key}|along|${String(slot)}`) ?? 0,
              activeWiden?.get(`${run.key}|along|${String(slot)}|${String(shelf)}`) ?? 0,
            );
          }
          return Math.max(
            gapAfterOf(leftSlot) ?? alongBase,
            activeWiden?.get(`${run.key}|along|${String(slot)}`) ?? 0,
            activeWiden?.get(`${run.key}|along|${String(slot)}|${String(shelf)}`) ?? 0,
          );
        },
        (shelf) => {
          const last = shelves[shelf]![shelves[shelf]!.length - 1]!;
          if (zoneRule) {
            const nextShelf = shelves[shelf + 1]!;
            const currentZone = shelfHasZone(run, shelves[shelf]!);
            const nextZone = shelfHasZone(run, nextShelf);
            if (currentZone && nextZone) return zoneGutter;
            const base = currentZone || nextZone ? zoneAcrossBase : cardAcrossBase;
            return Math.max(gapAfterOf(last) ?? base, activeWiden?.get(`${run.key}|across|${String(shelf)}`) ?? 0);
          }
          return Math.max(gapAfterOf(last) ?? acrossBase, activeWiden?.get(`${run.key}|across|${String(shelf)}`) ?? 0);
        },
      );
      packedRuns.set(run.key, { run, rows, shelves, boxes, positions: seated.positions, alongBase, acrossBase });
      return { width: seated.width, height: seated.height };
    };
    const legendKeyCardWidth = (id: EntityRef): number => {
      const parent = graph.nodes.get(id)?.parent;
      return parent !== undefined ? cardWidthOf(representativeOf(parent)) : cardWidthOf(representativeOf(id));
    };
    const entityIsContainer = (entity: EntityRef): boolean => kinds.get(entity) !== "leaf";
    const headerFloorOf = (entity: EntityRef): number => {
      const zg = anatomyZoneGeometry(occurrenceAnatomy(representativeOf(entity)));
      const icon = presentation.entities[representativeOf(entity)]?.icon !== "none";
      const reserve = zg.headerTextInset - (icon ? 0 : zg.iconSize + zg.iconTextGap);
      return Math.max(zg.collapsedWidth, unwrappedHeaderWidth(entity) + reserve);
    };
    const isExpandedInheritingGrid = (entity: EntityRef): boolean =>
      isStretchedBox(entity) && composition?.grids[entity]?.stage_columns === "inherit";
    const solveStagedGridWithInherit = (
      gridScope: string,
      gridRunKey: string,
      hostGrid: import("@sentropic/diagram-core").LayoutGrid,
      visibleList: readonly EntityRef[],
      freeCellItem?: FreeCellItemSpec,
    ): GridLayoutResult => {
      const hostWiden = widenForScope(gridRunKey);
      const isRootGrid = gridScope === "root";
      if (!Array.isArray(hostGrid.stage_columns)) {
        return layoutGridScope({
          scope: gridScope,
          runKey: gridRunKey,
          grid: hostGrid,
          visibleChildren: visibleList,
          sizeOf: sizeBox,
          isContainer: entityIsContainer,
          isExpandedContainer: isStretchedBox,
          rowGaps,
          zoneGutter,
          widen: hostWiden,
          ...(isRootGrid && sigmaColsMap !== undefined ? { sigmaCols: sigmaColsMap } : {}),
          ...(isRootGrid && sigmaBandsMap !== undefined ? { sigmaBands: sigmaBandsMap } : {}),
          ...(freeCellItem === undefined ? {} : { freeCellItem }),
        });
      }
      const hostStageCols = hostGrid.stage_columns;
      const inheritedNodeMeta = new Map<EntityRef, {
        readonly grid: import("@sentropic/diagram-core").LayoutGrid;
        readonly firstDecl: number;
        readonly lastDecl: number;
        readonly containerSlotInset: number;
        readonly childInheritors: EntityRef[];
      }>();
      const inheritedContributions: InheritedWidthContribution[] = [];
      let contribOrder = 0;

      const collectInheritor = (
        containerId: EntityRef,
        firstDecl: number,
        lastDecl: number,
        containerSlotInset: number,
      ): void => {
        const childGrid = composition!.grids[containerId]!;
        const children = orderedChildrenOf(containerId);
        const childVisible = new Set<EntityRef>(children);
        const childInheritors: EntityRef[] = [];
        const meta = { grid: childGrid, firstDecl, lastDecl, containerSlotInset, childInheritors };
        inheritedNodeMeta.set(containerId, meta);

        // Reserve header-driven floor width across this container's span.
        inheritedContributions.push({
          colStartDecl: firstDecl,
          colEndDecl: lastDecl,
          neededWidth: headerFloorOf(containerId) + 2 * containerSlotInset,
          declOrder: contribOrder++,
        });

        const declared = new Set<EntityRef>();
        for (const band of childGrid.transverse_bands) {
          for (const item of band.items) {
            declared.add(item);
            if (!childVisible.has(item)) continue;
            const cell = childGrid.cells?.[item];
            if (cell?.column === undefined) continue;
            const cFirst = hostStageCols.indexOf(cell.column);
            const cLast = cell.to_column === undefined ? cFirst : hostStageCols.indexOf(cell.to_column);
            if (cFirst < firstDecl || cLast > lastDecl || cLast < cFirst) continue;
            const touchesEdge = cFirst === firstDecl || cLast === lastDecl;
            const slotInset = touchesEdge ? containerSlotInset + contentInset : 0;
            if (isExpandedInheritingGrid(item)) {
              childInheritors.push(item);
              collectInheritor(item, cFirst, cLast, slotInset);
            } else {
              const sz = sizeBox(item);
              inheritedContributions.push({
                colStartDecl: cFirst,
                colEndDecl: cLast,
                neededWidth: sz.width + 2 * slotInset,
                declOrder: contribOrder++,
              });
            }
          }
        }
        // Account for any unplaced trailing children inside an inheriting container.
        const unplacedInner = children.filter((child) => !declared.has(child));
        if (unplacedInner.length > 0) {
          let trailingW = 0;
          unplacedInner.forEach((child, idx) => {
            const sz = sizeBox(child);
            trailingW += sz.width;
            if (idx + 1 < unplacedInner.length) {
              const z = entityIsContainer(child) || entityIsContainer(unplacedInner[idx + 1]!);
              trailingW += z ? zoneGutter : rowGaps.cardX;
            }
          });
          inheritedContributions.push({
            colStartDecl: firstDecl,
            colEndDecl: lastDecl,
            neededWidth: trailingW + 2 * contentInset + 2 * containerSlotInset,
            declOrder: contribOrder++,
          });
        }
      };

      const hostVisible = new Set<EntityRef>(visibleList);
      const topInheritors: EntityRef[] = [];
      for (const band of hostGrid.transverse_bands) {
        for (const item of band.items) {
          if (!hostVisible.has(item) || !isExpandedInheritingGrid(item)) continue;
          const cell = hostGrid.cells?.[item];
          if (cell?.column === undefined) continue;
          const cFirst = hostStageCols.indexOf(cell.column);
          const cLast = cell.to_column === undefined ? cFirst : hostStageCols.indexOf(cell.to_column);
          if (cFirst < 0 || cLast < cFirst) continue;
          topInheritors.push(item);
          collectInheritor(item, cFirst, cLast, 0);
        }
      }

      const sizeForHost = (entity: EntityRef): { width: number; height: number } => {
        if (inheritedNodeMeta.has(entity)) {
          // Final width and height are computed in onStageColumnsResolved once shared columns are sized.
          return { width: headerFloorOf(entity), height: 0 };
        }
        return sizeBox(entity);
      };

      return layoutGridScope({
        scope: gridScope,
        runKey: gridRunKey,
        grid: hostGrid,
        visibleChildren: visibleList,
        sizeOf: sizeForHost,
        isContainer: entityIsContainer,
        isExpandedContainer: isStretchedBox,
        rowGaps,
        zoneGutter,
        widen: hostWiden,
        ...(isRootGrid && sigmaColsMap !== undefined ? { sigmaCols: sigmaColsMap } : {}),
        ...(isRootGrid && sigmaBandsMap !== undefined ? { sigmaBands: sigmaBandsMap } : {}),
        ...(freeCellItem === undefined ? {} : { freeCellItem }),
        inheritedContributions,
        onStageColumnsResolved: topInheritors.length === 0 ? undefined : (resolvedCols) => {
          const updatedSizes = new Map<EntityRef, { readonly width: number; readonly height: number }>();
          const realizeInheritor = (containerId: EntityRef): { width: number; height: number } => {
            const meta = inheritedNodeMeta.get(containerId)!;
            const firstActive = resolvedCols.declColToActive.get(meta.firstDecl)!;
            const lastActive = resolvedCols.declColToActive.get(meta.lastDecl)!;
            const inheritedSpanKey = `${resolvedCols.colIds.slice(firstActive, lastActive + 1).join(",")};${resolvedCols.colWidths.slice(firstActive, lastActive + 1).join(",")};${resolvedCols.colGaps.slice(firstActive, lastActive).join(",")};${String(meta.containerSlotInset)}`;
            if (subtreeMemo !== undefined && nominalPlan !== undefined) {
              const key = memoKeyFor(containerId, inheritedSpanKey);
              const hit = subtreeMemo.get(key);
              if (hit !== undefined) {
                restoreMemoEntry(hit);
                updatedSizes.set(containerId, hit.naturalSize);
                return hit.naturalSize;
              }
              memoStoreQueue.set(containerId, key);
            }
            for (const child of meta.childInheritors) realizeInheritor(child);
            const containerRunKey = levelKeyOf(containerId);
            const gridLayout = layoutInheritedGridScope({
              scope: containerId,
              runKey: containerRunKey,
              grid: meta.grid,
              visibleChildren: orderedChildrenOf(containerId),
              inherited: {
                colIds: resolvedCols.colIds,
                colStarts: resolvedCols.colStarts,
                colWidths: resolvedCols.colWidths,
                colGaps: resolvedCols.colGaps,
                firstColIdx: firstActive,
                lastColIdx: lastActive,
                containerSlotInset: meta.containerSlotInset,
                contentInset,
              },
              sizeOf: (child) => packedSizes.get(child) ?? sizeBox(child),
              isContainer: entityIsContainer,
              isExpandedContainer: isStretchedBox,
              rowGaps,
              zoneGutter,
              widen: widenForScope(containerRunKey),
            });
            composedGrids.set(containerRunKey, gridLayout);
            if (gridLayout.unplaced.length > 0) composedUnplaced.set(containerRunKey, gridLayout.unplaced);
            const spanWidth =
              resolvedCols.colStarts[lastActive]! +
              resolvedCols.colWidths[lastActive]! -
              resolvedCols.colStarts[firstActive]! -
              2 * meta.containerSlotInset;
            const zg = anatomyZoneGeometry(occurrenceAnatomy(representativeOf(containerId)));
            const outer = Math.max(headerFloorOf(containerId), spanWidth);
            const hdrH = headerHeightOf(containerId, outer);
            outerWidths.set(containerId, outer);
            const size = {
              width: outer,
              height: zg.headerInset + hdrH + contentInset + gridLayout.height + contentInset
                + sceneBoxAt(representativeOf(containerId), outer, false).footerReserve,
            };
            packedSizes.set(containerId, size);
            updatedSizes.set(containerId, size);
            return size;
          };
          for (const top of topInheritors) realizeInheritor(top);
          return updatedSizes;
        },
      });
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
      if (
        subtreeMemo !== undefined &&
        nominalPlan !== undefined &&
        kind === "container-expanded" &&
        composition?.grids[id]?.stage_columns !== "inherit"
      ) {
        const key = memoKeyFor(id);
        const hit = subtreeMemo.get(key);
        if (hit !== undefined) {
          restoreMemoEntry(hit);
          return hit.naturalSize;
        }
        memoStoreQueue.set(id, key);
      }
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
      const composedGrid = composition?.grids[id];
      const composedStack = composition?.stacks[id];
      const runKey = levelKeyOf(id);
      if (composedStack !== undefined) {
        const stackLayout = layoutStackScope({
          scope: id,
          runKey,
          stack: composedStack,
          visibleChildren: ordered,
          sizeOf: sizeBox,
          isContainer: entityIsContainer,
          isExpandedContainer: isStretchedBox,
          rowGaps,
          zoneGutter,
          widen: widenForScope(runKey),
        });
        composedStacks.set(runKey, stackLayout);
        const outer = Math.max(floor, stackLayout.width + (ordered.length > 0 ? 2 * contentInset : 0));
        outerWidths.set(id, outer);
        const size = {
          width: outer,
          height: zoneGeo.headerInset + headerHeight + contentInset + stackLayout.height + contentInset
            + sceneBoxAt(representativeOf(id), outer, false).footerReserve,
        };
        packedSizes.set(id, size);
        return size;
      }
      if (composedGrid !== undefined && composedGrid.stage_columns !== "inherit") {
        const gridLayout = solveStagedGridWithInherit(id, runKey, composedGrid, ordered);
        composedGrids.set(runKey, gridLayout);
        if (gridLayout.unplaced.length > 0) composedUnplaced.set(runKey, gridLayout.unplaced);
        const outer = Math.max(floor, gridLayout.width + (ordered.length > 0 ? 2 * contentInset : 0));
        outerWidths.set(id, outer);
        const size = {
          width: outer,
          height: zoneGeo.headerInset + headerHeight + contentInset + gridLayout.height + contentInset
            + sceneBoxAt(representativeOf(id), outer, false).footerReserve,
        };
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
      composedGrids.clear();
      composedStacks.clear();
      composedUnplaced.clear();
      orientationRecord.clear();
      chosen.clear();
      capturedAutoPack.clear();
      memoStoreQueue.clear();
      if (composition?.grids.root !== undefined) {
        const rootGrid = solveStagedGridWithInherit("root", ROOT_LEVEL_KEY, composition.grids.root, rootOrder, rootFreeCellItem);
        composedGrids.set(ROOT_LEVEL_KEY, rootGrid);
        if (rootGrid.unplaced.length > 0) composedUnplaced.set(ROOT_LEVEL_KEY, rootGrid.unplaced);
        rootRun = { key: ROOT_LEVEL_KEY, mode: "auto", items: [], stretch: false };
        return;
      }
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
    if (planCtx?.sizingOnly === true && planCtx.capture !== undefined) {
      const rootGridLayout = composedGrids.get(ROOT_LEVEL_KEY);
      const legendSize =
        stateMeasuredLegend === undefined
          ? undefined
          : { width: stateMeasuredLegend.width, height: stateMeasuredLegend.height };
      planCtx.capture.sizingReport = {
        rootWidth: rootGridLayout?.width ?? 0,
        rootHeight: rootGridLayout?.height ?? 0,
        xTrackIds: (rootGridLayout?.columns ?? []).filter((c) => c.kind === "stage").map((c) => c.id),
        yTrackIds: (rootGridLayout?.bands ?? []).filter((b) => b.kind === "band").map((b) => b.id),
        capX: rowGaps.maxX,
        capY: rowGaps.maxY,
        ...(legendSize === undefined ? {} : { legendSize }),
        effectiveLegendAnchor,
        legendInsideCell: rootGridLayout?.freeCellRect !== undefined,
      };
      return {
        result: {
          status: "laid-out",
          view: projected,
          fit: { direction: "top-to-bottom", width: 0, height: 0, zoom: 1, pans: false, phone: false },
          warnings: [],
        },
        chosen,
        requested: new Map(),
        unused: [],
        unplaced: 0,
      };
    }
    if (planCtx?.mode === "nominal-plan" && plan === undefined && planCtx.capture !== undefined) {
      for (const [runKey, level] of capturedAutoPack) {
        planCtx.capture.autoPackLevels[runKey] = level;
      }
    }
    if (subtreeMemo !== undefined && nominalPlan !== undefined && memoStoreQueue.size > 0) {
      for (const [entityId, memoKey] of memoStoreQueue) {
        if (packedSizes.has(entityId)) {
          subtreeMemo.set(memoKey, snapshotSubtree(entityId));
        }
      }
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

    for (const [scopeKey, missing] of [...composedUnplaced].sort(([left], [right]) => byString(left, right))) {
      warnings.push({
        severity: "info",
        code: "composition-unplaced",
        refs: missing.map((entity) => representativeOf(entity)),
        message: `${String(missing.length)} visible item(s) omitted from grid ${scopeKey} were placed in a trailing band`,
        details: { scope: scopeKey, count: missing.length },
      });
    }
    // Seating: every run at its packed positions. The root is one more run
    // with zero chrome and the same token gaps — never `rankGap` (§3.5).
    const rects = new Map<EntityRef, Rect>();
    const titleBands = new Map<EntityRef, Rect>();
    const footerBands = new Map<EntityRef, Rect>();
    const legendInner = new Map<EntityRef, number>();
    const seatedBoxes = new Map<string, Rect[]>();
    const composedEmittedGutters: ComposedGutter[] = [];
    const composedGridReports: Record<string, ComposedGridReport> = {};
    const seatComposedGrid = (gridLayout: GridLayoutResult, originX: number, originY: number): void => {
      for (const placement of gridLayout.placements) {
        const forced = placement.stretchX || placement.stretchY
          ? { width: placement.width, height: placement.height }
          : undefined;
        seatBox(placement.entity, originX + placement.relX, originY + placement.relY, forced);
      }
      composedEmittedGutters.push(...gridLayout.emitGutters(originX, originY));
      composedGridReports[gridLayout.scope] = gridLayout.toReport(originX, originY);
    };
    const seatComposedStack = (stackLayout: StackLayoutResult, originX: number, originY: number): void => {
      for (const placement of stackLayout.placements) {
        const forced = placement.stretchX || placement.stretchY
          ? { width: placement.width, height: placement.height }
          : undefined;
        seatBox(placement.entity, originX + placement.relX, originY + placement.relY, forced);
      }
      composedEmittedGutters.push(...stackLayout.emitGutters(originX, originY));
    };
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
    const seatBox = (id: EntityRef, x: number, y: number, forcedSize?: { readonly width: number; readonly height: number }): void => {
      const kind = kinds.get(id)!;
      if (kind === "leaf" || kind === "container-collapsed" || kind === "legend-collapsed") {
        rects.set(id, { x, y, ...packedSizes.get(id)! });
        return;
      }
      if (kind === "legend-key") {
        rects.set(id, { x, y, width: innerWidthOf(legendKeyCardWidth(id)), height: LEGEND_KEY_HEIGHT });
        return;
      }
      const natural = packedSizes.get(id)!;
      const size = forcedSize === undefined
        ? natural
        : { width: Math.max(natural.width, forcedSize.width), height: Math.max(natural.height, forcedSize.height) };
      const header = headers.get(id)!;
      const zoneGeo = anatomyZoneGeometry(occurrenceAnatomy(representativeOf(id)));
      const inner = innerWidthOf(size.width);
      rects.set(id, { x, y, width: size.width, height: size.height });
      const ruleClearance = (zoneGeo.ruleHeight / 2 + 1) / LABEL_CLEARANCE_REFERENCE_SCALE;
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
      const runKey = levelKeyOf(id);
      const gridLayout = composedGrids.get(runKey);
      if (gridLayout !== undefined) {
        seatComposedGrid(gridLayout, contentX, contentY);
        return;
      }
      const stackLayout = composedStacks.get(runKey);
      if (stackLayout !== undefined) {
        seatComposedStack(stackLayout, contentX, contentY);
        return;
      }
      const run = levelRuns.get(id);
      if (run !== undefined) seatRun(run, contentX, contentY);
    };
    const rootGridLayout = composedGrids.get(ROOT_LEVEL_KEY);
    if (rootGridLayout !== undefined) seatComposedGrid(rootGridLayout, 0, 0);
    else seatRun(rootRun, 0, 0);

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
    // paint plus one CSS px at the fixed reference scale for label placement.
    // Routes may cross a rule while leaving their own zone.
    const ruleClearance = (ZONE_GEOMETRY.ruleHeight / 2 + 1) / LABEL_CLEARANCE_REFERENCE_SCALE;
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

    // Build shelf gutters helper (shared by comb trunk lookup and downstream channel audit).
    const collectShelfGutters = (): ComposedGutter[] => {
      const out: ComposedGutter[] = [];
      for (const [key, packed] of [...packedRuns].sort(([left], [right]) => byString(left, right))) {
        const boxes = seatedBoxes.get(key);
        if (boxes === undefined || boxes.length < 2) continue;
        const rows = packed.rows;
        const zone = runHasZone(packed.run);
        const cardAlongBase = rows ? rowGaps.cardX : rowGaps.cardY;
        const cardAcrossBase = rows ? rowGaps.cardY : rowGaps.cardX;
        const zoneAlongBase = rows ? rowGaps.zoneX : rowGaps.zoneY;
        const zoneAcrossBase = rows ? rowGaps.zoneY : rowGaps.zoneX;
        const gapAfter = (slot: number) => { const item = packed.run.items[slot]!; return "run" in item ? item.gapAfter : undefined; };
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
        const alongStrips = new Map<number, { readonly shelf: number; readonly slot: number; readonly strip: Rect; readonly zone: boolean; readonly bordersZone: boolean }[]>();
        packed.shelves.forEach((shelf, shelfIndex) => {
          const start = acrossOf(boxes[shelf[0]!]!)[0];
          const end = Math.max(...shelf.map((slot) => acrossOf(boxes[slot]!)[1]));
          const next = packed.shelves[shelfIndex + 1];
          if (next !== undefined) {
            const nextStart = acrossOf(boxes[next[0]!]!)[0];
            const currentZone = shelfHasZone(packed.run, shelf);
            const nextZone = shelfHasZone(packed.run, next);
            const acrossZone = zoneRule ? currentZone && nextZone : zone;
            const bordersZone = currentZone || nextZone;
            const base = zoneRule
              ? (acrossZone ? zoneGutter : (gapAfter(shelf.at(-1)!) ?? (bordersZone ? zoneAcrossBase : cardAcrossBase)))
              : (gapAfter(shelf.at(-1)!) ?? packed.acrossBase);
            out.push({
              id: `${key}|across|${String(shelfIndex)}`,
              horizontal: rows,
              strips: [stripOf(extent, [end, nextStart])],
              gap: nextStart - end,
              base,
              authoredBase: false,
              max: rows ? rowGaps.maxY : rowGaps.maxX,
              zone: acrossZone,
            });
          }
          shelf.forEach((slot, index) => {
            const following = shelf[index + 1];
            if (following === undefined) return;
            const strip = stripOf([alongOf(boxes[slot]!)[1], alongOf(boxes[following]!)[0]], [start, end]);
            const leftZone = itemHasZone(packed.run.items[slot]!);
            const rightZone = itemHasZone(packed.run.items[following]!);
            const pairZone = zoneRule ? leftZone && rightZone : zone;
            (alongStrips.get(index) ?? alongStrips.set(index, []).get(index)!).push({
              shelf: shelfIndex, slot, strip, zone: pairZone, bordersZone: zoneRule ? leftZone || rightZone : zone,
            });
          });
        });
        for (const [index, strips] of [...alongStrips].sort(([left], [right]) => left - right)) {
          const thickness = (strip: Rect): number => (rows ? strip.width : strip.height);
          const startOf = (strip: Rect): number => (rows ? strip.x : strip.y);
          const lane = strips.every(({ strip, zone: stripZone, bordersZone }) =>
            Math.abs(startOf(strip) - startOf(strips[0]!.strip)) <= LANE_TOLERANCE &&
            stripZone === strips[0]!.zone && bordersZone === strips[0]!.bordersZone,
          );
          const max = rows ? rowGaps.maxX : rowGaps.maxY;
          const baseFor = (slot: number, stripZone: boolean, bordersZone: boolean): number =>
            zoneRule
              ? (stripZone ? zoneGutter : (gapAfter(slot) ?? (bordersZone ? zoneAlongBase : cardAlongBase)))
              : (gapAfter(slot) ?? packed.alongBase);
          if (lane) {
            out.push({
              id: `${key}|along|${String(index)}`,
              horizontal: !rows,
              strips: strips.map(({ strip }) => strip),
              gap: Math.max(...strips.map(({ strip }) => thickness(strip))),
              base: Math.max(...strips.map(({ slot, zone: stripZone, bordersZone }) => baseFor(slot, stripZone, bordersZone))),
              authoredBase: false,
              max,
              zone: strips[0]!.zone,
            });
          } else {
            for (const { shelf, slot, strip, zone: stripZone, bordersZone } of strips) {
              out.push({
                id: `${key}|along|${String(index)}|${String(shelf)}`,
                horizontal: !rows,
                strips: [strip],
                gap: thickness(strip),
                base: baseFor(slot, stripZone, bordersZone),
                authoredBase: false,
                max,
                zone: stripZone,
              });
            }
          }
        }
      }
      return out;
    };

    // H2.7: fan-in / fan-out comb grouping and trunk reservation BEFORE plain docking & routing (§4.6).
    const freeCellLegendRect = rootGridLayout?.freeCellRect;
    const sortedBarrierEntriesEarly = [...titleBands].sort(([left], [right]) => byString(left, right));
    const earlyAuditBarriers: { readonly entity?: string; readonly rect: Rect }[] = [
      ...sortedBarrierEntriesEarly.map(([entity, rect]) => ({ entity: String(entity), rect })),
      ...(freeCellLegendRect === undefined ? [] : [{ rect: freeCellLegendRect }]),
    ];
    let combPlan: SolvedCombPlan | undefined;
    if (composition !== undefined && (composition.fanIn === "comb" || composition.fanOut === "comb")) {
      const combCandidates: CombEdgeCandidate[] = [];
      for (const edge of drawnEdges) {
        if (edge.source.entity === edge.target.entity) continue;
        if (isAncestor(filteredGraph, edge.source.entity, edge.target.entity) || isAncestor(filteredGraph, edge.target.entity, edge.source.entity)) continue;
        const occurrence = projected.relationOccurrences[edge.occurrence];
        if (occurrence === undefined) continue;
        const semantic = document.relations[occurrence.relation];
        if (semantic?.profile === "erd@1" || semantic?.type === "flow-step") continue;
        const relStyle = relationPresentationFor(presentation.relations, occurrence.id, occurrence.relation);
        const resolvedStroke = resolveDashPattern(occurrence.strokeStyle ?? relStyle?.strokeStyle)?.style ?? "solid";
        const resolvedArrow = resolveArrowhead(occurrence.arrowhead ?? relStyle?.arrowhead)?.canonicalKind ?? "arrow";
        const resolvedEmphasis = resolveLinkEmphasis(occurrence.emphasis ?? relStyle?.emphasis)?.emphasis ?? "default";
        const styleKey = linkStyleKey({ strokeStyle: resolvedStroke, arrowhead: resolvedArrow, emphasis: resolvedEmphasis });
        const sourceRole = occurrence.endpoints.find((ep) => ep.role === "source");
        const targetRole = occurrence.endpoints.find((ep) => ep.role === "target");
        const passable = new Set<EntityRef>([
          ...(sourceRole === undefined ? [] : projectedAncestorsOf(sourceRole.occurrence)),
          ...(targetRole === undefined ? [] : projectedAncestorsOf(targetRole.occurrence)),
        ]);
        const occRelRef = edge.occurrence as unknown as RelationRef;
        const within = withinOf.get(occRelRef);
        const effLabel = edgeBundles[edge.occurrence]?.label ?? edgeLabelOf(document, edge.relation);
        combCandidates.push({
          occurrence: edge.occurrence,
          relation: edge.relation,
          source: edge.source,
          target: edge.target,
          styleKey,
          arrowhead: resolvedArrow,
          ...(effLabel === undefined ? {} : { label: effLabel }),
          passable,
          ...(within === undefined ? {} : { within }),
        });
      }
      combPlan = solveCombs({
        candidates: combCandidates,
        fanIn: composition.fanIn,
        fanOut: composition.fanOut,
        r7Routing,
        rects,
        placementParentOf,
        gridReports: composedGridReports,
        gutters: [...composedEmittedGutters, ...collectShelfGutters()],
        barriers: earlyAuditBarriers,
        isNorthBlockedByTitle,
        routeSpacing,
        borderClearance,
        cornerInset: dockCornerInset,
      });
      for (const fb of combPlan.fallbacks) {
        warnings.push({
          severity: "info",
          code: "comb-fallback",
          refs: fb.members,
          message: `comb group at ${fb.hub} routed separately (${fb.reason})`,
          details: { hub: fb.hub, members: fb.members, reason: fb.reason },
        });
      }
    }
    const combMemberSet = combPlan === undefined ? undefined : combPlan.memberCombId;
    const plainEdges =
      combMemberSet === undefined || combMemberSet.size === 0
        ? drawnEdges
        : drawnEdges.filter((edge) => !combMemberSet.has(String(edge.occurrence)));
    const routingGraph: LayoutGraph =
      combMemberSet === undefined || combMemberSet.size === 0
        ? filteredGraph
        : {
            ...filteredGraph,
            edges: filteredGraph.edges.filter((edge) => !combMemberSet.has(String(edge.id))),
          };

    // Dock and route against fixed boxes (§4.6.4/§4.6.5). Slots keep the
    // declared spacing: a label sits in a lane, not at its dock, so a side
    // does not spread its slots by the label width.
    const docked = dockEdges({
      ...(hasFlows ? { flowBadgeSize: flowTokens.flowBadgeSize } : {}),
      graph: routingGraph,
      rects,
      direction: "top-to-bottom",
      metrics,
      labelSizes: new Map(),
      fixed: true,
      cornerInset: dockCornerInset,
      sideOverrides,
      ...(combPlan !== undefined && combPlan.reservedSlots.size > 0 ? { reservedSlots: combPlan.reservedSlots } : {}),
    });
    const finalDocks = new Map<RelationRef, EdgeDocks>(docked.docks);
    if (combPlan !== undefined) {
      for (const [id, docks] of combPlan.memberDocks) finalDocks.set(id, docks);
    }
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
      plainEdges.map((edge) => {
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
    const sortedBarriers = [
      ...sortedBarrierEntries.map(([, band]) => band),
      ...(freeCellLegendRect === undefined ? [] : [freeCellLegendRect]),
    ];
    const auditBarriers: { readonly entity?: string; readonly rect: Rect }[] = [
      ...sortedBarrierEntries.map(([entity, rect]) => ({ entity: String(entity), rect })),
      ...(freeCellLegendRect === undefined ? [] : [{ rect: freeCellLegendRect }]),
    ];
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
        ...(combPlan !== undefined && combPlan.reservedPolylines.length > 0 ? { reservedRoutes: combPlan.reservedPolylines } : {}),
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
          const pts = combPlan?.memberRoutes.get(id) ?? outcome.routes.get(id);
          if (pts === undefined) continue;
          const occ = projected.relationOccurrences[edge.occurrence]!;
          const sRole = occ.endpoints.find((ep) => ep.role === "source")!;
          const tRole = occ.endpoints.find((ep) => ep.role === "target")!;
          const style = relationPresentationFor(presentation.relations, occ.id, occ.relation);
          const rawArrow = resolveArrowhead(occ.arrowhead ?? style?.arrowhead).canonicalKind;
          const arrowhead = combPlan?.suppressedArrowheads.has(String(edge.occurrence)) ? "none" : rawArrow;
          const combGroupId = combPlan?.memberCombId.get(String(edge.occurrence));
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
            ...(combGroupId === undefined ? {} : { combGroupId }),
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
            .map(([id]) => plainEdges.find((e) => String(e.occurrence) === id))
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
                graph: routingGraph,
                rects,
                direction: "top-to-bottom",
                metrics,
                labelSizes: new Map(),
                fixed: true,
                cornerInset: dockCornerInset,
                sideOverrides: candOverrides,
                ...(combPlan !== undefined && combPlan.reservedSlots.size > 0 ? { reservedSlots: combPlan.reservedSlots } : {}),
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
              if (combPlan !== undefined) {
                for (const [k, v] of combPlan.memberDocks) finalDocks.set(k, v);
              }
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
    if (combPlan !== undefined) {
      for (const [id, pts] of combPlan.memberRoutes) retryRoutes.set(id, pts);
    }
    const retryObstructed = new Set(routed.obstructed);
    const otherRoutesOf = (id: RelationRef): (readonly Vec2[])[] => [
      ...requests
        .filter((candidate) => candidate.id !== id && !retryObstructed.has(candidate.id))
        .map((candidate) => retryRoutes.get(candidate.id)!)
        .filter((route): route is readonly Vec2[] => route !== undefined),
      ...(combPlan?.reservedPolylines ?? []),
    ];
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
    // H2.7 (§4.6 step 5): comb members share ONE label on the longest free trunk segment.
    const combCarrierPlaced = new Set<string>();
    const labelBoxes = new Map<RelationRef, Rect>();
    const marks = placeFlowMarks({ plan: flowPlan, routes: retryRoutes, shapes: [...fixedShapes, ...zoneShapes.flatMap(([,rect]) => [
      { x: rect.x, y: rect.y, width: rect.width, height: metrics.labelMargin },
      { x: rect.x, y: rect.y + rect.height - metrics.labelMargin, width: rect.width, height: metrics.labelMargin },
      { x: rect.x, y: rect.y, width: metrics.labelMargin, height: rect.height },
      { x: rect.x + rect.width - metrics.labelMargin, y: rect.y, width: metrics.labelMargin, height: rect.height },
    ])], within: withinOf, ...(labelLimit === undefined ? {} : { limit: labelLimit }), measure, options, margin: metrics.labelMargin });
    warnings.push(...marks.warnings);
    const taken: Rect[] = [...marks.taken, ...(freeCellLegendRect === undefined ? [] : [freeCellLegendRect])];
    const entries = [...edgeLayouts.entries()]
      .filter(([id]) => !(combPlan?.suppressedLabels.has(String(id)) === true))
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
    const unplaced: typeof entries = [];
    if (combPlan !== undefined) {
      for (const comb of combPlan.groups) {
        if (comb.label === undefined) continue;
        const carrierId = comb.carrier as unknown as RelationRef;
        combCarrierPlaced.add(String(comb.carrier));
        const existingLayout = edgeLayouts.get(carrierId);
        const measuredCombLabel =
          existingLayout ??
          edgeLabelMeasure({
            text: comb.label,
            role: "edge-label",
            availableWidth: EDGE_LABEL_WIDTH,
            allocatedLines: DEFAULT_ALLOCATED_LINES["edge-label"],
            folded: false,
          });
        if (existingLayout === undefined) {
          recordSlot(comb.carrier, "edge-label", measuredCombLabel, false);
        }
        const size = { width: measuredCombLabel.width, height: measuredCombLabel.height };
        const within = withinOf.get(carrierId);
        let placedComb: ReturnType<typeof placePackedLabel>;
        for (const seg of comb.trunkSegments) {
          placedComb = placePackedLabel(
            {
              id: carrierId,
              route: seg,
              size,
              ...(within === undefined ? {} : { within }),
              ...(labelLimit === undefined ? {} : { limit: labelLimit }),
            },
            fixedShapes,
            taken,
            metrics.labelMargin,
          );
          if (placedComb !== undefined) break;
        }
        if (placedComb === undefined) {
          const fullRoute = retryRoutes.get(carrierId);
          if (fullRoute !== undefined) {
            placedComb = placePackedLabel(
              {
                id: carrierId,
                route: fullRoute,
                size,
                ...(within === undefined ? {} : { within }),
                ...(labelLimit === undefined ? {} : { limit: labelLimit }),
              },
              fixedShapes,
              taken,
              metrics.labelMargin,
            );
          }
        }
        if (placedComb !== undefined) {
          labelBoxes.set(carrierId, placedComb.box);
          taken.push(placedComb.box);
        } else {
          unplaced.push({
            id: carrierId,
            route: retryRoutes.get(carrierId)!,
            size,
            ...(within === undefined ? {} : { within }),
            ...(labelLimit === undefined ? {} : { limit: labelLimit }),
          });
        }
      }
    }
    const detourStep = routeSpacing > 0 ? borderClearance : 2;
    const detourClearance = routeSpacing > 0 ? borderClearance : 0;
    for (const entry of entries) {
      if (combCarrierPlaced.has(String(entry.id))) continue;
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
        let sortedWideXs: number[] | undefined;
        let sortedWideYs: number[] | undefined;
        const ensureWideGrid = (): { readonly xs: readonly number[]; readonly ys: readonly number[] } => {
          if (sortedWideXs !== undefined && sortedWideYs !== undefined) {
            return { xs: sortedWideXs, ys: sortedWideYs };
          }
          const wideXs = new Set<number>([...xs, ...outerLanesX]);
          const wideYs = new Set<number>(ys);
          const xSeeds = composition !== undefined
            ? [request.start.x, request.end.x, ...outerLanesX, ...sortedXs]
            : [request.start.x, request.end.x, ...outerLanesX];
          for (const x of xSeeds) {
            wideXs.add(x - routeSpacing);
            wideXs.add(x + routeSpacing);
          }
          if (composition !== undefined) {
            for (let idx = 0; idx + 1 < sortedXs.length; idx += 1) {
              wideXs.add((sortedXs[idx]! + sortedXs[idx + 1]!) / 2);
            }
          }
          for (const y of [request.start.y, request.end.y, ...outerLanes]) {
            wideYs.add(y - routeSpacing);
            wideYs.add(y + routeSpacing);
          }
          if (composition !== undefined) {
            const takenDy = Math.max(edgeClearance, entry.size.height / 2 + metrics.labelMargin);
            for (const box of taken) {
              wideYs.add(box.y - takenDy);
              wideYs.add(box.y + box.height + takenDy);
            }
          }
          sortedWideXs = [...wideXs].sort((a, b) => a - b);
          sortedWideYs = [...wideYs].sort((a, b) => a - b);
          return { xs: sortedWideXs, ys: sortedWideYs };
        };
        if (detour === undefined && routeSpacing > 0) {
          const wide = ensureWideGrid();
          detour = labelDetour({ request, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
            xs: wide.xs, ys: wide.ys,
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
          const adjustDockAway = (dock: Dock, role: "source" | "target"): Dock => {
            const rect = rects.get(dock.entity);
            if (rect === undefined || dock.port !== undefined || !(routeSpacing > 0)) return dock;
            const vertical = dock.side === "east" || dock.side === "west";
            const startCoord = (vertical ? rect.y : rect.x) + dockCornerInset;
            const endCoord = (vertical ? rect.y + rect.height : rect.x + rect.width) - dockCornerInset;
            const spacing = Math.max(routeSpacing, metrics.slotSpacing);
            const occupied: number[] = [];
            for (const [otherId, otherDocks] of finalDocks) {
              if (otherId === entry.id) continue;
              for (const oDock of [otherDocks.source, otherDocks.target]) {
                if (oDock.entity === dock.entity && oDock.side === dock.side) {
                  occupied.push(vertical ? oDock.point.y : oDock.point.x);
                }
              }
              if (role === "target" && otherDocks.target.entity === dock.entity && otherDocks.target.side === dock.side) {
                occupied.push(vertical ? otherDocks.target.point.y : otherDocks.target.point.x);
              }
            }
            const base = vertical ? dock.point.y : dock.point.x;
            const isClearCoord = (c: number): boolean =>
              c >= startCoord - 1e-4 && c <= endCoord + 1e-4 && occupied.every((u) => Math.abs(u - c) >= routeSpacing - 1e-4);
            if (isClearCoord(base)) return dock;
            for (let step = 1; step <= 16; step += 1) {
              for (const delta of [-step * spacing, step * spacing]) {
                const c = base + delta;
                if (!isClearCoord(c)) continue;
                const point = vertical ? { x: dock.point.x, y: c } : { x: c, y: dock.point.y };
                const anchor = vertical ? (c - rect.y) / rect.height : (c - rect.x) / rect.width;
                return { ...dock, point, anchor };
              }
            }
            return dock;
          };
          for (const [source, target] of facePairs) {
            const overrides = new Map(sideOverrides);
            overrides.set(entry.id, { source, target, turn: source === target });
            let pair = dockEdges({ graph: filteredGraph, rects, direction: "top-to-bottom", metrics,
              labelSizes: new Map(), fixed: true, cornerInset: dockCornerInset, sideOverrides: overrides }).docks.get(entry.id)!;
            if (composition !== undefined && !docksClear(pair) && routeSpacing > 0) {
              pair = {
                source: adjustDockAway(pair.source, "source"),
                target: adjustDockAway(pair.target, "target"),
              };
            }
            if (!docksClear(pair)) continue;
            const alternative = { ...request, start: pair.source.point, startExit: pair.source.exit,
              end: pair.target.point, endExit: pair.target.exit };
            let route = labelDetour({ request: alternative, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
              xs: sortedXs, ys: sortedYs,
              accepts: (points) => placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined,
            });
            if (route === undefined && composition !== undefined && routeSpacing > 0) {
              const wide = ensureWideGrid();
              route = labelDetour({ request: alternative, shapes, earlier: samePair, allFixed, passableZones: edgePassableZones, step: detourStep, routeSpacing, borderClearance: detourClearance,
                xs: wide.xs, ys: wide.ys,
                accepts: (points) => placePackedLabel({ ...entry, route: points }, fixedShapes, taken, metrics.labelMargin) !== undefined,
              });
            }
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
    const gutters: Gutter[] = [...composedEmittedGutters];
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
      const alongStrips = new Map<number, { readonly shelf: number; readonly slot: number; readonly strip: Rect; readonly zone: boolean; readonly bordersZone: boolean }[]>();
      packed.shelves.forEach((shelf, shelfIndex) => {
        const start = acrossOf(boxes[shelf[0]!]!)[0];
        const end = Math.max(...shelf.map((slot) => acrossOf(boxes[slot]!)[1]));
        const next = packed.shelves[shelfIndex + 1];
        if (next !== undefined) {
          const nextStart = acrossOf(boxes[next[0]!]!)[0];
          const currentZone = shelfHasZone(packed.run, shelf);
          const nextZone = shelfHasZone(packed.run, next);
          const acrossZone = zoneRule ? currentZone && nextZone : zone;
          const bordersZone = currentZone || nextZone;
          const base = zoneRule
            ? (acrossZone ? zoneGutter : (gapAfter(shelf.at(-1)!) ?? (bordersZone ? zoneAcrossBase : cardAcrossBase)))
            : (gapAfter(shelf.at(-1)!) ?? packed.acrossBase);
          gutters.push({
            id: `${key}|across|${String(shelfIndex)}`,
            horizontal: rows,
            strips: [stripOf(extent, [end, nextStart])],
            gap: nextStart - end,
            base,
            authoredBase: zoneRule && acrossZone ? false : gapAfter(shelf.at(-1)!) !== undefined || axisAuthored(!rows, zoneRule ? bordersZone : zone),
            max: rows ? rowGaps.maxY : rowGaps.maxX,
            zone: acrossZone,
          });
        }
        shelf.forEach((slot, index) => {
          const following = shelf[index + 1];
          if (following === undefined) return;
          const strip = stripOf([alongOf(boxes[slot]!)[1], alongOf(boxes[following]!)[0]], [start, end]);
          const leftZone = itemHasZone(packed.run.items[slot]!);
          const rightZone = itemHasZone(packed.run.items[following]!);
          const pairZone = zoneRule ? leftZone && rightZone : zone;
          (alongStrips.get(index) ?? alongStrips.set(index, []).get(index)!).push({
            shelf: shelfIndex, slot, strip, zone: pairZone, bordersZone: zoneRule ? leftZone || rightZone : zone,
          });
        });
      });
      for (const [index, strips] of [...alongStrips].sort(([left], [right]) => left - right)) {
        const thickness = (strip: Rect): number => (rows ? strip.width : strip.height);
        const startOf = (strip: Rect): number => (rows ? strip.x : strip.y);
        const lane = strips.every(({ strip, zone: stripZone, bordersZone }) =>
          Math.abs(startOf(strip) - startOf(strips[0]!.strip)) <= LANE_TOLERANCE &&
          stripZone === strips[0]!.zone && bordersZone === strips[0]!.bordersZone,
        );
        const max = rows ? rowGaps.maxX : rowGaps.maxY;
        const baseFor = (slot: number, stripZone: boolean, bordersZone: boolean): number =>
          zoneRule
            ? (stripZone ? zoneGutter : (gapAfter(slot) ?? (bordersZone ? zoneAlongBase : cardAlongBase)))
            : (gapAfter(slot) ?? packed.alongBase);
        if (lane) {
          const laneZone = strips[0]!.zone;
          gutters.push({
            id: `${key}|along|${String(index)}`,
            horizontal: !rows,
            strips: strips.map(({ strip }) => strip),
            gap: Math.max(...strips.map(({ strip }) => thickness(strip))),
            base: Math.max(...strips.map(({ slot, zone: stripZone, bordersZone }) => baseFor(slot, stripZone, bordersZone))),
            authoredBase: zoneRule && laneZone ? false : strips.some(({ slot }) => gapAfter(slot) !== undefined) || axisAuthored(rows, strips[0]!.bordersZone),
            max,
            zone: laneZone,
          });
        } else {
          for (const { shelf, slot, strip, zone: stripZone, bordersZone } of strips) {
            gutters.push({
              id: `${key}|along|${String(index)}|${String(shelf)}`,
              horizontal: !rows,
              strips: [strip],
              gap: thickness(strip),
              base: baseFor(slot, stripZone, bordersZone),
              authoredBase: zoneRule && stripZone ? false : gapAfter(slot) !== undefined || axisAuthored(rows, bordersZone),
              max,
              zone: stripZone,
            });
          }
        }
      }
    }
    // Count each routed occurrence once in the physical channel, including lifted bundle traffic.
    // REQ-R7-14 (DE-2 ask 3) + H2 §4.1: zone gutters stay fixed at `zoneGutter`
    // and never widen for traffic or labels under `zoneRule` (r7 or composition).
    const channels: LayoutChannel[] = gutters.map(gutter => {
      const edges = [...retryRoutes].filter(([, route]) => gutter.strips.some(strip => route.some((point, i) => {
        const next = route[i + 1];
        if (next === undefined) return false;
        return rectsIntersect(strip, { x: Math.min(point.x, next.x), y: Math.min(point.y, next.y),
          width: Math.abs(point.x - next.x), height: Math.abs(point.y - next.y) });
      }))).map(([id]) => String(id)).sort(byString);
      const seenCombs = new Set<string>();
      const n = edges.reduce((sum, id) => {
        const combId = combPlan?.memberCombId.get(id);
        if (combId !== undefined) {
          if (seenCombs.has(combId)) return sum;
          seenCombs.add(combId);
          return sum + 1;
        }
        return sum + (edgeBundles[id]?.members.length ?? 1);
      }, 0);
      const intersecting = [...labelBoxes.values()].filter(box => gutter.strips.some(strip => rectsIntersect(strip, box)));
      const labelled = intersecting.length > 0;
      const axis = gutter.horizontal ? 'vertical' as const : 'horizontal' as const;
      const parameters = channelMetrics(metrics, axis === 'horizontal');
      const expected = zoneRule && gutter.zone
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
        ...(r7Routing ? { capacity: channelCapacity(gutter.gap, routeSpacing, borderClearance) } : {}),
        ...(zoneRule ? { zone: gutter.zone } : {}),
      };
    });
    // A widened leaf gutter that disappeared is dropped; zone gutters stay fixed under zoneRule (REQ-R7-14).
    // Under a nominal composition plan (S-2 step 5), inner gutters (below "root") stay frozen to the plan.
    const isFrozenInnerGutter = (gutterId: string): boolean =>
      nominalPlan !== undefined && !gutterId.startsWith(`${ROOT_LEVEL_KEY}|`);
    const unused: string[] = [];
    const gutterIds = new Set(gutters.map((gutter) => gutter.id));
    for (const id of [...(plan?.widen.keys() ?? [])].sort(byString)) {
      if (isFrozenInnerGutter(id)) continue;
      if (!gutterIds.has(id)) unused.push(id);
    }

    // A label with no room is probed with the free space of a base gap above
    // and under it: where it then fits, leaf-card lanes it sits in are asked
    // to widen to its thickness plus its two margins — never past the axis cap,
    // and never on fixed zone gutters (`zoneRule && gutter.zone`).
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
        if (zoneRule && gutter.zone) continue;
        if (isFrozenInnerGutter(gutter.id)) continue;
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
      if ((zoneRule && channel.zone) || isFrozenInnerGutter(channel.id)) {
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
      const combGroupId = combPlan?.memberCombId.get(String(edge.occurrence));
      const effectiveAuditArrow = combPlan?.suppressedArrowheads.has(String(edge.occurrence)) ? "none" : arrowhead;
      checkedRoutes.push({
        id: String(edge.occurrence),
        source: String(edge.source.entity),
        target: String(edge.target.entity),
        points,
        ...(edge.source.port === undefined ? {} : { sourcePort: String(edge.source.port) }),
        ...(edge.target.port === undefined ? {} : { targetPort: String(edge.target.port) }),
        arrowhead: effectiveAuditArrow,
        ...(startArrowhead ? { startArrowhead: true } : {}),
        passable,
        ...(combGroupId === undefined ? {} : { combGroupId }),
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
      r7Routing && sourceView !== undefined && sourceView.presentation.diagram?.contractPin === undefined
        && isPresentationContractV2Pin(presentation.contractPin),
    );
    const bounds = unionOf(rects, retryRoutes, new Map([
      ...labelBoxes,
      ...Object.entries(marks.badges).map(([id,box]) => [id as RelationRef,box] as const),
      ...Object.entries(marks.arrows).flatMap(([id,arrows]) => arrows.map((arrow,i) => [(id + String(i)) as RelationRef,arrow.box] as const)),
      ...(freeCellLegendRect === undefined ? [] : [[("__free_cell_legend__" as unknown as RelationRef), freeCellLegendRect] as const]),
    ]));
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
    let linkLegend: SceneLinkLegend | undefined;
    if (hints.composition !== undefined && effectiveLegendAnchor !== "none" && stateMeasuredLegend !== undefined) {
      if (effectiveLegendAnchor === "free-cell" && freeCellLegendRect !== undefined) {
        linkLegend = placeSceneLinkLegend(stateMeasuredLegend, "free-cell", freeCellLegendRect, freeCellLegendRect);
      } else {
        const paddedBoxes = new Map<RelationRef, Rect>();
        for (const [id, box] of labelBoxes) {
          paddedBoxes.set(id, {
            x: box.x - metrics.labelMargin,
            y: box.y - metrics.labelMargin,
            width: box.width + 2 * metrics.labelMargin,
            height: box.height + 2 * metrics.labelMargin,
          });
        }
        for (const [id, box] of Object.entries(marks.badges)) paddedBoxes.set(id as RelationRef, box);
        for (const [id, arrows] of Object.entries(marks.arrows)) {
          arrows.forEach((arrow, i) => paddedBoxes.set((id + String(i)) as RelationRef, arrow.box));
        }
        const legendUnion = unionOf(rects, retryRoutes, paddedBoxes);
        if (!legendUnion.empty) {
          const contentBounds: Rect = {
            x: legendUnion.xmin,
            y: legendUnion.ymin,
            width: legendUnion.width,
            height: legendUnion.height,
          };
          linkLegend = placeSceneLinkLegend(
            stateMeasuredLegend,
            effectiveLegendAnchor === "free-cell" ? "right" : effectiveLegendAnchor,
            contentBounds,
          );
        }
      }
    }
    let compositionReport: LayoutCompositionReport | undefined;
    if (composition !== undefined) {
      const sortedGridReports = Object.fromEntries(
        Object.entries(composedGridReports).sort(([left], [right]) => byString(left, right)),
      );
      const packedLevelsForAudit: {
        readonly scope: string;
        readonly rows: boolean;
        readonly shelves: readonly (readonly { readonly entity: EntityRef; readonly rect: Rect }[])[];
      }[] = [];
      for (const [key, packed] of [...packedRuns].sort(([left], [right]) => byString(left, right))) {
        const boxes = seatedBoxes.get(key);
        if (boxes === undefined || boxes.length < 2) continue;
        const shelves = packed.shelves
          .map((shelf) =>
            shelf
              .map((slot) => {
                const item = packed.run.items[slot];
                const rect = boxes[slot];
                if (item === undefined || !("entity" in item) || rect === undefined) return undefined;
                return { entity: item.entity, rect };
              })
              .filter((entry): entry is { entity: EntityRef; rect: Rect } => entry !== undefined),
          )
          .filter((shelf) => shelf.length > 0);
        if (shelves.length > 0) {
          packedLevelsForAudit.push({ scope: key, rows: packed.rows, shelves });
        }
      }
      const paintedGaps = auditSiblingZonePaintedGaps({
        gridReports: sortedGridReports,
        packedLevels: packedLevelsForAudit,
        isContainer: entityIsContainer,
        zoneGutter,
      });
      if (nominalPlan?.aspectUnreached !== undefined && collapsedOccurrences.size === 0) {
        warnings.push({
          severity: "info",
          code: "aspect-unreached",
          refs: [],
          message: `target 16:9 aspect ratio was not reached within the slack cap (achieved ${nominalPlan.aspectUnreached.achieved.toFixed(3)})`,
          details: {
            achieved: nominalPlan.aspectUnreached.achieved,
            target: nominalPlan.aspectUnreached.target,
          },
        });
      }
      if (planCtx?.mode === "nominal-plan" && planCtx.capture !== undefined) {
        const paintedExtras = new Map<RelationRef, Rect>([
          ...labelBoxes,
          ...Object.entries(marks.badges).map(([id, box]) => [id as RelationRef, box] as const),
          ...Object.entries(marks.arrows).flatMap(([id, arrows]) =>
            arrows.map((arrow, i) => [(id + String(i)) as RelationRef, arrow.box] as const),
          ),
          ...(linkLegend === undefined ? [] : [[("__link_legend__" as unknown as RelationRef), linkLegend.rect] as const]),
        ]);
        const painted = unionOf(rects, retryRoutes, paintedExtras);
        planCtx.capture.paintedBounds = { width: painted.width, height: painted.height };
      }
      compositionReport = {
        grids: sortedGridReports,
        ...(nominalPlan === undefined ? {} : { planDigest: nominalPlan.planDigest }),
        ...(nominalPlan?.nominalAspect === undefined
          ? {}
          : {
              nominalAspect: nominalPlan.nominalAspect,
              tau: nominalPlan.tau,
              sigmaCols: nominalPlan.sigmaCols,
              sigmaBands: nominalPlan.sigmaBands,
              ...(nominalPlan.postRouteCorrectionRounds === undefined
                ? {}
                : { postRouteCorrectionRounds: nominalPlan.postRouteCorrectionRounds }),
            }),
        paintedGapsAboveToken: paintedGaps.aboveToken,
        ...(combPlan !== undefined && combPlan.fallbacks.length > 0 ? { combFallbacks: combPlan.fallbacks } : {}),
      };
    }
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
      ...(composition === undefined ? {} : {
        legendResolved: true,
        ...(linkLegend === undefined ? {} : { linkLegend }),
        ...(compositionReport === undefined ? {} : { composition: compositionReport }),
        ...(combPlan !== undefined && combPlan.groups.length > 0 ? { combGroups: combPlan.groups } : {}),
      }),
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
  if (planCtx?.mode === "nominal-plan" && planCtx.capture !== undefined) {
    for (const [id, gap] of [...widen].sort(([left], [right]) => byString(left, right))) {
      if (!id.startsWith(`${ROOT_LEVEL_KEY}|`)) {
        planCtx.capture.innerWiden[id] = gap;
      }
    }
  }
  // When strict route spacing reports channel capacity overflow inside an
  // auto-packed level (e.g. a folded child causes a column/row stack whose
  // single fixed gutter has lower capacity than the edges crossing it), try
  // flipping that level's orientation (`rows` <-> `columns`) and adopt it ONLY
  // when it completely resolves all route-spacing conflicts without introducing
  // obstructions.
  // H2 F-2 / R-9: never run orientation retry on planned/composed scenes.
  if (
    composition === undefined &&
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
  persistUnpinnedDashes: boolean,
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
    // A declared DE-2 stroke has an explicit default arrowhead when saved.
    // Bare dashed occurrences already existed on pinned full-size views.
    const authoredStroke = style?.strokeStyle !== undefined || (persistUnpinnedDashes && occurrence.strokeStyle === "dashed");
    const arrowhead = style?.arrowhead ?? (authoredStroke ? "arrow" : undefined);
    const styledOccurrence: RelationOccurrence = {
      ...occurrence,
      ...(occurrence.strokeStyle === undefined && style?.strokeStyle !== undefined ? { strokeStyle: style.strokeStyle } : {}),
      ...(occurrence.arrowhead === undefined && arrowhead !== undefined ? { arrowhead } : {}),
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
