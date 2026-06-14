import * as i0 from "@angular/core";
export type HeatmapChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type HeatmapChartDatum = {
    x: string;
    y: string;
    value: number;
    tone?: HeatmapChartTone;
};
export type HeatmapChartProps = {
    data: HeatmapChartDatum[];
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    class?: string;
};
export declare class HeatmapChart {
    static readonly stComponentName = "HeatmapChart";
    readonly componentName = "HeatmapChart";
    data: HeatmapChartDatum[];
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeatmapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HeatmapChart, "st-heatmap-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=HeatmapChart.d.ts.map