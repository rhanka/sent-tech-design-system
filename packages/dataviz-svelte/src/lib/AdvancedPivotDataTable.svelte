<script lang="ts" module>
  import type { AdvancedPivotConfig, DashboardStore } from '@sentropic/dataviz-core';

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
    onToggleRowPath?: (rowId: string, row: import('./advancedPivotData.js').AdvancedPivotTableRowView) => void;
    caption?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  };
</script>

<script lang="ts">
  import { DataTable, type DataTableRow } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildAdvancedPivotView, type AdvancedPivotTableRowView } from './advancedPivotData.js';

  let {
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
    class: className,
  }: AdvancedPivotDataTableProps = $props();

  const dash = $derived(useDashboard(store));
  const table = $derived.by(() => {
    void $dash;
    return buildAdvancedPivotView(store.model, store.applyCrossfilter(viewId), {
      rows,
      columns,
      measures,
      includeSubtotals,
      collapsedRowPaths,
      heatmap,
      sparklineDimension,
    });
  });

  function handleRowClick(row: DataTableRow) {
    const advancedRow = row as AdvancedPivotTableRowView;
    if (advancedRow.__kind === 'subtotal') onToggleRowPath?.(advancedRow.id, advancedRow);
  }
</script>

<DataTable
  columns={table.columns}
  rows={table.rows}
  {caption}
  {size}
  onRowClick={onToggleRowPath ? handleRowClick : undefined}
  class={className}
/>
