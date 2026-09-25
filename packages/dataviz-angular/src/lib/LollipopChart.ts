import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  LollipopChart as DsLollipopChart,
  type LollipopChartDatum,
  type LollipopChartTone,
} from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSimpleCategoricalSeries, toSimpleCategoricalData } from './categoricalData.js';

export type LollipopChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: LollipopChartTone;
  orientation?: 'vertical' | 'horizontal';
  domain?: [number, number];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular LollipopChart over a categorical series. The tone
 * is folded into every datum, which the port generator's descriptor cannot say.
 */
@Component({
  selector: 'st-dataviz-lollipop-chart',
  standalone: true,
  imports: [DsLollipopChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-lollipop-chart
      [data]="data"
      [label]="label"
      [orientation]="orientation"
      [domain]="domain"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-lollipop-chart>
  `,
})
export class LollipopChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'LollipopChart';

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
      throw new Error('LollipopChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() tone?: LollipopChartTone;
  @NgInput() orientation: 'vertical' | 'horizontal' = 'vertical';
  @NgInput() domain?: [number, number];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: LollipopChartDatum[] = [];

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
    const tone = this.tone;
    this.data = toSimpleCategoricalData(series).map((item) => (tone ? { ...item, tone } : item));
  }
}
