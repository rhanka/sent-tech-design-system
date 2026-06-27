import { EventEmitter, type OnInit } from "@angular/core";
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
type IconNode = Array<[string, Record<string, string | number>]>;
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
    paginationLabel?: string;
    locale?: string;
    rangeLabel?: (range: {
        start: number;
        end: number;
        total: number;
    }) => string;
    emptyLabel?: string;
    onRowClick?: (row: DataTableRow) => void;
    class?: string;
};
export declare class DataTable implements OnInit {
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
    paginationLabel?: string;
    locale?: string;
    rangeLabel?: (range: {
        start: number;
        end: number;
        total: number;
    }) => string;
    emptyLabel?: string;
    onRowClick?: (row: DataTableRow) => void;
    classInput?: string;
    readonly sortChange: EventEmitter<DataTableSort | null>;
    readonly pageChange: EventEmitter<number>;
    readonly selectionChange: EventEmitter<string[]>;
    private localSortBy;
    private localPage;
    private localSelectedIds;
    ngOnInit(): void;
    get resolvedSize(): DataTableSize;
    get resolvedSelectable(): DataTableSelectMode;
    private get resolvedSortable();
    get resolvedSelectAllLabel(): string;
    get resolvedSelectRowLabel(): string;
    get resolvedEmptyLabel(): string;
    get resolvedPaginationLabel(): string;
    private get isFr();
    get resolvedPreviousLabel(): string;
    get resolvedNextLabel(): string;
    get tableClass(): string;
    private get effectiveSortBy();
    private get effectivePage();
    private get effectiveSelectedIds();
    private commitSort;
    private commitPage;
    private commitSelection;
    isColumnSortable(column: DataTableColumn): boolean;
    private get sortedRows();
    get pageCount(): number;
    get safePage(): number;
    get visibleRows(): DataTableRow[];
    private get range();
    get rangeText(): string;
    get showFooter(): boolean;
    get allVisibleSelected(): boolean;
    get emptyColspan(): number;
    ariaSortFor(column: DataTableColumn): "ascending" | "descending" | "none" | null;
    sortIcon(column: DataTableColumn): string;
    sortHiddenLabel(column: DataTableColumn): string;
    toggleSort(column: DataTableColumn): void;
    goToPage(target: number): void;
    isRowSelected(row: DataTableRow): boolean;
    onToggleRow(row: DataTableRow, event: Event): void;
    onToggleAllVisible(event: Event): void;
    onRowClickHandler(row: DataTableRow): void;
    private alignClass;
    thClass(column: DataTableColumn): string;
    resolveDecoration(row: DataTableRow, column: DataTableColumn): CellDecoration | null;
    tdClass(column: DataTableColumn, row: DataTableRow): string;
    cellTitle(column: DataTableColumn, row: DataTableRow): string | null;
    cellContent(row: DataTableRow, column: DataTableColumn): unknown;
    rowClass(row: DataTableRow): string;
    hasIcon(decoration: CellDecoration): boolean;
    iconNodes(decoration: CellDecoration): IconNode;
    decorationLabel(decoration: CellDecoration): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataTable, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DataTable, "st-data-table", never, { "columns": { "alias": "columns"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "decorations": { "alias": "decorations"; "required": false; }; "caption": { "alias": "caption"; "required": false; }; "size": { "alias": "size"; "required": false; }; "selectable": { "alias": "selectable"; "required": false; }; "selectedIds": { "alias": "selectedIds"; "required": false; }; "onSelectionChange": { "alias": "onSelectionChange"; "required": false; }; "sortable": { "alias": "sortable"; "required": false; }; "sortBy": { "alias": "sortBy"; "required": false; }; "onSortChange": { "alias": "onSortChange"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "page": { "alias": "page"; "required": false; }; "onPageChange": { "alias": "onPageChange"; "required": false; }; "selectAllLabel": { "alias": "selectAllLabel"; "required": false; }; "selectRowLabel": { "alias": "selectRowLabel"; "required": false; }; "sortAscendingLabel": { "alias": "sortAscendingLabel"; "required": false; }; "sortDescendingLabel": { "alias": "sortDescendingLabel"; "required": false; }; "sortNoneLabel": { "alias": "sortNoneLabel"; "required": false; }; "previousLabel": { "alias": "previousLabel"; "required": false; }; "nextLabel": { "alias": "nextLabel"; "required": false; }; "paginationLabel": { "alias": "paginationLabel"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "rangeLabel": { "alias": "rangeLabel"; "required": false; }; "emptyLabel": { "alias": "emptyLabel"; "required": false; }; "onRowClick": { "alias": "onRowClick"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "sortChange": "sortChange"; "pageChange": "pageChange"; "selectionChange": "selectionChange"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=DataTable.d.ts.map