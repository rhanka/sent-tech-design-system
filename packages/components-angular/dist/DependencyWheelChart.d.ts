import * as i0 from "@angular/core";
export type DependencyWheelChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type DependencyWheelChartLink = {
    from: string;
    to: string;
    weight: number;
};
export type DependencyWheelChartProps = {
    data: DependencyWheelChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class DependencyWheelChart {
    static readonly stComponentName = "DependencyWheelChart";
    readonly componentName = "DependencyWheelChart";
    data: DependencyWheelChartLink[];
    labels?: Record<string, string>;
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DependencyWheelChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DependencyWheelChart, "st-dependency-wheel-chart", never, { "data": { "alias": "data"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DependencyWheelChart.d.ts.map