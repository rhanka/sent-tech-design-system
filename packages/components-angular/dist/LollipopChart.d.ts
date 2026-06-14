import * as i0 from "@angular/core";
export type LollipopChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type LollipopChartDatum = {
    label: string;
    value: number;
    tone?: LollipopChartTone;
};
export type LollipopChartProps = {
    data: LollipopChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
     * scale uses it instead of the data-derived min/max — letting several
     * LollipopCharts in a grid share one scale. When absent or invalid, the scale
     * falls back to the auto data range (unchanged).
     */
    domain?: [number, number];
    class?: string;
};
export declare class LollipopChart {
    static readonly stComponentName = "LollipopChart";
    readonly componentName = "LollipopChart";
    data: LollipopChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    domain?: [number, number];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<LollipopChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LollipopChart, "st-lollipop-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "label": { "alias": "label"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=LollipopChart.d.ts.map