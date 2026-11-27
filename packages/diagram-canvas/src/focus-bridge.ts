/**
 * Headless Focus dossier bridge for `@sentropic/diagram-canvas`.
 *
 * Re-exports validation, layout, shipped non-`generic@1` profile registry/bindings,
 * and the accessible process table helper with identical signatures and zero DOM or
 * side effects.
 */

export {
  layoutScene,
  shippedSceneBindings,
  shippedSceneRegistry,
  validateSceneDocument,
  type SceneDocument,
  type SceneLaidOut,
  type SceneLayoutInput,
  type SceneOccurrenceRef,
  type SceneOrientations,
  type ScenePresentation,
  type SceneView,
} from "./presentation/diagramSceneModel.js";

export { renderProcessTable } from "./presentation/process.js";

export type { LayoutOptions, LayoutResult, LineMeasurer } from "./layout/index.js";
export type { Diagnostic, SemanticDocument } from "@sentropic/diagram-core";
