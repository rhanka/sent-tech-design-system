<script setup lang="ts">
import { computed } from 'vue';
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
defineOptions({ name: 'RecordsTable' });
const props = withDefaults(defineProps<RecordsTableProps>(), {
  viewId: undefined, fields: undefined, conditionalFormat: undefined, caption: undefined, size: undefined, pageSize: undefined, class: undefined,
});
const state = useDashboard(props.store);
const table = computed(() => {
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
  return { columns, rows };
});
const decorations = computed<Record<string, Record<string, CellDecoration>>>(() => {
  const { rows } = table.value;
  const result: Record<string, Record<string, CellDecoration>> = {};
  if (props.conditionalFormat) {
    for (const colId of Object.keys(props.conditionalFormat)) {
      const rules = props.conditionalFormat[colId];
      const colValues = rows.map((r) => (typeof r[colId] === 'number' ? (r[colId] as number) : NaN));
      const ctx = { values: colValues };
      for (let i = 0; i < rows.length; i++) {
        const dec = evaluateConditionalFormat(colValues[i], rules, ctx);
        if (dec) {
          const rowId = rows[i].id;
          if (!result[rowId]) result[rowId] = {};
          result[rowId][colId] = dec;
        }
      }
    }
  }
  return result;
});
</script>

<template>
  <DataTable :columns="table.columns" :rows="table.rows" :decorations="decorations"
    :caption="props.caption" :size="props.size" :page-size="props.pageSize" :class="props.class" />
</template>
