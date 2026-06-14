import * as i0 from "@angular/core";
export type WaterfallType = "increase" | "decrease" | "total";
export type WaterfallChartDatum = {
    label: string;
    value: number;
    type?: WaterfallType;
};
export type WaterfallChartProps = {
    data: WaterfallChartDatum[];
    width?: number;
    height?: number;
    connectors?: boolean;
    format?: (value: number) => string;
    label: string;
    class?: string;
};
export declare class WaterfallChart {
    static readonly stComponentName = "WaterfallChart";
    readonly componentName = "WaterfallChart";
    data: WaterfallChartDatum[];
    width?: number;
    height?: number;
    connectors?: boolean;
    format?: (value: number) => string;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<WaterfallChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WaterfallChart, "st-waterfall-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "connectors": { "alias": "connectors"; "required": false; }; "format": { "alias": "format"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=WaterfallChart.d.ts.map