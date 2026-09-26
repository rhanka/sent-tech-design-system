import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  StackedBarChart as DsStackedBarChart,
  type DataLabelsProp as ChartDataLabels,
  type StackedBarDatum,
} from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeCategoricalSeries, toStackedCategoricalData, type StackedMode } from './categoricalData.js';

export type StackedBarChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  mode?: StackedMode;
  showLegend?: boolean;
  width?: number;
  height?: number;
  label: string;
  dataLabels?: ChartDataLabels;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  class?: string;
};

/**
 * State wiring for a DS Angular StackedBarChart over a categorical series
 * model.
 *
 * tools/dataviz-angular-port refuses this shape: the builder config wraps one
 * prop in an array literal (`measures: [props.measure]`), which the
 * descriptor's strict `key: props.<name>` config rule rejects rather than
 * guess (see tools/dataviz-angular-port/README.md). The derivation is
 * otherwise the recipe PATTERN.md documents, so the adapter is hand-written
 * and its entry deleted from no descriptor — it was never extracted.
 */
@Component({
  selector: 'st-dataviz-stacked-bar-chart',
  standalone: true,
  imports: [DsStackedBarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-stacked-bar-chart
      [data]="data"
      [label]="label"
      [showLegend]="showLegend"
      [width]="width"
      [height]="height"
      [dataLabels]="dataLabels"
      [hiddenSeries]="hiddenSeries"
      [onToggleSeries]="onToggleSeries"
      [class]="classInput"
    ></st-stacked-bar-chart>
  `,
})
export class StackedBarChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'StackedBarChart';

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
      throw new Error('StackedBarChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) series!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() mode: StackedMode = 'stacked';
  @NgInput() showLegend = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput() dataLabels?: ChartDataLabels;
  @NgInput() hiddenSeries?: string[];
  @NgInput() onToggleSeries?: (seriesId: string) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: StackedBarDatum[] = [];

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
    const seriesModel = buildSafeCategoricalSeries(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        category: this.category,
        series: this.series,
        measures: [this.measure],
        mode: this.mode,
      },
    );
    this.data = toStackedCategoricalData(seriesModel) as StackedBarDatum[];
  }
}
