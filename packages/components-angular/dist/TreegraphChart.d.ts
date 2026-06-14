import * as i0 from "@angular/core";
export type TreegraphChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type TreegraphChartNode = {
    id: string;
    parentId?: string | null;
    label: string;
    tone?: TreegraphChartTone;
};
export type TreegraphChartProps = {
    data: TreegraphChartNode[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class TreegraphChart {
    static readonly stComponentName = "TreegraphChart";
    readonly componentName = "TreegraphChart";
    data: TreegraphChartNode[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TreegraphChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TreegraphChart, "st-treegraph-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TreegraphChart.d.ts.map