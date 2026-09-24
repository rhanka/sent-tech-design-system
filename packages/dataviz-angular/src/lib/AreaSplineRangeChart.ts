import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AreaSplineRangeChart as DsAreaSplineRangeChart, type AreaSplineRangeChartDatum } from '@sentropic/design-system-angular';
import { buildAreaRangeData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type AreaSplineRangeChartProps = {
  store: DashboardStore;
  viewId: string;
  x_field: string;
  low: string;
  high: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular AreaSplineRangeChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-area-spline-range-chart',
  standalone: true,
  imports: [DsAreaSplineRangeChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-area-spline-range-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [tone]="tone"
      [class]="classInput"
    ></st-area-spline-range-chart>
  `,
})
export class AreaSplineRangeChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'AreaSplineRangeChart';

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
      throw new Error('AreaSplineRangeChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x_field!: string;
  @NgInput({ required: true }) low!: string;
  @NgInput({ required: true }) high!: string;
  @NgInput() tone?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: AreaSplineRangeChartDatum[] = [];

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
    this.data = buildAreaRangeData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        x: this.x_field,
        low: this.low,
        high: this.high,
      },
    );
  }
}
