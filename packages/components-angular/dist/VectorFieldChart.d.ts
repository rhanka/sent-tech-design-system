import * as i0 from "@angular/core";
export type VectorFieldChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type VectorFieldChartDatum = {
    x: number;
    y: number;
    length: number;
    direction: number;
};
export type VectorFieldChartProps = {
    data: VectorFieldChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type VectorArrow = {
    key: string;
    datum: VectorFieldChartDatum;
    cx: number;
    cy: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    hx1: number;
    hy1: number;
    hx2: number;
    hy2: number;
    tone: VectorFieldChartTone;
};
export declare class VectorFieldChart {
    static readonly stComponentName = "VectorFieldChart";
    readonly componentName = "VectorFieldChart";
    readonly margin: {
        readonly top: 16;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 48;
    };
    data: VectorFieldChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    hoveredKey: string | null;
    get hostClass(): string;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get resolvedSize(): number;
    get viewBox(): string;
    get validData(): VectorFieldChartDatum[];
    get xTicks(): number[];
    get yTicks(): number[];
    get plotWidth(): number;
    get plotHeight(): number;
    get xMin(): number;
    get xMax(): number;
    get yMin(): number;
    get yMax(): number;
    get xAxisTicks(): Array<{
        value: number;
        x: number;
    }>;
    get yAxisTicks(): Array<{
        value: number;
        y: number;
    }>;
    get arrows(): VectorArrow[];
    get dataValueItems(): string[];
    get hoveredArrow(): VectorArrow | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    arrowClass(arrow: VectorArrow): string;
    format(value: number): string;
    private finitePositive;
    static ɵfac: i0.ɵɵFactoryDeclaration<VectorFieldChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VectorFieldChart, "st-vector-field-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=VectorFieldChart.d.ts.map