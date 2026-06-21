import * as i0 from "@angular/core";
export type BoxPlotChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type BoxPlotChartDatum = {
    label: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers?: number[];
    tone?: BoxPlotChartTone;
};
export type BoxPlotChartProps = {
    data: BoxPlotChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type BoxPlot = {
    datum: BoxPlotChartDatum;
    tone: BoxPlotChartTone;
    cx: number;
    boxX: number;
    boxY: number;
    boxWidth: number;
    boxHeight: number;
    medianY: number;
    minY: number;
    maxY: number;
    capWidth: number;
    outliers: Array<{
        value: number;
        y: number;
    }>;
};
export declare class BoxPlotChart {
    static readonly stComponentName = "BoxPlotChart";
    readonly componentName = "BoxPlotChart";
    readonly MARGIN_LEFT: 48;
    readonly MARGIN_RIGHT: 20;
    readonly MARGIN_TOP: 16;
    readonly MARGIN_BOTTOM: 38;
    hoveredIndex: number | null;
    data: BoxPlotChartDatum[];
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
    formatNumber(value: number): string;
    scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number;
    get domain(): {
        min: number;
        max: number;
    };
    get plots(): BoxPlot[];
    get dataValueItems(): string[];
    boxClass(plot: BoxPlot, i: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BoxPlotChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BoxPlotChart, "st-box-plot-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=BoxPlotChart.d.ts.map