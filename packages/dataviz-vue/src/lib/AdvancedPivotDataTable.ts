import { defineComponent, h, type PropType } from 'vue';
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

export const AdvancedPivotDataTable = defineComponent({
  name: 'AdvancedPivotDataTable',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    rows: { type: Array as unknown as PropType<AdvancedPivotConfig['rows']>, required: true },
    columns: { type: Array as unknown as PropType<AdvancedPivotConfig['columns']>, default: undefined },
    measures: { type: Array as unknown as PropType<AdvancedPivotConfig['measures']>, required: true },
    includeSubtotals: { type: Boolean, default: undefined },
    collapsedRowPaths: { type: Array as unknown as PropType<AdvancedPivotConfig['collapsedRowPaths']>, default: undefined },
    heatmap: { type: Boolean, default: undefined },
    sparklineDimension: { type: String, default: undefined },
    onToggleRowPath: {
      type: Function as PropType<(rowId: string, row: AdvancedPivotTableRowView) => void>,
      default: undefined,
    },
    caption: { type: String, default: undefined },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const table = buildAdvancedPivotView(props.store.model, props.store.applyCrossfilter(props.viewId), {
        rows: props.rows,
        columns: props.columns,
        measures: props.measures,
        includeSubtotals: props.includeSubtotals,
        collapsedRowPaths: props.collapsedRowPaths,
        heatmap: props.heatmap,
        sparklineDimension: props.sparklineDimension,
      });
      const dataTableProps = {
        columns: table.columns,
        rows: table.rows,
        ...(props.caption !== undefined ? { caption: props.caption } : {}),
        ...(props.size !== undefined ? { size: props.size } : {}),
        ...(props.onToggleRowPath
          ? {
              onRowClick: (row: DataTableRow) => {
                const advancedRow = row as AdvancedPivotTableRowView;
                if (advancedRow.__kind === 'subtotal') props.onToggleRowPath?.(advancedRow.id, advancedRow);
              },
            }
          : {}),
        ...(props.class !== undefined ? { class: props.class } : {}),
      };
      return h(DataTable, dataTableProps);
    };
  },
});
