import * as i0 from "@angular/core";
export type ParallelCoordinatesChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ParallelAxis = {
    key: string;
    label: string;
    min?: number;
    max?: number;
};
export type ParallelCoordinatesChartProps = {
    axes: ParallelAxis[];
    data: Record<string, unknown>[];
    label: string;
    tones?: ParallelCoordinatesChartTone[];
    width?: number;
    height?: number;
    class?: string;
};
export declare class ParallelCoordinatesChart {
    static readonly stComponentName = "ParallelCoordinatesChart";
    readonly componentName = "ParallelCoordinatesChart";
    axes: ParallelAxis[];
    data: Record<string, unknown>[];
    label: string;
    tones?: ParallelCoordinatesChartTone[];
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ParallelCoordinatesChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ParallelCoordinatesChart, "st-parallel-coordinates-chart", never, { "axes": { "alias": "axes"; "required": false; }; "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "tones": { "alias": "tones"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ParallelCoordinatesChart.d.ts.map