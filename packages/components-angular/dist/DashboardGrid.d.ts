import { EventEmitter } from "@angular/core";
import type { OnChanges, SimpleChanges } from "@angular/core";
import * as i0 from "@angular/core";
export type DashboardGridTile = {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    title?: string;
    description?: string;
    value?: string;
};
export type DashboardGridProps = {
    tiles: DashboardGridTile[];
    columns?: number;
    rowHeight?: number;
    gap?: number;
    editable?: boolean;
    label?: string;
    onLayout?: (tiles: DashboardGridTile[]) => void;
    class?: string;
};
export declare class DashboardGrid implements OnChanges {
    static readonly stComponentName = "DashboardGrid";
    readonly componentName = "DashboardGrid";
    tiles: DashboardGridTile[];
    columns?: number;
    rowHeight?: number;
    gap?: number;
    editable?: boolean;
    label?: string;
    onLayout?: (tiles: DashboardGridTile[]) => void;
    classInput?: string;
    layoutChange: EventEmitter<DashboardGridTile[]>;
    private localTiles;
    private hasLocalLayout;
    ngOnChanges(changes: SimpleChanges): void;
    get safeColumns(): number;
    get layout(): DashboardGridTile[];
    get hostClass(): string;
    get styleText(): string;
    tileStyle(tile: DashboardGridTile): string;
    tileLabel(tile: DashboardGridTile): string;
    private commit;
    private changeTile;
    moveTile(id: string, dx: number, dy: number): void;
    resizeTile(id: string, dw: number, dh: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DashboardGrid, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DashboardGrid, "st-dashboard-grid", never, { "tiles": { "alias": "tiles"; "required": false; }; "columns": { "alias": "columns"; "required": false; }; "rowHeight": { "alias": "rowHeight"; "required": false; }; "gap": { "alias": "gap"; "required": false; }; "editable": { "alias": "editable"; "required": false; }; "label": { "alias": "label"; "required": false; }; "onLayout": { "alias": "onLayout"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "layoutChange": "layoutChange"; }, never, never, true, never>;
}
//# sourceMappingURL=DashboardGrid.d.ts.map