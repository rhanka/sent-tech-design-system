import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  ComboChart as DsComboChart,
  type ComboChartBarSeries,
  type ComboChartLineSeries,
  type DataLabelsProp,
} from '@sentropic/design-system-angular';
import type {
  ChartAnnotation,
  CategoricalMeasureInput,
  CategoricalMode,
  DashboardStore,
} from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeCategoricalSeries } from './categoricalData.js';

export type ComboChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measures: CategoricalMeasureInput[];
  series?: string;
  mode?: CategoricalMode;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  hiddenSeries?: string[];
  onToggleSeries?: (seriesId: string) => void;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular ComboChart: one categorical series model split
 * into a bar series array and a line series array by `mark`.
 * tools/dataviz-angular-port refuses this shape — `bars` and `lines` are each a
 * `.filter().map()` over the derived `seriesModel.series`, a local the
 * descriptor cannot express (it follows a bare member read or one wrapping
 * call, not two independent derivations off the same model).
 */
@Component({
  selector: 'st-dataviz-combo-chart',
  standalone: true,
  imports: [DsComboChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-combo-chart
      [categories]="categories"
      [bars]="bars"
      [lines]="lines"
      [leftAxisLabel]="leftAxisLabel"
      [rightAxisLabel]="rightAxisLabel"
      [legend]="legend"
      [hiddenSeries]="hiddenSeries"
      [onToggleSeries]="onToggleSeries"
      [annotations]="annotations"
      [dataLabels]="dataLabels"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [width]="width"
      [height]="height"
      [label]="label"
      [class]="classInput"
    ></st-combo-chart>
  `,
})
export class ComboChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ComboChart';

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
      throw new Error('ComboChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measures!: CategoricalMeasureInput[];
  @NgInput() series?: string;
  @NgInput() mode: CategoricalMode = 'grouped';
  @NgInput() leftAxisLabel?: string;
  @NgInput() rightAxisLabel?: string;
  @NgInput() legend = true;
  @NgInput() hiddenSeries?: string[];
  @NgInput() onToggleSeries?: (seriesId: string) => void;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: DataLabelsProp;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  categories: string[] = [];
  bars: ComboChartBarSeries[] = [];
  lines: ComboChartLineSeries[] = [];

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
        measures: this.measures,
        mode: this.mode,
      },
    );
    this.categories = seriesModel.categories;
    this.bars = seriesModel.series
      .filter((item) => item.mark === 'bar')
      .map((item) => ({ label: item.label, data: item.values }));
    this.lines = seriesModel.series
      .filter((item) => item.mark === 'line')
      .map((item) => ({ label: item.label, data: item.values }));
  }
}
