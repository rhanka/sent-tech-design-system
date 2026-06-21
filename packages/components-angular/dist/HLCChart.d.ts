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
type HLCBar = {
    datum: HLCChartDatum;
    index: number;
    bullish: boolean;
    centerX: number;
    barHighY: number;
    barLowY: number;
    closeY: number;
    closeX: number;
    tooltipY: number;
};
type GridItem = {
    tick: number;
    y: number;
};
export declare class HLCChart {
    static readonly stComponentName = "HLCChart";
    readonly componentName = "HLCChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 52;
    };
    private hoveredIndex;
    data: HLCChartDatum[];
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
    get validData(): HLCChartDatum[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get gridItems(): GridItem[];
    get bars(): HLCBar[];
    get dataValueItems(): string[];
    get hoveredBar(): HLCBar | null;
    barGroupClass(b: HLCBar): string;
    formatTickLabel(tick: number): string;
    tooltipLeftPct(b: HLCBar): string;
    tooltipTopPct(b: HLCBar): string;
    handlePointerMove(event: PointerEvent): void;
    handlePointerLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HLCChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HLCChart, "st-hlc-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=HLCChart.d.ts.map