import * as i0 from "@angular/core";
export type ColumnRangeChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ColumnRangeChartDatum = {
    category: string;
    low: number;
    high: number;
    tone?: ColumnRangeChartTone;
};
export type ColumnRangeChartProps = {
    data: ColumnRangeChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    /**
     * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
     * scale uses it instead of the data-derived min/max — letting several
     * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
     * scale falls back to the auto data range (unchanged).
     */
    domain?: [number, number];
    class?: string;
};
type NormalizedRange = {
    lo: number;
    hi: number;
};
type Bar = {
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    datum: ColumnRangeChartDatum;
    range: NormalizedRange;
    tone: ColumnRangeChartTone;
    index: number;
};
type TickItemVertical = {
    value: number;
    x1: number;
    x2: number;
    y: number;
    horizontal: false;
};
type TickItemHorizontal = {
    value: number;
    x: number;
    y1: number;
    y2: number;
    horizontal: true;
};
type TickItem = TickItemVertical | TickItemHorizontal;
export declare class ColumnRangeChart {
    static readonly stComponentName = "ColumnRangeChart";
    readonly componentName = "ColumnRangeChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 44;
    };
    private hoveredIndex;
    data: ColumnRangeChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    domain?: [number, number];
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get isVertical(): boolean;
    get plotWidth(): number;
    get plotHeight(): number;
    private normalize;
    get validDomain(): [number, number] | null;
    get validData(): ColumnRangeChartDatum[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    private valueFraction;
    get bars(): Bar[];
    get valueAxisTicks(): TickItem[];
    get dataValueItems(): string[];
    get hoveredBar(): Bar | null;
    barClass(bar: Bar): string;
    formatTickLabel(value: number): string;
    tooltipLeftPct(bar: Bar): string;
    tooltipTopPct(bar: Bar): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnRangeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ColumnRangeChart, "st-column-range-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "label": { "alias": "label"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ColumnRangeChart.d.ts.map