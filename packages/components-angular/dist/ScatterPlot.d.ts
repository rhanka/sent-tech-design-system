import { type ChartAnnotation, type ResolvedAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type ScatterPlotTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ScatterPlotDatum = {
    x: number;
    y: number;
    label?: string;
    tone?: ScatterPlotTone;
    /**
     * Per-datum radius, clamped to a sane maximum (32). Non-finite or
     * negative ⇒ falls back to the global `radius`.
     */
    r?: number;
};
/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
    x: number;
    y: number;
    tone?: ScatterPlotTone;
    label?: string;
};
export type ScatterPlotProps = {
    data: ScatterPlotDatum[];
    width?: number;
    height?: number;
    xLabel?: string;
    yLabel?: string;
    radius?: number;
    /**
     * Cluster centroid markers (ring + cross), drawn above the points. Their
     * coordinates are folded into the axis domain. Non-finite x/y are skipped.
     */
    centroids?: ScatterPlotCentroid[];
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons). Both axes are continuous (linear). Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent (default) → none. `true` → each
     * point's value (the datum `label` wins when present). Object → `format` /
     * `position`. Default position is `top`. Labels are `aria-hidden`.
     */
    dataLabels?: DataLabelsProp;
    /**
     * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
     * present, otherwise `"x,y"`. Absent (`undefined`) keeps the uncontrolled
     * behaviour.
     */
    hoverKey?: string | null;
    /** Emitted on hover (the key) / leave (`null`); fired even while controlled. */
    onHoverKeyChange?: (key: string | null) => void;
    /** FR-5 — roving-tabindex keyboard navigation of the data points. */
    keyboardNav?: boolean;
    /** Emitted on Enter/Space select (the key) / Escape (`null`); enables nav. */
    onSelectKey?: (key: string | null) => void;
    label: string;
    class?: string;
};
type ScatterScales = {
    xTicks: number[];
    yTicks: number[];
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    plotW: number;
    plotH: number;
};
type ScatterPoint = {
    cx: number;
    cy: number;
    r: number;
    datum: ScatterPlotDatum;
    index: number;
    tone: ScatterPlotTone;
};
type CentroidMark = {
    cx: number;
    cy: number;
    tone: ScatterPlotTone;
    label?: string;
};
type AnnotationRegion = Extract<ResolvedAnnotation, {
    kind: "region";
}>;
type AnnotationAbove = Extract<ResolvedAnnotation, {
    kind: "line" | "shape" | "point" | "label";
}>;
export declare class ScatterPlot {
    static readonly stComponentName = "ScatterPlot";
    readonly componentName = "ScatterPlot";
    readonly MARGIN: {
        readonly top: 14;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 48;
    };
    readonly NAV_HIT = 18;
    private hoveredIndex;
    private focusedIndex;
    data: ScatterPlotDatum[];
    width?: number;
    height?: number;
    xLabel?: string;
    yLabel?: string;
    radius?: number;
    centroids?: ScatterPlotCentroid[];
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get safeData(): ScatterPlotDatum[];
    get widthValue(): number;
    get heightValue(): number;
    get radiusValue(): number;
    get viewBox(): string;
    /** Centroids guarded once: non-finite coordinates are skipped entirely. */
    get validCentroids(): ScatterPlotCentroid[];
    get scales(): ScatterScales;
    get points(): ScatterPoint[];
    get centroidMarks(): CentroidMark[];
    get yGridLines(): Array<{
        value: number;
        y: number;
    }>;
    get xTickEntries(): Array<{
        value: number;
        x: number;
    }>;
    get yAxisLabelY(): number;
    get yAxisLabelTransform(): string;
    private get annotationContext();
    get resolvedAnnotations(): ResolvedAnnotation[];
    get annotationRegions(): AnnotationRegion[];
    get annotationAbove(): AnnotationAbove[];
    annotationShapePoints(annotation: Extract<ResolvedAnnotation, {
        kind: "shape";
    }>): string;
    get dataLabelItems(): Array<{
        key: number;
        x: number;
        y: number;
        text: string;
        baseline: string;
    }>;
    get dataValueItems(): string[];
    private keyForPoint;
    get hoverKeys(): string[];
    get activeIndex(): number;
    get activePoint(): ScatterPoint | null;
    get navEnabled(): boolean;
    formatTickLabel(value: number): string;
    pointClass(tone: ScatterPlotTone): string;
    centroidClass(tone: ScatterPlotTone): string;
    datapointLabel(p: ScatterPoint): string;
    rovingTabIndexFor(index: number): number;
    private emitHoverKey;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    handleDatapointFocus(index: number): void;
    handleDatapointKeyDown(event: KeyboardEvent, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScatterPlot, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ScatterPlot, "st-scatter-plot", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "xLabel": { "alias": "xLabel"; "required": false; }; "yLabel": { "alias": "yLabel"; "required": false; }; "radius": { "alias": "radius"; "required": false; }; "centroids": { "alias": "centroids"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ScatterPlot.d.ts.map