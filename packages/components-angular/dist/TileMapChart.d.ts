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
export declare class TileMapChart {
    static readonly stComponentName = "TileMapChart";
    readonly componentName = "TileMapChart";
    data: TileMapChartTile[];
    width?: number;
    height?: number;
    label: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TileMapChart, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TileMapChart, "st-tile-map-chart", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TileMapChart.d.ts.map