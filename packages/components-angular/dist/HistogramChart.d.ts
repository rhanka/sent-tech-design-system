import * as i0 from "@angular/core";
export type HistogramChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type HistogramChartBin = {
    label: string;
    value: number;
    tone?: HistogramChartTone;
};
export type HistogramChartDatum = number | HistogramChartBin;
export type HistogramChartProps = {
    data: HistogramChartDatum[];
    bins?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type NormalizedBin = {
    label: string;
    value: number;
    tone: HistogramChartTone;
};
type BarItem = {
    bin: NormalizedBin;
    x: number;
    y: number;
    width: number;
    height: number;
    labelX: number;
};
export declare class HistogramChart {
    static readonly stComponentName = "HistogramChart";
    readonly componentName = "HistogramChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredIndex: number | null;
    data: HistogramChartDatum[];
    bins?: number;
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
    private isNumberArray;
    private formatNumber;
    private buildNumericBins;
    get normalizedBins(): NormalizedBin[];
    get bars(): BarItem[];
    get dataValueItems(): string[];
    barClass(bar: BarItem, i: number): string;
    tooltipLeft(bar: BarItem): number;
    tooltipTop(bar: BarItem): number;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HistogramChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HistogramChart, "st-histogram-chart", never, { "data": { "alias": "data"; "required": false; }; "bins": { "alias": "bins"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=HistogramChart.d.ts.map