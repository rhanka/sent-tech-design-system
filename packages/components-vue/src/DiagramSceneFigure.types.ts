import type { LayoutHints, LayoutMetrics, LayoutOptions, LayoutResult, LineMeasurer, RowPackOptions } from '@sentropic/diagram-canvas';
import type { CardLineMeasure, DiagramGlyphPaths } from './diagramCardModel.js';
import type { SceneDocument, SceneView, ScenePresentation, SceneOccurrenceRef, SceneLayoutCache, DiagramSceneSize } from './diagramSceneModel.js';
/** Named array boundary keeps emitted declarations within the public canvas layer. */
export interface SceneCollapsedOccurrences extends ReadonlyArray<SceneOccurrenceRef> {}
  export interface DiagramSceneFigureLabels {
    /** Accessible name of the camera control group. */
    controls: string;
    zoomIn: string;
    zoomOut: string;
    /** Visible text of the fit / reset control (« Ajuster »). */
    fit: string;
    /** Accessible name of the readout, e.g. « Zoom 85 % ». */
    zoomLevel: (percent: number) => string;
    /** Accessible name of the scrollable drawing region. */
    viewport: string;
    expand: (title: string) => string;
    collapse: (title: string) => string;
  }

  export interface DiagramSceneCamera {
    readonly zoom: number;
    /** `round(zoom / maxDisplayScale × 100)`. */
    readonly readout: number;
    readonly minZoom: number;
    readonly maxZoom: number;
    /** The zoom a fit or reset applies. */
    readonly fitZoom: number;
    readonly pans: boolean;
  }

  export interface DiagramSceneFigureProps {
    layoutCache?: SceneLayoutCache;
    contentSize?: DiagramSceneSize;
    onSizeChange?: (size: DiagramSceneSize) => void;
    document: SceneDocument;
    /** Retained source view (occurrences, fold groups). Optional: the engine synthesises one. */
    view?: SceneView;
    registry: LayoutOptions["registry"];
    bindings?: LayoutOptions["bindings"];
    presentation: ScenePresentation;
    /** Declaration order (`rootOrder`, `ordering[parent]`) and the other layout hints. */
    hints?: LayoutHints;
    /** Runtime token numbers for the engine (gaps, caps). */
    metrics?: Partial<LayoutMetrics>;
    rowPack?: RowPackOptions;
    /** L-R7 report width. The measured path never re-packs on it (D-3). */
    targetWidth?: number;
    /** Card text measurer, shared by the cards, the zones and the layout. */
    measure?: CardLineMeasure;
    /** Layout line measurer. Defaults to the bridge over `measure`. */
    measureLines?: LineMeasurer;
    /** Controlled fold state: collapsed occurrence ids. */
    collapsed?: readonly SceneOccurrenceRef[];
    /** Initial collapsed occurrence ids when `collapsed` is not controlled. */
    defaultFolds?: readonly SceneOccurrenceRef[];
    title?: string;
    /** Accessible name of the figure. Defaults to `title`. */
    label?: string;
    compact?: boolean;
    labels?: Partial<DiagramSceneFigureLabels>;
    iconBindings?: import("@sentropic/diagram-canvas/diagramSceneModel").SceneIconBindings;
    strictIcons?: boolean;
    resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined;
    onFoldChange?: (
      collapsed: readonly SceneOccurrenceRef[],
      change: { occurrence: SceneOccurrenceRef; collapsed: boolean },
    ) => void;
    onSelect?: (event: { entityId: string }) => void;
    /** One call per layout pass, with the engine result (warnings, refusals, orientations). */
    onLayout?: (result: LayoutResult) => void;
    onCameraChange?: (camera: DiagramSceneCamera) => void;
  }

