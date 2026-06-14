import * as i0 from "@angular/core";
export type FunnelChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type FunnelChartDatum = {
    label: string;
    value: number;
    tone?: FunnelChartTone;
};
export type FunnelChartProps = {
    data: FunnelChartDatum[];
    orientation?: "vertical" | "horizontal";
    showPercentages?: boolean;
    percentMode?: "ofFirst" | "ofPrevious";
    legend?: boolean;
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class FunnelChart {
    static readonly stComponentName = "FunnelChart";
    readonly componentName = "FunnelChart";
    data: FunnelChartDatum[];
    orientation?: "vertical" | "horizontal";
    showPercentages?: boolean;
    percentMode?: "ofFirst" | "ofPrevious";
    legend?: boolean;
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FunnelChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FunnelChart, "st-funnel-chart", never, { "data": { "alias": "data"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "showPercentages": { "alias": "showPercentages"; "required": false; }; "percentMode": { "alias": "percentMode"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=FunnelChart.d.ts.map