import { defineComponent, h, ref, type VNodeChild } from "vue";
import { classNames } from "./classNames.js";
import {
  type CellDecoration,
  cellDecorationClass,
  cellDecorationLabel,
  renderCellDecorationIcon,
} from "./cellDecoration.js";

export type { CellDecoration, CellDecorationIntent } from "./cellDecoration.js";

export interface DataTableColumn<R extends DataTableRow = DataTableRow> {
  key: string;
  label: VNodeChild;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string;
  cell?: (row: R, column: DataTableColumn<R>) => VNodeChild;
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
  caption?: VNodeChild;
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
  rangeLabel?: (range: { start: number; end: number; total: number }) => string;
  emptyLabel?: string;
  onRowClick?: (row: DataTableRow) => void;
  class?: string;
};

export const DataTable = defineComponent({
  name: "DataTable",
  props: {
    columns: { type: Array as () => DataTableColumn[], required: true },
    rows: { type: Array as () => DataTableRow[], required: true },
    decorations: {
      type: Object as () => Record<string, Record<string, CellDecoration>>,
      default: undefined,
    },
    caption: { type: null as unknown as () => VNodeChild, default: undefined },
    size: { type: String as () => DataTableSize, default: "md" },
    selectable: { type: String as () => DataTableSelectMode, default: "none" },
    selectedIds: { type: Array as () => string[], default: undefined },
    onSelectionChange: { type: Function as unknown as () => (ids: string[]) => void, default: undefined },
    sortable: { type: Boolean, default: true },
    sortBy: { type: Object as () => DataTableSort | null, default: undefined },
    onSortChange: { type: Function as unknown as () => (sortBy: DataTableSort | null) => void, default: undefined },
    pageSize: { type: Number, default: undefined },
    page: { type: Number, default: undefined },
    onPageChange: { type: Function as unknown as () => (page: number) => void, default: undefined },
    selectAllLabel: { type: String, default: "Select all rows" },
    selectRowLabel: { type: String, default: "Select row" },
    sortAscendingLabel: { type: String, default: "Sorted ascending" },
    sortDescendingLabel: { type: String, default: "Sorted descending" },
    sortNoneLabel: { type: String, default: "Not sorted" },
    previousLabel: { type: String, default: "Previous" },
    nextLabel: { type: String, default: "Next" },
    paginationLabel: { type: String, default: "Pagination" },
    rangeLabel: {
      type: Function as unknown as () => (range: { start: number; end: number; total: number }) => string,
      default: ({ start, end, total }: { start: number; end: number; total: number }) => `${start}–${end} of ${total}`,
    },
    emptyLabel: { type: String, default: "No data" },
    onRowClick: { type: Function as unknown as () => (row: DataTableRow) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const selectedIdsState = ref<string[]>(props.selectedIds ?? []);
    const sortByState = ref<DataTableSort | null>(props.sortBy ?? null);
    const pageState = ref<number>(props.page ?? 1);

    function commitSelection(next: string[]) {
      if (props.selectedIds === undefined) selectedIdsState.value = next;
      props.onSelectionChange?.(next);
    }
    function commitSort(next: DataTableSort | null) {
      if (props.sortBy === undefined) sortByState.value = next;
      props.onSortChange?.(next);
    }
    function commitPage(next: number) {
      if (props.page === undefined) pageState.value = next;
      props.onPageChange?.(next);
    }

    return () => {
      const columns = props.columns;
      const rows = props.rows;
      const size = props.size ?? "md";
      const selectable = props.selectable ?? "none";
      const sortable = props.sortable ?? true;
      const pageSize = props.pageSize;

      const selectedIds = props.selectedIds ?? selectedIdsState.value;
      const sortBy = props.sortBy !== undefined ? props.sortBy : sortByState.value;
      const page = props.page ?? pageState.value;

      const isColumnSortable = (column: DataTableColumn) => sortable && column.sortable !== false;

      let sortedRows = rows;
      if (sortBy) {
        const { key, direction } = sortBy;
        const factor = direction === "asc" ? 1 : -1;
        sortedRows = [...rows].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (typeof av === "number" && typeof bv === "number") {
            return (av - bv) * factor;
          }
          return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * factor;
        });
      }

      const pageCount = pageSize && pageSize > 0 ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
      const safePage = Math.min(Math.max(1, page), pageCount);

      let visibleRows = sortedRows;
      if (pageSize && pageSize > 0) {
        const start = (safePage - 1) * pageSize;
        visibleRows = sortedRows.slice(start, start + pageSize);
      }

      let range: { start: number; end: number; total: number };
      if (!pageSize || pageSize <= 0) {
        range = { start: sortedRows.length === 0 ? 0 : 1, end: sortedRows.length, total: sortedRows.length };
      } else if (sortedRows.length === 0) {
        range = { start: 0, end: 0, total: 0 };
      } else {
        range = {
          start: (safePage - 1) * pageSize + 1,
          end: Math.min(safePage * pageSize, sortedRows.length),
          total: sortedRows.length,
        };
      }

      const allVisibleSelected =
        selectable === "multiple" && visibleRows.length > 0 && visibleRows.every((row) => selectedIds.includes(row.id));
      const someVisibleSelected =
        selectable === "multiple" && visibleRows.some((row) => selectedIds.includes(row.id)) && !allVisibleSelected;

      function ariaSortFor(column: DataTableColumn): "ascending" | "descending" | "none" | undefined {
        if (!isColumnSortable(column)) return undefined;
        if (sortBy?.key !== column.key) return "none";
        return sortBy.direction === "asc" ? "ascending" : "descending";
      }

      function toggleSort(column: DataTableColumn) {
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

      function toggleRow(row: DataTableRow, checked: boolean) {
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
          commitSelection(Array.from(new Set([...selectedIds, ...visibleIds])));
        } else {
          commitSelection(selectedIds.filter((id) => !visibleIds.includes(id)));
        }
      }

      function alignClass(align?: "start" | "center" | "end") {
        if (align === "center") return "st-dataTable__cell--center";
        if (align === "end") return "st-dataTable__cell--end";
        return undefined;
      }

      const decorationsMap = props.decorations;
      function resolveDecoration(row: DataTableRow, column: DataTableColumn): CellDecoration | null {
        // La map `decorations` gagne sur le callback `column.cellDecoration`.
        const fromMap = decorationsMap?.[row.id]?.[column.key];
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

      // ---- header ----
      const headerCells: ReturnType<typeof h>[] = [];
      if (selectable === "multiple") {
        headerCells.push(
          h("th", { scope: "col", class: "st-dataTable__select" }, [
            h("label", { class: "st-dataTable__selectLabel" }, [
              h("input", {
                type: "checkbox",
                checked: allVisibleSelected,
                indeterminate: someVisibleSelected,
                "aria-label": props.selectAllLabel,
                onChange: (e: Event) => toggleAllVisible((e.currentTarget as HTMLInputElement).checked),
              }),
              h("span", { class: "st-visually-hidden" }, props.selectAllLabel),
            ]),
          ]),
        );
      } else if (selectable === "single") {
        headerCells.push(h("th", { scope: "col", class: "st-dataTable__select", "aria-label": props.selectRowLabel }));
      }
      for (const column of columns) {
        const sortState = ariaSortFor(column);
        const sortableCol = isColumnSortable(column);
        headerCells.push(
          h(
            "th",
            {
              key: column.key,
              scope: "col",
              class: alignClass(column.align),
              "aria-sort": sortState,
              style: column.width ? `width: ${column.width}` : undefined,
            },
            sortableCol
              ? [
                  h("button", { type: "button", class: "st-dataTable__sortBtn", onClick: () => toggleSort(column) }, [
                    h("span", {}, [column.label]),
                    h(
                      "span",
                      { class: "st-dataTable__sortIcon", "aria-hidden": "true" },
                      sortState === "ascending" ? "↑" : sortState === "descending" ? "↓" : "↕",
                    ),
                    h(
                      "span",
                      { class: "st-visually-hidden" },
                      sortState === "ascending"
                        ? props.sortAscendingLabel
                        : sortState === "descending"
                          ? props.sortDescendingLabel
                          : props.sortNoneLabel,
                    ),
                  ]),
                ]
              : [column.label],
          ),
        );
      }

      // ---- body ----
      let bodyChildren: ReturnType<typeof h>[];
      if (visibleRows.length === 0) {
        bodyChildren = [
          h("tr", {}, [h("td", { class: "st-dataTable__empty", colspan: selectColspan }, props.emptyLabel)]),
        ];
      } else {
        bodyChildren = visibleRows.map((row) => {
          const isSelected = selectedIds.includes(row.id);
          const rowCells: ReturnType<typeof h>[] = [];
          if (selectable === "multiple") {
            rowCells.push(
              h("td", { class: "st-dataTable__select" }, [
                h("label", { class: "st-dataTable__selectLabel" }, [
                  h("input", {
                    type: "checkbox",
                    checked: isSelected,
                    "aria-label": `${props.selectRowLabel} ${row.id}`,
                    onClick: (e: Event) => e.stopPropagation(),
                    onChange: (e: Event) => toggleRow(row, (e.currentTarget as HTMLInputElement).checked),
                  }),
                  h("span", { class: "st-visually-hidden" }, props.selectRowLabel),
                ]),
              ]),
            );
          } else if (selectable === "single") {
            rowCells.push(
              h("td", { class: "st-dataTable__select" }, [
                h("label", { class: "st-dataTable__selectLabel" }, [
                  h("input", {
                    type: "radio",
                    name: "st-dataTable-select",
                    checked: isSelected,
                    "aria-label": `${props.selectRowLabel} ${row.id}`,
                    onClick: (e: Event) => e.stopPropagation(),
                    onChange: (e: Event) => toggleRow(row, (e.currentTarget as HTMLInputElement).checked),
                  }),
                  h("span", { class: "st-visually-hidden" }, props.selectRowLabel),
                ]),
              ]),
            );
          }
          for (const column of columns) {
            const decoration = resolveDecoration(row, column);
            const content = column.cell ? [column.cell(row, column)] : String(row[column.key] ?? "");
            rowCells.push(
              h(
                "td",
                {
                  key: column.key,
                  class: classNames(
                    alignClass(column.align),
                    decoration && "st-cell",
                    decoration && cellDecorationClass(decoration.intent),
                  ),
                  title: decoration ? cellDecorationLabel[decoration.intent] : undefined,
                },
                decoration
                  ? [
                      h("span", { class: "st-cell__content" }, [
                        renderCellDecorationIcon(decoration.icon),
                        h("span", {}, content),
                        h(
                          "span",
                          { class: "st-visually-hidden" },
                          cellDecorationLabel[decoration.intent],
                        ),
                      ]),
                    ]
                  : content,
              ),
            );
          }
          return h(
            "tr",
            {
              key: row.id,
              class: classNames(
                isSelected && "st-dataTable__row--selected",
                props.onRowClick && "st-dataTable__row--clickable",
              ),
              onClick: props.onRowClick ? () => props.onRowClick?.(row) : undefined,
            },
            rowCells,
          );
        });
      }

      const tableChildren: ReturnType<typeof h>[] = [];
      if (props.caption) tableChildren.push(h("caption", {}, [props.caption]));
      tableChildren.push(h("thead", {}, [h("tr", {}, headerCells)]));
      tableChildren.push(h("tbody", {}, bodyChildren));

      const wrapChildren: ReturnType<typeof h>[] = [
        h(
          "table",
          { ...attrs, class: classNames("st-dataTable", `st-dataTable--${size}`, props.class) },
          tableChildren,
        ),
      ];

      if (pageSize && pageSize > 0) {
        wrapChildren.push(
          h("div", { class: "st-dataTable__footer" }, [
            h("span", { class: "st-dataTable__range", "aria-live": "polite" }, props.rangeLabel(range)),
            h("nav", { class: "st-dataTable__pager", "aria-label": props.paginationLabel }, [
              h(
                "button",
                {
                  type: "button",
                  class: "st-dataTable__pagerBtn",
                  disabled: safePage <= 1,
                  onClick: () => goToPage(safePage - 1),
                },
                props.previousLabel,
              ),
              h("span", { class: "st-dataTable__pagerStatus", "aria-live": "polite" }, `${safePage} / ${pageCount}`),
              h(
                "button",
                {
                  type: "button",
                  class: "st-dataTable__pagerBtn",
                  disabled: safePage >= pageCount,
                  onClick: () => goToPage(safePage + 1),
                },
                props.nextLabel,
              ),
            ]),
          ]),
        );
      }

      return h("div", { class: "st-dataTable-wrap" }, wrapChildren);
    };
  },
});
