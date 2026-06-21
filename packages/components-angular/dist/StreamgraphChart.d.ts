import * as i0 from "@angular/core";
export type StreamgraphChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StreamgraphChartSeriesValue = {
    label: string;
    value: number;
    tone?: StreamgraphChartTone;
};
export type StreamgraphChartDatum = {
    category: string;
    values: StreamgraphChartSeriesValue[];
};
export type StreamgraphChartProps = {
    data: StreamgraphChartDatum[];
    width?: number;
    height?: number;
    label: string;
    smooth?: boolean;
    showLegend?: boolean;
    class?: string;
};
type SeriesEntry = {
    seriesLabel: string;
    tone: StreamgraphChartTone;
};
type AreaItem = {
    tone: StreamgraphChartTone;
    seriesLabel: string;
    d: string;
};
type XTick = {
    x: number;
    label: string;
};
type TooltipData = {
    label: string;
    value: number;
    cx: number;
    cy: number;
};
export declare class StreamgraphChart {
    static readonly stComponentName = "StreamgraphChart";
    readonly componentName = "StreamgraphChart";
    readonly MARGIN_LEFT: number;
    readonly MARGIN_RIGHT: number;
    readonly MARGIN_BOTTOM: number;
    hovered: number | null;
    data: StreamgraphChartDatum[];
    width?: number;
    height?: number;
    label: string;
    smooth?: boolean;
    showLegend?: boolean;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get smoothValue(): boolean;
    get showLegendValue(): boolean;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    private safeV;
    get series(): SeriesEntry[];
    get halfMax(): number;
    private computeBands;
    private computeXs;
    get areas(): AreaItem[];
    get xTickEntries(): XTick[];
    get dataValueItems(): string[];
    get tooltip(): TooltipData | null;
    get tooltipLeftPct(): number;
    get tooltipTopPct(): number;
    areaClass(area: AreaItem, si: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StreamgraphChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StreamgraphChart, "st-streamgraph-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=StreamgraphChart.d.ts.map