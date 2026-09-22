<script lang="ts" module>
  import type { DashboardStore, Row } from '@sentropic/dataviz-core';

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
  export function rowsToCsv(
    rows: readonly Row[],
    columns: { key: string; label: string }[],
  ): string {
    const header = columns.map((c) => escapeCsv(c.label)).join(',');
    const body = rows
      .map((r) => columns.map((c) => escapeCsv(r[c.key] ?? '')).join(','))
      .join('\n');
    return body ? `${header}\n${body}` : header;
  }
</script>

<script lang="ts">
  import { Button } from '@sentropic/design-system-svelte';
  import { findMeasure } from '@sentropic/dataviz-core';

  let {
    store,
    viewId,
    fields,
    filename = 'export.csv',
    label = 'Exporter (CSV)',
    class: className,
  }: ExportMenuProps = $props();

  function columns() {
    const ids = fields ?? [
      ...store.model.dimensions.map((d) => d.id),
      ...store.model.measures.map((m) => m.id),
    ];
    return ids.map((id) => {
      const dim = store.model.dimensions.find((d) => d.id === id);
      const meas = findMeasure(store.model, id);
      return { key: id, label: dim?.label ?? meas?.label ?? id };
    });
  }

  function exportCsv() {
    const csv = rowsToCsv(store.applyCrossfilter(viewId), columns());
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<Button variant="secondary" class={className} onclick={exportCsv}>{label}</Button>
