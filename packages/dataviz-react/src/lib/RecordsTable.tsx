import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type CellDecoration,
} from '@sentropic/design-system-react';
import { findMeasure, evaluateConditionalFormat, type DashboardStore, type ConditionalFormat } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type RecordsTableProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id in the cross-filter graph (rows shown are its visible rows). */
  viewId?: string;
  /** Field ids (and order) to show as columns; defaults to all model fields. */
  fields?: string[];
  /**
   * FR-6 conditional formatting: rules keyed by column id (measure field).
   * For each column with rules the cell values are evaluated row × col and
   * the resulting CellDecoration is forwarded to the DS DataTable `decorations` prop.
   */
  conditionalFormat?: Record<string, ConditionalFormat>;
  caption?: string;
  size?: 'sm' | 'md' | 'lg';
  pageSize?: number;
  className?: string;
};

/**
 * The underlying ("show records") rows for a view — the cross-filtered data
 * rendered as a design-system DataTable. Columns come from the data model.
 */
export function RecordsTable({
  store,
  viewId,
  fields,
  conditionalFormat,
  caption,
  size,
  pageSize,
  className,
}: RecordsTableProps) {
  useDashboard(store);
  const ids = fields ?? [
    ...store.model.dimensions.map((d) => d.id),
    ...store.model.measures.map((m) => m.id),
  ];
  const columns: DataTableColumn[] = ids.map((id) => {
    const dim = store.model.dimensions.find((d) => d.id === id);
    const meas = findMeasure(store.model, id);
    return {
      key: id,
      label: dim?.label ?? meas?.label ?? id,
      sortable: true,
      align: meas ? 'end' : 'start',
    };
  });
  const rows: DataTableRow[] = store.applyCrossfilter(viewId).map((row, i) => ({ ...row, id: String(i) }));

  // Build decorations map if conditionalFormat is provided
  const decorations: Record<string, Record<string, CellDecoration>> = {};
  if (conditionalFormat) {
    for (const colId of Object.keys(conditionalFormat)) {
      const rules = conditionalFormat[colId];
      const colValues = rows.map((r) => (typeof r[colId] === 'number' ? (r[colId] as number) : NaN));
      const ctx = { values: colValues };
      for (let i = 0; i < rows.length; i++) {
        const val = colValues[i];
        const dec = evaluateConditionalFormat(val, rules, ctx);
        if (dec) {
          const rowId = rows[i].id;
          if (!decorations[rowId]) decorations[rowId] = {};
          decorations[rowId][colId] = dec;
        }
      }
    }
  }

  return (
    <DataTable
      columns={columns}
      rows={rows}
      decorations={decorations}
      caption={caption}
      size={size}
      pageSize={pageSize}
      className={className}
    />
  );
}
