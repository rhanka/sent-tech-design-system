import { type CellDecoration } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export interface DataTableColumn<R extends DataTableRow = DataTableRow> {
    key: string;
    label: unknown;
    sortable?: boolean;
    align?: "start" | "center" | "end";
    width?: string;
    cell?: (row: R, column: DataTableColumn<R>) => unknown;
    /**
     * Conditional formatting (confort) : décoration sémantique calculée par
     * cellule. Si une `decorations` map est aussi fournie, la map gagne.
     */
    cellDecoration?: (row: R, value: unknown, colId: string) => CellDecoration | null;
}
export interface DataTableRow {
    id: string;
    [key: string]: unknown;
}
export type DataTableSelectMode = "none" | "single" | "multiple";
export type DataTableSize = "sm" | "md" | "lg";
export interface DataTableSort {
    key: string;
    direction: "asc" | "desc";
}
export type DataTableProps = {
    columns: DataTableColumn[];
    rows: DataTableRow[];
    /**
     * Conditional formatting : décorations sémantiques par cellule, indexées
     * `rowId` → `colId` → décoration. Prioritaire sur `column.cellDecoration`.
     */
    decorations?: Record<string, Record<string, CellDecoration>>;
    caption?: unknown;
    size?: DataTableSize;
    selectable?: DataTableSelectMode;
    selectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    sortable?: boolean;
    sortBy?: DataTableSort | null;
    onSortChange?: (sortBy: DataTableSort | null) => void;
    pageSize?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    selectAllLabel?: string;
    selectRowLabel?: string;
    sortAscendingLabel?: string;
    sortDescendingLabel?: string;
    sortNoneLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    rangeLabel?: (range: {
        start: number;
        end: number;
        total: number;
    }) => string;
    emptyLabel?: string;
    onRowClick?: (row: DataTableRow) => void;
    class?: string;
};
export declare class DataTable {
    static readonly stComponentName = "DataTable";
    readonly componentName = "DataTable";
    columns: DataTableColumn[];
    rows: DataTableRow[];
    decorations?: Record<string, Record<string, CellDecoration>>;
    caption?: unknown;
    size?: DataTableSize;
    selectable?: DataTableSelectMode;
    selectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    sortable?: boolean;
    sortBy?: DataTableSort | null;
    onSortChange?: (sortBy: DataTableSort | null) => void;
    pageSize?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    selectAllLabel?: string;
    selectRowLabel?: string;
    sortAscendingLabel?: string;
    sortDescendingLabel?: string;
    sortNoneLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    rangeLabel?: (range: {
        start: number;
        end: number;
        total: number;
    }) => string;
    emptyLabel?: string;
    onRowClick?: (row: DataTableRow) => void;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataTable, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DataTable, "st-data-table", never, { "columns": { "alias": "columns"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "decorations": { "alias": "decorations"; "required": false; }; "caption": { "alias": "caption"; "required": false; }; "size": { "alias": "size"; "required": false; }; "selectable": { "alias": "selectable"; "required": false; }; "selectedIds": { "alias": "selectedIds"; "required": false; }; "onSelectionChange": { "alias": "onSelectionChange"; "required": false; }; "sortable": { "alias": "sortable"; "required": false; }; "sortBy": { "alias": "sortBy"; "required": false; }; "onSortChange": { "alias": "onSortChange"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "page": { "alias": "page"; "required": false; }; "onPageChange": { "alias": "onPageChange"; "required": false; }; "selectAllLabel": { "alias": "selectAllLabel"; "required": false; }; "selectRowLabel": { "alias": "selectRowLabel"; "required": false; }; "sortAscendingLabel": { "alias": "sortAscendingLabel"; "required": false; }; "sortDescendingLabel": { "alias": "sortDescendingLabel"; "required": false; }; "sortNoneLabel": { "alias": "sortNoneLabel"; "required": false; }; "previousLabel": { "alias": "previousLabel"; "required": false; }; "nextLabel": { "alias": "nextLabel"; "required": false; }; "rangeLabel": { "alias": "rangeLabel"; "required": false; }; "emptyLabel": { "alias": "emptyLabel"; "required": false; }; "onRowClick": { "alias": "onRowClick"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DataTable.d.ts.map