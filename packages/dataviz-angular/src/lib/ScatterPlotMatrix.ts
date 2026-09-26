import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Grid as DsGrid } from '@sentropic/design-system-angular';
import { ScatterPlot as DsScatterPlot, type ScatterPlotDatum } from '@sentropic/design-system-angular';
import { buildScatterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ScatterPlotMatrixProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id in the cross-filter graph. */
  viewId: string;
  /** Ordered list of measure field ids to cross (N×N grid). */
  measures: string[];
  /** Accessible label for the matrix group. */
  label: string;
  /** Size in px of each individual cell. Defaults to 160. */
  cellSize?: number;
  class?: string;
};

/** One matrix cell: measure[col] (x) crossed against measure[row] (y). */
type ScatterCell = {
  row: number;
  col: number;
  data: ScatterPlotDatum[];
  xLabel: string;
  yLabel: string;
  label: string;
};

/**
 * Scatter-plot matrix (SPLOM): an N×N grid of design-system `ScatterPlot`
 * components, each cell (i, j) crossing measure[j] (x) against measure[i] (y).
 *
 * tools/dataviz-angular-port refuses this shape: the render is a loop of
 * several `h()` calls inside a wrapper `div`, not a single trailing `h()`
 * call (`no trailing h() call`; see tools/dataviz-angular-port/README.md).
 * The derivation is otherwise the recipe PATTERN.md documents, so the adapter
 * is hand-written and was never extracted.
 *
 * Layout follows the source's own pointer — "mirrors SmallMultiples" — so the
 * wrapper is the DS `Grid` (`columns` = measure count, `gap` 2 = the
 * contract's `--st-spacing-2`), not a hand-styled `div`: the adapter-pattern
 * guard forbids literal `style` attributes in adapter sources. The fixed
 * per-cell px columns of the Vue/React inline grid have no DS `Grid`
 * equivalent (`repeat(N, minmax(0, 1fr))`), and `role`/`aria-label` ride on
 * the `st-grid` host (real DOM, invisible to the parity flattener, which
 * unwraps `st-*` hosts) — both are measured, not hidden, by the parity run.
 */
@Component({
  selector: 'st-dataviz-scatter-plot-matrix',
  standalone: true,
  imports: [DsGrid, DsScatterPlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-grid [columns]="measures.length" [gap]="2" [class]="classInput" role="group" [attr.aria-label]="label">
      @for (cell of cells; track cell.row + '-' + cell.col) {
        <st-scatter-plot
          [data]="cell.data"
          [xLabel]="cell.xLabel"
          [yLabel]="cell.yLabel"
          [width]="cellSize"
          [height]="cellSize"
          [label]="cell.label"
        ></st-scatter-plot>
      }
    </st-grid>
  `,
})
export class ScatterPlotMatrix implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ScatterPlotMatrix';

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
      throw new Error('ScatterPlotMatrix: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) measures!: string[];
  @NgInput({ required: true }) label!: string;
  @NgInput() cellSize = 160;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  cells: ScatterCell[] = [];

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
    const rows = this.signals.store.applyCrossfilter(this.viewId);
    const cells: ScatterCell[] = [];
    for (let row = 0; row < this.measures.length; row++) {
      for (let col = 0; col < this.measures.length; col++) {
        const m = buildScatterModel(this.signals.store.model, rows, {
          x: this.measures[col]!,
          y: this.measures[row]!,
        });
        cells.push({
          row,
          col,
          data: m.data as ScatterPlotDatum[],
          xLabel: m.xLabel,
          yLabel: m.yLabel,
          label: `${this.label} — ${m.yLabel} × ${m.xLabel}`,
        });
      }
    }
    this.cells = cells;
  }
}
