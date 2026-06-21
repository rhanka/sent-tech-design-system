import * as i0 from "@angular/core";
export type TileMapChartTile = {
    label: string;
    col: number;
    row: number;
    value: number;
};
export type TileMapChartProps = {
    data: TileMapChartTile[];
    width?: number;
    height?: number;
    label: string;
    class?: string;
};
type TileGeometry = {
    tile: TileMapChartTile;
    index: number;
    tone: string;
    x: number;
    y: number;
    side: number;
    cx: number;
    cy: number;
};
export declare class TileMapChart {
    static readonly stComponentName = "TileMapChart";
    readonly componentName = "TileMapChart";
    data: TileMapChartTile[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    hoveredIndex: number | null;
    readonly legendTones: readonly string[];
    get hostClass(): string;
    get widthValue(): number;
    get heightValue(): number;
    get viewBox(): string;
    get plotWidth(): number;
    get plotHeight(): number;
    get valid(): TileMapChartTile[];
    get tiles(): TileGeometry[];
    get hoveredTile(): TileGeometry | undefined;
    get dataValueItems(): string[];
    toneForValue(value: number, min: number, max: number): string;
    formatNumber(value: number | undefined): string;
    tileClass(tile: TileGeometry): string;
    tooltipLeft(): string;
    tooltipTop(): string;
    handleLeave(): void;
    handleVisualPointerMove(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TileMapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TileMapChart, "st-tile-map-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=TileMapChart.d.ts.map