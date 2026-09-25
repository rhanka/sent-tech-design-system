import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BumpChart as DsBumpChart, type BumpChartSeries } from '@sentropic/design-system-angular';
import { buildBumpModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type BumpChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension whose distinct values form the series (one line each). */
  series: string;
  /** Field id of the ordered dimension whose distinct values form the category axis (x). */
  category: string;
  /** Field id of the numeric measure used to rank series within each category. */
  measure: string;
  /**
   * Ranking direction.
   * - `'desc'` (default): rank 1 = highest measure value.
   * - `'asc'`: rank 1 = lowest measure value.
   */
  direction?: 'asc' | 'desc';
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular BumpChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-bump-chart',
  standalone: true,
  imports: [DsBumpChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-bump-chart
      [data]="bumpModel.series"
      [categories]="bumpModel.categories"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-bump-chart>
  `,
})
export class BumpChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'BumpChart';

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
      throw new Error('BumpChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) series!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() direction?: 'asc' | 'desc';
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  bumpModel!: ReturnType<typeof buildBumpModel>;

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
    this.bumpModel = buildBumpModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        series: this.series,
        category: this.category,
        measure: this.measure,
        direction: this.direction,
      },
    );
  }
}
