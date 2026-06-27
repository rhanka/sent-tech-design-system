import {
  Component,
  EventEmitter,
  Input as NgInput,
  Output,
  type OnInit,
} from "@angular/core";

import { classNames } from "./classNames.js";

import {
  type CellDecoration,
  cellDecorationClass,
  cellDecorationIconNodes,
  cellDecorationLabel,
  hasCellDecorationIcon,
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
  rangeLabel?: (range: { start: number; end: number; total: number }) => string;
  emptyLabel?: string;
  onRowClick?: (row: DataTableRow) => void;
  class?: string;
};

@Component({
  selector: "st-data-table",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" class="st-dataTable-wrap">
      <table [class]="tableClass">
        @if (caption) {
          <caption>{{ caption }}</caption>
        }
        <thead>
          <tr>
            @if (resolvedSelectable === 'multiple') {
              <th scope="col" class="st-dataTable__select">
                <label class="st-dataTable__selectLabel">
                  <input
                    type="checkbox"
                    [checked]="allVisibleSelected"
                    [attr.aria-label]="resolvedSelectAllLabel"
                    (change)="onToggleAllVisible($event)"
                  />
                  <span class="st-visually-hidden">{{ resolvedSelectAllLabel }}</span>
                </label>
              </th>
            } @else if (resolvedSelectable === 'single') {
              <th scope="col" class="st-dataTable__select" [attr.aria-label]="resolvedSelectRowLabel"></th>
            }
            @for (column of columns; track column.key) {
              <th
                scope="col"
                [class]="thClass(column)"
                [attr.aria-sort]="ariaSortFor(column)"
                [style.width]="column.width || null"
              >
                @if (isColumnSortable(column)) {
                  <button type="button" class="st-dataTable__sortBtn" (click)="toggleSort(column)">
                    <span>{{ column.label }}</span>
                    <span class="st-dataTable__sortIcon" aria-hidden="true">{{ sortIcon(column) }}</span>
                    <span class="st-visually-hidden">{{ sortHiddenLabel(column) }}</span>
                  </button>
                } @else {
                  {{ column.label }}
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (visibleRows.length === 0) {
            <tr>
              <td class="st-dataTable__empty" [attr.colspan]="emptyColspan">{{ resolvedEmptyLabel }}</td>
            </tr>
          } @else {
            @for (row of visibleRows; track row.id) {
              <tr [class]="rowClass(row)" (click)="onRowClickHandler(row)">
                @if (resolvedSelectable === 'multiple') {
                  <td class="st-dataTable__select">
                    <label class="st-dataTable__selectLabel">
                      <input
                        type="checkbox"
                        [checked]="isRowSelected(row)"
                        [attr.aria-label]="resolvedSelectRowLabel + ' ' + row.id"
                        (click)="$event.stopPropagation()"
                        (change)="onToggleRow(row, $event)"
                      />
                      <span class="st-visually-hidden">{{ resolvedSelectRowLabel }}</span>
                    </label>
                  </td>
                } @else if (resolvedSelectable === 'single') {
                  <td class="st-dataTable__select">
                    <label class="st-dataTable__selectLabel">
                      <input
                        type="radio"
                        name="st-dataTable-select"
                        [checked]="isRowSelected(row)"
                        [attr.aria-label]="resolvedSelectRowLabel + ' ' + row.id"
                        (click)="$event.stopPropagation()"
                        (change)="onToggleRow(row, $event)"
                      />
                      <span class="st-visually-hidden">{{ resolvedSelectRowLabel }}</span>
                    </label>
                  </td>
                }
                @for (column of columns; track column.key) {
                  <td [class]="tdClass(column, row)" [attr.title]="cellTitle(column, row)">
                    @if (resolveDecoration(row, column); as decoration) {
                      <span class="st-cell__content">
                        @if (hasIcon(decoration)) {
                          <svg class="st-cell__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                            @for (node of iconNodes(decoration); track $index) {
                              @if (node[0] === 'path') {
                                <svg:path [attr.d]="node[1]['d']"></svg:path>
                              } @else if (node[0] === 'circle') {
                                <svg:circle [attr.cx]="node[1]['cx']" [attr.cy]="node[1]['cy']" [attr.r]="node[1]['r']"></svg:circle>
                              } @else if (node[0] === 'line') {
                                <svg:line [attr.x1]="node[1]['x1']" [attr.x2]="node[1]['x2']" [attr.y1]="node[1]['y1']" [attr.y2]="node[1]['y2']"></svg:line>
                              }
                            }
                          </svg>
                        }
                        <span>{{ cellContent(row, column) }}</span>
                        <span class="st-visually-hidden">{{ decorationLabel(decoration) }}</span>
                      </span>
                    } @else {
                      {{ cellContent(row, column) }}
                    }
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
      @if (showFooter) {
        <div class="st-dataTable__footer">
          <span class="st-dataTable__range" aria-live="polite">{{ rangeText }}</span>
          <nav class="st-dataTable__pager" [attr.aria-label]="resolvedPaginationLabel">
            <button
              type="button"
              class="st-dataTable__pagerBtn"
              [disabled]="safePage <= 1"
              (click)="goToPage(safePage - 1)"
            >{{ resolvedPreviousLabel }}</button>
            <span class="st-dataTable__pagerStatus" aria-live="polite">{{ safePage }} / {{ pageCount }}</span>
            <button
              type="button"
              class="st-dataTable__pagerBtn"
              [disabled]="safePage >= pageCount"
              (click)="goToPage(safePage + 1)"
            >{{ resolvedNextLabel }}</button>
          </nav>
        </div>
      }
    </div>
  `,
})
export class DataTable implements OnInit {
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
  @NgInput() paginationLabel?: string;
  @NgInput() locale?: string;
  @NgInput() rangeLabel?: (range: { start: number; end: number; total: number }) => string;
  @NgInput() emptyLabel?: string;
  @NgInput() onRowClick?: (row: DataTableRow) => void;
  @NgInput("class") classInput?: string;

  @Output() readonly sortChange = new EventEmitter<DataTableSort | null>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly selectionChange = new EventEmitter<string[]>();

  private localSortBy: DataTableSort | null = null;
  private localPage = 1;
  private localSelectedIds: string[] = [];

  ngOnInit(): void {
    this.localSortBy = this.sortBy ?? null;
    this.localPage = this.page ?? 1;
    this.localSelectedIds = this.selectedIds ?? [];
  }

  // --- Configuration résolue ----------------------------------------------
  get resolvedSize(): DataTableSize {
    return this.size ?? "md";
  }

  get resolvedSelectable(): DataTableSelectMode {
    return this.selectable ?? "none";
  }

  private get resolvedSortable(): boolean {
    return this.sortable ?? true;
  }

  get resolvedSelectAllLabel(): string {
    return this.selectAllLabel ?? "Select all rows";
  }

  get resolvedSelectRowLabel(): string {
    return this.selectRowLabel ?? "Select row";
  }

  get resolvedEmptyLabel(): string {
    return this.emptyLabel ?? "No data";
  }

  get resolvedPaginationLabel(): string {
    return this.paginationLabel ?? "Pagination";
  }

  private get isFr(): boolean {
    return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
  }

  get resolvedPreviousLabel(): string {
    return this.previousLabel ?? (this.isFr ? "Précédent" : "Previous");
  }

  get resolvedNextLabel(): string {
    return this.nextLabel ?? (this.isFr ? "Suivant" : "Next");
  }

  get tableClass(): string {
    return classNames("st-dataTable", `st-dataTable--${this.resolvedSize}`, this.classInput);
  }

  // --- État effectif (contrôlé / non-contrôlé) -----------------------------
  private get effectiveSortBy(): DataTableSort | null {
    return this.sortBy !== undefined ? this.sortBy : this.localSortBy;
  }

  private get effectivePage(): number {
    return this.page ?? this.localPage;
  }

  private get effectiveSelectedIds(): string[] {
    return this.selectedIds ?? this.localSelectedIds;
  }

  private commitSort(next: DataTableSort | null): void {
    if (this.sortBy === undefined) this.localSortBy = next;
    this.onSortChange?.(next);
    this.sortChange.emit(next);
  }

  private commitPage(next: number): void {
    if (this.page === undefined) this.localPage = next;
    this.onPageChange?.(next);
    this.pageChange.emit(next);
  }

  private commitSelection(next: string[]): void {
    if (this.selectedIds === undefined) this.localSelectedIds = next;
    this.onSelectionChange?.(next);
    this.selectionChange.emit(next);
  }

  // --- Tri / pagination ----------------------------------------------------
  isColumnSortable(column: DataTableColumn): boolean {
    return this.resolvedSortable && column.sortable !== false;
  }

  private get sortedRows(): DataTableRow[] {
    const sortBy = this.effectiveSortBy;
    if (!sortBy) return this.rows;
    const { key, direction } = sortBy;
    const factor = direction === "asc" ? 1 : -1;
    return [...this.rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * factor;
      }
      return (
        String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) *
        factor
      );
    });
  }

  get pageCount(): number {
    const size = this.pageSize;
    return size && size > 0 ? Math.max(1, Math.ceil(this.sortedRows.length / size)) : 1;
  }

  get safePage(): number {
    return Math.min(Math.max(1, this.effectivePage), this.pageCount);
  }

  get visibleRows(): DataTableRow[] {
    const size = this.pageSize;
    if (!size || size <= 0) return this.sortedRows;
    const start = (this.safePage - 1) * size;
    return this.sortedRows.slice(start, start + size);
  }

  private get range(): { start: number; end: number; total: number } {
    const size = this.pageSize;
    const total = this.sortedRows.length;
    if (!size || size <= 0) {
      return { start: total === 0 ? 0 : 1, end: total, total };
    }
    if (total === 0) return { start: 0, end: 0, total: 0 };
    return {
      start: (this.safePage - 1) * size + 1,
      end: Math.min(this.safePage * size, total),
      total,
    };
  }

  get rangeText(): string {
    const fn =
      this.rangeLabel ??
      (({ start, end, total }: { start: number; end: number; total: number }) =>
        `${start}–${end} of ${total}`);
    return fn(this.range);
  }

  get showFooter(): boolean {
    return Boolean(this.pageSize && this.pageSize > 0);
  }

  get allVisibleSelected(): boolean {
    return (
      this.resolvedSelectable === "multiple" &&
      this.visibleRows.length > 0 &&
      this.visibleRows.every((row) => this.effectiveSelectedIds.includes(row.id))
    );
  }

  get emptyColspan(): number {
    return this.columns.length + (this.resolvedSelectable !== "none" ? 1 : 0);
  }

  ariaSortFor(column: DataTableColumn): "ascending" | "descending" | "none" | null {
    if (!this.isColumnSortable(column)) return null;
    const sortBy = this.effectiveSortBy;
    if (sortBy?.key !== column.key) return "none";
    return sortBy.direction === "asc" ? "ascending" : "descending";
  }

  sortIcon(column: DataTableColumn): string {
    const state = this.ariaSortFor(column);
    if (state === "ascending") return "↑";
    if (state === "descending") return "↓";
    return "↕";
  }

  sortHiddenLabel(column: DataTableColumn): string {
    const state = this.ariaSortFor(column);
    if (state === "ascending") return this.sortAscendingLabel ?? "Sorted ascending";
    if (state === "descending") return this.sortDescendingLabel ?? "Sorted descending";
    return this.sortNoneLabel ?? "Not sorted";
  }

  toggleSort(column: DataTableColumn): void {
    if (!this.isColumnSortable(column)) return;
    const sortBy = this.effectiveSortBy;
    if (sortBy?.key !== column.key) {
      this.commitSort({ key: column.key, direction: "asc" });
      return;
    }
    if (sortBy.direction === "asc") {
      this.commitSort({ key: column.key, direction: "desc" });
      return;
    }
    this.commitSort(null);
  }

  goToPage(target: number): void {
    if (target >= 1 && target <= this.pageCount && target !== this.safePage) {
      this.commitPage(target);
    }
  }

  // --- Sélection -----------------------------------------------------------
  isRowSelected(row: DataTableRow): boolean {
    return this.effectiveSelectedIds.includes(row.id);
  }

  onToggleRow(row: DataTableRow, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.resolvedSelectable === "none") return;
    if (this.resolvedSelectable === "single") {
      this.commitSelection(checked ? [row.id] : []);
      return;
    }
    const current = this.effectiveSelectedIds;
    this.commitSelection(
      checked ? [...current, row.id] : current.filter((id) => id !== row.id),
    );
  }

  onToggleAllVisible(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.resolvedSelectable !== "multiple") return;
    const visibleIds = this.visibleRows.map((r) => r.id);
    const current = this.effectiveSelectedIds;
    if (checked) {
      this.commitSelection(Array.from(new Set([...current, ...visibleIds])));
    } else {
      this.commitSelection(current.filter((id) => !visibleIds.includes(id)));
    }
  }

  onRowClickHandler(row: DataTableRow): void {
    this.onRowClick?.(row);
  }

  // --- Cellules ------------------------------------------------------------
  private alignClass(align?: "start" | "center" | "end"): string | null {
    if (align === "center") return "st-dataTable__cell--center";
    if (align === "end") return "st-dataTable__cell--end";
    return null;
  }

  thClass(column: DataTableColumn): string {
    return classNames(this.alignClass(column.align));
  }

  resolveDecoration(row: DataTableRow, column: DataTableColumn): CellDecoration | null {
    const fromMap = this.decorations?.[row.id]?.[column.key];
    if (fromMap) return fromMap;
    if (column.cellDecoration) {
      return column.cellDecoration(row, row[column.key], column.key) ?? null;
    }
    return null;
  }

  tdClass(column: DataTableColumn, row: DataTableRow): string {
    const decoration = this.resolveDecoration(row, column);
    return classNames(
      this.alignClass(column.align),
      decoration && "st-cell",
      decoration && cellDecorationClass(decoration.intent),
    );
  }

  cellTitle(column: DataTableColumn, row: DataTableRow): string | null {
    const decoration = this.resolveDecoration(row, column);
    return decoration ? cellDecorationLabel[decoration.intent] : null;
  }

  cellContent(row: DataTableRow, column: DataTableColumn): unknown {
    if (column.cell) return column.cell(row, column);
    return String(row[column.key] ?? "");
  }

  rowClass(row: DataTableRow): string {
    return classNames(
      this.isRowSelected(row) && "st-dataTable__row--selected",
      this.onRowClick && "st-dataTable__row--clickable",
    );
  }

  // --- Décoration : icône inline ------------------------------------------
  hasIcon(decoration: CellDecoration): boolean {
    return hasCellDecorationIcon(decoration.icon);
  }

  iconNodes(decoration: CellDecoration): IconNode {
    if (!hasCellDecorationIcon(decoration.icon)) return [];
    return cellDecorationIconNodes[decoration.icon as string] as IconNode;
  }

  decorationLabel(decoration: CellDecoration): string {
    return cellDecorationLabel[decoration.intent];
  }
}
