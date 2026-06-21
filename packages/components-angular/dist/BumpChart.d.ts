import * as i0 from "@angular/core";
export type BumpChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type BumpChartSeries = {
    label: string;
    ranks: (number | null | undefined)[];
    tone?: BumpChartTone;
};
export type BumpChartProps = {
    data: BumpChartSeries[];
    categories: string[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
type SeriesPoint = {
    x: number;
    y: number;
} | null;
type ComputedSeries = {
    label: string;
    ranks: (number | null | undefined)[];
    tone: BumpChartTone;
    points: SeriesPoint[];
    index: number;
    path: string;
    alignedLength: number;
};
export declare class BumpChart {
    static readonly stComponentName = "BumpChart";
    readonly componentName = "BumpChart";
    readonly MARGIN_LEFT: 80;
    readonly MARGIN_RIGHT: 80;
    readonly MARGIN_TOP: 16;
    readonly MARGIN_BOTTOM: 32;
    hoveredIndex: number | null;
    data: BumpChartSeries[];
    categories: string[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get catCount(): number;
    get maxRank(): number;
    isValidRank(r: unknown): r is number;
    rankToY(rank: number): number;
    catToX(ci: number): number;
    buildBumpPath(points: SeriesPoint[]): string;
    get series(): ComputedSeries[];
    get rankTicks(): number[];
    get dataValueItems(): string[];
    lineClass(s: ComputedSeries): string;
    dotClass(s: ComputedSeries): string;
    lastValidPoint(s: ComputedSeries): {
        x: number;
        y: number;
    } | null;
    firstValidPoint(s: ComputedSeries): {
        x: number;
        y: number;
    } | null;
    validPointCount(s: ComputedSeries): number;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BumpChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BumpChart, "st-bump-chart", never, { "data": { "alias": "data"; "required": false; }; "categories": { "alias": "categories"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=BumpChart.d.ts.map