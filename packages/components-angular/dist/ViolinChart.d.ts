import * as i0 from "@angular/core";
export type ViolinChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ViolinChartDatum = {
    label: string;
    values: number[];
    tone?: ViolinChartTone;
};
export type ViolinChartProps = {
    data: ViolinChartDatum[];
    bins?: number;
    quartiles?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class ViolinChart {
    static readonly stComponentName = "ViolinChart";
    readonly componentName = "ViolinChart";
    data: ViolinChartDatum[];
    bins?: number;
    quartiles?: boolean;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ViolinChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViolinChart, "st-violin-chart", never, { "data": { "alias": "data"; "required": false; }; "bins": { "alias": "bins"; "required": false; }; "quartiles": { "alias": "quartiles"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ViolinChart.d.ts.map