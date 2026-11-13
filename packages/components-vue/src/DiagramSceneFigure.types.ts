import type { SceneOccurrenceRef } from '@sentropic/diagram-canvas/diagramSceneModel';
export type { DiagramSceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera } from '@sentropic/diagram-canvas/diagramSceneModel';
/** Named array boundary keeps emitted declarations within the public canvas layer. */
export interface SceneCollapsedOccurrences extends ReadonlyArray<SceneOccurrenceRef> {}
