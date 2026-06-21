import * as i0 from "@angular/core";
export type DecompositionTreeNode = {
    label: string;
    value: number;
    parent?: string;
};
export type DecompositionTreeLevel = {
    dimension: string;
    nodes: DecompositionTreeNode[];
};
export type DecompositionTreeData = {
    measure: string;
    levels: DecompositionTreeLevel[];
};
export type DecompositionTreeChartProps = {
    data: DecompositionTreeData;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type Cell = {
    key: string;
    label: string;
    dimension: string;
    value: number;
    level: number;
    x: number;
    y: number;
    barWidth: number;
    tone: string;
    cx: number;
    cy: number;
    parentKey: string | null;
};
type Link = {
    key: string;
    from: Cell;
    to: Cell;
};
export declare class DecompositionTreeChart {
    static readonly stComponentName = "DecompositionTreeChart";
    readonly componentName = "DecompositionTreeChart";
    readonly BAR_H = 22;
    readonly Math: Math;
    private hoveredKey;
    data: DecompositionTreeData;
    label?: string;
    width?: number;
    height: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    get resolvedWidth(): number;
    get layout(): {
        cells: Cell[];
        links: Link[];
    };
    get cells(): Cell[];
    get links(): Link[];
    get computedHeight(): number;
    get computedWidth(): number;
    get viewBox(): string;
    get hoveredCell(): Cell | null;
    get dataValueItems(): string[];
    charsFor(w: number): number;
    ellipsize(text: string, maxChars: number): string;
    formatValueFor(v: number): string;
    linkPathFor(link: Link): string;
    linkClass(link: Link): string;
    barClass(cell: Cell): string;
    tooltipLeft(cell: Cell): number;
    tooltipTop(cell: Cell): number;
    handlePointerMove(event: PointerEvent): void;
    handlePointerLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DecompositionTreeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DecompositionTreeChart, "st-decomposition-tree-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=DecompositionTreeChart.d.ts.map