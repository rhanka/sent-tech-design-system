<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface DataTableColumn<R = DataTableRow> {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "start" | "center" | "end";
    width?: string;
    cell?: Snippet<[R, DataTableColumn<R>]>;
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
</script>

<script lang="ts">
  import type { HTMLTableAttributes } from "svelte/elements";

  type DataTableProps = Omit<HTMLTableAttributes, "class"> & {
    columns: DataTableColumn[];
    rows: DataTableRow[];
    caption?: string;
    size?: "sm" | "md" | "lg";
    selectable?: DataTableSelectMode;
    selectedIds?: string[];
    sortable?: boolean;
    sortBy?: DataTableSort | null;
    pageSize?: number;
    page?: number;
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

  let {
    columns,
    rows,
    caption,
    size = "md",
    selectable = "none",
    selectedIds = $bindable<string[]>([]),
    sortable = true,
    sortBy = $bindable<DataTableSort | null>(null),
    pageSize,
    page = $bindable(1),
    selectAllLabel = "Select all rows",
    selectRowLabel = "Select row",
    sortAscendingLabel = "Sorted ascending",
    sortDescendingLabel = "Sorted descending",
    sortNoneLabel = "Not sorted",
    previousLabel = "Previous",
    nextLabel = "Next",
    rangeLabel = ({ start, end, total }) => `${start}–${end} of ${total}`,
    emptyLabel = "No data",
    onRowClick,
    class: className,
    ...rest
  }: DataTableProps = $props();

  const classes = () =>
    ["st-dataTable", `st-dataTable--${size}`, className].filter(Boolean).join(" ");

  const isColumnSortable = (column: DataTableColumn) =>
    sortable && column.sortable !== false;

  const sortedRows = $derived.by(() => {
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
  });

  const pageCount = $derived(
    pageSize && pageSize > 0 ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1
  );

  const safePage = $derived(Math.min(Math.max(1, page), pageCount));

  const visibleRows = $derived.by(() => {
    if (!pageSize || pageSize <= 0) return sortedRows;
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  });

  const range = $derived.by(() => {
    if (!pageSize || pageSize <= 0) {
      return { start: sortedRows.length === 0 ? 0 : 1, end: sortedRows.length, total: sortedRows.length };
    }
    if (sortedRows.length === 0) return { start: 0, end: 0, total: 0 };
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, sortedRows.length);
    return { start, end, total: sortedRows.length };
  });

  const allVisibleSelected = $derived(
    selectable === "multiple" &&
      visibleRows.length > 0 &&
      visibleRows.every((row) => selectedIds.includes(row.id))
  );

  const someVisibleSelected = $derived(
    selectable === "multiple" &&
      visibleRows.some((row) => selectedIds.includes(row.id)) &&
      !allVisibleSelected
  );

  function ariaSortFor(column: DataTableColumn): "ascending" | "descending" | "none" | undefined {
    if (!isColumnSortable(column)) return undefined;
    if (sortBy?.key !== column.key) return "none";
    return sortBy.direction === "asc" ? "ascending" : "descending";
  }

  function toggleSort(column: DataTableColumn) {
    if (!isColumnSortable(column)) return;
    if (sortBy?.key !== column.key) {
      sortBy = { key: column.key, direction: "asc" };
      return;
    }
    if (sortBy.direction === "asc") {
      sortBy = { key: column.key, direction: "desc" };
      return;
    }
    sortBy = null;
  }

  function toggleRow(row: DataTableRow, checked: boolean) {
    if (selectable === "none") return;
    if (selectable === "single") {
      selectedIds = checked ? [row.id] : [];
      return;
    }
    selectedIds = checked
      ? [...selectedIds, row.id]
      : selectedIds.filter((id) => id !== row.id);
  }

  function toggleAllVisible(checked: boolean) {
    if (selectable !== "multiple") return;
    const visibleIds = visibleRows.map((r) => r.id);
    if (checked) {
      const merged = new Set([...selectedIds, ...visibleIds]);
      selectedIds = Array.from(merged);
    } else {
      selectedIds = selectedIds.filter((id) => !visibleIds.includes(id));
    }
  }

  function handleRowClick(row: DataTableRow) {
    onRowClick?.(row);
  }

  function alignClass(align?: "start" | "center" | "end") {
    if (align === "center") return "st-dataTable__cell--center";
    if (align === "end") return "st-dataTable__cell--end";
    return null;
  }

  function cellValue(row: DataTableRow, key: string) {
    return String(row[key] ?? "");
  }

  function goToPage(target: number) {
    if (target >= 1 && target <= pageCount && target !== safePage) {
      page = target;
    }
  }
</script>

<div class="st-dataTable-wrap">
  <table {...rest} class={classes()}>
    {#if caption}<caption>{caption}</caption>{/if}
    <thead>
      <tr>
        {#if selectable === "multiple"}
          <th scope="col" class="st-dataTable__select">
            <label class="st-dataTable__selectLabel">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                indeterminate={someVisibleSelected}
                aria-label={selectAllLabel}
                onchange={(e) => toggleAllVisible((e.currentTarget as HTMLInputElement).checked)}
              />
              <span class="st-visually-hidden">{selectAllLabel}</span>
            </label>
          </th>
        {:else if selectable === "single"}
          <th scope="col" class="st-dataTable__select" aria-label={selectRowLabel}></th>
        {/if}
        {#each columns as column (column.key)}
          {@const sortState = ariaSortFor(column)}
          {@const sortableCol = isColumnSortable(column)}
          <th
            scope="col"
            class={[alignClass(column.align)].filter(Boolean).join(" ") || undefined}
            aria-sort={sortState}
            style={column.width ? `width: ${column.width}` : undefined}
          >
            {#if sortableCol}
              <button
                type="button"
                class="st-dataTable__sortBtn"
                onclick={() => toggleSort(column)}
              >
                <span>{column.label}</span>
                <span class="st-dataTable__sortIcon" aria-hidden="true">
                  {#if sortState === "ascending"}↑
                  {:else if sortState === "descending"}↓
                  {:else}↕{/if}
                </span>
                <span class="st-visually-hidden">
                  {#if sortState === "ascending"}{sortAscendingLabel}
                  {:else if sortState === "descending"}{sortDescendingLabel}
                  {:else}{sortNoneLabel}{/if}
                </span>
              </button>
            {:else}
              {column.label}
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if visibleRows.length === 0}
        <tr>
          <td
            class="st-dataTable__empty"
            colspan={columns.length + (selectable !== "none" ? 1 : 0)}
          >
            {emptyLabel}
          </td>
        </tr>
      {:else}
        {#each visibleRows as row (row.id)}
          {@const isSelected = selectedIds.includes(row.id)}
          <tr
            class:st-dataTable__row--selected={isSelected}
            class:st-dataTable__row--clickable={Boolean(onRowClick)}
            onclick={onRowClick ? () => handleRowClick(row) : undefined}
          >
            {#if selectable === "multiple"}
              <td class="st-dataTable__select">
                <label class="st-dataTable__selectLabel">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    aria-label={`${selectRowLabel} ${row.id}`}
                    onclick={(e) => e.stopPropagation()}
                    onchange={(e) =>
                      toggleRow(row, (e.currentTarget as HTMLInputElement).checked)}
                  />
                  <span class="st-visually-hidden">{selectRowLabel}</span>
                </label>
              </td>
            {:else if selectable === "single"}
              <td class="st-dataTable__select">
                <label class="st-dataTable__selectLabel">
                  <input
                    type="radio"
                    name="st-dataTable-select"
                    checked={isSelected}
                    aria-label={`${selectRowLabel} ${row.id}`}
                    onclick={(e) => e.stopPropagation()}
                    onchange={(e) =>
                      toggleRow(row, (e.currentTarget as HTMLInputElement).checked)}
                  />
                  <span class="st-visually-hidden">{selectRowLabel}</span>
                </label>
              </td>
            {/if}
            {#each columns as column (column.key)}
              <td class={[alignClass(column.align)].filter(Boolean).join(" ") || undefined}>
                {#if column.cell}
                  {@render column.cell(row, column)}
                {:else}
                  {cellValue(row, column.key)}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if pageSize && pageSize > 0}
    <div class="st-dataTable__footer">
      <span class="st-dataTable__range" aria-live="polite">{rangeLabel(range)}</span>
      <nav class="st-dataTable__pager" aria-label="Pagination">
        <button
          type="button"
          class="st-dataTable__pagerBtn"
          disabled={safePage <= 1}
          onclick={() => goToPage(safePage - 1)}
        >
          {previousLabel}
        </button>
        <span class="st-dataTable__pagerStatus" aria-live="polite">
          {safePage} / {pageCount}
        </span>
        <button
          type="button"
          class="st-dataTable__pagerBtn"
          disabled={safePage >= pageCount}
          onclick={() => goToPage(safePage + 1)}
        >
          {nextLabel}
        </button>
      </nav>
    </div>
  {/if}
</div>

<style>
  .st-dataTable-wrap {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-dataTable-wrap:has(.st-dataTable) {
    overflow-x: auto;
  }

  .st-dataTable {
    background: var(--st-component-dataTable-rowBackground, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-dataTable-border, var(--st-semantic-border-subtle));
    border-collapse: separate;
    border-radius: var(--st-component-dataTable-radius, 0.5rem);
    border-spacing: 0;
    color: var(--st-component-dataTable-text, var(--st-semantic-text-primary));
    min-width: 100%;
  }

  .st-dataTable caption {
    color: var(--st-component-dataTable-captionText, var(--st-semantic-text-secondary));
    font-weight: 600;
    padding: 0.75rem;
    text-align: start;
  }

  .st-dataTable th,
  .st-dataTable td {
    border-bottom: 1px solid var(--st-component-dataTable-border, var(--st-semantic-border-subtle));
    padding: 0.75rem;
    text-align: start;
    vertical-align: top;
  }

  .st-dataTable--sm th,
  .st-dataTable--sm td {
    font-size: 0.8125rem;
    padding: 0.5rem 0.625rem;
  }

  .st-dataTable--lg th,
  .st-dataTable--lg td {
    padding: 1rem;
  }

  .st-dataTable th {
    background: var(--st-component-dataTable-headerBackground, var(--st-semantic-surface-subtle));
    font-size: 0.875rem;
    font-weight: 650;
  }

  .st-dataTable tbody tr:hover {
    background: var(--st-component-dataTable-rowHoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-dataTable tbody tr:last-child td {
    border-bottom: 0;
  }

  .st-dataTable__row--selected {
    background: color-mix(
      in srgb,
      var(--st-semantic-action-primary) 10%,
      var(--st-semantic-surface-default)
    );
  }

  .st-dataTable__row--clickable {
    cursor: pointer;
  }

  .st-dataTable__cell--center {
    text-align: center;
  }

  .st-dataTable__cell--end {
    text-align: end;
  }

  .st-dataTable__select {
    width: 2.5rem;
  }

  .st-dataTable__selectLabel {
    align-items: center;
    display: inline-flex;
    height: 1rem;
    justify-content: center;
    margin: 0;
    width: 1rem;
  }

  .st-dataTable__selectLabel input {
    accent-color: var(--st-semantic-action-primary);
    height: 1rem;
    margin: 0;
    width: 1rem;
  }

  .st-dataTable__sortBtn {
    align-items: center;
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-weight: 650;
    gap: 0.375rem;
    margin: -0.25rem -0.5rem;
    padding: 0.25rem 0.5rem;
    text-align: start;
  }

  .st-dataTable__sortBtn:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-dataTable__sortBtn:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-dataTable__sortIcon {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-dataTable th[aria-sort="ascending"] .st-dataTable__sortIcon,
  .st-dataTable th[aria-sort="descending"] .st-dataTable__sortIcon {
    color: var(--st-semantic-action-primary);
  }

  .st-dataTable__empty {
    color: var(--st-semantic-text-muted);
    text-align: center;
  }

  .st-dataTable__footer {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: flex;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.25rem 0.25rem 0;
  }

  .st-dataTable__range {
    font-variant-numeric: tabular-nums;
  }

  .st-dataTable__pager {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
  }

  .st-dataTable__pagerBtn {
    background: var(--st-component-pagination-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-pagination-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-pagination-radius, 0.375rem);
    color: var(--st-component-pagination-text, var(--st-semantic-text-primary));
    cursor: pointer;
    font: inherit;
    font-size: 0.8125rem;
    min-height: 2rem;
    padding: 0 0.625rem;
  }

  .st-dataTable__pagerBtn:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-dataTable__pagerBtn:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
    opacity: 0.65;
  }

  .st-dataTable__pagerStatus {
    font-variant-numeric: tabular-nums;
  }

  .st-visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
