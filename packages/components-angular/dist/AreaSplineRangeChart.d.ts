import * as i0 from "@angular/core";
export type AreaSplineRangeChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AreaSplineRangeChartDatum = {
    x: number | string;
    low: number;
    high: number;
};
export type AreaSplineRangeChartProps = {
    data: AreaSplineRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaSplineRangeChartTone;
    label: string;
    class?: string;
};
type AreaSplineRangePoint = {
    x: number;
    yLow: number;
    yHigh: number;
    datum: AreaSplineRangeChartDatum;
    range: {
        lo: number;
        hi: number;
    };
    index: number;
};
type GridLine = {
    value: number;
    y: number;
};
type XTick = {
    x: number;
    label: string;
};
export declare class AreaSplineRangeChart {
    static readonly stComponentName = "AreaSplineRangeChart";
    readonly componentName = "AreaSplineRangeChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 44;
    };
    hoveredIndex: number | null;
    data: AreaSplineRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaSplineRangeChartTone;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    readonly gradientId: string;
    private normalize;
    get validData(): AreaSplineRangeChartDatum[];
    get xDomain(): {
        kind: "numeric";
        min: number;
        max: number;
    } | {
        kind: "ordinal";
        values: (number | string)[];
    };
    get yTicks(): number[];
    get yDomain(): {
        min: number;
        max: number;
    };
    get points(): AreaSplineRangePoint[];
    private continuePath;
    get highPath(): string;
    get lowPath(): string;
    get areaPath(): string;
    get gridLines(): GridLine[];
    get xTickEntries(): XTick[];
    get dataValueItems(): string[];
    formatTickLabel(value: number): string;
    tooltipLeft(): number;
    tooltipTop(): number;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AreaSplineRangeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AreaSplineRangeChart, "st-area-spline-range-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=AreaSplineRangeChart.d.ts.map