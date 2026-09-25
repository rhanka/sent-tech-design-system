import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BarChart as DsBarChart, type BarChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-angular';
import { buildErrorBarsModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type ErrorBarsChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  class?: string;
};

/**
 * State wiring for a DS Angular BarChart, with each bar's error extent read from
 * `buildErrorBarsModel`. tools/dataviz-angular-port refuses this shape: the
 * `data` binding maps `model.items` into `BarChartDatum[]` (mean → value,
 * lower/upper → errorLow/errorHigh), which the descriptor cannot express — it
 * only follows a bare member read or a single wrapping call, not a `.map()`.
 */
@Component({
  selector: 'st-dataviz-error-bars-chart',
  standalone: true,
  imports: [DsBarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-bar-chart
      [data]="data"
      [width]="width"
      [height]="height"
      [label]="label"
      [annotations]="annotations"
      [dataLabels]="dataLabels"
      [class]="classValue"
    ></st-bar-chart>
  `,
})
export class ErrorBarsChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ErrorBarsChart';

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
      throw new Error('ErrorBarsChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput() interval?: 'stdev' | 'stderr';
  @NgInput() width = 420;
  @NgInput() height = 240;
  @NgInput({ required: true }) label!: string;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: ChartDataLabels;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: BarChartDatum[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-errorBarsChart';

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
    this.classValue = classNames('st-errorBarsChart', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    const model = buildErrorBarsModel(this.signals.store.model, this.signals.store.applyCrossfilter(this.viewId), {
      category: this.category,
      value: this.value,
      interval: this.interval,
    });
    this.data = model.items.map((item) => ({
      label: item.label,
      value: item.mean,
      errorLow: item.lower,
      errorHigh: item.upper,
    }));
  }
}
