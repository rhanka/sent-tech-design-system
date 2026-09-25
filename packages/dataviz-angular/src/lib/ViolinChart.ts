import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ViolinChart as DsViolinChart, type ViolinChartDatum } from '@sentropic/design-system-angular';
import { buildViolinModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ViolinChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension used to split data into groups (one violin per group). */
  groupBy: string;
  /** Field id whose numeric values form the distribution for each group. */
  measure: string;
  /** Number of density bins (optional; DS default is 20). */
  bins?: number;
  /** Whether to overlay median / quartile markers (optional; DS default is true). */
  quartiles?: boolean;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular ViolinChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-violin-chart',
  standalone: true,
  imports: [DsViolinChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-violin-chart
      [data]="model.data"
      [bins]="model.bins"
      [quartiles]="model.quartiles"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-violin-chart>
  `,
})
export class ViolinChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ViolinChart';

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
      throw new Error('ViolinChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) groupBy!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() bins?: number;
  @NgInput() quartiles?: boolean;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  model!: ReturnType<typeof buildViolinModel>;

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
    this.model = buildViolinModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        groupBy: this.groupBy,
        measure: this.measure,
        bins: this.bins,
        quartiles: this.quartiles,
      },
    );
  }
}
