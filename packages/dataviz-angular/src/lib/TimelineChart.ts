import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TimelineChart as DsTimelineChart, type TimelineChartEvent } from '@sentropic/design-system-angular';
import { buildTimelineData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type TimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  position: string;
  description?: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular TimelineChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-timeline-chart',
  standalone: true,
  imports: [DsTimelineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-timeline-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-timeline-chart>
  `,
})
export class TimelineChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'TimelineChart';

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
      throw new Error('TimelineChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) label_field!: string;
  @NgInput({ required: true }) position!: string;
  @NgInput() description?: string;
  @NgInput() tone?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: TimelineChartEvent[] = [];

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
    this.data = buildTimelineData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        label: this.label_field,
        position: this.position,
        description: this.description,
        tone: this.tone,
      },
    );
  }
}
