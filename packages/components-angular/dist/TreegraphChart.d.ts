import * as i0 from "@angular/core";
export type TreegraphChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type TreegraphChartNode = {
    id: string;
    parentId?: string | null;
    label: string;
    tone?: TreegraphChartTone;
};
export type TreegraphChartProps = {
    data: TreegraphChartNode[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type LayoutNode = {
    id: string;
    label: string;
    tone: TreegraphChartTone;
    depth: number;
    x: number;
    y: number;
    parentId: string | null;
};
type LayoutLink = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
type Layout = {
    nodes: LayoutNode[];
    links: LayoutLink[];
    rowH: number;
};
export declare class TreegraphChart {
    static readonly stComponentName = "TreegraphChart";
    readonly componentName = "TreegraphChart";
    readonly R = 7;
    data: TreegraphChartNode[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get layout(): Layout;
    get fontSize(): number;
    get maxChars(): number;
    get dataValueItems(): string[];
    clip(s: string, n: number): string;
    isLeaf(node: LayoutNode): boolean;
    dotClass(node: LayoutNode): string;
    linkPath(link: LayoutLink): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TreegraphChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TreegraphChart, "st-treegraph-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=TreegraphChart.d.ts.map