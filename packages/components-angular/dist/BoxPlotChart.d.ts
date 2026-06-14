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
export declare class BoxPlotChart {
    static readonly stComponentName = "BoxPlotChart";
    readonly componentName = "BoxPlotChart";
    data: BoxPlotChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BoxPlotChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BoxPlotChart, "st-box-plot-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=BoxPlotChart.d.ts.map