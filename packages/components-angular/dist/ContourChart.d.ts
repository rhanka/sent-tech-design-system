import * as i0 from "@angular/core";
export type ContourChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ContourChartDatum = {
    x: number;
    y: number;
    value: number;
};
export type ContourChartProps = {
    data: ContourChartDatum[];
    levels?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class ContourChart {
    static readonly stComponentName = "ContourChart";
    readonly componentName = "ContourChart";
    data: ContourChartDatum[];
    levels?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContourChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContourChart, "st-contour-chart", never, { "data": { "alias": "data"; "required": false; }; "levels": { "alias": "levels"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ContourChart.d.ts.map