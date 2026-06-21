import * as i0 from "@angular/core";
export type RibbonChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type RibbonChartDatum = {
    category: string;
    period: string | number;
    value: number;
    tone?: RibbonChartTone;
};
export type RibbonChartProps = {
    data: RibbonChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type Segment = {
    key: string;
    category: string;
    value: number;
    tone: RibbonChartTone;
    x: number;
    segWidth: number;
    yTop: number;
    yBottom: number;
    cx: number;
    cy: number;
};
type Column = {
    period: string | number;
    index: number;
    cx: number;
    segments: Segment[];
};
type Ribbon = {
    key: string;
    category: string;
    tone: RibbonChartTone;
    d: string;
};
type LegendItem = {
    category: string;
    tone: RibbonChartTone;
};
export declare class RibbonChart {
    static readonly stComponentName = "RibbonChart";
    readonly componentName = "RibbonChart";
    hoveredKey: string | null;
    data: RibbonChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    get resolvedWidth(): number;
    get heightValue(): number;
    get periodLabelY(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): RibbonChartDatum[];
    get periodOrder(): (string | number)[];
    get categoryOrder(): string[];
    get explicitToneByCategory(): Map<string, RibbonChartTone>;
    toneOf(category: string): RibbonChartTone;
    get columns(): Column[];
    get ribbons(): Ribbon[];
    get legendItems(): LegendItem[];
    get hasLegend(): boolean;
    get dataValueItems(): string[];
    get hoveredSegment(): Segment | null;
    get tooltipLeft(): number;
    get tooltipTop(): number;
    ribbonClass(ribbon: Ribbon): string;
    segClass(seg: Segment): string;
    segHeight(seg: Segment): number;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RibbonChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RibbonChart, "st-ribbon-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=RibbonChart.d.ts.map