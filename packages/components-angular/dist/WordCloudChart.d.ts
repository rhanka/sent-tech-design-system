import * as i0 from "@angular/core";
export type WordCloudChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type WordCloudChartWord = {
    text: string;
    weight: number;
    tone?: WordCloudChartTone;
};
export type WordCloudChartProps = {
    data: WordCloudChartWord[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare class WordCloudChart {
    static readonly stComponentName = "WordCloudChart";
    readonly componentName = "WordCloudChart";
    data: WordCloudChartWord[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<WordCloudChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WordCloudChart, "st-word-cloud-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=WordCloudChart.d.ts.map