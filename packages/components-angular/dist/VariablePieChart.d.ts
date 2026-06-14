import * as i0 from "@angular/core";
export type VariablePieChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type VariablePieChartDatum = {
    label: string;
    value: number;
    z: number;
    tone?: VariablePieChartTone;
};
export type VariablePieChartProps = {
    data: VariablePieChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class VariablePieChart {
    static readonly stComponentName = "VariablePieChart";
    readonly componentName = "VariablePieChart";
    data: VariablePieChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<VariablePieChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VariablePieChart, "st-variable-pie-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=VariablePieChart.d.ts.map