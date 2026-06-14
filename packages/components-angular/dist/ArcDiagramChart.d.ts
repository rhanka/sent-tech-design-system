import * as i0 from "@angular/core";
export type ArcDiagramChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ArcDiagramChartLink = {
    from: string;
    to: string;
    weight: number;
};
export type ArcDiagramChartProps = {
    data: ArcDiagramChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class ArcDiagramChart {
    static readonly stComponentName = "ArcDiagramChart";
    readonly componentName = "ArcDiagramChart";
    data: ArcDiagramChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ArcDiagramChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ArcDiagramChart, "st-arc-diagram-chart", never, { "data": { "alias": "data"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ArcDiagramChart.d.ts.map