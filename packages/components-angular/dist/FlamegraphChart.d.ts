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
export declare class FlamegraphChart {
    static readonly stComponentName = "FlamegraphChart";
    readonly componentName = "FlamegraphChart";
    data: FlamegraphNode;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlamegraphChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FlamegraphChart, "st-flamegraph-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=FlamegraphChart.d.ts.map