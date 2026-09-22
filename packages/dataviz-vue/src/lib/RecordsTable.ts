import { defineComponent, h, type PropType } from 'vue';
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type CellDecoration,
} from '@sentropic/design-system-vue';
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
  class?: string;
};

/**
 * The underlying ("show records") rows for a view — the cross-filtered data
 * rendered as a design-system DataTable. Columns come from the data model.
 */
export const RecordsTable = defineComponent({
  name: 'RecordsTable',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    fields: { type: Array as PropType<string[]>, default: undefined },
    conditionalFormat: { type: Object as PropType<Record<string, ConditionalFormat>>, default: undefined },
    caption: { type: String, default: undefined },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined },
    pageSize: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const ids = props.fields ?? [
        ...props.store.model.dimensions.map((d) => d.id),
        ...props.store.model.measures.map((m) => m.id),
      ];
      const columns: DataTableColumn[] = ids.map((id) => {
        const dim = props.store.model.dimensions.find((d) => d.id === id);
        const meas = findMeasure(props.store.model, id);
        return {
          key: id,
          label: dim?.label ?? meas?.label ?? id,
          sortable: true,
          align: meas ? 'end' : 'start',
        };
      });
      const rows: DataTableRow[] = props.store
        .applyCrossfilter(props.viewId)
        .map((row, i) => ({ ...row, id: String(i) }));

      // Build decorations map if conditionalFormat is provided
      const decorations: Record<string, Record<string, CellDecoration>> = {};
      if (props.conditionalFormat) {
        for (const colId of Object.keys(props.conditionalFormat)) {
          const rules = props.conditionalFormat[colId];
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

      return h(DataTable, {
        columns,
        rows,
        decorations,
        caption: props.caption,
        size: props.size,
        pageSize: props.pageSize,
        class: props.class,
      });
    };
  },
});
