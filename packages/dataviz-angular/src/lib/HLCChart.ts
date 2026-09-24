import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { HLCChart as DsHLCChart, type HLCChartDatum } from '@sentropic/design-system-angular';
import { buildHlcData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type HLCChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular HLCChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-hlc-chart',
  standalone: true,
  imports: [DsHLCChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-hlc-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-hlc-chart>
  `,
})
export class HLCChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'HLCChart';

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
      throw new Error('HLCChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) label_field!: string;
  @NgInput({ required: true }) high!: string;
  @NgInput({ required: true }) low!: string;
  @NgInput({ required: true }) close!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: HLCChartDatum[] = [];

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
    this.data = buildHlcData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        label: this.label_field,
        high: this.high,
        low: this.low,
        close: this.close,
      },
    );
  }
}
