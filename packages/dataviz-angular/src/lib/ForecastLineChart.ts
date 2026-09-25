import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { LineChart as DsLineChart, type LineChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildForecastLineData } from './analyticsDsData.js';
import { classNames } from './classNames.js';

export type ForecastLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  periods: number;
  step?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

/**
 * State wiring for a DS Angular LineChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-forecast-line-chart',
  standalone: true,
  imports: [DsLineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-line-chart
      [data]="data"
      [width]="width"
      [height]="height"
      [label]="label"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [class]="classValue"
    ></st-line-chart>
  `,
})
export class ForecastLineChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ForecastLineChart';

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
      throw new Error('ForecastLineChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput({ required: true }) periods!: number;
  @NgInput() step?: number;
  @NgInput() width: number = 360;
  @NgInput() height: number = 220;
  @NgInput({ required: true }) label!: string;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: LineChartDatum[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-forecastLineChart';

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
    this.classValue = classNames('st-forecastLineChart', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    this.data = buildForecastLineData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        x: this.x,
        y: this.y,
        periods: this.periods,
        step: this.step,
      },
    );
  }
}
