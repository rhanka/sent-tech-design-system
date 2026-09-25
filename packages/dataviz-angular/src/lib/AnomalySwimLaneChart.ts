import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AnomalySwimLaneChart as DsAnomalySwimLaneChart, type AnomalySwimLaneSeries } from '@sentropic/design-system-angular';
import { buildAnomalySwimLaneData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type AnomalySwimLaneChartProps = {
  store: DashboardStore;
  viewId: string;
  job: string;
  at: string;
  score: string;
  max?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular AnomalySwimLaneChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-anomaly-swim-lane-chart',
  standalone: true,
  imports: [DsAnomalySwimLaneChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-anomaly-swim-lane-chart
      [data]="data"
      [max]="max"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-anomaly-swim-lane-chart>
  `,
})
export class AnomalySwimLaneChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'AnomalySwimLaneChart';

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
      throw new Error('AnomalySwimLaneChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) job!: string;
  @NgInput({ required: true }) at!: string;
  @NgInput({ required: true }) score!: string;
  @NgInput() max?: number;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: AnomalySwimLaneSeries[] = [];

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
    this.data = buildAnomalySwimLaneData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        job: this.job,
        at: this.at,
        score: this.score,
      },
    );
  }
}
