import * as i0 from "@angular/core";
export type LollipopChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type LollipopChartDatum = {
    label: string;
    value: number;
    tone?: LollipopChartTone;
};
export type LollipopChartProps = {
    data: LollipopChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    domain?: [number, number];
    class?: string;
};
type Lollipop = {
    datum: LollipopChartDatum;
    tone: LollipopChartTone;
    stemX1: number;
    stemY1: number;
    stemX2: number;
    stemY2: number;
    cx: number;
    cy: number;
    labelX: number;
    labelY: number;
};
type TickItem = {
    value: number;
    x1?: number;
    x2?: number;
    y?: number;
    x?: number;
    y1?: number;
    y2?: number;
};
export declare class LollipopChart {
    static readonly stComponentName = "LollipopChart";
    readonly componentName = "LollipopChart";
    readonly MARGIN: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    readonly DOT_RADIUS = 5;
    hoveredIndex: number | null;
    data: LollipopChartDatum[];
    width?: number;
    height?: number;
    orientation?: "vertical" | "horizontal";
    label: string;
    domain?: [number, number];
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get isVertical(): boolean;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): LollipopChartDatum[];
    get validDomain(): [number, number] | null;
    get scales(): {
        ticks: number[];
        domainMin: number;
        domainMax: number;
    };
    get lollipops(): Lollipop[];
    get valueAxisTicks(): TickItem[];
    get dataValueItems(): string[];
    get hoveredLollipop(): Lollipop | null;
    fmtTick(v: number): string;
    contrastText(tone: LollipopChartTone): string;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LollipopChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LollipopChart, "st-lollipop-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "label": { "alias": "label"; "required": false; }; "domain": { "alias": "domain"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=LollipopChart.d.ts.map