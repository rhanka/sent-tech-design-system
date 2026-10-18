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
