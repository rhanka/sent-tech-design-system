import * as i0 from "@angular/core";
export type ParetoChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ParetoChartDatum = {
    label: string;
    value: number;
    tone?: ParetoChartTone;
};
export type ParetoChartProps = {
    data: ParetoChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type ParetoEntry = {
    datum: ParetoChartDatum;
    tone: ParetoChartTone;
    x: number;
    y: number;
    width: number;
    height: number;
    cumPercent: number;
    cx: number;
    cy: number;
    index: number;
};
export declare class ParetoChart {
    static readonly stComponentName = "ParetoChart";
    readonly componentName = "ParetoChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    readonly dotRadius = 4;
    hoveredIndex: number | null;
    data: ParetoChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get sortedData(): ParetoChartDatum[];
    get total(): number;
    get scales(): {
        ticks: number[];
        domainMin: number;
        domainMax: number;
        plotWidth: number;
        plotHeight: number;
    };
    get entries(): ParetoEntry[];
    get cumulativePath(): string;
    get dataValueItems(): string[];
    get valueAxisTicks(): {
        value: number;
        x1: number;
        x2: number;
        y: number;
    }[];
    get percentAxisTicks(): {
        value: number;
        y: number;
    }[];
    barClass(e: ParetoEntry): string;
    fmtTick(v: number): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ParetoChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ParetoChart, "st-pareto-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ParetoChart.d.ts.map