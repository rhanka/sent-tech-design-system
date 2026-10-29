/**
 * The layout engine (SPEC §10.5, rules L-R1–L-R11): a `generic@1`
 * `SemanticDocument` in, a `diagram-core` `ViewDocument` out. Pure computation,
 * no DOM, no dependency beyond `@sentropic/diagram-core`; text is measured by an
 * injected function. See README, "Layout".
 */

export {
  chooseRankGap,
  diagnoseLabels,
  layoutDocument,
  residualUnplaceable,
  type LabelOutcome,
  type RankGapChoice,
  type ResidualReason,
  type SegmentResidual,
} from "./engine.js";
export { layoutFolded, layoutMeasured } from "./measured.js";
export {
  effectiveStretch,
  groupLeaves,
  isLayoutGroup,
  resolveGaps,
  resolveOrder,
  validateHints,
  type HintScope,
  type LayoutGroup,
  type LayoutHints,
  type ResolvedGaps,
} from "./hints.js";
export {
  CONTENT_INSET,
  DEFAULT_ALLOCATED_LINES,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  headerAvailableWidth,
  headerBandHeight,
  headerOverflows,
  innerWidthOf,
  LEGEND_KEY_HEIGHT,
  measureHeader,
  RULE_GAP,
  SWATCH_ALLOCATION,
  TOGGLE_ALLOCATION,
  UNWRAPPED_PROBE_WIDTH,
  type EntityMeasurementInput,
  type FootprintDecl,
  type HeaderMeasurement,
  type LayoutMeasurements,
  type LineLayout,
  type LineMeasurer,
  type MeasurementOverflow,
  type MeasureRequest,
  type SlotMeasurement,
} from "./measure.js";
export { BARYCENTRE_SWEEPS, dummyKey, orderLevel, type LevelEdge, type LevelOrder } from "./rank.js";
export { parallelRelations, sideToward } from "./dock.js";
export { ROW_FILL_ROUNDS } from "./place.js";
export {
  edgeLabelCandidates,
  edgeLabelPlacement,
  labelBoxOnSegment,
  placeEdgeLabels,
  relationRoute,
  type LabelEntry,
  type LabelPlacement,
} from "./labels.js";
export { bendCount, routeEdges, simplifyRoute, type RouteOutcome, type RouteRequest } from "./route.js";
export * from "./types.js";
