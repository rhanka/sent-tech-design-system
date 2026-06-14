import * as i0 from "@angular/core";
export type Density2DTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type Density2DPoint = {
    x: number;
    y: number;
    weight?: number;
};
export type Density2DChartProps = {
    data: Density2DPoint[];
    bins?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
};
export declare class Density2DChart {
    static readonly stComponentName = "Density2DChart";
    readonly componentName = "Density2DChart";
    data: Density2DPoint[];
    bins?: number;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Density2DChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Density2DChart, "st-density2-d-chart", never, { "data": { "alias": "data"; "required": false; }; "bins": { "alias": "bins"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Density2DChart.d.ts.map