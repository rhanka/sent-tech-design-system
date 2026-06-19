import * as i0 from "@angular/core";
export type AnomalySwimLaneTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AnomalySwimLaneChartScale = "categorical" | "sequential";
export type AnomalySwimLaneBucket = {
    at: number;
    score: number;
};
export type AnomalySwimLaneSeries = {
    job: string;
    buckets: AnomalySwimLaneBucket[];
};
export type AnomalySwimLaneChartProps = {
    data: AnomalySwimLaneSeries[];
    max?: number;
    scale?: AnomalySwimLaneChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type AnomalyRowCell = {
    key: string;
    datum: AnomalySwimLaneBucket;
    x: number;
    width: number;
    cx: number;
    tone: AnomalySwimLaneTone;
};
type AnomalyRow = {
    datum: AnomalySwimLaneSeries;
    index: number;
    y: number;
    height: number;
    rowCenterY: number;
    cells: AnomalyRowCell[];
};
export declare class AnomalySwimLaneChart {
    static readonly stComponentName = "AnomalySwimLaneChart";
    readonly componentName = "AnomalySwimLaneChart";
    readonly margin: {
        readonly top: 28;
        readonly right: 18;
        readonly bottom: 44;
        readonly left: 132;
    };
    readonly tones: AnomalySwimLaneTone[];
    data: AnomalySwimLaneSeries[];
    max?: number;
    scale?: AnomalySwimLaneChartScale;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    hoveredKey: string | null;
    get resolvedScale(): AnomalySwimLaneChartScale;
    get resolvedWidth(): number;
    get resolvedHeight(): number;
    get viewBox(): string;
    get hostClass(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): AnomalySwimLaneSeries[];
    get columnOrder(): number[];
    get scoreMax(): number;
    get rows(): AnomalyRow[];
    get columns(): Array<{
        at: number;
        cx: number;
    }>;
    get dataValueItems(): string[];
    get hasLegend(): boolean;
    get hoveredCell(): {
        row: AnomalyRow;
        cell: AnomalyRowCell;
    } | null;
    get tooltipLeft(): string;
    get tooltipTop(): string;
    get tooltipLabel(): string;
    get tooltipValue(): string;
    ellipsize(text: string, maxChars: number): string;
    formatTick(value: number): string;
    cellClass(key: string, tone: AnomalySwimLaneTone): string;
    handlePointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AnomalySwimLaneChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AnomalySwimLaneChart, "st-anomaly-swim-lane-chart", never, { "data": { "alias": "data"; "required": false; }; "max": { "alias": "max"; "required": false; }; "scale": { "alias": "scale"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=AnomalySwimLaneChart.d.ts.map