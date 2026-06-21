import * as i0 from "@angular/core";
export type FlamegraphNode = {
    name: string;
    value: number;
    children?: FlamegraphNode[];
};
export type FlamegraphChartProps = {
    data: FlamegraphNode;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
type Cell = {
    key: string;
    name: string;
    value: number;
    depth: number;
    x: number;
    y: number;
    width: number;
    tone: string;
    cx: number;
    cy: number;
};
export declare class FlamegraphChart {
    static readonly stComponentName = "FlamegraphChart";
    readonly componentName = "FlamegraphChart";
    readonly ROW_H = 26;
    hoveredKey: string | null;
    data: FlamegraphNode;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    get resolvedWidth(): number;
    get heightDefault(): number;
    get plotWidth(): number;
    get cells(): Cell[];
    get computedHeight(): number;
    get viewBox(): string;
    get hoveredCell(): Cell | null;
    get dataValueItems(): string[];
    frameClass(cell: Cell): string;
    charsFor(w: number): number;
    ellipsize(text: string, maxChars: number): string;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlamegraphChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FlamegraphChart, "st-flamegraph-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=FlamegraphChart.d.ts.map