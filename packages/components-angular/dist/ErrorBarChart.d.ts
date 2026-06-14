import * as i0 from "@angular/core";
export type ErrorBarChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ErrorBarChartDatum = {
    category: string;
    value: number;
    low: number;
    high: number;
};
export type ErrorBarChartProps = {
    data: ErrorBarChartDatum[];
    width?: number;
    height?: number;
    tone?: ErrorBarChartTone;
    label: string;
    class?: string;
};
export declare class ErrorBarChart {
    static readonly stComponentName = "ErrorBarChart";
    readonly componentName = "ErrorBarChart";
    data: ErrorBarChartDatum[];
    width?: number;
    height?: number;
    tone?: ErrorBarChartTone;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ErrorBarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ErrorBarChart, "st-error-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ErrorBarChart.d.ts.map