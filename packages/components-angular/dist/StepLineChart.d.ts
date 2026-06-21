import * as i0 from "@angular/core";
export type StepLineChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StepLineChartDatum = {
    x: number | string;
    y: number;
};
export type StepLineChartProps = {
    data: StepLineChartDatum[];
    width?: number;
    height?: number;
    tone?: StepLineChartTone;
    label: string;
    class?: string;
};
export declare class StepLineChart {
    static readonly stComponentName = "StepLineChart";
    readonly componentName = "StepLineChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    hoveredIndex: number | null;
    data: StepLineChartDatum[];
    width?: number;
    height?: number;
    tone?: StepLineChartTone;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get safeData(): StepLineChartDatum[];
    get xIsNumeric(): boolean;
    get xDomain(): {
        min: number;
        max: number;
    };
    get yValues(): number[];
    get yTicks(): number[];
    get yDomain(): {
        min: number;
        max: number;
    };
    xPixel(datum: StepLineChartDatum, index: number): number;
    yPixel(y: number): number;
    get points(): Array<{
        x: number;
        y: number;
        datum: StepLineChartDatum;
        index: number;
    }>;
    get stepPath(): string;
    get gridLines(): Array<{
        value: number;
        y: number;
    }>;
    get xTickEntries(): Array<{
        key: string;
        x: number;
        label: string;
    }>;
    get dataValueItems(): string[];
    formatTick(v: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StepLineChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StepLineChart, "st-step-line-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=StepLineChart.d.ts.map