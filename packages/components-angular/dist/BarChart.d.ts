import { type ChartBand, type ChartGoalLine, type ChartReferenceLine, type ChartScale } from "./chartScale.js";
import { type ChartAnnotation, type ResolvedAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type BarChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type BarChartDatum = {
    label: string;
    value: number;
    tone?: BarChartTone;
    /** Lower error-bar extent (value-axis units). Drawn only when finite. */
    errorLow?: number;
    /** Upper error-bar extent (value-axis units). Drawn only when finite. */
    errorHigh?: number;
};
export type BarChartProps = {
    data: BarChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
     * scale uses it instead of the data-derived min/max — letting several
     * BarCharts in a grid share one scale (small multiples). When absent or
     * invalid, the scale falls back to the auto data range (unchanged).
     */
    domain?: [number, number];
    /**
     * Keys of the currently selected bars (a bar's key is its `label`).
     * CONTROLLED — the parent owns the toggle; the component never stores
     * selection. When non-empty the selected bars stay full opacity (+ accent)
     * and the rest dim; when empty every bar is normal. Defaults to [].
     */
    selectedKeys?: string[];
    /**
     * Called with the bar's key (its `label`) when the user selects it. When
     * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
     * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
     * The SVG bars themselves stay decorative (aria-hidden) and only offer a
     * mouse click shortcut for sighted pointer users. When omitted the chart is
     * purely presentational (no interactivity, unchanged).
     */
    onSelect?: (key: string) => void;
    /** Reference lines on the value axis (default `axis: "y"`). */
    referenceLines?: ChartReferenceLine[];
    /** Shaded value-axis bands between `from`..`to`. */
    bands?: ChartBand[];
    /** A single goal line, emphasised above the bars. */
    goalLine?: ChartGoalLine;
    /**
     * Annotation overlay in DATA space. The x coordinate is categorical — it
     * matches a bar by its `label`; y/value coordinates are value-axis numbers.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-bar value labels. `false`/absent (default) → none. `true` → each bar's
     * value with the chart's numeric formatter. Object → `format(value)` and/or a
     * `position` override. Default position is `outside` (above the bar in
     * vertical mode, past the bar end in horizontal mode). Labels are
     * `aria-hidden` — the values already live in the accessible ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
     * value axis to base-10 logarithmic — values `<= 0` are ignored for
     * domain/ticks and clamped to the lowest tick when positioned.
     */
    scale?: ChartScale;
    /** Inverts the value axis (high values toward the origin). Default false. */
    invertAxis?: boolean;
    /**
     * Toggles the legend if the chart has one. BarChart has no separate legend
     * surface (its filter chips double as one); accepted for cross-chart parity
     * and otherwise ignored.
     */
    showLegend?: boolean;
    /**
     * CONTROLLED synchronised hover key (FR-3). A bar's key is its `label`. When
     * provided (string or null), the crosshair + tooltip track this key instead of
     * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
     * share one hover channel across several aligned charts. Absent (`undefined`)
     * keeps the legacy uncontrolled behaviour. Independent of `selectedKeys`.
     */
    hoverKey?: string | null;
    /**
     * Emitted when the user hovers a bar (its `label`) or leaves the plot (`null`).
     * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
     * keep the shared hover channel in sync.
     */
    onHoverKeyChange?: (key: string | null) => void;
    /**
     * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
     * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
     * over the bars: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
     * bars (data order), Home/End jump to the first/last, Enter/Space select the
     * focused bar (`onSelectKey`), Escape leaves the navigation. Each focused bar
     * announces its `label` + value. Absent ⇒ no overlay, rendering unchanged.
     */
    keyboardNav?: boolean;
    /**
     * Emitted when the user selects the focused bar via Enter/Space (its `label`),
     * or `null` when the navigation is left via Escape. Wiring it also turns the
     * keyboard navigation on. Independent of `onSelect`/`selectedKeys`.
     */
    onSelectKey?: (key: string | null) => void;
    class?: string;
};
type BarGeometry = {
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    datum: BarChartDatum;
    tone: BarChartTone;
};
type GridItem = {
    key: string;
    value: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    labelX: number;
    labelY: number;
    textAnchor: "start" | "middle" | "end";
    dominantBaseline?: string;
};
type CategoryLabel = {
    key: string;
    x: number;
    y: number;
    text: string;
    textAnchor: "start" | "middle" | "end";
    dominantBaseline?: string;
};
type BandRect = {
    key: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    tone?: ChartBand["tone"];
};
type RefLine = {
    key: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    label?: string;
    tone?: ChartReferenceLine["tone"];
};
type GoalGeom = {
    p: number;
    label?: string;
    value: number;
};
type ErrorGeom = {
    key: string;
    stem: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    capLow: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    capHigh: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
};
type DataLabelItem = {
    key: string;
    x: number;
    y: number;
    text: string;
    anchor: "start" | "middle" | "end";
    baseline: string;
};
type AnnotationRegion = Extract<ResolvedAnnotation, {
    kind: "region";
}>;
type AnnotationLine = Extract<ResolvedAnnotation, {
    kind: "line";
}>;
type AnnotationShape = Extract<ResolvedAnnotation, {
    kind: "shape";
}>;
type AnnotationPoint = Extract<ResolvedAnnotation, {
    kind: "point";
}>;
type AnnotationLabel = Extract<ResolvedAnnotation, {
    kind: "label";
}>;
type AnnotationAbove = AnnotationLine | AnnotationShape | AnnotationPoint | AnnotationLabel;
export declare class BarChart {
    static readonly stComponentName = "BarChart";
    readonly componentName = "BarChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 44;
    };
    private navDatumElements?;
    private hoveredIndex;
    private focusedIndex;
    data: BarChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    domain?: [number, number];
    selectedKeys?: string[];
    onSelect?: (key: string) => void;
    referenceLines?: ChartReferenceLine[];
    bands?: ChartBand[];
    goalLine?: ChartGoalLine;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    scale?: ChartScale;
    invertAxis?: boolean;
    showLegend?: boolean;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get orientationValue(): "vertical" | "horizontal";
    get isVertical(): boolean;
    get plotWidth(): number;
    get plotHeight(): number;
    get selectedSet(): Set<string>;
    get hasSelection(): boolean;
    get interactive(): boolean;
    get goal(): ChartGoalLine | null;
    get valueAxis(): "x" | "y";
    get errorExtents(): number[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get baselineValue(): number;
    valueFraction(value: number): number;
    valuePos(value: number): number;
    get bars(): BarGeometry[];
    get gridItems(): GridItem[];
    get categoryLabels(): CategoryLabel[];
    get bandRects(): BandRect[];
    get refLines(): RefLine[];
    private categoryPixel;
    private valuePixelRel;
    private transposeAnnotations;
    get resolvedAnnotations(): ResolvedAnnotation[];
    get annotationRegions(): AnnotationRegion[];
    get annotationAbove(): AnnotationAbove[];
    get goalGeom(): GoalGeom | null;
    get errorBarGeom(): ErrorGeom[];
    get dataLabelItems(): DataLabelItem[];
    get dataValueItems(): string[];
    get hoverKeys(): string[];
    get activeIndex(): number;
    get hoveredBar(): BarGeometry | null;
    get navEnabled(): boolean;
    formatTickLabel(value: number): string;
    bandClass(band: BandRect): string;
    refLineClass(line: RefLine): string;
    refLineLabelX(line: RefLine): number;
    refLineLabelY(line: RefLine): number;
    annotationLineLabelX(annotation: AnnotationLine): number;
    annotationLineLabelY(annotation: AnnotationLine): number;
    annotationLineTextAnchor(annotation: AnnotationLine): "start" | "end";
    annotationShapePoints(annotation: AnnotationShape): string;
    barClass(bar: BarGeometry): string;
    filterChipClass(bar: BarGeometry): string;
    selectBar(key: string): void;
    tooltipLeft(bar: BarGeometry): number;
    tooltipTop(bar: BarGeometry): number;
    rovingTabIndexFor(index: number): number;
    datapointLabel(bar: BarGeometry): string;
    private emitHoverKey;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    handleDatapointFocus(index: number): void;
    focusDatum(index: number): void;
    handleDatapointKeyDown(event: KeyboardEvent, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BarChart, "st-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "label": { "alias": "label"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "selectedKeys": { "alias": "selectedKeys"; "required": false; }; "onSelect": { "alias": "onSelect"; "required": false; }; "referenceLines": { "alias": "referenceLines"; "required": false; }; "bands": { "alias": "bands"; "required": false; }; "goalLine": { "alias": "goalLine"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "invertAxis": { "alias": "invertAxis"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=BarChart.d.ts.map