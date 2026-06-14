import * as i0 from "@angular/core";
export type ColumnPyramidChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ColumnPyramidChartDatum = {
    category: string;
    value: number;
    tone?: ColumnPyramidChartTone;
};
export type ColumnPyramidChartProps = {
    data: ColumnPyramidChartDatum[];
    width?: number;
    height?: number;
    label: string;
    /** Default tone for columns whose datum has no `tone`. */
    tone?: ColumnPyramidChartTone;
    class?: string;
};
export declare class ColumnPyramidChart {
    static readonly stComponentName = "ColumnPyramidChart";
    readonly componentName = "ColumnPyramidChart";
    data: ColumnPyramidChartDatum[];
    width?: number;
    height?: number;
    label: string;
    tone?: ColumnPyramidChartTone;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnPyramidChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ColumnPyramidChart, "st-column-pyramid-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ColumnPyramidChart.d.ts.map