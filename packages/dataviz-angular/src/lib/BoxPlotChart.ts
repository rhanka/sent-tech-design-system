import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BoxPlotChart as DsBoxPlotChart, type BoxPlotChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore, type BoxPlotConfig } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildBoxPlotData } from './distributionData.js';

export type BoxPlotChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BoxPlotConfig['value'];
  group?: BoxPlotConfig['group'];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular BoxPlotChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-box-plot-chart',
  standalone: true,
  imports: [DsBoxPlotChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-box-plot-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-box-plot-chart>
  `,
})
export class BoxPlotChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'BoxPlotChart';

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
      throw new Error('BoxPlotChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) value!: BoxPlotConfig['value'];
  @NgInput() group?: BoxPlotConfig['group'];
  @NgInput({ required: true }) label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: BoxPlotChartDatum[] = [];

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
    this.data = buildBoxPlotData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        value: this.value,
        group: this.group,
      },
    );
  }
}
