import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { StepLineChart as DsStepLineChart, type StepLineChartTone } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
  type SimpleCategoricalPoint,
} from './categoricalData.js';

export type StepLineChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: StepLineChartTone;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/** State wiring for a DS Angular StepLineChart over a categorical series. */
@Component({
  selector: 'st-dataviz-step-line-chart',
  standalone: true,
  imports: [DsStepLineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-step-line-chart
      [data]="data"
      [label]="label"
      [tone]="tone"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-step-line-chart>
  `,
})
export class StepLineChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'StepLineChart';

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
      throw new Error('StepLineChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() tone?: StepLineChartTone;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: SimpleCategoricalPoint[] = [];

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
    const series = buildSimpleCategoricalSeries(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      this.category,
      this.measure,
    );
    this.data = toSimpleCategoricalPoints(series);
  }
}
