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
type Candle = {
    datum: HollowCandlestickChartDatum;
    index: number;
    up: boolean;
    hollow: boolean;
    centerX: number;
    bodyX: number;
    bodyY: number;
    bodyW: number;
    bodyH: number;
    wickHighY: number;
    wickLowY: number;
    tooltipY: number;
};
type GridItem = {
    tick: number;
    y: number;
};
export declare class HollowCandlestickChart {
    static readonly stComponentName = "HollowCandlestickChart";
    readonly componentName = "HollowCandlestickChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 52;
    };
    private hoveredIndex;
    data: HollowCandlestickChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): HollowCandlestickChartDatum[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get gridItems(): GridItem[];
    get candles(): Candle[];
    get dataValueItems(): string[];
    get hoveredCandle(): Candle | null;
    wickClass(c: Candle): string;
    candleClass(c: Candle): string;
    formatTickLabel(tick: number): string;
    tooltipLeftPct(c: Candle): string;
    tooltipTopPct(c: Candle): string;
    handlePointerMove(event: PointerEvent): void;
    handlePointerLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HollowCandlestickChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HollowCandlestickChart, "st-hollow-candlestick-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=HollowCandlestickChart.d.ts.map