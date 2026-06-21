import * as i0 from "@angular/core";
export type ParallelCoordinatesChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ParallelAxis = {
    key: string;
    label: string;
    min?: number;
    max?: number;
};
export type ParallelCoordinatesChartProps = {
    axes: ParallelAxis[];
    data: Record<string, unknown>[];
    label: string;
    tones?: ParallelCoordinatesChartTone[];
    width?: number;
    height?: number;
    class?: string;
};
type LineGeom = {
    path: string;
    tone: ParallelCoordinatesChartTone;
    index: number;
};
type AxisGeom = {
    key: string;
    label: string;
    ax: number;
    domainMin: number;
    domainMax: number;
};
export declare class ParallelCoordinatesChart {
    static readonly stComponentName = "ParallelCoordinatesChart";
    readonly componentName = "ParallelCoordinatesChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    private hoveredIndex;
    axes: ParallelAxis[];
    data: Record<string, unknown>[];
    label: string;
    tones?: ParallelCoordinatesChartTone[];
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    private axisDomain;
    private axisXPositions;
    private parseStrictFinite;
    private buildPathWithGaps;
    get lines(): LineGeom[];
    get axisGeoms(): AxisGeom[];
    get dataValueItems(): string[];
    lineClass(line: LineGeom): string;
    fmtTick(v: number): string;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ParallelCoordinatesChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ParallelCoordinatesChart, "st-parallel-coordinates-chart", never, { "axes": { "alias": "axes"; "required": false; }; "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "tones": { "alias": "tones"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ParallelCoordinatesChart.d.ts.map