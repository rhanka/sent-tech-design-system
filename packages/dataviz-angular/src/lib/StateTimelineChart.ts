import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { StateTimelineChart as DsStateTimelineChart, type StateTimelineSeries } from '@sentropic/design-system-angular';
import { buildStateTimelineData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type StateTimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  series: string;
  start: string;
  end: string;
  state: string;
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular StateTimelineChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-state-timeline-chart',
  standalone: true,
  imports: [DsStateTimelineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-state-timeline-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-state-timeline-chart>
  `,
})
export class StateTimelineChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'StateTimelineChart';

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
      throw new Error('StateTimelineChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) series!: string;
  @NgInput({ required: true }) start!: string;
  @NgInput({ required: true }) end!: string;
  @NgInput({ required: true }) state!: string;
  @NgInput() label?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: StateTimelineSeries[] = [];

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
    this.data = buildStateTimelineData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        series: this.series,
        start: this.start,
        end: this.end,
        state: this.state,
      },
    );
  }
}
