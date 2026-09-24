import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  AreaChart as DsAreaChart,
  type AreaChartTone,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-angular';
import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
  type SimpleCategoricalPoint,
} from './categoricalData.js';

export type AreaChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: AreaChartTone;
  smooth?: boolean;
  width?: number;
  height?: number;
  label: string;
  annotations?: ChartAnnotation[];
  dataLabels?: ChartDataLabels;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

/** State wiring for a DS Angular AreaChart over a categorical series. */
@Component({
  selector: 'st-dataviz-area-chart',
  standalone: true,
  imports: [DsAreaChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-area-chart
      [data]="data"
      [label]="label"
      [tone]="tone"
      [smooth]="smooth"
      [width]="width"
      [height]="height"
      [annotations]="annotations"
      [dataLabels]="dataLabels"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [class]="classInput"
    ></st-area-chart>
  `,
})
export class AreaChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'AreaChart';

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
      throw new Error('AreaChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() tone?: AreaChartTone;
  @NgInput() smooth = false;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: ChartDataLabels;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
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
