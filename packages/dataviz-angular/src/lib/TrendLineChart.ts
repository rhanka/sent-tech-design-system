import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  LineChart as DsLineChart,
  type DataLabelsProp as ChartDataLabels,
  type LineChartDatum,
} from '@sentropic/design-system-angular';
import { buildTrendLineModel, type ChartAnnotation, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type TrendLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
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

/**
 * State wiring for a DS Angular LineChart drawing the least-squares regression
 * line over two fields (the two endpoint points from
 * `buildTrendLineModel`), with the DS component's own `trend` overlay turned on
 * to emphasise it. tools/dataviz-angular-port refuses this shape: `data` is
 * `model.points.map(...)`, a `.map()` over a derived model member, not a bare
 * member read.
 */
@Component({
  selector: 'st-dataviz-trend-line-chart',
  standalone: true,
  imports: [DsLineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-line-chart
      [data]="data"
      [width]="width"
      [height]="height"
      [label]="label"
      [annotations]="annotations"
      [dataLabels]="dataLabels"
      [trend]="true"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [class]="classValue"
    ></st-line-chart>
  `,
})
export class TrendLineChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'TrendLineChart';

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
      throw new Error('TrendLineChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput() width = 360;
  @NgInput() height = 220;
  @NgInput({ required: true }) label!: string;
  @NgInput() annotations?: ChartAnnotation[];
  @NgInput() dataLabels?: ChartDataLabels;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: LineChartDatum[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-trendLineChart';

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
    this.classValue = classNames('st-trendLineChart', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    const model = buildTrendLineModel(this.signals.store.model, this.signals.store.applyCrossfilter(this.viewId), {
      x: this.x,
      y: this.y,
    });
    this.data = model.points.map((point) => ({ x: point.x, y: point.y }));
  }
}
