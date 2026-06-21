import * as i0 from "@angular/core";
export type ItemChartTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type ItemChartDatum = {
    label: string;
    value: number;
    tone?: ItemChartTone;
};
export type ItemChartSeat = {
    x: number;
    y: number;
    r: number;
    tone: ItemChartTone;
    groupIndex: number;
};
export type ItemChartProps = {
    data: ItemChartDatum[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
export declare function seatCount(value: number): number;
export declare function buildSeats(counts: number[], width: number, height: number): {
    seats: ItemChartSeat[];
    cx: number;
    cy: number;
};
type Group = {
    datum: ItemChartDatum;
    count: number;
    tone: ItemChartTone;
};
export declare class ItemChart {
    static readonly stComponentName = "ItemChart";
    readonly componentName = "ItemChart";
    hoveredIndex: number | null;
    data: ItemChartDatum[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get groups(): Group[];
    get layout(): {
        seats: ItemChartSeat[];
        cx: number;
        cy: number;
    };
    get seats(): ItemChartSeat[];
    get total(): number;
    get dataValueItems(): string[];
    get hoveredGroup(): Group | null;
    seatClass(seat: ItemChartSeat): string;
    legendItemClass(index: number): string;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ItemChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ItemChart, "st-item-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=ItemChart.d.ts.map