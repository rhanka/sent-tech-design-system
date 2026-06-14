import * as i0 from "@angular/core";
export type AreaSplineRangeChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AreaSplineRangeChartDatum = {
    x: number | string;
    low: number;
    high: number;
};
export type AreaSplineRangeChartProps = {
    data: AreaSplineRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaSplineRangeChartTone;
    label: string;
    class?: string;
};
export declare class AreaSplineRangeChart {
    static readonly stComponentName = "AreaSplineRangeChart";
    readonly componentName = "AreaSplineRangeChart";
    data: AreaSplineRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaSplineRangeChartTone;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AreaSplineRangeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AreaSplineRangeChart, "st-area-spline-range-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AreaSplineRangeChart.d.ts.map