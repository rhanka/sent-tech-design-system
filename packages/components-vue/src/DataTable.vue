<script setup lang="ts">
import { ref, computed } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';
import { type CellDecoration, cellDecorationClass, cellDecorationLabel } from './cellDecoration.js';
import CellDecorationIcon from './CellDecorationIcon.vue';


export type { CellDecoration, CellDecorationIntent } from "./cellDecoration.js";


export interface DataTableColumn<R extends DataTableRow = DataTableRow> {
  key: string;

  /** @slot column-label */
  label?: string | number;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string;
  cell?: (row: R, column: DataTableColumn<R>) => string | number;
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
  caption?: string | number;
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
  locale?: string;
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
defineOptions({ name: 'DataTable', inheritAttrs: false });
const props = withDefaults(defineProps<DataTableProps>(), { decorations: undefined, caption: undefined, size: "md", selectable: "none", selectedIds: undefined, onSelectionChange: undefined, sortable: true, sortBy: undefined, onSortChange: undefined, pageSize: undefined, page: undefined, onPageChange: undefined, locale: "fr-FR", selectAllLabel: "Select all rows", selectRowLabel: "Select row", sortAscendingLabel: "Sorted ascending", sortDescendingLabel: "Sorted descending", sortNoneLabel: "Not sorted", previousLabel: undefined, nextLabel: undefined, paginationLabel: "Pagination", rangeLabel: ({ start, end, total }: { start: number; end: number; total: number }) => `${start}–${end} of ${total}`, emptyLabel: "No data", onRowClick: undefined, class: undefined });
defineSlots<{ caption?: () => unknown; 'column-label'?: (scope: { column: DataTableColumn; columnIndex: number }) => unknown; cell?: (scope: { row: DataTableRow; column: DataTableColumn; rowIndex: number; columnIndex: number; value: unknown }) => unknown }>();


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
const state = computed(() => {
      const isFr = (props.locale ?? "fr-FR").toLowerCase().startsWith("fr");

      const resolvedPreviousLabel = props.previousLabel ?? (isFr ? "Précédent" : "Previous");

      const resolvedNextLabel = props.nextLabel ?? (isFr ? "Suivant" : "Next");


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
  const cellRows = visibleRows.map(row => ({ row, selected: selectedIds.includes(row.id), cells: columns.map(column => ({ column, decoration: resolveDecoration(row, column) })) }));
  return { columns, size, selectable, pageSize, selectedIds, safePage, pageCount, range, allVisibleSelected, someVisibleSelected, isColumnSortable, ariaSortFor, toggleSort, toggleRow, toggleAllVisible, alignClass, goToPage, selectColspan, resolvedPreviousLabel, resolvedNextLabel, cellRows };
});
</script>

<template>
  <div class="st-dataTable-wrap"><table v-bind="{ ...$attrs, class: classNames('st-dataTable', `st-dataTable--${state.size}`, props.class) }">
    <caption v-if="props.caption || $slots.caption"><slot v-if="$slots.caption" name="caption" /><template v-else>{{ scalarContent(props.caption) }}</template></caption>
    <thead><tr><th v-if="state.selectable === 'multiple'" scope="col" class="st-dataTable__select"><label class="st-dataTable__selectLabel"><input type="checkbox" :checked="state.allVisibleSelected" :indeterminate="state.someVisibleSelected" :aria-label="props.selectAllLabel" @change="state.toggleAllVisible(($event.currentTarget as HTMLInputElement).checked)" /><span class="st-visually-hidden">{{ props.selectAllLabel }}</span></label></th><th v-else-if="state.selectable === 'single'" scope="col" class="st-dataTable__select" :aria-label="props.selectRowLabel" />
      <th v-for="(column, columnIndex) in state.columns" :key="column.key" scope="col" :class="state.alignClass(column.align)" :aria-sort="state.ariaSortFor(column)" :style="column.width ? `width: ${column.width}` : undefined"><button v-if="state.isColumnSortable(column)" type="button" class="st-dataTable__sortBtn" @click="state.toggleSort(column)"><span><slot v-if="$slots['column-label']" name="column-label" :column="column" :column-index="columnIndex" /><template v-else>{{ scalarContent(column.label) }}</template></span><span class="st-dataTable__sortIcon" aria-hidden="true">{{ state.ariaSortFor(column) === 'ascending' ? '↑' : state.ariaSortFor(column) === 'descending' ? '↓' : '↕' }}</span><span class="st-visually-hidden">{{ state.ariaSortFor(column) === 'ascending' ? props.sortAscendingLabel : state.ariaSortFor(column) === 'descending' ? props.sortDescendingLabel : props.sortNoneLabel }}</span></button><template v-else><slot v-if="$slots['column-label']" name="column-label" :column="column" :column-index="columnIndex" /><template v-else>{{ scalarContent(column.label) }}</template></template></th>
    </tr></thead>
    <tbody><tr v-if="state.cellRows.length === 0"><td class="st-dataTable__empty" :colspan="state.selectColspan">{{ props.emptyLabel }}</td></tr><tr v-for="(entry, rowIndex) in state.cellRows" v-else :key="entry.row.id" :class="classNames(entry.selected && 'st-dataTable__row--selected', props.onRowClick && 'st-dataTable__row--clickable')" @click="props.onRowClick?.(entry.row)">
      <td v-if="state.selectable === 'multiple' || state.selectable === 'single'" class="st-dataTable__select"><label class="st-dataTable__selectLabel"><input :type="state.selectable === 'multiple' ? 'checkbox' : 'radio'" :name="state.selectable === 'single' ? 'st-dataTable-select' : undefined" :checked="entry.selected" :aria-label="`${props.selectRowLabel} ${entry.row.id}`" @click.stop @change="state.toggleRow(entry.row, ($event.currentTarget as HTMLInputElement).checked)" /><span class="st-visually-hidden">{{ props.selectRowLabel }}</span></label></td>
      <td v-for="(cell, columnIndex) in entry.cells" :key="cell.column.key" :class="classNames(state.alignClass(cell.column.align), cell.decoration && 'st-cell', cell.decoration && cellDecorationClass(cell.decoration.intent))" :title="cell.decoration ? cellDecorationLabel[cell.decoration.intent] : undefined"><span v-if="cell.decoration" class="st-cell__content"><CellDecorationIcon :icon="cell.decoration.icon" /><span><slot v-if="$slots.cell" name="cell" :row="entry.row" :column="cell.column" :row-index="rowIndex" :column-index="columnIndex" :value="entry.row[cell.column.key]" /><template v-else>{{ scalarContent(cell.column.cell ? cell.column.cell(entry.row, cell.column) : String(entry.row[cell.column.key] ?? '')) }}</template></span><span class="st-visually-hidden">{{ cellDecorationLabel[cell.decoration.intent] }}</span></span><template v-else><slot v-if="$slots.cell" name="cell" :row="entry.row" :column="cell.column" :row-index="rowIndex" :column-index="columnIndex" :value="entry.row[cell.column.key]" /><template v-else>{{ scalarContent(cell.column.cell ? cell.column.cell(entry.row, cell.column) : String(entry.row[cell.column.key] ?? '')) }}</template></template></td>
    </tr></tbody>
  </table><div v-if="state.pageSize && state.pageSize > 0" class="st-dataTable__footer"><span class="st-dataTable__range" aria-live="polite">{{ props.rangeLabel(state.range) }}</span><nav class="st-dataTable__pager" :aria-label="props.paginationLabel"><button type="button" class="st-dataTable__pagerBtn" :disabled="state.safePage <= 1" @click="state.goToPage(state.safePage - 1)">{{ state.resolvedPreviousLabel }}</button><span class="st-dataTable__pagerStatus" aria-live="polite">{{ state.safePage + ' / ' + state.pageCount }}</span><button type="button" class="st-dataTable__pagerBtn" :disabled="state.safePage >= state.pageCount" @click="state.goToPage(state.safePage + 1)">{{ state.resolvedNextLabel }}</button></nav></div></div>
</template>
