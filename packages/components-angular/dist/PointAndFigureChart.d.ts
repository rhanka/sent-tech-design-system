import * as i0 from "@angular/core";
export type PointAndFigureChartMark = "x" | "o";
export type PointAndFigureChartDatum = {
    date: number;
    close: number;
};
export type PointAndFigureChartProps = {
    data: PointAndFigureChartDatum[];
    boxSize?: number;
    reversal?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type RawColumn = {
    mark: PointAndFigureChartMark;
    low: number;
    high: number;
};
type PnfColumn = RawColumn & {
    priceLow: number;
    priceHigh: number;
};
type PnfMark = {
    key: string;
    mark: PointAndFigureChartMark;
    cx: number;
    cy: number;
    r: number;
    priceLow: number;
    priceHigh: number;
};
export declare class PointAndFigureChart {
    static readonly stComponentName = "PointAndFigureChart";
    readonly componentName = "PointAndFigureChart";
    readonly margin: {
        readonly top: 16;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 52;
    };
    data: PointAndFigureChartDatum[];
    boxSize?: number;
    reversal?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    hoveredKey: string | null;
    get hostClass(): string;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get viewBox(): string;
    get validData(): PointAndFigureChartDatum[];
    get closes(): number[];
    get baseMin(): number;
    get effectiveBox(): number;
    get reversalBoxes(): number;
    get rawColumns(): RawColumn[];
    get pnfColumns(): PnfColumn[];
    get priceMin(): number;
    get priceMax(): number;
    get yTicks(): number[];
    get yMin(): number;
    get yMax(): number;
    get plotWidth(): number;
    get plotHeight(): number;
    get yAxisTicks(): Array<{
        value: number;
        y: number;
    }>;
    get marks(): PnfMark[];
    get dataValueItems(): string[];
    get hoveredMark(): PnfMark | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    markClass(mark: PnfMark): string;
    format(value: number): string;
    private finitePositive;
    static ɵfac: i0.ɵɵFactoryDeclaration<PointAndFigureChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PointAndFigureChart, "st-point-and-figure-chart", never, { "data": { "alias": "data"; "required": false; }; "boxSize": { "alias": "boxSize"; "required": false; }; "reversal": { "alias": "reversal"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=PointAndFigureChart.d.ts.map