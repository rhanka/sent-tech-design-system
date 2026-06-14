import * as i0 from "@angular/core";
export type TraceSpan = {
    spanId: string;
    parentSpanId?: string | null;
    service: string;
    start: number;
    duration: number;
};
export type TraceWaterfallChartProps = {
    data: {
        spans: TraceSpan[];
    };
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class TraceWaterfallChart {
    static readonly stComponentName = "TraceWaterfallChart";
    readonly componentName = "TraceWaterfallChart";
    data: {
        spans: TraceSpan[];
    };
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TraceWaterfallChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TraceWaterfallChart, "st-trace-waterfall-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TraceWaterfallChart.d.ts.map