import * as i0 from "@angular/core";
export type AnomalySwimLaneTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AnomalySwimLaneBucket = {
    at: number;
    score: number;
};
export type AnomalySwimLaneSeries = {
    job: string;
    buckets: AnomalySwimLaneBucket[];
};
export type AnomalySwimLaneChartProps = {
    data: AnomalySwimLaneSeries[];
    max?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class AnomalySwimLaneChart {
    static readonly stComponentName = "AnomalySwimLaneChart";
    readonly componentName = "AnomalySwimLaneChart";
    data: AnomalySwimLaneSeries[];
    max?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AnomalySwimLaneChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AnomalySwimLaneChart, "st-anomaly-swim-lane-chart", never, { "data": { "alias": "data"; "required": false; }; "max": { "alias": "max"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AnomalySwimLaneChart.d.ts.map