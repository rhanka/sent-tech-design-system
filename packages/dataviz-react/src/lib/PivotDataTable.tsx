import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type DataTableProps,
  type CellDecoration,
} from '@sentropic/design-system-react';
import {
  buildPivotTable,
  evaluateConditionalFormat,
  type DashboardStore,
  type PivotConfig,
  type PivotTableRow,
  type ConditionalFormat,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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
  caption?: DataTableProps['caption'];
  size?: DataTableProps['size'];
  className?: string;
};

function toColumns(columns: ReturnType<typeof buildPivotTable>['columns']): DataTableColumn[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    sortable: true,
    align: column.kind === 'value' ? 'end' : 'start',
  }));
}

export function PivotDataTable({
  store,
  viewId,
  rows,
  columns,
  measures,
  conditionalFormat,
  caption,
  size,
  className,
}: PivotDataTableProps) {
  useDashboard(store);
  let table: { columns: DataTableColumn[]; rows: DataTableRow[] };
  try {
    const pivot = buildPivotTable(store.model, store.applyCrossfilter(viewId), {
      rows,
      columns,
      measures,
    });
    table = { columns: toColumns(pivot.columns), rows: pivot.rows as PivotTableRow[] };
  } catch {
    table = { columns: [], rows: [] };
  }

  // Build decorations map if conditionalFormat is provided
  const decorations: Record<string, Record<string, CellDecoration>> = {};
  if (conditionalFormat) {
    for (const colKey of Object.keys(conditionalFormat)) {
      const rules = conditionalFormat[colKey];
      const colValues = table.rows.map((r) => (typeof r[colKey] === 'number' ? (r[colKey] as number) : NaN));
      const ctx = { values: colValues };
      for (let i = 0; i < table.rows.length; i++) {
        const val = colValues[i];
        const dec = evaluateConditionalFormat(val, rules, ctx);
        if (dec) {
          const rowId = table.rows[i].id;
          if (!decorations[rowId]) decorations[rowId] = {};
          decorations[rowId][colKey] = dec;
        }
      }
    }
  }

  return (
    <DataTable
      columns={table.columns}
      rows={table.rows}
      decorations={decorations}
      caption={caption}
      size={size}
      className={className}
    />
  );
}
