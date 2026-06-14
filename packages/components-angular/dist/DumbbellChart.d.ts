import * as i0 from "@angular/core";
export type DumbbellChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type DumbbellChartDatum = {
    category: string;
    low: number;
    high: number;
};
export type DumbbellChartProps = {
    data: DumbbellChartDatum[];
    width?: number;
    height?: number;
    lowTone?: DumbbellChartTone;
    highTone?: DumbbellChartTone;
    lowLabel?: string;
    highLabel?: string;
    label: string;
    class?: string;
};
export declare class DumbbellChart {
    static readonly stComponentName = "DumbbellChart";
    readonly componentName = "DumbbellChart";
    data: DumbbellChartDatum[];
    width?: number;
    height?: number;
    lowTone?: DumbbellChartTone;
    highTone?: DumbbellChartTone;
    lowLabel?: string;
    highLabel?: string;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DumbbellChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DumbbellChart, "st-dumbbell-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "lowTone": { "alias": "lowTone"; "required": false; }; "highTone": { "alias": "highTone"; "required": false; }; "lowLabel": { "alias": "lowLabel"; "required": false; }; "highLabel": { "alias": "highLabel"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DumbbellChart.d.ts.map