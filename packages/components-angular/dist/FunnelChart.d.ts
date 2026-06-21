import * as i0 from "@angular/core";
export type FunnelChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type FunnelChartDatum = {
    label: string;
    value: number;
    tone?: FunnelChartTone;
};
export type FunnelChartProps = {
    data: FunnelChartDatum[];
    orientation?: "vertical" | "horizontal";
    showPercentages?: boolean;
    percentMode?: "ofFirst" | "ofPrevious";
    legend?: boolean;
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
type FunnelSegment = {
    points: string;
    datum: FunnelChartDatum;
    tone: FunnelChartTone;
    textColor: string;
    cx: number;
    cy: number;
    labelX: number;
    labelY: number;
    percent: number;
};
export declare class FunnelChart {
    static readonly stComponentName = "FunnelChart";
    readonly componentName = "FunnelChart";
    hoveredIndex: number | null;
    data: FunnelChartDatum[];
    orientation?: "vertical" | "horizontal";
    showPercentages?: boolean;
    percentMode?: "ofFirst" | "ofPrevious";
    legend?: boolean;
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get orientationValue(): "vertical" | "horizontal";
    get showPercentagesValue(): boolean;
    get percentModeValue(): "ofFirst" | "ofPrevious";
    get viewBox(): string;
    magnitude(v: number): number;
    formatPercent(p: number): string;
    get percents(): number[];
    get segments(): FunnelSegment[];
    get legendItems(): Array<{
        label: string;
        tone: FunnelChartTone;
    }>;
    get dataValueItems(): string[];
    segmentClass(i: number): string;
    tooltipLeft(seg: FunnelSegment): string;
    tooltipTop(seg: FunnelSegment): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FunnelChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FunnelChart, "st-funnel-chart", never, { "data": { "alias": "data"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "showPercentages": { "alias": "showPercentages"; "required": false; }; "percentMode": { "alias": "percentMode"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=FunnelChart.d.ts.map