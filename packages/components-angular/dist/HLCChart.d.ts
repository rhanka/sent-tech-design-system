import * as i0 from "@angular/core";
export type HLCChartDatum = {
    label: string;
    high: number;
    low: number;
    close: number;
};
export type HLCChartProps = {
    data: HLCChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class HLCChart {
    static readonly stComponentName = "HLCChart";
    readonly componentName = "HLCChart";
    data: HLCChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HLCChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HLCChart, "st-hlc-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=HLCChart.d.ts.map