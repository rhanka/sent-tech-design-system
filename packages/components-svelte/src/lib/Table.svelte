<script lang="ts" module>
  export interface TableColumn {
    key: string;
    label: string;
    align?: "left" | "right" | "center";
  }

  export type TableRow = Record<string, unknown>;
</script>

<script lang="ts">
  import type { HTMLTableAttributes } from "svelte/elements";

  type TableProps = Omit<HTMLTableAttributes, "class"> & {
    columns: TableColumn[];
    rows: TableRow[];
    caption?: string;
    class?: string;
  };

  let { columns, rows, caption, class: className, ...rest }: TableProps = $props();

  const classes = () => ["st-table", className].filter(Boolean).join(" ");
  const cellValue = (row: TableRow, key: string) => String(row[key] ?? "");
</script>

<div class="st-table-wrap">
  <table {...rest} class={classes()}>
    {#if caption}<caption>{caption}</caption>{/if}
    <thead>
      <tr>
        {#each columns as column}
          <th class:st-table__cell--right={column.align === "right"} class:st-table__cell--center={column.align === "center"} scope="col">
            {column.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each columns as column}
            <td class:st-table__cell--right={column.align === "right"} class:st-table__cell--center={column.align === "center"}>
              {cellValue(row, column.key)}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .st-table-wrap {
    overflow-x: auto;
  }

  .st-table {
    background: var(--st-component-dataTable-rowBackground, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-dataTable-border, var(--st-semantic-border-subtle));
    border-collapse: separate;
    border-radius: var(--st-component-dataTable-radius, 0.5rem);
    border-spacing: 0;
    color: var(--st-component-dataTable-text, var(--st-semantic-text-primary));
    min-width: 100%;
  }

  .st-table caption {
    color: var(--st-component-dataTable-captionText, var(--st-semantic-text-secondary));
    font-weight: 600;
    padding: 0.75rem;
    text-align: left;
  }

  .st-table th,
  .st-table td {
    border-bottom: 1px solid var(--st-component-dataTable-border, var(--st-semantic-border-subtle));
    padding: 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  .st-table th {
    background: var(--st-component-dataTable-headerBackground, var(--st-semantic-surface-subtle));
    font-size: 0.875rem;
    font-weight: 650;
  }

  .st-table tbody tr:hover {
    background: var(--st-component-dataTable-rowHoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .st-table__cell--right {
    text-align: right;
  }

  .st-table__cell--center {
    text-align: center;
  }
</style>
