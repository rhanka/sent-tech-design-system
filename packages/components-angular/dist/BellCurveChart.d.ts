import * as i0 from "@angular/core";
export type BellCurveChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type BellCurveChartProps = {
    data: number[];
    width?: number;
    height?: number;
    tone?: BellCurveChartTone;
    smooth?: boolean;
    intervals?: number;
    label: string;
    class?: string;
};
type CurvePoint = {
    x: number;
    y: number;
    vx: number;
};
type GridLine = {
    value: number;
    x: number;
};
type SdMark = {
    k: number;
    x: number;
    yTop: number;
};
type MeanMark = {
    x: number;
    yTop: number;
};
type Stats = {
    mean: number;
    sd: number;
    n: number;
};
export declare class BellCurveChart {
    static readonly stComponentName = "BellCurveChart";
    readonly componentName = "BellCurveChart";
    readonly MARGIN_LEFT: 44;
    readonly MARGIN_RIGHT: 16;
    readonly MARGIN_TOP: 12;
    readonly MARGIN_BOTTOM: 32;
    readonly gradientId = "st-bellcurve-gradient";
    hoveredIndex: number | null;
    data: number[];
    width?: number;
    height?: number;
    tone?: BellCurveChartTone;
    smooth?: boolean;
    intervals?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get toneValue(): BellCurveChartTone;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get sampleCount(): number;
    get sample(): number[];
    get stats(): Stats | null;
    pdf(x: number, mean: number, sd: number): number;
    pdfAt(vx: number): number;
    get xDomain(): {
        min: number;
        max: number;
    };
    get yMax(): number;
    get yDomain(): {
        min: number;
        max: number;
    };
    get xTicks(): number[];
    get curvePoints(): CurvePoint[];
    get linePath(): string;
    get areaPath(): string;
    get baseY(): number;
    get meanMark(): MeanMark | null;
    get sdMarks(): SdMark[];
    get gridLines(): GridLine[];
    roundStat(v: number): number;
    get dataValueItems(): string[];
    get ariaLabel(): string;
    formatTickLabel(value: number): string;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BellCurveChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BellCurveChart, "st-bell-curve-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "smooth": { "alias": "smooth"; "required": false; }; "intervals": { "alias": "intervals"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=BellCurveChart.d.ts.map