import * as i0_1 from "@angular/core";
export type DependencyWheelChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type DependencyWheelChartLink = {
    from: string;
    to: string;
    weight: number;
};
export type DependencyWheelChartProps = {
    data: DependencyWheelChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type ArcItem = {
    id: string;
    tone: DependencyWheelChartTone;
    value: number;
    span: number;
    path: string;
    labelX: number;
    labelY: number;
    textColor: string;
};
type RibbonItem = {
    index: number;
    from: string;
    to: string;
    weight: number;
    tone: DependencyWheelChartTone;
    strokeWidth: number;
    path: string;
    midX: number;
    midY: number;
};
type LegendEntry = {
    label: string;
    tone: DependencyWheelChartTone;
};
type Layout = {
    cx: number;
    cy: number;
    inner: number;
    outer: number;
    arcs: ArcItem[];
    ribbons: RibbonItem[];
    legend: LegendEntry[];
};
export declare class DependencyWheelChart {
    static readonly stComponentName = "DependencyWheelChart";
    readonly componentName = "DependencyWheelChart";
    private hoveredLinkIndex;
    data: DependencyWheelChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    displayLabel(id: string): string;
    get layout(): Layout;
    get dataValueItems(): string[];
    get hoveredRibbon(): RibbonItem | null;
    ribbonClass(ribbon: RibbonItem): string;
    arcSegmentClass(arc: ArcItem): string;
    legendSwatchClass(entry: LegendEntry): string;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0_1.ɵɵFactoryDeclaration<DependencyWheelChart, never>;
    static ɵcmp: i0_1.ɵɵComponentDeclaration<DependencyWheelChart, "st-dependency-wheel-chart", never, { "data": { "alias": "data"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=DependencyWheelChart.d.ts.map