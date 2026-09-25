import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  DataTable,
  type CellDecoration,
  type DataTableColumn,
  type DataTableRow,
} from '@sentropic/design-system-angular';
import {
  buildPivotTable,
  evaluateConditionalFormat,
  type ConditionalFormat,
  type DashboardStore,
  type PivotConfig,
} from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

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

/**
 * State wiring for a DS Angular DataTable over `buildPivotTable`'s pivoted
 * rows/columns, with FR-6 conditional formatting resolved into the DS
 * `decorations` map. tools/dataviz-angular-port refuses this shape: the pivot
 * build is guarded by a try/catch and the decorations map is built by a nested
 * loop over `evaluateConditionalFormat`, neither of which is a bare member read
 * or a single wrapping call the descriptor follows.
 */
@Component({
  selector: 'st-dataviz-pivot-data-table',
  standalone: true,
  imports: [DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-data-table
      [columns]="tableColumns"
      [rows]="tableRows"
      [decorations]="decorations"
      [caption]="caption"
      [size]="size"
      [class]="classInput"
    ></st-data-table>
  `,
})
export class PivotDataTable implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'PivotDataTable';

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
      throw new Error('PivotDataTable: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) rows!: PivotConfig['rows'];
  @NgInput() columns?: PivotConfig['columns'];
  @NgInput({ required: true }) measures!: PivotConfig['measures'];
  @NgInput() conditionalFormat?: Record<string, ConditionalFormat>;
  @NgInput() caption?: string;
  @NgInput() size?: 'sm' | 'md' | 'lg';
  @NgInput('class') classInput?: string;

  /**
   * The DS DataTable's own `columns`/`rows` inputs — named differently from the
   * `columns`/`rows` pivot-config `@Input`s above, which the DS-facing arrays are
   * built FROM. Vue and React shadow the outer `columns`/`rows` with a `let` of
   * the same name inside `setup()`/the function body; Angular has no block scope
   * for class fields, so the two must be named apart here.
   */
  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
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
    let columns: DataTableColumn[] = [];
    let rows: DataTableRow[] = [];
    try {
      const pivot = buildPivotTable(this.signals.store.model, this.signals.store.applyCrossfilter(this.viewId), {
        rows: this.rows,
        columns: this.columns,
        measures: this.measures,
      });
      columns = toColumns(pivot.columns);
      rows = pivot.rows as DataTableRow[];
    } catch {
      columns = [];
      rows = [];
    }

    const decorations: Record<string, Record<string, CellDecoration>> = {};
    if (this.conditionalFormat) {
      for (const colKey of Object.keys(this.conditionalFormat)) {
        const rules = this.conditionalFormat[colKey];
        const colValues = rows.map((r) => (typeof r[colKey] === 'number' ? (r[colKey] as number) : NaN));
        const ctx = { values: colValues };
        for (let i = 0; i < rows.length; i++) {
          const val = colValues[i];
          const dec = evaluateConditionalFormat(val, rules, ctx);
          if (dec) {
            const rowId = rows[i].id;
            if (!decorations[rowId]) decorations[rowId] = {};
            decorations[rowId][colKey] = dec;
          }
        }
      }
    }

    this.tableColumns = columns;
    this.tableRows = rows;
    this.decorations = decorations;
  }
}
