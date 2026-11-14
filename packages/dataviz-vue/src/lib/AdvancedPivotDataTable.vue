<script setup lang="ts">
import { computed } from 'vue';
import { DataTable, type DataTableRow } from '@sentropic/design-system-vue';
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
  caption?: string;
  size?: 'sm' | 'md' | 'lg';
  class?: string;
};

defineOptions({ name: 'AdvancedPivotDataTable' });
const props = withDefaults(defineProps<AdvancedPivotDataTableProps>(), {
  viewId: undefined, columns: undefined, includeSubtotals: undefined, collapsedRowPaths: undefined,
  heatmap: undefined, sparklineDimension: undefined, onToggleRowPath: undefined, caption: undefined,
  size: undefined, class: undefined,
});
const state = useDashboard(props.store);
const table = computed(() => {
  void state.value;
  return buildAdvancedPivotView(props.store.model, props.store.applyCrossfilter(props.viewId), {
    rows: props.rows,
    columns: props.columns,
    measures: props.measures,
    includeSubtotals: props.includeSubtotals,
    collapsedRowPaths: props.collapsedRowPaths,
    heatmap: props.heatmap,
    sparklineDimension: props.sparklineDimension,
  });
});
const onRowClick = computed(() => (props.onToggleRowPath
  ? (row: DataTableRow) => {
      const advancedRow = row as AdvancedPivotTableRowView;
      if (advancedRow.__kind === 'subtotal') props.onToggleRowPath?.(advancedRow.id, advancedRow);
    }
  : undefined));
</script>

<template>
  <DataTable :columns="table.columns" :rows="table.rows" :caption="props.caption" :size="props.size"
    @row-click="onRowClick" :class="props.class" />
</template>
