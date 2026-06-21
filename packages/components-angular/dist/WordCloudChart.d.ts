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
type Box = {
    x: number;
    y: number;
    w: number;
    h: number;
};
type PlacedWord = {
    word: WordCloudChartWord;
    tone: WordCloudChartTone;
    fontSize: number;
    cx: number;
    cy: number;
    box: Box;
    index: number;
};
export declare class WordCloudChart {
    static readonly stComponentName = "WordCloudChart";
    readonly componentName = "WordCloudChart";
    hoveredIndex: number | null;
    data: WordCloudChartWord[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get layout(): {
        placed: PlacedWord[];
        omitted: WordCloudChartWord[];
    };
    get placed(): PlacedWord[];
    get omitted(): WordCloudChartWord[];
    get dataValueItems(): string[];
    wordClass(i: number): string;
    get tooltipLeft(): number;
    get tooltipTop(): number;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WordCloudChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WordCloudChart, "st-word-cloud-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=WordCloudChart.d.ts.map