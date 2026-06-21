import * as i0 from "@angular/core";
export type PolygonChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type PolygonChartPoint = {
    x: number;
    y: number;
};
export type PolygonChartProps = {
    data: PolygonChartPoint[];
    label: string;
    tone?: PolygonChartTone;
    width?: number;
    height?: number;
    class?: string;
};
type PointGeom = {
    cx: number;
    cy: number;
    datum: PolygonChartPoint;
    index: number;
};
export declare class PolygonChart {
    static readonly stComponentName = "PolygonChart";
    readonly componentName = "PolygonChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    private hoveredIndex;
    data: PolygonChartPoint[];
    label: string;
    tone: PolygonChartTone;
    width?: number;
    height?: number;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get validData(): PolygonChartPoint[];
    get scales(): {
        xTicks: number[];
        yTicks: number[];
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
        plotW: number;
        plotH: number;
    };
    get points(): PointGeom[];
    get polygonPointsStr(): string;
    get polygonClass(): string;
    get vertexClass(): string;
    get dataValueItems(): string[];
    get hoveredPoint(): PointGeom | null;
    xPixel(t: number): number;
    yPixel(t: number): number;
    fmtTick(v: number): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PolygonChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PolygonChart, "st-polygon-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=PolygonChart.d.ts.map