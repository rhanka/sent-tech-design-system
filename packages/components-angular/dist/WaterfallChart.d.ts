import * as i0 from "@angular/core";
export type WaterfallType = "increase" | "decrease" | "total";
export type WaterfallChartDatum = {
    label: string;
    value: number;
    type?: WaterfallType;
};
export type WaterfallChartProps = {
    data: WaterfallChartDatum[];
    width?: number;
    height?: number;
    connectors?: boolean;
    format?: (value: number) => string;
    label: string;
    class?: string;
};
type ComputedBar = {
    datum: WaterfallChartDatum;
    type: WaterfallType;
    start: number;
    end: number;
    displayValue: number;
    cumulative: number;
};
type WaterfallBarGeom = {
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
    type: WaterfallType;
    datum: WaterfallChartDatum;
    displayValue: number;
    cumulative: number;
    index: number;
};
type ConnectorLine = {
    x1: number;
    x2: number;
    y: number;
};
type ValueAxisTick = {
    value: number;
    x1: number;
    x2: number;
    y: number;
};
export declare class WaterfallChart {
    static readonly stComponentName = "WaterfallChart";
    readonly componentName = "WaterfallChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    readonly legendItems: {
        type: WaterfallType;
        label: string;
    }[];
    hoveredIndex: number | null;
    data: WaterfallChartDatum[];
    width?: number;
    height?: number;
    connectors?: boolean;
    format?: (value: number) => string;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get connectorsValue(): boolean;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get computed(): ComputedBar[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get bars(): WaterfallBarGeom[];
    get connectorLines(): ConnectorLine[];
    get valueAxisTicks(): ValueAxisTick[];
    get zeroY(): number;
    get dataValueItems(): string[];
    formatTickLabel(value: number): string;
    formatValue(v: number): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WaterfallChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WaterfallChart, "st-waterfall-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "connectors": { "alias": "connectors"; "required": false; }; "format": { "alias": "format"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=WaterfallChart.d.ts.map