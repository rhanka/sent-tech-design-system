import * as i0 from "@angular/core";
export type RenkoChartDirection = "up" | "down";
export type RenkoChartDatum = {
    date: number;
    close: number;
};
export type RenkoChartProps = {
    data: RenkoChartDatum[];
    boxSize?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type RenkoBrick = {
    bottom: number;
    top: number;
    direction: RenkoChartDirection;
};
type RenkoColumn = {
    key: string;
    brick: RenkoBrick;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    direction: RenkoChartDirection;
};
export declare class RenkoChart {
    static readonly stComponentName = "RenkoChart";
    readonly componentName = "RenkoChart";
    readonly margin: {
        readonly top: 16;
        readonly right: 18;
        readonly bottom: 36;
        readonly left: 52;
    };
    data: RenkoChartDatum[];
    boxSize?: number;
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
    get validData(): RenkoChartDatum[];
    get closes(): number[];
    get effectiveBox(): number;
    get bricks(): RenkoBrick[];
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
    get columns(): RenkoColumn[];
    get dataValueItems(): string[];
    get hoveredColumn(): RenkoColumn | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    brickClass(column: RenkoColumn): string;
    format(value: number): string;
    private finitePositive;
    static ɵfac: i0.ɵɵFactoryDeclaration<RenkoChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RenkoChart, "st-renko-chart", never, { "data": { "alias": "data"; "required": false; }; "boxSize": { "alias": "boxSize"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=RenkoChart.d.ts.map