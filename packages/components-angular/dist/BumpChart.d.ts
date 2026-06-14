import * as i0 from "@angular/core";
export type BumpChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type BumpChartSeries = {
    label: string;
    ranks: (number | null | undefined)[];
    tone?: BumpChartTone;
};
export type BumpChartProps = {
    data: BumpChartSeries[];
    categories: string[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class BumpChart {
    static readonly stComponentName = "BumpChart";
    readonly componentName = "BumpChart";
    data: BumpChartSeries[];
    categories: string[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BumpChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BumpChart, "st-bump-chart", never, { "data": { "alias": "data"; "required": false; }; "categories": { "alias": "categories"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=BumpChart.d.ts.map