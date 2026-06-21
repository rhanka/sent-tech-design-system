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
type HACandle = {
    label: string;
    haOpen: number;
    haHigh: number;
    haLow: number;
    haClose: number;
};
type Candle = {
    datum: HACandle;
    index: number;
    bullish: boolean;
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
export declare class HeikinAshiChart {
    static readonly stComponentName = "HeikinAshiChart";
    readonly componentName = "HeikinAshiChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 52;
    };
    private hoveredIndex;
    data: HeikinAshiChartDatum[];
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
    get validData(): HeikinAshiChartDatum[];
    get haData(): HACandle[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get gridItems(): GridItem[];
    get candles(): Candle[];
    get dataValueItems(): string[];
    get hoveredCandle(): Candle | null;
    wickClass(c: Candle): string;
    bodyClass(c: Candle): string;
    formatTickLabel(tick: number): string;
    fmtTooltip(v: number): string;
    tooltipLeftPct(c: Candle): string;
    tooltipTopPct(c: Candle): string;
    handlePointerMove(event: PointerEvent): void;
    handlePointerLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeikinAshiChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HeikinAshiChart, "st-heikin-ashi-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=HeikinAshiChart.d.ts.map