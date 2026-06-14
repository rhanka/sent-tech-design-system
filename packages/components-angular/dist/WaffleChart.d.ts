import * as i0 from "@angular/core";
export type WaffleTone = "neutral" | "info" | "success" | "warning" | "error" | "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type WaffleChartDatum = {
    label: string;
    value: number;
    tone?: WaffleTone;
};
export type WaffleChartProps = {
    data: WaffleChartDatum[];
    totalCells?: number;
    columns?: number;
    label?: string;
    size?: number;
    class?: string;
};
export declare class WaffleChart {
    static readonly stComponentName = "WaffleChart";
    readonly componentName = "WaffleChart";
    data: WaffleChartDatum[];
    totalCells?: number;
    columns?: number;
    label?: string;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<WaffleChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WaffleChart, "st-waffle-chart", never, { "data": { "alias": "data"; "required": false; }; "totalCells": { "alias": "totalCells"; "required": false; }; "columns": { "alias": "columns"; "required": false; }; "label": { "alias": "label"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=WaffleChart.d.ts.map