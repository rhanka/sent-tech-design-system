import * as i0 from "@angular/core";
export type Density2DTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type Density2DChartScale = "categorical" | "sequential";
export type Density2DPoint = {
    x: number;
    y: number;
    weight?: number;
};
export type Density2DChartProps = {
    data: Density2DPoint[];
    bins?: number;
    scale?: Density2DChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type DensityBin = {
    key: string;
    density: number;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    tone: Density2DTone;
};
export declare class Density2DChart {
    static readonly stComponentName = "Density2DChart";
    readonly componentName = "Density2DChart";
    readonly margin: {
        readonly top: 16;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 48;
    };
    readonly tones: Density2DTone[];
    data: Density2DPoint[];
    bins?: number;
    scale?: Density2DChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    hoveredKey: string | null;
    get resolvedScale(): Density2DChartScale;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get viewBox(): string;
    get hostClass(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get binCount(): number;
    get validData(): Density2DPoint[];
    get xTicks(): number[];
    get yTicks(): number[];
    get xMin(): number;
    get xMax(): number;
    get yMin(): number;
    get yMax(): number;
    get layout(): {
        bins: DensityBin[];
        densityMax: number;
    };
    get binCells(): DensityBin[];
    get xAxisTicks(): Array<{
        value: number;
        x: number;
    }>;
    get yAxisTicks(): Array<{
        value: number;
        y: number;
    }>;
    get dataValueItems(): string[];
    get hasLegend(): boolean;
    get hoveredCell(): DensityBin | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    formatTick(value: number): string;
    cellClass(key: string, tone: Density2DTone): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Density2DChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Density2DChart, "st-density2-d-chart", never, { "data": { "alias": "data"; "required": false; }; "bins": { "alias": "bins"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=Density2DChart.d.ts.map