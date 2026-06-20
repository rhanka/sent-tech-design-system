import React from "react";
import { classNames } from "./classNames.js";
import {
  type CellDecoration,
  cellDecorationClass,
  cellDecorationLabel,
  CellDecorationIcon,
} from "./cellDecoration.js";

export type { CellDecoration, CellDecorationIntent } from "./cellDecoration.js";

export interface DataTableColumn<R extends DataTableRow = DataTableRow> {
  key: string;
  label: React.ReactNode;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string;
  cell?: (row: R, column: DataTableColumn<R>) => React.ReactNode;
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

export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
}

export type DataTableProps<R extends DataTableRow = DataTableRow> = Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "className"
> & {
  columns: Array<DataTableColumn<R>>;
  rows: R[];
  /**
   * Conditional formatting : décorations sémantiques par cellule, indexées
   * `rowId` → `colId` → décoration. Prioritaire sur `column.cellDecoration`.
   */
  decorations?: Record<string, Record<string, CellDecoration>>;
  caption?: React.ReactNode;
  size?: "sm" | "md" | "lg";
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
  locale?: string;
  previousLabel?: string;
  nextLabel?: string;
  paginationLabel?: string;
  rangeLabel?: (range: { start: number; end: number; total: number }) => string;
  emptyLabel?: string;
  onRowClick?: (row: R) => void;
  className?: string;
};

export function DataTable<R extends DataTableRow = DataTableRow>({
  columns,
  rows,
  caption,
  size = "md",
  selectable = "none",
  selectedIds: selectedIdsProp,
  onSelectionChange,
  sortable = true,
  sortBy: sortByProp,
  onSortChange,
  pageSize,
  page: pageProp,
  onPageChange,
  locale = "fr-FR",
  selectAllLabel = "Select all rows",
  selectRowLabel = "Select row",
  sortAscendingLabel = "Sorted ascending",
  sortDescendingLabel = "Sorted descending",
  sortNoneLabel = "Not sorted",
  previousLabel,
  nextLabel,
  paginationLabel = "Pagination",
  rangeLabel = ({ start, end, total }) => `${start}–${end} of ${total}`,
  emptyLabel = "No data",
  onRowClick,
  className,
  decorations,
  ...rest
}: DataTableProps<R>) {
  const [selectedIdsState, setSelectedIdsState] = React.useState<string[]>(selectedIdsProp ?? []);
  const [sortByState, setSortByState] = React.useState<DataTableSort | null>(sortByProp ?? null);
  const [pageState, setPageState] = React.useState<number>(pageProp ?? 1);

  const selectedIds = selectedIdsProp ?? selectedIdsState;
  const sortBy = sortByProp !== undefined ? sortByProp : sortByState;
  const page = pageProp ?? pageState;

  const commitSelection = (next: string[]) => {
    if (selectedIdsProp === undefined) setSelectedIdsState(next);
    onSelectionChange?.(next);
  };
  const commitSort = (next: DataTableSort | null) => {
    if (sortByProp === undefined) setSortByState(next);
    onSortChange?.(next);
  };
  const commitPage = (next: number) => {
    if (pageProp === undefined) setPageState(next);
    onPageChange?.(next);
  };

  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedPreviousLabel = previousLabel ?? (isFr ? "Précédent" : "Previous");
  const resolvedNextLabel = nextLabel ?? (isFr ? "Suivant" : "Next");

  const classes = classNames("st-dataTable", `st-dataTable--${size}`, className);

  const isColumnSortable = (column: DataTableColumn<R>) => sortable && column.sortable !== false;

  const sortedRows = (() => {
    if (!sortBy) return rows;
    const { key, direction } = sortBy;
    const factor = direction === "asc" ? 1 : -1;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * factor;
      }
      const as = String(av);
      const bs = String(bv);
      return as.localeCompare(bs, undefined, { numeric: true, sensitivity: "base" }) * factor;
    });
    return copy;
  })();

  const pageCount = pageSize && pageSize > 0 ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const safePage = Math.min(Math.max(1, page), pageCount);

  const visibleRows = (() => {
    if (!pageSize || pageSize <= 0) return sortedRows;
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  })();

  const range = (() => {
    if (!pageSize || pageSize <= 0) {
      return { start: sortedRows.length === 0 ? 0 : 1, end: sortedRows.length, total: sortedRows.length };
    }
    if (sortedRows.length === 0) return { start: 0, end: 0, total: 0 };
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, sortedRows.length);
    return { start, end, total: sortedRows.length };
  })();

  const allVisibleSelected =
    selectable === "multiple" && visibleRows.length > 0 && visibleRows.every((row) => selectedIds.includes(row.id));
  const someVisibleSelected =
    selectable === "multiple" && visibleRows.some((row) => selectedIds.includes(row.id)) && !allVisibleSelected;

  function ariaSortFor(column: DataTableColumn<R>): "ascending" | "descending" | "none" | undefined {
    if (!isColumnSortable(column)) return undefined;
    if (sortBy?.key !== column.key) return "none";
    return sortBy.direction === "asc" ? "ascending" : "descending";
  }

  function toggleSort(column: DataTableColumn<R>) {
    if (!isColumnSortable(column)) return;
    if (sortBy?.key !== column.key) {
      commitSort({ key: column.key, direction: "asc" });
      return;
    }
    if (sortBy.direction === "asc") {
      commitSort({ key: column.key, direction: "desc" });
      return;
    }
    commitSort(null);
  }

  function toggleRow(row: R, checked: boolean) {
    if (selectable === "none") return;
    if (selectable === "single") {
      commitSelection(checked ? [row.id] : []);
      return;
    }
    commitSelection(checked ? [...selectedIds, row.id] : selectedIds.filter((id) => id !== row.id));
  }

  function toggleAllVisible(checked: boolean) {
    if (selectable !== "multiple") return;
    const visibleIds = visibleRows.map((r) => r.id);
    if (checked) {
      const merged = new Set([...selectedIds, ...visibleIds]);
      commitSelection(Array.from(merged));
    } else {
      commitSelection(selectedIds.filter((id) => !visibleIds.includes(id)));
    }
  }

  function alignClass(align?: "start" | "center" | "end") {
    if (align === "center") return "st-dataTable__cell--center";
    if (align === "end") return "st-dataTable__cell--end";
    return undefined;
  }

  function cellValue(row: R, key: string) {
    return String(row[key] ?? "");
  }

  function resolveDecoration(row: R, column: DataTableColumn<R>): CellDecoration | null {
    // La map `decorations` gagne sur le callback `column.cellDecoration`.
    const fromMap = decorations?.[row.id]?.[column.key];
    if (fromMap) return fromMap;
    if (column.cellDecoration) {
      return column.cellDecoration(row, row[column.key], column.key) ?? null;
    }
    return null;
  }

  function goToPage(target: number) {
    if (target >= 1 && target <= pageCount && target !== safePage) {
      commitPage(target);
    }
  }

  const selectColspan = columns.length + (selectable !== "none" ? 1 : 0);

  return (
    <div className="st-dataTable-wrap">
      <table {...rest} className={classes}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {selectable === "multiple" ? (
              <th scope="col" className="st-dataTable__select">
                <label className="st-dataTable__selectLabel">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    aria-label={selectAllLabel}
                    onChange={(e) => toggleAllVisible(e.currentTarget.checked)}
                  />
                  <span className="st-visually-hidden">{selectAllLabel}</span>
                </label>
              </th>
            ) : selectable === "single" ? (
              <th scope="col" className="st-dataTable__select" aria-label={selectRowLabel} />
            ) : null}
            {columns.map((column) => {
              const sortState = ariaSortFor(column);
              const sortableCol = isColumnSortable(column);
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={alignClass(column.align)}
                  aria-sort={sortState}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {sortableCol ? (
                    <button type="button" className="st-dataTable__sortBtn" onClick={() => toggleSort(column)}>
                      <span>{column.label}</span>
                      <span className="st-dataTable__sortIcon" aria-hidden="true">
                        {sortState === "ascending" ? "↑" : sortState === "descending" ? "↓" : "↕"}
                      </span>
                      <span className="st-visually-hidden">
                        {sortState === "ascending"
                          ? sortAscendingLabel
                          : sortState === "descending"
                            ? sortDescendingLabel
                            : sortNoneLabel}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visibleRows.length === 0 ? (
            <tr>
              <td className="st-dataTable__empty" colSpan={selectColspan}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            visibleRows.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr
                  key={row.id}
                  className={classNames(
                    isSelected && "st-dataTable__row--selected",
                    onRowClick && "st-dataTable__row--clickable",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable === "multiple" ? (
                    <td className="st-dataTable__select">
                      <label className="st-dataTable__selectLabel">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          aria-label={`${selectRowLabel} ${row.id}`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => toggleRow(row, e.currentTarget.checked)}
                        />
                        <span className="st-visually-hidden">{selectRowLabel}</span>
                      </label>
                    </td>
                  ) : selectable === "single" ? (
                    <td className="st-dataTable__select">
                      <label className="st-dataTable__selectLabel">
                        <input
                          type="radio"
                          name="st-dataTable-select"
                          checked={isSelected}
                          aria-label={`${selectRowLabel} ${row.id}`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => toggleRow(row, e.currentTarget.checked)}
                        />
                        <span className="st-visually-hidden">{selectRowLabel}</span>
                      </label>
                    </td>
                  ) : null}
                  {columns.map((column) => {
                    const decoration = resolveDecoration(row, column);
                    return (
                      <td
                        key={column.key}
                        className={classNames(
                          alignClass(column.align),
                          decoration && "st-cell",
                          decoration && cellDecorationClass(decoration.intent),
                        )}
                        title={decoration ? cellDecorationLabel[decoration.intent] : undefined}
                      >
                        {decoration ? (
                          <span className="st-cell__content">
                            <CellDecorationIcon icon={decoration.icon} />
                            <span>
                              {column.cell ? column.cell(row, column) : cellValue(row, column.key)}
                            </span>
                            <span className="st-visually-hidden">
                              {cellDecorationLabel[decoration.intent]}
                            </span>
                          </span>
                        ) : column.cell ? (
                          column.cell(row, column)
                        ) : (
                          cellValue(row, column.key)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {pageSize && pageSize > 0 ? (
        <div className="st-dataTable__footer">
          <span className="st-dataTable__range" aria-live="polite">
            {rangeLabel(range)}
          </span>
          <nav className="st-dataTable__pager" aria-label={paginationLabel}>
            <button
              type="button"
              className="st-dataTable__pagerBtn"
              disabled={safePage <= 1}
              onClick={() => goToPage(safePage - 1)}
            >
              {resolvedPreviousLabel}
            </button>
            <span className="st-dataTable__pagerStatus" aria-live="polite">
              {safePage} / {pageCount}
            </span>
            <button
              type="button"
              className="st-dataTable__pagerBtn"
              disabled={safePage >= pageCount}
              onClick={() => goToPage(safePage + 1)}
            >
              {resolvedNextLabel}
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
