import * as i0 from "@angular/core";
export type TreemapChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type TreemapChartDatum = {
    label: string;
    value: number;
    tone?: TreemapChartTone;
    children?: TreemapChartDatum[];
};
export type TreemapTiling = "squarified";
export type TreemapChartProps = {
    data: TreemapChartDatum[];
    tiling?: TreemapTiling;
    showLabels?: boolean;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class TreemapChart {
    static readonly stComponentName = "TreemapChart";
    readonly componentName = "TreemapChart";
    data: TreemapChartDatum[];
    tiling?: TreemapTiling;
    showLabels?: boolean;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TreemapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TreemapChart, "st-treemap-chart", never, { "data": { "alias": "data"; "required": false; }; "tiling": { "alias": "tiling"; "required": false; }; "showLabels": { "alias": "showLabels"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TreemapChart.d.ts.map