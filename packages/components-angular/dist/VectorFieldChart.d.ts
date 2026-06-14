import * as i0 from "@angular/core";
export type VectorFieldChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type VectorFieldChartDatum = {
    x: number;
    y: number;
    length: number;
    direction: number;
};
export type VectorFieldChartProps = {
    data: VectorFieldChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class VectorFieldChart {
    static readonly stComponentName = "VectorFieldChart";
    readonly componentName = "VectorFieldChart";
    data: VectorFieldChartDatum[];
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<VectorFieldChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VectorFieldChart, "st-vector-field-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=VectorFieldChart.d.ts.map