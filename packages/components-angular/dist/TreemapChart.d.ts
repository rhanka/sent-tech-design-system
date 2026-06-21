import * as i0 from "@angular/core";
export type TreemapChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type TreemapChartDatum = {
    label: string;
    value: number;
    tone?: TreemapChartTone;
    children?: TreemapChartDatum[];
};
export type TreemapTiling = "squarified";
export type TreemapChartProps = {
    data: TreemapChartDatum[];
    tiling?: TreemapTiling;
    showLabels?: boolean;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};
type Cell = {
    datum: TreemapChartDatum;
    value: number;
    tone: TreemapChartTone;
    textColor: string;
    rect: Rect;
    parentLabel?: string;
    depth: number;
};
export declare class TreemapChart {
    static readonly stComponentName = "TreemapChart";
    readonly componentName = "TreemapChart";
    data: TreemapChartDatum[];
    tiling?: TreemapTiling;
    showLabels?: boolean;
    legend?: boolean;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    hoveredIndex: number | null;
    readonly LABEL_MIN_W = 44;
    readonly LABEL_MIN_H = 22;
    readonly VALUE_MIN_H = 38;
    private readonly clipPrefix;
    get widthValue(): number;
    get heightValue(): number;
    get showLabelsValue(): boolean;
    get hostClass(): string;
    private leafValue;
    private sumValue;
    private squarify;
    private inset;
    get cells(): Cell[];
    get legendItems(): {
        label: string;
        tone: TreemapChartTone;
    }[];
    get dataValueItems(): string[];
    cellKey(cell: Cell): string;
    clipId(index: number): string;
    rectClass(cell: Cell, index: number): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    tooltipLabel(): string;
    tooltipValue(): number | string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TreemapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TreemapChart, "st-treemap-chart", never, { "data": { "alias": "data"; "required": false; }; "tiling": { "alias": "tiling"; "required": false; }; "showLabels": { "alias": "showLabels"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=TreemapChart.d.ts.map