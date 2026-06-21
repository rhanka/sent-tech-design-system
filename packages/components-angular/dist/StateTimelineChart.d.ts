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
    get safeData(): StateTimelineSeries[];
    get xDomain(): {
        min: number;
        max: number;
    };
    xOf(value: number): number;
    get stateOrderMap(): Map<string, number>;
    toneForSegment(seg: StateTimelineSegment): StateTimelineTone;
    get lanes(): Array<{
        seriesLabel: string;
        centerY: number;
        rects: Array<{
            key: string;
            x: number;
            y: number;
            width: number;
            height: number;
            tone: StateTimelineTone;
            state: string;
            start: number;
            end: number;
            seriesLabel: string;
        }>;
    }>;
    get allRects(): {
        key: string;
        x: number;
        y: number;
        width: number;
        height: number;
        tone: StateTimelineTone;
        state: string;
        start: number;
        end: number;
        seriesLabel: string;
    }[];
    get hoveredRect(): {
        key: string;
        x: number;
        y: number;
        width: number;
        height: number;
        tone: StateTimelineTone;
        state: string;
        start: number;
        end: number;
        seriesLabel: string;
    } | null;
    get legendItems(): Array<{
        state: string;
        tone: StateTimelineTone;
    }>;
    get dataValueItems(): string[];
    ellipsize(text: string, n: number): string;
    handlePointerMove(e: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StateTimelineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StateTimelineChart, "st-state-timeline-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=StateTimelineChart.d.ts.map