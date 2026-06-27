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
type ValidSegment = {
    start: number;
    end: number;
    state: string | number;
    tone?: StateTimelineTone;
};
type ValidSeries = {
    series: string;
    segments: ValidSegment[];
};
type LaneSegment = {
    key: string;
    datum: ValidSegment;
    x: number;
    width: number;
    cx: number;
    tone: StateTimelineTone;
};
type Lane = {
    datum: ValidSeries;
    index: number;
    y: number;
    height: number;
    rowCenterY: number;
    segments: LaneSegment[];
};
export declare class StateTimelineChart {
    static readonly stComponentName = "StateTimelineChart";
    readonly componentName = "StateTimelineChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredKey: string | null;
    data: StateTimelineSeries[];
    label?: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): ValidSeries[];
    private get stateMaps();
    toneOf(segment: {
        state: string | number;
        tone?: StateTimelineTone;
    }): StateTimelineTone;
    get legendItems(): Array<{
        state: string;
        tone: StateTimelineTone;
    }>;
    get hasLegend(): boolean;
    private get domain();
    get ticks(): number[];
    xOf(value: number): number;
    get lanes(): Lane[];
    get dataValueItems(): string[];
    get hoveredSegment(): {
        lane: Lane;
        seg: LaneSegment;
    } | null;
    segmentClass(seg: LaneSegment): string;
    ellipsize(text: string, n: number): string;
    formatTick(value: number): string;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StateTimelineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StateTimelineChart, "st-state-timeline-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=StateTimelineChart.d.ts.map