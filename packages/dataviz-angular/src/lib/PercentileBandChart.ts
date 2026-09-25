import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  LineChart as DsLineChart,
  type ChartBand,
  type ChartReferenceLine,
  type LineChartDatum,
} from '@sentropic/design-system-angular';
import { buildPercentileBandModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type PercentileBandChartProps = {
  store: DashboardStore;
  viewId: string;
  value: string;
  lower: number;
  upper: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular LineChart: three fixed points (lower
 * percentile, median, upper percentile) plus a shaded band and a reference
 * line, all read from three different members of `buildPercentileBandModel`'s
 * result. tools/dataviz-angular-port refuses this shape — the `data` array
 * literal reads three separate model members, which is not one of its four
 * supported binding shapes.
 */
@Component({
  selector: 'st-dataviz-percentile-band-chart',
  standalone: true,
  imports: [DsLineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-line-chart
      [data]="data"
      [width]="width"
      [height]="height"
      [label]="label"
      [bands]="bands"
      [referenceLines]="referenceLines"
      [class]="classValue"
    ></st-line-chart>
  `,
})
export class PercentileBandChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'PercentileBandChart';

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
      throw new Error('PercentileBandChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput({ required: true }) lower!: number;
  @NgInput({ required: true }) upper!: number;
  @NgInput() width = 360;
  @NgInput() height = 96;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: LineChartDatum[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  bands: ChartBand[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  referenceLines: ChartReferenceLine[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-percentileBandChart';

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
    this.classValue = classNames('st-percentileBandChart', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    const model = buildPercentileBandModel(this.signals.store.model, this.signals.store.applyCrossfilter(this.viewId), {
      value: this.value,
      lower: this.lower,
      upper: this.upper,
    });
    this.data = [
      { x: `${Math.round(this.lower * 100)}%`, y: model.lowerValue },
      { x: 'median', y: model.median },
      { x: `${Math.round(this.upper * 100)}%`, y: model.upperValue },
    ];
    this.bands = [{ from: model.lowerValue, to: model.upperValue, label: 'Percentiles', tone: 'success' }];
    this.referenceLines = [{ value: model.median, label: 'Median', tone: 'success' }];
  }
}
