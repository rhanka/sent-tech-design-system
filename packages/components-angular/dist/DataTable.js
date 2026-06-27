import { Component, EventEmitter, Input as NgInput, Output, } from "@angular/core";
import { classNames } from "./classNames.js";
import { cellDecorationClass, cellDecorationIconNodes, cellDecorationLabel, hasCellDecorationIcon, } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export class DataTable {
    static stComponentName = "DataTable";
    componentName = "DataTable";
    columns;
    rows;
    decorations;
    caption;
    size;
    selectable;
    selectedIds;
    onSelectionChange;
    sortable;
    sortBy;
    onSortChange;
    pageSize;
    page;
    onPageChange;
    selectAllLabel;
    selectRowLabel;
    sortAscendingLabel;
    sortDescendingLabel;
    sortNoneLabel;
    previousLabel;
    nextLabel;
    paginationLabel;
    locale;
    rangeLabel;
    emptyLabel;
    onRowClick;
    classInput;
    sortChange = new EventEmitter();
    pageChange = new EventEmitter();
    selectionChange = new EventEmitter();
    localSortBy = null;
    localPage = 1;
    localSelectedIds = [];
    ngOnInit() {
        this.localSortBy = this.sortBy ?? null;
        this.localPage = this.page ?? 1;
        this.localSelectedIds = this.selectedIds ?? [];
    }
    // --- Configuration résolue ----------------------------------------------
    get resolvedSize() {
        return this.size ?? "md";
    }
    get resolvedSelectable() {
        return this.selectable ?? "none";
    }
    get resolvedSortable() {
        return this.sortable ?? true;
    }
    get resolvedSelectAllLabel() {
        return this.selectAllLabel ?? "Select all rows";
    }
    get resolvedSelectRowLabel() {
        return this.selectRowLabel ?? "Select row";
    }
    get resolvedEmptyLabel() {
        return this.emptyLabel ?? "No data";
    }
    get resolvedPaginationLabel() {
        return this.paginationLabel ?? "Pagination";
    }
    get isFr() {
        return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
    }
    get resolvedPreviousLabel() {
        return this.previousLabel ?? (this.isFr ? "Précédent" : "Previous");
    }
    get resolvedNextLabel() {
        return this.nextLabel ?? (this.isFr ? "Suivant" : "Next");
    }
    get tableClass() {
        return classNames("st-dataTable", `st-dataTable--${this.resolvedSize}`, this.classInput);
    }
    // --- État effectif (contrôlé / non-contrôlé) -----------------------------
    get effectiveSortBy() {
        return this.sortBy !== undefined ? this.sortBy : this.localSortBy;
    }
    get effectivePage() {
        return this.page ?? this.localPage;
    }
    get effectiveSelectedIds() {
        return this.selectedIds ?? this.localSelectedIds;
    }
    commitSort(next) {
        if (this.sortBy === undefined)
            this.localSortBy = next;
        this.onSortChange?.(next);
        this.sortChange.emit(next);
    }
    commitPage(next) {
        if (this.page === undefined)
            this.localPage = next;
        this.onPageChange?.(next);
        this.pageChange.emit(next);
    }
    commitSelection(next) {
        if (this.selectedIds === undefined)
            this.localSelectedIds = next;
        this.onSelectionChange?.(next);
        this.selectionChange.emit(next);
    }
    // --- Tri / pagination ----------------------------------------------------
    isColumnSortable(column) {
        return this.resolvedSortable && column.sortable !== false;
    }
    get sortedRows() {
        const sortBy = this.effectiveSortBy;
        if (!sortBy)
            return this.rows;
        const { key, direction } = sortBy;
        const factor = direction === "asc" ? 1 : -1;
        return [...this.rows].sort((a, b) => {
            const av = a[key];
            const bv = b[key];
            if (av == null && bv == null)
                return 0;
            if (av == null)
                return 1;
            if (bv == null)
                return -1;
            if (typeof av === "number" && typeof bv === "number") {
                return (av - bv) * factor;
            }
            return (String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) *
                factor);
        });
    }
    get pageCount() {
        const size = this.pageSize;
        return size && size > 0 ? Math.max(1, Math.ceil(this.sortedRows.length / size)) : 1;
    }
    get safePage() {
        return Math.min(Math.max(1, this.effectivePage), this.pageCount);
    }
    get visibleRows() {
        const size = this.pageSize;
        if (!size || size <= 0)
            return this.sortedRows;
        const start = (this.safePage - 1) * size;
        return this.sortedRows.slice(start, start + size);
    }
    get range() {
        const size = this.pageSize;
        const total = this.sortedRows.length;
        if (!size || size <= 0) {
            return { start: total === 0 ? 0 : 1, end: total, total };
        }
        if (total === 0)
            return { start: 0, end: 0, total: 0 };
        return {
            start: (this.safePage - 1) * size + 1,
            end: Math.min(this.safePage * size, total),
            total,
        };
    }
    get rangeText() {
        const fn = this.rangeLabel ??
            (({ start, end, total }) => `${start}–${end} of ${total}`);
        return fn(this.range);
    }
    get showFooter() {
        return Boolean(this.pageSize && this.pageSize > 0);
    }
    get allVisibleSelected() {
        return (this.resolvedSelectable === "multiple" &&
            this.visibleRows.length > 0 &&
            this.visibleRows.every((row) => this.effectiveSelectedIds.includes(row.id)));
    }
    get emptyColspan() {
        return this.columns.length + (this.resolvedSelectable !== "none" ? 1 : 0);
    }
    ariaSortFor(column) {
        if (!this.isColumnSortable(column))
            return null;
        const sortBy = this.effectiveSortBy;
        if (sortBy?.key !== column.key)
            return "none";
        return sortBy.direction === "asc" ? "ascending" : "descending";
    }
    sortIcon(column) {
        const state = this.ariaSortFor(column);
        if (state === "ascending")
            return "↑";
        if (state === "descending")
            return "↓";
        return "↕";
    }
    sortHiddenLabel(column) {
        const state = this.ariaSortFor(column);
        if (state === "ascending")
            return this.sortAscendingLabel ?? "Sorted ascending";
        if (state === "descending")
            return this.sortDescendingLabel ?? "Sorted descending";
        return this.sortNoneLabel ?? "Not sorted";
    }
    toggleSort(column) {
        if (!this.isColumnSortable(column))
            return;
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
    goToPage(target) {
        if (target >= 1 && target <= this.pageCount && target !== this.safePage) {
            this.commitPage(target);
        }
    }
    // --- Sélection -----------------------------------------------------------
    isRowSelected(row) {
        return this.effectiveSelectedIds.includes(row.id);
    }
    onToggleRow(row, event) {
        const checked = event.target.checked;
        if (this.resolvedSelectable === "none")
            return;
        if (this.resolvedSelectable === "single") {
            this.commitSelection(checked ? [row.id] : []);
            return;
        }
        const current = this.effectiveSelectedIds;
        this.commitSelection(checked ? [...current, row.id] : current.filter((id) => id !== row.id));
    }
    onToggleAllVisible(event) {
        const checked = event.target.checked;
        if (this.resolvedSelectable !== "multiple")
            return;
        const visibleIds = this.visibleRows.map((r) => r.id);
        const current = this.effectiveSelectedIds;
        if (checked) {
            this.commitSelection(Array.from(new Set([...current, ...visibleIds])));
        }
        else {
            this.commitSelection(current.filter((id) => !visibleIds.includes(id)));
        }
    }
    onRowClickHandler(row) {
        this.onRowClick?.(row);
    }
    // --- Cellules ------------------------------------------------------------
    alignClass(align) {
        if (align === "center")
            return "st-dataTable__cell--center";
        if (align === "end")
            return "st-dataTable__cell--end";
        return null;
    }
    thClass(column) {
        return classNames(this.alignClass(column.align));
    }
    resolveDecoration(row, column) {
        const fromMap = this.decorations?.[row.id]?.[column.key];
        if (fromMap)
            return fromMap;
        if (column.cellDecoration) {
            return column.cellDecoration(row, row[column.key], column.key) ?? null;
        }
        return null;
    }
    tdClass(column, row) {
        const decoration = this.resolveDecoration(row, column);
        return classNames(this.alignClass(column.align), decoration && "st-cell", decoration && cellDecorationClass(decoration.intent));
    }
    cellTitle(column, row) {
        const decoration = this.resolveDecoration(row, column);
        return decoration ? cellDecorationLabel[decoration.intent] : null;
    }
    cellContent(row, column) {
        if (column.cell)
            return column.cell(row, column);
        return String(row[column.key] ?? "");
    }
    rowClass(row) {
        return classNames(this.isRowSelected(row) && "st-dataTable__row--selected", this.onRowClick && "st-dataTable__row--clickable");
    }
    // --- Décoration : icône inline ------------------------------------------
    hasIcon(decoration) {
        return hasCellDecorationIcon(decoration.icon);
    }
    iconNodes(decoration) {
        if (!hasCellDecorationIcon(decoration.icon))
            return [];
        return cellDecorationIconNodes[decoration.icon];
    }
    decorationLabel(decoration) {
        return cellDecorationLabel[decoration.intent];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DataTable, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DataTable, isStandalone: true, selector: "st-data-table", inputs: { columns: "columns", rows: "rows", decorations: "decorations", caption: "caption", size: "size", selectable: "selectable", selectedIds: "selectedIds", onSelectionChange: "onSelectionChange", sortable: "sortable", sortBy: "sortBy", onSortChange: "onSortChange", pageSize: "pageSize", page: "page", onPageChange: "onPageChange", selectAllLabel: "selectAllLabel", selectRowLabel: "selectRowLabel", sortAscendingLabel: "sortAscendingLabel", sortDescendingLabel: "sortDescendingLabel", sortNoneLabel: "sortNoneLabel", previousLabel: "previousLabel", nextLabel: "nextLabel", paginationLabel: "paginationLabel", locale: "locale", rangeLabel: "rangeLabel", emptyLabel: "emptyLabel", onRowClick: "onRowClick", classInput: ["class", "classInput"] }, outputs: { sortChange: "sortChange", pageChange: "pageChange", selectionChange: "selectionChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DataTable, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { columns: [{
                type: NgInput
            }], rows: [{
                type: NgInput
            }], decorations: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], selectable: [{
                type: NgInput
            }], selectedIds: [{
                type: NgInput
            }], onSelectionChange: [{
                type: NgInput
            }], sortable: [{
                type: NgInput
            }], sortBy: [{
                type: NgInput
            }], onSortChange: [{
                type: NgInput
            }], pageSize: [{
                type: NgInput
            }], page: [{
                type: NgInput
            }], onPageChange: [{
                type: NgInput
            }], selectAllLabel: [{
                type: NgInput
            }], selectRowLabel: [{
                type: NgInput
            }], sortAscendingLabel: [{
                type: NgInput
            }], sortDescendingLabel: [{
                type: NgInput
            }], sortNoneLabel: [{
                type: NgInput
            }], previousLabel: [{
                type: NgInput
            }], nextLabel: [{
                type: NgInput
            }], paginationLabel: [{
                type: NgInput
            }], locale: [{
                type: NgInput
            }], rangeLabel: [{
                type: NgInput
            }], emptyLabel: [{
                type: NgInput
            }], onRowClick: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], sortChange: [{
                type: Output
            }], pageChange: [{
                type: Output
            }], selectionChange: [{
                type: Output
            }] } });
//# sourceMappingURL=DataTable.js.map