import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  DataTable,
  type CellDecoration,
  type DataTableColumn,
  type DataTableRow,
} from '@sentropic/design-system-angular';
import {
  evaluateConditionalFormat,
  findMeasure,
  type ConditionalFormat,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

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
@Component({
  selector: 'st-dataviz-records-table',
  standalone: true,
  imports: [DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-data-table
      [columns]="columns"
      [rows]="rows"
      [decorations]="decorations"
      [caption]="caption"
      [size]="size"
      [pageSize]="pageSize"
      [class]="classInput"
    ></st-data-table>
  `,
})
export class RecordsTable implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'RecordsTable';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private signals?: AngularSignalStore;
  private unsubscribe: () => void = () => {};

  @NgInput({ required: true }) set store(value: DashboardStore) {
    if (this.signals) this.signals.replace(value);
    else this.signals = toSignalStore(value);
    this.unsubscribe();
    this.unsubscribe = value.subscribe(() => {
      this.recompute();
      this.changeDetector.markForCheck();
    });
  }

  get store(): DashboardStore {
    if (!this.signals) {
      throw new Error('RecordsTable: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput() fields?: string[];
  @NgInput() conditionalFormat?: Record<string, ConditionalFormat>;
  @NgInput() caption?: string;
  @NgInput() size?: 'sm' | 'md' | 'lg';
  @NgInput() pageSize?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  columns: DataTableColumn[] = [];
  rows: DataTableRow[] = [];
  decorations: Record<string, Record<string, CellDecoration>> = {};

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.signals?.destroy();
  }

  private recompute(): void {
    if (!this.signals) return;
    void this.signals.state();
    const model = this.signals.store.model;
    const ids =
      this.fields ?? [...model.dimensions.map((d) => d.id), ...model.measures.map((m) => m.id)];
    this.columns = ids.map((id) => {
      const dim = model.dimensions.find((d) => d.id === id);
      const meas = findMeasure(model, id);
      return {
        key: id,
        label: dim?.label ?? meas?.label ?? id,
        sortable: true,
        align: meas ? 'end' : 'start',
      };
    });
    const rows: DataTableRow[] = this.signals.store
      .applyCrossfilter(this.viewId)
      .map((row, i) => ({ ...row, id: String(i) }));
    this.rows = rows;

    // Build decorations map if conditionalFormat is provided
    const decorations: Record<string, Record<string, CellDecoration>> = {};
    if (this.conditionalFormat) {
      for (const colId of Object.keys(this.conditionalFormat)) {
        const rules = this.conditionalFormat[colId];
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
    this.decorations = decorations;
  }
}
