import * as i0 from "@angular/core";
export type VennChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type VennChartArea = {
    sets: string[];
    value: number;
};
export type VennChartProps = {
    data: VennChartArea[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
type VennCircle = {
    name: string;
    tone: VennChartTone;
    cx: number;
    cy: number;
    r: number;
    total: number;
    labelX: number;
    labelY: number;
    anchor: "start" | "middle" | "end";
};
type VennRegion = {
    sets: string[];
    value: number;
    x: number;
    y: number;
};
type VennLayout = {
    circles: VennCircle[];
    regions: VennRegion[];
    items: string[];
};
export declare class VennChart {
    static readonly stComponentName = "VennChart";
    readonly componentName = "VennChart";
    hoveredIndex: number | null;
    data: VennChartArea[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get layout(): VennLayout;
    circleClass(i: number): string;
    get tooltipLeft(): number;
    get tooltipTop(): number;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<VennChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VennChart, "st-venn-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=VennChart.d.ts.map