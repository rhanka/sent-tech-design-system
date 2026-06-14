import * as i0 from "@angular/core";
export type AreaRangeChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AreaRangeChartDatum = {
    x: number | string;
    low: number;
    high: number;
};
export type AreaRangeChartProps = {
    data: AreaRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaRangeChartTone;
    smooth?: boolean;
    label: string;
    class?: string;
};
export declare class AreaRangeChart {
    static readonly stComponentName = "AreaRangeChart";
    readonly componentName = "AreaRangeChart";
    data: AreaRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaRangeChartTone;
    smooth?: boolean;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AreaRangeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AreaRangeChart, "st-area-range-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AreaRangeChart.d.ts.map