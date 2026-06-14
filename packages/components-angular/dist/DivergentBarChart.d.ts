import * as i0 from "@angular/core";
export type DivergentBarChartTone = "positive" | "negative" | "neutral";
export type DivergentBarChartDatum = {
    label: string;
    value: number;
    tone?: DivergentBarChartTone;
};
export type DivergentBarChartProps = {
    data: DivergentBarChartDatum[];
    width?: number;
    height?: number;
    domain?: [number, number];
    format?: (value: number) => string;
    showLegend?: boolean;
    label: string;
    class?: string;
};
export declare class DivergentBarChart {
    static readonly stComponentName = "DivergentBarChart";
    readonly componentName = "DivergentBarChart";
    data: DivergentBarChartDatum[];
    width?: number;
    height?: number;
    domain?: [number, number];
    format?: (value: number) => string;
    showLegend?: boolean;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DivergentBarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DivergentBarChart, "st-divergent-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "format": { "alias": "format"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DivergentBarChart.d.ts.map