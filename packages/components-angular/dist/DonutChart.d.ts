import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type DonutChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type DonutChartDatum = {
    label: string;
    value: number;
    tone?: DonutChartTone;
};
export type DonutChartProps = {
    data: DonutChartDatum[];
    size?: number;
    thickness?: number;
    centerLabel?: string | null;
    /**
     * Per-slice value labels. `false`/absent (default) → none. `true` → each slice's
     * value with the default formatter. Object → `format(value)` and/or a `position`
     * override (default `center` of the arc). Slices too thin to fit a legible label
     * are skipped. Labels are `aria-hidden` — the values already live in the
     * accessible ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    label: string;
    class?: string;
};
type SliceItem = {
    datum: DonutChartDatum;
    path: string;
    tone: DonutChartTone;
    pct: number;
    spanDeg: number;
    labelX: number;
    labelY: number;
};
export declare class DonutChart {
    static readonly stComponentName = "DonutChart";
    readonly componentName = "DonutChart";
    data: DonutChartDatum[];
    size?: number;
    thickness?: number;
    centerLabel?: string | null;
    dataLabels?: DataLabelsProp;
    label: string;
    classInput?: string;
    hoveredIndex: number | null;
    get hostClass(): string;
    get sizeValue(): number;
    get thicknessValue(): number;
    get viewBox(): string;
    get slices(): {
        total: number;
        items: SliceItem[];
    };
    sliceClass(slice: SliceItem, i: number): string;
    fmtPct(p: number): string;
    get dataValueItems(): string[];
    get dataLabelItems(): Array<{
        key: string;
        x: number;
        y: number;
        text: string;
    }>;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DonutChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DonutChart, "st-donut-chart", never, { "data": { "alias": "data"; "required": false; }; "size": { "alias": "size"; "required": false; }; "thickness": { "alias": "thickness"; "required": false; }; "centerLabel": { "alias": "centerLabel"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=DonutChart.d.ts.map