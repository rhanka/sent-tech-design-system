import * as i0 from "@angular/core";
export type StateTimelineTone = "neutral" | "info" | "success" | "warning" | "error" | "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StateTimelineSegment = {
    start: number;
    end: number;
    state: string | number;
    tone?: StateTimelineTone;
};
export type StateTimelineSeries = {
    series: string;
    segments: StateTimelineSegment[];
};
export type StateTimelineChartProps = {
    data: StateTimelineSeries[];
    label?: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class StateTimelineChart {
    static readonly stComponentName = "StateTimelineChart";
    readonly componentName = "StateTimelineChart";
    data: StateTimelineSeries[];
    label?: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StateTimelineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StateTimelineChart, "st-state-timeline-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StateTimelineChart.d.ts.map