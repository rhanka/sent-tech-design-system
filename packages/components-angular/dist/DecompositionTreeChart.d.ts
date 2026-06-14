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
export declare class DecompositionTreeChart {
    static readonly stComponentName = "DecompositionTreeChart";
    readonly componentName = "DecompositionTreeChart";
    data: DecompositionTreeData;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DecompositionTreeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DecompositionTreeChart, "st-decomposition-tree-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DecompositionTreeChart.d.ts.map