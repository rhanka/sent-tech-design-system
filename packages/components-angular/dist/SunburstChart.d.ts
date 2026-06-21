import * as i0 from "@angular/core";
export type SunburstChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type SunburstChartDatum = {
    label: string;
    value?: number;
    tone?: SunburstChartTone;
    children?: SunburstChartDatum[];
};
export type SunburstChartProps = {
    data: SunburstChartDatum;
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    class?: string;
};
type ArcDatum = {
    datum: SunburstChartDatum;
    pathLabel: string[];
    value: number;
    tone: SunburstChartTone;
    depth: number;
    start: number;
    end: number;
    path: string;
    labelX: number;
    labelY: number;
};
export declare class SunburstChart {
    static readonly stComponentName = "SunburstChart";
    readonly componentName = "SunburstChart";
    data: SunburstChartDatum;
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    classInput?: string;
    hoveredIndex: number | null;
    get widthValue(): number;
    get heightValue(): number;
    get hostClass(): string;
    private leafValue;
    private sumValue;
    private maxDepth;
    private pt;
    private buildArcPath;
    get arcs(): ArcDatum[];
    get leafItems(): string[];
    get legendItems(): {
        label: string;
        tone: SunburstChartTone;
    }[];
    arcKey(arc: ArcDatum): string;
    arcClass(arc: ArcDatum, index: number): string;
    contrastText(tone: SunburstChartTone): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    tooltipLabel(): string;
    tooltipValue(): number | string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SunburstChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SunburstChart, "st-sunburst-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=SunburstChart.d.ts.map