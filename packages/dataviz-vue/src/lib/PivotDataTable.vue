<script setup lang="ts">
import { computed } from 'vue';
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type CellDecoration,
} from '@sentropic/design-system-vue';
import {
  buildPivotTable,
  evaluateConditionalFormat,
  type DashboardStore,
  type PivotConfig,
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
  caption?: string;
  size?: 'sm' | 'md' | 'lg';
  class?: string;
};

function toColumns(columns: ReturnType<typeof buildPivotTable>['columns']): DataTableColumn[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    sortable: true,
    align: column.kind === 'value' ? 'end' : 'start',
  }));
}

defineOptions({ name: 'PivotDataTable' });
const props = withDefaults(defineProps<PivotDataTableProps>(), {
  viewId: undefined, columns: undefined, conditionalFormat: undefined, caption: undefined, size: undefined, class: undefined,
});
const state = useDashboard(props.store);
const table = computed(() => {
  void state.value;
  let columns: DataTableColumn[] = [];
  let rows: DataTableRow[] = [];
  try {
    const pivot = buildPivotTable(props.store.model, props.store.applyCrossfilter(props.viewId), {
      rows: props.rows,
      columns: props.columns,
      measures: props.measures,
    });
    columns = toColumns(pivot.columns);
    rows = pivot.rows as DataTableRow[];
  } catch {
    columns = [];
    rows = [];
  }
  return { columns, rows };
});
const decorations = computed<Record<string, Record<string, CellDecoration>>>(() => {
  const { rows } = table.value;
  const result: Record<string, Record<string, CellDecoration>> = {};
  if (props.conditionalFormat) {
    for (const colKey of Object.keys(props.conditionalFormat)) {
      const rules = props.conditionalFormat[colKey];
      const colValues = rows.map((r) => (typeof r[colKey] === 'number' ? (r[colKey] as number) : NaN));
      const ctx = { values: colValues };
      for (let i = 0; i < rows.length; i++) {
        const dec = evaluateConditionalFormat(colValues[i], rules, ctx);
        if (dec) {
          const rowId = rows[i].id;
          if (!result[rowId]) result[rowId] = {};
          result[rowId][colKey] = dec;
        }
      }
    }
  }
  return result;
});
</script>

<template>
  <DataTable :columns="table.columns" :rows="table.rows" :decorations="decorations"
    :caption="props.caption" :size="props.size" :class="props.class" />
</template>
