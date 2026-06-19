import * as i0 from "@angular/core";
export type HeatmapChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type HeatmapChartScale = "categorical" | "sequential";
export type HeatmapChartDatum = {
    x: string;
    y: string;
    value: number;
    tone?: HeatmapChartTone;
};
export type HeatmapChartProps = {
    data: HeatmapChartDatum[];
    width?: number;
    height?: number;
    scale?: HeatmapChartScale;
    legend?: boolean;
    label: string;
    class?: string;
};
type HeatmapCell = {
    datum: HeatmapChartDatum;
    tone: HeatmapChartTone;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
};
export declare class HeatmapChart {
    static readonly stComponentName = "HeatmapChart";
    readonly componentName = "HeatmapChart";
    readonly margin: {
        readonly top: 28;
        readonly right: 18;
        readonly bottom: 44;
        readonly left: 64;
    };
    readonly tones: HeatmapChartTone[];
    data: HeatmapChartDatum[];
    width?: number;
    height?: number;
    scale?: HeatmapChartScale;
    legend?: boolean;
    label: string;
    classInput?: string;
    hoveredIndex: number | null;
    get resolvedScale(): HeatmapChartScale;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get viewBox(): string;
    get hostClass(): string;
    get xLabels(): string[];
    get yLabels(): string[];
    get plotWidth(): number;
    get plotHeight(): number;
    get cells(): HeatmapCell[];
    get dataValueItems(): string[];
    get hoveredCell(): HeatmapCell | undefined;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    maxCount(value: number): number;
    cellClass(index: number, tone: HeatmapChartTone): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeatmapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HeatmapChart, "st-heatmap-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=HeatmapChart.d.ts.map