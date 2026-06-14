import * as i0 from "@angular/core";
export type SolidGaugeTone = "neutral" | "info" | "success" | "warning" | "error" | "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type SolidGaugeThreshold = {
    value: number;
    tone: SolidGaugeTone;
};
export type SolidGaugeFormat = "number" | "percent";
export type SolidGaugeChartProps = {
    value: number;
    min?: number;
    max?: number;
    thresholds?: SolidGaugeThreshold[];
    innerRadius?: number;
    label?: string;
    format?: SolidGaugeFormat;
    unit?: string;
    size?: number;
    startAngle?: number;
    endAngle?: number;
    class?: string;
};
export declare class SolidGaugeChart {
    static readonly stComponentName = "SolidGaugeChart";
    readonly componentName = "SolidGaugeChart";
    value: number;
    min?: number;
    max?: number;
    thresholds?: SolidGaugeThreshold[];
    innerRadius?: number;
    label?: string;
    format?: SolidGaugeFormat;
    unit?: string;
    size?: number;
    startAngle?: number;
    endAngle?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SolidGaugeChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SolidGaugeChart, "st-solid-gauge-chart", never, { "value": { "alias": "value"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "thresholds": { "alias": "thresholds"; "required": false; }; "innerRadius": { "alias": "innerRadius"; "required": false; }; "label": { "alias": "label"; "required": false; }; "format": { "alias": "format"; "required": false; }; "unit": { "alias": "unit"; "required": false; }; "size": { "alias": "size"; "required": false; }; "startAngle": { "alias": "startAngle"; "required": false; }; "endAngle": { "alias": "endAngle"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SolidGaugeChart.d.ts.map