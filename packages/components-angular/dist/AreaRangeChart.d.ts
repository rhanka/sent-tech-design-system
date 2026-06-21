import * as i0 from "@angular/core";
export type AreaRangeChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AreaRangeChartDatum = {
    x: number | string;
    low: number;
    high: number;
};
export type AreaRangeChartProps = {
    data: AreaRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaRangeChartTone;
    smooth?: boolean;
    label: string;
    class?: string;
};
type AreaRangePoint = {
    x: number;
    yLow: number;
    yHigh: number;
    datum: AreaRangeChartDatum;
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
export declare class AreaRangeChart {
    static readonly stComponentName = "AreaRangeChart";
    readonly componentName = "AreaRangeChart";
    readonly margin: {
        readonly top: 12;
        readonly right: 16;
        readonly bottom: 32;
        readonly left: 44;
    };
    hoveredIndex: number | null;
    data: AreaRangeChartDatum[];
    width?: number;
    height?: number;
    tone?: AreaRangeChartTone;
    smooth?: boolean;
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
    get validData(): AreaRangeChartDatum[];
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
    get points(): AreaRangePoint[];
    private buildPath;
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
    static ɵfac: i0.ɵɵFactoryDeclaration<AreaRangeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AreaRangeChart, "st-area-range-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=AreaRangeChart.d.ts.map