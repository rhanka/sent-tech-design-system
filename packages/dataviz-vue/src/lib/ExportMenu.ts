import { defineComponent, h, type PropType } from 'vue';
import { Button } from '@sentropic/design-system-vue';
import { findMeasure, type DashboardStore, type Row } from '@sentropic/dataviz-core';

export type ExportMenuProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** View whose cross-filtered rows are exported (omit for global filters). */
  viewId?: string;
  /** Field ids (and order) to export; defaults to all model fields. */
  fields?: string[];
  /** Downloaded file name. */
  filename?: string;
  /** Button label. */
  label?: string;
  class?: string;
};

function escapeCsv(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Pure: rows + columns → a CSV string (RFC-4180-ish escaping). */
export function rowsToCsv(rows: readonly Row[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => escapeCsv(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => escapeCsv(r[c.key] ?? '')).join(',')).join('\n');
  return body ? `${header}\n${body}` : header;
}

/**
 * Exports the current cross-filtered rows of a view as a downloaded CSV, via a
 * design-system Button. The CSV serialisation is pure and exported for testing.
 */
export const ExportMenu = defineComponent({
  name: 'ExportMenu',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    fields: { type: Array as PropType<string[]>, default: undefined },
    filename: { type: String, default: 'export.csv' },
    label: { type: String, default: 'Exporter (CSV)' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const columns = () => {
      const ids = props.fields ?? [
        ...props.store.model.dimensions.map((d) => d.id),
        ...props.store.model.measures.map((m) => m.id),
      ];
      return ids.map((id) => {
        const dim = props.store.model.dimensions.find((d) => d.id === id);
        const meas = findMeasure(props.store.model, id);
        return { key: id, label: dim?.label ?? meas?.label ?? id };
      });
    };
    const exportCsv = () => {
      const csv = rowsToCsv(props.store.applyCrossfilter(props.viewId), columns());
      if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.filename;
      a.click();
      URL.revokeObjectURL(url);
    };
    return () =>
      h(Button, { variant: 'secondary', class: props.class, onClick: exportCsv }, { default: () => props.label });
  },
});
