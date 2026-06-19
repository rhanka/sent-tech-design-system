import * as i0 from "@angular/core";
export type ContourChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ContourChartScale = "categorical" | "sequential";
export type ContourChartDatum = {
    x: number;
    y: number;
    value: number;
};
export type ContourChartProps = {
    data: ContourChartDatum[];
    levels?: number;
    scale?: ContourChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type ContourCell = {
    key: string;
    datum: ContourChartDatum;
    band: number;
    col: number;
    row: number;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    tone: ContourChartTone;
};
type ContourSegment = {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
export declare class ContourChart {
    static readonly stComponentName = "ContourChart";
    readonly componentName = "ContourChart";
    readonly margin: {
        readonly top: 16;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 48;
    };
    data: ContourChartDatum[];
    levels?: number;
    scale?: ContourChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    hoveredKey: string | null;
    get resolvedScale(): ContourChartScale;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get viewBox(): string;
    get hostClass(): string;
    get validData(): ContourChartDatum[];
    get levelCount(): number;
    get valueMin(): number;
    get valueMax(): number;
    get xValues(): number[];
    get yValues(): number[];
    get xTicks(): number[];
    get yTicks(): number[];
    get plotWidth(): number;
    get plotHeight(): number;
    get xMin(): number;
    get xMax(): number;
    get yMin(): number;
    get yMax(): number;
    get dx(): number;
    get dy(): number;
    toneForBand(band: number): ContourChartTone;
    bandOf(value: number): {
        band: number;
        tone: ContourChartTone;
    };
    get cells(): ContourCell[];
    get contourSegments(): ContourSegment[];
    get xAxisTicks(): Array<{
        value: number;
        x: number;
    }>;
    get yAxisTicks(): Array<{
        value: number;
        y: number;
    }>;
    get legendItems(): Array<{
        band: number;
        tone: ContourChartTone;
    }>;
    get hasLegend(): boolean;
    get dataValueItems(): string[];
    get hoveredCell(): ContourCell | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    formatTick(value: number): string;
    cellClass(key: string, tone: ContourChartTone): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContourChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContourChart, "st-contour-chart", never, { "data": { "alias": "data"; "required": false; }; "levels": { "alias": "levels"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ContourChart.d.ts.map