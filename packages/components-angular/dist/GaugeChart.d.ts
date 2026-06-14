import * as i0 from "@angular/core";
export type GaugeChartTone = "neutral" | "info" | "success" | "warning" | "error" | "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type GaugeChartThreshold = {
    value: number;
    tone: GaugeChartTone;
};
export type GaugeChartFormat = "number" | "percent";
export type GaugeChartProps = {
    value: number;
    min?: number;
    max?: number;
    thresholds?: GaugeChartThreshold[];
    label?: string;
    format?: GaugeChartFormat;
    unit?: string;
    size?: number;
    thickness?: number;
    startAngle?: number;
    endAngle?: number;
    class?: string;
};
export declare class GaugeChart {
    static readonly stComponentName = "GaugeChart";
    readonly componentName = "GaugeChart";
    value: number;
    min?: number;
    max?: number;
    thresholds?: GaugeChartThreshold[];
    label?: string;
    format?: GaugeChartFormat;
    unit?: string;
    size?: number;
    thickness?: number;
    startAngle?: number;
    endAngle?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<GaugeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GaugeChart, "st-gauge-chart", never, { "value": { "alias": "value"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "thresholds": { "alias": "thresholds"; "required": false; }; "label": { "alias": "label"; "required": false; }; "format": { "alias": "format"; "required": false; }; "unit": { "alias": "unit"; "required": false; }; "size": { "alias": "size"; "required": false; }; "thickness": { "alias": "thickness"; "required": false; }; "startAngle": { "alias": "startAngle"; "required": false; }; "endAngle": { "alias": "endAngle"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=GaugeChart.d.ts.map