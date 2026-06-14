import * as i0 from "@angular/core";
export type SunburstChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type SunburstChartDatum = {
    label: string;
    value?: number;
    tone?: SunburstChartTone;
    children?: SunburstChartDatum[];
};
export type SunburstChartProps = {
    data: SunburstChartDatum;
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    class?: string;
};
export declare class SunburstChart {
    static readonly stComponentName = "SunburstChart";
    readonly componentName = "SunburstChart";
    data: SunburstChartDatum;
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SunburstChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SunburstChart, "st-sunburst-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SunburstChart.d.ts.map