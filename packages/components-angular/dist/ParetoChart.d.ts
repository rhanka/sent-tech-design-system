import * as i0 from "@angular/core";
export type ParetoChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ParetoChartDatum = {
    label: string;
    value: number;
    tone?: ParetoChartTone;
};
export type ParetoChartProps = {
    data: ParetoChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class ParetoChart {
    static readonly stComponentName = "ParetoChart";
    readonly componentName = "ParetoChart";
    data: ParetoChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ParetoChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ParetoChart, "st-pareto-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ParetoChart.d.ts.map