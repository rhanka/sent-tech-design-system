import type { ForceGraphLegendEntry } from "./ForceGraph.js";
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
type DumbbellRow = {
    datum: DumbbellChartDatum;
    range: {
        lo: number;
        hi: number;
    };
    cy: number;
    xLow: number;
    xHigh: number;
    index: number;
};
type GridLine = {
    value: number;
    x: number;
};
export declare class DumbbellChart {
    static readonly stComponentName = "DumbbellChart";
    readonly componentName = "DumbbellChart";
    readonly MARGIN_LEFT: 96;
    readonly MARGIN_RIGHT: 20;
    readonly MARGIN_TOP: 16;
    readonly MARGIN_BOTTOM: 32;
    readonly DOT_RADIUS = 5;
    hoveredIndex: number | null;
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
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get lowToneValue(): DumbbellChartTone;
    get highToneValue(): DumbbellChartTone;
    get lowLabelValue(): string;
    get highLabelValue(): string;
    normalize(d: DumbbellChartDatum): {
        lo: number;
        hi: number;
    } | null;
    get validData(): DumbbellChartDatum[];
    get dataValueItems(): string[];
    get xTicks(): number[];
    get xDomain(): {
        min: number;
        max: number;
    };
    get rows(): DumbbellRow[];
    get gridLines(): GridLine[];
    get legendEntries(): ForceGraphLegendEntry[];
    get dotLowClass(): string;
    get dotHighClass(): string;
    get hoveredRow(): DumbbellRow | null;
    formatTickLabel(v: number): string;
    handleLeave(): void;
    handlePointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DumbbellChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DumbbellChart, "st-dumbbell-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "lowTone": { "alias": "lowTone"; "required": false; }; "highTone": { "alias": "highTone"; "required": false; }; "lowLabel": { "alias": "lowLabel"; "required": false; }; "highLabel": { "alias": "highLabel"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=DumbbellChart.d.ts.map