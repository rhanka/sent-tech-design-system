import * as i0 from "@angular/core";
export type SankeyChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type SankeyChartNode = {
    id: string;
    label: string;
    tone?: SankeyChartTone;
};
export type SankeyChartLink = {
    source: string;
    target: string;
    value: number;
    tone?: SankeyChartTone;
};
export type SankeyChartProps = {
    nodes: SankeyChartNode[];
    links: SankeyChartLink[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class SankeyChart {
    static readonly stComponentName = "SankeyChart";
    readonly componentName = "SankeyChart";
    nodes: SankeyChartNode[];
    links: SankeyChartLink[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SankeyChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SankeyChart, "st-sankey-chart", never, { "nodes": { "alias": "nodes"; "required": false; }; "links": { "alias": "links"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SankeyChart.d.ts.map