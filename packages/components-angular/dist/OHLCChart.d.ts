import { type ChartAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type OHLCChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
};
export type OHLCChartProps = {
    data: OHLCChartDatum[];
    label: string;
    width?: number;
    height?: number;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    class?: string;
};
export declare class OHLCChart {
    static readonly stComponentName = "OHLCChart";
    readonly componentName = "OHLCChart";
    data: OHLCChartDatum[];
    label: string;
    width?: number;
    height?: number;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    keyboardNav?: boolean;
    onSelectKey?: (key: string | null) => void;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<OHLCChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OHLCChart, "st-ohlc-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=OHLCChart.d.ts.map