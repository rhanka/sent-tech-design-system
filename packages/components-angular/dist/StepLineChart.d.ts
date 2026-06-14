import * as i0 from "@angular/core";
export type StepLineChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StepLineChartDatum = {
    x: number | string;
    y: number;
};
export type StepLineChartProps = {
    data: StepLineChartDatum[];
    width?: number;
    height?: number;
    tone?: StepLineChartTone;
    label: string;
    class?: string;
};
export declare class StepLineChart {
    static readonly stComponentName = "StepLineChart";
    readonly componentName = "StepLineChart";
    data: StepLineChartDatum[];
    width?: number;
    height?: number;
    tone?: StepLineChartTone;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StepLineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StepLineChart, "st-step-line-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StepLineChart.d.ts.map