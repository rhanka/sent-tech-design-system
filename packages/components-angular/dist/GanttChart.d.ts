import * as i0 from "@angular/core";
export type GanttChartTask = {
    task: string;
    start: number;
    end: number;
    category?: string;
};
export type GanttChartProps = {
    data: GanttChartTask[];
    label: string;
    width?: number;
    height?: number;
    marker?: number;
    class?: string;
};
export declare class GanttChart {
    static readonly stComponentName = "GanttChart";
    readonly componentName = "GanttChart";
    data: GanttChartTask[];
    label: string;
    width?: number;
    height?: number;
    marker?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<GanttChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GanttChart, "st-gantt-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "marker": { "alias": "marker"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=GanttChart.d.ts.map