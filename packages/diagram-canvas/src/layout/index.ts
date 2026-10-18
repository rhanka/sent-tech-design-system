/**
 * The layout engine (SPEC §10.5, rules L-R1–L-R11): a `generic@1`
 * `SemanticDocument` in, a `diagram-core` `ViewDocument` out. Pure computation,
 * no DOM, no dependency beyond `@sentropic/diagram-core`; text is measured by an
 * injected function. See README, "Layout".
 */

export { layoutDocument } from "./engine.js";
export {
  edgeLabelCandidates,
  edgeLabelPlacement,
  labelBoxOnSegment,
  placeEdgeLabels,
  relationRoute,
  type LabelEntry,
  type LabelPlacement,
} from "./labels.js";
export { bendCount, simplifyRoute } from "./route.js";
export * from "./types.js";
