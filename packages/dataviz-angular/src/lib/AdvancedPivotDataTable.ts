import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  DataTable as DsDataTable,
  type DataTableRow,
  type DataTableSize,
} from '@sentropic/design-system-angular';
import type { AdvancedPivotConfig, DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
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
  size?: DataTableSize;
  class?: string;
};

/**
 * State wiring for a DS Angular DataTable over an advanced pivot view.
 *
 * tools/dataviz-angular-port refuses this shape: the single `h()` call takes
 * a computed props object (`h(DataTable, dataTableProps)`), not an object
 * literal the extractor can read bindings from (`no trailing h() call`; see
 * tools/dataviz-angular-port/README.md). The state wiring is otherwise the
 * recipe PATTERN.md documents, so the adapter is hand-written and was never
 * extracted. The view builder is `./advancedPivotData.js`, a byte-identical
 * copy of the Vue/React helper over the core `buildAdvancedPivotTable` (see
 * PATTERN.md §3).
 *
 * A row click toggles only subtotal rows, like both source frameworks: leaf
 * clicks are ignored.
 */
@Component({
  selector: 'st-dataviz-advanced-pivot-data-table',
  standalone: true,
  imports: [DsDataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-data-table
      [columns]="tableColumns"
      [rows]="tableRows"
      [caption]="caption"
      [size]="size"
      [onRowClick]="rowClickHandler"
      [class]="classInput"
    ></st-data-table>
  `,
})
export class AdvancedPivotDataTable implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'AdvancedPivotDataTable';

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
      throw new Error('AdvancedPivotDataTable: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) rows!: AdvancedPivotConfig['rows'];
  @NgInput() columns?: AdvancedPivotConfig['columns'];
  @NgInput({ required: true }) measures!: AdvancedPivotConfig['measures'];
  @NgInput() includeSubtotals?: AdvancedPivotConfig['includeSubtotals'];
  @NgInput() collapsedRowPaths?: AdvancedPivotConfig['collapsedRowPaths'];
  @NgInput() heatmap?: AdvancedPivotConfig['heatmap'];
  @NgInput() sparklineDimension?: AdvancedPivotConfig['sparklineDimension'];
  @NgInput() onToggleRowPath?: (rowId: string, row: AdvancedPivotTableRowView) => void;
  @NgInput() caption?: string;
  @NgInput() size?: DataTableSize;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  tableColumns: { key: string; label: string; sortable: boolean; align: 'start' | 'end' }[] = [];
  tableRows: AdvancedPivotTableRowView[] = [];
  /**
   * The DS `DataTable` marks every row clickable when `onRowClick` is set, so
   * the handler is only wired when the caller opted into subtotal toggles —
   * like the React adapter, which passes `undefined` otherwise.
   */
  rowClickHandler?: (row: DataTableRow) => void;

  readonly onRowClickHandler = (row: DataTableRow): void => {
    if (!this.onToggleRowPath) return;
    const advancedRow = row as AdvancedPivotTableRowView;
    if (advancedRow.__kind === 'subtotal') this.onToggleRowPath(advancedRow.id, advancedRow);
  };

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
    const table = buildAdvancedPivotView(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        rows: this.rows,
        columns: this.columns,
        measures: this.measures,
        includeSubtotals: this.includeSubtotals,
        collapsedRowPaths: this.collapsedRowPaths,
        heatmap: this.heatmap,
        sparklineDimension: this.sparklineDimension,
      },
    );
    this.tableColumns = table.columns;
    this.tableRows = table.rows;
    this.rowClickHandler = this.onToggleRowPath ? this.onRowClickHandler : undefined;
  }
}
