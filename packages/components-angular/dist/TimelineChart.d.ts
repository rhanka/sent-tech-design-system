import * as i0 from "@angular/core";
export type TimelineChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type TimelineChartEvent = {
    /** Point on the axis (year, day index, ordinal step…). */
    position: number;
    /** Required short label, shown above/below the marker (alternated). */
    label: string;
    /** Optional longer description, surfaced in the accessible list + tooltip. */
    description?: string;
    /** Optional explicit categorical tone; otherwise cycles category1..8. */
    tone?: TimelineChartTone;
};
export type TimelineChartProps = {
    data: TimelineChartEvent[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
type Marker = {
    index: number;
    event: TimelineChartEvent;
    x: number;
    labelY: number;
    above: boolean;
    tone: TimelineChartTone;
};
export declare class TimelineChart {
    static readonly stComponentName = "TimelineChart";
    readonly componentName = "TimelineChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredIndex: number | null;
    data: TimelineChartEvent[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get safeData(): TimelineChartEvent[];
    get axisY(): number;
    get xDomain(): {
        min: number;
        max: number;
    };
    xOf(position: number): number;
    toneForIndex(event: TimelineChartEvent, index: number): TimelineChartTone;
    get markers(): Marker[];
    get hoveredMarker(): Marker | null;
    get dataValueItems(): string[];
    tooltipLeft(marker: Marker): number;
    handlePointerMove(e: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TimelineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TimelineChart, "st-timeline-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=TimelineChart.d.ts.map