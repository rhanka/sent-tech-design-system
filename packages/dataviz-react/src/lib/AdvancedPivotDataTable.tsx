import {
  DataTable,
  type DataTableProps,
} from '@sentropic/design-system-react';
import type { AdvancedPivotConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildAdvancedPivotView, type AdvancedPivotTableRowView } from './advancedPivotData.js';

export type AdvancedPivotDataTableProps = {
  store: DashboardStore;
  viewId?: string;
  rows: AdvancedPivotConfig['rows'];
  columns?: AdvancedPivotConfig['columns'];
  measures: AdvancedPivotConfig['measures'];
  includeSubtotals?: AdvancedPivotConfig['includeSubtotals'];
  collapsedRowPaths?: AdvancedPivotConfig['collapsedRowPaths'];
  heatmap?: AdvancedPivotConfig['heatmap'];
  sparklineDimension?: AdvancedPivotConfig['sparklineDimension'];
  onToggleRowPath?: (rowId: string, row: AdvancedPivotTableRowView) => void;
  caption?: DataTableProps['caption'];
  size?: DataTableProps['size'];
  className?: string;
};

export function AdvancedPivotDataTable({
  store,
  viewId,
  rows,
  columns,
  measures,
  includeSubtotals,
  collapsedRowPaths,
  heatmap,
  sparklineDimension,
  onToggleRowPath,
  caption,
  size,
  className,
}: AdvancedPivotDataTableProps) {
  useDashboard(store);
  const table = buildAdvancedPivotView(store.model, store.applyCrossfilter(viewId), {
    rows,
    columns,
    measures,
    includeSubtotals,
    collapsedRowPaths,
    heatmap,
    sparklineDimension,
  });

  return (
    <DataTable<AdvancedPivotTableRowView>
      columns={table.columns}
      rows={table.rows}
      caption={caption}
      size={size}
      className={className}
      onRowClick={
        onToggleRowPath
          ? (row) => {
              if (row.__kind === 'subtotal') onToggleRowPath(row.id, row);
            }
          : undefined
      }
    />
  );
}
