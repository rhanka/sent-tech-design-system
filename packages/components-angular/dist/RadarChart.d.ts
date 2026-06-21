import * as i0 from "@angular/core";
export type RadarChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type RadarChartSeries = {
    label: string;
    values: number[];
    tone?: RadarChartTone;
};
export type RadarChartProps = {
    axes: string[];
    series: RadarChartSeries[];
    maxValue?: number;
    levels?: number;
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    class?: string;
};
type AxisEntry = {
    axis: string;
    index: number;
    angle: number;
    endX: number;
    endY: number;
    labelX: number;
    labelY: number;
};
type RadarPolygon = {
    entry: RadarChartSeries;
    tone: RadarChartTone;
    points: Array<{
        x: number;
        y: number;
    }>;
    pointString: string;
};
export declare class RadarChart {
    static readonly stComponentName = "RadarChart";
    readonly componentName = "RadarChart";
    hoveredIndex: number | null;
    axes: string[];
    series: RadarChartSeries[];
    maxValue?: number;
    levels?: number;
    width?: number;
    height?: number;
    legend?: boolean;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get levelCount(): number;
    get centerX(): number;
    get centerY(): number;
    get radius(): number;
    get viewBox(): string;
    get domainMax(): number;
    pointAt(radius: number, angle: number): {
        x: number;
        y: number;
    };
    get axisEntries(): AxisEntry[];
    get rings(): string[];
    get polygons(): RadarPolygon[];
    get legendItems(): Array<{
        label: string;
        tone: RadarChartTone;
    }>;
    get dataValueItems(): string[];
    polygonClass(polygon: RadarPolygon, i: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    handleLeave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RadarChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RadarChart, "st-radar-chart", never, { "axes": { "alias": "axes"; "required": false; }; "series": { "alias": "series"; "required": false; }; "maxValue": { "alias": "maxValue"; "required": false; }; "levels": { "alias": "levels"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "legend": { "alias": "legend"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=RadarChart.d.ts.map