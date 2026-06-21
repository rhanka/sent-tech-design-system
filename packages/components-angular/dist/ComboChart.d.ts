import { type ChartAnnotation, type ResolvedAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type ComboChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ComboChartBarSeries = {
    label: string;
    data: number[];
    tone?: ComboChartTone;
};
export type ComboChartLineSeries = {
    label: string;
    data: number[];
    tone?: ComboChartTone;
    smooth?: boolean;
};
export type ComboChartProps = {
    categories: string[];
    bars?: ComboChartBarSeries[];
    lines?: ComboChartLineSeries[];
    leftAxisLabel?: string;
    rightAxisLabel?: string;
    legend?: boolean;
    /**
     * Interactive legend (FR-4). Ids/labels of bar/line series hidden from the
     * render (controlled by the parent; default = all visible). Hidden series
     * are omitted and their legend item is shown "off" (`aria-pressed`).
     * Undefined → legacy non-interactive legend, unless `onToggleSeries` is set.
     */
    hiddenSeries?: string[];
    /** Emitted on click / Enter / Space on a legend item. */
    onToggleSeries?: (seriesId: string) => void;
    /**
     * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
     * matches a category by equality (band centre); the y coordinate (and
     * `value`/`from`/`to`) are LEFT (bar) value-axis numbers. Regions render
     * behind the bars, every other kind above. Additive: absent ⇒ unchanged.
     */
    annotations?: ChartAnnotation[];
    /**
     * Per-datum value labels on BOTH the bars and the line points. `false`/absent
     * (default) → none. `true` → each value with the chart's numeric formatter.
     * Object → `format(value)` and/or a `position` override. Labels are
     * `aria-hidden` — the values already live in the accessible ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * CONTROLLED synchronised hover key (FR-3). The key is the CATEGORY string.
     * When provided (string or null), the crosshair tracks this key instead of the
     * chart's internal pointer hover (null ⇒ nothing shown). Absent keeps the
     * legacy uncontrolled behaviour.
     */
    hoverKey?: string | null;
    /** Emitted when the user hovers a bar/point (its CATEGORY) or leaves (`null`). */
    onHoverKeyChange?: (key: string | null) => void;
    /**
     * FR-5 — keyboard navigation of the categories (roving tabindex). When `true`
     * (or implied by wiring `onSelectKey`), a focusable overlay of one column per
     * category is rendered: one tab stop, arrows move, Home/End jump, Enter/Space
     * select, Escape leaves. Absent ⇒ no overlay, rendering unchanged.
     */
    keyboardNav?: boolean;
    /** Emitted on Enter/Space (category) or `null` on Escape. */
    onSelectKey?: (key: string | null) => void;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type BarSegment = {
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    value: number;
    seriesLabel: string;
    category: string;
    si: number;
    gi: number;
    tone: string;
};
type LineSeriesGeom = {
    path: string;
    points: Array<{
        x: number;
        y: number;
        value: number;
        category: string;
        pi: number;
    }>;
    seriesLabel: string;
    hidden: boolean;
    tone: string;
    li: number;
};
type LegendItem = {
    key: string;
    label: string;
    tone: string;
    kind: "bar" | "line";
};
type DataLabelItem = {
    key: string;
    x: number;
    y: number;
    text: string;
    baseline: "middle" | "auto";
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
export declare class ComboChart {
    static readonly stComponentName = "ComboChart";
    readonly componentName = "ComboChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 52;
        readonly bottom: 32;
        readonly left: 52;
    };
    private navDatumElements?;
    private hovered;
    private focusedIndex;
    categories: string[];
    bars?: ComboChartBarSeries[];
    lines?: ComboChartLineSeries[];
    leftAxisLabel?: string;
    rightAxisLabel?: string;
    legend?: boolean;
    hiddenSeries?: string[];
    onToggleSeries?: (seriesId: string) => void;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get safeCategories(): string[];
    get hiddenSet(): Set<string>;
    get legendInteractive(): boolean;
    get showLegend(): boolean;
    get leftScale(): {
        ticks: number[];
        domainMin: number;
        domainMax: number;
    };
    get rightScale(): {
        ticks: number[];
        domainMin: number;
        domainMax: number;
    };
    bandCenter(i: number): number;
    private isPresent;
    get barGroups(): BarSegment[][];
    get lineSeriesGeom(): LineSeriesGeom[];
    get leftGridLines(): Array<{
        value: number;
        y: number;
    }>;
    get rightTickEntries(): Array<{
        value: number;
        y: number;
    }>;
    get legendItems(): LegendItem[];
    legendItemClass(item: LegendItem): string;
    get resolvedAnnotations(): ResolvedAnnotation[];
    get annotationRegions(): AnnotationRegion[];
    get annotationAbove(): AnnotationAbove[];
    annotationLineLabelX(a: AnnotationLine): number;
    annotationLineLabelY(a: AnnotationLine): number;
    annotationShapePoints(a: AnnotationShape): string;
    get dataLabelOpts(): import("./chartDataLabels.js").DataLabelsOptions;
    get barDataLabelItems(): DataLabelItem[];
    get lineDataLabelItems(): DataLabelItem[];
    get dataValueItems(): string[];
    get hoverKeys(): string[];
    get internalCategoryIndex(): number | null;
    get activeCategoryIndex(): number;
    get crosshairX(): number | null;
    get tooltip(): {
        cx: number;
        cy: number;
        label: string;
        value: number;
    } | null;
    get navEnabled(): boolean;
    private categorySummary;
    rovingTabIndexFor(index: number): number;
    datapointAriaLabelFor(ci: number): string;
    private emitHoverKey;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    handleDatapointFocus(index: number): void;
    private focusDatum;
    handleDatapointKeyDown(event: KeyboardEvent, index: number): void;
    formatTickLabel(value: number): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ComboChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ComboChart, "st-combo-chart", never, { "categories": { "alias": "categories"; "required": false; }; "bars": { "alias": "bars"; "required": false; }; "lines": { "alias": "lines"; "required": false; }; "leftAxisLabel": { "alias": "leftAxisLabel"; "required": false; }; "rightAxisLabel": { "alias": "rightAxisLabel"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "hiddenSeries": { "alias": "hiddenSeries"; "required": false; }; "onToggleSeries": { "alias": "onToggleSeries"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ComboChart.d.ts.map