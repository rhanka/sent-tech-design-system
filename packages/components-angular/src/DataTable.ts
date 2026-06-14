import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  type CellDecoration,
  cellDecorationClass,
  cellDecorationLabel,
  renderCellDecorationIcon,
} from "./cellDecoration.js";

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
  rangeLabel?: (range: { start: number; end: number; total: number }) => string;
  emptyLabel?: string;
  onRowClick?: (row: DataTableRow) => void;
  class?: string;
};

@Component({
  selector: "st-data-table",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DataTable {
  static readonly stComponentName = "DataTable";
  readonly componentName = "DataTable";
  @NgInput() columns!: DataTableColumn[];
  @NgInput() rows!: DataTableRow[];
  @NgInput() decorations?: Record<string, Record<string, CellDecoration>>;
  @NgInput() caption?: unknown;
  @NgInput() size?: DataTableSize;
  @NgInput() selectable?: DataTableSelectMode;
  @NgInput() selectedIds?: string[];
  @NgInput() onSelectionChange?: (selectedIds: string[]) => void;
  @NgInput() sortable?: boolean;
  @NgInput() sortBy?: DataTableSort | null;
  @NgInput() onSortChange?: (sortBy: DataTableSort | null) => void;
  @NgInput() pageSize?: number;
  @NgInput() page?: number;
  @NgInput() onPageChange?: (page: number) => void;
  @NgInput() selectAllLabel?: string;
  @NgInput() selectRowLabel?: string;
  @NgInput() sortAscendingLabel?: string;
  @NgInput() sortDescendingLabel?: string;
  @NgInput() sortNoneLabel?: string;
  @NgInput() previousLabel?: string;
  @NgInput() nextLabel?: string;
  @NgInput() rangeLabel?: (range: { start: number; end: number; total: number }) => string;
  @NgInput() emptyLabel?: string;
  @NgInput() onRowClick?: (row: DataTableRow) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-dataTable", this.classInput].filter(Boolean).join(" ");
  }
}
