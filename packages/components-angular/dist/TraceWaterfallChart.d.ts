import * as i0 from "@angular/core";
export type TraceSpan = {
    spanId: string;
    parentSpanId?: string | null;
    service: string;
    start: number;
    duration: number;
};
export type TraceWaterfallChartProps = {
    data: {
        spans: TraceSpan[];
    };
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type OrderedSpan = {
    span: TraceSpan;
    depth: number;
};
type BarItem = {
    span: TraceSpan;
    depth: number;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rowCenterY: number;
    cx: number;
    tone: string;
    indentX: number;
    indentWidth: number;
};
type TickItem = {
    value: number;
    x: number;
};
type LegendItem = {
    service: string;
    tone: string;
};
export declare class TraceWaterfallChart {
    static readonly stComponentName = "TraceWaterfallChart";
    readonly componentName = "TraceWaterfallChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredIndex: number | null;
    data: {
        spans: TraceSpan[];
    };
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validSpans(): TraceSpan[];
    get ordered(): OrderedSpan[];
    get serviceOrder(): string[];
    toneOf(service: string): string;
    get legendItems(): LegendItem[];
    get domainBounds(): {
        rawMin: number;
        rawMax: number;
    };
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    xOf(v: number): number;
    get tickItems(): TickItem[];
    get bars(): BarItem[];
    get hoveredBar(): BarItem | null;
    get dataValueItems(): string[];
    formatTickLabel(value: number): string;
    ellipsizeLabel(text: string, depth: number): string;
    barClass(bar: BarItem): string;
    tooltipLeft(bar: BarItem): number;
    tooltipTop(bar: BarItem): number;
    spanEnd(bar: BarItem): number;
    handlePointerMove(e: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TraceWaterfallChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TraceWaterfallChart, "st-trace-waterfall-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=TraceWaterfallChart.d.ts.map