import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TraceWaterfallChart as DsTraceWaterfallChart, type TraceSpan } from '@sentropic/design-system-angular';
import { buildTraceWaterfallData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type TraceWaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  spanId: string;
  parentSpanId: string;
  service: string;
  start: string;
  duration: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular TraceWaterfallChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-trace-waterfall-chart',
  standalone: true,
  imports: [DsTraceWaterfallChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-trace-waterfall-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-trace-waterfall-chart>
  `,
})
export class TraceWaterfallChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'TraceWaterfallChart';

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
      throw new Error('TraceWaterfallChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) spanId!: string;
  @NgInput({ required: true }) parentSpanId!: string;
  @NgInput({ required: true }) service!: string;
  @NgInput({ required: true }) start!: string;
  @NgInput({ required: true }) duration!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data!: { spans: TraceSpan[] };

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
    this.data = buildTraceWaterfallData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        spanId: this.spanId,
        parentSpanId: this.parentSpanId,
        service: this.service,
        start: this.start,
        duration: this.duration,
      },
    );
  }
}
