import { type ChartAnnotation, type ResolvedAnnotation } from "./chartAnnotations.js";
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
type OHLCBarGeom = {
    datum: OHLCChartDatum;
    index: number;
    bullish: boolean;
    centerX: number;
    band: number;
    barHighY: number;
    barLowY: number;
    openY: number;
    closeY: number;
    openX: number;
    closeX: number;
    tooltipY: number;
};
type OHLCDataLabelItem = {
    key: string;
    x: number;
    y: number;
    text: string;
};
type OHLCAnnotationRegion = Extract<ResolvedAnnotation, {
    kind: "region";
}>;
type OHLCAnnotationAbove = Extract<ResolvedAnnotation, {
    kind: "line" | "shape" | "point" | "label";
}>;
export declare class OHLCChart {
    static readonly stComponentName = "OHLCChart";
    readonly componentName = "OHLCChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    private navDatumElements?;
    private hoveredIndex;
    private focusedIndex;
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
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get validData(): OHLCChartDatum[];
    get domainBounds(): {
        rawMin: number;
        rawMax: number;
    };
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get bars(): OHLCBarGeom[];
    get hoverKeys(): string[];
    get activeIndex(): number;
    get activeBar(): OHLCBarGeom | null;
    get navEnabled(): boolean;
    get resolvedAnnotations(): ResolvedAnnotation[];
    get annotationRegions(): OHLCAnnotationRegion[];
    get annotationAbove(): OHLCAnnotationAbove[];
    get dataLabelItems(): OHLCDataLabelItem[];
    get dataValueItems(): string[];
    tickY(tick: number): number;
    formatTickLabel(tick: number): string;
    barGroupClass(b: OHLCBarGeom): string;
    polygonPointsFor(a: OHLCAnnotationAbove & {
        kind: "shape";
    }): string;
    tooltipLeft(b: OHLCBarGeom): number;
    tooltipTop(b: OHLCBarGeom): number;
    rovingTabIndexFor(index: number): number;
    ohlcAriaLabel(d: OHLCChartDatum): string;
    private emitHoverKey;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    handleDatapointFocus(index: number): void;
    focusDatum(index: number): void;
    handleDatapointKeyDown(event: KeyboardEvent, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<OHLCChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OHLCChart, "st-ohlc-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=OHLCChart.d.ts.map