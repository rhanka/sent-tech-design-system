import * as i0 from "@angular/core";
export type CalendarHeatmapChartScale = "categorical" | "sequential";
export type CalendarHeatmapChartDatum = {
    date: string;
    value: number;
};
type CalendarHeatmapTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
type CalendarHeatmapCell = {
    date: string;
    value: number | null;
    tone: CalendarHeatmapTone | null;
    x: number;
    y: number;
    w: number;
    h: number;
};
export type CalendarHeatmapChartProps = {
    data: CalendarHeatmapChartDatum[];
    label: string;
    scale?: CalendarHeatmapChartScale;
    width?: number;
    height?: number;
    class?: string;
};
export declare class CalendarHeatmapChart {
    static readonly stComponentName = "CalendarHeatmapChart";
    readonly componentName = "CalendarHeatmapChart";
    readonly margin: {
        readonly top: 24;
        readonly right: 8;
        readonly bottom: 8;
        readonly left: 24;
    };
    readonly visibleDayLabels: {
        label: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
        index: number;
    }[];
    data: CalendarHeatmapChartDatum[];
    label: string;
    scale?: CalendarHeatmapChartScale;
    width?: number;
    height?: number;
    classInput?: string;
    hoveredDate: string | null;
    get resolvedScale(): CalendarHeatmapChartScale;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get viewBox(): string;
    get hostClass(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get grid(): {
        cells: CalendarHeatmapCell[];
        weeks: number;
        monthLabels: Array<{
            label: string;
            x: number;
        }>;
    };
    get dataValueItems(): string[];
    get hoveredCell(): CalendarHeatmapCell | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    cellClass(cell: CalendarHeatmapCell): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarHeatmapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarHeatmapChart, "st-calendar-heatmap-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=CalendarHeatmapChart.d.ts.map