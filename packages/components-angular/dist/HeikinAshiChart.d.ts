import * as i0 from "@angular/core";
export type HeikinAshiChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
};
export type HeikinAshiChartProps = {
    data: HeikinAshiChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class HeikinAshiChart {
    static readonly stComponentName = "HeikinAshiChart";
    readonly componentName = "HeikinAshiChart";
    data: HeikinAshiChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeikinAshiChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HeikinAshiChart, "st-heikin-ashi-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=HeikinAshiChart.d.ts.map