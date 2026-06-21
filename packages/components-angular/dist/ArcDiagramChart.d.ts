import * as i0 from "@angular/core";
export type ArcDiagramChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ArcDiagramChartLink = {
    from: string;
    to: string;
    weight: number;
};
export type ArcDiagramChartProps = {
    data: ArcDiagramChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type NodeDatum = {
    id: string;
    tone: ArcDiagramChartTone;
    x: number;
    r: number;
    value: number;
};
type ArcDatum = {
    index: number;
    from: string;
    to: string;
    weight: number;
    tone: ArcDiagramChartTone;
    strokeWidth: number;
    path: string;
    midX: number;
    midY: number;
};
type LegendEntry = {
    label: string;
    tone: ArcDiagramChartTone;
};
type Layout = {
    baselineY: number;
    nodes: NodeDatum[];
    arcs: ArcDatum[];
    nodeX: Map<string, number>;
};
export declare class ArcDiagramChart {
    static readonly stComponentName = "ArcDiagramChart";
    readonly componentName = "ArcDiagramChart";
    readonly MARGIN_X = 24;
    private hoveredLinkIndex;
    data: ArcDiagramChartLink[];
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
    get legendEntries(): LegendEntry[];
    get dataValueItems(): string[];
    get hoveredArc(): ArcDatum | null;
    arcClass(arc: ArcDatum): string;
    nodeClass(node: NodeDatum): string;
    legendSwatchClass(entry: LegendEntry): string;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ArcDiagramChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ArcDiagramChart, "st-arc-diagram-chart", never, { "data": { "alias": "data"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ArcDiagramChart.d.ts.map