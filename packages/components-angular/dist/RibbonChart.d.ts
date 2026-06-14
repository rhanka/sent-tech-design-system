import * as i0 from "@angular/core";
export type RibbonChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type RibbonChartDatum = {
    category: string;
    period: string | number;
    value: number;
    tone?: RibbonChartTone;
};
export type RibbonChartProps = {
    data: RibbonChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class RibbonChart {
    static readonly stComponentName = "RibbonChart";
    readonly componentName = "RibbonChart";
    data: RibbonChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<RibbonChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RibbonChart, "st-ribbon-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=RibbonChart.d.ts.map