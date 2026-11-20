import {
  DataTable,
  type DataTableProps,
} from '@sentropic/design-system-preact';
import type { AdvancedPivotConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildAdvancedPivotView, type AdvancedPivotTableRowView } from './advancedPivotData.js';

export type AdvancedPivotDataTableProps = {
  store: DashboardStore;
  viewId?: string;
  rows: AdvancedPivotConfig['rows'];
  columns?: AdvancedPivotConfig['columns'];
  measures: AdvancedPivotConfig['measures'];
  includeSubtotals?: MaybeSignal<AdvancedPivotConfig['includeSubtotals']>;
  collapsedRowPaths?: MaybeSignal<AdvancedPivotConfig['collapsedRowPaths']>;
  heatmap?: MaybeSignal<AdvancedPivotConfig['heatmap']>;
  sparklineDimension?: AdvancedPivotConfig['sparklineDimension'];
  onToggleRowPath?: (rowId: string, row: AdvancedPivotTableRowView) => void;
  caption?: DataTableProps['caption'];
  size?: DataTableProps['size'];
  className?: MaybeSignal<string>;
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

  const resolvedIncludeSubtotals = useValue(includeSubtotals);
  const resolvedCollapsedRowPaths = useValue(collapsedRowPaths);
  const resolvedHeatmap = useValue(heatmap);
  const resolvedClassName = useValue(className);

  const table = buildAdvancedPivotView(store.model, store.applyCrossfilter(viewId), {
    rows,
    columns,
    measures,
    includeSubtotals: resolvedIncludeSubtotals,
    collapsedRowPaths: resolvedCollapsedRowPaths,
    heatmap: resolvedHeatmap,
    sparklineDimension,
  });

  return (
    <DataTable<AdvancedPivotTableRowView>
      columns={table.columns}
      rows={table.rows}
      caption={caption}
      size={size}
      className={resolvedClassName}
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
