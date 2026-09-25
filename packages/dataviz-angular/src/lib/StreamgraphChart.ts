import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { StreamgraphChart as DsStreamgraphChart, type StreamgraphChartDatum } from '@sentropic/design-system-angular';
import { buildStreamgraphData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type StreamgraphChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular StreamgraphChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-streamgraph-chart',
  standalone: true,
  imports: [DsStreamgraphChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-streamgraph-chart
      [data]="data"
      [label]="label"
      [smooth]="smooth"
      [showLegend]="showLegend"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-streamgraph-chart>
  `,
})
export class StreamgraphChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'StreamgraphChart';

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
      throw new Error('StreamgraphChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) series!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() tone?: string;
  @NgInput() smooth?: boolean;
  @NgInput() showLegend?: boolean;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: StreamgraphChartDatum[] = [];

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
    this.data = buildStreamgraphData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        category: this.category,
        label: this.series,
        value: this.measure,
        tone: this.tone,
      },
    );
  }
}
