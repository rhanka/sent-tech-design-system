import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { HistogramChart as DsHistogramChart, type HistogramChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore, type HistogramConfig } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildHistogramData } from './distributionData.js';

export type HistogramChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: HistogramConfig['value'];
  bins?: HistogramConfig['bins'];
  domain?: HistogramConfig['domain'];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular HistogramChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-histogram-chart',
  standalone: true,
  imports: [DsHistogramChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-histogram-chart
      [data]="data"
      [bins]="bins"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-histogram-chart>
  `,
})
export class HistogramChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'HistogramChart';

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
      throw new Error('HistogramChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) value!: HistogramConfig['value'];
  @NgInput() bins?: number;
  @NgInput() domain?: HistogramConfig['domain'];
  @NgInput({ required: true }) label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: HistogramChartDatum[] = [];

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
    this.data = buildHistogramData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        value: this.value,
        bins: this.bins,
        domain: this.domain,
      },
    );
  }
}
