import * as i0 from "@angular/core";
export type ErrorBarChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ErrorBarChartDatum = {
    category: string;
    value: number;
    low: number;
    high: number;
};
export type ErrorBarChartProps = {
    data: ErrorBarChartDatum[];
    width?: number;
    height?: number;
    tone?: ErrorBarChartTone;
    label: string;
    class?: string;
};
type Row = {
    datum: ErrorBarChartDatum;
    range: {
        lo: number;
        mid: number;
        hi: number;
    };
    cy: number;
    xLow: number;
    xMid: number;
    xHigh: number;
    index: number;
};
export declare class ErrorBarChart {
    static readonly stComponentName = "ErrorBarChart";
    readonly componentName = "ErrorBarChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    readonly MARKER_RADIUS = 4;
    readonly CAP_HALF = 5;
    hoveredIndex: number | null;
    data: ErrorBarChartDatum[];
    width?: number;
    height?: number;
    tone?: ErrorBarChartTone;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get toneValue(): ErrorBarChartTone;
    get plotWidth(): number;
    get plotHeight(): number;
    private normalize;
    get validData(): ErrorBarChartDatum[];
    get xTicks(): number[];
    get xDomain(): {
        min: number;
        max: number;
    };
    get rows(): Row[];
    get gridLines(): Array<{
        value: number;
        x: number;
    }>;
    get legendEntries(): Array<{
        label: string;
        shape: "circle";
        tone: ErrorBarChartTone;
    }>;
    get dataValueItems(): string[];
    get hoveredRow(): Row | null;
    fmtTick(v: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ErrorBarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ErrorBarChart, "st-error-bar-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ErrorBarChart.d.ts.map