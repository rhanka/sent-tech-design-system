import * as i0 from "@angular/core";
export type StreamgraphChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type StreamgraphChartSeriesValue = {
    label: string;
    value: number;
    tone?: StreamgraphChartTone;
};
export type StreamgraphChartDatum = {
    category: string;
    values: StreamgraphChartSeriesValue[];
};
export type StreamgraphChartProps = {
    data: StreamgraphChartDatum[];
    width?: number;
    height?: number;
    label: string;
    smooth?: boolean;
    showLegend?: boolean;
    class?: string;
};
export declare class StreamgraphChart {
    static readonly stComponentName = "StreamgraphChart";
    readonly componentName = "StreamgraphChart";
    data: StreamgraphChartDatum[];
    width?: number;
    height?: number;
    label: string;
    smooth?: boolean;
    showLegend?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StreamgraphChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StreamgraphChart, "st-streamgraph-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "showLegend": { "alias": "showLegend"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StreamgraphChart.d.ts.map