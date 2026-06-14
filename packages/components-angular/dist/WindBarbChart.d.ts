import * as i0 from "@angular/core";
export type WindBarbChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type WindBarbChartDatum = {
    at: number;
    speed: number;
    direction: number;
};
export type WindBarbChartProps = {
    data: WindBarbChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class WindBarbChart {
    static readonly stComponentName = "WindBarbChart";
    readonly componentName = "WindBarbChart";
    data: WindBarbChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<WindBarbChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WindBarbChart, "st-wind-barb-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=WindBarbChart.d.ts.map