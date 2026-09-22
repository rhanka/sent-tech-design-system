<script lang="ts" module>
  import type { DashboardStore, PivotConfig, ConditionalFormat } from '@sentropic/dataviz-core';
  import type { DataTableColumn, DataTableRow } from '@sentropic/design-system-svelte';

  export type PivotDataTableProps = {
    store: DashboardStore;
    viewId?: string;
    rows: PivotConfig['rows'];
    columns?: PivotConfig['columns'];
    measures: PivotConfig['measures'];
    /**
     * FR-6 conditional formatting: rules keyed by pivot column key (the generated
     * column key from the pivot engine, e.g. the measure id or "measure__dim_value").
     * For each column with rules the cell values are evaluated and the resulting
     * CellDecoration is forwarded to the DS DataTable `decorations` prop.
     */
    conditionalFormat?: Record<string, ConditionalFormat>;
    caption?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  };

  type TableView = {
    columns: DataTableColumn[];
    rows: DataTableRow[];
  };
</script>

<script lang="ts">
  import { DataTable, type CellDecoration } from '@sentropic/design-system-svelte';
  import { buildPivotTable, evaluateConditionalFormat } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    rows,
    columns,
    measures,
    conditionalFormat,
    caption,
    size,
    class: className,
  }: PivotDataTableProps = $props();

  const dash = $derived(useDashboard(store));
  const table = $derived.by((): TableView => {
    void $dash;
    try {
      const pivot = buildPivotTable(store.model, store.applyCrossfilter(viewId), {
        rows,
        columns,
        measures,
      });
      return {
        columns: pivot.columns.map((column) => ({
          key: column.key,
          label: column.label,
          sortable: true,
          align: column.kind === 'value' ? 'end' : 'start',
        })),
        rows: pivot.rows,
      };
    } catch {
      return { columns: [], rows: [] };
    }
  });

  const decorations = $derived.by((): Record<string, Record<string, CellDecoration>> => {
    const result: Record<string, Record<string, CellDecoration>> = {};
    if (!conditionalFormat) return result;
    for (const colKey of Object.keys(conditionalFormat)) {
      const rules = conditionalFormat[colKey];
      const colValues = table.rows.map((r) => (typeof r[colKey] === 'number' ? (r[colKey] as number) : NaN));
      const ctx = { values: colValues };
      for (let i = 0; i < table.rows.length; i++) {
        const val = colValues[i];
        const dec = evaluateConditionalFormat(val, rules, ctx);
        if (dec) {
          const rowId = table.rows[i].id;
          if (!result[rowId]) result[rowId] = {};
          result[rowId][colKey] = dec;
        }
      }
    }
    return result;
  });
</script>

<DataTable columns={table.columns} rows={table.rows} {decorations} {caption} {size} class={className} />
