import * as i0 from "@angular/core";
export type WindBarbChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type WindBarbChartDatum = {
    at: number;
    speed: number;
    direction: number;
};
export type WindBarbChartProps = {
    data: WindBarbChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type BarbTick = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    kind: "full" | "half" | "flag1" | "flag2";
};
type WindBarb = {
    key: string;
    datum: WindBarbChartDatum;
    cx: number;
    cy: number;
    tipX: number;
    tipY: number;
    ticks: BarbTick[];
    tone: WindBarbChartTone;
};
export declare class WindBarbChart {
    static readonly stComponentName = "WindBarbChart";
    readonly componentName = "WindBarbChart";
    readonly margin: {
        readonly top: 16;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 24;
    };
    data: WindBarbChartDatum[];
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
    get validData(): WindBarbChartDatum[];
    get xTicks(): number[];
    get plotWidth(): number;
    get xMin(): number;
    get xMax(): number;
    get baseY(): number;
    get xAxisTicks(): Array<{
        value: number;
        x: number;
    }>;
    get barbs(): WindBarb[];
    get dataValueItems(): string[];
    get hoveredBarb(): WindBarb | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    barbClass(barb: WindBarb): string;
    featherClass(tick: BarbTick): string;
    format(value: number): string;
    private finitePositive;
    static ɵfac: i0.ɵɵFactoryDeclaration<WindBarbChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WindBarbChart, "st-wind-barb-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=WindBarbChart.d.ts.map