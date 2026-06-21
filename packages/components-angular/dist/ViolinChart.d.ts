import * as i0 from "@angular/core";
export type ViolinChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ViolinChartDatum = {
    label: string;
    values: number[];
    tone?: ViolinChartTone;
};
export type ViolinChartProps = {
    data: ViolinChartDatum[];
    bins?: number;
    quartiles?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type ViolinItem = {
    datum: ViolinChartDatum;
    tone: ViolinChartTone;
    cx: number;
    path: string;
    halfWidth: number;
    n: number;
    min: number;
    max: number;
    median: number;
    medianY: number;
    q1Y: number;
    q3Y: number;
    boxWidth: number;
};
export declare class ViolinChart {
    static readonly stComponentName = "ViolinChart";
    readonly componentName = "ViolinChart";
    hoveredIndex: number | null;
    readonly MARGIN_LEFT: number;
    readonly MARGIN_RIGHT: number;
    readonly MARGIN_TOP: number;
    readonly MARGIN_BOTTOM: number;
    data: ViolinChartDatum[];
    bins?: number;
    quartiles?: boolean;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get binCount(): number;
    get quartilesValue(): boolean;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    formatNumber(value: number): string;
    scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number;
    quantile(sorted: number[], q: number): number;
    get cleaned(): Array<{
        datum: ViolinChartDatum;
        index: number;
        finite: number[];
    }>;
    get domain(): {
        min: number;
        max: number;
    };
    get violins(): ViolinItem[];
    get dataValueItems(): string[];
    boxY(violin: ViolinItem): number;
    boxH(violin: ViolinItem): number;
    violinShapeClass(violin: ViolinItem, i: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ViolinChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViolinChart, "st-violin-chart", never, { "data": { "alias": "data"; "required": false; }; "bins": { "alias": "bins"; "required": false; }; "quartiles": { "alias": "quartiles"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ViolinChart.d.ts.map