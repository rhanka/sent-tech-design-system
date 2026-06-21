import * as i0 from "@angular/core";
export type ColumnPyramidChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ColumnPyramidChartDatum = {
    category: string;
    value: number;
    tone?: ColumnPyramidChartTone;
};
export type ColumnPyramidChartProps = {
    data: ColumnPyramidChartDatum[];
    width?: number;
    height?: number;
    label: string;
    /** Default tone for columns whose datum has no `tone`. */
    tone?: ColumnPyramidChartTone;
    class?: string;
};
type Column = {
    datum: ColumnPyramidChartDatum;
    tone: ColumnPyramidChartTone;
    points: string;
    cx: number;
    cy: number;
    labelX: number;
    labelY: number;
    index: number;
};
type TickItem = {
    value: number;
    x1: number;
    x2: number;
    y: number;
};
export declare class ColumnPyramidChart {
    static readonly stComponentName = "ColumnPyramidChart";
    readonly componentName = "ColumnPyramidChart";
    readonly margin: {
        readonly top: 24;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 44;
    };
    private hoveredIndex;
    data: ColumnPyramidChartDatum[];
    width?: number;
    height?: number;
    label: string;
    tone?: ColumnPyramidChartTone;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get defaultTone(): ColumnPyramidChartTone;
    get validData(): ColumnPyramidChartDatum[];
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get valueAxisTicks(): TickItem[];
    get columns(): Column[];
    get dataValueItems(): string[];
    get hoveredColumn(): Column | null;
    columnClass(col: Column): string;
    formatTickLabel(value: number): string;
    tooltipLeftPct(col: Column): string;
    tooltipTopPct(col: Column): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnPyramidChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ColumnPyramidChart, "st-column-pyramid-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ColumnPyramidChart.d.ts.map