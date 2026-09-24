import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GaugeChart as DsGaugeChart } from '@sentropic/design-system-angular';
import { type DashboardStore, type GaugeChartConfig, type GaugeChartFormat, type GaugeChartThreshold } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildGaugeData } from './distributionData.js';

export type GaugeChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: GaugeChartConfig['value'];
  label?: GaugeChartConfig['label'];
  min?: GaugeChartConfig['min'];
  max?: GaugeChartConfig['max'];
  thresholds?: GaugeChartConfig['thresholds'];
  format?: GaugeChartConfig['format'];
  unit?: GaugeChartConfig['unit'];
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular GaugeChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-gauge-chart',
  standalone: true,
  imports: [DsGaugeChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-gauge-chart
      [value]="gauge.displayValue"
      [min]="gauge.min"
      [max]="gauge.max"
      [thresholds]="gauge.thresholds"
      [label]="gauge.label"
      [format]="gauge.format"
      [unit]="gauge.unit"
      [size]="size"
      [thickness]="thickness"
      [startAngle]="startAngle"
      [endAngle]="endAngle"
      [class]="classInput"
    ></st-gauge-chart>
  `,
})
export class GaugeChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'GaugeChart';

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
      throw new Error('GaugeChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) value!: GaugeChartConfig['value'];
  @NgInput() label?: GaugeChartConfig['label'];
  @NgInput() min?: GaugeChartConfig['min'];
  @NgInput() max?: GaugeChartConfig['max'];
  @NgInput() thresholds?: GaugeChartConfig['thresholds'];
  @NgInput() format?: GaugeChartConfig['format'];
  @NgInput() unit?: GaugeChartConfig['unit'];
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput() startAngle?: number;
  @NgInput() endAngle?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  gauge!: ReturnType<typeof buildGaugeData>;

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
    this.gauge = buildGaugeData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        value: this.value,
        label: this.label,
        min: this.min,
        max: this.max,
        thresholds: this.thresholds,
        format: this.format,
        unit: this.unit,
      },
    );
  }
}
