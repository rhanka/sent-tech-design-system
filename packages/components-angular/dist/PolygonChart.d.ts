import * as i0 from "@angular/core";
export type PolygonChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type PolygonChartPoint = {
    x: number;
    y: number;
};
export type PolygonChartProps = {
    data: PolygonChartPoint[];
    label: string;
    tone?: PolygonChartTone;
    width?: number;
    height?: number;
    class?: string;
};
export declare class PolygonChart {
    static readonly stComponentName = "PolygonChart";
    readonly componentName = "PolygonChart";
    data: PolygonChartPoint[];
    label: string;
    tone?: PolygonChartTone;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<PolygonChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PolygonChart, "st-polygon-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=PolygonChart.d.ts.map