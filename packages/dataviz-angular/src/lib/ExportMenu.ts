import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import { Button } from '@sentropic/design-system-angular';
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
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` holds no reactive
 * state, so there is no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md). The CSV button itself is free of the
 * `chart-export.ts` DOM-export helper: `rowsToCsv` is a local pure function in
 * all three frameworks, and the dependency runs the other way (`ChartExport`
 * imports it from `ExportMenu`).
 */
@Component({
  selector: 'st-dataviz-export-menu',
  standalone: true,
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-button variant="secondary" [class]="classInput" (click)="exportCsv()">{{ label }}</st-button>
  `,
})
export class ExportMenu implements OnInit, OnChanges {
  static readonly stComponentName = 'ExportMenu';

  private storeValue?: DashboardStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    this.storeValue = value;
  }

  get store(): DashboardStore {
    if (!this.storeValue) {
      throw new Error('ExportMenu: store is required.');
    }
    return this.storeValue;
  }

  @NgInput() viewId?: string;
  @NgInput() fields?: string[];
  @NgInput() filename = 'export.csv';
  @NgInput() label = 'Exporter (CSV)';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  columns: { key: string; label: string }[] = [];

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  exportCsv(): void {
    const csv = rowsToCsv(this.store.applyCrossfilter(this.viewId), this.columns);
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private recompute(): void {
    const store = this.storeValue;
    if (!store) {
      this.columns = [];
      return;
    }
    const ids = this.fields ?? [
      ...store.model.dimensions.map((d) => d.id),
      ...store.model.measures.map((m) => m.id),
    ];
    this.columns = ids.map((id) => {
      const dim = store.model.dimensions.find((d) => d.id === id);
      const meas = findMeasure(store.model, id);
      return { key: id, label: dim?.label ?? meas?.label ?? id };
    });
  }
}
