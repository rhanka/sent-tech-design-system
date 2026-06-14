import * as i0 from "@angular/core";
export type CalendarHeatmapChartDatum = {
    date: string;
    value: number;
};
export type CalendarHeatmapChartProps = {
    data: CalendarHeatmapChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class CalendarHeatmapChart {
    static readonly stComponentName = "CalendarHeatmapChart";
    readonly componentName = "CalendarHeatmapChart";
    data: CalendarHeatmapChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarHeatmapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarHeatmapChart, "st-calendar-heatmap-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=CalendarHeatmapChart.d.ts.map