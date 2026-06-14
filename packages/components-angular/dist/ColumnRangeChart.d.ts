import * as i0 from "@angular/core";
export type ColumnRangeChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ColumnRangeChartDatum = {
    category: string;
    low: number;
    high: number;
    tone?: ColumnRangeChartTone;
};
export type ColumnRangeChartProps = {
    data: ColumnRangeChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
     * scale uses it instead of the data-derived min/max — letting several
     * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
     * scale falls back to the auto data range (unchanged).
     */
    domain?: [number, number];
    class?: string;
};
export declare class ColumnRangeChart {
    static readonly stComponentName = "ColumnRangeChart";
    readonly componentName = "ColumnRangeChart";
    data: ColumnRangeChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    domain?: [number, number];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnRangeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ColumnRangeChart, "st-column-range-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "label": { "alias": "label"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ColumnRangeChart.d.ts.map