import * as i0 from "@angular/core";
export type RoseChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type RoseChartDatum = {
    label: string;
    value: number;
    tone?: RoseChartTone;
};
export type RoseChartProps = {
    data: RoseChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class RoseChart {
    static readonly stComponentName = "RoseChart";
    readonly componentName = "RoseChart";
    data: RoseChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<RoseChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RoseChart, "st-rose-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=RoseChart.d.ts.map