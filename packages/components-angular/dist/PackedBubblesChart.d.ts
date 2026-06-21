import * as i0 from "@angular/core";
export type PackedBubblesChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type PackedBubblesChartDatum = {
    label: string;
    value: number;
    tone?: PackedBubblesChartTone;
};
export type PackedBubblesChartProps = {
    data: PackedBubblesChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type Bubble = {
    label: string;
    value: number;
    tone: PackedBubblesChartTone;
    textColor: string;
    cx: number;
    cy: number;
    r: number;
    index: number;
    showLabel: boolean;
};
export declare class PackedBubblesChart {
    static readonly stComponentName = "PackedBubblesChart";
    readonly componentName = "PackedBubblesChart";
    private hoveredIndex;
    data: PackedBubblesChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    private magnitude;
    get bubbles(): Bubble[];
    get dataValueItems(): string[];
    get hoveredBubble(): Bubble | null;
    circleClass(bubble: Bubble): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PackedBubblesChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PackedBubblesChart, "st-packed-bubbles-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=PackedBubblesChart.d.ts.map