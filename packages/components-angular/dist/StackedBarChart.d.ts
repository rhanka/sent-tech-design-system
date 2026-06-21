import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type StackedBarTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StackedBarSegment = {
    label: string;
    value: number;
    tone?: StackedBarTone;
};
export type StackedBarDatum = {
    label: string;
    segments: StackedBarSegment[];
};
export type StackedBarChartProps = {
    data: StackedBarDatum[];
    width?: number;
    height?: number;
    label: string;
    showLegend?: boolean;
    /**
     * Per-segment value labels. `false`/absent (default) → none. `true` → each
     * segment's value with the chart's numeric formatter. Object → `format(value)`
     * and/or a `position` override (default `center` of the segment). Segments too
     * short to host a legible label are skipped. Labels are `aria-hidden` — the
     * values already live in the accessible ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    /**
     * Interactive legend (FR-4). Ids/labels of series hidden from the render
     * (controlled by the parent; default = all visible). Each segment whose
     * `label` ∈ `hiddenSeries` is omitted and its legend item is shown "off"
     * (`aria-pressed`). Undefined → legacy non-interactive legend, unless
     * `onToggleSeries` is provided.
     */
    hiddenSeries?: string[];
    /** Emitted on click / Enter / Space on a legend item. */
    onToggleSeries?: (seriesId: string) => void;
    class?: string;
};
export declare class StackedBarChart {
    static readonly stComponentName = "StackedBarChart";
    readonly componentName = "StackedBarChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    data: StackedBarDatum[];
    width?: number;
    height?: number;
    label: string;
    showLegend?: boolean;
    dataLabels?: DataLabelsProp;
    hiddenSeries?: string[];
    onToggleSeries?: (seriesId: string) => void;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get safeData(): StackedBarDatum[];
    get hiddenSet(): Set<string>;
    get legendInteractive(): boolean;
    get dlEnabled(): boolean;
    get segmentLabels(): string[];
    toneForLabel(label: string): StackedBarTone;
    get columnTotals(): number[];
    get totalMax(): number;
    get yTicks(): number[];
    get yDomain(): {
        min: number;
        max: number;
    };
    yPixel(y: number): number;
    get gridLines(): Array<{
        value: number;
        y: number;
    }>;
    get columns(): Array<{
        datum: StackedBarDatum;
        x: number;
        cx: number;
        width: number;
        segments: Array<{
            segLabel: string;
            value: number;
            tone: StackedBarTone;
            y: number;
            height: number;
        }>;
    }>;
    get legendItems(): Array<{
        label: string;
        tone: StackedBarTone;
    }>;
    get dataValueItems(): string[];
    formatTick(v: number): string;
    formatDataLabel(v: number): string;
    toggleSeries(label: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StackedBarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StackedBarChart, "st-stacked-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hiddenSeries": { "alias": "hiddenSeries"; "required": false; }; "onToggleSeries": { "alias": "onToggleSeries"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=StackedBarChart.d.ts.map