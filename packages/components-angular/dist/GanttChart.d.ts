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
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredIndex: number | null;
    data: GanttChartTask[];
    label: string;
    width?: number;
    height?: number;
    marker?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get safeData(): GanttChartTask[];
    get domainBounds(): {
        rawMin: number;
        rawMax: number;
    };
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    xOf(value: number): number;
    fmtTick(v: number): string;
    ellipsize(text: string, n: number): string;
    get categoryList(): string[];
    get hasCategories(): boolean;
    toneForCategory(category: string | undefined): string;
    get bars(): Array<{
        datum: GanttChartTask;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        rowCenterY: number;
        tone: string;
    }>;
    barClass(bar: {
        index: number;
        tone: string;
    }): string;
    get hoveredBar(): {
        datum: GanttChartTask;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        rowCenterY: number;
        tone: string;
    } | null;
    get markerGeom(): {
        x: number;
    } | null;
    get legendItems(): Array<{
        category: string;
        tone: string;
    }>;
    get dataValueItems(): string[];
    tooltipLeft(bar: {
        x: number;
        width: number;
    }): number;
    tooltipTop(bar: {
        rowCenterY: number;
    }): number;
    handlePointerMove(e: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GanttChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GanttChart, "st-gantt-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "marker": { "alias": "marker"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=GanttChart.d.ts.map