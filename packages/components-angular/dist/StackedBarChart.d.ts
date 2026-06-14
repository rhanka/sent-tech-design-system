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
    static ɵfac: i0.ɵɵFactoryDeclaration<StackedBarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StackedBarChart, "st-stacked-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hiddenSeries": { "alias": "hiddenSeries"; "required": false; }; "onToggleSeries": { "alias": "onToggleSeries"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StackedBarChart.d.ts.map