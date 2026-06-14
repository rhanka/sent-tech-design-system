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
export declare class HistogramChart {
    static readonly stComponentName = "HistogramChart";
    readonly componentName = "HistogramChart";
    data: HistogramChartDatum[];
    bins?: number;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HistogramChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HistogramChart, "st-histogram-chart", never, { "data": { "alias": "data"; "required": false; }; "bins": { "alias": "bins"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=HistogramChart.d.ts.map