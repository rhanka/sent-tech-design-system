import * as i0 from "@angular/core";
export type StatusHistoryTone = "neutral" | "info" | "success" | "warning" | "error" | "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StatusHistoryBucket = {
    at: number;
    value: string | number;
    tone?: StatusHistoryTone;
};
export type StatusHistorySeries = {
    series: string;
    buckets: StatusHistoryBucket[];
};
export type StatusHistoryChartProps = {
    data: StatusHistorySeries[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type ValidBucket = {
    at: number;
    value: string | number;
    tone?: StatusHistoryTone;
};
type ValidRow = {
    series: string;
    buckets: ValidBucket[];
};
type CellItem = {
    key: string;
    datum: ValidBucket;
    x: number;
    width: number;
    cx: number;
    tone: StatusHistoryTone;
};
type RowItem = {
    datum: ValidRow;
    index: number;
    y: number;
    height: number;
    rowCenterY: number;
    cells: CellItem[];
};
type ColumnItem = {
    at: number;
    cx: number;
};
type LegendItem = {
    value: string;
    tone: StatusHistoryTone;
};
export declare class StatusHistoryChart {
    static readonly stComponentName = "StatusHistoryChart";
    readonly componentName = "StatusHistoryChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredKey: string | null;
    data: StatusHistorySeries[];
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
    get validData(): ValidRow[];
    get columnOrder(): number[];
    get statusOrder(): string[];
    get explicitToneByStatus(): Map<string, StatusHistoryTone>;
    toneOf(bucket: {
        value: string | number;
        tone?: StatusHistoryTone;
    }): StatusHistoryTone;
    get legendItems(): LegendItem[];
    get rows(): RowItem[];
    get columnItems(): ColumnItem[];
    get hoveredCell(): {
        row: RowItem;
        cell: CellItem;
    } | null;
    get dataValueItems(): string[];
    formatAtLabel(at: number): string;
    ellipsizeLabel(text: string): string;
    cellClass(cell: CellItem): string;
    tooltipLeft(cell: CellItem): number;
    tooltipTop(row: RowItem): number;
    handlePointerMove(e: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StatusHistoryChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StatusHistoryChart, "st-status-history-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=StatusHistoryChart.d.ts.map