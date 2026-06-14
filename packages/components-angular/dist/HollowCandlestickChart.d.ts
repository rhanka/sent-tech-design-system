import * as i0 from "@angular/core";
export type HollowCandlestickChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
};
export type HollowCandlestickChartProps = {
    data: HollowCandlestickChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class HollowCandlestickChart {
    static readonly stComponentName = "HollowCandlestickChart";
    readonly componentName = "HollowCandlestickChart";
    data: HollowCandlestickChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HollowCandlestickChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HollowCandlestickChart, "st-hollow-candlestick-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=HollowCandlestickChart.d.ts.map