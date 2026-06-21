import { type ChartAnnotation, type ResolvedAnnotation } from "./chartAnnotations.js";
import { type DataLabelsProp } from "./chartDataLabels.js";
import * as i0 from "@angular/core";
export type CandlestickChartDatum = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
};
export type CandlestickChartProps = {
    data: CandlestickChartDatum[];
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
type CandleGeom = {
    datum: CandlestickChartDatum;
    index: number;
    bullish: boolean;
    centerX: number;
    band: number;
    bodyX: number;
    bodyY: number;
    bodyW: number;
    bodyH: number;
    wickHighY: number;
    wickLowY: number;
    tooltipY: number;
};
type CandleDataLabelItem = {
    key: string;
    x: number;
    y: number;
    text: string;
};
type CandleAnnotationRegion = Extract<ResolvedAnnotation, {
    kind: "region";
}>;
type CandleAnnotationAbove = Extract<ResolvedAnnotation, {
    kind: "line" | "shape" | "point" | "label";
}>;
export declare class CandlestickChart {
    static readonly stComponentName = "CandlestickChart";
    readonly componentName = "CandlestickChart";
    readonly margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    private navDatumElements?;
    private hoveredIndex;
    private focusedIndex;
    data: CandlestickChartDatum[];
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
    get validData(): CandlestickChartDatum[];
    get domainBounds(): {
        rawMin: number;
        rawMax: number;
    };
    get ticks(): number[];
    get domainMin(): number;
    get domainMax(): number;
    get candles(): CandleGeom[];
    get hoverKeys(): string[];
    get activeIndex(): number;
    get activeCandle(): CandleGeom | null;
    get navEnabled(): boolean;
    get resolvedAnnotations(): ResolvedAnnotation[];
    get annotationRegions(): CandleAnnotationRegion[];
    get annotationAbove(): CandleAnnotationAbove[];
    get dataLabelItems(): CandleDataLabelItem[];
    get dataValueItems(): string[];
    tickY(tick: number): number;
    formatTickLabel(tick: number): string;
    wickClass(c: CandleGeom): string;
    bodyClass(c: CandleGeom): string;
    polygonPointsFor(a: CandleAnnotationAbove & {
        kind: "shape";
    }): string;
    tooltipLeft(c: CandleGeom): number;
    tooltipTop(c: CandleGeom): number;
    rovingTabIndexFor(index: number): number;
    ohlcAriaLabel(d: CandlestickChartDatum): string;
    private emitHoverKey;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    handleDatapointFocus(index: number): void;
    focusDatum(index: number): void;
    handleDatapointKeyDown(event: KeyboardEvent, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CandlestickChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CandlestickChart, "st-candlestick-chart", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "annotations": { "alias": "annotations"; "required": false; }; "dataLabels": { "alias": "dataLabels"; "required": false; }; "hoverKey": { "alias": "hoverKey"; "required": false; }; "onHoverKeyChange": { "alias": "onHoverKeyChange"; "required": false; }; "keyboardNav": { "alias": "keyboardNav"; "required": false; }; "onSelectKey": { "alias": "onSelectKey"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=CandlestickChart.d.ts.map