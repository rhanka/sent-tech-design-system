import * as i0 from "@angular/core";
export type StatusHistoryTone = "neutral" | "info" | "success" | "warning" | "error" | "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StatusHistoryBucket = {
    at: number;
    value: string | number;
    tone?: StatusHistoryTone;
};
export type StatusHistorySeries = {
    series: string;
    buckets: StatusHistoryBucket[];
};
export type StatusHistoryChartProps = {
    data: StatusHistorySeries[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class StatusHistoryChart {
    static readonly stComponentName = "StatusHistoryChart";
    readonly componentName = "StatusHistoryChart";
    data: StatusHistorySeries[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StatusHistoryChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StatusHistoryChart, "st-status-history-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StatusHistoryChart.d.ts.map