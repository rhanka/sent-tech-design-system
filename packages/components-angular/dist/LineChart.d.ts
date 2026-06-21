import { type ChartBand, type ChartGoalLine, type ChartReferenceLine, type ChartScale, type ForecastRun } from "./chartScale.js";
import { type ChartAnnotation, type ResolvedAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type LineChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type LineChartDatum = {
    x: number | string;
    y: number;
    /**
     * Marks the datum as a FORECAST point. Forecast points render with the
     * dedicated forecast tone and every segment touching a forecast point is
     * dashed — including the segment between the last actual point and the
     * first forecast point, so the line stays connected. Absent/false ⇒
     * rendering unchanged (additive).
     */
    forecast?: boolean;
};
export type LineChartProps = {
    data: LineChartDatum[];
    width?: number;
    height?: number;
    tone?: LineChartTone;
    smooth?: boolean;
    area?: boolean;
    label: string;
    /** Reference lines (default `axis: "y"` → horizontal at `value`). */
    referenceLines?: ChartReferenceLine[];
    /** Shaded value-axis bands between `from`..`to`. */
    bands?: ChartBand[];
    /** A single goal line, emphasised above the data. */
    goalLine?: ChartGoalLine;
    /** Least-squares trend line over the data points. */
    trend?: boolean;
    /**
     * Annotation overlay in DATA space (points, labels, axis lines, regions,
     * polygons). Resolved to pixels via the chart's scales and drawn in a
     * dedicated `<g class="st-lineChart__annotations">` — regions behind the
     * series, every other kind above it. Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-point value labels. `false`/absent (default) → none. `true` → each
     * point's value with the chart's numeric formatter. Object → `format(value)`
     * and/or a `position` override. Default position is `top` (above the point).
     * Labels are `aria-hidden` — the values already live in the accessible
     * ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * Fixed value-axis (y) domain `[min, max]`. When provided (and finite,
     * min<max) the y scale uses it instead of the data-derived range. Invalid or
     * absent → auto range (unchanged).
     */
    domain?: [number, number];
    /**
     * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
     * y axis to base-10 logarithmic — values `<= 0` are ignored for domain/ticks
     * and clamped to the lowest tick when positioned.
     */
    scale?: ChartScale;
    /** Inverts the value (y) axis. Default false. */
    invertAxis?: boolean;
    /**
     * Toggles the legend if the chart has one. LineChart is single-series and has
     * no legend surface; accepted for parity and otherwise ignored.
     */
    showLegend?: boolean;
    /**
     * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
     * provided (string or null), the crosshair + tooltip track this key instead of
     * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
     * share one hover channel across several aligned charts. Absent (`undefined`)
     * keeps the legacy uncontrolled behaviour.
     */
    hoverKey?: string | null;
    /**
     * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
     * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
     * keep the shared hover channel in sync.
     */
    onHoverKeyChange?: (key: string | null) => void;
    /**
     * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
     * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
     * over the points: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
     * points (data order), Home/End jump to the first/last, Enter/Space select the
     * focused point (`onSelectKey`), Escape leaves the navigation. Each focused
     * point announces its `x` + value. Absent ⇒ no overlay, rendering unchanged.
     */
    keyboardNav?: boolean;
    /**
     * Emitted when the user selects the focused point via Enter/Space (its key,
     * `String(x)`), or `null` when the navigation is left via Escape. Wiring it
     * also turns the keyboard navigation on.
     */
    onSelectKey?: (key: string | null) => void;
    class?: string;
};
type AnnotationRegion = Extract<ResolvedAnnotation, {
    kind: "region";
}>;
type AnnotationAbove = Extract<ResolvedAnnotation, {
    kind: "line" | "shape" | "point" | "label";
}>;
type BandRect = {
    key: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    tone?: ChartBand["tone"];
};
type RefLineGeom = {
    key: number;
    axis: "x" | "y";
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    label?: string;
    tone?: ChartReferenceLine["tone"];
};
export declare class LineChart {
    static readonly stComponentName = "LineChart";
    readonly componentName = "LineChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    private hoveredIndex;
    private focusedIndex;
    data: LineChartDatum[];
    width?: number;
    height?: number;
    tone?: LineChartTone;
    smooth?: boolean;
    area?: boolean;
    label: string;
    referenceLines?: ChartReferenceLine[];
    bands?: ChartBand[];
    goalLine?: ChartGoalLine;
    trend?: boolean;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    domain?: [number, number];
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
    get plotWidth(): number;
    get plotHeight(): number;
    get safeData(): LineChartDatum[];
    get isLog(): boolean;
    get validDomain(): [number, number] | null;
    get goal(): ChartGoalLine | null;
    get xIsNumeric(): boolean;
    get xDomainMin(): number;
    get xDomainMax(): number;
    get yValues(): number[];
    get yTicks(): number[];
    get yDomain(): {
        min: number;
        max: number;
    };
    valueFraction(v: number): number;
    yPixel(v: number): number;
    xPixel(datum: LineChartDatum, index: number): number;
    get points(): Array<{
        x: number;
        y: number;
        datum: LineChartDatum;
        index: number;
    }>;
    get forecastFlags(): boolean[];
    get hasForecast(): boolean;
    get fullLinePath(): string;
    get computedForecastRuns(): ForecastRun[];
    get solidPaths(): string[];
    get forecastPaths(): string[];
    get areaPath(): string;
    get gridLines(): Array<{
        value: number;
        y: number;
    }>;
    get xTickEntries(): Array<{
        key: string;
        x: number;
        label: string;
    }>;
    get bandRects(): BandRect[];
    bandClass(band: BandRect): string;
    get refLines(): RefLineGeom[];
    refLineClass(line: RefLineGeom): string;
    get trendLine(): {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    } | null;
    get goalGeom(): {
        y: number;
        label?: string;
        value: number;
    } | null;
    get annotationContext(): {
        xScale: (value: number | string) => number | null;
        yScale: (value: number) => number | null;
        plotLeft: number;
        plotTop: number;
        plotWidth: number;
        plotHeight: number;
    };
    get resolvedAnnotations(): ResolvedAnnotation[];
    get annotationRegions(): AnnotationRegion[];
    get annotationAbove(): AnnotationAbove[];
    annotationShapePoints(annotation: Extract<ResolvedAnnotation, {
        kind: "shape";
    }>): string;
    dotClass(index: number): string;
    get dataLabelItems(): Array<{
        key: string;
        x: number;
        y: number;
        text: string;
        baseline: string;
    }>;
    get dataValueItems(): string[];
    get hoverKeys(): string[];
    get activeIndex(): number;
    get hoveredPoint(): {
        x: number;
        y: number;
        datum: LineChartDatum;
        index: number;
    } | null;
    get navEnabled(): boolean;
    formatTickLabel(v: number): string;
    datapointLabel(pt: {
        datum: LineChartDatum;
    }): string;
    rovingTabIndexFor(index: number): number;
    tooltipLeft(pt: {
        x: number;
    }): number;
    tooltipTop(pt: {
        y: number;
    }): number;
    handleLeave(): void;
    handleVisualPointerMove(e: PointerEvent): void;
    handleDatapointFocus(index: number): void;
    handleDatapointKeyDown(e: KeyboardEvent, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LineChart, "st-line-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "area": { "alias": "area"; "required": false; }; "label": { "alias": "label"; "required": false; }; "referenceLines": { "alias": "referenceLines"; "required": false; }; "bands": { "alias": "bands"; "required": false; }; "goalLine": { "alias": "goalLine"; "required": false; }; "trend": { "alias": "trend"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "invertAxis": { "alias": "invertAxis"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=LineChart.d.ts.map