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
type BarItem = {
    datum: DivergentBarChartDatum;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    sign: "positive" | "negative" | "zero";
    tone: DivergentBarChartTone;
};
type GridTick = {
    value: number;
    x: number;
};
export declare class DivergentBarChart {
    static readonly stComponentName = "DivergentBarChart";
    readonly componentName = "DivergentBarChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredIndex: number | null;
    data: DivergentBarChartDatum[];
    width?: number;
    height?: number;
    domain?: [number, number];
    format?: (value: number) => string;
    showLegend?: boolean;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): DivergentBarChartDatum[];
    get validDomain(): [number, number] | null;
    get scales(): {
        plotWidth: number;
        plotHeight: number;
        domainMin: number;
        domainMax: number;
        ticks: number[];
    };
    get bars(): BarItem[];
    get gridTicks(): GridTick[];
    get zeroAxisX(): number;
    get dataValueItems(): string[];
    private signFor;
    private toneFor;
    fmtTick(value: number): string;
    fmtValue(value: number): string;
    barClass(bar: BarItem): string;
    tooltipLeft(bar: BarItem): number;
    tooltipTop(bar: BarItem): number;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DivergentBarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DivergentBarChart, "st-divergent-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "format": { "alias": "format"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=DivergentBarChart.d.ts.map