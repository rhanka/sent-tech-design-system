import * as i0 from "@angular/core";
export type MarimekkoChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type MarimekkoChartSegment = {
    label: string;
    value: number;
    tone?: MarimekkoChartTone;
};
export type MarimekkoChartDatum = {
    label: string;
    width: number;
    segments: MarimekkoChartSegment[];
};
export type MarimekkoChartProps = {
    data: MarimekkoChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
type CellGeom = {
    key: string;
    catLabel: string;
    segLabel: string;
    tone: MarimekkoChartTone;
    x: number;
    y: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
    pct: number;
    colPct: number;
    textColor: string;
    showLabel: boolean;
};
type CatLabel = {
    label: string;
    x: number;
};
export declare class MarimekkoChart {
    static readonly stComponentName = "MarimekkoChart";
    readonly componentName = "MarimekkoChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    private hoveredKey;
    data: MarimekkoChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get totalWidth(): number;
    get cells(): CellGeom[];
    get catLabels(): CatLabel[];
    get dataValueItems(): string[];
    get hoveredCell(): CellGeom | null;
    cellClass(cell: CellGeom): string;
    cellPct(value: number): number;
    tooltipLeft(): string;
    tooltipTop(): string;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarimekkoChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MarimekkoChart, "st-marimekko-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=MarimekkoChart.d.ts.map