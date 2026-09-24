import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DumbbellChart as DsDumbbellChart, type DumbbellChartDatum } from '@sentropic/design-system-angular';
import { buildColumnRangeData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type DumbbellChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  low: string;
  high: string;
  lowTone?: string;
  highTone?: string;
  lowLabel?: string;
  highLabel?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular DumbbellChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-dumbbell-chart',
  standalone: true,
  imports: [DsDumbbellChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-dumbbell-chart
      [data]="data"
      [label]="label"
      [lowTone]="lowTone"
      [highTone]="highTone"
      [lowLabel]="lowLabel"
      [highLabel]="highLabel"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-dumbbell-chart>
  `,
})
export class DumbbellChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DumbbellChart';

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
      throw new Error('DumbbellChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) low!: string;
  @NgInput({ required: true }) high!: string;
  @NgInput() lowTone?: string;
  @NgInput() highTone?: string;
  @NgInput() lowLabel?: string;
  @NgInput() highLabel?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: DumbbellChartDatum[] = [];

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
    this.data = buildColumnRangeData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        category: this.category,
        low: this.low,
        high: this.high,
      },
    );
  }
}
