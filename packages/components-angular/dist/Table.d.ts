import * as i0 from "@angular/core";
export type TableColumn = {
    key: string;
    label: unknown;
    align?: "left" | "center" | "right";
};
export type TableRow = Record<string, unknown>;
export type TableProps = {
    columns: TableColumn[];
    rows: TableRow[];
    caption?: unknown;
    class?: string;
};
export declare class Table {
    static readonly stComponentName = "Table";
    readonly componentName = "Table";
    columns: TableColumn[];
    rows: TableRow[];
    caption?: unknown;
    classInput?: string;
    get tableClass(): string;
    cellClass(col: TableColumn): string;
    cellValue(row: TableRow, key: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Table, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Table, "st-table", never, { "columns": { "alias": "columns"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "caption": { "alias": "caption"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Table.d.ts.map