import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { StatusHistoryChart as DsStatusHistoryChart, type StatusHistorySeries } from '@sentropic/design-system-angular';
import { buildStatusHistoryData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type StatusHistoryChartProps = {
  store: DashboardStore;
  viewId: string;
  series: string;
  at: string;
  value: string;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular StatusHistoryChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-status-history-chart',
  standalone: true,
  imports: [DsStatusHistoryChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-status-history-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-status-history-chart>
  `,
})
export class StatusHistoryChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'StatusHistoryChart';

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
      throw new Error('StatusHistoryChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) series!: string;
  @NgInput({ required: true }) at!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: StatusHistorySeries[] = [];

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
    this.data = buildStatusHistoryData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        series: this.series,
        at: this.at,
        value: this.value,
      },
    );
  }
}
