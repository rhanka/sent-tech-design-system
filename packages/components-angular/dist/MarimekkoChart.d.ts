import * as i0 from "@angular/core";
export type MarimekkoChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type MarimekkoChartSegment = {
    label: string;
    value: number;
    tone?: MarimekkoChartTone;
};
export type MarimekkoChartDatum = {
    label: string;
    width: number;
    segments: MarimekkoChartSegment[];
};
export type MarimekkoChartProps = {
    data: MarimekkoChartDatum[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
};
export declare class MarimekkoChart {
    static readonly stComponentName = "MarimekkoChart";
    readonly componentName = "MarimekkoChart";
    data: MarimekkoChartDatum[];
    label: string;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarimekkoChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MarimekkoChart, "st-marimekko-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=MarimekkoChart.d.ts.map