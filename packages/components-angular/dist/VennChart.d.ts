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
export declare class VennChart {
    static readonly stComponentName = "VennChart";
    readonly componentName = "VennChart";
    data: VennChartArea[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<VennChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VennChart, "st-venn-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=VennChart.d.ts.map